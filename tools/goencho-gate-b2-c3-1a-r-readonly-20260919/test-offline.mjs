import assert from 'node:assert/strict';
import { request as httpRequest } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { createReadOnlyTransport, FIXED_ENDPOINT as TRANSPORT_ENDPOINT } from './readonly-transport.mjs';
import { runReadOnlyEmptyCheck } from './readonly-runner.mjs';
import { FIXED_ENDPOINT, FIXED_TARGET, READONLY_EMPTY_CHECK_SQL, SAFE_COUNT_KEYS, assertFixedTarget } from './scope.mjs';
import { createReadOnlyStubFetch, emptyCounts } from './stub-fetch.mjs';
import { createReadOnlyTokenReceiver } from './token-receiver-readonly.mjs';

const fakeToken = ['FAKE', 'READONLY', 'SESSION', 'TOKEN', 'NO', 'LEAK'].join('_');
let cases = 0;

function countCase() { cases += 1; }

async function runScenario({ scenario = 'pass', counts = emptyCounts(), totalAttempts = 1, timeoutMs = 100 }) {
  const stub = createReadOnlyStubFetch({ scenario, expectedToken: fakeToken, counts, totalAttempts });
  const transport = createReadOnlyTransport({ fetchLike: stub.fetchLike, timeoutMs });
  const tokenBuffer = Buffer.from(fakeToken, 'utf8');
  try {
    const result = await runReadOnlyEmptyCheck({ transport: transport.send, tokenBuffer });
    return { result, stub, debug: transport.getDebugState(), tokenBuffer };
  } finally {
    tokenBuffer.fill(0);
  }
}

function postForm({ port, body }) {
  return new Promise((resolvePromise, reject) => {
    const req = httpRequest({
      host: '127.0.0.1', port, path: '/submit', method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { text += chunk; });
      res.on('end', () => resolvePromise({ status: res.statusCode, text }));
    });
    req.on('error', reject);
    req.end(body);
  });
}

function getPage({ port }) {
  return new Promise((resolvePromise, reject) => {
    const req = httpRequest({ host: '127.0.0.1', port, path: '/', method: 'GET' }, (res) => {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { text += chunk; });
      res.on('end', () => resolvePromise({ status: res.statusCode, text, headers: res.headers }));
    });
    req.on('error', reject);
    req.end();
  });
}

// 1-4: empty and internal-only schemas pass.
for (const counts of [
  emptyCounts(),
  emptyCounts({ cf_internal_tables: 1 }),
  emptyCounts({ sqlite_internal_tables: 2 }),
  emptyCounts({ cf_internal_tables: 1, sqlite_internal_tables: 2 }),
]) {
  const run = await runScenario({ counts });
  assert.equal(run.result.status, 'PASS');
  assert.equal(run.result.client_requests, 1);
  assert.equal(run.result.client_retry, false);
  assert.equal(run.result.total_attempts, 1);
  assert.equal(run.stub.getRequests(), 1);
  assert.equal(run.debug.raw_response_held, false);
  assert.equal(run.debug.raw_json_held, false);
  countCase();
}

// 5-10: every non-empty user-owned category stops.
for (const [key, code] of [
  ['d1_migrations_tables', 'D1_MIGRATIONS_ALREADY_EXISTS'],
  ['schema_meta_tables', 'SCHEMA_META_ALREADY_EXISTS'],
  ['goencho_tables', 'GOENCHO_TABLES_ALREADY_EXIST'],
  ['unexpected_user_tables', 'UNEXPECTED_USER_TABLES'],
  ['unexpected_named_indexes', 'UNEXPECTED_NAMED_INDEXES'],
  ['unexpected_user_objects', 'UNEXPECTED_USER_OBJECTS'],
]) {
  const run = await runScenario({ counts: emptyCounts({ [key]: 1 }) });
  assert.equal(run.result.status, 'STOPPED');
  assert.equal(run.result.safe_failure.classification, 'REMOTE_DATABASE_NOT_EMPTY');
  assert.equal(run.result.safe_failure.safe_code, code);
  assert.equal(run.stub.getRequests(), 1);
  countCase();
}

// 11-13: Cloudflare internal attempts are separate from client retries.
{
  const run = await runScenario({ totalAttempts: 2 });
  assert.equal(run.result.status, 'STOPPED');
  assert.equal(run.result.safe_failure.classification, 'CLOUDFLARE_INTERNAL_RETRY');
  assert.equal(run.result.safe_failure.total_attempts, 2);
  assert.equal(run.result.safe_failure.client_requests, 1);
  assert.equal(run.result.safe_failure.client_retry, false);
  assert.equal(run.stub.getRequests(), 1);
  countCase();
}
{
  const run = await runScenario({ totalAttempts: 3 });
  assert.equal(run.result.safe_failure.classification, 'CLOUDFLARE_INTERNAL_RETRY');
  assert.equal(run.result.safe_failure.total_attempts, 3);
  assert.equal(run.stub.getRequests(), 1);
  countCase();
}
{
  const run = await runScenario({ scenario: 'total_attempts_missing' });
  assert.equal(run.result.status, 'STOPPED');
  assert.equal(run.result.safe_failure.classification, 'REMOTE_RESULT_INVALID');
  assert.equal(run.stub.getRequests(), 1);
}
for (const totalAttempts of [0, -1, 1.5, '1', `unsafe-${fakeToken}`, 4]) {
  const run = await runScenario({ totalAttempts });
  assert.equal(run.result.status, 'STOPPED');
  assert.equal(run.result.safe_failure.classification, 'REMOTE_RESULT_INVALID');
  assert.equal(run.stub.getRequests(), 1);
  assert.equal(JSON.stringify(run.result).includes(fakeToken), false);
}
countCase();

// 14: missing/negative/fractional count stops.
for (const badCounts of [
  Object.fromEntries(SAFE_COUNT_KEYS.slice(1).map((key) => [key, 0])),
  emptyCounts({ unexpected_user_tables: -1 }),
  emptyCounts({ unexpected_user_tables: 0.5 }),
]) {
  const run = await runScenario({ counts: badCounts });
  assert.equal(run.result.safe_failure.classification, 'REMOTE_RESULT_INVALID');
}
countCase();

// 15: HTTP failures stop with safe status and one request.
for (const [scenario, status] of [['http_403', 403], ['http_500', 500]]) {
  const run = await runScenario({ scenario });
  assert.equal(run.result.safe_failure.classification, 'REMOTE_HTTP');
  assert.equal(run.result.safe_failure.http_status, status);
  assert.equal(run.result.safe_failure.client_requests, 1);
  assert.equal(run.stub.getRequests(), 1);
  assert.equal(run.debug.client_requests, 1);
}
countCase();

// 16: network, timeout and invalid JSON never retry.
for (const scenario of ['network_error', 'timeout', 'invalid_json']) {
  const run = await runScenario({ scenario, timeoutMs: scenario === 'timeout' ? 5 : 100 });
  assert.equal(run.result.status, 'STOPPED');
  assert.equal(run.stub.getRequests(), 1);
  assert.equal(run.debug.client_requests, 1);
  assert.equal(run.debug.client_retry, false);
}
countCase();

// 17: fixed target, endpoint and read-only body guards stop before fetch.
for (const [key, replacement] of [
  ['account_id', '00000000000000000000000000000000'],
  ['database_uuid', '00000000-0000-0000-0000-000000000000'],
  ['database_name', 'wrong-database'],
  ['binding', 'WRONG_DB'],
]) {
  assert.throws(() => assertFixedTarget({ ...FIXED_TARGET, [key]: replacement }), /MISMATCH/);
}
assert.equal(FIXED_ENDPOINT, TRANSPORT_ENDPOINT);
{
  const stub = createReadOnlyStubFetch({ expectedToken: fakeToken });
  const transport = createReadOnlyTransport({ fetchLike: stub.fetchLike });
  const tokenBuffer = Buffer.from(fakeToken);
  await assert.rejects(transport.send({ method: 'GET', endpoint: FIXED_ENDPOINT, tokenBuffer, body: { sql: READONLY_EMPTY_CHECK_SQL } }));
  await assert.rejects(transport.send({ method: 'POST', endpoint: `${FIXED_ENDPOINT}/extra`, tokenBuffer, body: { sql: READONLY_EMPTY_CHECK_SQL } }));
  await assert.rejects(transport.send({ method: 'POST', endpoint: FIXED_ENDPOINT, tokenBuffer, body: { sql: 'SELECT 1;' } }));
  assert.equal(stub.getRequests(), 0);
  tokenBuffer.fill(0);
}
countCase();

// 18: one transport instance cannot issue a second request.
{
  const stub = createReadOnlyStubFetch({ expectedToken: fakeToken });
  const transport = createReadOnlyTransport({ fetchLike: stub.fetchLike });
  const tokenBuffer = Buffer.from(fakeToken);
  await transport.send({ endpoint: FIXED_ENDPOINT, tokenBuffer, body: { sql: READONLY_EMPTY_CHECK_SQL } });
  await assert.rejects(transport.send({ endpoint: FIXED_ENDPOINT, tokenBuffer, body: { sql: READONLY_EMPTY_CHECK_SQL } }));
  assert.equal(stub.getRequests(), 1);
  tokenBuffer.fill(0);
}
countCase();

// 19: raw names, SQL, messages and fake Token are discarded.
{
  const run = await runScenario({ counts: emptyCounts({ cf_internal_tables: 1 }) });
  const serialized = JSON.stringify(run.result);
  assert.equal(serialized.includes(fakeToken), false);
  assert.equal(serialized.includes('table_name'), false);
  assert.equal(serialized.includes('raw_sql'), false);
  assert.equal(serialized.includes('message'), false);
}
countCase();

// 20: localhost receiver is D1 Read-only, one-shot and zero-fills the Buffer.
let capturedBuffer;
const receiver = createReadOnlyTokenReceiver({
  closeAfterAccept: false,
  async onToken(tokenBuffer) { capturedBuffer = tokenBuffer; },
});
const address = await receiver.listen();
const form = await getPage({ port: address.port });
assert.equal(form.status, 200);
assert.match(form.text, /INPUT_WAITING_READY/);
assert.match(form.text, /D1 Readだけ/);
assert.equal(form.text.includes('Write'), false);
assert.equal(form.headers['cache-control'].includes('no-store'), true);
const submitted = await postForm({ port: address.port, body: `token=${encodeURIComponent(fakeToken)}` });
assert.equal(submitted.status, 200);
assert.equal(submitted.text.includes(fakeToken), false);
assert.equal(capturedBuffer.every((value) => value === 0), true);
const state = receiver.getState();
assert.equal(state.accepted, true);
assert.equal(state.token_buffer_held, false);
assert.equal(state.token_buffer_zeroed, true);
await receiver.close();
countCase();

// 21: runtime files contain no bootstrap/migration/secret persistence hooks.
const files = (await readdir(new URL('.', import.meta.url))).filter((name) => name.endsWith('.mjs') && name !== 'test-offline.mjs');
let runtimeSource = '';
for (const file of files) runtimeSource += await readFile(new URL(`./${file}`, import.meta.url), 'utf8');
for (const forbidden of [
  'runBootstrapSafely',
  'rest-bootstrap-core',
  '0001_goencho.sql',
  '0002',
  'migration_sha256',
  'CLOUDFLARE_API_TOKEN',
  'process.env',
  'console.log',
  'console.error',
  'INSERT ',
  'UPDATE ',
  'DELETE ',
  'CREATE TABLE',
  'DROP TABLE',
]) assert.equal(runtimeSource.includes(forbidden), false, forbidden);
assert.equal(runtimeSource.includes(fakeToken), false);
countCase();

assert.equal(cases, 21);
process.stdout.write(`READONLY_EMPTY_CHECK_OFFLINE_PASS cases=${cases} external_network=0 real_token=0 remote_requests=0 write=0 bootstrap_sql_loaded=0 bootstrap_sql_sent=0 client_retry=0 token_persisted=0\n`);
