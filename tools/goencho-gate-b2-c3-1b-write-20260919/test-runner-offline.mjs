import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runMigrationSafely, loadAndValidate } from './rest-migrate-core.mjs';
import { createStubTransport } from './stub-transport.mjs';

const coreSource = await readFile(new URL('./rest-migrate-core.mjs', import.meta.url), 'utf8');
const fakeToken = 'FAKE_TOKEN_MUST_NEVER_APPEAR';
const fixedNow = '2026-09-19T08:00:42Z';
let executedCases = 0;

async function runCase(scenario, now = fixedNow) {
  executedCases += 1;
  const stub = createStubTransport({ scenario, expectedToken: fakeToken });
  const result = await runMigrationSafely({ transport: stub.transport, token: fakeToken, now });
  assert.equal(JSON.stringify(result).includes(fakeToken), false, `${scenario}: token leaked`);
  assert.equal(JSON.stringify(stub.safeCalls).includes(fakeToken), false, `${scenario}: token leaked in calls`);
  return { result, stub };
}

{
  const loaded = await loadAndValidate();
  assert.equal(Buffer.byteLength(loaded.sql, 'utf8'), 1403);
  assert.equal(loaded.statements.length, 15);
  const { result, stub } = await runCase('success');
  assert.equal(result.status, 'PASS');
  assert.equal(result.phase, 'COMPLETE_TOKEN_REVOCATION_REQUIRED');
  assert.equal(result.transport_calls, 3);
  assert.equal(result.client_attempts, 3);
  assert.equal(result.migration_requests, 1);
  assert.equal(result.recovery_timestamp_rfc3339, '2026-09-19T07:59:00Z');
  assert.equal(result.recovery_timestamp_unix, 1789804740);
  assert.equal(result.d1_migrations_touched, false);
  assert.equal(stub.state.committed, true);
  assert.deepEqual(stub.safeCalls.map((call) => call.purpose), ['REMOTE_0001_STATE_CHECK', 'MIGRATE_0002', 'POSTCHECK_SCHEMA_V3']);
  assert.equal(stub.safeCalls[1].sql_bytes, 1403);
}

for (const [scenario, expectedCode] of [
  ['pre_d1_migrations', 'UNEXPECTED_D1_MIGRATIONS'], ['pre_schema_meta', 'SCHEMA_META_COUNT_MISMATCH'],
  ['pre_schema_meta_rows', 'SCHEMA_META_ROW_COUNT_MISMATCH'], ['pre_version', 'SCHEMA_VERSION_MISMATCH'],
  ['pre_goencho', 'GOENCHO_TABLE_COUNT_MISMATCH'], ['pre_unexpected_table', 'UNEXPECTED_USER_TABLES'],
  ['pre_index_count', 'INDEX_COUNT_MISMATCH'], ['pre_unexpected_index', 'UNEXPECTED_NAMED_INDEXES'],
  ['pre_unexpected_object', 'UNEXPECTED_USER_OBJECTS'], ['pre_foreign_keys', 'FOREIGN_KEY_COUNT_MISMATCH'],
  ['pre_business_rows', 'BUSINESS_ROWS_NOT_EMPTY'], ['pre_total_columns', 'TOTAL_COLUMN_COUNT_MISMATCH'],
  ['pre_added_columns', 'ADDED_COLUMNS_ALREADY_EXIST'], ['pre_new_indexes', 'ADDED_INDEXES_ALREADY_EXIST'],
]) {
  const { result } = await runCase(scenario);
  assert.equal(result.status, 'STOPPED', scenario);
  assert.equal(result.phase, 'REMOTE_0001_STATE_CHECK', scenario);
  assert.equal(result.safe_failure.safe_code, expectedCode, scenario);
  assert.equal(result.transport_calls, 1, scenario);
  assert.equal(result.migration_requests, 0, scenario);
}

for (const scenario of ['pre_attempts_missing', 'pre_attempts_invalid', 'pre_attempts_two']) {
  const { result } = await runCase(scenario);
  assert.equal(result.safe_failure.safe_code, 'PREFLIGHT_TOTAL_ATTEMPTS_INVALID', scenario);
  assert.equal(result.transport_calls, 1, scenario);
  assert.equal(result.migration_requests, 0, scenario);
}
{
  const { result } = await runCase('pre_client_attempts_two');
  assert.equal(result.safe_failure.safe_code, 'CLIENT_ATTEMPTS_INVALID');
  assert.equal(result.client_attempts, 2);
  assert.equal(result.migration_requests, 0);
}
{
  const { result } = await runCase('auth_fail');
  assert.equal(result.status, 'STOPPED');
  assert.equal(result.safe_failure.classification, 'AUTH_OR_SCOPE');
  assert.equal(result.transport_calls, 1);
  assert.equal(result.client_attempts, 1);
}

for (const [scenario, code, committed] of [
  ['write_partial_failure', 'MIGRATION_BATCH_NOT_FULLY_SUCCESSFUL', false],
  ['write_attempts_missing', 'WRITE_TOTAL_ATTEMPTS_INVALID', true],
  ['write_attempts_invalid', 'WRITE_TOTAL_ATTEMPTS_INVALID', true],
  ['write_attempts_two', 'WRITE_TOTAL_ATTEMPTS_INVALID', true],
  ['write_client_attempts_two', 'CLIENT_ATTEMPTS_INVALID', true],
]) {
  const { result, stub } = await runCase(scenario);
  assert.equal(result.status, 'STOPPED', scenario);
  assert.equal(result.phase, 'MIGRATE_0002', scenario);
  assert.equal(result.safe_failure.safe_code, code, scenario);
  assert.equal(result.transport_calls, 2, scenario);
  assert.equal(result.migration_requests, 1, scenario);
  assert.equal(result.retry_performed, false, scenario);
  assert.equal(result.restore_performed, false, scenario);
  assert.equal(stub.state.committed, committed, scenario);
  assert.deepEqual(stub.safeCalls.map((call) => call.purpose), ['REMOTE_0001_STATE_CHECK', 'MIGRATE_0002'], scenario);
}
{
  const { result, stub } = await runCase('write_timeout');
  assert.equal(result.status, 'STOPPED');
  assert.equal(result.phase, 'MIGRATE_0002');
  assert.equal(result.safe_failure.classification, 'REMOTE_TIMEOUT');
  assert.equal(result.transport_calls, 2);
  assert.equal(result.migration_requests, 1);
  assert.equal(result.retry_performed, false);
  assert.equal(result.restore_performed, false);
  assert.deepEqual(stub.safeCalls.map((call) => call.purpose), ['REMOTE_0001_STATE_CHECK', 'MIGRATE_0002']);
}

for (const [scenario, expectedCode] of [
  ['post_d1_migrations', 'UNEXPECTED_D1_MIGRATIONS'], ['post_schema_meta', 'SCHEMA_META_COUNT_MISMATCH'],
  ['post_schema_meta_rows', 'SCHEMA_META_ROW_COUNT_MISMATCH'], ['post_version', 'SCHEMA_VERSION_MISMATCH'],
  ['post_goencho', 'GOENCHO_TABLE_COUNT_MISMATCH'], ['post_unexpected_table', 'UNEXPECTED_USER_TABLES'],
  ['post_index_count', 'INDEX_COUNT_MISMATCH'], ['post_unexpected_index', 'UNEXPECTED_NAMED_INDEXES'],
  ['post_unexpected_object', 'UNEXPECTED_USER_OBJECTS'], ['post_foreign_keys', 'FOREIGN_KEY_COUNT_MISMATCH'],
  ['post_business_rows', 'BUSINESS_ROWS_NOT_EMPTY'], ['post_total_columns', 'TOTAL_COLUMN_COUNT_MISMATCH'],
  ['post_added_columns', 'ADDED_COLUMN_COUNT_MISMATCH'], ['post_new_indexes', 'ADDED_INDEX_COUNT_MISMATCH'],
  ['post_column_shape', 'ADDED_COLUMN_SHAPE_MISMATCH'], ['post_index_shape', 'ADDED_INDEX_SHAPE_MISMATCH'],
  ['post_index_column', 'ADDED_INDEX_COLUMN_MISMATCH'], ['post_index_predicate', 'ADDED_INDEX_PREDICATE_MISMATCH'],
]) {
  const { result } = await runCase(scenario);
  assert.equal(result.status, 'STOPPED', scenario);
  assert.equal(result.phase, 'POSTCHECK_SCHEMA_V3', scenario);
  assert.equal(result.safe_failure.safe_code, expectedCode, scenario);
  assert.equal(result.transport_calls, 3, scenario);
  assert.equal(result.client_attempts, 3, scenario);
  assert.equal(result.migration_requests, 1, scenario);
  assert.equal(result.restore_performed, false, scenario);
}

for (const scenario of ['post_attempts_missing', 'post_attempts_invalid', 'post_attempts_two']) {
  const { result } = await runCase(scenario);
  assert.equal(result.status, 'STOPPED', scenario);
  assert.equal(result.phase, 'POSTCHECK_SCHEMA_V3', scenario);
  assert.equal(result.safe_failure.safe_code, 'POSTCHECK_TOTAL_ATTEMPTS_INVALID', scenario);
  assert.equal(result.transport_calls, 3, scenario);
  assert.equal(result.migration_requests, 1, scenario);
}
{
  const { result } = await runCase('success', 'not-a-valid-date');
  assert.equal(result.status, 'STOPPED');
  assert.equal(result.phase, 'TIMESTAMP_CAPTURE');
  assert.equal(result.safe_failure.safe_code, 'INVALID_UTC_CLOCK');
  assert.equal(result.transport_calls, 1);
  assert.equal(result.migration_requests, 0);
}

assert.equal(executedCases, 48);
assert.equal(/\bfetch\s*\(/.test(coreSource), false);
assert.equal(/api\.cloudflare\.com/i.test(coreSource), false);
assert.equal(/node:https/.test(coreSource), false);
process.stdout.write('REST_0002_OFFLINE_TESTS_PASS cases=48 external_network=0 live_transport=0 real_token=0 migration_sql_bytes=1403 statements=15 client_retry=0 write_resend=0 restore=0\n');
