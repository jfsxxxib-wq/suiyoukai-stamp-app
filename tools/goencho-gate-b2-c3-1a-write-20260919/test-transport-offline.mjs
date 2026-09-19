import assert from 'node:assert/strict';
import { request as httpRequest } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createLiveTransport, FIXED_ENDPOINT, SafeTransportError, assertFixedEndpoint, safeErrorRecord } from './live-transport.mjs';
import { createStubFetch } from './stub-fetch.mjs';
import { createTokenReceiver, isLoopbackAddress } from './token-receiver.mjs';

const fakeToken = ['FAKE', 'SESSION', 'TOKEN', 'MUST', 'NOT', 'LEAK'].join('_');
const sentinelBody = { sql: 'SELECT 1 AS transport_probe;' };

function postForm({ port, body, path = '/submit' }) {
  return new Promise((resolvePromise, reject) => {
    const req = httpRequest({
      host: '127.0.0.1',
      port,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { text += chunk; });
      res.on('end', () => resolvePromise({ status: res.statusCode, text, headers: res.headers }));
    });
    req.on('error', reject);
    req.end(body);
  });
}

function getPage({ port, path = '/' }) {
  return new Promise((resolvePromise, reject) => {
    const req = httpRequest({ host: '127.0.0.1', port, path, method: 'GET' }, (res) => {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { text += chunk; });
      res.on('end', () => resolvePromise({ status: res.statusCode, text, headers: res.headers }));
    });
    req.on('error', reject);
    req.end();
  });
}

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

// 1: exact endpoint and success.
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

// 2-3: fixed account and UUID guard.
for (const candidate of [
  FIXED_ENDPOINT.replace('242d67724ca0baef96a00553df0fac35', '00000000000000000000000000000000'),
  FIXED_ENDPOINT.replace('f12fe289-977c-4215-ae73-40aaa34bff97', '00000000-0000-0000-0000-000000000000'),
]) {
  assert.throws(() => assertFixedEndpoint(candidate), (error) => error instanceof SafeTransportError && error.classification === 'ENDPOINT_GUARD');
}

// 15: keep safe schema counts and attempt count; discard names, SQL and untrusted messages.
{
  const run = await transportCase('schema_counts');
  assert.deepEqual(run.value.response, {
    success: true,
    result: [{
      success: true,
      total_attempts: 1,
      results: [{
        cf_internal_tables: 1,
        sqlite_internal_tables: 2,
        schema_meta_tables: 1,
        schema_meta_rows: 1,
        d1_migrations_tables: 0,
        goencho_tables: 16,
        unexpected_user_tables: 0,
        unexpected_user_objects: 0,
        named_indexes: 4,
        unexpected_named_indexes: 0,
        foreign_keys: 15,
        business_rows: 0,
        schema_version: 2,
      }],
    }],
  });
  assert.equal(JSON.stringify(run.value).includes(fakeToken), false);
  assert.equal(JSON.stringify(run.value).includes('table_name'), false);
  assert.equal(JSON.stringify(run.value).includes('raw_sql'), false);
  run.tokenBuffer.fill(0);
}

// 16-17: missing or non-numeric total_attempts is normalized to null, never inferred.
for (const scenario of ['total_attempts_missing', 'total_attempts_invalid']) {
  const run = await transportCase(scenario);
  assert.equal(run.value.response.result[0].total_attempts, null, scenario);
  assert.equal(run.value.safe_meta.client_attempts, 1, scenario);
  assert.equal(run.stub.getAttempts(), 1, scenario);
  run.tokenBuffer.fill(0);
}

// 4: POST-only; GET never reaches fetchLike.
{
  const stub = createStubFetch({ scenario: 'success', expectedToken: fakeToken });
  const transport = createLiveTransport({ fetchLike: stub.fetchLike });
  const tokenBuffer = Buffer.from(fakeToken);
  await assert.rejects(
    transport.send({ method: 'GET', endpoint: FIXED_ENDPOINT, tokenBuffer, body: sentinelBody }),
    (error) => error instanceof SafeTransportError && error.classification === 'METHOD_GUARD',
  );
  assert.equal(stub.getAttempts(), 0);
  tokenBuffer.fill(0);
}

// 5: protocol/host/path guards and redirect rejection.
for (const candidate of [
  FIXED_ENDPOINT.replace('https:', 'http:'),
  FIXED_ENDPOINT.replace('api.cloudflare.com', 'example.invalid'),
  `${FIXED_ENDPOINT}/extra`,
]) {
  assert.throws(() => assertFixedEndpoint(candidate), (error) => error.classification === 'ENDPOINT_GUARD');
}
{
  const run = await transportCase('redirect');
  assert.equal(run.safe.classification, 'ENDPOINT_GUARD');
  assert.equal(run.stub.getAttempts(), 1);
  run.tokenBuffer.fill(0);
}

// 6-7: exactly one client attempt for HTTP/network/timeout, with timeout abort.
for (const [scenario, classification, status] of [
  ['http_403', 'REMOTE_HTTP', 403],
  ['http_500', 'REMOTE_HTTP', 500],
  ['network_error', 'NETWORK_OR_TLS', null],
  ['invalid_json', 'REMOTE_RESULT_INVALID', 200],
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

// 8-13: localhost form, POST-body only, one-shot, zero-fill, headers and size guard.
let capturedBuffer;
const receiver = createTokenReceiver({
  closeAfterAccept: false,
  async onToken(tokenBuffer) {
    capturedBuffer = tokenBuffer;
    assert.equal(tokenBuffer.toString('utf8'), fakeToken);
  },
});
const address = await receiver.listen();
const form = await getPage({ port: address.port });
assert.equal(form.status, 200);
assert.match(form.text, /INPUT_WAITING_READY/);
assert.equal(form.text.includes(fakeToken), false);
assert.equal(form.headers['cache-control'].includes('no-store'), true);
assert.equal(form.headers['referrer-policy'], 'no-referrer');
const submitted = await postForm({ port: address.port, body: `token=${encodeURIComponent(fakeToken)}` });
assert.equal(submitted.status, 200);
assert.equal(submitted.text.includes(fakeToken), false);
assert.equal(capturedBuffer.every((value) => value === 0), true);
const used = await getPage({ port: address.port });
assert.equal(used.status, 410);
const receiverState = receiver.getState();
assert.equal(receiverState.accepted, true);
assert.equal(receiverState.token_buffer_held, false);
assert.equal(receiverState.token_buffer_zeroed, true);
assert.equal(isLoopbackAddress('127.0.0.1'), true);
assert.equal(isLoopbackAddress('::1'), true);
assert.equal(isLoopbackAddress('192.168.1.10'), false);
await receiver.close();

let oversizedAccepted = false;
const sizeReceiver = createTokenReceiver({ async onToken() { oversizedAccepted = true; } });
const sizeAddress = await sizeReceiver.listen();
const oversized = await postForm({ port: sizeAddress.port, body: `token=${'x'.repeat(5000)}` });
assert.equal(oversized.status, 413);
assert.equal(oversizedAccepted, false);
await sizeReceiver.close();

// 9-11 and 14: leak/static/dry-run checks; runtime files contain no bootstrap SQL reference.
const runtimeFiles = ['live-transport.mjs', 'run-live-once.mjs', 'token-receiver.mjs', 'stub-fetch.mjs'];
let runtimeSource = '';
for (const file of runtimeFiles) runtimeSource += await readFile(new URL(`./${file}`, import.meta.url), 'utf8');
assert.equal(runtimeSource.includes(fakeToken), false);
assert.equal(runtimeSource.includes('0001_goencho.sql'), false);
assert.equal(runtimeSource.includes('0EAADB9E1A72D1947414F50A45073D0B00FD8E33DE8267E15288D10A2F6194ED'), false);
assert.equal(runtimeSource.includes('CLOUDFLARE_API_TOKEN'), false);
assert.equal(runtimeSource.includes('process.env'), false);
assert.equal(runtimeSource.includes('console.log'), false);
assert.equal(runtimeSource.includes('console.error'), false);

process.stdout.write('REST_TRANSPORT_OFFLINE_PASS cases=17 external_network=0 real_token=0 bootstrap_sql_loaded=0 bootstrap_sql_sent=0 client_retry=0 token_persisted=0\n');
