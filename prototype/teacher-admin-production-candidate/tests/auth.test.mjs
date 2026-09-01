import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveActor } from '../lib/auth.mjs';

const headers = (values = {}) => new Headers(values);

test('未ログインは拒否する', () => {
  assert.deepEqual(resolveActor(headers(), {}), { ok: false, status: 401, message: 'ログインを確認できません。' });
});

test('管理者一覧にある利用者だけを管理者にする', () => {
  const result = resolveActor(headers({ 'oai-authenticated-user-id': 'user-admin' }), { adminUserIds: 'user-a,user-admin' });
  assert.equal(result.ok, true);
  assert.equal(result.actor.role, 'admin');
});

test('先生はサーバー設定の先生IDへ固定する', () => {
  const result = resolveActor(headers({ 'oai-authenticated-user-id': 'user-teacher-1' }), {
    teacherUserMap: JSON.stringify({ 'user-teacher-1': 'aoba' }),
  });
  assert.equal(result.ok, true);
  assert.equal(result.actor.role, 'teacher');
  assert.equal(result.actor.teacherId, 'aoba');
});

test('ローカル試験ヘッダーは試験モード以外では権限にならない', () => {
  const result = resolveActor(headers({ 'x-suiyoukai-test-actor': 'admin' }), { localTestMode: '0' });
  assert.equal(result.ok, false);
  assert.equal(result.status, 401);
});

test('ローカル試験モードでは架空の管理者と先生を使える', () => {
  const admin = resolveActor(headers({ 'x-suiyoukai-test-actor': 'admin' }), { localTestMode: '1' });
  const teacher = resolveActor(headers({ 'x-suiyoukai-test-actor': 'teacher:wakamatsu' }), { localTestMode: '1' });
  assert.equal(admin.actor.role, 'admin');
  assert.equal(teacher.actor.teacherId, 'wakamatsu');
});

test('登録されていないログイン利用者は拒否する', () => {
  const result = resolveActor(headers({ 'oai-authenticated-user-id': 'unknown' }), {
    adminUserIds: 'admin',
    teacherUserMap: '{"teacher":"aoba"}',
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, 403);
});
