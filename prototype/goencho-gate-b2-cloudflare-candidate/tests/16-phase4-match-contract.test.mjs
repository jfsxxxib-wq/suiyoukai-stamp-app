import test from 'node:test';
import assert from 'node:assert/strict';
import { japanDateKey, requireDateKey, requireParticipantId } from '../lib/date-key.mjs';
import { insertMatch, participantMatches, todayMatches } from '../lib/matches.mjs';
import { createHarness, expectCode } from './helpers.mjs';

const actor = { kind: 'teacher', teacherId: 'fake_teacher_a' };

test('phase4-contract-01 日本時間23:59と翌日00:00を分離', () => {
  assert.equal(japanDateKey(Date.parse('2026-09-17T14:59:59Z')), '2026-09-17');
  assert.equal(japanDateKey(Date.parse('2026-09-17T15:00:00Z')), '2026-09-18');
});

test('phase4-contract-02 日本時間の今日をUTC日付で代用しない', () => {
  assert.equal(japanDateKey(Date.parse('2026-09-17T23:30:00Z')), '2026-09-18');
});

test('phase4-contract-03 実在する日付だけ受理', () => {
  assert.equal(requireDateKey('2028-02-29'), '2028-02-29');
  for (const invalid of ['', '2026-2-03', '2026-02-30', '2026-13-01', 'x'.repeat(200)]) {
    expectCode(() => requireDateKey(invalid), 'INVALID_MATCH_DATE', 400);
  }
});

test('phase4-contract-04 participant ID形式を制限', () => {
  assert.equal(requireParticipantId('fake_participant_01'), 'fake_participant_01');
  for (const invalid of ['', '../other', 'space value', 'x'.repeat(129)]) {
    expectCode(() => requireParticipantId(invalid), 'INVALID_PARTICIPANT_ID', 400);
  }
});

test('phase4-contract-05 公開用対局は許可した8項目だけ', () => {
  const h = createHarness();
  const match = todayMatches(h.db, actor, '2026-09-18')[0];
  assert.deepEqual(Object.keys(match), [
    'matchId', 'participantId', 'participantDisplayName', 'participantDisplayRank',
    'playedOn', 'playedAt', 'resultCode', 'handicapText',
  ]);
  assert.equal('teacher_id' in match, false);
  assert.equal('source_reference' in match, false);
  assert.equal('created_at' in match, false);
  h.close();
});

test('phase4-contract-06 1日16局を省略せず時刻順に返す', () => {
  const h = createHarness();
  const matches = todayMatches(h.db, actor, '2026-09-18');
  assert.equal(matches.length, 16);
  assert.equal(matches[0].matchId, 'fake_match_today_01');
  assert.equal(matches.at(-1).matchId, 'fake_match_today_16');
  h.close();
});

test('phase4-contract-07 未知の結果codeもデータ同一性を保つ', () => {
  const h = createHarness();
  const match = todayMatches(h.db, actor, '2026-09-18').find((item) => item.matchId === 'fake_match_today_15');
  assert.equal(match.resultCode, 'unknown_future_code');
  h.close();
});

test('phase4-contract-08 個人記録は新しい順で同一match IDを保持', () => {
  const h = createHarness();
  const matches = participantMatches(h.db, actor, 'fake_participant_same_1');
  assert.equal(matches[0].matchId, 'fake_match_today_16');
  assert.ok(matches.some((item) => item.matchId === 'fake_match_a_1'));
  assert.equal(new Set(matches.map((item) => item.matchId)).size, matches.length);
  h.close();
});

test('phase4-contract-09 同時刻でもmatch ID順で安定', () => {
  const h = createHarness();
  for (const matchId of ['fake_same_time_b', 'fake_same_time_a']) {
    insertMatch(h.db, {
      matchId, teacherId: 'fake_teacher_a', participantId: 'fake_participant_04',
      playedOn: '2026-09-19', playedAt: '10:00', resultCode: 'pending', handicapText: '3子局',
      sourceReference: `fake:manual:${matchId}:v1`, createdAt: h.now(),
    });
  }
  assert.deepEqual(todayMatches(h.db, actor, '2026-09-19').map((item) => item.matchId), ['fake_same_time_a', 'fake_same_time_b']);
  h.close();
});

test('phase4-contract-10 読み取りでmatch recordsを変更しない', () => {
  const h = createHarness();
  const before = h.db.prepare('SELECT COUNT(*) AS count, SUM(created_at) AS checksum FROM goencho_match_records').get();
  todayMatches(h.db, actor, '2026-09-18');
  participantMatches(h.db, actor, 'fake_participant_same_1');
  const after = h.db.prepare('SELECT COUNT(*) AS count, SUM(created_at) AS checksum FROM goencho_match_records').get();
  assert.deepEqual(after, before);
  h.close();
});
