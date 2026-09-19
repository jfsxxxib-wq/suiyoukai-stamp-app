import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const config = JSON.parse(readFileSync(new URL('../../wrangler.jsonc', import.meta.url), 'utf8'));
const migration = readFileSync(new URL('../migrations/0001_goencho.sql', import.meta.url), 'utf8');
const authMigration = readFileSync(new URL('../migrations/0002_auth_write_guards.sql', import.meta.url), 'utf8');
const worker = readFileSync(new URL('../src/worker.mjs', import.meta.url), 'utf8');

test('b2-config-01 初回deploy候補は外部routeと全observabilityを無効化する', () => {
  assert.equal(config.workers_dev, false);
  assert.equal(config.preview_urls, false);
  assert.equal('route' in config, false);
  assert.equal('routes' in config, false);
  assert.equal(config.observability.enabled, false);
  assert.equal(config.observability.logs.enabled, false);
  assert.equal(config.observability.logs.invocation_logs, false);
  assert.equal(config.observability.logs.head_sampling_rate, 0);
  assert.equal(config.observability.traces.enabled, false);
  assert.equal(config.observability.traces.head_sampling_rate, 0);
});

test('b2-config-02 D1 bindingは専用1件と未設定placeholderだけ', () => {
  assert.equal(config.d1_databases.length, 1);
  assert.deepEqual(config.d1_databases[0], {
    binding: 'GOENCHO_DB',
    database_name: 'goencho-b2-canary-db-202609',
    database_id: '00000000-0000-0000-0000-000000000000',
    preview_database_id: 'goencho-b2-local-only',
    migrations_dir: 'cloudflare/migrations',
  });
  assert.equal('account_id' in config, false);
});

test('b2-config-03 D1 migrationは専用tableだけでWALと受付系を含まない', () => {
  const combined = `${migration}\n${authMigration}`;
  assert.doesNotMatch(combined, /PRAGMA\s+journal_mode/i);
  assert.doesNotMatch(combined, /\b(?:test_receptions|receptions)\b/i);
  const tables = [...migration.matchAll(/CREATE TABLE IF NOT EXISTS\s+([a-z0-9_]+)/gi)]
    .map((match) => match[1]);
  assert.equal(tables.length > 10, true);
  assert.equal(tables.every((table) => table === 'schema_meta' || table.startsWith('goencho_')), true);
  assert.match(authMigration, /uq_goencho_one_active_owner/);
  assert.match(authMigration, /uq_goencho_teacher_active_credential/);
  assert.match(authMigration, /UPDATE schema_meta SET version = 3/);
});

test('b2-config-04 Worker sourceはconsole出力せずbinding欠落時に安全停止する', () => {
  assert.doesNotMatch(worker, /console\.(?:log|error|warn|info|debug)/);
  assert.match(worker, /assertRuntimeBindings/);
  assert.match(worker, /rejectTeacherIdInput/);
});
