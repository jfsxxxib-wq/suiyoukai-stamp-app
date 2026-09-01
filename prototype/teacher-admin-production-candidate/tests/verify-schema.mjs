import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec('PRAGMA foreign_keys = ON');

for (const path of ['drizzle/0000_needy_adam_destine.sql', 'drizzle/0001_teacher_admin_matches.sql']) {
  const migration = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  for (const statement of migration.split('--> statement-breakpoint')) {
    if (statement.trim()) db.exec(statement);
  }
}

const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name));
assert.ok(tables.has('teachers'));
assert.ok(tables.has('match_records'));
assert.ok(tables.has('match_record_audit'));
assert.equal(tables.has('test_receptions'), false);

const now = 1_788_163_200_000;
db.prepare('INSERT INTO teachers (id, display_name, active, created_at, updated_at) VALUES (?, ?, 1, ?, ?)')
  .run('aoba', '青葉先生', now, now);

const insertSql = `INSERT INTO match_records
  (id, played_on, played_at, participant_name, rank, teacher_id, handicap_type, stone_count,
   reverse_komi_half_points, reverse_komi_recipient, result, source, source_reference,
   created_by, updated_by, created_at, updated_at, version)
  VALUES (?, '2026-09-02', '10:00', '水曜 はなこ', '8級', 'aoba', ?, ?, ?, 'black',
   'participant_win', 'admin', ?, 'admin-1', 'admin-1', ?, ?, 1)`;
const insert = db.prepare(insertSql);
insert.run('valid', 'stones', 2, 13, 'source-valid', now, now);

for (const values of [
  ['bad-stones', 'stones', 1, 2, 'source-bad-stones', now, now],
  ['bad-pair', 'sen', 2, 2, 'source-bad-pair', now, now],
  ['bad-komi', 'sen', null, 0, 'source-bad-komi', now, now],
  ['duplicate-source', 'sen', null, 2, 'source-valid', now, now],
]) {
  assert.throws(() => insert.run(...values), /constraint/i);
}

const teacherPlan = db.prepare('EXPLAIN QUERY PLAN SELECT * FROM match_records WHERE teacher_id = ? AND played_on = ? ORDER BY played_at').all('aoba', '2026-09-02').map((row) => row.detail).join(' ');
const adminPlan = db.prepare('EXPLAIN QUERY PLAN SELECT * FROM match_records WHERE played_on = ? ORDER BY played_at').all('2026-09-02').map((row) => row.detail).join(' ');
assert.match(teacherPlan, /match_records_teacher_date_time_idx/);
assert.match(adminPlan, /match_records_date_time_idx/);

db.prepare("INSERT INTO match_record_audit (match_id, action, actor_id, snapshot_json, created_at) VALUES (?, 'create', ?, ?, ?)")
  .run('valid', 'admin-1', '{"id":"valid"}', now);
assert.equal(db.prepare("SELECT COUNT(*) AS count FROM match_record_audit WHERE match_id = 'valid'").get().count, 1);

console.log('Schema checks passed: constraints, indexes, foreign keys, and audit log are usable.');
