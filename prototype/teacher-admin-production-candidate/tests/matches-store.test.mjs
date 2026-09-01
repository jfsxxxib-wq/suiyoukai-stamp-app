import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import ts from 'typescript';

const storeSource = readFileSync(new URL('../lib/matches-store.ts', import.meta.url), 'utf8');
const storeJavaScript = ts.transpileModule(storeSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { createAdminMatch, listMatches, updateAdminMatch } = await import(
  `data:text/javascript;base64,${Buffer.from(storeJavaScript).toString('base64')}`
);

class Statement {
  constructor(database, sql, values = []) { this.database = database; this.sql = sql; this.values = values; }
  bind(...values) { return new Statement(this.database, this.sql, values); }
  async first() { return this.database.prepare(this.sql).get(...this.values) ?? null; }
  async all() { return { results: this.database.prepare(this.sql).all(...this.values) }; }
  async run() {
    const result = this.database.prepare(this.sql).run(...this.values);
    return { success: true, meta: { changes: Number(result.changes) } };
  }
}

class TestD1 {
  constructor() { this.database = new DatabaseSync(':memory:'); }
  prepare(sql) { return new Statement(this.database, sql); }
  async batch(statements) { return Promise.all(statements.map((statement) => statement.run())); }
}

function database() {
  const adapter = new TestD1();
  adapter.database.exec('PRAGMA foreign_keys = ON');
  for (const path of ['../drizzle/0000_needy_adam_destine.sql', '../drizzle/0001_teacher_admin_matches.sql']) {
    const migration = readFileSync(new URL(path, import.meta.url), 'utf8');
    for (const statement of migration.split('--> statement-breakpoint')) if (statement.trim()) adapter.database.exec(statement);
  }
  const now = Date.now();
  adapter.database.prepare('INSERT INTO teachers (id, display_name, active, created_at, updated_at) VALUES (?, ?, 1, ?, ?)').run('aoba', '青葉先生', now, now);
  adapter.database.prepare('INSERT INTO teachers (id, display_name, active, created_at, updated_at) VALUES (?, ?, 1, ?, ?)').run('wakamatsu', '若松先生', now, now);
  return adapter;
}

const match = {
  participantName: '水曜 はなこ', rank: '8級', teacherId: 'aoba', playedOn: '2026-09-02', playedAt: '10:00',
  handicapType: 'stones', stoneCount: 2, reverseKomiHalfPoints: 13,
  reverseKomiRecipient: 'black', result: 'participant_win',
};

test('管理者追加、先生別取得、訂正、変更履歴が一連で動く', async () => {
  const adapter = database();
  const id = await createAdminMatch(adapter, 'admin-1', match);
  const aoba = await listMatches(adapter, '2026-09-02', 'aoba');
  const wakamatsu = await listMatches(adapter, '2026-09-02', 'wakamatsu');
  assert.equal(aoba.length, 1);
  assert.equal(aoba[0].reverseKomiHalfPoints, 13);
  assert.equal(aoba[0].reverseKomiRecipient, 'black');
  assert.equal(wakamatsu.length, 0);

  await updateAdminMatch(adapter, 'admin-2', id, 1, { ...match, result: 'participant_loss' });
  const updated = await listMatches(adapter, '2026-09-02', 'aoba');
  assert.equal(updated[0].result, 'participant_loss');
  assert.equal(updated[0].version, 2);
  assert.equal(adapter.database.prepare('SELECT COUNT(*) AS count FROM match_record_audit WHERE match_id = ?').get(id).count, 2);
});

test('同じ日・参加者・先生の重複追加を拒否する', async () => {
  const adapter = database();
  await createAdminMatch(adapter, 'admin-1', match);
  await assert.rejects(() => createAdminMatch(adapter, 'admin-1', match), /同じ日/);
});

test('古い版からの上書きを拒否する', async () => {
  const adapter = database();
  const id = await createAdminMatch(adapter, 'admin-1', match);
  await updateAdminMatch(adapter, 'admin-1', id, 1, { ...match, rank: '7級' });
  await assert.rejects(() => updateAdminMatch(adapter, 'admin-2', id, 1, { ...match, rank: '6級' }), /先に訂正/);
});
