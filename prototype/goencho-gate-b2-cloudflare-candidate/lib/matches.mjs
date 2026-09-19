import { fail } from './errors.mjs';
import { requireDateKey, requireParticipantId } from './date-key.mjs';

function requireTeacher(actor) {
  if (actor?.kind !== 'teacher' || !actor.teacherId) fail(401, 'TEACHER_AUTH_REQUIRED', 'Teacher auth required');
}

export function todayMatches(db, actor, playedOn) {
  requireTeacher(actor);
  requireDateKey(playedOn);
  return db.prepare(`SELECT m.match_id, m.participant_id, m.played_on, m.played_at,
      m.result_code, m.handicap_text, p.display_name, p.display_rank
    FROM goencho_match_records m JOIN goencho_participants p ON p.participant_id = m.participant_id
    WHERE m.teacher_id = ? AND m.played_on = ? ORDER BY m.played_at, m.match_id`).all(actor.teacherId, playedOn)
    .map(toPublicMatch);
}

export function matchDates(db, actor) {
  requireTeacher(actor);
  return db.prepare(`SELECT played_on, COUNT(*) AS match_count
    FROM goencho_match_records WHERE teacher_id = ? GROUP BY played_on ORDER BY played_on DESC`).all(actor.teacherId)
    .map((row) => ({ playedOn: row.played_on, matchCount: Number(row.match_count) }));
}

export function matchesByDate(db, actor, playedOn) {
  return todayMatches(db, actor, playedOn);
}

export function participantMatches(db, actor, participantId) {
  requireTeacher(actor);
  requireParticipantId(participantId);
  return db.prepare(`SELECT m.match_id, m.participant_id, m.played_on, m.played_at,
      m.result_code, m.handicap_text, p.display_name, p.display_rank
    FROM goencho_match_records m JOIN goencho_participants p ON p.participant_id = m.participant_id
    WHERE m.teacher_id = ? AND m.participant_id = ?
    ORDER BY m.played_on DESC, m.played_at DESC, m.match_id`).all(actor.teacherId, participantId)
    .map(toPublicMatch);
}

export function toPublicMatch(row) {
  return {
    matchId: row.match_id,
    participantId: row.participant_id,
    participantDisplayName: row.display_name,
    participantDisplayRank: row.display_rank ?? '',
    playedOn: row.played_on,
    playedAt: row.played_at,
    resultCode: row.result_code,
    handicapText: row.handicap_text,
  };
}

export function insertMatch(db, record) {
  db.prepare(`INSERT INTO goencho_match_records
    (match_id, teacher_id, participant_id, played_on, played_at, result_code, handicap_text, source_reference, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(record.matchId, record.teacherId, record.participantId, record.playedOn, record.playedAt,
      record.resultCode, record.handicapText, record.sourceReference, record.createdAt);
  return record.matchId;
}
