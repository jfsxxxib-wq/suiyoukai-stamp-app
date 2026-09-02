import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/linkage-store.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const store = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`);

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
  for (const path of ['../drizzle/0000_needy_adam_destine.sql', '../drizzle/0001_teacher_admin_matches.sql', '../drizzle/0002_harsh_invisible_woman.sql']) {
    const migration = readFileSync(new URL(path, import.meta.url), 'utf8');
    for (const statement of migration.split('--> statement-breakpoint')) if (statement.trim()) adapter.database.exec(statement);
  }
  return adapter;
}

test('連携券は一度だけ使え、スタンプ同期は二重加算しない', async () => {
  const db = database();
  await store.resetLinkageDemo(db, 'admin-1');
  const issued = await store.issueLinkTicket(db, 'p-003', 'admin-1');
  const linked = await store.redeemLinkTicket(db, issued.ticket, '31415926');
  assert.equal(linked.receptionNumber, '20260902-003');
  await assert.rejects(() => store.redeemLinkTicket(db, issued.ticket, '27182818'), /使用済み/);

  const first = await store.syncPendingStamps(db, '31415926');
  const second = await store.syncPendingStamps(db, '31415926');
  assert.equal(first.appliedCount, 1);
  assert.equal(first.total, 1);
  assert.equal(second.appliedCount, 0);
  assert.equal(second.total, 1);

  const overview = await store.listLinkageOverview(db);
  const participant = overview.participants.find((item) => item.id === 'p-003');
  assert.equal(participant.appNumber, '31415926');
  assert.equal(participant.linkStatus, '連携済み');
  assert.equal(participant.stampStatus, '反映済み');
  assert.match(JSON.stringify(overview.mirror.find((item) => item.receptionId === 'p-003')?.row), /31415926/);
});

test('8桁以外の個人番号は連携前に拒否する', async () => {
  const db = database();
  await store.resetLinkageDemo(db, 'admin-1');
  const issued = await store.issueLinkTicket(db, 'p-003', 'admin-1');
  await assert.rejects(() => store.redeemLinkTicket(db, issued.ticket, '1234'), /8桁/);
});
