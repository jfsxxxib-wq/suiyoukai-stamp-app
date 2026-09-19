import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runBootstrapSafely } from './rest-bootstrap-core.mjs';
import { createStubTransport } from './stub-transport.mjs';

const workspaceRoot = resolve(import.meta.dirname, '../..');
const coreSourceText = await readFile(new URL('./rest-bootstrap-core.mjs', import.meta.url), 'utf8');
const fakeToken = 'FAKE_TOKEN_MUST_NEVER_APPEAR';
const fixedNow = '2026-09-19T02:00:42Z';
let executedCases = 0;

async function runCase(scenario, now = fixedNow) {
  executedCases += 1;
  const stub = createStubTransport({ scenario, expectedToken: fakeToken });
  const result = await runBootstrapSafely({ workspaceRoot, transport: stub.transport, token: fakeToken, now });
  assert.equal(JSON.stringify(result).includes(fakeToken), false, `${scenario}: token leaked in safe result`);
  assert.equal(JSON.stringify(stub.safeCalls).includes(fakeToken), false, `${scenario}: token leaked in safe calls`);
  return { result, stub };
}

for (const scenario of ['success', 'cf_only', 'cf_multiple', 'sqlite_only', 'cf_sqlite']) {
  const { result, stub } = await runCase(scenario);
  assert.equal(result.status, 'PASS', scenario);
  assert.equal(result.transport_calls, 3, scenario);
  assert.equal(result.client_attempts, 3, scenario);
  assert.equal(result.bootstrap_requests, 1, scenario);
  assert.equal(result.restore_timestamp_rfc3339, '2026-09-19T01:59:00Z', scenario);
  assert.equal(result.restore_timestamp_unix, 1789783140, scenario);
  assert.equal(result.d1_migrations_touched, false, scenario);
  assert.equal(stub.state.committed, true, scenario);
  assert.deepEqual(stub.safeCalls.map((call) => call.purpose), ['REMOTE_EMPTY_CHECK', 'BOOTSTRAP_0001', 'POSTCHECK_SCHEMA'], scenario);
  assert.equal(stub.safeCalls[1].sql_bytes, 6502, scenario);
}

for (const [scenario, expectedCode] of [
  ['goencho_exists', 'GOENCHO_TABLES_ALREADY_EXIST'],
  ['schema_meta_exists', 'SCHEMA_META_ALREADY_EXISTS'],
  ['d1_migrations_exists', 'D1_MIGRATIONS_ALREADY_EXISTS'],
  ['unexpected_user_table', 'UNEXPECTED_USER_TABLES'],
  ['unexpected_named_index', 'UNEXPECTED_NAMED_INDEXES'],
  ['unexpected_view', 'UNEXPECTED_USER_OBJECTS'],
  ['unexpected_trigger', 'UNEXPECTED_USER_OBJECTS'],
]) {
  const { result } = await runCase(scenario);
  assert.equal(result.status, 'STOPPED', scenario);
  assert.equal(result.transport_calls, 1, scenario);
  assert.equal(result.bootstrap_requests, 0, scenario);
  assert.equal(result.safe_failure.safe_code, expectedCode, scenario);
  assert.equal(result.retry_performed, false, scenario);
  assert.equal(result.restore_performed, false, scenario);
}

for (const scenario of ['pre_attempts_missing', 'pre_attempts_invalid', 'pre_attempts_two']) {
  const { result } = await runCase(scenario);
  assert.equal(result.status, 'STOPPED', scenario);
  assert.equal(result.phase, 'REMOTE_EMPTY_CHECK', scenario);
  assert.equal(result.safe_failure.safe_code, 'PREFLIGHT_TOTAL_ATTEMPTS_INVALID', scenario);
  assert.equal(result.transport_calls, 1, scenario);
  assert.equal(result.client_attempts, 1, scenario);
  assert.equal(result.bootstrap_requests, 0, scenario);
}

{
  const { result } = await runCase('pre_client_attempts_two');
  assert.equal(result.status, 'STOPPED');
  assert.equal(result.phase, 'REMOTE_EMPTY_CHECK');
  assert.equal(result.safe_failure.safe_code, 'CLIENT_ATTEMPTS_INVALID');
  assert.equal(result.transport_calls, 1);
  assert.equal(result.client_attempts, 2);
  assert.equal(result.bootstrap_requests, 0);
}

{
  const { result } = await runCase('auth_fail');
  assert.equal(result.status, 'STOPPED');
  assert.equal(result.transport_calls, 1);
  assert.equal(result.bootstrap_requests, 0);
  assert.equal(result.client_attempts, 1);
  assert.equal(result.safe_failure.classification, 'AUTH_OR_SCOPE');
  assert.equal(result.retry_performed, false);
}

{
  const { result, stub } = await runCase('partial_failure');
  assert.equal(result.status, 'STOPPED');
  assert.equal(result.phase, 'BOOTSTRAP_0001');
  assert.equal(result.safe_failure.safe_code, 'BOOTSTRAP_BATCH_NOT_FULLY_SUCCESSFUL');
  assert.equal(result.transport_calls, 2);
  assert.equal(result.bootstrap_requests, 1);
  assert.equal(stub.state.committed, false);
  assert.equal(result.client_attempts, 2);
}

{
  const { result } = await runCase('timeout');
  assert.equal(result.status, 'STOPPED');
  assert.equal(result.safe_failure.classification, 'REMOTE_TIMEOUT');
  assert.equal(result.transport_calls, 2);
  assert.equal(result.bootstrap_requests, 1);
  assert.equal(result.client_attempts, 2);
  assert.equal(result.retry_performed, false);
}

for (const scenario of ['write_attempts_missing', 'write_attempts_invalid', 'write_attempts_two']) {
  const { result, stub } = await runCase(scenario);
  assert.equal(result.status, 'STOPPED', scenario);
  assert.equal(result.phase, 'BOOTSTRAP_0001', scenario);
  assert.equal(result.safe_failure.safe_code, 'WRITE_TOTAL_ATTEMPTS_INVALID', scenario);
  assert.equal(result.transport_calls, 2, scenario);
  assert.equal(result.client_attempts, 2, scenario);
  assert.equal(result.bootstrap_requests, 1, scenario);
  assert.equal(result.retry_performed, false, scenario);
  assert.equal(result.restore_performed, false, scenario);
  assert.equal(stub.state.committed, true, scenario);
  assert.deepEqual(stub.safeCalls.map((call) => call.purpose), ['REMOTE_EMPTY_CHECK', 'BOOTSTRAP_0001'], scenario);
}

{
  const { result, stub } = await runCase('write_client_attempts_two');
  assert.equal(result.status, 'STOPPED');
  assert.equal(result.phase, 'BOOTSTRAP_0001');
  assert.equal(result.safe_failure.safe_code, 'CLIENT_ATTEMPTS_INVALID');
  assert.equal(result.transport_calls, 2);
  assert.equal(result.client_attempts, 3);
  assert.equal(result.bootstrap_requests, 1);
  assert.equal(stub.state.committed, true);
  assert.deepEqual(stub.safeCalls.map((call) => call.purpose), ['REMOTE_EMPTY_CHECK', 'BOOTSTRAP_0001']);
}

for (const [scenario, expectedCode] of [
  ['post_index_mismatch', 'INDEX_COUNT_MISMATCH'],
  ['post_schema_meta_mismatch', 'SCHEMA_META_COUNT_MISMATCH'],
  ['post_version_mismatch', 'SCHEMA_VERSION_MISMATCH'],
  ['post_goencho_mismatch', 'GOENCHO_TABLE_COUNT_MISMATCH'],
  ['post_unexpected_table', 'UNEXPECTED_USER_TABLES'],
  ['post_unexpected_index', 'UNEXPECTED_NAMED_INDEXES'],
  ['post_foreign_key_mismatch', 'FOREIGN_KEY_COUNT_MISMATCH'],
  ['post_schema_meta_rows_mismatch', 'SCHEMA_META_ROW_COUNT_MISMATCH'],
  ['post_business_rows', 'BUSINESS_ROWS_NOT_EMPTY'],
  ['post_unexpected_view', 'UNEXPECTED_USER_OBJECTS'],
  ['post_unexpected_trigger', 'UNEXPECTED_USER_OBJECTS'],
]) {
  const { result } = await runCase(scenario);
  assert.equal(result.status, 'STOPPED', scenario);
  assert.equal(result.phase, 'POSTCHECK_SCHEMA', scenario);
  assert.equal(result.safe_failure.safe_code, expectedCode, scenario);
  assert.equal(result.transport_calls, 3, scenario);
  assert.equal(result.bootstrap_requests, 1, scenario);
  assert.equal(result.client_attempts, 3, scenario);
  assert.equal(result.restore_performed, false, scenario);
}

for (const scenario of ['post_attempts_missing', 'post_attempts_invalid', 'post_attempts_two']) {
  const { result } = await runCase(scenario);
  assert.equal(result.status, 'STOPPED', scenario);
  assert.equal(result.phase, 'POSTCHECK_SCHEMA', scenario);
  assert.equal(result.safe_failure.safe_code, 'POSTCHECK_TOTAL_ATTEMPTS_INVALID', scenario);
  assert.equal(result.transport_calls, 3, scenario);
  assert.equal(result.client_attempts, 3, scenario);
  assert.equal(result.bootstrap_requests, 1, scenario);
  assert.equal(result.retry_performed, false, scenario);
  assert.equal(result.restore_performed, false, scenario);
}

{
  const { result } = await runCase('success', 'not-a-valid-date');
  assert.equal(result.status, 'STOPPED');
  assert.equal(result.phase, 'TIMESTAMP_CAPTURE');
  assert.equal(result.safe_failure.safe_code, 'INVALID_UTC_CLOCK');
  assert.equal(result.transport_calls, 1);
  assert.equal(result.bootstrap_requests, 0);
}

assert.equal(executedCases, 38);
assert.equal(/\bfetch\s*\(/.test(coreSourceText), false, 'live fetch exists');
assert.equal(/api\.cloudflare\.com/i.test(coreSourceText), false, 'Cloudflare API host exists');
assert.equal(/node:https/.test(coreSourceText), false, 'HTTPS module exists');

process.stdout.write('REST_OFFLINE_TESTS_PASS cases=38 external_network=0 live_transport=0 real_token=0 bootstrap_sql_bytes=6502 statements=23\n');
