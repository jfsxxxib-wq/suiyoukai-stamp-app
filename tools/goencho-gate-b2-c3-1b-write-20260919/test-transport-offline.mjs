import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createLiveTransport, FIXED_ENDPOINT, SafeTransportError, assertFixedEndpoint, safeErrorRecord } from './live-transport.mjs';
import { createStubFetch } from './stub-fetch.mjs';
import { isLoopbackAddress } from './token-receiver.mjs';

const fakeToken = ['FAKE', 'SESSION', 'TOKEN', 'MUST', 'NOT', 'LEAK'].join('_');
const sentinelBody = { sql: 'SELECT 1 AS transport_probe;' };

async function transportCase(scenario, timeoutMs = 100) {
  const stub = createStubFetch({ scenario, expectedToken: fakeToken });
  const transport = createLiveTransport({ fetchLike: stub.fetchLike, timeoutMs });
  const tokenBuffer = Buffer.from(fakeToken, 'utf8');
  try {
    const value = await transport.send({ method: 'POST', endpoint: FIXED_ENDPOINT, tokenBuffer, body: sentinelBody });
    return { value, stub, debug: transport.getDebugState(), tokenBuffer };
  } catch (error) {
    return { error, safe: safeErrorRecord(error), stub, debug: transport.getDebugState(), tokenBuffer };
  }
}

{
  const run = await transportCase('success');
  assert.equal(run.value.safe_meta.http_status, 200);
  assert.equal(run.value.safe_meta.client_attempts, 1);
  assert.deepEqual(run.value.response, { success: true, result: [{ success: true, total_attempts: 1, results: [{ sentinel: 1 }] }] });
  assert.equal(run.stub.getAttempts(), 1);
  assert.equal(run.stub.getSafeCalls()[0].url, FIXED_ENDPOINT);
  assert.equal(JSON.stringify(run.value).includes(fakeToken), false);
  assert.equal(run.debug.raw_response_held, false);
  assert.equal(run.debug.raw_json_held, false);
  run.tokenBuffer.fill(0);
}

for (const candidate of [
  FIXED_ENDPOINT.replace('242d67724ca0baef96a00553df0fac35', '00000000000000000000000000000000'),
  FIXED_ENDPOINT.replace('f12fe289-977c-4215-ae73-40aaa34bff97', '00000000-0000-0000-0000-000000000000'),
]) assert.throws(() => assertFixedEndpoint(candidate), (error) => error instanceof SafeTransportError && error.classification === 'ENDPOINT_GUARD');

{
  const run = await transportCase('schema_counts');
  assert.deepEqual(run.value.response.result[0].results[0], {
    cf_internal_tables: 2, sqlite_internal_tables: 2, d1_migrations_tables: 0,
    schema_meta_tables: 1, schema_meta_rows: 1, schema_version: 3, goencho_tables: 16,
    unexpected_user_tables: 0, named_indexes: 8, unexpected_named_indexes: 0,
    unexpected_user_objects: 0, foreign_keys: 15, business_rows: 0, total_columns: 132,
    added_columns: 10, new_indexes: 4, column_shape_matches: 10,
    new_index_shape_matches: 4, new_index_column_matches: 4, new_index_predicate_matches: 4,
  });
  assert.equal(JSON.stringify(run.value).includes(fakeToken), false);
  assert.equal(JSON.stringify(run.value).includes('table_name'), false);
  assert.equal(JSON.stringify(run.value).includes('raw_sql'), false);
  run.tokenBuffer.fill(0);
}

for (const scenario of ['total_attempts_missing', 'total_attempts_invalid']) {
  const run = await transportCase(scenario);
  assert.equal(run.value.response.result[0].total_attempts, null, scenario);
  assert.equal(run.stub.getAttempts(), 1, scenario);
  run.tokenBuffer.fill(0);
}

{
  const stub = createStubFetch({ scenario: 'success', expectedToken: fakeToken });
  const transport = createLiveTransport({ fetchLike: stub.fetchLike });
  const tokenBuffer = Buffer.from(fakeToken);
  await assert.rejects(transport.send({ method: 'GET', endpoint: FIXED_ENDPOINT, tokenBuffer, body: sentinelBody }), (error) => error instanceof SafeTransportError && error.classification === 'METHOD_GUARD');
  assert.equal(stub.getAttempts(), 0);
  tokenBuffer.fill(0);
}

for (const candidate of [FIXED_ENDPOINT.replace('https:', 'http:'), FIXED_ENDPOINT.replace('api.cloudflare.com', 'example.invalid'), `${FIXED_ENDPOINT}/extra`]) {
  assert.throws(() => assertFixedEndpoint(candidate), (error) => error.classification === 'ENDPOINT_GUARD');
}
{
  const run = await transportCase('redirect');
  assert.equal(run.safe.classification, 'ENDPOINT_GUARD');
  assert.equal(run.stub.getAttempts(), 1);
  run.tokenBuffer.fill(0);
}

for (const [scenario, classification, status] of [
  ['http_403', 'REMOTE_HTTP', 403], ['http_500', 'REMOTE_HTTP', 500],
  ['network_error', 'NETWORK_OR_TLS', null], ['invalid_json', 'REMOTE_RESULT_INVALID', 200],
  ['timeout', 'REMOTE_TIMEOUT', null],
]) {
  const run = await transportCase(scenario, scenario === 'timeout' ? 5 : 100);
  assert.equal(run.safe.classification, classification, scenario);
  assert.equal(run.safe.http_status, status, scenario);
  assert.equal(run.safe.client_attempts, 1, scenario);
  assert.equal(run.stub.getAttempts(), 1, scenario);
  assert.equal(run.debug.active_requests, 0, scenario);
  run.tokenBuffer.fill(0);
}

assert.equal(isLoopbackAddress('127.0.0.1'), true);
assert.equal(isLoopbackAddress('::1'), true);
assert.equal(isLoopbackAddress('192.168.1.10'), false);
const runtimeFiles = ['live-transport.mjs', 'run-live-once.mjs', 'token-receiver.mjs', 'stub-fetch.mjs'];
let runtimeSource = '';
for (const file of runtimeFiles) runtimeSource += await readFile(new URL(`./${file}`, import.meta.url), 'utf8');
assert.equal(runtimeSource.includes(fakeToken), false);
assert.equal(runtimeSource.includes('1391CCC7B0599C7B22191DD4BD8F801BA3218218E3D989D0199D164DE48D676C'), false);
assert.equal(runtimeSource.includes('CLOUDFLARE_API_TOKEN'), false);
assert.equal(runtimeSource.includes('process.env'), false);
assert.equal(runtimeSource.includes('console.log'), false);
assert.equal(runtimeSource.includes('console.error'), false);

process.stdout.write('REST_0002_TRANSPORT_OFFLINE_PASS cases=17 external_network=0 localhost_listener_started=0 real_token=0 migration_sql_loaded=0 migration_sql_sent=0 client_retry=0 token_persisted=0\n');
