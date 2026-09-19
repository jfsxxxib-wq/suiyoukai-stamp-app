import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../public/owner/index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../public/owner/owner.js', import.meta.url), 'utf8');

test('owner-ui-01 承認済み6主画面の入口を保持する', () => {
  for (let screen = 1; screen <= 6; screen += 1) assert.match(html, new RegExp(`data-screen="${screen}"`));
  assert.match(script, /管理端末を最初に登録/);
  assert.match(script, /復旧コードを保存/);
  assert.match(script, /管理端末を紛失したとき/);
  assert.match(script, /先生を登録/);
  assert.match(script, /先生端末の承認待ち/);
  assert.match(script, /先生端末を確認/);
});

test('owner-ui-02 DB由来文字列をinnerHTMLへ入れない', () => {
  assert.doesNotMatch(script, /innerHTML|insertAdjacentHTML|document\.write/);
  assert.match(script, /textContent/);
  assert.match(script, /replaceChildren/);
});

test('owner-ui-03 秘密値をbrowser storageや自動clipboardへ保存しない', () => {
  assert.doesNotMatch(script, /localStorage|sessionStorage|indexedDB|clipboard\.write/);
  assert.doesNotMatch(script, /console\./);
});

test('owner-ui-04 復旧コードは確認後にDOMとmemoryから除去する', () => {
  assert.match(script, /list\.replaceChildren\(\)/);
  assert.match(script, /state\.oneTimeCodes\.fill\(''\)/);
  assert.match(script, /state\.oneTimeCodes = null/);
});

test('owner-ui-05 一回限りticketはqueryでなくfragmentへ置く', () => {
  assert.match(script, /#enrollment=/);
  assert.doesNotMatch(script, /\?enrollment=/);
});

test('owner-ui-06 approveは対面確認checkbox前にdisabled', () => {
  assert.match(script, /face-to-face-check/);
  assert.match(script, /確認して承認/);
  assert.match(script, /disabled: true/);
});

test('owner-ui-07 通常owner操作bodyへownerPinを送らない', () => {
  assert.doesNotMatch(script, /ownerPin|owner_pin|x-owner-pin/);
  assert.match(script, /\/api\/owner\/session\/unlock/);
});

test('owner-ui-08 主要操作はbuttonとして実装する', () => {
  assert.match(html, /<button type="button"/);
  assert.match(script, /element\('button'/);
  assert.match(html, /aria-live="polite"/);
  assert.match(script, /heading\.focus/);
});
