import { execFile } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sanitizeCloudflareResult } from './cloudflare-error-sanitizer.mjs';

const MAX_RESPONSE_BYTES = 64 * 1024;
const REQUEST_TIMEOUT_MS = 15_000;
const ACCOUNT_PATTERN = /^[0-9a-f]{32}$/i;
const TOKEN_PATTERN = /^\S{20,256}$/;
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const wranglerBin = join(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js');

export class ReadonlyProbeInputError extends Error {
  constructor(code) {
    super('Readonly probe input rejected');
    this.name = 'ReadonlyProbeInputError';
    this.code = code;
  }
}

function assertCredentialShape(accountId, token) {
  if (typeof accountId !== 'string' || !ACCOUNT_PATTERN.test(accountId)) {
    throw new ReadonlyProbeInputError('INVALID_ACCOUNT_INPUT');
  }
  if (typeof token !== 'string' || !TOKEN_PATTERN.test(token)) {
    throw new ReadonlyProbeInputError('INVALID_TOKEN_INPUT');
  }
}

async function readLimitedBody(response) {
  const declaredLength = Number(response.headers?.get?.('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_RESPONSE_BYTES) {
    try {
      await response.body?.cancel?.();
    } catch {
      // The raw error is deliberately ignored.
    }
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
      try {
        await reader.cancel();
      } catch {
        // The raw error is deliberately ignored.
      }
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

function directResult(values) {
  return Object.freeze({
    attempted: values.attempted,
    success: values.success,
    http_status: values.httpStatus,
    error_codes: Object.freeze([...values.errorCodes]),
    d1_count: values.d1Count,
  });
}

function wranglerResult(values) {
  return Object.freeze({
    attempted: values.attempted,
    success: values.success,
    exit_code: values.exitCode,
    d1_count: values.d1Count,
  });
}

function finalResult({ direct, wrangler, stoppedReason }) {
  const countsMatch = Number.isInteger(direct.d1_count) && Number.isInteger(wrangler.d1_count)
    ? direct.d1_count === wrangler.d1_count
    : null;
  return Object.freeze({
    schema_version: 1,
    operation: 'free-1r-external',
    direct,
    wrangler,
    same_account_input: true,
    counts_match: countsMatch,
    write_methods_sent: 0,
    stopped_reason: stoppedReason,
  });
}

async function runDirectList({ accountId, token, fetchImpl }) {
  const url = new URL(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database`);
  url.searchParams.set('per_page', '10');
  url.searchParams.set('page', '1');

  try {
    const response = await fetchImpl(url, {
      method: 'GET',
      headers: Object.freeze({
        authorization: `Bearer ${token}`,
        accept: 'application/json',
      }),
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
    return directResult({
      attempted: true,
      success: sanitized.outcome === 'success' && Number.isInteger(count),
      httpStatus: sanitized.http_status,
      errorCodes: sanitized.error_codes,
      d1Count: count,
    });
  } catch {
    const sanitized = sanitizeCloudflareResult({
      operation: 'd1-list',
      transportError: true,
    });
    return directResult({
      attempted: true,
      success: false,
      httpStatus: sanitized.http_status,
      errorCodes: sanitized.error_codes,
      d1Count: null,
    });
  }
}

function defaultWranglerRunner({ accountId, token }) {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      [wranglerBin, 'd1', 'list', '--json'],
      {
        cwd: root,
        env: {
          ...process.env,
          CLOUDFLARE_ACCOUNT_ID: accountId,
          CLOUDFLARE_API_TOKEN: token,
          WRANGLER_SEND_METRICS: 'false',
        },
        encoding: 'utf8',
        maxBuffer: MAX_RESPONSE_BYTES,
        timeout: REQUEST_TIMEOUT_MS,
        windowsHide: true,
      },
      (error, stdout) => {
        const exitCode = error ? (Number.isInteger(error.code) ? error.code : 1) : 0;
        resolve({ exitCode, stdout: typeof stdout === 'string' ? stdout : '' });
      },
    );
  });
}

async function runWranglerList({ accountId, token, runWrangler }) {
  try {
    const result = await runWrangler({ accountId, token });
    if (!result || !Number.isInteger(result.exitCode) || result.stdout.length > MAX_RESPONSE_BYTES) {
      return wranglerResult({ attempted: true, success: false, exitCode: 1, d1Count: null });
    }
    if (result.exitCode !== 0) {
      return wranglerResult({ attempted: true, success: false, exitCode: result.exitCode, d1Count: null });
    }
    let parsed;
    try {
      parsed = JSON.parse(result.stdout);
    } catch {
      return wranglerResult({ attempted: true, success: false, exitCode: 0, d1Count: null });
    }
    const count = Array.isArray(parsed) ? parsed.length : null;
    return wranglerResult({
      attempted: true,
      success: Number.isInteger(count),
      exitCode: 0,
      d1Count: count,
    });
  } catch {
    return wranglerResult({ attempted: true, success: false, exitCode: 1, d1Count: null });
  }
}

export async function runReadOnlyProbe({
  accountId,
  token,
  fetchImpl = globalThis.fetch,
  runWrangler = defaultWranglerRunner,
}) {
  assertCredentialShape(accountId, token);
  if (typeof fetchImpl !== 'function' || typeof runWrangler !== 'function') {
    throw new ReadonlyProbeInputError('INVALID_DEPENDENCY');
  }

  const direct = await runDirectList({ accountId, token, fetchImpl });
  if (Number.isInteger(direct.d1_count) && direct.d1_count !== 0) {
    return finalResult({
      direct,
      wrangler: wranglerResult({ attempted: false, success: false, exitCode: null, d1Count: null }),
      stoppedReason: 'resource_found',
    });
  }

  const wrangler = await runWranglerList({ accountId, token, runWrangler });
  let stoppedReason = 'none';
  if (Number.isInteger(wrangler.d1_count) && wrangler.d1_count !== 0) stoppedReason = 'resource_found';
  else if (direct.success && wrangler.success && direct.d1_count !== wrangler.d1_count) stoppedReason = 'count_mismatch';
  else if (!direct.success || !wrangler.success) stoppedReason = 'read_failure';

  return finalResult({ direct, wrangler, stoppedReason });
}

async function main() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  delete process.env.CLOUDFLARE_API_TOKEN;

  try {
    const result = await runReadOnlyProbe({ accountId, token });
    process.stdout.write(JSON.stringify(result));
  } catch {
    process.stdout.write(JSON.stringify({
      schema_version: 1,
      operation: 'free-1r-external',
      status: 'safe_stop',
    }));
    process.exitCode = 2;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await main();
}
