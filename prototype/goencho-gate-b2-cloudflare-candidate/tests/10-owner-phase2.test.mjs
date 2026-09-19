import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../lib/config.mjs';
import { randomToken } from '../lib/crypto.mjs';
import { openDatabase } from '../lib/db.mjs';
import { OwnerAuthService } from '../lib/owner-auth.mjs';
import { createHarness, expectCode } from './helpers.mjs';

test('phase2-01 owner stateは秘密やIDなしでsetup_requiredを返す', () => {
  const db = openDatabase();
  const ownerAuth = new OwnerAuthService({ db, pepper: randomToken(32) });
  assert.deepEqual(ownerAuth.ownerState(), { state: 'setup_required' });
  db.close();
});

test('phase2-02 owner stateはrecovery・unlock・activeをcookieからserver判定する', () => {
  const harness = createHarness();
  assert.deepEqual(harness.ownerAuth.ownerState(), { state: 'recovery_required' });
  assert.deepEqual(harness.ownerAuth.ownerState({ deviceToken: harness.owner.deviceToken }), { state: 'unlock_required' });
  assert.deepEqual(harness.ownerAuth.ownerState({
    deviceToken: harness.owner.deviceToken,
    sessionToken: harness.owner.sessionToken,
  }), { state: 'active' });
  harness.close();
});

test('phase2-03 owner stateは無操作sessionをlockしてunlock_requiredへ戻す', () => {
  const harness = createHarness();
  harness.advance(CONFIG.inactivityMs + 1);
  assert.deepEqual(harness.ownerAuth.ownerState({
    deviceToken: harness.owner.deviceToken,
    sessionToken: harness.owner.sessionToken,
  }), { state: 'unlock_required' });
  const session = harness.db.prepare('SELECT status FROM goencho_operator_sessions WHERE session_id = ?')
    .get(harness.owner.sessionId);
  const device = harness.db.prepare('SELECT status FROM goencho_operator_devices WHERE device_authorization_id = ?')
    .get(harness.owner.deviceId);
  assert.equal(session.status, 'locked');
  assert.equal(device.status, 'approved');
  harness.close();
});

test('phase2-04 active ownerが複数ならunavailableで安全停止する', () => {
  const harness = createHarness();
  const now = harness.now();
  harness.db.prepare(`INSERT INTO goencho_operators
    (operator_id, role, status, created_at, updated_at) VALUES (?, 'owner', 'active', ?, ?)`)
    .run('owner_inconsistent_fake', now, now);
  assert.deepEqual(harness.ownerAuth.ownerState(), { state: 'unavailable' });
  harness.close();
});

test('phase2-04b 既存ownerがactive以外でも初回登録へ戻さずunavailableで停止する', () => {
  const harness = createHarness();
  harness.db.prepare("UPDATE goencho_operators SET status = 'revoked'").run();
  assert.deepEqual(harness.ownerAuth.ownerState(), { state: 'unavailable' });
  harness.close();
});

test('phase2-05 先生作成と初回ticket発行は同一transactionで成功する', () => {
  const harness = createHarness();
  const result = harness.ownerAuth.createInitialTeacherEnrollment({
    actor: harness.ownerActor,
    displayName: '取引試験先生（架空）',
  });
  assert.match(result.teacherId, /^teacher_/);
  assert.equal(result.purpose, 'initial');
  assert.ok(result.ticket);
  assert.equal(harness.db.prepare('SELECT COUNT(*) AS count FROM goencho_teachers WHERE teacher_id = ?').get(result.teacherId).count, 1);
  assert.equal(harness.db.prepare('SELECT COUNT(*) AS count FROM goencho_teacher_enrollment_tickets WHERE teacher_id = ?').get(result.teacherId).count, 1);
  harness.close();
});

test('phase2-06 ticket作成失敗時はteacher作成もrollbackする', () => {
  const harness = createHarness();
  const duplicateToken = randomToken();
  const existingTeacher = harness.createTeacher('既存先生（架空）');
  harness.ownerAuth.createEnrollmentTicket({ actor: harness.ownerActor, teacherId: existingTeacher, token: duplicateToken });
  const before = harness.db.prepare('SELECT COUNT(*) AS count FROM goencho_teachers').get().count;
  assert.throws(() => harness.ownerAuth.createInitialTeacherEnrollment({
    actor: harness.ownerActor,
    displayName: '残ってはいけない先生（架空）',
    token: duplicateToken,
  }));
  const after = harness.db.prepare('SELECT COUNT(*) AS count FROM goencho_teachers').get().count;
  assert.equal(after, before);
  assert.equal(harness.db.prepare('SELECT COUNT(*) AS count FROM goencho_teachers WHERE display_name = ?')
    .get('残ってはいけない先生（架空）').count, 0);
  harness.close();
});

test('phase2-07 同じ表示名でも別操作は別teacher_idになる', () => {
  const harness = createHarness();
  const first = harness.ownerAuth.createInitialTeacherEnrollment({ actor: harness.ownerActor, displayName: '同名先生（架空）' });
  const second = harness.ownerAuth.createInitialTeacherEnrollment({ actor: harness.ownerActor, displayName: '同名先生（架空）' });
  assert.notEqual(first.teacherId, second.teacherId);
  harness.close();
});

test('phase2-08 device一覧はstatusで完全分離しapprovedへ確認番号を返さない', () => {
  const harness = createHarness();
  const pending = harness.enrollTeacher({ teacherId: harness.createTeacher('承認待ち先生（架空）') });
  const approved = harness.enrollTeacher({ teacherId: harness.createTeacher('承認済み先生（架空）'), approve: true });
  const pendingRows = harness.ownerAuth.listDevices({ actor: harness.ownerActor, status: 'pending' });
  const approvedRows = harness.ownerAuth.listDevices({ actor: harness.ownerActor, status: 'approved' });
  assert.deepEqual(pendingRows.map((row) => row.device_authorization_id), [pending.authorizationId]);
  assert.deepEqual(approvedRows.map((row) => row.device_authorization_id), [approved.authorizationId]);
  assert.ok(pendingRows[0].confirmation_code);
  assert.equal('confirmation_code' in approvedRows[0], false);
  for (const row of [...pendingRows, ...approvedRows]) {
    assert.equal('token_hash' in row, false);
    assert.equal('teacher_id' in row, false);
  }
  harness.close();
});

test('phase2-09 不正なdevice statusを400で拒否する', () => {
  const harness = createHarness();
  expectCode(() => harness.ownerAuth.listDevices({ actor: harness.ownerActor, status: 'all' }), 'INVALID_DEVICE_STATUS', 400);
  harness.close();
});
