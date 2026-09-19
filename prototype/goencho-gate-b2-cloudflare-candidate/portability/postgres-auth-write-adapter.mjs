import { fail } from '../lib/errors.mjs';
import { Pbkdf2PinCodec } from '../cloudflare/src/pin-codec.mjs';
import { D1_AUTH_CONFIG } from '../cloudflare/src/d1-auth-service.mjs';
import { hmacHex, opaqueId, randomHex, randomToken } from '../cloudflare/src/web-crypto.mjs';

function affected(result) {
  return Number(result?.affectedRows ?? result?.rowCount ?? 0);
}

function requireOwner(actor) {
  if (actor?.kind !== 'owner' || !actor.operatorId) fail(403, 'OWNER_REQUIRED', 'Owner required');
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

function isUniqueViolation(error) {
  return error?.code === '23505' || /unique constraint|duplicate key/iu.test(String(error?.message ?? ''));
}

export class GoenchoPostgresAuthWriteAdapter {
  constructor({
    client,
    secrets,
    now = () => Date.now(),
    config = D1_AUTH_CONFIG,
    pinCodec,
    idFactory = opaqueId,
    tokenFactory = randomToken,
    hexFactory = randomHex,
    mutationHook = null,
  } = {}) {
    if (!client || typeof client.query !== 'function' || typeof client.transaction !== 'function') {
      throw new TypeError('Postgres client is required');
    }
    this.client = client;
    this.secrets = secrets ?? {};
    this.now = now;
    this.config = config;
    this.pinCodec = pinCodec ?? new Pbkdf2PinCodec({ digits: config.pinDigits });
    this.idFactory = idFactory;
    this.tokenFactory = tokenFactory;
    this.hexFactory = hexFactory;
    this.mutationHook = mutationHook;
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

  async transaction(work) {
    return this.client.transaction(async (tx) => {
      let mutationIndex = 0;
      const query = async (sql, params = []) => {
        if (this.mutationHook) await this.mutationHook(mutationIndex, sql);
        mutationIndex += 1;
        return tx.query(sql, params);
      };
      return work(query, tx);
    });
  }

  async createBootstrapTicket({ token } = {}) {
    token ??= this.tokenFactory();
    const now = this.now();
    const result = await this.client.query(`INSERT INTO goencho_bootstrap_tickets
      (ticket_id, token_hash, status, created_at, expires_at)
      SELECT $1, $2, 'active', $3, $4
      WHERE NOT EXISTS (SELECT 1 FROM goencho_operators WHERE status = 'active')`, [
      this.idFactory('bootstrap'),
      await this.tokenHash('ownerTicket', token),
      now,
      now + this.config.ticketLifetimeMs,
    ]);
    if (affected(result) !== 1) fail(409, 'OWNER_ALREADY_EXISTS', 'Owner already exists');
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
    const codes = Array.from({ length: this.config.recoveryCodeCount }, () => `RC-${this.hexFactory(10).toUpperCase()}`);
    const pinRecord = await this.pinCodec.create(pin, this.ownerPinPepper());
    const [ticketHash, deviceHash, sessionHash, codeHashes] = await Promise.all([
      this.tokenHash('ownerTicket', ticket),
      this.tokenHash('device', deviceToken),
      this.tokenHash('session', sessionToken),
      Promise.all(codes.map((code) => this.tokenHash('recovery', code))),
    ]);
    try {
      await this.transaction(async (query) => {
        const consumed = await query(`UPDATE goencho_bootstrap_tickets
          SET status = 'consumed', consumed_at = $1, last_mutation_id = $2
          WHERE token_hash = $3 AND status = 'active' AND expires_at > $1
            AND NOT EXISTS (SELECT 1 FROM goencho_operators WHERE status = 'active')
          RETURNING ticket_id`, [now, mutationId, ticketHash]);
        if (affected(consumed) !== 1) fail(409, 'BOOTSTRAP_TICKET_NOT_ACTIVE', 'Ticket is not active');
        await query(`INSERT INTO goencho_operators
          (operator_id, role, status, created_at, updated_at) VALUES ($1, 'owner', 'active', $2, $2)`, [operatorId, now]);
        await query(`INSERT INTO goencho_operator_credentials
          (credential_id, operator_id, salt, pin_hash, algorithm, work_factor, parameters_json,
           pepper_key_version, status, created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'active',$9)`, [
          credentialId, operatorId, pinRecord.salt, pinRecord.hash, pinRecord.algorithm,
          pinRecord.workFactor, pinRecord.parametersJson, pinRecord.pepperKeyVersion, now,
        ]);
        await query(`INSERT INTO goencho_operator_devices
          (device_authorization_id, operator_id, token_hash, status, created_at, approved_at, last_seen_at)
          VALUES ($1,$2,$3,'approved',$4,$4,$4)`, [deviceId, operatorId, deviceHash, now]);
        await query(`INSERT INTO goencho_operator_sessions
          (session_id, device_authorization_id, session_hash, status, created_at, last_seen_at)
          VALUES ($1,$2,$3,'active',$4,$4)`, [sessionId, deviceId, sessionHash, now]);
        for (let index = 0; index < codes.length; index += 1) {
          await query(`INSERT INTO goencho_operator_recovery_codes
            (recovery_code_id, operator_id, batch_id, code_hash, status, created_at)
            VALUES ($1,$2,$3,$4,'active',$5)`, [
            this.idFactory('recovery'), operatorId, batchId, codeHashes[index], now,
          ]);
        }
        await query(`INSERT INTO goencho_audit_events
          (audit_id, actor_kind, actor_id, action, target_kind, target_id, result_code, request_id, created_at)
          VALUES ($1,'system',NULL,'owner.bootstrap.activate','operator',$2,'ok',$3,$4)`, [
          this.idFactory('audit'), operatorId, mutationId, now,
        ]);
      });
    } catch (error) {
      if (isUniqueViolation(error)) fail(409, 'BOOTSTRAP_TICKET_NOT_ACTIVE', 'Ticket is not active');
      throw error;
    }
    return { operatorId, deviceId, deviceToken, sessionId, sessionToken, recoveryCodes: codes };
  }

  async recoverOwner({ recoveryCode, newPin }) {
    validatePin(newPin, this.config.pinDigits);
    const now = this.now();
    const codeHash = await this.tokenHash('recovery', recoveryCode);
    const credentialId = this.idFactory('owner_credential');
    const deviceId = this.idFactory('owner_device');
    const sessionId = this.idFactory('owner_session');
    const mutationId = this.idFactory('mutation');
    const newBatchId = this.idFactory('recovery_batch');
    const deviceToken = this.tokenFactory();
    const sessionToken = this.tokenFactory();
    const newCodes = Array.from({ length: this.config.recoveryCodeCount }, () => `RC-${this.hexFactory(10).toUpperCase()}`);
    const pinRecord = await this.pinCodec.create(newPin, this.ownerPinPepper());
    const [deviceHash, sessionHash, newCodeHashes] = await Promise.all([
      this.tokenHash('device', deviceToken),
      this.tokenHash('session', sessionToken),
      Promise.all(newCodes.map((code) => this.tokenHash('recovery', code))),
    ]);
    let operatorId;
    await this.transaction(async (query) => {
      const consumed = await query(`UPDATE goencho_operator_recovery_codes
        SET status='consumed', consumed_at=$1, last_mutation_id=$2
        WHERE code_hash=$3 AND status='active'
        RETURNING recovery_code_id, operator_id, batch_id`, [now, mutationId, codeHash]);
      if (affected(consumed) !== 1) fail(401, 'INVALID_RECOVERY_CODE', 'Invalid recovery code');
      const existing = consumed.rows[0];
      operatorId = existing.operator_id;
      await query(`UPDATE goencho_operator_recovery_codes SET status='revoked', revoked_at=$1
        WHERE operator_id=$2 AND batch_id=$3 AND status='active'`, [now, operatorId, existing.batch_id]);
      await query(`UPDATE goencho_operator_sessions SET status='revoked', revoked_at=$1
        WHERE device_authorization_id IN (
          SELECT device_authorization_id FROM goencho_operator_devices WHERE operator_id=$2
        ) AND status!='revoked'`, [now, operatorId]);
      await query(`UPDATE goencho_operator_devices
        SET status='revoked', revoked_at=$1, revocation_reason='recovery'
        WHERE operator_id=$2 AND status='approved'`, [now, operatorId]);
      await query(`UPDATE goencho_operator_credentials SET status='superseded', changed_at=$1
        WHERE operator_id=$2 AND status='active'`, [now, operatorId]);
      await query(`INSERT INTO goencho_operator_credentials
        (credential_id,operator_id,salt,pin_hash,algorithm,work_factor,parameters_json,
         pepper_key_version,status,created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'active',$9)`, [
        credentialId, operatorId, pinRecord.salt, pinRecord.hash, pinRecord.algorithm,
        pinRecord.workFactor, pinRecord.parametersJson, pinRecord.pepperKeyVersion, now,
      ]);
      await query(`INSERT INTO goencho_operator_devices
        (device_authorization_id,operator_id,token_hash,status,created_at,approved_at,last_seen_at)
        VALUES ($1,$2,$3,'approved',$4,$4,$4)`, [deviceId, operatorId, deviceHash, now]);
      await query(`INSERT INTO goencho_operator_sessions
        (session_id,device_authorization_id,session_hash,status,created_at,last_seen_at)
        VALUES ($1,$2,$3,'active',$4,$4)`, [sessionId, deviceId, sessionHash, now]);
      for (let index = 0; index < newCodes.length; index += 1) {
        await query(`INSERT INTO goencho_operator_recovery_codes
          (recovery_code_id,operator_id,batch_id,code_hash,status,created_at)
          VALUES ($1,$2,$3,$4,'active',$5)`, [
          this.idFactory('recovery'), operatorId, newBatchId, newCodeHashes[index], now,
        ]);
      }
    });
    return { operatorId, deviceId, deviceToken, sessionId, sessionToken, recoveryCodes: newCodes };
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
    await this.transaction(async (query) => {
      await query(`INSERT INTO goencho_teachers
        (teacher_id,display_name,status,created_at,updated_at) VALUES ($1,$2,'active',$3,$3)`, [teacherId, name, now]);
      await query(`INSERT INTO goencho_teacher_enrollment_tickets
        (ticket_id,teacher_id,token_hash,purpose,status,created_at,expires_at)
        VALUES ($1,$2,$3,'initial','active',$4,$5)`, [ticketId, teacherId, tokenHash, now, now + this.config.ticketLifetimeMs]);
      await query(`INSERT INTO goencho_audit_events
        (audit_id,actor_kind,actor_id,action,target_kind,target_id,result_code,request_id,created_at)
        VALUES ($1,'owner',$2,'teacher.create','teacher',$3,'ok',$4,$5)`, [
        this.idFactory('audit'), actor.operatorId, teacherId, this.idFactory('request'), now,
      ]);
    });
    return { teacherId, token, purpose: 'initial' };
  }

  async createTeacherEnrollment({ actor, teacherId, purpose, token }) {
    requireOwner(actor);
    validatePurpose(purpose);
    token ??= this.tokenFactory();
    const now = this.now();
    const result = await this.client.query(`INSERT INTO goencho_teacher_enrollment_tickets
      (ticket_id,teacher_id,token_hash,purpose,status,created_at,expires_at)
      SELECT $1,teacher_id,$2,$3,'active',$4,$5 FROM goencho_teachers
      WHERE teacher_id=$6 AND status='active'`, [
      this.idFactory('enrollment'), await this.tokenHash('teacherTicket', token), purpose,
      now, now + this.config.ticketLifetimeMs, teacherId,
    ]);
    if (affected(result) !== 1) fail(404, 'TEACHER_NOT_FOUND', 'Teacher not found');
    return { teacherId, token, purpose };
  }

  async claimEnrollment({ ticket }) {
    const now = this.now();
    const tokenHash = await this.tokenHash('teacherTicket', ticket);
    const claimToken = this.tokenFactory();
    const claimHash = await this.tokenHash('teacherTicket', claimToken);
    const mutationId = this.idFactory('mutation');
    let row;
    await this.transaction(async (query, tx) => {
      const result = await query(`UPDATE goencho_teacher_enrollment_tickets e
        SET status='claimed', claim_hash=$1, claimed_at=$2, last_mutation_id=$3
        WHERE token_hash=$4 AND status='active' AND expires_at>$2
          AND EXISTS (SELECT 1 FROM goencho_teachers t WHERE t.teacher_id=e.teacher_id AND t.status='active')
        RETURNING teacher_id,purpose`, [claimHash, now, mutationId, tokenHash]);
      if (affected(result) !== 1) fail(409, 'ENROLLMENT_TICKET_NOT_ACTIVE', 'Ticket is not active');
      const teacher = await tx.query('SELECT display_name FROM goencho_teachers WHERE teacher_id=$1', [result.rows[0].teacher_id]);
      row = { purpose: result.rows[0].purpose, display_name: teacher.rows[0].display_name };
    });
    return { claimToken, purpose: row.purpose, displayName: row.display_name };
  }

  async registerFailure(scopeKey, now) {
    const lockUntil = now + this.config.pinLockMs;
    const result = await this.client.query(`INSERT INTO goencho_auth_attempts
      (scope_key,failure_count,locked_until,updated_at)
      VALUES ($1,1,CASE WHEN 1 >= $2 THEN $3 ELSE NULL END,$4)
      ON CONFLICT(scope_key) DO UPDATE SET
        failure_count=CASE
          WHEN goencho_auth_attempts.locked_until>$4 THEN goencho_auth_attempts.failure_count
          WHEN goencho_auth_attempts.locked_until IS NOT NULL THEN 1
          ELSE goencho_auth_attempts.failure_count+1 END,
        locked_until=CASE
          WHEN goencho_auth_attempts.locked_until>$4 THEN goencho_auth_attempts.locked_until
          WHEN goencho_auth_attempts.locked_until IS NOT NULL THEN CASE WHEN 1 >= $2 THEN $3 ELSE NULL END
          WHEN goencho_auth_attempts.failure_count+1 >= $2 THEN $3 ELSE NULL END,
        updated_at=EXCLUDED.updated_at
      RETURNING failure_count,locked_until`, [scopeKey, this.config.maxPinFailures, lockUntil, now]);
    if (Number(result.rows[0]?.locked_until ?? 0) > now) {
      fail(429, 'AUTH_TEMPORARILY_LOCKED', 'Authentication is temporarily locked');
    }
    fail(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
  }

  async setTeacherPin({ claimToken, pin }) {
    validatePin(pin, this.config.pinDigits);
    const now = this.now();
    const claimHash = await this.tokenHash('teacherTicket', claimToken);
    const context = await this.client.query(`SELECT e.*,t.status AS teacher_status
      FROM goencho_teacher_enrollment_tickets e JOIN goencho_teachers t ON t.teacher_id=e.teacher_id
      WHERE e.claim_hash=$1`, [claimHash]);
    const ticket = context.rows[0];
    if (!ticket || ticket.status !== 'claimed') fail(401, 'INVALID_ENROLLMENT_CLAIM', 'Invalid claim');
    if (Number(ticket.expires_at) <= now) fail(410, 'ENROLLMENT_TICKET_EXPIRED', 'Ticket expired');
    if (ticket.teacher_status !== 'active') fail(403, 'TEACHER_NOT_ACTIVE', 'Teacher not active');
    let existingCredential = null;
    let pinRecord = null;
    if (ticket.purpose === 'new_device') {
      const lock = await this.client.query('SELECT locked_until FROM goencho_auth_attempts WHERE scope_key=$1', [`teacher:${ticket.teacher_id}`]);
      if (Number(lock.rows[0]?.locked_until ?? 0) > now) fail(429, 'AUTH_TEMPORARILY_LOCKED', 'Authentication is temporarily locked');
      const credential = await this.client.query(`SELECT * FROM goencho_teacher_credentials
        WHERE teacher_id=$1 AND status='active' ORDER BY created_at DESC LIMIT 1`, [ticket.teacher_id]);
      existingCredential = credential.rows[0] ?? null;
      const valid = existingCredential && await this.pinCodec.verify(
        pin, existingCredential, (version) => this.teacherPinPepper(version),
      );
      if (!valid) return this.registerFailure(`teacher:${ticket.teacher_id}`, now);
    } else {
      pinRecord = await this.pinCodec.create(pin, this.teacherPinPepper());
    }
    const mutationId = this.idFactory('mutation');
    const authorizationId = this.idFactory('teacher_device');
    const credentialId = this.idFactory('teacher_credential');
    const deviceToken = this.tokenFactory();
    const deviceHash = await this.tokenHash('device', deviceToken);
    const code = String(Number.parseInt(this.hexFactory(2), 16) % 10_000).padStart(4, '0');
    await this.transaction(async (query) => {
      const params = [now, mutationId, ticket.ticket_id, claimHash, ticket.teacher_id];
      let credentialGuard = '';
      if (ticket.purpose === 'new_device') {
        credentialGuard = ` AND EXISTS (SELECT 1 FROM goencho_teacher_credentials
          WHERE credential_id=$6 AND teacher_id=$5 AND status='active')`;
        params.push(existingCredential.credential_id);
      }
      const consumed = await query(`UPDATE goencho_teacher_enrollment_tickets
        SET status='consumed',consumed_at=$1,last_mutation_id=$2
        WHERE ticket_id=$3 AND claim_hash=$4 AND status='claimed' AND expires_at>$1
          AND EXISTS (SELECT 1 FROM goencho_teachers WHERE teacher_id=$5 AND status='active')${credentialGuard}
        RETURNING ticket_id`, params);
      if (affected(consumed) !== 1) fail(409, 'ENROLLMENT_CLAIM_NOT_ACTIVE', 'Claim is not active');
      if (ticket.purpose === 'pin_reset') {
        await query(`UPDATE goencho_teacher_sessions SET status='revoked',revoked_at=$1
          WHERE device_authorization_id IN (
            SELECT device_authorization_id FROM goencho_teacher_device_authorizations WHERE teacher_id=$2
          ) AND status!='revoked'`, [now, ticket.teacher_id]);
        await query(`UPDATE goencho_teacher_device_authorizations
          SET status='revoked',revoked_at=$1,revocation_reason='pin_reset',last_mutation_id=$2
          WHERE teacher_id=$3 AND status IN ('pending','approved')`, [now, mutationId, ticket.teacher_id]);
        await query(`UPDATE goencho_teacher_credentials SET status='superseded',changed_at=$1
          WHERE teacher_id=$2 AND status='active'`, [now, ticket.teacher_id]);
      }
      if (ticket.purpose !== 'new_device') {
        await query(`INSERT INTO goencho_teacher_credentials
          (credential_id,teacher_id,salt,pin_hash,algorithm,work_factor,parameters_json,
           pepper_key_version,status,created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'active',$9)`, [
          credentialId, ticket.teacher_id, pinRecord.salt, pinRecord.hash, pinRecord.algorithm,
          pinRecord.workFactor, pinRecord.parametersJson, pinRecord.pepperKeyVersion, now,
        ]);
      }
      await query(`INSERT INTO goencho_teacher_device_authorizations
        (device_authorization_id,teacher_id,token_hash,status,confirmation_code,created_at,last_mutation_id)
        VALUES ($1,$2,$3,'pending',$4,$5,$6)`, [
        authorizationId, ticket.teacher_id, deviceHash, code, now, mutationId,
      ]);
    });
    return { authorizationId, teacherId: ticket.teacher_id, deviceToken, confirmationCode: code, status: 'pending' };
  }

  async approveTeacherDevice({ actor, authorizationId, confirmationCode }) {
    requireOwner(actor);
    const now = this.now();
    const mutationId = this.idFactory('mutation');
    await this.transaction(async (query) => {
      const approved = await query(`UPDATE goencho_teacher_device_authorizations
        SET status='approved',approved_at=$1,approved_by_operator_id=$2,last_mutation_id=$3
        WHERE device_authorization_id=$4 AND status='pending' AND confirmation_code=$5
        RETURNING device_authorization_id`, [now, actor.operatorId, mutationId, authorizationId, confirmationCode]);
      if (affected(approved) !== 1) fail(409, 'DEVICE_NOT_PENDING', 'Device is not pending');
      await query(`INSERT INTO goencho_audit_events
        (audit_id,actor_kind,actor_id,action,target_kind,target_id,result_code,request_id,created_at)
        VALUES ($1,'owner',$2,'teacher.device.approve','teacher_device',$3,'ok',$4,$5)`, [
        this.idFactory('audit'), actor.operatorId, authorizationId, mutationId, now,
      ]);
    });
    return { status: 'approved' };
  }

  async rejectTeacherDevice({ actor, authorizationId }) {
    requireOwner(actor);
    const now = this.now();
    const mutationId = this.idFactory('mutation');
    await this.transaction(async (query) => {
      const result = await query(`UPDATE goencho_teacher_device_authorizations
        SET status='revoked',revoked_at=$1,revocation_reason='reject',last_mutation_id=$2
        WHERE device_authorization_id=$3 AND status='pending'
        RETURNING device_authorization_id`, [now, mutationId, authorizationId]);
      if (affected(result) !== 1) fail(409, 'DEVICE_NOT_PENDING', 'Device is not pending');
    });
    return { status: 'revoked' };
  }

  async revokeTeacherDevice({ actor, authorizationId, reason = 'owner_action' }) {
    requireOwner(actor);
    const now = this.now();
    const mutationId = this.idFactory('mutation');
    await this.transaction(async (query) => {
      const revoked = await query(`UPDATE goencho_teacher_device_authorizations
        SET status='revoked',revoked_at=$1,revocation_reason=$2,last_mutation_id=$3
        WHERE device_authorization_id=$4 AND status IN ('pending','approved')
        RETURNING device_authorization_id`, [now, reason, mutationId, authorizationId]);
      if (affected(revoked) !== 1) fail(409, 'DEVICE_NOT_REVOCABLE', 'Device is not revocable');
      await query(`UPDATE goencho_teacher_sessions SET status='revoked',revoked_at=$1
        WHERE device_authorization_id=$2 AND status!='revoked'`, [now, authorizationId]);
    });
    return { status: 'revoked' };
  }
}
