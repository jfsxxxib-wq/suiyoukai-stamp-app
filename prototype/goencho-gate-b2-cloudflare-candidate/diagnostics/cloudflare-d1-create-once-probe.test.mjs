import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  CreateOnceProbeInputError,
  createCreateOnceProbeSession,
} from './cloudflare-d1-create-once-probe.mjs';

const directory = dirname(fileURLToPath(import.meta.url));
const modulePath = join(directory, 'cloudflare-d1-create-once-probe.mjs');
const accountId = 'd'.repeat(32);
const token = ['FAKE', 'WRITE', 'TOKEN', 'VALUE', 'ONLY'].join('_');
const databaseName = 'goencho-b2-canary-db-202609';

function apiResponse({ result = [], status = 200, errors = [] } = {}) {
  return new Response(JSON.stringify({ success: status >= 200 && status < 300, result, errors }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function createFetch(sequence, calls) {
  return async (url, options) => {
    calls.push({ url, options });
    const next = sequence.shift();
    if (next instanceof Error) throw next;
    return next;
  };
}

function serialized(value) {
  return JSON.stringify(value);
}

test('POST-LOCAL-01 endpoint is fixed to the official HTTPS account path', async () => {
  const calls = [];
  const session = createCreateOnceProbeSession({
    fetchImpl: createFetch([
      apiResponse({ result: [] }),
      apiResponse({ result: { uuid: 'e'.repeat(32), name: databaseName } }),
      apiResponse({ result: [{ uuid: 'e'.repeat(32), name: databaseName }] }),
    ], calls),
  });
  await session.run({ accountId, token });
  assert.equal(calls.length, 3);
  for (const call of calls) {
    assert.equal(call.url.protocol, 'https:');
    assert.equal(call.url.hostname, 'api.cloudflare.com');
    assert.equal(call.url.pathname, `/client/v4/accounts/${accountId}/d1/database`);
    assert.equal(call.options.redirect, 'error');
  }
});

test('POST-LOCAL-02 POST body contains only the fixed database name', async () => {
  const calls = [];
  const session = createCreateOnceProbeSession({
    fetchImpl: createFetch([
      apiResponse({ result: [] }),
      apiResponse({ result: { uuid: 'f'.repeat(32), name: databaseName } }),
      apiResponse({ result: [{ uuid: 'f'.repeat(32), name: databaseName }] }),
    ], calls),
  });
  await session.run({ accountId, token });
  const post = calls.find((call) => call.options.method === 'POST');
  assert.deepEqual(JSON.parse(post.options.body), { name: databaseName });
  assert.deepEqual(Object.keys(JSON.parse(post.options.body)), ['name']);
});

test('POST-LOCAL-03 only GET and POST are implemented', async () => {
  const calls = [];
  const session = createCreateOnceProbeSession({
    fetchImpl: createFetch([
      apiResponse({ result: [] }),
      apiResponse({ result: { uuid: '1' } }),
      apiResponse({ result: [{ uuid: '1' }] }),
    ], calls),
  });
  const result = await session.run({ accountId, token });
  assert.deepEqual(calls.map((call) => call.options.method), ['GET', 'POST', 'GET']);
  assert.equal(result.write_methods_sent, 1);
});

test('POST-LOCAL-04 preflight zero allows exactly one POST', async () => {
  const calls = [];
  const session = createCreateOnceProbeSession({
    fetchImpl: createFetch([
      apiResponse({ result: [] }),
      apiResponse({ result: { uuid: '2' } }),
      apiResponse({ result: [{ uuid: '2' }] }),
    ], calls),
  });
  const result = await session.run({ accountId, token });
  assert.equal(result.preflight.d1_count, 0);
  assert.equal(result.post_attempts, 1);
  assert.equal(calls.filter((call) => call.options.method === 'POST').length, 1);
});

test('POST-LOCAL-05 nonzero preflight stops before POST', async () => {
  const calls = [];
  const resource = ['FAKE', 'EXISTING', 'RESOURCE'].join('_');
  const session = createCreateOnceProbeSession({
    fetchImpl: createFetch([apiResponse({ result: [{ uuid: '3', name: resource }] })], calls),
  });
  const result = await session.run({ accountId, token });
  assert.equal(result.preflight.d1_count, 1);
  assert.equal(result.create.attempted, false);
  assert.equal(result.post_attempts, 0);
  assert.equal(result.stopped_reason, 'resource_found');
  assert.equal(serialized(result).includes(resource), false);
});

test('POST-LOCAL-06 success performs one confirmation GET and stops at count one', async () => {
  const calls = [];
  const uuid = '4'.repeat(32);
  const session = createCreateOnceProbeSession({
    fetchImpl: createFetch([
      apiResponse({ result: [] }),
      apiResponse({ result: { uuid, name: databaseName } }),
      apiResponse({ result: [{ uuid, name: databaseName }] }),
    ], calls),
  });
  const result = await session.run({ accountId, token });
  assert.equal(result.create.outcome, 'success');
  assert.equal(result.postcheck.d1_count, 1);
  assert.equal(result.stopped_reason, 'none');
  assert.equal(calls.length, 3);
  assert.equal(serialized(result).includes(uuid), false);
  assert.equal(serialized(result).includes(databaseName), false);
});

test('POST-LOCAL-07 authorization failure is sanitized and never retried', async () => {
  const calls = [];
  const message = ['FAKE', 'AUTHORIZATION', 'MESSAGE'].join('_');
  const session = createCreateOnceProbeSession({
    fetchImpl: createFetch([
      apiResponse({ result: [] }),
      apiResponse({ status: 403, errors: [{ code: 9109, message }] }),
    ], calls),
  });
  const result = await session.run({ accountId, token });
  assert.equal(result.create.http_status, 403);
  assert.deepEqual(result.create.error_codes, [9109]);
  assert.equal(result.create.category, 'authorization');
  assert.equal(result.postcheck.attempted, false);
  assert.equal(calls.filter((call) => call.options.method === 'POST').length, 1);
  assert.equal(serialized(result).includes(message), false);
});

test('POST-LOCAL-08 server failure is not retried and sends no confirmation GET', async () => {
  const calls = [];
  const session = createCreateOnceProbeSession({
    fetchImpl: createFetch([
      apiResponse({ result: [] }),
      apiResponse({ status: 503, errors: [{ code: 1000 }] }),
    ], calls),
  });
  const result = await session.run({ accountId, token });
  assert.equal(result.create.category, 'server_error');
  assert.equal(result.stopped_reason, 'http_failure');
  assert.deepEqual(calls.map((call) => call.options.method), ['GET', 'POST']);
});

test('POST-LOCAL-09 transport failure becomes unknown and is not retried', async () => {
  const calls = [];
  const raw = ['FAKE', 'TRANSPORT', 'DETAIL'].join('_');
  const session = createCreateOnceProbeSession({
    fetchImpl: createFetch([apiResponse({ result: [] }), new Error(raw)], calls),
  });
  const result = await session.run({ accountId, token });
  assert.equal(result.create.outcome, 'unknown');
  assert.equal(result.create.http_status, null);
  assert.equal(result.create.category, 'transport_error');
  assert.equal(result.stopped_reason, 'outcome_unknown');
  assert.deepEqual(calls.map((call) => call.options.method), ['GET', 'POST']);
  assert.equal(serialized(result).includes(raw), false);
});

test('POST-LOCAL-10 oversized response fails closed without raw content', async () => {
  const calls = [];
  const body = 'q'.repeat((64 * 1024) + 1);
  const session = createCreateOnceProbeSession({
    fetchImpl: createFetch([
      apiResponse({ result: [] }),
      new Response(body, { status: 200 }),
    ], calls),
  });
  const result = await session.run({ accountId, token });
  assert.equal(result.create.outcome, 'failure');
  assert.equal(result.create.category, 'unknown');
  assert.equal(result.postcheck.attempted, false);
  assert.equal(serialized(result).includes('q'.repeat(128)), false);
});

test('POST-LOCAL-11 a session cannot be invoked twice', async () => {
  const calls = [];
  const session = createCreateOnceProbeSession({
    fetchImpl: createFetch([apiResponse({ result: [{ uuid: '5' }] })], calls),
  });
  await session.run({ accountId, token });
  await assert.rejects(
    () => session.run({ accountId, token }),
    (error) => error instanceof CreateOnceProbeInputError && error.message === 'Create-once probe input rejected',
  );
  assert.equal(calls.length, 1);
});

test('POST-LOCAL-12 credentials never appear in the result', async () => {
  const session = createCreateOnceProbeSession({
    fetchImpl: async () => apiResponse({ result: [{ uuid: '6' }] }),
  });
  const result = await session.run({ accountId, token });
  assert.equal(serialized(result).includes(accountId), false);
  assert.equal(serialized(result).includes(token), false);
});

test('POST-LOCAL-13 output has a fixed top-level allowlist', async () => {
  const session = createCreateOnceProbeSession({
    fetchImpl: async () => apiResponse({ result: [{ uuid: '7' }] }),
  });
  const result = await session.run({ accountId, token });
  assert.deepEqual(Object.keys(result), [
    'schema_version',
    'operation',
    'preflight',
    'create',
    'postcheck',
    'post_attempts',
    'write_methods_sent',
    'stopped_reason',
  ]);
});

test('POST-LOCAL-14 source contains one POST method and no forbidden method or raw logging', () => {
  const source = readFileSync(modulePath, 'utf8');
  assert.equal([...source.matchAll(/method:\s*['"]POST['"]/g)].length, 1);
  assert.doesNotMatch(source, /method:\s*['"](?:PUT|PATCH|DELETE)['"]/i);
  assert.doesNotMatch(source, /console\.(?:log|error|warn|info|debug)/);
  assert.doesNotMatch(source, /WRANGLER_LOG|--log-level|--verbose|--debug/i);
});

