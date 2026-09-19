import test from 'node:test';
import assert from 'node:assert/strict';
import { insertMatch, matchDates, matchesByDate, participantMatches, todayMatches } from '../lib/matches.mjs';
import { createHarness } from './helpers.mjs';

function actor(teacherId) { return { kind: 'teacher', teacherId }; }

test('match-01 同じ先生・参加者・同日に2局保持', () => {
  const h = createHarness();
  const rows = todayMatches(h.db, actor('fake_teacher_a'), '2026-09-17').filter((row) => row.participantId === 'fake_participant_same_1');
  assert.equal(rows.length, 2);
  assert.notEqual(rows[0].matchId, rows[1].matchId);
  h.close();
});

test('match-02 同姓同名はparticipant_idで分離', () => {
  const h = createHarness();
  const one = participantMatches(h.db, actor('fake_teacher_a'), 'fake_participant_same_1');
  const two = participantMatches(h.db, actor('fake_teacher_a'), 'fake_participant_same_2');
  assert.equal(one[0].participantDisplayName, two[0].participantDisplayName);
  assert.notEqual(one[0].participantId, two[0].participantId);
  h.close();
});

test('match-03 同じ参加者の複数先生記録が混ざらない', () => {
  const h = createHarness();
  const a = participantMatches(h.db, actor('fake_teacher_a'), 'fake_participant_shared');
  const b = participantMatches(h.db, actor('fake_teacher_b'), 'fake_participant_shared');
  assert.deepEqual(a.map((row) => row.matchId), ['fake_match_today_03', 'fake_match_shared_a']);
  assert.deepEqual(b.map((row) => row.matchId), ['fake_match_shared_b']);
  h.close();
});

test('match-04 個人記録はteacher_id + participant_idで分離', () => {
  const h = createHarness();
  assert.equal(participantMatches(h.db, actor('fake_teacher_b'), 'fake_participant_same_1').length, 0);
  assert.equal(participantMatches(h.db, actor('fake_teacher_a'), 'fake_participant_same_1').length, 5);
  h.close();
});

test('match-05 過去日付一覧は先生ごとの件数', () => {
  const h = createHarness();
  const dates = matchDates(h.db, actor('fake_teacher_a'));
  assert.deepEqual(dates.map((row) => [row.playedOn, row.matchCount]), [['2026-09-18', 16], ['2026-09-17', 4], ['2026-09-10', 1]]);
  h.close();
});

test('match-06 今日・過去・個人が同じmatch_idを参照', () => {
  const h = createHarness();
  const expected = 'fake_match_a_1';
  assert.ok(todayMatches(h.db, actor('fake_teacher_a'), '2026-09-17').some((row) => row.matchId === expected));
  assert.ok(matchesByDate(h.db, actor('fake_teacher_a'), '2026-09-17').some((row) => row.matchId === expected));
  assert.ok(participantMatches(h.db, actor('fake_teacher_a'), 'fake_participant_same_1').some((row) => row.matchId === expected));
  h.close();
});

test('match-07 match_id重複を拒否', () => {
  const h = createHarness();
  assert.throws(() => insertMatch(h.db, {
    matchId: 'fake_match_a_1', teacherId: 'fake_teacher_a', participantId: 'fake_participant_same_1',
    playedOn: '2026-09-18', playedAt: '09:00', resultCode: 'pending', handicapText: '5子局',
    sourceReference: 'fake:manual:new:v1', createdAt: h.now(),
  }), /UNIQUE/);
  h.close();
});

test('match-08 source_reference重複を拒否', () => {
  const h = createHarness();
  assert.throws(() => insertMatch(h.db, {
    matchId: 'fake_match_new', teacherId: 'fake_teacher_a', participantId: 'fake_participant_same_1',
    playedOn: '2026-09-18', playedAt: '09:00', resultCode: 'pending', handicapText: '5子局',
    sourceReference: 'fake:manual:a-1:v1', createdAt: h.now(),
  }), /UNIQUE/);
  h.close();
});

test('match-09 teacher actor以外は取得不可', () => {
  const h = createHarness();
  assert.throws(() => todayMatches(h.db, { kind: 'owner' }, '2026-09-17'), (error) => error.code === 'TEACHER_AUTH_REQUIRED');
  h.close();
});

test('match-10 先生兼リーグ参加者は別ID対応表のみ', () => {
  const h = createHarness();
  h.db.prepare(`INSERT INTO goencho_verified_person_links
    (link_id, teacher_id, participant_id, league_member_id, verified_by_operator_id, verified_at)
    VALUES ('test_link_1', 'fake_teacher_member', 'fake_participant_member', 'fake_league_member_77', ?, ?)`)
    .run(h.ownerActor.operatorId, h.now());
  const link = h.db.prepare('SELECT * FROM goencho_verified_person_links WHERE link_id = ?').get('test_link_1');
  assert.notEqual(link.teacher_id, link.league_member_id);
  assert.notEqual(link.participant_id, link.league_member_id);
  h.close();
});
