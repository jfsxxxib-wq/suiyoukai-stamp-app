import { CONFIG } from './config.mjs';
import {
  confirmationCode,
  createPinRecord,
  hashToken,
  opaqueId,
  randomToken,
  validateNumericPin,
  verifyPin,
} from './crypto.mjs';
import { transaction } from './db.mjs';
import { fail } from './errors.mjs';
import { clearFailures, assertNotLocked, registerFailure } from './rate-limit.mjs';

export class TeacherAuthService {
  constructor({ db, pepper, now = () => Date.now(), config = CONFIG }) {
    this.db = db;
    this.pepper = pepper;
    this.now = now;
    this.config = config;
  }

  claimEnrollment({ ticket }) {
    const now = this.now();
    const row = this.db.prepare(`SELECT * FROM goencho_teacher_enrollment_tickets
      WHERE token_hash = ?`).get(hashToken(ticket, this.pepper));
    if (!row) fail(401, 'INVALID_ENROLLMENT_TICKET', 'Invalid ticket');
    if (row.status !== 'active') fail(409, 'ENROLLMENT_TICKET_NOT_ACTIVE', 'Ticket not active');
    if (row.expires_at <= now) fail(410, 'ENROLLMENT_TICKET_EXPIRED', 'Ticket expired');
    const teacher = this.db.prepare('SELECT display_name, status FROM goencho_teachers WHERE teacher_id = ?')
      .get(row.teacher_id);
    if (!teacher || teacher.status !== 'active') fail(403, 'TEACHER_NOT_ACTIVE', 'Teacher not active');
    const claimToken = randomToken();
    this.db.prepare(`UPDATE goencho_teacher_enrollment_tickets
      SET status = 'claimed', claim_hash = ?, claimed_at = ? WHERE ticket_id = ? AND status = 'active'`)
      .run(hashToken(claimToken, this.pepper), now, row.ticket_id);
    return { claimToken, purpose: row.purpose, displayName: teacher.display_name };
  }

  setPin({ claimToken, pin }) {
    if (!validateNumericPin(pin, this.config.teacherPinDigits)) fail(400, 'INVALID_PIN_FORMAT', 'PIN format is invalid');
    const now = this.now();
    return transaction(this.db, () => {
      const ticket = this.db.prepare(`SELECT * FROM goencho_teacher_enrollment_tickets
        WHERE claim_hash = ?`).get(hashToken(claimToken, this.pepper));
      if (!ticket || ticket.status !== 'claimed') fail(401, 'INVALID_ENROLLMENT_CLAIM', 'Invalid claim');
      if (ticket.expires_at <= now) fail(410, 'ENROLLMENT_TICKET_EXPIRED', 'Ticket expired');
      const teacher = this.db.prepare('SELECT * FROM goencho_teachers WHERE teacher_id = ?').get(ticket.teacher_id);
      if (!teacher || teacher.status !== 'active') fail(403, 'TEACHER_NOT_ACTIVE', 'Teacher not active');

      if (ticket.purpose === 'pin_reset') {
        this.db.prepare(`UPDATE goencho_teacher_credentials SET status = 'superseded', changed_at = ?
          WHERE teacher_id = ? AND status = 'active'`).run(now, ticket.teacher_id);
        const devices = this.db.prepare(`SELECT device_authorization_id FROM goencho_teacher_device_authorizations
          WHERE teacher_id = ? AND status IN ('pending', 'approved')`).all(ticket.teacher_id);
        this.db.prepare(`UPDATE goencho_teacher_device_authorizations
          SET status = 'revoked', revoked_at = ?, revocation_reason = 'pin_reset'
          WHERE teacher_id = ? AND status IN ('pending', 'approved')`).run(now, ticket.teacher_id);
        const revokeSession = this.db.prepare(`UPDATE goencho_teacher_sessions
          SET status = 'revoked', revoked_at = ? WHERE device_authorization_id = ? AND status != 'revoked'`);
        for (const device of devices) revokeSession.run(now, device.device_authorization_id);
      }

      const pinRecord = createPinRecord(pin, this.pepper);
      if (ticket.purpose !== 'new_device') {
        this.db.prepare(`INSERT INTO goencho_teacher_credentials
          (credential_id, teacher_id, salt, pin_hash, algorithm, status, created_at)
          VALUES (?, ?, ?, ?, ?, 'active', ?)`)
          .run(opaqueId('teacher_credential'), ticket.teacher_id, pinRecord.salt, pinRecord.hash, pinRecord.algorithm, now);
      } else {
        const existingCredential = this.db.prepare(`SELECT * FROM goencho_teacher_credentials
          WHERE teacher_id = ? AND status = 'active'`).get(ticket.teacher_id);
        if (!existingCredential) fail(409, 'TEACHER_CREDENTIAL_REQUIRED', 'Teacher credential required');
        if (!verifyPin(pin, existingCredential, this.pepper)) fail(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
      }

      const deviceToken = randomToken();
      const authorizationId = opaqueId('teacher_device');
      const code = confirmationCode();
      this.db.prepare(`INSERT INTO goencho_teacher_device_authorizations
        (device_authorization_id, teacher_id, token_hash, status, confirmation_code, created_at)
        VALUES (?, ?, ?, 'pending', ?, ?)`)
        .run(authorizationId, ticket.teacher_id, hashToken(deviceToken, this.pepper), code, now);
      this.db.prepare(`UPDATE goencho_teacher_enrollment_tickets
        SET status = 'consumed', consumed_at = ? WHERE ticket_id = ?`).run(now, ticket.ticket_id);
      return { authorizationId, teacherId: ticket.teacher_id, deviceToken, confirmationCode: code, status: 'pending' };
    });
  }

  deviceStatus(deviceToken) {
    if (!deviceToken) fail(401, 'TEACHER_DEVICE_REQUIRED', 'Teacher device required');
    const device = this.db.prepare(`SELECT d.*, t.status AS teacher_status, t.display_name
      FROM goencho_teacher_device_authorizations d
      JOIN goencho_teachers t ON t.teacher_id = d.teacher_id
      WHERE d.token_hash = ?`).get(hashToken(deviceToken, this.pepper));
    if (!device) fail(401, 'TEACHER_DEVICE_UNKNOWN', 'Teacher device unknown');
    return {
      authorizationId: device.device_authorization_id,
      teacherId: device.teacher_id,
      status: device.status,
      teacherStatus: device.teacher_status,
      displayName: device.display_name,
      confirmationCode: device.confirmation_code,
    };
  }

  teacherState({ deviceToken, sessionToken }) {
    if (!deviceToken) return { state: 'enrollment_required' };
    const device = this.deviceStatus(deviceToken);
    if (device.teacherStatus !== 'active') fail(403, 'TEACHER_NOT_ACTIVE', 'Teacher not active');
    if (device.status === 'pending') {
      return {
        state: 'pending',
        displayName: device.displayName,
        confirmationCode: device.confirmationCode,
      };
    }
    if (device.status !== 'approved') fail(401, 'TEACHER_DEVICE_UNAVAILABLE', 'Teacher device unavailable');
    if (!sessionToken) {
      return { state: 'unlock_required', displayName: device.displayName, reason: 'session_required' };
    }

    const now = this.now();
    const session = this.db.prepare(`SELECT * FROM goencho_teacher_sessions WHERE session_hash = ?`)
      .get(hashToken(sessionToken, this.pepper));
    if (!session || session.status === 'revoked' || session.device_authorization_id !== device.authorizationId) {
      return { state: 'unlock_required', displayName: device.displayName, reason: 'session_invalid' };
    }
    if (session.status === 'locked') {
      return { state: 'unlock_required', displayName: device.displayName, reason: 'inactivity' };
    }
    if (now - session.last_seen_at > this.config.inactivityMs) {
      this.db.prepare(`UPDATE goencho_teacher_sessions SET status = 'locked', locked_at = ? WHERE session_id = ?`)
        .run(now, session.session_id);
      return { state: 'unlock_required', displayName: device.displayName, reason: 'inactivity' };
    }
    return { state: 'active', displayName: device.displayName };
  }

  unlock({ deviceToken, pin }) {
    const device = this.deviceStatus(deviceToken);
    if (device.status === 'pending') fail(202, 'DEVICE_PENDING', 'Device pending');
    if (device.status !== 'approved') fail(401, 'DEVICE_REVOKED', 'Device revoked');
    if (device.teacherStatus !== 'active') fail(403, 'TEACHER_NOT_ACTIVE', 'Teacher not active');
    const now = this.now();
    const scopeKey = `teacher:${device.teacherId}`;
    assertNotLocked(this.db, scopeKey, now);
    const credential = this.db.prepare(`SELECT * FROM goencho_teacher_credentials
      WHERE teacher_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1`).get(device.teacherId);
    if (!credential || !verifyPin(pin, credential, this.pepper)) {
      registerFailure(this.db, scopeKey, now, this.config);
    }
    clearFailures(this.db, scopeKey);
    return transaction(this.db, () => {
      this.db.prepare(`UPDATE goencho_teacher_sessions SET status = 'revoked', revoked_at = ?
        WHERE device_authorization_id = ? AND status IN ('active', 'locked')`)
        .run(now, device.authorizationId);
      const sessionToken = randomToken();
      this.db.prepare(`INSERT INTO goencho_teacher_sessions
        (session_id, device_authorization_id, session_hash, status, created_at, last_seen_at)
        VALUES (?, ?, ?, 'active', ?, ?)`)
        .run(opaqueId('teacher_session'), device.authorizationId, hashToken(sessionToken, this.pepper), now, now);
      return { sessionToken, teacherId: device.teacherId, authorizationId: device.authorizationId };
    });
  }

  resolveSession(sessionToken) {
    if (!sessionToken) fail(401, 'TEACHER_SESSION_REQUIRED', 'Teacher session required');
    const now = this.now();
    const session = this.db.prepare(`SELECT s.*, d.teacher_id, d.status AS device_status,
      t.status AS teacher_status
      FROM goencho_teacher_sessions s
      JOIN goencho_teacher_device_authorizations d ON d.device_authorization_id = s.device_authorization_id
      JOIN goencho_teachers t ON t.teacher_id = d.teacher_id
      WHERE s.session_hash = ?`).get(hashToken(sessionToken, this.pepper));
    if (!session || session.status === 'revoked') fail(401, 'TEACHER_SESSION_INVALID', 'Session invalid');
    if (session.device_status !== 'approved') fail(401, 'DEVICE_REVOKED', 'Device revoked');
    if (session.teacher_status !== 'active') fail(403, 'TEACHER_NOT_ACTIVE', 'Teacher not active');
    if (session.status === 'locked' || now - session.last_seen_at > this.config.inactivityMs) {
      this.db.prepare(`UPDATE goencho_teacher_sessions SET status = 'locked', locked_at = ? WHERE session_id = ?`)
        .run(now, session.session_id);
      fail(401, 'SESSION_LOCKED', 'Session locked');
    }
    this.db.prepare('UPDATE goencho_teacher_sessions SET last_seen_at = ? WHERE session_id = ?').run(now, session.session_id);
    this.db.prepare('UPDATE goencho_teacher_device_authorizations SET last_seen_at = ? WHERE device_authorization_id = ?')
      .run(now, session.device_authorization_id);
    return {
      kind: 'teacher',
      teacherId: session.teacher_id,
      authorizationId: session.device_authorization_id,
      sessionId: session.session_id,
    };
  }

  resolveDeviceSession({ deviceToken, sessionToken }) {
    const device = this.deviceStatus(deviceToken);
    if (device.status !== 'approved') fail(401, 'TEACHER_DEVICE_UNAVAILABLE', 'Teacher device unavailable');
    if (device.teacherStatus !== 'active') fail(403, 'TEACHER_NOT_ACTIVE', 'Teacher not active');
    const actor = this.resolveSession(sessionToken);
    if (actor.authorizationId !== device.authorizationId || actor.teacherId !== device.teacherId) {
      fail(401, 'TEACHER_SESSION_DEVICE_MISMATCH', 'Teacher session device mismatch');
    }
    return actor;
  }

  logout(sessionToken) {
    if (!sessionToken) return { status: 'logged_out' };
    this.db.prepare(`UPDATE goencho_teacher_sessions SET status = 'revoked', revoked_at = ?
      WHERE session_hash = ? AND status != 'revoked'`).run(this.now(), hashToken(sessionToken, this.pepper));
    return { status: 'logged_out' };
  }
}
