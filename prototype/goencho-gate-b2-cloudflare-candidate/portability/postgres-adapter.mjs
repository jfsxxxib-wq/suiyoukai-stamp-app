export class GoenchoPostgresAdapter {
  constructor(client) {
    if (!client || typeof client.query !== 'function' || typeof client.transaction !== 'function') {
      throw new TypeError('Postgres client is required');
    }
    this.client = client;
  }

  async schemaVersion() {
    const result = await this.client.query('SELECT version FROM schema_meta LIMIT 1');
    return Number(result.rows[0]?.version ?? 0);
  }

  async findTeacherAuthContext({ sessionHash, deviceHash }) {
    const result = await this.client.query(`SELECT s.session_id, s.status AS session_status,
        s.last_seen_at, s.device_authorization_id, d.teacher_id,
        d.status AS device_status, t.status AS teacher_status
      FROM goencho_teacher_sessions s
      JOIN goencho_teacher_device_authorizations d
        ON d.device_authorization_id = s.device_authorization_id
      JOIN goencho_teachers t ON t.teacher_id = d.teacher_id
      WHERE s.session_hash = $1 AND d.token_hash = $2`, [sessionHash, deviceHash]);
    return result.rows[0] ?? null;
  }

  async lockTeacherSession({ sessionId, now }) {
    const result = await this.client.query(`UPDATE goencho_teacher_sessions
      SET status = 'locked', locked_at = $1
      WHERE session_id = $2 AND status = 'active'`, [now, sessionId]);
    return { affectedRows: Number(result.affectedRows ?? result.rowCount ?? 0) };
  }

  async touchTeacherAuth({ sessionId, authorizationId, now }) {
    return this.client.transaction(async (tx) => {
      const session = await tx.query(
        'UPDATE goencho_teacher_sessions SET last_seen_at = $1 WHERE session_id = $2',
        [now, sessionId],
      );
      const device = await tx.query(`UPDATE goencho_teacher_device_authorizations
        SET last_seen_at = $1 WHERE device_authorization_id = $2`, [now, authorizationId]);
      return {
        affectedRows: Number(session.affectedRows ?? session.rowCount ?? 0)
          + Number(device.affectedRows ?? device.rowCount ?? 0),
      };
    });
  }

  async selectMatchesByDate({ teacherId, playedOn }) {
    const result = await this.client.query(`SELECT m.match_id, m.participant_id, m.played_on, m.played_at,
        m.result_code, m.handicap_text, p.display_name, p.display_rank
      FROM goencho_match_records m
      JOIN goencho_participants p ON p.participant_id = m.participant_id
      WHERE m.teacher_id = $1 AND m.played_on = $2
      ORDER BY m.played_at, m.match_id`, [teacherId, playedOn]);
    return result.rows;
  }

  async selectMatchDates({ teacherId }) {
    const result = await this.client.query(`SELECT played_on, COUNT(*) AS match_count
      FROM goencho_match_records
      WHERE teacher_id = $1
      GROUP BY played_on
      ORDER BY played_on DESC`, [teacherId]);
    return result.rows;
  }

  async selectParticipantMatches({ teacherId, participantId }) {
    const result = await this.client.query(`SELECT m.match_id, m.participant_id, m.played_on, m.played_at,
        m.result_code, m.handicap_text, p.display_name, p.display_rank
      FROM goencho_match_records m
      JOIN goencho_participants p ON p.participant_id = m.participant_id
      WHERE m.teacher_id = $1 AND m.participant_id = $2
      ORDER BY m.played_on DESC, m.played_at DESC, m.match_id`, [teacherId, participantId]);
    return result.rows;
  }

  async insertMatch(record) {
    const result = await this.client.query(`INSERT INTO goencho_match_records
      (match_id, teacher_id, participant_id, played_on, played_at,
       result_code, handicap_text, source_reference, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [
      record.matchId,
      record.teacherId,
      record.participantId,
      record.playedOn,
      record.playedAt,
      record.resultCode,
      record.handicapText,
      record.sourceReference,
      record.createdAt,
    ]);
    return {
      matchId: record.matchId,
      affectedRows: Number(result.affectedRows ?? result.rowCount ?? 0),
    };
  }
}
