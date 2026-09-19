import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../lib/config.mjs';
import { randomToken } from '../lib/crypto.mjs';
import { createHarness, expectCode } from './helpers.mjs';

test('phase3-01 deviceなしはIDや秘密なしでenrollment_required', () => {
  const h = createHarness();
  assert.deepEqual(h.teacherAuth.teacherState({}), { state: 'enrollment_required' });
  h.close();
});

test('phase3-02 pendingだけが先生名と確認番号を返す', () => {
  const h = createHarness();
  const pending = h.enrollTeacher();
  const result = h.teacherAuth.teacherState({ deviceToken: pending.deviceToken });
  assert.equal(result.state, 'pending');
  assert.equal(result.displayName, '試験先生（架空）');
  assert.equal(result.confirmationCode, pending.confirmationCode);
  for (const forbidden of ['teacherId', 'teacher_id', 'authorizationId', 'sessionId', 'token', 'hash', 'pin']) {
    assert.equal(forbidden in result, false);
  }
  h.close();
});

test('phase3-03 approvedは確認番号を返さずunlock_required', () => {
  const h = createHarness();
  const device = h.enrollTeacher({ approve: true });
  const result = h.teacherAuth.teacherState({ deviceToken: device.deviceToken });
  assert.deepEqual(result, {
    state: 'unlock_required', displayName: '試験先生（架空）', reason: 'session_required',
  });
  assert.equal('confirmationCode' in result, false);
  h.close();
});

test('phase3-04 同じapproved deviceとactive sessionだけactive', () => {
  const h = createHarness();
  const ready = h.readyTeacher();
  assert.deepEqual(h.teacherAuth.teacherState({
    deviceToken: ready.deviceToken,
    sessionToken: ready.sessionToken,
  }), { state: 'active', displayName: '試験先生（架空）' });
  h.close();
});

test('phase3-05 state確認は無操作時間を延長しない', () => {
  const h = createHarness();
  const ready = h.readyTeacher();
  h.advance(CONFIG.inactivityMs - 1_000);
  assert.equal(h.teacherAuth.teacherState({
    deviceToken: ready.deviceToken,
    sessionToken: ready.sessionToken,
  }).state, 'active');
  h.advance(1_001);
  const result = h.teacherAuth.teacherState({
    deviceToken: ready.deviceToken,
    sessionToken: ready.sessionToken,
  });
  assert.equal(result.state, 'unlock_required');
  assert.equal(result.reason, 'inactivity');
  h.close();
});

test('phase3-06 無操作lockはsessionだけでdeviceはapproved', () => {
  const h = createHarness();
  const ready = h.readyTeacher();
  h.advance(CONFIG.inactivityMs + 1);
  h.teacherAuth.teacherState({ deviceToken: ready.deviceToken, sessionToken: ready.sessionToken });
  const device = h.db.prepare(`SELECT status FROM goencho_teacher_device_authorizations
    WHERE device_authorization_id = ?`).get(ready.authorizationId);
  const session = h.db.prepare(`SELECT status FROM goencho_teacher_sessions WHERE session_hash IS NOT NULL
    ORDER BY created_at DESC LIMIT 1`).get();
  assert.equal(device.status, 'approved');
  assert.equal(session.status, 'locked');
  h.close();
});

test('phase3-07 unknownとrevoked deviceは安全停止', () => {
  const h = createHarness();
  expectCode(() => h.teacherAuth.teacherState({ deviceToken: randomToken() }), 'TEACHER_DEVICE_UNKNOWN', 401);
  const device = h.enrollTeacher({ approve: true });
  h.ownerAuth.revokeDevice({ actor: h.ownerActor, authorizationId: device.authorizationId });
  expectCode(() => h.teacherAuth.teacherState({ deviceToken: device.deviceToken }), 'TEACHER_DEVICE_UNAVAILABLE', 401);
  h.close();
});

test('phase3-08 inactive先生はstateでも403', () => {
  const h = createHarness();
  const device = h.enrollTeacher({ approve: true });
  h.db.prepare("UPDATE goencho_teachers SET status = 'inactive' WHERE teacher_id = ?").run(device.teacherId);
  expectCode(() => h.teacherAuth.teacherState({ deviceToken: device.deviceToken }), 'TEACHER_NOT_ACTIVE', 403);
  h.close();
});

test('phase3-09 別端末sessionではactiveにならない', () => {
  const h = createHarness();
  const first = h.readyTeacher();
  const ticket = h.ownerAuth.createEnrollmentTicket({
    actor: h.ownerActor, teacherId: first.teacherId, purpose: 'new_device', token: randomToken(),
  });
  const claim = h.teacherAuth.claimEnrollment({ ticket: ticket.token });
  const second = h.teacherAuth.setPin({ claimToken: claim.claimToken, pin: first.pin });
  h.ownerAuth.approveDevice({
    actor: h.ownerActor,
    authorizationId: second.authorizationId,
    confirmationCode: second.confirmationCode,
  });
  const state = h.teacherAuth.teacherState({
    deviceToken: second.deviceToken,
    sessionToken: first.sessionToken,
  });
  assert.equal(state.state, 'unlock_required');
  assert.equal(state.reason, 'session_invalid');
  expectCode(() => h.teacherAuth.resolveDeviceSession({
    deviceToken: second.deviceToken,
    sessionToken: first.sessionToken,
  }), 'TEACHER_SESSION_DEVICE_MISMATCH', 401);
  h.close();
});

test('phase3-10 再unlockは同じ端末の旧sessionを失効', () => {
  const h = createHarness();
  const device = h.enrollTeacher({ approve: true });
  const first = h.teacherAuth.unlock({ deviceToken: device.deviceToken, pin: device.pin });
  const second = h.teacherAuth.unlock({ deviceToken: device.deviceToken, pin: device.pin });
  expectCode(() => h.teacherAuth.resolveSession(first.sessionToken), 'TEACHER_SESSION_INVALID', 401);
  assert.equal(h.teacherAuth.resolveSession(second.sessionToken).authorizationId, device.authorizationId);
  h.close();
});

test('phase3-11 claim成功時だけ表示名とpurposeを返す', () => {
  const h = createHarness();
  const teacherId = h.createTeacher('表示確認先生（架空）');
  const enrollment = h.ownerAuth.createEnrollmentTicket({
    actor: h.ownerActor, teacherId, purpose: 'initial', token: randomToken(),
  });
  const claim = h.teacherAuth.claimEnrollment({ ticket: enrollment.token });
  assert.equal(claim.displayName, '表示確認先生（架空）');
  assert.equal(claim.purpose, 'initial');
  assert.match(claim.claimToken, /./);
  h.close();
});

test('phase3-12 inactive先生のticketはclaimできない', () => {
  const h = createHarness();
  const teacherId = h.createTeacher();
  const enrollment = h.ownerAuth.createEnrollmentTicket({
    actor: h.ownerActor, teacherId, purpose: 'initial', token: randomToken(),
  });
  h.db.prepare("UPDATE goencho_teachers SET status = 'inactive' WHERE teacher_id = ?").run(teacherId);
  expectCode(() => h.teacherAuth.claimEnrollment({ ticket: enrollment.token }), 'TEACHER_NOT_ACTIVE', 403);
  h.close();
});
