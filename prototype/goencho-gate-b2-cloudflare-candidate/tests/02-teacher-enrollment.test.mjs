import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../lib/config.mjs';
import { randomToken } from '../lib/crypto.mjs';
import { rejectTeacherIdInput } from '../lib/actor.mjs';
import { createHarness, expectCode } from './helpers.mjs';

test('teacher-01 不正な登録券は401', () => {
  const h = createHarness();
  expectCode(() => h.teacherAuth.claimEnrollment({ ticket: randomToken() }), 'INVALID_ENROLLMENT_TICKET', 401);
  h.close();
});

test('teacher-02 登録券は一回しかclaimできない', () => {
  const h = createHarness();
  const teacherId = h.createTeacher();
  const ticket = h.ownerAuth.createEnrollmentTicket({ actor: h.ownerActor, teacherId }).token;
  h.teacherAuth.claimEnrollment({ ticket });
  expectCode(() => h.teacherAuth.claimEnrollment({ ticket }), 'ENROLLMENT_TICKET_NOT_ACTIVE', 409);
  h.close();
});

test('teacher-03 期限切れ登録券は410', () => {
  const h = createHarness();
  const teacherId = h.createTeacher();
  const ticket = h.ownerAuth.createEnrollmentTicket({ actor: h.ownerActor, teacherId }).token;
  h.advance(CONFIG.ticketLifetimeMs + 1);
  expectCode(() => h.teacherAuth.claimEnrollment({ ticket }), 'ENROLLMENT_TICKET_EXPIRED', 410);
  h.close();
});

test('teacher-04 6桁数字以外のPINを拒否', () => {
  const h = createHarness();
  const teacherId = h.createTeacher();
  const ticket = h.ownerAuth.createEnrollmentTicket({ actor: h.ownerActor, teacherId }).token;
  const claim = h.teacherAuth.claimEnrollment({ ticket });
  expectCode(() => h.teacherAuth.setPin({ claimToken: claim.claimToken, pin: 'abcdef' }), 'INVALID_PIN_FORMAT', 400);
  h.close();
});

test('teacher-05 pending端末はunlockできず202', () => {
  const h = createHarness();
  const device = h.enrollTeacher();
  expectCode(() => h.teacherAuth.unlock({ deviceToken: device.deviceToken, pin: device.pin }), 'DEVICE_PENDING', 202);
  h.close();
});

test('teacher-06 確認番号不一致では承認しない', () => {
  const h = createHarness();
  const device = h.enrollTeacher();
  expectCode(() => h.ownerAuth.approveDevice({ actor: h.ownerActor, authorizationId: device.authorizationId, confirmationCode: '0000' }), 'CONFIRMATION_MISMATCH', 409);
  assert.equal(h.teacherAuth.deviceStatus(device.deviceToken).status, 'pending');
  h.close();
});

test('teacher-07 対面確認番号一致後だけapproved', () => {
  const h = createHarness();
  const device = h.enrollTeacher();
  h.ownerAuth.approveDevice({ actor: h.ownerActor, authorizationId: device.authorizationId, confirmationCode: device.confirmationCode });
  assert.equal(h.teacherAuth.deviceStatus(device.deviceToken).status, 'approved');
  h.close();
});

test('teacher-08 拒否された端末はunlockできない', () => {
  const h = createHarness();
  const device = h.enrollTeacher();
  h.ownerAuth.revokeDevice({ actor: h.ownerActor, authorizationId: device.authorizationId, reason: 'reject' });
  expectCode(() => h.teacherAuth.unlock({ deviceToken: device.deviceToken, pin: device.pin }), 'DEVICE_REVOKED', 401);
  h.close();
});

test('teacher-09 clientのteacher ID持込みを全経路で拒否', () => {
  expectCode(() => rejectTeacherIdInput({ query: { teacherId: 'fake_teacher_b' } }), 'TEACHER_ID_NOT_ACCEPTED', 400);
  expectCode(() => rejectTeacherIdInput({ body: { teacher_id: 'fake_teacher_b' } }), 'TEACHER_ID_NOT_ACCEPTED', 400);
  expectCode(() => rejectTeacherIdInput({ headers: { 'x-teacher-id': 'fake_teacher_b' } }), 'TEACHER_ID_NOT_ACCEPTED', 400);
  expectCode(() => rejectTeacherIdInput({ path: '/api/teachers/fake_teacher_b/matches' }), 'TEACHER_ID_NOT_ACCEPTED', 400);
});

test('teacher-10 新端末登録で既存PIN不一致を拒否', () => {
  const h = createHarness();
  const first = h.enrollTeacher({ approve: true });
  const ticket = h.ownerAuth.createEnrollmentTicket({ actor: h.ownerActor, teacherId: first.teacherId, purpose: 'new_device' }).token;
  const claim = h.teacherAuth.claimEnrollment({ ticket });
  expectCode(() => h.teacherAuth.setPin({ claimToken: claim.claimToken, pin: String(100000 + Math.floor(Math.random() * 899999)) }), 'INVALID_CREDENTIALS', 401);
  h.close();
});

test('teacher-11 新端末は同じteacher IDでpendingになる', () => {
  const h = createHarness();
  const first = h.enrollTeacher({ approve: true });
  const ticket = h.ownerAuth.createEnrollmentTicket({ actor: h.ownerActor, teacherId: first.teacherId, purpose: 'new_device' }).token;
  const claim = h.teacherAuth.claimEnrollment({ ticket });
  const second = h.teacherAuth.setPin({ claimToken: claim.claimToken, pin: first.pin });
  assert.equal(second.teacherId, first.teacherId);
  assert.equal(second.status, 'pending');
  assert.notEqual(second.authorizationId, first.authorizationId);
  h.close();
});

test('teacher-12 inactive先生はapproved端末でも403', () => {
  const h = createHarness();
  const device = h.enrollTeacher({ approve: true });
  h.db.prepare("UPDATE goencho_teachers SET status = 'inactive' WHERE teacher_id = ?").run(device.teacherId);
  expectCode(() => h.teacherAuth.unlock({ deviceToken: device.deviceToken, pin: device.pin }), 'TEACHER_NOT_ACTIVE', 403);
  h.close();
});
