import test from 'node:test';
import assert from 'node:assert/strict';
import { schemaColumns } from '../lib/db.mjs';
import { createHarness, expectCode } from './helpers.mjs';

const DAY = 24 * 60 * 60 * 1000;

test('expiry-01 先生端末tableにexpires_atがない', () => {
  const h = createHarness();
  assert.equal(schemaColumns(h.db, 'goencho_teacher_device_authorizations').includes('expires_at'), false);
  h.close();
});

test('expiry-02 承認から180日後もunlockできる', () => {
  const h = createHarness();
  const device = h.enrollTeacher({ approve: true });
  h.advance(180 * DAY);
  assert.equal(h.teacherAuth.unlock({ deviceToken: device.deviceToken, pin: device.pin }).teacherId, device.teacherId);
  h.close();
});

test('expiry-03 承認から365日後もunlockできる', () => {
  const h = createHarness();
  const device = h.enrollTeacher({ approve: true });
  h.advance(365 * DAY);
  assert.equal(h.teacherAuth.unlock({ deviceToken: device.deviceToken, pin: device.pin }).teacherId, device.teacherId);
  h.close();
});

test('expiry-04 last_seen_atが古いだけでは失効しない', () => {
  const h = createHarness();
  const device = h.enrollTeacher({ approve: true });
  h.db.prepare('UPDATE goencho_teacher_device_authorizations SET last_seen_at = ? WHERE device_authorization_id = ?')
    .run(h.now() - 800 * DAY, device.authorizationId);
  assert.equal(h.teacherAuth.unlock({ deviceToken: device.deviceToken, pin: device.pin }).authorizationId, device.authorizationId);
  h.close();
});

test('expiry-05 個別失効は対象端末だけ', () => {
  const h = createHarness();
  const first = h.enrollTeacher({ approve: true });
  const ticket = h.ownerAuth.createEnrollmentTicket({ actor: h.ownerActor, teacherId: first.teacherId, purpose: 'new_device' }).token;
  const claim = h.teacherAuth.claimEnrollment({ ticket });
  const second = h.teacherAuth.setPin({ claimToken: claim.claimToken, pin: first.pin });
  h.ownerAuth.approveDevice({ actor: h.ownerActor, authorizationId: second.authorizationId, confirmationCode: second.confirmationCode });
  h.ownerAuth.revokeDevice({ actor: h.ownerActor, authorizationId: first.authorizationId });
  expectCode(() => h.teacherAuth.unlock({ deviceToken: first.deviceToken, pin: first.pin }), 'DEVICE_REVOKED', 401);
  assert.equal(h.teacherAuth.unlock({ deviceToken: second.deviceToken, pin: first.pin }).teacherId, first.teacherId);
  h.close();
});

test('expiry-06 全端末失効は対象先生だけ', () => {
  const h = createHarness();
  const a = h.enrollTeacher({ approve: true });
  const b = h.enrollTeacher({ approve: true });
  h.ownerAuth.revokeAllTeacherDevices({ actor: h.ownerActor, teacherId: a.teacherId });
  expectCode(() => h.teacherAuth.unlock({ deviceToken: a.deviceToken, pin: a.pin }), 'DEVICE_REVOKED', 401);
  assert.equal(h.teacherAuth.unlock({ deviceToken: b.deviceToken, pin: b.pin }).teacherId, b.teacherId);
  h.close();
});

test('expiry-07 端末交換は旧revoked・新pending・承認後approved', () => {
  const h = createHarness();
  const oldDevice = h.enrollTeacher({ approve: true });
  h.ownerAuth.revokeDevice({ actor: h.ownerActor, authorizationId: oldDevice.authorizationId, reason: 'replace' });
  const ticket = h.ownerAuth.createEnrollmentTicket({ actor: h.ownerActor, teacherId: oldDevice.teacherId, purpose: 'new_device' }).token;
  const claim = h.teacherAuth.claimEnrollment({ ticket });
  const next = h.teacherAuth.setPin({ claimToken: claim.claimToken, pin: oldDevice.pin });
  assert.equal(h.teacherAuth.deviceStatus(next.deviceToken).status, 'pending');
  h.ownerAuth.approveDevice({ actor: h.ownerActor, authorizationId: next.authorizationId, confirmationCode: next.confirmationCode });
  assert.equal(h.teacherAuth.deviceStatus(next.deviceToken).status, 'approved');
  h.close();
});

test('expiry-08 端末失効で過去matchは変わらない', () => {
  const h = createHarness();
  const device = h.enrollTeacher({ teacherId: 'fake_teacher_a', approve: true });
  const before = h.db.prepare('SELECT COUNT(*) count FROM goencho_match_records WHERE teacher_id = ?').get(device.teacherId).count;
  h.ownerAuth.revokeDevice({ actor: h.ownerActor, authorizationId: device.authorizationId });
  const after = h.db.prepare('SELECT COUNT(*) count FROM goencho_match_records WHERE teacher_id = ?').get(device.teacherId).count;
  assert.equal(after, before);
  h.close();
});
