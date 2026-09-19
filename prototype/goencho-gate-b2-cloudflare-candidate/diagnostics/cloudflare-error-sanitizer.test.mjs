import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  SanitizerInputError,
  sanitizeCloudflareResult,
} from './cloudflare-error-sanitizer.mjs';

const directory = dirname(fileURLToPath(import.meta.url));
const modulePath = join(directory, 'cloudflare-error-sanitizer.mjs');
const expectedKeys = [
  'schema_version',
  'operation',
  'outcome',
  'http_status',
  'error_codes',
  'category',
  'response_format',
];

function fake(caseId, kind) {
  return ['FAKE', caseId, kind, 'VALUE'].join('_');
}

function fakeEmail(caseId) {
  return [fake(caseId, 'PERSON'), '@example', '.invalid'].join('');
}

function assertAbsent(output, values) {
  const serialized = JSON.stringify(output);
  for (const value of values) assert.equal(serialized.includes(value), false);
}

function listFiles(path) {
  const output = [];
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const full = join(path, entry.name);
    if (entry.isDirectory()) output.push(...listFiles(full));
    else output.push(full);
  }
  return output.sort();
}

test('SAN-01 success result does not expose identifiers', () => {
  const account = fake('01', 'ACCOUNT');
  const database = fake('01', 'DATABASE');
  const name = fake('01', 'NAME');
  const output = sanitizeCloudflareResult({
    operation: 'd1-create',
    httpStatus: 200,
    body: { success: true, result: { account, database, name } },
  });
  assert.equal(output.outcome, 'success');
  assert.equal(output.category, 'success');
  assert.deepEqual(output.error_codes, []);
  assertAbsent(output, [account, database, name]);
});

test('SAN-02 bad request retains only a numeric code', () => {
  const email = fakeEmail('02');
  const message = `${fake('02', 'MESSAGE')} ${email}`;
  const output = sanitizeCloudflareResult({
    operation: 'd1-create',
    httpStatus: 400,
    body: { success: false, errors: [{ code: 1001, message }] },
  });
  assert.equal(output.category, 'bad_request');
  assert.deepEqual(output.error_codes, [1001]);
  assertAbsent(output, [email, message]);
});

test('SAN-03 authentication response does not expose a header or token', () => {
  const token = fake('03', 'TOKEN');
  const header = `Bearer ${token}`;
  const output = sanitizeCloudflareResult({
    operation: 'token-verify',
    httpStatus: 401,
    body: { success: false, headers: { authorization: header }, errors: [{ code: 10000 }] },
  });
  assert.equal(output.category, 'authentication');
  assertAbsent(output, [token, header]);
});

test('SAN-04 authorization response does not expose account context', () => {
  const account = fake('04', 'ACCOUNT');
  const detail = fake('04', 'PERMISSION_DETAIL');
  const output = sanitizeCloudflareResult({
    operation: 'd1-create',
    httpStatus: 403,
    body: { success: false, account, detail, errors: [{ code: 9109 }] },
  });
  assert.equal(output.category, 'authorization');
  assertAbsent(output, [account, detail]);
});

test('SAN-05 conflict response does not expose the database name', () => {
  const databaseName = fake('05', 'DATABASE_NAME');
  const output = sanitizeCloudflareResult({
    operation: 'd1-create',
    httpStatus: 409,
    body: { success: false, databaseName, errors: [{ code: 7502 }] },
  });
  assert.equal(output.category, 'conflict');
  assert.deepEqual(output.error_codes, [7502]);
  assertAbsent(output, [databaseName]);
});

test('SAN-06 rate limit response does not expose retry or ray data', () => {
  const ray = fake('06', 'RAY');
  const retry = fake('06', 'RETRY');
  const output = sanitizeCloudflareResult({
    operation: 'd1-list',
    httpStatus: 429,
    body: { success: false, ray, retry, errors: [{ code: 1015 }] },
  });
  assert.equal(output.category, 'rate_limited');
  assertAbsent(output, [ray, retry]);
});

test('SAN-07 server HTML is classified without retaining content', () => {
  const internal = fake('07', 'INTERNAL_REQUEST');
  const html = `<html><body>${internal}</body></html>`;
  const output = sanitizeCloudflareResult({ operation: 'd1-list', httpStatus: 503, body: html });
  assert.equal(output.category, 'server_error');
  assert.equal(output.response_format, 'non_json');
  assertAbsent(output, [internal, html]);
});

test('SAN-08 codes are deduplicated, sorted, and capped at eight', () => {
  const errors = [9, 4, 2, 10, 1, 7, 6, 5, 3, 8, 4].map((code) => ({ code }));
  const output = sanitizeCloudflareResult({
    operation: 'd1-create',
    httpStatus: 400,
    body: { success: false, errors },
  });
  assert.deepEqual(output.error_codes, [1, 2, 3, 4, 5, 6, 7, 8]);
});

test('SAN-09 invalid code types and status are rejected safely', () => {
  const output = sanitizeCloudflareResult({
    operation: 'd1-create',
    httpStatus: 799,
    body: {
      success: false,
      errors: [
        { code: '10000' },
        { code: -1 },
        { code: 1.5 },
        { code: {} },
        { code: Number.MAX_SAFE_INTEGER },
      ],
    },
  });
  assert.equal(output.http_status, null);
  assert.equal(output.category, 'unknown');
  assert.deepEqual(output.error_codes, []);
});

test('SAN-10 malformed JSON content is never returned', () => {
  const secret = fake('10', 'MALFORMED_SECRET');
  const body = `{"errors":[${secret}`;
  const output = sanitizeCloudflareResult({ operation: 'd1-list', httpStatus: 400, body });
  assert.equal(output.response_format, 'non_json');
  assertAbsent(output, [secret, body]);
});

test('SAN-11 transport errors do not expose message, stack, or path', () => {
  const message = fake('11', 'TRANSPORT_MESSAGE');
  const stack = `${fake('11', 'STACK')} C:\\${fake('11', 'LOCAL_PATH')}`;
  const output = sanitizeCloudflareResult({
    operation: 'd1-list',
    transportError: { message, stack },
  });
  assert.equal(output.category, 'transport_error');
  assert.equal(output.response_format, 'absent');
  assertAbsent(output, [message, stack]);
});

test('SAN-12 deeply nested sensitive fields are not returned', () => {
  const values = Array.from({ length: 5 }, (_, index) => fake('12', `NESTED_${index}`));
  const output = sanitizeCloudflareResult({
    operation: 'd1-create',
    httpStatus: 403,
    body: {
      success: false,
      request: { headers: { authorization: values[0] } },
      response: { body: { cause: { account: values[1], email: values[2] } } },
      notes: [values[3], { secret: values[4] }],
      errors: [{ code: 9109 }],
    },
  });
  assertAbsent(output, values);
});

test('SAN-13 unicode and terminal control text is not emitted', () => {
  const control = `${fake('13', 'CONTROL')}\u001b[31m\r\n秘密`;
  const output = sanitizeCloudflareResult({
    operation: 'd1-create',
    httpStatus: 400,
    body: { success: false, errors: [{ code: 1001, message: control }] },
  });
  assert.equal(output.category, 'bad_request');
  assertAbsent(output, [control, '\u001b[31m', '秘密']);
});

test('SAN-14 a body at the byte limit is handled without retention', () => {
  const body = 'x'.repeat(64 * 1024);
  const output = sanitizeCloudflareResult({ operation: 'd1-list', httpStatus: 400, body });
  assert.equal(output.category, 'bad_request');
  assert.equal(output.response_format, 'non_json');
  assert.equal(JSON.stringify(output).includes('x'.repeat(128)), false);
});

test('SAN-15 a body over the byte limit fails closed', () => {
  const body = 'y'.repeat((64 * 1024) + 1);
  const output = sanitizeCloudflareResult({ operation: 'd1-list', httpStatus: 400, body });
  assert.equal(output.category, 'unknown');
  assert.deepEqual(output.error_codes, []);
  assert.equal(JSON.stringify(output).includes('y'.repeat(128)), false);
});

test('SAN-16 circular and accessor objects fail closed without invocation', () => {
  const circular = { success: false };
  circular.self = circular;
  const circularOutput = sanitizeCloudflareResult({
    operation: 'd1-list',
    httpStatus: 400,
    body: circular,
  });
  assert.equal(circularOutput.category, 'unknown');

  let getterCalls = 0;
  const accessor = {};
  Object.defineProperty(accessor, 'secret', {
    enumerable: true,
    get() {
      getterCalls += 1;
      throw new Error(fake('16', 'GETTER'));
    },
  });
  const accessorOutput = sanitizeCloudflareResult({
    operation: 'd1-list',
    httpStatus: 400,
    body: accessor,
  });
  assert.equal(accessorOutput.category, 'unknown');
  assert.equal(getterCalls, 0);
});

test('SAN-17 an unapproved operation is rejected with a fixed message', () => {
  const operation = fake('17', 'UNAPPROVED_OPERATION');
  assert.throws(
    () => sanitizeCloudflareResult({ operation, httpStatus: 400 }),
    (error) => {
      assert.equal(error instanceof SanitizerInputError, true);
      assert.equal(error.message, 'Sanitizer input rejected');
      assert.equal(error.message.includes(operation), false);
      return true;
    },
  );
});

test('SAN-18 output has exactly seven own keys and no prototype', () => {
  const output = sanitizeCloudflareResult({ operation: 'd1-list', httpStatus: 403, body: {} });
  assert.deepEqual(Object.keys(output), expectedKeys);
  assert.equal(Object.getPrototypeOf(output), null);
  assert.equal('toString' in output, false);
  assert.equal(Object.isFrozen(output), true);
  assert.equal(Object.isFrozen(output.error_codes), true);
});

test('SAN-19 sanitizer writes nothing to console methods', () => {
  const sentinel = fake('19', 'CONSOLE');
  const calls = [];
  const originals = {};
  for (const name of ['log', 'error', 'warn', 'info', 'debug']) {
    originals[name] = console[name];
    console[name] = (...args) => calls.push([name, ...args]);
  }
  try {
    sanitizeCloudflareResult({
      operation: 'd1-create',
      httpStatus: 403,
      body: { errors: [{ code: 9109, message: sentinel }] },
    });
  } finally {
    for (const [name, original] of Object.entries(originals)) console[name] = original;
  }
  assert.deepEqual(calls, []);
});

test('SAN-20 sanitizer creates no files or diagnostic artifacts', () => {
  const before = listFiles(directory);
  sanitizeCloudflareResult({
    operation: 'd1-list',
    httpStatus: 400,
    body: { errors: [{ code: 1001, message: fake('20', 'FILE') }] },
  });
  const after = listFiles(directory);
  assert.deepEqual(after, before);
  assert.equal(after.some((path) => /\.(?:log|snap|tmp|trace|coverage)$/i.test(path)), false);
});

test('SAN-21 sanitizer performs no network or process delegation', () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    throw new Error('network forbidden');
  };
  try {
    sanitizeCloudflareResult({ operation: 'd1-list', httpStatus: 200, body: { success: true } });
  } finally {
    globalThis.fetch = originalFetch;
  }
  assert.equal(fetchCalls, 0);

  const source = readFileSync(modulePath, 'utf8');
  assert.doesNotMatch(source, /node:(?:http|https|dns|net|tls|child_process)/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /\bwrangler\b/i);
});

