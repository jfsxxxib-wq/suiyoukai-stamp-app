import { GoenchoService } from '../../portability/goencho-service.mjs';

function allResults(result) {
  return Array.isArray(result?.results) ? result.results : [];
}

export class GoenchoD1Adapter {
  constructor(db) {
    if (!db || typeof db.prepare !== 'function' || typeof db.batch !== 'function') {
      throw new TypeError('D1 database binding is required');
    }
    this.db = db;
  }

  async schemaVersion() {
    const row = await this.db.prepare('SELECT version FROM schema_meta LIMIT 1').first();
    return Number(row?.version ?? 0);
  }

  findTeacherAuthContext({ sessionHash, deviceHash }) {
    return this.db.prepare(`SELECT s.session_id, s.status AS session_status,
        s.last_seen_at, s.device_authorization_id, d.teacher_id,
        d.status AS device_status, t.status AS teacher_status
      FROM goencho_teacher_sessions s
      JOIN goencho_teacher_device_authorizations d
        ON d.device_authorization_id = s.device_authorization_id
      JOIN goencho_teachers t ON t.teacher_id = d.teacher_id
      WHERE s.session_hash = ? AND d.token_hash = ?`)
      .bind(sessionHash, deviceHash)
      .first();
  }

  async lockTeacherSession({ sessionId, now }) {
    const result = await this.db.prepare(`UPDATE goencho_teacher_sessions
      SET status = 'locked', locked_at = ?
      WHERE session_id = ? AND status = 'active'`).bind(now, sessionId).run();
    return { affectedRows: Number(result?.meta?.changes ?? 0) };
  }

  async touchTeacherAuth({ sessionId, authorizationId, now }) {
    const results = await this.db.batch([
      this.db.prepare('UPDATE goencho_teacher_sessions SET last_seen_at = ? WHERE session_id = ?')
        .bind(now, sessionId),
      this.db.prepare(`UPDATE goencho_teacher_device_authorizations
        SET last_seen_at = ? WHERE device_authorization_id = ?`)
        .bind(now, authorizationId),
    ]);
    return { affectedRows: results.reduce((sum, result) => sum + Number(result?.meta?.changes ?? 0), 0) };
  }

  async selectMatchesByDate({ teacherId, playedOn }) {
    const result = await this.db.prepare(`SELECT m.match_id, m.participant_id, m.played_on, m.played_at,
        m.result_code, m.handicap_text, p.display_name, p.display_rank
      FROM goencho_match_records m
      JOIN goencho_participants p ON p.participant_id = m.participant_id
      WHERE m.teacher_id = ? AND m.played_on = ?
      ORDER BY m.played_at, m.match_id`).bind(teacherId, playedOn).all();
    return allResults(result);
  }

  async selectMatchDates({ teacherId }) {
    const result = await this.db.prepare(`SELECT played_on, COUNT(*) AS match_count
      FROM goencho_match_records
      WHERE teacher_id = ?
      GROUP BY played_on
      ORDER BY played_on DESC`).bind(teacherId).all();
    return allResults(result);
  }

  async selectParticipantMatches({ teacherId, participantId }) {
    const result = await this.db.prepare(`SELECT m.match_id, m.participant_id, m.played_on, m.played_at,
        m.result_code, m.handicap_text, p.display_name, p.display_rank
      FROM goencho_match_records m
      JOIN goencho_participants p ON p.participant_id = m.participant_id
      WHERE m.teacher_id = ? AND m.participant_id = ?
      ORDER BY m.played_on DESC, m.played_at DESC, m.match_id`)
      .bind(teacherId, participantId)
      .all();
    return allResults(result);
  }

  async insertMatch(record) {
    const result = await this.db.prepare(`INSERT INTO goencho_match_records
      (match_id, teacher_id, participant_id, played_on, played_at,
       result_code, handicap_text, source_reference, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        record.matchId,
        record.teacherId,
        record.participantId,
        record.playedOn,
        record.playedAt,
        record.resultCode,
        record.handicapText,
        record.sourceReference,
        record.createdAt,
      )
      .run();
    return { matchId: record.matchId, affectedRows: Number(result?.meta?.changes ?? 0) };
  }
}

// Compatibility facade: callers keep the public methods while D1 APIs stay in the adapter.
export class GoenchoD1Repository extends GoenchoService {
  constructor(db) {
    super(new GoenchoD1Adapter(db));
  }
}
