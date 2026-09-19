import { requireDateKey, requireParticipantId } from '../lib/date-key.mjs';
import { fail } from '../lib/errors.mjs';
import { hmacHex } from '../cloudflare/src/web-crypto.mjs';
import { assertGoenchoDbContract } from './db-contract.mjs';

function requireTeacher(actor) {
  if (actor?.kind !== 'teacher' || !actor.teacherId) {
    fail(401, 'TEACHER_AUTH_REQUIRED', 'Teacher auth required');
  }
}

function publicMatch(row) {
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

export class GoenchoService {
  constructor(adapter) {
    this.adapter = assertGoenchoDbContract(adapter);
  }

  schemaVersion() {
    return this.adapter.schemaVersion();
  }

  async resolveTeacherActor({
    deviceToken,
    sessionToken,
    deviceHmacKey,
    sessionHmacKey,
    now,
    inactivityMs,
  }) {
    if (!deviceToken || !sessionToken) fail(401, 'TEACHER_AUTH_REQUIRED', 'Teacher auth required');
    const [deviceHash, sessionHash] = await Promise.all([
      hmacHex(deviceHmacKey, deviceToken),
      hmacHex(sessionHmacKey, sessionToken),
    ]);
    const row = await this.adapter.findTeacherAuthContext({ sessionHash, deviceHash });
    if (!row) fail(401, 'TEACHER_AUTH_REQUIRED', 'Teacher auth required');
    if (row.teacher_status !== 'active') fail(403, 'TEACHER_INACTIVE', 'Teacher is inactive');
    if (row.device_status !== 'approved' || row.session_status !== 'active') {
      fail(401, 'TEACHER_AUTH_REQUIRED', 'Teacher auth required');
    }
    if (now - Number(row.last_seen_at) >= inactivityMs) {
      await this.adapter.lockTeacherSession({ sessionId: row.session_id, now });
      fail(401, 'SESSION_LOCKED', 'Session is locked');
    }
    await this.adapter.touchTeacherAuth({
      sessionId: row.session_id,
      authorizationId: row.device_authorization_id,
      now,
    });
    return {
      kind: 'teacher',
      teacherId: row.teacher_id,
      authorizationId: row.device_authorization_id,
      sessionId: row.session_id,
    };
  }

  async todayMatches(actor, playedOn) {
    requireTeacher(actor);
    requireDateKey(playedOn);
    return (await this.adapter.selectMatchesByDate({
      teacherId: actor.teacherId,
      playedOn,
    })).map(publicMatch);
  }

  async matchDates(actor) {
    requireTeacher(actor);
    return (await this.adapter.selectMatchDates({ teacherId: actor.teacherId })).map((row) => ({
      playedOn: row.played_on,
      matchCount: Number(row.match_count),
    }));
  }

  matchesByDate(actor, playedOn) {
    return this.todayMatches(actor, playedOn);
  }

  async participantMatches(actor, participantId) {
    requireTeacher(actor);
    requireParticipantId(participantId);
    return (await this.adapter.selectParticipantMatches({
      teacherId: actor.teacherId,
      participantId,
    })).map(publicMatch);
  }

  insertMatch(record) {
    return this.adapter.insertMatch(record);
  }
}
