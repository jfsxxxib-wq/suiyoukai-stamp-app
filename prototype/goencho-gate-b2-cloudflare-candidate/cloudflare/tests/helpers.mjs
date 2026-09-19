import { randomUUID } from 'node:crypto';
import { hmacHex } from '../src/web-crypto.mjs';
import { NodeD1Database } from './node-d1.mjs';

export const FIXED_NOW = Date.parse('2026-09-18T10:00:00+09:00');

export function fakeSecrets() {
  return {
    GOENCHO_OWNER_PIN_PEPPER_V1: 'owner-pin-'.padEnd(48, 'o'),
    GOENCHO_TEACHER_PIN_PEPPER_V1: 'teacher-pin-'.padEnd(48, 't'),
    GOENCHO_DEVICE_TOKEN_HMAC_KEY_V1: 'device-hmac-'.padEnd(48, 'd'),
    GOENCHO_SESSION_HMAC_KEY_V1: 'session-hmac-'.padEnd(48, 's'),
    GOENCHO_RECOVERY_CODE_PEPPER_V1: 'recovery-'.padEnd(48, 'r'),
  };
}

export async function createCloudflareHarness({
  teacherId = 'fake_teacher_a',
  now = FIXED_NOW,
  sessionLastSeenAt = now,
} = {}) {
  const db = new NodeD1Database();
  const secrets = fakeSecrets();
  const deviceToken = `fake-device-${randomUUID()}`;
  const sessionToken = `fake-session-${randomUUID()}`;
  const authorizationId = `fake-authorization-${randomUUID()}`;
  const sessionId = `fake-session-id-${randomUUID()}`;
  const [deviceHash, sessionHash] = await Promise.all([
    hmacHex(secrets.GOENCHO_DEVICE_TOKEN_HMAC_KEY_V1, deviceToken),
    hmacHex(secrets.GOENCHO_SESSION_HMAC_KEY_V1, sessionToken),
  ]);
  db.sqlite.prepare(`INSERT INTO goencho_teacher_device_authorizations
    (device_authorization_id, teacher_id, token_hash, status, confirmation_code,
     created_at, approved_at, last_seen_at)
    VALUES (?, ?, ?, 'approved', '0000', ?, ?, ?)`)
    .run(authorizationId, teacherId, deviceHash, now, now, now);
  db.sqlite.prepare(`INSERT INTO goencho_teacher_sessions
    (session_id, device_authorization_id, session_hash, status, created_at, last_seen_at)
    VALUES (?, ?, ?, 'active', ?, ?)`)
    .run(sessionId, authorizationId, sessionHash, now, sessionLastSeenAt);

  return {
    db,
    env: { GOENCHO_DB: db, ...secrets },
    deviceToken,
    sessionToken,
    authorizationId,
    sessionId,
    teacherId,
    cookie: `goencho_teacher_device=${encodeURIComponent(deviceToken)}; goencho_teacher_session=${encodeURIComponent(sessionToken)}`,
    close() {
      db.close();
    },
  };
}
