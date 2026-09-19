import { CONFIG } from './config.mjs';
import {
  createPinRecord,
  fakeRecoveryCodes,
  hashToken,
  opaqueId,
  randomToken,
  validateNumericPin,
  verifyPin,
} from './crypto.mjs';
import { fail } from './errors.mjs';
import { recordAudit } from './audit.mjs';
import { clearFailures, assertNotLocked, registerFailure } from './rate-limit.mjs';
import { transaction } from './db.mjs';

export class OwnerAuthService {
  constructor({ db, pepper, now = () => Date.now(), config = CONFIG }) {
    this.db = db;
    this.pepper = pepper;
    this.now = now;
    this.config = config;
  }

  createBootstrapTicket(token = randomToken()) {
    const now = this.now();
    const existingOwner = this.db.prepare("SELECT 1 FROM goencho_operators WHERE status = 'active'").get();
    if (existingOwner) fail(409, 'OWNER_ALREADY_EXISTS', 'Owner already exists');
    this.db.prepare(`INSERT INTO goencho_bootstrap_tickets
      (ticket_id, token_hash, status, created_at, expires_at)
      VALUES (?, ?, 'active', ?, ?)`)
      .run(opaqueId('bootstrap'), hashToken(token, this.pepper), now, now + this.config.ticketLifetimeMs);
    return token;
  }

  activate({ ticket, pin }) {
    if (!validateNumericPin(pin, this.config.teacherPinDigits)) {
      fail(400, 'INVALID_PIN_FORMAT', 'PIN format is invalid');
    }
    const now = this.now();
    const ticketHash = hashToken(ticket, this.pepper);
    return transaction(this.db, () => {
      const row = this.db.prepare('SELECT * FROM goencho_bootstrap_tickets WHERE token_hash = ?').get(ticketHash);
      if (!row) fail(401, 'INVALID_BOOTSTRAP_TICKET', 'Invalid ticket');
      if (row.status !== 'active') fail(409, 'BOOTSTRAP_TICKET_NOT_ACTIVE', 'Ticket is not active');
      if (row.expires_at <= now) fail(410, 'BOOTSTRAP_TICKET_EXPIRED', 'Ticket expired');
      if (this.db.prepare("SELECT 1 FROM goencho_operators WHERE status = 'active'").get()) {
        fail(409, 'OWNER_ALREADY_EXISTS', 'Owner already exists');
      }

      const operatorId = opaqueId('owner');
      const pinRecord = createPinRecord(pin, this.pepper);
      const deviceToken = randomToken();
      const deviceId = opaqueId('owner_device');
      const batchId = opaqueId('recovery_batch');
      const recoveryCodes = fakeRecoveryCodes(this.config.recoveryCodeCount);

      this.db.prepare(`INSERT INTO goencho_operators
        (operator_id, role, status, created_at, updated_at) VALUES (?, 'owner', 'active', ?, ?)`)
        .run(operatorId, now, now);
      this.db.prepare(`INSERT INTO goencho_operator_credentials
        (credential_id, operator_id, salt, pin_hash, algorithm, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'active', ?)`)
        .run(opaqueId('owner_credential'), operatorId, pinRecord.salt, pinRecord.hash, pinRecord.algorithm, now);
      this.db.prepare(`INSERT INTO goencho_operator_devices
        (device_authorization_id, operator_id, token_hash, status, created_at, approved_at, last_seen_at)
        VALUES (?, ?, ?, 'approved', ?, ?, ?)`)
        .run(deviceId, operatorId, hashToken(deviceToken, this.pepper), now, now, now);
      const insertCode = this.db.prepare(`INSERT INTO goencho_operator_recovery_codes
        (recovery_code_id, operator_id, batch_id, code_hash, status, created_at)
        VALUES (?, ?, ?, ?, 'active', ?)`);
      for (const code of recoveryCodes) {
        insertCode.run(opaqueId('recovery'), operatorId, batchId, hashToken(code, this.pepper), now);
      }
      this.db.prepare("UPDATE goencho_bootstrap_tickets SET status = 'consumed', consumed_at = ? WHERE ticket_id = ?")
        .run(now, row.ticket_id);
      const session = this.createSession(deviceId, now);
      recordAudit(this.db, {
        actorKind: 'system', action: 'owner.bootstrap.activate', targetKind: 'operator',
        targetId: operatorId, resultCode: 'ok',
      }, now);
      return { operatorId, deviceId, deviceToken, recoveryCodes, ...session };
    });
  }

  resolveDevice(deviceToken) {
    if (!deviceToken) fail(401, 'OWNER_AUTH_REQUIRED', 'Owner auth required');
    const row = this.db.prepare(`SELECT d.*, o.status AS operator_status
      FROM goencho_operator_devices d
      JOIN goencho_operators o ON o.operator_id = d.operator_id
      WHERE d.token_hash = ?`).get(hashToken(deviceToken, this.pepper));
    if (!row || row.status !== 'approved') fail(401, 'OWNER_DEVICE_NOT_APPROVED', 'Owner device not approved');
    if (row.operator_status !== 'active') fail(403, 'OWNER_NOT_ACTIVE', 'Owner not active');
    this.db.prepare('UPDATE goencho_operator_devices SET last_seen_at = ? WHERE device_authorization_id = ?')
      .run(this.now(), row.device_authorization_id);
    return { operatorId: row.operator_id, deviceId: row.device_authorization_id, kind: 'owner' };
  }

  unlock({ deviceToken, pin }) {
    const actor = this.resolveDevice(deviceToken);
    const now = this.now();
    const scopeKey = `owner:${actor.operatorId}`;
    assertNotLocked(this.db, scopeKey, now);
    const credential = this.db.prepare(`SELECT * FROM goencho_operator_credentials
      WHERE operator_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1`).get(actor.operatorId);
    if (!credential || !verifyPin(pin, credential, this.pepper)) {
      registerFailure(this.db, scopeKey, now, this.config);
    }
    clearFailures(this.db, scopeKey);
    return { ...actor, ...this.createSession(actor.deviceId, now) };
  }

  createSession(deviceId, now = this.now()) {
    const sessionId = opaqueId('owner_session');
    const sessionToken = randomToken();
    this.db.prepare(`INSERT INTO goencho_operator_sessions
      (session_id, device_authorization_id, session_hash, status, created_at, last_seen_at)
      VALUES (?, ?, ?, 'active', ?, ?)`) 
      .run(sessionId, deviceId, hashToken(sessionToken, this.pepper), now, now);
    return { sessionId, sessionToken };
  }

  resolveSession(sessionToken) {
    if (!sessionToken) fail(401, 'OWNER_SESSION_REQUIRED', 'Owner session required');
    const now = this.now();
    const row = this.db.prepare(`SELECT s.*, d.operator_id, d.status AS device_status,
      o.status AS operator_status
      FROM goencho_operator_sessions s
      JOIN goencho_operator_devices d ON d.device_authorization_id = s.device_authorization_id
      JOIN goencho_operators o ON o.operator_id = d.operator_id
      WHERE s.session_hash = ?`).get(hashToken(sessionToken, this.pepper));
    if (!row || row.status === 'revoked') fail(401, 'OWNER_SESSION_INVALID', 'Owner session is invalid');
    if (row.device_status !== 'approved') fail(401, 'OWNER_DEVICE_NOT_APPROVED', 'Owner device not approved');
    if (row.operator_status !== 'active') fail(403, 'OWNER_NOT_ACTIVE', 'Owner not active');
    if (row.status === 'locked' || now - row.last_seen_at > this.config.inactivityMs) {
      this.db.prepare(`UPDATE goencho_operator_sessions
        SET status = 'locked', locked_at = COALESCE(locked_at, ?)
        WHERE session_id = ?`).run(now, row.session_id);
      fail(401, 'OWNER_SESSION_LOCKED', 'Owner session is locked');
    }
    this.db.prepare('UPDATE goencho_operator_sessions SET last_seen_at = ? WHERE session_id = ?')
      .run(now, row.session_id);
    this.db.prepare('UPDATE goencho_operator_devices SET last_seen_at = ? WHERE device_authorization_id = ?')
      .run(now, row.device_authorization_id);
    return {
      kind: 'owner',
      operatorId: row.operator_id,
      deviceId: row.device_authorization_id,
      sessionId: row.session_id,
    };
  }

  logout(sessionToken) {
    if (!sessionToken) return { status: 'logged_out' };
    const now = this.now();
    this.db.prepare(`UPDATE goencho_operator_sessions
      SET status = 'revoked', revoked_at = ?
      WHERE session_hash = ? AND status != 'revoked'`)
      .run(now, hashToken(sessionToken, this.pepper));
    return { status: 'logged_out' };
  }

  ownerState({ deviceToken, sessionToken } = {}) {
    const allOwners = this.db.prepare('SELECT operator_id, status FROM goencho_operators').all();
    if (allOwners.length === 0) return { state: 'setup_required' };
    const owners = allOwners.filter((owner) => owner.status === 'active');
    if (owners.length !== 1 || allOwners.length !== 1) return { state: 'unavailable' };
    if (!deviceToken) return { state: 'recovery_required' };

    const device = this.db.prepare(`SELECT device_authorization_id FROM goencho_operator_devices
      WHERE operator_id = ? AND token_hash = ? AND status = 'approved'`)
      .get(owners[0].operator_id, hashToken(deviceToken, this.pepper));
    if (!device) return { state: 'recovery_required' };
    if (!sessionToken) return { state: 'unlock_required' };

    const now = this.now();
    const session = this.db.prepare(`SELECT session_id, status, last_seen_at
      FROM goencho_operator_sessions
      WHERE device_authorization_id = ? AND session_hash = ?`)
      .get(device.device_authorization_id, hashToken(sessionToken, this.pepper));
    if (!session || session.status === 'revoked') return { state: 'unlock_required' };
    if (session.status === 'locked' || now - session.last_seen_at > this.config.inactivityMs) {
      this.db.prepare(`UPDATE goencho_operator_sessions
        SET status = 'locked', locked_at = COALESCE(locked_at, ?)
        WHERE session_id = ?`).run(now, session.session_id);
      return { state: 'unlock_required' };
    }
    this.db.prepare('UPDATE goencho_operator_sessions SET last_seen_at = ? WHERE session_id = ?')
      .run(now, session.session_id);
    this.db.prepare('UPDATE goencho_operator_devices SET last_seen_at = ? WHERE device_authorization_id = ?')
      .run(now, device.device_authorization_id);
    return { state: 'active' };
  }

  createTeacher({ actor, displayName }) {
    if (actor?.kind !== 'owner') fail(403, 'OWNER_REQUIRED', 'Owner required');
    if (typeof displayName !== 'string' || !displayName.trim()) fail(400, 'INVALID_DISPLAY_NAME', 'Display name required');
    const teacherId = opaqueId('teacher');
    const now = this.now();
    this.db.prepare(`INSERT INTO goencho_teachers
      (teacher_id, display_name, status, created_at, updated_at)
      VALUES (?, ?, 'active', ?, ?)`)
      .run(teacherId, displayName.trim(), now, now);
    recordAudit(this.db, {
      actorKind: 'owner', actorId: actor.operatorId, action: 'teacher.create',
      targetKind: 'teacher', targetId: teacherId, resultCode: 'ok',
    }, now);
    return { teacherId };
  }

  createEnrollmentTicket({ actor, teacherId, purpose = 'initial', token = randomToken() }) {
    if (actor?.kind !== 'owner') fail(403, 'OWNER_REQUIRED', 'Owner required');
    const teacher = this.db.prepare('SELECT * FROM goencho_teachers WHERE teacher_id = ?').get(teacherId);
    if (!teacher || teacher.status !== 'active') fail(404, 'TEACHER_NOT_FOUND', 'Teacher not found');
    const now = this.now();
    this.db.prepare(`INSERT INTO goencho_teacher_enrollment_tickets
      (ticket_id, teacher_id, token_hash, purpose, status, created_at, expires_at)
      VALUES (?, ?, ?, ?, 'active', ?, ?)`)
      .run(opaqueId('enrollment'), teacherId, hashToken(token, this.pepper), purpose, now, now + this.config.ticketLifetimeMs);
    return { token, purpose };
  }

  createInitialTeacherEnrollment({ actor, displayName, token = randomToken() }) {
    return transaction(this.db, () => {
      const { teacherId } = this.createTeacher({ actor, displayName });
      const enrollment = this.createEnrollmentTicket({ actor, teacherId, purpose: 'initial', token });
      return { teacherId, ticket: enrollment.token, purpose: enrollment.purpose };
    });
  }

  listDevices({ actor, status }) {
    if (actor?.kind !== 'owner') fail(403, 'OWNER_REQUIRED', 'Owner required');
    if (!['pending', 'approved', 'revoked'].includes(status)) {
      fail(400, 'INVALID_DEVICE_STATUS', 'Invalid device status');
    }
    const rows = this.db.prepare(`SELECT d.device_authorization_id, d.status, d.confirmation_code,
      d.created_at, d.approved_at, d.last_seen_at, d.revoked_at, d.revocation_reason,
      t.display_name
      FROM goencho_teacher_device_authorizations d
      JOIN goencho_teachers t ON t.teacher_id = d.teacher_id
      WHERE d.status = ? ORDER BY d.created_at`).all(status);
    if (status === 'pending') return rows;
    return rows.map(({ confirmation_code: _confirmationCode, ...row }) => row);
  }

  listPending({ actor }) {
    return this.listDevices({ actor, status: 'pending' });
  }

  approveDevice({ actor, authorizationId, confirmationCode }) {
    if (actor?.kind !== 'owner') fail(403, 'OWNER_REQUIRED', 'Owner required');
    const now = this.now();
    return transaction(this.db, () => {
      const device = this.db.prepare('SELECT * FROM goencho_teacher_device_authorizations WHERE device_authorization_id = ?').get(authorizationId);
      if (!device) fail(404, 'DEVICE_NOT_FOUND', 'Device not found');
      if (device.status !== 'pending') fail(409, 'DEVICE_NOT_PENDING', 'Device not pending');
      if (device.confirmation_code !== confirmationCode) fail(409, 'CONFIRMATION_MISMATCH', 'Confirmation mismatch');
      this.db.prepare(`UPDATE goencho_teacher_device_authorizations
        SET status = 'approved', approved_at = ?, approved_by_operator_id = ?
        WHERE device_authorization_id = ?`)
        .run(now, actor.operatorId, authorizationId);
      recordAudit(this.db, {
        actorKind: 'owner', actorId: actor.operatorId, action: 'teacher.device.approve',
        targetKind: 'teacher_device', targetId: authorizationId, resultCode: 'ok',
      }, now);
      return { status: 'approved' };
    });
  }

  revokeDevice({ actor, authorizationId, reason = 'owner_action' }) {
    if (actor?.kind !== 'owner') fail(403, 'OWNER_REQUIRED', 'Owner required');
    const now = this.now();
    const result = this.db.prepare(`UPDATE goencho_teacher_device_authorizations
      SET status = 'revoked', revoked_at = ?, revocation_reason = ?
      WHERE device_authorization_id = ? AND status IN ('pending', 'approved')`)
      .run(now, reason, authorizationId);
    if (!result.changes) fail(409, 'DEVICE_NOT_REVOCABLE', 'Device not revocable');
    this.db.prepare(`UPDATE goencho_teacher_sessions SET status = 'revoked', revoked_at = ?
      WHERE device_authorization_id = ? AND status != 'revoked'`).run(now, authorizationId);
    return { status: 'revoked' };
  }

  revokeAllTeacherDevices({ actor, teacherId, reason = 'pin_reset' }) {
    if (actor?.kind !== 'owner') fail(403, 'OWNER_REQUIRED', 'Owner required');
    const now = this.now();
    return transaction(this.db, () => {
      const deviceIds = this.db.prepare(`SELECT device_authorization_id FROM goencho_teacher_device_authorizations
        WHERE teacher_id = ? AND status IN ('pending', 'approved')`).all(teacherId);
      this.db.prepare(`UPDATE goencho_teacher_device_authorizations
        SET status = 'revoked', revoked_at = ?, revocation_reason = ?
        WHERE teacher_id = ? AND status IN ('pending', 'approved')`).run(now, reason, teacherId);
      const revokeSession = this.db.prepare(`UPDATE goencho_teacher_sessions
        SET status = 'revoked', revoked_at = ?
        WHERE device_authorization_id = ? AND status != 'revoked'`);
      for (const row of deviceIds) revokeSession.run(now, row.device_authorization_id);
      return { revoked: deviceIds.length };
    });
  }

  recover({ recoveryCode, newPin }) {
    if (!validateNumericPin(newPin, this.config.teacherPinDigits)) fail(400, 'INVALID_PIN_FORMAT', 'PIN format is invalid');
    const now = this.now();
    return transaction(this.db, () => {
      const code = this.db.prepare(`SELECT * FROM goencho_operator_recovery_codes
        WHERE code_hash = ?`).get(hashToken(recoveryCode, this.pepper));
      if (!code || code.status !== 'active') fail(401, 'INVALID_RECOVERY_CODE', 'Invalid recovery code');
      const operatorId = code.operator_id;
      this.db.prepare(`UPDATE goencho_operator_recovery_codes SET status = 'revoked', revoked_at = ?
        WHERE operator_id = ? AND batch_id = ? AND status = 'active'`).run(now, operatorId, code.batch_id);
      this.db.prepare(`UPDATE goencho_operator_recovery_codes SET status = 'consumed', consumed_at = ?
        WHERE recovery_code_id = ?`).run(now, code.recovery_code_id);
      this.db.prepare(`UPDATE goencho_operator_devices SET status = 'revoked', revoked_at = ?, revocation_reason = 'recovery'
        WHERE operator_id = ? AND status = 'approved'`).run(now, operatorId);
      this.db.prepare(`UPDATE goencho_operator_sessions SET status = 'revoked', revoked_at = ?
        WHERE device_authorization_id IN (
          SELECT device_authorization_id FROM goencho_operator_devices WHERE operator_id = ?
        ) AND status != 'revoked'`).run(now, operatorId);
      this.db.prepare(`UPDATE goencho_operator_credentials SET status = 'superseded', changed_at = ?
        WHERE operator_id = ? AND status = 'active'`).run(now, operatorId);

      const pinRecord = createPinRecord(newPin, this.pepper);
      this.db.prepare(`INSERT INTO goencho_operator_credentials
        (credential_id, operator_id, salt, pin_hash, algorithm, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'active', ?)`)
        .run(opaqueId('owner_credential'), operatorId, pinRecord.salt, pinRecord.hash, pinRecord.algorithm, now);
      const deviceToken = randomToken();
      const deviceId = opaqueId('owner_device');
      this.db.prepare(`INSERT INTO goencho_operator_devices
        (device_authorization_id, operator_id, token_hash, status, created_at, approved_at, last_seen_at)
        VALUES (?, ?, ?, 'approved', ?, ?, ?)`)
        .run(deviceId, operatorId, hashToken(deviceToken, this.pepper), now, now, now);

      const recoveryCodes = fakeRecoveryCodes(this.config.recoveryCodeCount);
      const batchId = opaqueId('recovery_batch');
      const insertCode = this.db.prepare(`INSERT INTO goencho_operator_recovery_codes
        (recovery_code_id, operator_id, batch_id, code_hash, status, created_at)
        VALUES (?, ?, ?, ?, 'active', ?)`);
      for (const newCode of recoveryCodes) {
        insertCode.run(opaqueId('recovery'), operatorId, batchId, hashToken(newCode, this.pepper), now);
      }
      const session = this.createSession(deviceId, now);
      return { operatorId, deviceId, deviceToken, recoveryCodes, ...session };
    });
  }
}
