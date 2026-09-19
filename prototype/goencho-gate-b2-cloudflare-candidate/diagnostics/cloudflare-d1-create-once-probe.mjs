import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sanitizeCloudflareResult } from './cloudflare-error-sanitizer.mjs';

const MAX_RESPONSE_BYTES = 64 * 1024;
const REQUEST_TIMEOUT_MS = 15_000;
const DATABASE_NAME = 'goencho-b2-canary-db-202609';
const ACCOUNT_PATTERN = /^[0-9a-f]{32}$/i;
const TOKEN_PATTERN = /^\S{20,256}$/;

export class CreateOnceProbeInputError extends Error {
  constructor(code) {
    super('Create-once probe input rejected');
    this.name = 'CreateOnceProbeInputError';
    this.code = code;
  }
}

function assertCredentialShape(accountId, token) {
  if (typeof accountId !== 'string' || !ACCOUNT_PATTERN.test(accountId)) {
    throw new CreateOnceProbeInputError('INVALID_ACCOUNT_INPUT');
  }
  if (typeof token !== 'string' || !TOKEN_PATTERN.test(token)) {
    throw new CreateOnceProbeInputError('INVALID_TOKEN_INPUT');
  }
}

async function readLimitedBody(response) {
  const declaredLength = Number(response.headers?.get?.('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_RESPONSE_BYTES) {
    try { await response.body?.cancel?.(); } catch {}
    return { safe: false, text: '' };
  }

  if (!response.body?.getReader) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > MAX_RESPONSE_BYTES) return { safe: false, text: '' };
    return { safe: true, text: new TextDecoder().decode(bytes) };
  }

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_RESPONSE_BYTES) {
      try { await reader.cancel(); } catch {}
      return { safe: false, text: '' };
    }
    chunks.push(value);
  }

  const combined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { safe: true, text: new TextDecoder().decode(combined) };
}

function extractD1Count(text) {
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed?.result) ? parsed.result.length : null;
  } catch {
    return null;
  }
}

function listResult({ attempted, success, httpStatus, errorCodes = [], d1Count }) {
  return Object.freeze({
    attempted,
    success,
    http_status: httpStatus,
    error_codes: Object.freeze([...errorCodes]),
    d1_count: d1Count,
  });
}

function createResult({ attempted, outcome, httpStatus, errorCodes = [], category, responseFormat }) {
  return Object.freeze({
    attempted,
    outcome,
    http_status: httpStatus,
    error_codes: Object.freeze([...errorCodes]),
    category,
    response_format: responseFormat,
  });
}

function output({ preflight, create, postcheck, postAttempts, stoppedReason }) {
  return Object.freeze({
    schema_version: 1,
    operation: 'free-1w-create-once',
    preflight,
    create,
    postcheck,
    post_attempts: postAttempts,
    write_methods_sent: postAttempts,
    stopped_reason: stoppedReason,
  });
}

function notAttemptedList() {
  return listResult({ attempted: false, success: false, httpStatus: null, d1Count: null });
}

function notAttemptedCreate() {
  return createResult({
    attempted: false,
    outcome: 'not_attempted',
    httpStatus: null,
    category: 'unknown',
    responseFormat: 'absent',
  });
}

async function runList({ url, token, fetchImpl }) {
  try {
    const response = await fetchImpl(url, {
      method: 'GET',
      headers: Object.freeze({ authorization: `Bearer ${token}`, accept: 'application/json' }),
      redirect: 'error',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const body = await readLimitedBody(response);
    const sanitized = sanitizeCloudflareResult({
      operation: 'd1-list',
      httpStatus: response.status,
      body: body.safe ? body.text : 'x'.repeat(MAX_RESPONSE_BYTES + 1),
    });
    const count = body.safe && sanitized.outcome === 'success' ? extractD1Count(body.text) : null;
    return listResult({
      attempted: true,
      success: sanitized.outcome === 'success' && Number.isInteger(count),
      httpStatus: sanitized.http_status,
      errorCodes: sanitized.error_codes,
      d1Count: count,
    });
  } catch {
    return listResult({ attempted: true, success: false, httpStatus: null, d1Count: null });
  }
}

async function runCreate({ url, token, fetchImpl }) {
  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: Object.freeze({
        authorization: `Bearer ${token}`,
        accept: 'application/json',
        'content-type': 'application/json',
      }),
      body: JSON.stringify({ name: DATABASE_NAME }),
      redirect: 'error',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const body = await readLimitedBody(response);
    const sanitized = sanitizeCloudflareResult({
      operation: 'd1-create',
      httpStatus: response.status,
      body: body.safe ? body.text : 'x'.repeat(MAX_RESPONSE_BYTES + 1),
    });
    return createResult({
      attempted: true,
      outcome: sanitized.outcome,
      httpStatus: sanitized.http_status,
      errorCodes: sanitized.error_codes,
      category: sanitized.category,
      responseFormat: sanitized.response_format,
    });
  } catch {
    const sanitized = sanitizeCloudflareResult({ operation: 'd1-create', transportError: true });
    return createResult({
      attempted: true,
      outcome: 'unknown',
      httpStatus: sanitized.http_status,
      errorCodes: sanitized.error_codes,
      category: sanitized.category,
      responseFormat: sanitized.response_format,
    });
  }
}

export function createCreateOnceProbeSession({ fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') throw new CreateOnceProbeInputError('INVALID_DEPENDENCY');
  let consumed = false;

  return Object.freeze({
    async run({ accountId, token }) {
      if (consumed) throw new CreateOnceProbeInputError('SESSION_ALREADY_CONSUMED');
      consumed = true;
      assertCredentialShape(accountId, token);

      const url = new URL(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database`);
      const preflightUrl = new URL(url);
      preflightUrl.searchParams.set('per_page', '10');
      preflightUrl.searchParams.set('page', '1');

      const preflight = await runList({ url: preflightUrl, token, fetchImpl });
      if (!preflight.success || preflight.d1_count !== 0) {
        return output({
          preflight,
          create: notAttemptedCreate(),
          postcheck: notAttemptedList(),
          postAttempts: 0,
          stoppedReason: preflight.d1_count === 0 ? 'preflight_failure' : 'resource_found',
        });
      }

      let postAttempts = 0;
      if (postAttempts !== 0) throw new CreateOnceProbeInputError('POST_ALREADY_ATTEMPTED');
      postAttempts = 1;
      const create = await runCreate({ url, token, fetchImpl });

      if (create.outcome === 'unknown') {
        return output({
          preflight,
          create,
          postcheck: notAttemptedList(),
          postAttempts,
          stoppedReason: 'outcome_unknown',
        });
      }
      if (create.outcome !== 'success') {
        return output({
          preflight,
          create,
          postcheck: notAttemptedList(),
          postAttempts,
          stoppedReason: 'http_failure',
        });
      }

      const postcheck = await runList({ url: preflightUrl, token, fetchImpl });
      return output({
        preflight,
        create,
        postcheck,
        postAttempts,
        stoppedReason: postcheck.success && postcheck.d1_count === 1 ? 'none' : 'postcheck_mismatch',
      });
    },
  });
}

async function main() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  delete process.env.CLOUDFLARE_API_TOKEN;

  try {
    const session = createCreateOnceProbeSession();
    const result = await session.run({ accountId, token });
    process.stdout.write(JSON.stringify(result));
  } catch {
    process.stdout.write(JSON.stringify({
      schema_version: 1,
      operation: 'free-1w-create-once',
      status: 'safe_stop',
    }));
    process.exitCode = 2;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await main();
}
