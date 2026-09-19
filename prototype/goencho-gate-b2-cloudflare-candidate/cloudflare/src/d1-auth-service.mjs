import { fail } from '../../lib/errors.mjs';
import { Pbkdf2PinCodec } from './pin-codec.mjs';
import { hmacHex, opaqueId, randomHex, randomToken } from './web-crypto.mjs';

export const D1_AUTH_CONFIG = Object.freeze({
  pinDigits: 6,
  maxPinFailures: 5,
  pinLockMs: 5 * 60 * 1000,
  inactivityMs: 30 * 60 * 1000,
  ticketLifetimeMs: 10 * 60 * 1000,
  recoveryCodeCount: 5,
});

function changes(result) {
  return Number(result?.meta?.changes ?? 0);
}

function rows(result) {
  return Array.isArray(result?.results) ? result.results : [];
}

function requireOwner(actor) {
  if (actor?.kind !== 'owner' || !actor.operatorId) {
    fail(403, 'OWNER_REQUIRED', 'Owner required');
  }
  return actor;
}

function validatePin(pin, digits) {
  if (typeof pin !== 'string' || !new RegExp(`^\\d{${digits}}$`, 'u').test(pin)) {
    fail(400, 'INVALID_PIN_FORMAT', 'PIN format is invalid');
  }
}

function validatePurpose(purpose) {
  if (!['initial', 'new_device', 'pin_reset'].includes(purpose)) {
    fail(400, 'INVALID_ENROLLMENT_PURPOSE', 'Enrollment purpose is invalid');
  }
}

function confirmationCode(hexFactory = randomHex) {
  return String(Number.parseInt(hexFactory(2), 16) % 10_000).padStart(4, '0');
}

function recoveryCodes(count, hexFactory = randomHex) {
  return Array.from({ length: count }, () => `RC-${hexFactory(10).toUpperCase()}`);
}

function credentialBindings(record) {
  return [
    record.salt,
    record.hash,
    record.algorithm,
    record.workFactor,
    record.parametersJson,
    record.pepperKeyVersion,
  ];
}

export class GoenchoD1AuthService {
  constructor({
    db,
    secrets,
    now = () => Date.now(),
    config = D1_AUTH_CONFIG,
    pinCodec,
    idFactory = opaqueId,
    tokenFactory = randomToken,
    hexFactory = randomHex,
  } = {}) {
    if (!db || typeof db.prepare !== 'function' || typeof db.batch !== 'function') {
      throw new TypeError('D1 database binding is required');
    }
    this.db = db;
    this.secrets = secrets ?? {};
    this.now = now;
    this.config = config;
    this.pinCodec = pinCodec ?? new Pbkdf2PinCodec({ digits: config.pinDigits });
    this.idFactory = idFactory;
    this.tokenFactory = tokenFactory;
    this.hexFactory = hexFactory;
  }

  secret(name) {
    const value = this.secrets[name];
    if (typeof value !== 'string' || value.length < 32) {
      fail(503, 'SERVICE_UNAVAILABLE', 'A required secret is unavailable');
    }
    return value;
  }

  ownerPinPepper(version = 'v1') {
    if (version !== 'v1') fail(503, 'SERVICE_UNAVAILABLE', 'Owner PIN key version is unavailable');
    return this.secret('GOENCHO_OWNER_PIN_PEPPER_V1');
  }

  teacherPinPepper(version = 'v1') {
    if (version !== 'v1') fail(503, 'SERVICE_UNAVAILABLE', 'Teacher PIN key version is unavailable');
    return this.secret('GOENCHO_TEACHER_PIN_PEPPER_V1');
  }

  async tokenHash(kind, token) {
    const names = {
      ownerTicket: 'GOENCHO_OWNER_PIN_PEPPER_V1',
      teacherTicket: 'GOENCHO_TEACHER_PIN_PEPPER_V1',
      recovery: 'GOENCHO_RECOVERY_CODE_PEPPER_V1',
      device: 'GOENCHO_DEVICE_TOKEN_HMAC_KEY_V1',
      session: 'GOENCHO_SESSION_HMAC_KEY_V1',
    };
    return hmacHex(this.secret(names[kind]), token);
  }

  async createBootstrapTicket({ token } = {}) {
    token ??= this.tokenFactory();
    const now = this.now();
    const result = await this.db.prepare(`INSERT INTO goencho_bootstrap_tickets
      (ticket_id, token_hash, status, created_at, expires_at)
      SELECT ?, ?, 'active', ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM goencho_operators WHERE status = 'active')`)
      .bind(
        this.idFactory('bootstrap'),
        await this.tokenHash('ownerTicket', token),
        now,
        now + this.config.ticketLifetimeMs,
      ).run();
    if (changes(result) !== 1) fail(409, 'OWNER_ALREADY_EXISTS', 'Owner already exists');
    return { token };
  }

  async activateOwner({ ticket, pin }) {
    validatePin(pin, this.config.pinDigits);
    const now = this.now();
    const mutationId = this.idFactory('mutation');
    const operatorId = this.idFactory('owner');
    const credentialId = this.idFactory('owner_credential');
    const deviceId = this.idFactory('owner_device');
    const sessionId = this.idFactory('owner_session');
    const batchId = this.idFactory('recovery_batch');
    const deviceToken = this.tokenFactory();
    const sessionToken = this.tokenFactory();
    const codes = recoveryCodes(this.config.recoveryCodeCount, this.hexFactory);
    const pinRecord = await this.pinCodec.create(pin, this.ownerPinPepper());
    const ticketHash = await this.tokenHash('ownerTicket', ticket);
    const deviceHash = await this.tokenHash('device', deviceToken);
    const sessionHash = await this.tokenHash('session', sessionToken);
    const codeHashes = await Promise.all(codes.map((code) => this.tokenHash('recovery', code)));
    const guard = `EXISTS (SELECT 1 FROM goencho_bootstrap_tickets
      WHERE token_hash = ? AND last_mutation_id = ?)`;
    const guardBindings = [ticketHash, mutationId];
    const statements = [
      this.db.prepare(`UPDATE goencho_bootstrap_tickets
        SET status = 'consumed', consumed_at = ?, last_mutation_id = ?
        WHERE token_hash = ? AND status = 'active' AND expires_at > ?
          AND NOT EXISTS (SELECT 1 FROM goencho_operators WHERE status = 'active')`)
        .bind(now, mutationId, ticketHash, now),
      this.db.prepare(`INSERT INTO goencho_operators
        (operator_id, role, status, created_at, updated_at)
        SELECT ?, 'owner', 'active', ?, ? WHERE ${guard}`)
        .bind(operatorId, now, now, ...guardBindings),
      this.db.prepare(`INSERT INTO goencho_operator_credentials
        (credential_id, operator_id, salt, pin_hash, algorithm, work_factor,
         parameters_json, pepper_key_version, status, created_at)
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, 'active', ? WHERE ${guard}`)
        .bind(credentialId, operatorId, ...credentialBindings(pinRecord), now, ...guardBindings),
      this.db.prepare(`INSERT INTO goencho_operator_devices
        (device_authorization_id, operator_id, token_hash, status, created_at, approved_at, last_seen_at)
        SELECT ?, ?, ?, 'approved', ?, ?, ? WHERE ${guard}`)
        .bind(deviceId, operatorId, deviceHash, now, now, now, ...guardBindings),
      this.db.prepare(`INSERT INTO goencho_operator_sessions
        (session_id, device_authorization_id, session_hash, status, created_at, last_seen_at)
        SELECT ?, ?, ?, 'active', ?, ? WHERE ${guard}`)
        .bind(sessionId, deviceId, sessionHash, now, now, ...guardBindings),
      ...codes.map((code, index) => this.db.prepare(`INSERT INTO goencho_operator_recovery_codes
        (recovery_code_id, operator_id, batch_id, code_hash, status, created_at)
        SELECT ?, ?, ?, ?, 'active', ? WHERE ${guard}`)
        .bind(this.idFactory('recovery'), operatorId, batchId, codeHashes[index], now, ...guardBindings)),
      this.db.prepare(`INSERT INTO goencho_audit_events
        (audit_id, actor_kind, actor_id, action, target_kind, target_id, result_code, request_id, created_at)
        SELECT ?, 'system', NULL, 'owner.bootstrap.activate', 'operator', ?, 'ok', ?, ? WHERE ${guard}`)
        .bind(this.idFactory('audit'), operatorId, mutationId, now, ...guardBindings),
    ];
    const results = await this.db.batch(statements);
    if (changes(results[0]) !== 1) fail(409, 'BOOTSTRAP_TICKET_NOT_ACTIVE', 'Ticket is not active');
    return { operatorId, deviceId, deviceToken, sessionId, sessionToken, recoveryCodes: codes };
  }

  async ownerDevice(deviceToken) {
    if (!deviceToken) fail(401, 'OWNER_AUTH_REQUIRED', 'Owner auth required');
    const tokenHash = await this.tokenHash('device', deviceToken);
    const row = await this.db.prepare(`SELECT d.device_authorization_id, d.operator_id,
        d.status AS device_status, o.status AS operator_status
      FROM goencho_operator_devices d
      JOIN goencho_operators o ON o.operator_id = d.operator_id
      WHERE d.token_hash = ?`).bind(tokenHash).first();
    if (!row || row.device_status !== 'approved') fail(401, 'OWNER_DEVICE_NOT_APPROVED', 'Owner device not approved');
    if (row.operator_status !== 'active') fail(403, 'OWNER_NOT_ACTIVE', 'Owner not active');
    return row;
  }

  async resolveOwnerActor(sessionToken) {
    if (!sessionToken) fail(401, 'OWNER_SESSION_REQUIRED', 'Owner session required');
    const now = this.now();
    const sessionHash = await this.tokenHash('session', sessionToken);
    const row = await this.db.prepare(`SELECT s.session_id, s.device_authorization_id,
        s.status AS session_status, s.last_seen_at, d.operator_id,
        d.status AS device_status, o.status AS operator_status
      FROM goencho_operator_sessions s
      JOIN goencho_operator_devices d ON d.device_authorization_id = s.device_authorization_id
      JOIN goencho_operators o ON o.operator_id = d.operator_id
      WHERE s.session_hash = ?`).bind(sessionHash).first();
    if (!row || row.session_status === 'revoked') fail(401, 'OWNER_SESSION_INVALID', 'Owner session is invalid');
    if (row.device_status !== 'approved') fail(401, 'OWNER_DEVICE_NOT_APPROVED', 'Owner device not approved');
    if (row.operator_status !== 'active') fail(403, 'OWNER_NOT_ACTIVE', 'Owner not active');
    if (row.session_status === 'locked' || now - Number(row.last_seen_at) > this.config.inactivityMs) {
      await this.db.prepare(`UPDATE goencho_operator_sessions
        SET status = 'locked', locked_at = COALESCE(locked_at, ?)
        WHERE session_id = ?`).bind(now, row.session_id).run();
      fail(401, 'OWNER_SESSION_LOCKED', 'Owner session is locked');
    }
    await this.db.batch([
      this.db.prepare('UPDATE goencho_operator_sessions SET last_seen_at = ? WHERE session_id = ?')
        .bind(now, row.session_id),
      this.db.prepare('UPDATE goencho_operator_devices SET last_seen_at = ? WHERE device_authorization_id = ?')
        .bind(now, row.device_authorization_id),
    ]);
    return {
      kind: 'owner',
      operatorId: row.operator_id,
      deviceId: row.device_authorization_id,
      sessionId: row.session_id,
    };
  }

  async logoutOwner(sessionToken) {
    if (!sessionToken) return { status: 'logged_out', revoked: 0 };
    const result = await this.db.prepare(`UPDATE goencho_operator_sessions
      SET status = 'revoked', revoked_at = ?
      WHERE session_hash = ? AND status != 'revoked'`)
      .bind(this.now(), await this.tokenHash('session', sessionToken)).run();
    return { status: 'logged_out', revoked: changes(result) };
  }

  async ownerState({ deviceToken, sessionToken } = {}) {
    const allOwners = rows(await this.db.prepare(
      'SELECT operator_id, status FROM goencho_operators ORDER BY operator_id',
    ).all());
    if (allOwners.length === 0) return { state: 'setup_required' };
    const activeOwners = allOwners.filter((owner) => owner.status === 'active');
    if (allOwners.length !== 1 || activeOwners.length !== 1) return { state: 'unavailable' };
    if (!deviceToken) return { state: 'recovery_required' };
    const deviceHash = await this.tokenHash('device', deviceToken);
    const device = await this.db.prepare(`SELECT device_authorization_id
      FROM goencho_operator_devices
      WHERE operator_id = ? AND token_hash = ? AND status = 'approved'`)
      .bind(activeOwners[0].operator_id, deviceHash).first();
    if (!device) return { state: 'recovery_required' };
    if (!sessionToken) return { state: 'unlock_required' };
    const sessionHash = await this.tokenHash('session', sessionToken);
    const session = await this.db.prepare(`SELECT session_id, status, last_seen_at
      FROM goencho_operator_sessions
      WHERE device_authorization_id = ? AND session_hash = ?`)
      .bind(device.device_authorization_id, sessionHash).first();
    if (!session || session.status === 'revoked') return { state: 'unlock_required' };
    const now = this.now();
    if (session.status === 'locked' || now - Number(session.last_seen_at) > this.config.inactivityMs) {
      await this.db.prepare(`UPDATE goencho_operator_sessions
        SET status = 'locked', locked_at = COALESCE(locked_at, ?)
        WHERE session_id = ?`).bind(now, session.session_id).run();
      return { state: 'unlock_required' };
    }
    await this.db.batch([
      this.db.prepare('UPDATE goencho_operator_sessions SET last_seen_at = ? WHERE session_id = ?')
        .bind(now, session.session_id),
      this.db.prepare('UPDATE goencho_operator_devices SET last_seen_at = ? WHERE device_authorization_id = ?')
        .bind(now, device.device_authorization_id),
    ]);
    return { state: 'active' };
  }

  async teacherDevice(deviceToken) {
    if (!deviceToken) fail(401, 'TEACHER_DEVICE_REQUIRED', 'Teacher device required');
    const tokenHash = await this.tokenHash('device', deviceToken);
    const row = await this.db.prepare(`SELECT d.device_authorization_id, d.teacher_id,
        d.status AS device_status, t.status AS teacher_status
      FROM goencho_teacher_device_authorizations d
      JOIN goencho_teachers t ON t.teacher_id = d.teacher_id
      WHERE d.token_hash = ?`).bind(tokenHash).first();
    if (!row) fail(401, 'TEACHER_DEVICE_UNKNOWN', 'Teacher device unknown');
    if (row.teacher_status !== 'active') fail(403, 'TEACHER_NOT_ACTIVE', 'Teacher not active');
    return row;
  }

  async teacherDeviceStatus(deviceToken) {
    if (!deviceToken) fail(401, 'TEACHER_DEVICE_REQUIRED', 'Teacher device required');
    const tokenHash = await this.tokenHash('device', deviceToken);
    const row = await this.db.prepare(`SELECT d.device_authorization_id, d.teacher_id,
        d.status AS device_status, d.confirmation_code, t.status AS teacher_status,
        t.display_name
      FROM goencho_teacher_device_authorizations d
      JOIN goencho_teachers t ON t.teacher_id = d.teacher_id
      WHERE d.token_hash = ?`).bind(tokenHash).first();
    if (!row) fail(401, 'TEACHER_DEVICE_UNKNOWN', 'Teacher device unknown');
    return row;
  }

  async teacherState({ deviceToken, sessionToken } = {}) {
    if (!deviceToken) return { state: 'enrollment_required' };
    let device;
    try {
      device = await this.teacherDeviceStatus(deviceToken);
    } catch (error) {
      if (error?.code === 'TEACHER_DEVICE_UNKNOWN') return { state: 'teacher_unavailable' };
      throw error;
    }
    if (device.teacher_status !== 'active') return { state: 'teacher_unavailable' };
    if (device.device_status === 'pending') {
      return {
        state: 'pending',
        displayName: device.display_name,
        confirmationCode: device.confirmation_code,
      };
    }
    if (device.device_status !== 'approved') return { state: 'teacher_unavailable' };
    if (!sessionToken) {
      return { state: 'unlock_required', displayName: device.display_name, reason: 'session_required' };
    }
    const sessionHash = await this.tokenHash('session', sessionToken);
    const session = await this.db.prepare(`SELECT session_id, device_authorization_id, status, last_seen_at
      FROM goencho_teacher_sessions WHERE session_hash = ?`).bind(sessionHash).first();
    if (!session || session.status === 'revoked'
      || session.device_authorization_id !== device.device_authorization_id) {
      return { state: 'unlock_required', displayName: device.display_name, reason: 'session_invalid' };
    }
    const now = this.now();
    if (session.status === 'locked' || now - Number(session.last_seen_at) > this.config.inactivityMs) {
      await this.db.prepare(`UPDATE goencho_teacher_sessions
        SET status = 'locked', locked_at = COALESCE(locked_at, ?)
        WHERE session_id = ?`).bind(now, session.session_id).run();
      return { state: 'unlock_required', displayName: device.display_name, reason: 'inactivity' };
    }
    return { state: 'active', displayName: device.display_name };
  }

  async listTeacherDevices({ actor, status }) {
    requireOwner(actor);
    if (!['pending', 'approved', 'revoked'].includes(status)) {
      fail(400, 'INVALID_DEVICE_STATUS', 'Invalid device status');
    }
    const result = await this.db.prepare(`SELECT d.device_authorization_id, d.status,
        d.confirmation_code, d.created_at, d.approved_at, d.last_seen_at,
        d.revoked_at, d.revocation_reason, t.display_name
      FROM goencho_teacher_device_authorizations d
      JOIN goencho_teachers t ON t.teacher_id = d.teacher_id
      WHERE d.status = ? ORDER BY d.created_at`).bind(status).all();
    const devices = rows(result);
    if (status === 'pending') return devices;
    return devices.map(({ confirmation_code: _confirmationCode, ...device }) => device);
  }

  async assertNotLocked(scopeKey, now) {
    const row = await this.db.prepare(`SELECT locked_until FROM goencho_auth_attempts
      WHERE scope_key = ?`).bind(scopeKey).first();
    if (Number(row?.locked_until ?? 0) > now) {
      fail(429, 'AUTH_TEMPORARILY_LOCKED', 'Authentication is temporarily locked');
    }
  }

  async registerFailure(scopeKey, now) {
    const lockUntil = now + this.config.pinLockMs;
    const row = await this.db.prepare(`INSERT INTO goencho_auth_attempts
      (scope_key, failure_count, locked_until, updated_at)
      VALUES (?, 1, CASE WHEN 1 >= ? THEN ? ELSE NULL END, ?)
      ON CONFLICT(scope_key) DO UPDATE SET
        failure_count = CASE
          WHEN goencho_auth_attempts.locked_until > ? THEN goencho_auth_attempts.failure_count
          WHEN goencho_auth_attempts.locked_until IS NOT NULL THEN 1
          ELSE goencho_auth_attempts.failure_count + 1
        END,
        locked_until = CASE
          WHEN goencho_auth_attempts.locked_until > ? THEN goencho_auth_attempts.locked_until
          WHEN goencho_auth_attempts.locked_until IS NOT NULL
            THEN CASE WHEN 1 >= ? THEN ? ELSE NULL END
          WHEN goencho_auth_attempts.failure_count + 1 >= ? THEN ?
          ELSE NULL
        END,
        updated_at = excluded.updated_at
      RETURNING failure_count, locked_until`)
      .bind(
        scopeKey, this.config.maxPinFailures, lockUntil, now,
        now, now, this.config.maxPinFailures, lockUntil,
        this.config.maxPinFailures, lockUntil,
      ).first();
    if (Number(row?.locked_until ?? 0) > now) {
      fail(429, 'AUTH_TEMPORARILY_LOCKED', 'Authentication is temporarily locked');
    }
    fail(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
  }

  async activeOwnerCredential(operatorId) {
    return this.db.prepare(`SELECT * FROM goencho_operator_credentials
      WHERE operator_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1`)
      .bind(operatorId).first();
  }

  async activeTeacherCredential(teacherId) {
    return this.db.prepare(`SELECT * FROM goencho_teacher_credentials
      WHERE teacher_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1`)
      .bind(teacherId).first();
  }

  async unlockOwner({ deviceToken, pin }) {
    validatePin(pin, this.config.pinDigits);
    const device = await this.ownerDevice(deviceToken);
    const now = this.now();
    const scopeKey = `owner:${device.operator_id}`;
    await this.assertNotLocked(scopeKey, now);
    const credential = await this.activeOwnerCredential(device.operator_id);
    const valid = credential && await this.pinCodec.verify(
      pin,
      credential,
      (version) => this.ownerPinPepper(version),
    );
    if (!valid) return this.registerFailure(scopeKey, now);
    const sessionId = this.idFactory('owner_session');
    const sessionToken = this.tokenFactory();
    const sessionHash = await this.tokenHash('session', sessionToken);
    const results = await this.db.batch([
      this.db.prepare(`UPDATE goencho_operator_sessions SET status = 'revoked', revoked_at = ?
        WHERE device_authorization_id = ? AND status IN ('active', 'locked')
          AND EXISTS (SELECT 1 FROM goencho_operator_devices
            WHERE device_authorization_id = ? AND status = 'approved')`)
        .bind(now, device.device_authorization_id, device.device_authorization_id),
      this.db.prepare(`DELETE FROM goencho_auth_attempts WHERE scope_key = ?
        AND EXISTS (SELECT 1 FROM goencho_operator_devices
          WHERE device_authorization_id = ? AND status = 'approved')`)
        .bind(scopeKey, device.device_authorization_id),
      this.db.prepare(`INSERT INTO goencho_operator_sessions
        (session_id, device_authorization_id, session_hash, status, created_at, last_seen_at)
        SELECT ?, d.device_authorization_id, ?, 'active', ?, ?
        FROM goencho_operator_devices d JOIN goencho_operators o ON o.operator_id = d.operator_id
        WHERE d.device_authorization_id = ? AND d.status = 'approved' AND o.status = 'active'`)
        .bind(sessionId, sessionHash, now, now, device.device_authorization_id),
    ]);
    if (changes(results[2]) !== 1) fail(401, 'OWNER_DEVICE_NOT_APPROVED', 'Owner device not approved');
    return { operatorId: device.operator_id, sessionId, sessionToken };
  }

  async recoverOwner({ recoveryCode, newPin }) {
    validatePin(newPin, this.config.pinDigits);
    const now = this.now();
    const codeHash = await this.tokenHash('recovery', recoveryCode);
    const existing = await this.db.prepare(`SELECT recovery_code_id, operator_id, batch_id
      FROM goencho_operator_recovery_codes WHERE code_hash = ? AND status = 'active'`)
      .bind(codeHash).first();
    if (!existing) fail(401, 'INVALID_RECOVERY_CODE', 'Invalid recovery code');
    const mutationId = this.idFactory('mutation');
    const credentialId = this.idFactory('owner_credential');
    const deviceId = this.idFactory('owner_device');
    const sessionId = this.idFactory('owner_session');
    const deviceToken = this.tokenFactory();
    const sessionToken = this.tokenFactory();
    const newCodes = recoveryCodes(this.config.recoveryCodeCount, this.hexFactory);
    const newBatchId = this.idFactory('recovery_batch');
    const pinRecord = await this.pinCodec.create(newPin, this.ownerPinPepper());
    const deviceHash = await this.tokenHash('device', deviceToken);
    const sessionHash = await this.tokenHash('session', sessionToken);
    const newCodeHashes = await Promise.all(newCodes.map((code) => this.tokenHash('recovery', code)));
    const guard = `EXISTS (SELECT 1 FROM goencho_operator_recovery_codes
      WHERE recovery_code_id = ? AND last_mutation_id = ?)`;
    const guardBindings = [existing.recovery_code_id, mutationId];
    const statements = [
      this.db.prepare(`UPDATE goencho_operator_recovery_codes
        SET status = 'consumed', consumed_at = ?, last_mutation_id = ?
        WHERE recovery_code_id = ? AND status = 'active'`)
        .bind(now, mutationId, existing.recovery_code_id),
      this.db.prepare(`UPDATE goencho_operator_recovery_codes SET status = 'revoked', revoked_at = ?
        WHERE operator_id = ? AND batch_id = ? AND status = 'active' AND ${guard}`)
        .bind(now, existing.operator_id, existing.batch_id, ...guardBindings),
      this.db.prepare(`UPDATE goencho_operator_sessions SET status = 'revoked', revoked_at = ?
        WHERE device_authorization_id IN (
          SELECT device_authorization_id FROM goencho_operator_devices WHERE operator_id = ?
        ) AND status != 'revoked' AND ${guard}`)
        .bind(now, existing.operator_id, ...guardBindings),
      this.db.prepare(`UPDATE goencho_operator_devices
        SET status = 'revoked', revoked_at = ?, revocation_reason = 'recovery'
        WHERE operator_id = ? AND status = 'approved' AND ${guard}`)
        .bind(now, existing.operator_id, ...guardBindings),
      this.db.prepare(`UPDATE goencho_operator_credentials SET status = 'superseded', changed_at = ?
        WHERE operator_id = ? AND status = 'active' AND ${guard}`)
        .bind(now, existing.operator_id, ...guardBindings),
      this.db.prepare(`INSERT INTO goencho_operator_credentials
        (credential_id, operator_id, salt, pin_hash, algorithm, work_factor,
         parameters_json, pepper_key_version, status, created_at)
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, 'active', ? WHERE ${guard}`)
        .bind(credentialId, existing.operator_id, ...credentialBindings(pinRecord), now, ...guardBindings),
      this.db.prepare(`INSERT INTO goencho_operator_devices
        (device_authorization_id, operator_id, token_hash, status, created_at, approved_at, last_seen_at)
        SELECT ?, ?, ?, 'approved', ?, ?, ? WHERE ${guard}`)
        .bind(deviceId, existing.operator_id, deviceHash, now, now, now, ...guardBindings),
      this.db.prepare(`INSERT INTO goencho_operator_sessions
        (session_id, device_authorization_id, session_hash, status, created_at, last_seen_at)
        SELECT ?, ?, ?, 'active', ?, ? WHERE ${guard}`)
        .bind(sessionId, deviceId, sessionHash, now, now, ...guardBindings),
      ...newCodes.map((code, index) => this.db.prepare(`INSERT INTO goencho_operator_recovery_codes
        (recovery_code_id, operator_id, batch_id, code_hash, status, created_at)
        SELECT ?, ?, ?, ?, 'active', ? WHERE ${guard}`)
        .bind(this.idFactory('recovery'), existing.operator_id, newBatchId, newCodeHashes[index], now, ...guardBindings)),
    ];
    const results = await this.db.batch(statements);
    if (changes(results[0]) !== 1) fail(401, 'INVALID_RECOVERY_CODE', 'Invalid recovery code');
    return {
      operatorId: existing.operator_id,
      deviceId,
      deviceToken,
      sessionId,
      sessionToken,
      recoveryCodes: newCodes,
    };
  }

  async createInitialTeacherEnrollment({ actor, displayName, token }) {
    requireOwner(actor);
    const name = typeof displayName === 'string' ? displayName.trim() : '';
    if (!name) fail(400, 'INVALID_DISPLAY_NAME', 'Display name is required');
    token ??= this.tokenFactory();
    const now = this.now();
    const teacherId = this.idFactory('teacher');
    const ticketId = this.idFactory('enrollment');
    const tokenHash = await this.tokenHash('teacherTicket', token);
    await this.db.batch([
      this.db.prepare(`INSERT INTO goencho_teachers
        (teacher_id, display_name, status, created_at, updated_at)
        VALUES (?, ?, 'active', ?, ?)`).bind(teacherId, name, now, now),
      this.db.prepare(`INSERT INTO goencho_teacher_enrollment_tickets
        (ticket_id, teacher_id, token_hash, purpose, status, created_at, expires_at)
        VALUES (?, ?, ?, 'initial', 'active', ?, ?)`)
        .bind(ticketId, teacherId, tokenHash, now, now + this.config.ticketLifetimeMs),
      this.db.prepare(`INSERT INTO goencho_audit_events
        (audit_id, actor_kind, actor_id, action, target_kind, target_id, result_code, request_id, created_at)
        VALUES (?, 'owner', ?, 'teacher.create', 'teacher', ?, 'ok', ?, ?)`)
        .bind(this.idFactory('audit'), actor.operatorId, teacherId, this.idFactory('request'), now),
    ]);
    return { teacherId, token, purpose: 'initial' };
  }

  async createTeacherEnrollment({ actor, teacherId, purpose, token }) {
    requireOwner(actor);
    validatePurpose(purpose);
    token ??= this.tokenFactory();
    const now = this.now();
    const result = await this.db.prepare(`INSERT INTO goencho_teacher_enrollment_tickets
      (ticket_id, teacher_id, token_hash, purpose, status, created_at, expires_at)
      SELECT ?, teacher_id, ?, ?, 'active', ?, ? FROM goencho_teachers
      WHERE teacher_id = ? AND status = 'active'`)
      .bind(
        this.idFactory('enrollment'),
        await this.tokenHash('teacherTicket', token),
        purpose,
        now,
        now + this.config.ticketLifetimeMs,
        teacherId,
      ).run();
    if (changes(result) !== 1) fail(404, 'TEACHER_NOT_FOUND', 'Teacher not found');
    return { teacherId, token, purpose };
  }

  async claimEnrollment({ ticket }) {
    const now = this.now();
    const tokenHash = await this.tokenHash('teacherTicket', ticket);
    const claimToken = this.tokenFactory();
    const claimHash = await this.tokenHash('teacherTicket', claimToken);
    const mutationId = this.idFactory('mutation');
    const result = await this.db.prepare(`UPDATE goencho_teacher_enrollment_tickets
      SET status = 'claimed', claim_hash = ?, claimed_at = ?, last_mutation_id = ?
      WHERE token_hash = ? AND status = 'active' AND expires_at > ?
        AND EXISTS (SELECT 1 FROM goencho_teachers
          WHERE teacher_id = goencho_teacher_enrollment_tickets.teacher_id AND status = 'active')`)
      .bind(claimHash, now, mutationId, tokenHash, now).run();
    if (changes(result) !== 1) fail(409, 'ENROLLMENT_TICKET_NOT_ACTIVE', 'Ticket is not active');
    const row = await this.db.prepare(`SELECT e.purpose, t.display_name
      FROM goencho_teacher_enrollment_tickets e
      JOIN goencho_teachers t ON t.teacher_id = e.teacher_id
      WHERE e.token_hash = ? AND e.last_mutation_id = ?`)
      .bind(tokenHash, mutationId).first();
    return { claimToken, purpose: row.purpose, displayName: row.display_name };
  }

  async setTeacherPin({ claimToken, pin }) {
    validatePin(pin, this.config.pinDigits);
    const now = this.now();
    const claimHash = await this.tokenHash('teacherTicket', claimToken);
    const ticket = await this.db.prepare(`SELECT e.*, t.status AS teacher_status
      FROM goencho_teacher_enrollment_tickets e
      JOIN goencho_teachers t ON t.teacher_id = e.teacher_id
      WHERE e.claim_hash = ?`).bind(claimHash).first();
    if (!ticket || ticket.status !== 'claimed') fail(401, 'INVALID_ENROLLMENT_CLAIM', 'Invalid claim');
    if (Number(ticket.expires_at) <= now) fail(410, 'ENROLLMENT_TICKET_EXPIRED', 'Ticket expired');
    if (ticket.teacher_status !== 'active') fail(403, 'TEACHER_NOT_ACTIVE', 'Teacher not active');
    let existingCredential = null;
    let pinRecord = null;
    if (ticket.purpose === 'new_device') {
      existingCredential = await this.activeTeacherCredential(ticket.teacher_id);
      const scopeKey = `teacher:${ticket.teacher_id}`;
      await this.assertNotLocked(scopeKey, now);
      const valid = existingCredential && await this.pinCodec.verify(
        pin,
        existingCredential,
        (version) => this.teacherPinPepper(version),
      );
      if (!valid) return this.registerFailure(scopeKey, now);
    } else {
      pinRecord = await this.pinCodec.create(pin, this.teacherPinPepper());
    }
    const mutationId = this.idFactory('mutation');
    const authorizationId = this.idFactory('teacher_device');
    const credentialId = this.idFactory('teacher_credential');
    const deviceToken = this.tokenFactory();
    const deviceHash = await this.tokenHash('device', deviceToken);
    const code = confirmationCode(this.hexFactory);
    const purposeGuard = ticket.purpose === 'new_device'
      ? `AND EXISTS (SELECT 1 FROM goencho_teacher_credentials
          WHERE credential_id = ? AND teacher_id = ? AND status = 'active')`
      : '';
    const purposeBindings = ticket.purpose === 'new_device'
      ? [existingCredential.credential_id, ticket.teacher_id]
      : [];
    const guard = `EXISTS (SELECT 1 FROM goencho_teacher_enrollment_tickets
      WHERE ticket_id = ? AND last_mutation_id = ?)`;
    const guardBindings = [ticket.ticket_id, mutationId];
    const statements = [
      this.db.prepare(`UPDATE goencho_teacher_enrollment_tickets
        SET status = 'consumed', consumed_at = ?, last_mutation_id = ?
        WHERE ticket_id = ? AND claim_hash = ? AND status = 'claimed' AND expires_at > ?
          AND EXISTS (SELECT 1 FROM goencho_teachers
            WHERE teacher_id = ? AND status = 'active') ${purposeGuard}`)
        .bind(
          now, mutationId, ticket.ticket_id, claimHash, now, ticket.teacher_id,
          ...purposeBindings,
        ),
    ];
    if (ticket.purpose === 'pin_reset') {
      statements.push(
        this.db.prepare(`UPDATE goencho_teacher_sessions SET status = 'revoked', revoked_at = ?
          WHERE device_authorization_id IN (
            SELECT device_authorization_id FROM goencho_teacher_device_authorizations
            WHERE teacher_id = ?
          ) AND status != 'revoked' AND ${guard}`)
          .bind(now, ticket.teacher_id, ...guardBindings),
        this.db.prepare(`UPDATE goencho_teacher_device_authorizations
          SET status = 'revoked', revoked_at = ?, revocation_reason = 'pin_reset', last_mutation_id = ?
          WHERE teacher_id = ? AND status IN ('pending', 'approved') AND ${guard}`)
          .bind(now, mutationId, ticket.teacher_id, ...guardBindings),
        this.db.prepare(`UPDATE goencho_teacher_credentials SET status = 'superseded', changed_at = ?
          WHERE teacher_id = ? AND status = 'active' AND ${guard}`)
          .bind(now, ticket.teacher_id, ...guardBindings),
      );
    }
    if (ticket.purpose !== 'new_device') {
      statements.push(this.db.prepare(`INSERT INTO goencho_teacher_credentials
        (credential_id, teacher_id, salt, pin_hash, algorithm, work_factor,
         parameters_json, pepper_key_version, status, created_at)
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, 'active', ? WHERE ${guard}`)
        .bind(credentialId, ticket.teacher_id, ...credentialBindings(pinRecord), now, ...guardBindings));
    }
    statements.push(
      this.db.prepare(`INSERT INTO goencho_teacher_device_authorizations
        (device_authorization_id, teacher_id, token_hash, status, confirmation_code,
         created_at, last_mutation_id)
        SELECT ?, ?, ?, 'pending', ?, ?, ? WHERE ${guard}`)
        .bind(
          authorizationId, ticket.teacher_id, deviceHash, code, now, mutationId,
          ...guardBindings,
        ),
    );
    const results = await this.db.batch(statements);
    if (changes(results[0]) !== 1) fail(409, 'ENROLLMENT_CLAIM_NOT_ACTIVE', 'Claim is not active');
    return {
      authorizationId,
      teacherId: ticket.teacher_id,
      deviceToken,
      confirmationCode: code,
      status: 'pending',
    };
  }

  async approveTeacherDevice({ actor, authorizationId, confirmationCode: code }) {
    requireOwner(actor);
    const now = this.now();
    const mutationId = this.idFactory('mutation');
    const guard = `EXISTS (SELECT 1 FROM goencho_teacher_device_authorizations
      WHERE device_authorization_id = ? AND last_mutation_id = ?)`;
    const results = await this.db.batch([
      this.db.prepare(`UPDATE goencho_teacher_device_authorizations
        SET status = 'approved', approved_at = ?, approved_by_operator_id = ?, last_mutation_id = ?
        WHERE device_authorization_id = ? AND status = 'pending' AND confirmation_code = ?`)
        .bind(now, actor.operatorId, mutationId, authorizationId, code),
      this.db.prepare(`INSERT INTO goencho_audit_events
        (audit_id, actor_kind, actor_id, action, target_kind, target_id, result_code, request_id, created_at)
        SELECT ?, 'owner', ?, 'teacher.device.approve', 'teacher_device', ?, 'ok', ?, ? WHERE ${guard}`)
        .bind(this.idFactory('audit'), actor.operatorId, authorizationId, mutationId, now, authorizationId, mutationId),
    ]);
    if (changes(results[0]) !== 1) fail(409, 'DEVICE_NOT_PENDING', 'Device is not pending');
    return { status: 'approved' };
  }

  async rejectTeacherDevice({ actor, authorizationId }) {
    requireOwner(actor);
    const now = this.now();
    const mutationId = this.idFactory('mutation');
    const results = await this.db.batch([
      this.db.prepare(`UPDATE goencho_teacher_device_authorizations
        SET status = 'revoked', revoked_at = ?, revocation_reason = 'reject', last_mutation_id = ?
        WHERE device_authorization_id = ? AND status = 'pending'`)
        .bind(now, mutationId, authorizationId),
    ]);
    if (changes(results[0]) !== 1) fail(409, 'DEVICE_NOT_PENDING', 'Device is not pending');
    return { status: 'revoked' };
  }

  async revokeTeacherDevice({ actor, authorizationId, reason = 'owner_action' }) {
    requireOwner(actor);
    const now = this.now();
    const mutationId = this.idFactory('mutation');
    const guard = `EXISTS (SELECT 1 FROM goencho_teacher_device_authorizations
      WHERE device_authorization_id = ? AND last_mutation_id = ? AND status = 'revoked')`;
    const results = await this.db.batch([
      this.db.prepare(`UPDATE goencho_teacher_device_authorizations
        SET status = 'revoked', revoked_at = ?, revocation_reason = ?, last_mutation_id = ?
        WHERE device_authorization_id = ? AND status IN ('pending', 'approved')`)
        .bind(now, reason, mutationId, authorizationId),
      this.db.prepare(`UPDATE goencho_teacher_sessions SET status = 'revoked', revoked_at = ?
        WHERE device_authorization_id = ? AND status != 'revoked' AND ${guard}`)
        .bind(now, authorizationId, authorizationId, mutationId),
    ]);
    if (changes(results[0]) !== 1) fail(409, 'DEVICE_NOT_REVOCABLE', 'Device is not revocable');
    return { status: 'revoked' };
  }

  async revokeAllTeacherDevices({ actor, teacherId, reason = 'pin_reset' }) {
    requireOwner(actor);
    const now = this.now();
    const mutationId = this.idFactory('mutation');
    const results = await this.db.batch([
      this.db.prepare(`UPDATE goencho_teacher_device_authorizations
        SET status = 'revoked', revoked_at = ?, revocation_reason = ?, last_mutation_id = ?
        WHERE teacher_id = ? AND status IN ('pending', 'approved')`)
        .bind(now, reason, mutationId, teacherId),
      this.db.prepare(`UPDATE goencho_teacher_sessions SET status = 'revoked', revoked_at = ?
        WHERE device_authorization_id IN (
          SELECT device_authorization_id FROM goencho_teacher_device_authorizations
          WHERE teacher_id = ? AND last_mutation_id = ? AND status = 'revoked'
        ) AND status != 'revoked'`).bind(now, teacherId, mutationId),
    ]);
    return { revoked: changes(results[0]) };
  }

  async unlockTeacher({ deviceToken, pin }) {
    validatePin(pin, this.config.pinDigits);
    const device = await this.teacherDevice(deviceToken);
    if (device.device_status === 'pending') fail(202, 'DEVICE_PENDING', 'Device pending');
    if (device.device_status !== 'approved') fail(401, 'DEVICE_REVOKED', 'Device revoked');
    const now = this.now();
    const scopeKey = `teacher:${device.teacher_id}`;
    await this.assertNotLocked(scopeKey, now);
    const credential = await this.activeTeacherCredential(device.teacher_id);
    const valid = credential && await this.pinCodec.verify(
      pin,
      credential,
      (version) => this.teacherPinPepper(version),
    );
    if (!valid) return this.registerFailure(scopeKey, now);
    const sessionId = this.idFactory('teacher_session');
    const sessionToken = this.tokenFactory();
    const sessionHash = await this.tokenHash('session', sessionToken);
    const results = await this.db.batch([
      this.db.prepare(`UPDATE goencho_teacher_sessions SET status = 'revoked', revoked_at = ?
        WHERE device_authorization_id = ? AND status IN ('active', 'locked')
          AND EXISTS (SELECT 1 FROM goencho_teacher_device_authorizations
            WHERE device_authorization_id = ? AND status = 'approved')`)
        .bind(now, device.device_authorization_id, device.device_authorization_id),
      this.db.prepare(`DELETE FROM goencho_auth_attempts WHERE scope_key = ?
        AND EXISTS (SELECT 1 FROM goencho_teacher_device_authorizations
          WHERE device_authorization_id = ? AND status = 'approved')`)
        .bind(scopeKey, device.device_authorization_id),
      this.db.prepare(`INSERT INTO goencho_teacher_sessions
        (session_id, device_authorization_id, session_hash, status, created_at, last_seen_at)
        SELECT ?, d.device_authorization_id, ?, 'active', ?, ?
        FROM goencho_teacher_device_authorizations d
        JOIN goencho_teachers t ON t.teacher_id = d.teacher_id
        WHERE d.device_authorization_id = ? AND d.status = 'approved' AND t.status = 'active'`)
        .bind(sessionId, sessionHash, now, now, device.device_authorization_id),
    ]);
    if (changes(results[2]) !== 1) fail(401, 'DEVICE_REVOKED', 'Device revoked');
    return {
      teacherId: device.teacher_id,
      authorizationId: device.device_authorization_id,
      sessionId,
      sessionToken,
    };
  }

  async lockInactiveTeacherSession({ sessionToken }) {
    const now = this.now();
    const sessionHash = await this.tokenHash('session', sessionToken);
    const result = await this.db.prepare(`UPDATE goencho_teacher_sessions
      SET status = 'locked', locked_at = ?
      WHERE session_hash = ? AND status = 'active' AND last_seen_at <= ?`)
      .bind(now, sessionHash, now - this.config.inactivityMs).run();
    return { locked: changes(result) };
  }

  async logoutTeacher(sessionToken) {
    if (!sessionToken) return { status: 'logged_out' };
    const result = await this.db.prepare(`UPDATE goencho_teacher_sessions
      SET status = 'revoked', revoked_at = ?
      WHERE session_hash = ? AND status != 'revoked'`)
      .bind(this.now(), await this.tokenHash('session', sessionToken)).run();
    return { status: 'logged_out', revoked: changes(result) };
  }
}
