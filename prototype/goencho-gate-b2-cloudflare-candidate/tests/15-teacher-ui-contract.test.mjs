import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../public/teacher/index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../public/teacher/teacher.js', import.meta.url), 'utf8');

test('teacher-ui-01 認証6段階の表示入口を持つ', () => {
  for (const stage of ['qr', 'pin', 'pending', 'unlock', 'ready', 'records']) {
    assert.match(html, new RegExp(`data-stage="${stage}"`));
  }
  assert.match(script, /一回限りQRを読み取ってください/);
  assert.match(script, /管理端末の承認待ち/);
  assert.match(script, /今日の対局/);
});

test('teacher-ui-02 DB由来文字列をinnerHTMLへ入れない', () => {
  assert.doesNotMatch(script, /innerHTML/);
  assert.match(script, /textContent/);
  assert.match(script, /replaceChildren/);
});

test('teacher-ui-03 秘密をbrowser storageやclipboardやconsoleへ出さない', () => {
  assert.doesNotMatch(script, /localStorage|sessionStorage|indexedDB|clipboard\.write|console\./);
  assert.match(script, /input\.value = ''/);
  assert.match(script, /clearClaim\(\)/);
});

test('teacher-ui-04 Phase 4は認証後の3方向APIを持つ', () => {
  assert.match(script, /\/api\/teacher\/matches\/today/);
  assert.match(script, /\/api\/teacher\/matches\/dates/);
  assert.match(script, /\/api\/teacher\/matches\/by-date/);
  assert.match(script, /\/api\/teacher\/participants\//);
});

test('teacher-ui-05 server stateだけで画面を決める', () => {
  assert.match(script, /sameOriginJson\('\/api\/teacher\/state'\)/);
  assert.doesNotMatch(script, /teacherId|teacher_id/);
  assert.match(script, /applyServerState/);
});

test('teacher-ui-06 pendingだけ確認番号を保持する', () => {
  assert.match(script, /result\.state === 'pending'/);
  assert.match(script, /clearPendingDetails\(\)/);
  assert.match(script, /state\.confirmationCode = ''/);
});

test('teacher-ui-07 pending確認は低頻度・visible時だけ', () => {
  assert.match(script, /pendingPollMs = 10_000/);
  assert.match(script, /document\.visibilityState !== 'visible'/);
  assert.match(script, /visibilitychange/);
  assert.match(script, /state\.requestInFlight/);
});

test('teacher-ui-08 QR fragmentをclaim前に履歴から除去する入口を使う', () => {
  assert.match(script, /consumeEnrollmentFragment\(window\.location, window\.history\)/);
  assert.match(script, /claimEnrollment\(enrollmentTicket\)/);
  assert.doesNotMatch(script, /\?enrollment=/);
});

test('teacher-ui-09 purpose別にPIN文言を分ける', () => {
  assert.match(script, /state\.purpose === 'new_device'/);
  assert.match(script, /state\.purpose === 'pin_reset'/);
  assert.match(script, /リーグPINとは別/);
});

test('teacher-ui-10 button・label・live region・focusを持つ', () => {
  assert.match(html, /<button type="button"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(script, /element\('label'/);
  assert.match(script, /heading\.focus/);
});
