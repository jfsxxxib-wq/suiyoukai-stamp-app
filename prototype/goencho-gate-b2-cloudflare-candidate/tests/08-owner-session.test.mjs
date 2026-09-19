import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../lib/config.mjs';
import { createHarness, expectCode } from './helpers.mjs';

test('owner-session-01 初回登録でowner sessionを発行しserver側actorへ解決できる', () => {
  const harness = createHarness();
  const actor = harness.ownerAuth.resolveSession(harness.owner.sessionToken);
  assert.equal(actor.kind, 'owner');
  assert.equal(actor.operatorId, harness.owner.operatorId);
  assert.equal(actor.deviceId, harness.owner.deviceId);
  assert.equal(actor.sessionId, harness.owner.sessionId);
  harness.close();
});

test('owner-session-02 PIN解除は新しいsessionを発行する', () => {
  const harness = createHarness();
  const unlocked = harness.ownerAuth.unlock({
    deviceToken: harness.owner.deviceToken,
    pin: harness.ownerPin,
  });
  assert.notEqual(unlocked.sessionToken, harness.owner.sessionToken);
  assert.equal(harness.ownerAuth.resolveSession(unlocked.sessionToken).operatorId, harness.owner.operatorId);
  harness.close();
});

test('owner-session-03 無操作期限はsessionだけをlockし承認済み端末を失効させない', () => {
  const harness = createHarness();
  harness.advance(CONFIG.inactivityMs + 1);
  expectCode(() => harness.ownerAuth.resolveSession(harness.owner.sessionToken), 'OWNER_SESSION_LOCKED', 401);
  const device = harness.db.prepare(`SELECT status FROM goencho_operator_devices
    WHERE device_authorization_id = ?`).get(harness.owner.deviceId);
  const session = harness.db.prepare(`SELECT status FROM goencho_operator_sessions
    WHERE session_id = ?`).get(harness.owner.sessionId);
  assert.equal(device.status, 'approved');
  assert.equal(session.status, 'locked');
  harness.close();
});

test('owner-session-04 無操作lock後は同じ承認済み端末でPIN再認証できる', () => {
  const harness = createHarness();
  harness.advance(CONFIG.inactivityMs + 1);
  expectCode(() => harness.ownerAuth.resolveSession(harness.owner.sessionToken), 'OWNER_SESSION_LOCKED', 401);
  const unlocked = harness.ownerAuth.unlock({ deviceToken: harness.owner.deviceToken, pin: harness.ownerPin });
  assert.equal(harness.ownerAuth.resolveSession(unlocked.sessionToken).operatorId, harness.owner.operatorId);
  expectCode(() => harness.ownerAuth.resolveSession(harness.owner.sessionToken), 'OWNER_SESSION_LOCKED', 401);
  harness.close();
});

test('owner-session-05 logoutはsessionだけをrevokedにして端末承認を維持する', () => {
  const harness = createHarness();
  assert.deepEqual(harness.ownerAuth.logout(harness.owner.sessionToken), { status: 'logged_out' });
  expectCode(() => harness.ownerAuth.resolveSession(harness.owner.sessionToken), 'OWNER_SESSION_INVALID', 401);
  const device = harness.db.prepare(`SELECT status FROM goencho_operator_devices
    WHERE device_authorization_id = ?`).get(harness.owner.deviceId);
  assert.equal(device.status, 'approved');
  harness.close();
});

test('owner-session-06 復旧は旧端末と全旧sessionを失効し新しいsessionを発行する', () => {
  const harness = createHarness();
  const second = harness.ownerAuth.unlock({ deviceToken: harness.owner.deviceToken, pin: harness.ownerPin });
  const recovered = harness.ownerAuth.recover({
    recoveryCode: harness.owner.recoveryCodes[0],
    newPin: '864209',
  });
  expectCode(() => harness.ownerAuth.resolveSession(harness.owner.sessionToken), 'OWNER_SESSION_INVALID', 401);
  expectCode(() => harness.ownerAuth.resolveSession(second.sessionToken), 'OWNER_SESSION_INVALID', 401);
  const actor = harness.ownerAuth.resolveSession(recovered.sessionToken);
  assert.equal(actor.operatorId, harness.owner.operatorId);
  assert.notEqual(actor.deviceId, harness.owner.deviceId);
  harness.close();
});

test('owner-session-07 session token平文はDBへ保存しない', () => {
  const harness = createHarness();
  const serialized = JSON.stringify(harness.db.prepare('SELECT * FROM goencho_operator_sessions').all());
  assert.equal(serialized.includes(harness.owner.sessionToken), false);
  const stored = harness.db.prepare(`SELECT session_hash FROM goencho_operator_sessions
    WHERE session_id = ?`).get(harness.owner.sessionId);
  assert.ok(stored.session_hash);
  assert.notEqual(stored.session_hash, harness.owner.sessionToken);
  harness.close();
});

test('owner-session-08 sessionなしではowner actorを作れない', () => {
  const harness = createHarness();
  expectCode(() => harness.ownerAuth.resolveSession(), 'OWNER_SESSION_REQUIRED', 401);
  harness.close();
});
