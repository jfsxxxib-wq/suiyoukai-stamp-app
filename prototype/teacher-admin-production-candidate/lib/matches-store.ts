export type MatchRow = {
  id: string;
  played_on: string;
  played_at: string | null;
  participant_id: string | null;
  participant_name: string;
  rank: string | null;
  teacher_id: string;
  teacher_name: string;
  handicap_type: 'sen' | 'stones' | null;
  stone_count: number | null;
  reverse_komi_half_points: number | null;
  reverse_komi_recipient: 'black';
  result: 'participant_win' | 'participant_loss' | 'jigo' | null;
  source: 'app' | 'admin';
  created_at: number;
  updated_at: number;
  version: number;
};

type NormalizedMatch = {
  participantName: string;
  rank: string | null;
  teacherId: string;
  playedOn: string;
  playedAt: string | null;
  handicapType: 'sen' | 'stones' | null;
  stoneCount: number | null;
  reverseKomiHalfPoints: number | null;
  reverseKomiRecipient: 'black';
  result: 'participant_win' | 'participant_loss' | 'jigo' | null;
};

export function todayInJapan(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function presentMatch(row: MatchRow) {
  return {
    id: row.id,
    playedOn: row.played_on,
    playedAt: row.played_at,
    participantId: row.participant_id,
    participantName: row.participant_name,
    rank: row.rank,
    teacherId: row.teacher_id,
    teacherName: row.teacher_name,
    handicapType: row.handicap_type,
    stoneCount: row.stone_count,
    reverseKomiHalfPoints: row.reverse_komi_half_points,
    reverseKomiRecipient: row.reverse_komi_recipient,
    result: row.result,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version,
  };
}

export async function listTeachers(db: D1Database) {
  const result = await db.prepare(
    `SELECT id, display_name AS displayName
     FROM teachers WHERE active = 1 ORDER BY display_name`,
  ).all<{ id: string; displayName: string }>();
  return result.results;
}

export async function listMatches(db: D1Database, playedOn: string, teacherId?: string) {
  const base = `SELECT m.id, m.played_on, m.played_at, m.participant_id, m.participant_name,
      m.rank, m.teacher_id, t.display_name AS teacher_name, m.handicap_type, m.stone_count,
      m.reverse_komi_half_points, m.reverse_komi_recipient, m.result, m.source,
      m.created_at, m.updated_at, m.version
    FROM match_records m
    JOIN teachers t ON t.id = m.teacher_id
    WHERE m.played_on = ?`;
  const statement = teacherId
    ? db.prepare(`${base} AND m.teacher_id = ? ORDER BY m.played_at IS NULL, m.played_at, m.created_at`).bind(playedOn, teacherId)
    : db.prepare(`${base} ORDER BY m.played_at IS NULL, m.played_at, m.created_at`).bind(playedOn);
  const result = await statement.all<MatchRow>();
  return result.results.map(presentMatch);
}

export async function teacherName(db: D1Database, teacherId: string) {
  return db.prepare('SELECT display_name AS displayName FROM teachers WHERE id = ? AND active = 1 LIMIT 1')
    .bind(teacherId)
    .first<{ displayName: string }>();
}

export async function createAdminMatch(db: D1Database, actorId: string, value: NormalizedMatch) {
  await assertTeacher(db, value.teacherId);
  await assertNoDuplicate(db, value, null);
  const now = Date.now();
  const id = crypto.randomUUID();
  const snapshot = { id, ...value, source: 'admin', version: 1 };

  await db.batch([
    db.prepare(
      `INSERT INTO match_records
       (id, played_on, played_at, participant_name, rank, teacher_id, handicap_type, stone_count,
        reverse_komi_half_points, reverse_komi_recipient, result, source, created_by, updated_by,
        created_at, updated_at, version)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'black', ?, 'admin', ?, ?, ?, ?, 1)`,
    ).bind(
      id, value.playedOn, value.playedAt, value.participantName, value.rank, value.teacherId,
      value.handicapType, value.stoneCount, value.reverseKomiHalfPoints, value.result,
      actorId, actorId, now, now,
    ),
    db.prepare(
      `INSERT INTO match_record_audit (match_id, action, actor_id, snapshot_json, created_at)
       VALUES (?, 'create', ?, ?, ?)`,
    ).bind(id, actorId, JSON.stringify(snapshot), now),
  ]);
  return id;
}

export async function updateAdminMatch(
  db: D1Database,
  actorId: string,
  id: string,
  expectedVersion: number,
  value: NormalizedMatch,
) {
  const current = await db.prepare('SELECT version FROM match_records WHERE id = ? LIMIT 1')
    .bind(id)
    .first<{ version: number }>();
  if (!current) throw storeError('not-found', '訂正する対局が見つかりません。');
  if (current.version !== expectedVersion) throw storeError('conflict', '別の画面で先に訂正されています。名簿を読み直してください。');

  await assertTeacher(db, value.teacherId);
  await assertNoDuplicate(db, value, id);
  const now = Date.now();
  const nextVersion = current.version + 1;
  const snapshot = { id, ...value, version: nextVersion };

  await db.batch([
    db.prepare(
      `UPDATE match_records SET played_on = ?, played_at = ?, participant_name = ?, rank = ?,
       teacher_id = ?, handicap_type = ?, stone_count = ?, reverse_komi_half_points = ?,
       reverse_komi_recipient = 'black', result = ?, updated_by = ?, updated_at = ?, version = ?
       WHERE id = ? AND version = ?`,
    ).bind(
      value.playedOn, value.playedAt, value.participantName, value.rank, value.teacherId,
      value.handicapType, value.stoneCount, value.reverseKomiHalfPoints, value.result,
      actorId, now, nextVersion, id, expectedVersion,
    ),
    db.prepare(
      `INSERT INTO match_record_audit (match_id, action, actor_id, snapshot_json, created_at)
       VALUES (?, 'update', ?, ?, ?)`,
    ).bind(id, actorId, JSON.stringify(snapshot), now),
  ]);
}

async function assertTeacher(db: D1Database, teacherId: string) {
  const teacher = await db.prepare('SELECT id FROM teachers WHERE id = ? AND active = 1 LIMIT 1')
    .bind(teacherId)
    .first();
  if (!teacher) throw storeError('teacher-not-found', '担当の先生が見つかりません。');
}

async function assertNoDuplicate(db: D1Database, value: NormalizedMatch, excludingId: string | null) {
  const duplicate = excludingId
    ? await db.prepare(
        `SELECT id FROM match_records
         WHERE played_on = ? AND teacher_id = ? AND participant_name = ? AND id <> ? LIMIT 1`,
      ).bind(value.playedOn, value.teacherId, value.participantName, excludingId).first()
    : await db.prepare(
        `SELECT id FROM match_records
         WHERE played_on = ? AND teacher_id = ? AND participant_name = ? LIMIT 1`,
      ).bind(value.playedOn, value.teacherId, value.participantName).first();
  if (duplicate) throw storeError('duplicate', '同じ日・お名前・先生の行があります。追加せず、既存の行を訂正してください。');
}

function storeError(code: string, message: string) {
  return Object.assign(new Error(message), { code });
}
