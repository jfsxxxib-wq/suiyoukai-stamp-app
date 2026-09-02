import test from 'node:test';
import assert from 'node:assert/strict';
import { formatHandicap, formatPointsFromHalfPoints, normalizeMatchInput } from '../lib/match-domain.mjs';

const base = {
  participantName: ' 桜井 こよみ ',
  rank: ' 初段 ',
  teacherId: 'wakamatsu',
  playedOn: '2026-09-02',
  playedAt: '11:30',
  handicapType: 'sen',
  stoneCount: null,
  result: 'jigo',
};

test('逆コミを半目単位の整数へ変換し、受取人を黒に固定する', () => {
  const result = normalizeMatchInput({ ...base, reverseKomi: '6.5' });
  assert.equal(result.ok, true);
  assert.equal(result.value.reverseKomiHalfPoints, 13);
  assert.equal(result.value.reverseKomiRecipient, 'black');
});

test('0.5目単位でない逆コミを拒否する', () => {
  const result = normalizeMatchInput({ ...base, reverseKomi: '3.2' });
  assert.equal(result.ok, false);
  assert.match(result.message, /0\.5目単位/);
});

test('先と置き石を別の値として検証する', () => {
  const sen = normalizeMatchInput({ ...base, reverseKomi: '', handicapType: 'sen', stoneCount: 8 });
  const stones = normalizeMatchInput({ ...base, reverseKomi: '3', handicapType: 'stones', stoneCount: 2 });
  assert.deepEqual({ type: sen.value.handicapType, stones: sen.value.stoneCount }, { type: 'sen', stones: null });
  assert.deepEqual({ type: stones.value.handicapType, stones: stones.value.stoneCount }, { type: 'stones', stones: 2 });
});

test('囲碁らしい逆コミ表記へ変換する', () => {
  assert.equal(formatPointsFromHalfPoints(6), '3目');
  assert.equal(formatPointsFromHalfPoints(13), '6目半');
  assert.equal(formatHandicap({ handicapType: 'stones', stoneCount: 2, reverseKomiHalfPoints: 6 }), '2子局・逆コミ3目');
  assert.equal(formatHandicap({ handicapType: 'sen', stoneCount: null, reverseKomiHalfPoints: 13 }), '先・逆コミ6目半');
});

test('勝敗は決められた三種類だけを保存する', () => {
  assert.equal(normalizeMatchInput({ ...base, reverseKomi: '', result: 'participant_win' }).ok, true);
  assert.equal(normalizeMatchInput({ ...base, reverseKomi: '', result: 'participant_loss' }).ok, true);
  assert.equal(normalizeMatchInput({ ...base, reverseKomi: '', result: 'jigo' }).ok, true);
  assert.equal(normalizeMatchInput({ ...base, reverseKomi: '', result: '先生の勝ち' }).ok, false);
});
