import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../lib/config.mjs';
import { DraftStore } from '../lib/drafts.mjs';
import { createHarness, expectCode } from './helpers.mjs';

test('draft-01 無操作後はsessionだけlocked', () => {
  const h = createHarness();
  const ready = h.readyTeacher();
  h.advance(CONFIG.inactivityMs + 1);
  expectCode(() => h.teacherAuth.resolveSession(ready.sessionToken), 'SESSION_LOCKED', 401);
  assert.equal(h.teacherAuth.deviceStatus(ready.deviceToken).status, 'approved');
  h.close();
});

test('draft-02 lockしても端末authorizationはrevokedにならない', () => {
  const h = createHarness();
  const ready = h.readyTeacher();
  h.advance(CONFIG.inactivityMs + 1);
  expectCode(() => h.teacherAuth.resolveSession(ready.sessionToken), 'SESSION_LOCKED', 401);
  const row = h.db.prepare('SELECT status FROM goencho_teacher_device_authorizations WHERE device_authorization_id = ?').get(ready.authorizationId);
  assert.equal(row.status, 'approved');
  h.close();
});

test('draft-03 PIN再認証後も同じauthorization', () => {
  const h = createHarness();
  const ready = h.readyTeacher();
  h.advance(CONFIG.inactivityMs + 1);
  expectCode(() => h.teacherAuth.resolveSession(ready.sessionToken), 'SESSION_LOCKED', 401);
  const next = h.teacherAuth.unlock({ deviceToken: ready.deviceToken, pin: ready.pin });
  assert.equal(next.authorizationId, ready.authorizationId);
  h.close();
});

test('draft-04 再認証後に同じdraftを復元', () => {
  const h = createHarness();
  const ready = h.readyTeacher();
  const drafts = new DraftStore();
  drafts.put(ready.authorizationId, 'draft_1', { participantId: 'fake_participant_same_1', resultCode: 'pending' });
  h.advance(CONFIG.inactivityMs + 1);
  expectCode(() => h.teacherAuth.resolveSession(ready.sessionToken), 'SESSION_LOCKED', 401);
  const next = h.teacherAuth.unlock({ deviceToken: ready.deviceToken, pin: ready.pin });
  assert.deepEqual(drafts.get(next.authorizationId, 'draft_1'), { participantId: 'fake_participant_same_1', resultCode: 'pending' });
  h.close();
});

test('draft-05 draftへ秘密fieldを保存しない', () => {
  const drafts = new DraftStore();
  assert.throws(() => drafts.put('fake_authorization', 'draft_1', { pin: 'runtime-only' }), /forbidden/i);
  assert.throws(() => drafts.put('fake_authorization', 'draft_2', { sessionToken: 'runtime-only' }), /forbidden/i);
});

test('draft-06 別authorizationへdraftを渡さず削除可能', () => {
  const drafts = new DraftStore();
  drafts.put('fake_auth_a', 'draft_1', { participantId: 'fake_participant_same_1' });
  assert.equal(drafts.get('fake_auth_b', 'draft_1'), null);
  drafts.remove('fake_auth_a', 'draft_1');
  assert.equal(drafts.get('fake_auth_a', 'draft_1'), null);
});
