import assert from 'node:assert/strict';
import test from 'node:test';
import { GoenchoD1AuthService } from '../src/d1-auth-service.mjs';
import { hmacHex, randomHex } from '../src/web-crypto.mjs';
import { fakeSecrets, FIXED_NOW } from './helpers.mjs';
import { NodeD1Database } from './node-d1.mjs';

class FastTestPinCodec {
  constructor() {
    this.verifyCount = 0;
  }

  async create(pin, pepper) {
    return {
      salt: randomHex(16),
      hash: await hmacHex(pepper, `fake-pin:${pin}`),
      algorithm: 'fake-test-pin-v1',
      workFactor: 600_000,
      parametersJson: '{"testOnly":true}',
      pepperKeyVersion: 'v1',
    };
  }

  async verify(pin, record, pepperForVersion) {
    this.verifyCount += 1;
    const expected = await hmacHex(pepperForVersion(record.pepper_key_version), `fake-pin:${pin}`);
    return expected === record.pin_hash;
  }
}

function harness({ now = FIXED_NOW } = {}) {
  const db = new NodeD1Database({ seed: false });
  const pinCodec = new FastTestPinCodec();
  const service = new GoenchoD1AuthService({
    db,
    secrets: fakeSecrets(),
    now: () => now,
    pinCodec,
  });
  return { db, service, pinCodec, close: () => db.close() };
}

async function activatedOwner(candidate) {
  const { token } = await candidate.service.createBootstrapTicket({ token: 'fake-bootstrap-ticket' });
  const owner = await candidate.service.activateOwner({ ticket: token, pin: '482105' });
  return { ...owner, actor: { kind: 'owner', operatorId: owner.operatorId } };
}

async function pendingTeacher(candidate, owner, { pin = '731904', name = '架空 青葉先生' } = {}) {
  const enrollment = await candidate.service.createInitialTeacherEnrollment({
    actor: owner.actor,
    displayName: name,
    token: `fake-enrollment-${randomHex(4)}`,
  });
  const claim = await candidate.service.claimEnrollment({ ticket: enrollment.token });
  const pending = await candidate.service.setTeacherPin({ claimToken: claim.claimToken, pin });
  return { ...enrollment, ...pending, pin };
}

function count(db, table, where = '1 = 1') {
  return Number(db.sqlite.prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE ${where}`).get().count);
}

test('b2-auth-01 migration v3はactive owner・credential・teacher sessionをDB制約で一意にする', () => {
  const candidate = harness();
  try {
    assert.equal(candidate.db.sqlite.prepare('SELECT version FROM schema_meta').get().version, 3);
    const indexes = candidate.db.sqlite.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'index' AND name LIKE 'uq_goencho_%' ORDER BY name",
    ).all().map((row) => row.name);
    assert.deepEqual(indexes, [
      'uq_goencho_one_active_owner',
      'uq_goencho_operator_active_credential',
      'uq_goencho_teacher_active_credential',
      'uq_goencho_teacher_device_active_session',
    ]);
  } finally {
    candidate.close();
  }
});

test('b2-auth-02 同じbootstrap ticketの20並列は一件だけ成功し半端なownerを残さない', async () => {
  const candidate = harness();
  try {
    const { token } = await candidate.service.createBootstrapTicket({ token: 'fake-bootstrap-parallel' });
    const results = await Promise.allSettled(Array.from({ length: 20 }, () => (
      candidate.service.activateOwner({ ticket: token, pin: '482105' })
    )));
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal(count(candidate.db, 'goencho_operators', "status = 'active'"), 1);
    assert.equal(count(candidate.db, 'goencho_operator_credentials', "status = 'active'"), 1);
    assert.equal(count(candidate.db, 'goencho_operator_devices', "status = 'approved'"), 1);
    assert.equal(count(candidate.db, 'goencho_operator_sessions', "status = 'active'"), 1);
    assert.equal(count(candidate.db, 'goencho_operator_recovery_codes', "status = 'active'"), 5);
    assert.equal(count(candidate.db, 'goencho_audit_events', "action = 'owner.bootstrap.activate'"), 1);
  } finally {
    candidate.close();
  }
});

test('b2-auth-03 別のbootstrap ticketを同時利用してもactive ownerは一人だけ', async () => {
  const candidate = harness();
  try {
    const one = await candidate.service.createBootstrapTicket({ token: 'fake-bootstrap-one' });
    const two = await candidate.service.createBootstrapTicket({ token: 'fake-bootstrap-two' });
    const results = await Promise.allSettled([
      candidate.service.activateOwner({ ticket: one.token, pin: '482105' }),
      candidate.service.activateOwner({ ticket: two.token, pin: '482105' }),
    ]);
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal(count(candidate.db, 'goencho_operators', "status = 'active'"), 1);
    assert.equal(count(candidate.db, 'goencho_operator_credentials'), 1);
    assert.equal(count(candidate.db, 'goencho_operator_devices'), 1);
  } finally {
    candidate.close();
  }
});

test('b2-auth-04 owner初回登録は全11 statementのfailure injectionで完全rollbackする', async () => {
  for (let failureIndex = 0; failureIndex < 11; failureIndex += 1) {
    const candidate = harness();
    try {
      const { token } = await candidate.service.createBootstrapTicket({ token: `fake-failure-${failureIndex}` });
      candidate.db.failNextBatchAt(failureIndex);
      await assert.rejects(candidate.service.activateOwner({ ticket: token, pin: '482105' }), /Injected D1 batch failure/);
      assert.equal(count(candidate.db, 'goencho_operators'), 0);
      assert.equal(count(candidate.db, 'goencho_operator_credentials'), 0);
      assert.equal(count(candidate.db, 'goencho_operator_devices'), 0);
      assert.equal(count(candidate.db, 'goencho_operator_sessions'), 0);
      assert.equal(count(candidate.db, 'goencho_operator_recovery_codes'), 0);
      assert.equal(candidate.db.sqlite.prepare('SELECT status FROM goencho_bootstrap_tickets').get().status, 'active');
    } finally {
      candidate.close();
    }
  }
});

test('b2-auth-05 同じowner復旧コードの並列利用は一件だけ成功し旧一式を失効する', async () => {
  const candidate = harness();
  try {
    const owner = await activatedOwner(candidate);
    const code = owner.recoveryCodes[0];
    const results = await Promise.allSettled([
      candidate.service.recoverOwner({ recoveryCode: code, newPin: '913702' }),
      candidate.service.recoverOwner({ recoveryCode: code, newPin: '913702' }),
    ]);
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal(count(candidate.db, 'goencho_operator_credentials', "status = 'active'"), 1);
    assert.equal(count(candidate.db, 'goencho_operator_credentials', "status = 'superseded'"), 1);
    assert.equal(count(candidate.db, 'goencho_operator_devices', "status = 'approved'"), 1);
    assert.equal(count(candidate.db, 'goencho_operator_devices', "status = 'revoked'"), 1);
    assert.equal(count(candidate.db, 'goencho_operator_sessions', "status = 'active'"), 1);
    assert.equal(count(candidate.db, 'goencho_operator_sessions', "status = 'revoked'"), 1);
    assert.equal(count(candidate.db, 'goencho_operator_recovery_codes', "status = 'active'"), 5);
    assert.equal(count(candidate.db, 'goencho_operator_recovery_codes', "status = 'consumed'"), 1);
    assert.equal(count(candidate.db, 'goencho_operator_recovery_codes', "status = 'revoked'"), 4);
  } finally {
    candidate.close();
  }
});

test('b2-auth-06 先生作成とticket発行は各failure injectionで一緒にrollbackする', async () => {
  for (let failureIndex = 0; failureIndex < 3; failureIndex += 1) {
    const candidate = harness();
    try {
      const owner = await activatedOwner(candidate);
      const auditBefore = count(candidate.db, 'goencho_audit_events');
      candidate.db.failNextBatchAt(failureIndex);
      await assert.rejects(candidate.service.createInitialTeacherEnrollment({
        actor: owner.actor,
        displayName: '架空 青葉先生',
      }), /Injected D1 batch failure/);
      assert.equal(count(candidate.db, 'goencho_teachers'), 0);
      assert.equal(count(candidate.db, 'goencho_teacher_enrollment_tickets'), 0);
      assert.equal(count(candidate.db, 'goencho_audit_events'), auditBefore);
    } finally {
      candidate.close();
    }
  }
});

test('b2-auth-07 enrollment ticketの20並列claimは一件だけ成功する', async () => {
  const candidate = harness();
  try {
    const owner = await activatedOwner(candidate);
    const enrollment = await candidate.service.createInitialTeacherEnrollment({
      actor: owner.actor,
      displayName: '架空 青葉先生',
      token: 'fake-claim-parallel',
    });
    const results = await Promise.allSettled(Array.from({ length: 20 }, () => (
      candidate.service.claimEnrollment({ ticket: enrollment.token })
    )));
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal(candidate.db.sqlite.prepare('SELECT status FROM goencho_teacher_enrollment_tickets').get().status, 'claimed');
  } finally {
    candidate.close();
  }
});

test('b2-auth-08 同じclaimからのPIN設定はcredential・pending端末を一組だけ作る', async () => {
  const candidate = harness();
  try {
    const owner = await activatedOwner(candidate);
    const enrollment = await candidate.service.createInitialTeacherEnrollment({
      actor: owner.actor,
      displayName: '架空 青葉先生',
      token: 'fake-set-pin-parallel',
    });
    const claim = await candidate.service.claimEnrollment({ ticket: enrollment.token });
    const results = await Promise.allSettled(Array.from({ length: 10 }, () => (
      candidate.service.setTeacherPin({ claimToken: claim.claimToken, pin: '731904' })
    )));
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal(count(candidate.db, 'goencho_teacher_credentials', "status = 'active'"), 1);
    assert.equal(count(candidate.db, 'goencho_teacher_device_authorizations', "status = 'pending'"), 1);
    assert.equal(candidate.db.sqlite.prepare('SELECT status FROM goencho_teacher_enrollment_tickets').get().status, 'consumed');
  } finally {
    candidate.close();
  }
});

test('b2-auth-09 initial PIN設定は各statement failureでclaimを消費せず部分行を残さない', async () => {
  for (let failureIndex = 0; failureIndex < 3; failureIndex += 1) {
    const candidate = harness();
    try {
      const owner = await activatedOwner(candidate);
      const enrollment = await candidate.service.createInitialTeacherEnrollment({
        actor: owner.actor,
        displayName: '架空 青葉先生',
      });
      const claim = await candidate.service.claimEnrollment({ ticket: enrollment.token });
      candidate.db.failNextBatchAt(failureIndex);
      await assert.rejects(candidate.service.setTeacherPin({ claimToken: claim.claimToken, pin: '731904' }),
        /Injected D1 batch failure/);
      assert.equal(count(candidate.db, 'goencho_teacher_credentials'), 0);
      assert.equal(count(candidate.db, 'goencho_teacher_device_authorizations'), 0);
      assert.equal(candidate.db.sqlite.prepare('SELECT status FROM goencho_teacher_enrollment_tickets').get().status, 'claimed');
    } finally {
      candidate.close();
    }
  }
});

test('b2-auth-10 new_deviceのPIN不一致はticketを消費せず端末を作らない', async () => {
  const candidate = harness();
  try {
    const owner = await activatedOwner(candidate);
    const teacher = await pendingTeacher(candidate, owner);
    await candidate.service.approveTeacherDevice({
      actor: owner.actor,
      authorizationId: teacher.authorizationId,
      confirmationCode: teacher.confirmationCode,
    });
    const enrollment = await candidate.service.createTeacherEnrollment({
      actor: owner.actor,
      teacherId: teacher.teacherId,
      purpose: 'new_device',
      token: 'fake-new-device',
    });
    const claim = await candidate.service.claimEnrollment({ ticket: enrollment.token });
    await assert.rejects(candidate.service.setTeacherPin({ claimToken: claim.claimToken, pin: '000000' }),
      (error) => error.code === 'INVALID_CREDENTIALS');
    assert.equal(count(candidate.db, 'goencho_teacher_device_authorizations'), 1);
    assert.equal(candidate.db.sqlite.prepare(
      "SELECT status FROM goencho_teacher_enrollment_tickets WHERE purpose = 'new_device'",
    ).get().status, 'claimed');
  } finally {
    candidate.close();
  }
});

test('b2-auth-11 PIN resetは旧credential・端末・sessionを失効し新pending端末だけを作る', async () => {
  const candidate = harness();
  try {
    const owner = await activatedOwner(candidate);
    const teacher = await pendingTeacher(candidate, owner);
    await candidate.service.approveTeacherDevice({
      actor: owner.actor,
      authorizationId: teacher.authorizationId,
      confirmationCode: teacher.confirmationCode,
    });
    await candidate.service.unlockTeacher({ deviceToken: teacher.deviceToken, pin: teacher.pin });
    const reset = await candidate.service.createTeacherEnrollment({
      actor: owner.actor,
      teacherId: teacher.teacherId,
      purpose: 'pin_reset',
      token: 'fake-pin-reset',
    });
    const claim = await candidate.service.claimEnrollment({ ticket: reset.token });
    const pending = await candidate.service.setTeacherPin({ claimToken: claim.claimToken, pin: '840216' });
    assert.equal(count(candidate.db, 'goencho_teacher_credentials', "status = 'active'"), 1);
    assert.equal(count(candidate.db, 'goencho_teacher_credentials', "status = 'superseded'"), 1);
    assert.equal(count(candidate.db, 'goencho_teacher_device_authorizations', "status = 'revoked'"), 1);
    assert.equal(count(candidate.db, 'goencho_teacher_device_authorizations', "status = 'pending'"), 1);
    assert.equal(count(candidate.db, 'goencho_teacher_sessions', "status = 'revoked'"), 1);
    assert.equal(pending.teacherId, teacher.teacherId);
  } finally {
    candidate.close();
  }
});

test('b2-auth-12 同じ先生端末の並列承認は一件だけ成功しauditも一件', async () => {
  const candidate = harness();
  try {
    const owner = await activatedOwner(candidate);
    const teacher = await pendingTeacher(candidate, owner);
    const results = await Promise.allSettled(Array.from({ length: 10 }, () => (
      candidate.service.approveTeacherDevice({
        actor: owner.actor,
        authorizationId: teacher.authorizationId,
        confirmationCode: teacher.confirmationCode,
      })
    )));
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal(count(candidate.db, 'goencho_audit_events', "action = 'teacher.device.approve'"), 1);
  } finally {
    candidate.close();
  }
});

test('b2-auth-13 端末失効とPIN解除が競合しても失効端末にactive sessionを残さない', async () => {
  const candidate = harness();
  try {
    const owner = await activatedOwner(candidate);
    const teacher = await pendingTeacher(candidate, owner);
    await candidate.service.approveTeacherDevice({
      actor: owner.actor,
      authorizationId: teacher.authorizationId,
      confirmationCode: teacher.confirmationCode,
    });
    await Promise.allSettled([
      candidate.service.unlockTeacher({ deviceToken: teacher.deviceToken, pin: teacher.pin }),
      candidate.service.revokeTeacherDevice({ actor: owner.actor, authorizationId: teacher.authorizationId }),
    ]);
    assert.equal(count(candidate.db, 'goencho_teacher_device_authorizations', "status = 'revoked'"), 1);
    assert.equal(count(candidate.db, 'goencho_teacher_sessions', "status = 'active'"), 0);
  } finally {
    candidate.close();
  }
});

test('b2-auth-14 PIN失敗を並列送信しても回数を取りこぼさずlock中はKDFを再実行しない', async () => {
  const candidate = harness();
  try {
    const owner = await activatedOwner(candidate);
    const teacher = await pendingTeacher(candidate, owner);
    await candidate.service.approveTeacherDevice({
      actor: owner.actor,
      authorizationId: teacher.authorizationId,
      confirmationCode: teacher.confirmationCode,
    });
    const results = await Promise.allSettled(Array.from({ length: 5 }, () => (
      candidate.service.unlockTeacher({ deviceToken: teacher.deviceToken, pin: '000000' })
    )));
    assert.equal(results.filter((result) => result.status === 'rejected').length, 5);
    const attempt = candidate.db.sqlite.prepare(
      'SELECT failure_count, locked_until FROM goencho_auth_attempts WHERE scope_key = ?',
    ).get(`teacher:${teacher.teacherId}`);
    assert.equal(attempt.failure_count, 5);
    assert.equal(attempt.locked_until > FIXED_NOW, true);
    const before = candidate.pinCodec.verifyCount;
    await assert.rejects(candidate.service.unlockTeacher({ deviceToken: teacher.deviceToken, pin: '000000' }),
      (error) => error.code === 'AUTH_TEMPORARILY_LOCKED');
    assert.equal(candidate.pinCodec.verifyCount, before);
  } finally {
    candidate.close();
  }
});

test('b2-auth-15 成功PIN解除は失敗回数を消しactive sessionを一件へ回転する', async () => {
  const candidate = harness();
  try {
    const owner = await activatedOwner(candidate);
    const teacher = await pendingTeacher(candidate, owner);
    await candidate.service.approveTeacherDevice({
      actor: owner.actor,
      authorizationId: teacher.authorizationId,
      confirmationCode: teacher.confirmationCode,
    });
    await assert.rejects(candidate.service.unlockTeacher({ deviceToken: teacher.deviceToken, pin: '000000' }));
    await candidate.service.unlockTeacher({ deviceToken: teacher.deviceToken, pin: teacher.pin });
    await candidate.service.unlockTeacher({ deviceToken: teacher.deviceToken, pin: teacher.pin });
    assert.equal(count(candidate.db, 'goencho_auth_attempts'), 0);
    assert.equal(count(candidate.db, 'goencho_teacher_sessions', "status = 'active'"), 1);
    assert.equal(count(candidate.db, 'goencho_teacher_sessions', "status = 'revoked'"), 1);
  } finally {
    candidate.close();
  }
});

test('b2-auth-16 logoutと無操作lockは端末承認を変えない', async () => {
  const candidate = harness();
  try {
    const owner = await activatedOwner(candidate);
    const teacher = await pendingTeacher(candidate, owner);
    await candidate.service.approveTeacherDevice({
      actor: owner.actor,
      authorizationId: teacher.authorizationId,
      confirmationCode: teacher.confirmationCode,
    });
    const session = await candidate.service.unlockTeacher({ deviceToken: teacher.deviceToken, pin: teacher.pin });
    candidate.db.sqlite.prepare('UPDATE goencho_teacher_sessions SET last_seen_at = ? WHERE session_id = ?')
      .run(FIXED_NOW - 30 * 60 * 1000, session.sessionId);
    assert.deepEqual(await candidate.service.lockInactiveTeacherSession({ sessionToken: session.sessionToken }), { locked: 1 });
    await candidate.service.logoutTeacher(session.sessionToken);
    assert.equal(count(candidate.db, 'goencho_teacher_device_authorizations', "status = 'approved'"), 1);
    assert.equal(count(candidate.db, 'goencho_teacher_sessions', "status = 'revoked'"), 1);
  } finally {
    candidate.close();
  }
});

test('b2-auth-17 owner復旧は全13 statementのfailure injectionで旧一式を保持する', async () => {
  for (let failureIndex = 0; failureIndex < 13; failureIndex += 1) {
    const candidate = harness();
    try {
      const owner = await activatedOwner(candidate);
      candidate.db.failNextBatchAt(failureIndex);
      await assert.rejects(
        candidate.service.recoverOwner({ recoveryCode: owner.recoveryCodes[0], newPin: '913702' }),
        /Injected D1 batch failure/,
      );
      assert.equal(count(candidate.db, 'goencho_operator_credentials'), 1);
      assert.equal(count(candidate.db, 'goencho_operator_credentials', "status = 'active'"), 1);
      assert.equal(count(candidate.db, 'goencho_operator_devices'), 1);
      assert.equal(count(candidate.db, 'goencho_operator_devices', "status = 'approved'"), 1);
      assert.equal(count(candidate.db, 'goencho_operator_sessions'), 1);
      assert.equal(count(candidate.db, 'goencho_operator_sessions', "status = 'active'"), 1);
      assert.equal(count(candidate.db, 'goencho_operator_recovery_codes'), 5);
      assert.equal(count(candidate.db, 'goencho_operator_recovery_codes', "status = 'active'"), 5);
    } finally {
      candidate.close();
    }
  }
});

test('b2-auth-18 PIN resetは全6 statementのfailure injectionで旧認証を保持する', async () => {
  for (let failureIndex = 0; failureIndex < 6; failureIndex += 1) {
    const candidate = harness();
    try {
      const owner = await activatedOwner(candidate);
      const teacher = await pendingTeacher(candidate, owner);
      await candidate.service.approveTeacherDevice({
        actor: owner.actor,
        authorizationId: teacher.authorizationId,
        confirmationCode: teacher.confirmationCode,
      });
      await candidate.service.unlockTeacher({ deviceToken: teacher.deviceToken, pin: teacher.pin });
      const reset = await candidate.service.createTeacherEnrollment({
        actor: owner.actor,
        teacherId: teacher.teacherId,
        purpose: 'pin_reset',
      });
      const claim = await candidate.service.claimEnrollment({ ticket: reset.token });
      candidate.db.failNextBatchAt(failureIndex);
      await assert.rejects(
        candidate.service.setTeacherPin({ claimToken: claim.claimToken, pin: '840216' }),
        /Injected D1 batch failure/,
      );
      assert.equal(count(candidate.db, 'goencho_teacher_credentials'), 1);
      assert.equal(count(candidate.db, 'goencho_teacher_credentials', "status = 'active'"), 1);
      assert.equal(count(candidate.db, 'goencho_teacher_device_authorizations'), 1);
      assert.equal(count(candidate.db, 'goencho_teacher_device_authorizations', "status = 'approved'"), 1);
      assert.equal(count(candidate.db, 'goencho_teacher_sessions'), 1);
      assert.equal(count(candidate.db, 'goencho_teacher_sessions', "status = 'active'"), 1);
      assert.equal(candidate.db.sqlite.prepare(
        "SELECT status FROM goencho_teacher_enrollment_tickets WHERE purpose = 'pin_reset'",
      ).get().status, 'claimed');
    } finally {
      candidate.close();
    }
  }
});

test('b2-auth-19 端末承認は両statementのfailure injectionでpendingとauditなしを維持する', async () => {
  for (let failureIndex = 0; failureIndex < 2; failureIndex += 1) {
    const candidate = harness();
    try {
      const owner = await activatedOwner(candidate);
      const teacher = await pendingTeacher(candidate, owner);
      const auditBefore = count(candidate.db, 'goencho_audit_events', "action = 'teacher.device.approve'");
      candidate.db.failNextBatchAt(failureIndex);
      await assert.rejects(candidate.service.approveTeacherDevice({
        actor: owner.actor,
        authorizationId: teacher.authorizationId,
        confirmationCode: teacher.confirmationCode,
      }), /Injected D1 batch failure/);
      assert.equal(count(candidate.db, 'goencho_teacher_device_authorizations', "status = 'pending'"), 1);
      assert.equal(count(candidate.db, 'goencho_audit_events', "action = 'teacher.device.approve'"), auditBefore);
    } finally {
      candidate.close();
    }
  }
});
