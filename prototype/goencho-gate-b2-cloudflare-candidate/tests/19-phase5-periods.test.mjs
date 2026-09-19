import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AFTERNOON_START_MINUTES,
  groupMatchesByPeriod,
  matchPeriod,
  playedAtMinutes,
} from '../public/shared/match-periods.js';
import { todayMatches } from '../lib/matches.mjs';
import { createHarness } from './helpers.mjs';

const actor = { kind: 'teacher', teacherId: 'fake_teacher_a' };

test('phase5-period-01 仮境界は12時ちょうど', () => {
  assert.equal(AFTERNOON_START_MINUTES, 720);
  assert.equal(matchPeriod('00:00'), 'morning');
  assert.equal(matchPeriod('11:59'), 'morning');
  assert.equal(matchPeriod('12:00'), 'afternoon');
  assert.equal(matchPeriod('23:59'), 'afternoon');
});

test('phase5-period-02 境界は1か所の引数で変更可能', () => {
  assert.equal(matchPeriod('12:59', 13 * 60), 'morning');
  assert.equal(matchPeriod('13:00', 13 * 60), 'afternoon');
});

test('phase5-period-03 HH:MMだけを時刻として受理', () => {
  assert.equal(playedAtMinutes('09:30'), 570);
  for (const value of [null, undefined, '', '9:30', ' 09:30', '09:30 ', '24:00', '12:60', '2026-09-18T09:30']) {
    assert.equal(playedAtMinutes(value), null, String(value));
    assert.equal(matchPeriod(value), 'unconfirmed', String(value));
  }
});

test('phase5-period-04 不正な境界を拒否', () => {
  for (const boundary of [0, 1440, -1, 720.5, '720']) {
    assert.throws(() => matchPeriod('09:30', boundary), RangeError);
  }
});

test('phase5-period-05 16局を午前7局・午後9局へ分ける', () => {
  const h = createHarness();
  const matches = todayMatches(h.db, actor, '2026-09-18');
  const groups = groupMatchesByPeriod(matches);
  assert.equal(groups.morning.length, 7);
  assert.equal(groups.afternoon.length, 9);
  assert.equal(groups.unconfirmed.length, 0);
  assert.equal(groups.morning[0].matchId, 'fake_match_today_01');
  assert.equal(groups.afternoon[0].matchId, 'fake_match_today_08');
  assert.equal(groups.afternoon[0].playedAt, '12:00');
  h.close();
});

test('phase5-period-06 欠落・重複なく1グループだけへ分類', () => {
  const h = createHarness();
  const matches = todayMatches(h.db, actor, '2026-09-18');
  const groups = groupMatchesByPeriod(matches);
  const grouped = [...groups.morning, ...groups.afternoon, ...groups.unconfirmed];
  assert.equal(grouped.length, matches.length);
  assert.equal(new Set(grouped.map((match) => match.matchId)).size, matches.length);
  assert.deepEqual(new Set(grouped.map((match) => match.matchId)), new Set(matches.map((match) => match.matchId)));
  h.close();
});

test('phase5-period-07 入力配列と対局objectを変更しない', () => {
  const matches = [{ matchId: 'fake_a', playedAt: '13:00' }, { matchId: 'fake_b', playedAt: '09:00' }];
  const before = JSON.stringify(matches);
  groupMatchesByPeriod(matches);
  assert.equal(JSON.stringify(matches), before);
});

test('phase5-period-08 片方0局と0件を保持', () => {
  assert.deepEqual(groupMatchesByPeriod([{ matchId: 'a', playedAt: '13:00' }]).morning, []);
  assert.deepEqual(groupMatchesByPeriod([{ matchId: 'a', playedAt: '09:00' }]).afternoon, []);
  assert.deepEqual(groupMatchesByPeriod([]), { morning: [], afternoon: [], unconfirmed: [] });
});

test('phase5-period-09 同時刻のAPI順序を維持', () => {
  const matches = [{ matchId: 'fake_a', playedAt: '10:00' }, { matchId: 'fake_b', playedAt: '10:00' }];
  assert.deepEqual(groupMatchesByPeriod(matches).morning.map((match) => match.matchId), ['fake_a', 'fake_b']);
});

test('phase5-period-10 時刻不正を消さず専用groupへ保持', () => {
  const invalid = { matchId: 'fake_invalid', playedAt: '25:10' };
  const groups = groupMatchesByPeriod([invalid]);
  assert.deepEqual(groups.unconfirmed, [invalid]);
});

test('phase5-period-11 配列以外を拒否', () => {
  assert.throws(() => groupMatchesByPeriod(null), TypeError);
});
