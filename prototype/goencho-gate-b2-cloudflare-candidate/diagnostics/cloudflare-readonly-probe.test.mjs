import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  ReadonlyProbeInputError,
  runReadOnlyProbe,
} from './cloudflare-readonly-probe.mjs';

const directory = dirname(fileURLToPath(import.meta.url));
const modulePath = join(directory, 'cloudflare-readonly-probe.mjs');
const accountId = 'a'.repeat(32);
const token = ['FAKE', 'READONLY', 'TOKEN', 'VALUE', 'ONLY'].join('_');

function response(result, status = 200) {
  return new Response(JSON.stringify({ success: status < 300, result, errors: status < 300 ? [] : [{ code: 9109 }] }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function wranglerList(rows = [], exitCode = 0) {
  return async () => ({ exitCode, stdout: JSON.stringify(rows) });
}

function serialize(value) {
  return JSON.stringify(value);
}

test('PROBE-01 direct request is exact HTTPS GET with no redirect or retry', async () => {
  const calls = [];
  const result = await runReadOnlyProbe({
    accountId,
    token,
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return response([]);
    },
    runWrangler: wranglerList([]),
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.protocol, 'https:');
  assert.equal(calls[0].url.hostname, 'api.cloudflare.com');
  assert.equal(calls[0].url.pathname, `/client/v4/accounts/${accountId}/d1/database`);
  assert.equal(calls[0].options.method, 'GET');
  assert.equal(calls[0].options.redirect, 'error');
  assert.equal(result.write_methods_sent, 0);
});

test('PROBE-02 empty direct and Wrangler results match', async () => {
  const result = await runReadOnlyProbe({
    accountId,
    token,
    fetchImpl: async () => response([]),
    runWrangler: wranglerList([]),
  });
  assert.equal(result.direct.success, true);
  assert.equal(result.direct.d1_count, 0);
  assert.equal(result.wrangler.success, true);
  assert.equal(result.wrangler.d1_count, 0);
  assert.equal(result.counts_match, true);
  assert.equal(result.stopped_reason, 'none');
});

test('PROBE-03 a direct resource count stops before Wrangler', async () => {
  const name = ['FAKE', 'DATABASE', 'NAME'].join('_');
  let wranglerCalls = 0;
  const result = await runReadOnlyProbe({
    accountId,
    token,
    fetchImpl: async () => response([{ uuid: 'b'.repeat(32), name }]),
    runWrangler: async () => {
      wranglerCalls += 1;
      return { exitCode: 0, stdout: '[]' };
    },
  });
  assert.equal(result.direct.d1_count, 1);
  assert.equal(result.wrangler.attempted, false);
  assert.equal(result.stopped_reason, 'resource_found');
  assert.equal(wranglerCalls, 0);
  assert.equal(serialize(result).includes(name), false);
});

test('PROBE-04 direct authorization error is sanitized', async () => {
  const secret = ['FAKE', 'AUTH', 'DETAIL'].join('_');
  const result = await runReadOnlyProbe({
    accountId,
    token,
    fetchImpl: async () => new Response(JSON.stringify({
      success: false,
      errors: [{ code: 9109, message: secret }],
    }), { status: 403 }),
    runWrangler: wranglerList([], 1),
  });
  assert.equal(result.direct.success, false);
  assert.equal(result.direct.http_status, 403);
  assert.deepEqual(result.direct.error_codes, [9109]);
  assert.equal(serialize(result).includes(secret), false);
  assert.equal(result.stopped_reason, 'read_failure');
});

test('PROBE-05 oversized direct body fails closed', async () => {
  const body = 'z'.repeat((64 * 1024) + 1);
  const result = await runReadOnlyProbe({
    accountId,
    token,
    fetchImpl: async () => new Response(body, { status: 200 }),
    runWrangler: wranglerList([]),
  });
  assert.equal(result.direct.success, false);
  assert.equal(result.direct.d1_count, null);
  assert.equal(serialize(result).includes('z'.repeat(128)), false);
});

test('PROBE-06 redirect or transport rejection exposes no raw error', async () => {
  const raw = ['FAKE', 'TRANSPORT', 'ERROR'].join('_');
  const result = await runReadOnlyProbe({
    accountId,
    token,
    fetchImpl: async () => { throw new Error(raw); },
    runWrangler: wranglerList([], 1),
  });
  assert.equal(result.direct.success, false);
  assert.equal(result.direct.http_status, null);
  assert.equal(serialize(result).includes(raw), false);
});

test('PROBE-07 direct GET has no automatic retry', async () => {
  let calls = 0;
  await runReadOnlyProbe({
    accountId,
    token,
    fetchImpl: async () => {
      calls += 1;
      throw new Error('fixed fake failure');
    },
    runWrangler: wranglerList([], 1),
  });
  assert.equal(calls, 1);
});

test('PROBE-08 Wrangler empty array records only a zero count', async () => {
  const result = await runReadOnlyProbe({
    accountId,
    token,
    fetchImpl: async () => response([]),
    runWrangler: wranglerList([]),
  });
  assert.deepEqual(result.wrangler, {
    attempted: true,
    success: true,
    exit_code: 0,
    d1_count: 0,
  });
});

test('PROBE-09 Wrangler resource details are never returned', async () => {
  const name = ['FAKE', 'WRANGLER', 'DATABASE'].join('_');
  const result = await runReadOnlyProbe({
    accountId,
    token,
    fetchImpl: async () => response([]),
    runWrangler: wranglerList([{ uuid: 'c'.repeat(32), name }]),
  });
  assert.equal(result.wrangler.d1_count, 1);
  assert.equal(result.stopped_reason, 'resource_found');
  assert.equal(serialize(result).includes(name), false);
});

test('PROBE-10 invalid Wrangler output becomes a generic read failure', async () => {
  const raw = ['FAKE', 'WRANGLER', 'RAW'].join('_');
  const result = await runReadOnlyProbe({
    accountId,
    token,
    fetchImpl: async () => response([]),
    runWrangler: async () => ({ exitCode: 0, stdout: raw }),
  });
  assert.equal(result.wrangler.success, false);
  assert.equal(result.wrangler.d1_count, null);
  assert.equal(result.stopped_reason, 'read_failure');
  assert.equal(serialize(result).includes(raw), false);
});

test('PROBE-11 final summary uses a fixed allowlist and no credentials', async () => {
  const result = await runReadOnlyProbe({
    accountId,
    token,
    fetchImpl: async () => response([]),
    runWrangler: wranglerList([]),
  });
  assert.deepEqual(Object.keys(result), [
    'schema_version',
    'operation',
    'direct',
    'wrangler',
    'same_account_input',
    'counts_match',
    'write_methods_sent',
    'stopped_reason',
  ]);
  assert.equal(serialize(result).includes(accountId), false);
  assert.equal(serialize(result).includes(token), false);
});

test('PROBE-12 invalid credentials fail with a fixed message', async () => {
  const invalid = ['FAKE', 'INVALID', 'ACCOUNT'].join('_');
  await assert.rejects(
    () => runReadOnlyProbe({ accountId: invalid, token }),
    (error) => {
      assert.equal(error instanceof ReadonlyProbeInputError, true);
      assert.equal(error.message, 'Readonly probe input rejected');
      assert.equal(error.message.includes(invalid), false);
      return true;
    },
  );
});

test('PROBE-13 production source contains no write method or raw logging', () => {
  const source = readFileSync(modulePath, 'utf8');
  assert.doesNotMatch(source, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/i);
  assert.doesNotMatch(source, /console\.(?:log|error|warn|info|debug)/);
  assert.doesNotMatch(source, /WRANGLER_LOG|--log-level|--verbose|--debug/i);
});

