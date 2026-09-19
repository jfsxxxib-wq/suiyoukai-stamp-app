import { execFile } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sanitizeCloudflareResult } from './cloudflare-error-sanitizer.mjs';

const WORKER_NAME = 'goencho-b2-canary-202609';
const ACCOUNT_PATTERN = /^[0-9a-f]{32}$/i;
const TOKEN_PATTERN = /^\S{20,512}$/;
const MAX_RESPONSE_BYTES = 64 * 1024;
const REQUEST_TIMEOUT_MS = 15_000;
const DEPLOY_TIMEOUT_MS = 120_000;
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const wranglerBin = join(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js');

export class WorkerDeployOnceInputError extends Error {
  constructor(code) {
    super('Worker deploy-once input rejected');
    this.name = 'WorkerDeployOnceInputError';
    this.code = code;
  }
}

function assertCredentialShape(accountId, token) {
  if (typeof accountId !== 'string' || !ACCOUNT_PATTERN.test(accountId)) {
    throw new WorkerDeployOnceInputError('INVALID_ACCOUNT_INPUT');
  }
  if (typeof token !== 'string' || !TOKEN_PATTERN.test(token)) {
    throw new WorkerDeployOnceInputError('INVALID_TOKEN_INPUT');
  }
}

async function readLimitedBody(response) {
  const declaredLength = Number(response.headers?.get?.('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_RESPONSE_BYTES) {
    try { await response.body?.cancel?.(); } catch {}
    return { safe: false, text: '' };
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_RESPONSE_BYTES) return { safe: false, text: '' };
  return { safe: true, text: new TextDecoder().decode(bytes) };
}

function parseEnvelope(text) {
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || parsed.success !== true) return null;
    return parsed.result;
  } catch {
    return null;
  }
}

async function getEnvelope({ operation, url, token, fetchImpl }) {
  try {
    const response = await fetchImpl(url, {
      method: 'GET',
      headers: Object.freeze({ authorization: `Bearer ${token}`, accept: 'application/json' }),
      redirect: 'error',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const body = await readLimitedBody(response);
    const sanitized = sanitizeCloudflareResult({
      operation,
      httpStatus: response.status,
      body: body.safe ? body.text : 'x'.repeat(MAX_RESPONSE_BYTES + 1),
    });
    const result = body.safe && sanitized.outcome === 'success' ? parseEnvelope(body.text) : null;
    return Object.freeze({
      attempted: true,
      success: sanitized.outcome === 'success' && result !== null,
      http_status: sanitized.http_status,
      error_codes: Object.freeze([...sanitized.error_codes]),
      result,
    });
  } catch {
    const sanitized = sanitizeCloudflareResult({ operation, transportError: true });
    return Object.freeze({
      attempted: true,
      success: false,
      http_status: sanitized.http_status,
      error_codes: Object.freeze([...sanitized.error_codes]),
      result: null,
    });
  }
}

function baseRead(read) {
  return Object.freeze({
    attempted: read.attempted,
    success: read.success,
    http_status: read.http_status,
    error_codes: read.error_codes,
  });
}

async function readWorkerList({ baseUrl, token, fetchImpl }) {
  const read = await getEnvelope({ operation: 'worker-list', url: `${baseUrl}/workers/scripts`, token, fetchImpl });
  const list = Array.isArray(read.result) ? read.result : null;
  const target = list?.find((entry) => entry && typeof entry === 'object' && entry.id === WORKER_NAME);
  return Object.freeze({
    ...baseRead(read),
    worker_count: list?.length ?? null,
    target_present: Boolean(target),
    target_routes_count: target ? (Array.isArray(target.routes) ? target.routes.length : 0) : null,
  });
}

async function readSubdomain({ baseUrl, token, fetchImpl }) {
  const read = await getEnvelope({
    operation: 'worker-subdomain',
    url: `${baseUrl}/workers/scripts/${WORKER_NAME}/subdomain`,
    token,
    fetchImpl,
  });
  return Object.freeze({
    ...baseRead(read),
    enabled: typeof read.result?.enabled === 'boolean' ? read.result.enabled : null,
    previews_enabled: typeof read.result?.previews_enabled === 'boolean'
      ? read.result.previews_enabled
      : null,
  });
}

function observabilitySummary(result) {
  return Object.freeze({
    observability_enabled: typeof result?.observability?.enabled === 'boolean'
      ? result.observability.enabled
      : null,
    logs_enabled: typeof result?.observability?.logs?.enabled === 'boolean'
      ? result.observability.logs.enabled
      : null,
    invocation_logs: typeof result?.observability?.logs?.invocation_logs === 'boolean'
      ? result.observability.logs.invocation_logs
      : null,
    traces_enabled: typeof result?.observability?.traces?.enabled === 'boolean'
      ? result.observability.traces.enabled
      : null,
  });
}

async function readVersionSettings({ baseUrl, token, fetchImpl }) {
  const read = await getEnvelope({
    operation: 'worker-version-settings',
    url: `${baseUrl}/workers/scripts/${WORKER_NAME}/settings`,
    token,
    fetchImpl,
  });
  return Object.freeze({
    ...baseRead(read),
    bindings_count: Array.isArray(read.result?.bindings) ? read.result.bindings.length : null,
    ...observabilitySummary(read.result),
  });
}

async function readScriptSettings({ baseUrl, token, fetchImpl }) {
  const read = await getEnvelope({
    operation: 'worker-script-settings',
    url: `${baseUrl}/workers/scripts/${WORKER_NAME}/script-settings`,
    token,
    fetchImpl,
  });
  return Object.freeze({
    ...baseRead(read),
    logpush: typeof read.result?.logpush === 'boolean' ? read.result.logpush : null,
    tail_consumers_count: Array.isArray(read.result?.tail_consumers)
      ? read.result.tail_consumers.length
      : null,
    ...observabilitySummary(read.result),
  });
}

async function readArrayCount({ operation, url, token, fetchImpl }) {
  const read = await getEnvelope({ operation, url, token, fetchImpl });
  return Object.freeze({
    ...baseRead(read),
    count: Array.isArray(read.result) ? read.result.length : null,
  });
}

function realDeploy({ accountId, token }) {
  return new Promise((resolve) => {
    const environment = {
      ...process.env,
      CLOUDFLARE_ACCOUNT_ID: accountId,
      CLOUDFLARE_API_TOKEN: token,
      WRANGLER_SEND_METRICS: 'false',
      CI: 'true',
      NO_COLOR: '1',
    };
    for (const name of ['CLOUDFLARE_API_KEY', 'CF_API_KEY', 'CF_API_TOKEN']) delete environment[name];
    execFile(
      process.execPath,
      [
        wranglerBin,
        'deploy',
        '--config',
        'wrangler.bootstrap.jsonc',
      ],
      {
        cwd: root,
        env: environment,
        windowsHide: true,
        timeout: DEPLOY_TIMEOUT_MS,
        maxBuffer: 128 * 1024,
      },
      (error) => {
        if (!error) {
          resolve(Object.freeze({ attempted: true, outcome: 'success', exit_code: 0 }));
          return;
        }
        resolve(Object.freeze({
          attempted: true,
          outcome: 'unknown',
          exit_code: Number.isInteger(error.code) ? error.code : null,
        }));
      },
    );
  });
}

function emptyPostcheck() {
  return Object.freeze({
    worker_list: null,
    subdomain: null,
    version_settings: null,
    script_settings: null,
    secrets: null,
    schedules: null,
    all_safe: false,
  });
}

function checksAreSafe(checks) {
  return checks.worker_list.success
    && checks.worker_list.worker_count === 1
    && checks.worker_list.target_present
    && checks.worker_list.target_routes_count === 0
    && checks.subdomain.success
    && checks.subdomain.enabled === false
    && checks.subdomain.previews_enabled === false
    && checks.version_settings.success
    && checks.version_settings.bindings_count === 0
    && checks.version_settings.observability_enabled === false
    && checks.version_settings.logs_enabled === false
    && checks.version_settings.invocation_logs === false
    && checks.version_settings.traces_enabled === false
    && checks.script_settings.success
    && checks.script_settings.logpush === false
    && checks.script_settings.tail_consumers_count === 0
    && checks.script_settings.observability_enabled === false
    && checks.script_settings.logs_enabled === false
    && checks.script_settings.invocation_logs === false
    && checks.script_settings.traces_enabled === false
    && checks.secrets.success
    && checks.secrets.count === 0
    && checks.schedules.success
    && checks.schedules.count === 0;
}

export function createWorkerDeployOnceSession({ fetchImpl = globalThis.fetch, deployImpl = realDeploy } = {}) {
  if (typeof fetchImpl !== 'function' || typeof deployImpl !== 'function') {
    throw new WorkerDeployOnceInputError('INVALID_DEPENDENCY');
  }
  let consumed = false;

  return Object.freeze({
    async run({ accountId, token }) {
      if (consumed) throw new WorkerDeployOnceInputError('SESSION_ALREADY_CONSUMED');
      consumed = true;
      assertCredentialShape(accountId, token);
      const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}`;
      const preflight = await readWorkerList({ baseUrl, token, fetchImpl });
      if (!preflight.success || preflight.worker_count !== 0 || preflight.target_present) {
        return Object.freeze({
          schema_version: 1,
          operation: 'b2-2c1-worker-create-once',
          preflight,
          deploy: Object.freeze({ attempted: false, outcome: 'not_attempted', exit_code: null }),
          postcheck: emptyPostcheck(),
          deploy_attempts: 0,
          stopped_reason: preflight.success ? 'resource_found' : 'preflight_failure',
        });
      }

      const deploy = await deployImpl({ accountId, token });
      const workerList = await readWorkerList({ baseUrl, token, fetchImpl });
      if (!workerList.success || !workerList.target_present) {
        return Object.freeze({
          schema_version: 1,
          operation: 'b2-2c1-worker-create-once',
          preflight,
          deploy,
          postcheck: Object.freeze({ ...emptyPostcheck(), worker_list: workerList }),
          deploy_attempts: 1,
          stopped_reason: deploy.outcome === 'success' ? 'postcheck_failed' : 'deploy_outcome_unknown',
        });
      }

      const [subdomain, versionSettings, scriptSettings, secrets, schedules] = await Promise.all([
        readSubdomain({ baseUrl, token, fetchImpl }),
        readVersionSettings({ baseUrl, token, fetchImpl }),
        readScriptSettings({ baseUrl, token, fetchImpl }),
        readArrayCount({
          operation: 'worker-secrets',
          url: `${baseUrl}/workers/scripts/${WORKER_NAME}/secrets`,
          token,
          fetchImpl,
        }),
        readArrayCount({
          operation: 'worker-schedules',
          url: `${baseUrl}/workers/scripts/${WORKER_NAME}/schedules`,
          token,
          fetchImpl,
        }),
      ]);
      const checks = { worker_list: workerList, subdomain, version_settings: versionSettings,
        script_settings: scriptSettings, secrets, schedules };
      const postcheck = Object.freeze({ ...checks, all_safe: checksAreSafe(checks) });
      const stoppedReason = deploy.outcome !== 'success'
        ? 'deploy_outcome_unknown'
        : postcheck.all_safe ? 'none' : 'postcheck_failed';
      return Object.freeze({
        schema_version: 1,
        operation: 'b2-2c1-worker-create-once',
        preflight,
        deploy,
        postcheck,
        deploy_attempts: 1,
        stopped_reason: stoppedReason,
      });
    },
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (process.argv[2] !== '--run') throw new WorkerDeployOnceInputError('EXPLICIT_RUN_REQUIRED');
  const session = createWorkerDeployOnceSession();
  const result = await session.run({
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    token: process.env.CLOUDFLARE_API_TOKEN,
  });
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (result.stopped_reason !== 'none') process.exitCode = 2;
}
