import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { runMigrationSafely, splitSqlStatements } from './rest-migrate-core.mjs';

const source0001 = process.argv[2];
if (!source0001) throw new Error('0001 fixture path required');
const sql0001 = await readFile(resolve(source0001), 'utf8');
const db = new DatabaseSync(':memory:');
db.exec('PRAGMA foreign_keys = ON;');
db.exec(sql0001);
const fakeToken = 'FAKE_SQLITE_ONLY_TOKEN';
const safeCalls = [];

async function transport(request) {
  assert.equal(request.token, fakeToken);
  safeCalls.push({ purpose: request.purpose, sql_bytes: Buffer.byteLength(request.body.sql, 'utf8') });
  if (request.purpose === 'REMOTE_0001_STATE_CHECK' || request.purpose === 'POSTCHECK_SCHEMA_V3') {
    const row = db.prepare(request.body.sql).get();
    return { response: { success: true, result: [{ success: true, total_attempts: 1, results: [row] }] }, safe_meta: { http_status: 200, client_attempts: 1 } };
  }
  if (request.purpose === 'MIGRATE_0002') {
    const statements = splitSqlStatements(request.body.sql);
    const results = [];
    db.exec('BEGIN;');
    try {
      for (const statement of statements) {
        db.exec(`${statement};`);
        results.push({ success: true, total_attempts: 1, results: [] });
      }
      db.exec('COMMIT;');
    } catch (error) {
      db.exec('ROLLBACK;');
      throw error;
    }
    return { response: { success: true, result: results }, safe_meta: { http_status: 200, client_attempts: 1 } };
  }
  throw new Error('unexpected purpose');
}

const result = await runMigrationSafely({ transport, token: fakeToken, now: '2026-09-19T08:00:42Z' });
assert.equal(result.status, 'PASS');
assert.equal(result.transport_calls, 3);
assert.equal(result.client_attempts, 3);
assert.equal(result.migration_requests, 1);
assert.deepEqual(safeCalls.map((call) => call.purpose), ['REMOTE_0001_STATE_CHECK', 'MIGRATE_0002', 'POSTCHECK_SCHEMA_V3']);
assert.equal(JSON.stringify(result).includes(fakeToken), false);
assert.equal(JSON.stringify(safeCalls).includes(fakeToken), false);
db.close();

process.stdout.write('REST_0002_RUNNER_SQLITE_PASS requests=3 client_attempts=3 migration_requests=1 retry=0 resend=0 restore=0 external_network=0 real_token=0\n');
