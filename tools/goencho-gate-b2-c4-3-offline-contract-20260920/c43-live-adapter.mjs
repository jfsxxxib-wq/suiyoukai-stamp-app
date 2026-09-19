import { createHash, randomBytes as osRandomBytes } from 'node:crypto';

export const BASE_COMMIT = '5d90a3e05c86851adccc35af0b8675f9f12c2245';
export const CANDIDATE_FILE_COUNT = 116;
export const CANDIDATE_TREE_SHA256 = '0015C1D9E2A882082BEB82DCFEADDD7321BF83BBBDDD8AFD6742F76A79520A8F';
export const DEPLOYMENT_CONTRACT_SHA256 = '960A67C4DDC1E9F3377383A3F60C58999E32A7B27CD0069E022F35D43E40E0BA';
export const WORKER_SHA256 = 'D52283968D001C8024A27B75A5BC7210453DA479A94098AD78FCEAB40F7D0564';
export const BOOTSTRAP_SHA256 = '3B05EDCF71B3CA9C5D883944CB625E459AF3D8E17CC732E0C339498DCCBA613F';
export const WRANGLER_CONFIG_SHA256 = 'A9391500702CEACE2DAD1A60F4A3E74ADB503EAB074C7504BEFECF82FF519470';
export const MIGRATION_0001_SHA256 = '0EAADB9E1A72D1947414F50A45073D0B00FD8E33DE8267E15288D10A2F6194ED';
export const MIGRATION_0002_SHA256 = '1391CCC7B0599C7B22191DD4BD8F801BA3218218E3D989D0199D164DE48D676C';
export const WORKER_NAME = 'goencho-b2-canary-202609';
export const D1_NAME = 'goencho-b2-canary-db-202609';
export const D1_BINDING = 'GOENCHO_DB';
export const ASSET_BINDING = 'ASSETS';
export const ZERO_D1_ID = '00000000-0000-0000-0000-000000000000';
export const SECRET_NAMES = Object.freeze([
  'GOENCHO_OWNER_PIN_PEPPER_V1',
  'GOENCHO_TEACHER_PIN_PEPPER_V1',
  'GOENCHO_DEVICE_TOKEN_HMAC_KEY_V1',
  'GOENCHO_SESSION_HMAC_KEY_V1',
  'GOENCHO_RECOVERY_CODE_PEPPER_V1',
]);

export class C43Stop extends Error {
  constructor(code) {
    super('B2-2C4-3 safe stop');
    this.name = 'C43Stop';
    this.code = code;
  }
}

function assert(condition, code) {
  if (!condition) throw new C43Stop(code);
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

export function stableJson(value) {
  return JSON.stringify(stableValue(value));
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex').toUpperCase();
}

export const BASELINE = Object.freeze({
  commit: BASE_COMMIT,
  candidate_files: CANDIDATE_FILE_COUNT,
  candidate_tree_sha256: CANDIDATE_TREE_SHA256,
  deployment_contract_sha256: DEPLOYMENT_CONTRACT_SHA256,
  worker_sha256: WORKER_SHA256,
  bootstrap_sha256: BOOTSTRAP_SHA256,
  wrangler_config_sha256: WRANGLER_CONFIG_SHA256,
  migration_0001_sha256: MIGRATION_0001_SHA256,
  migration_0002_sha256: MIGRATION_0002_SHA256,
  migration_0003_present: false,
  wrangler_version: '4.112.0',
  node_minimum_major: 24,
});

export const OFFICIAL_BEHAVIOR = Object.freeze({
  secret_bulk: Object.freeze({ client_attempts: 1, internal_request: 'PATCH secrets-bulk', creates_intermediate_version: true, immediately_deploys: true }),
  full_deploy: Object.freeze({ client_attempts: 1, separate_deploy: true, preserves_secrets: true, strict: true }),
  mutation_stages: 2,
  retry: 0,
  rollback: 0,
});

export const TOOL_POLICY = Object.freeze({
  send_metrics: false,
  dependency_instrumentation: false,
  automatic_provisioning: false,
  install_skills: false,
  profile_auto_selection: false,
  update_check: false,
  strict: true,
});

export const REQUEST_BUDGET = Object.freeze({
  schema_version: 1,
  client_attempts: Object.freeze({ preflight: 1, secret_bulk: 1, full_deploy: 1, postcheck: 1 }),
  retry: 0,
  direct_control_plane: Object.freeze([
    Object.freeze({ phase: 'preflight', method: 'GET', path: '/accounts/{account}/workers/scripts/{worker}/settings', max: 1 }),
    Object.freeze({ phase: 'preflight', method: 'GET', path: '/accounts/{account}/workers/scripts/{worker}', max: 1 }),
    Object.freeze({ phase: 'preflight', method: 'GET', path: '/accounts/{account}/d1/database?name={d1}', max: 1 }),
    Object.freeze({ phase: 'postcheck', method: 'GET', path: '/accounts/{account}/workers/scripts/{worker}/settings', max: 1 }),
    Object.freeze({ phase: 'postcheck', method: 'GET', path: '/accounts/{account}/workers/scripts/{worker}/secrets', max: 1 }),
  ]),
  wrangler_children: Object.freeze([
    Object.freeze({ phase: 'secret_bulk', command: 'secret bulk', max_processes: 1, expected_internal: Object.freeze([{ method: 'PATCH', path: '/accounts/{account}/workers/scripts/{worker}/secrets-bulk', max: 1 }]) }),
    Object.freeze({ phase: 'full_deploy', command: 'deploy', max_processes: 1, expected_internal: Object.freeze([
      Object.freeze({ method: 'POST', path: '/accounts/{account}/workers/scripts/{worker}/assets-upload-session', max: 1 }),
      Object.freeze({ method: 'POST', path: '{assets-upload-session-provided-url}', max: 1, conditional: 'only when missing asset payload exists' }),
      Object.freeze({ method: 'PUT', path: '/accounts/{account}/workers/scripts/{worker}', max: 1 }),
    ]) }),
  ]),
  forbidden: Object.freeze(['D1_QUERY', 'D1_RAW', 'RUNTIME_REQUEST', 'ROUTE_WRITE', 'TOKEN_WRITE', 'SECRET_DELETE', 'ROLLBACK']),
});

export function validateToolPolicy(policy) {
  assert(stableJson(policy) === stableJson(TOOL_POLICY), 'TOOL_POLICY_MISMATCH');
  return true;
}

export function validateTokenPolicy(policy) {
  assert(policy?.account_scope_count === 1 && policy.target_account_only === true, 'TOKEN_ACCOUNT_SCOPE_INVALID');
  const permissions = [...(policy.permissions ?? [])].sort();
  assert(stableJson(permissions) === stableJson(['D1 Read', 'Workers Scripts Write']), 'TOKEN_PERMISSION_INVALID');
  assert(policy.zone_permissions === 0, 'TOKEN_ZONE_PERMISSION_FORBIDDEN');
  assert(policy.all_accounts === false, 'TOKEN_ALL_ACCOUNTS_FORBIDDEN');
  assert(policy.expires_within_hours > 0 && policy.expires_within_hours <= 24, 'TOKEN_EXPIRY_INVALID');
  return true;
}

function exactSet(actual, expected) {
  return stableJson([...(actual ?? [])].sort()) === stableJson([...expected].sort());
}

export function validatePreflight(value) {
  assert(value?.account_count === 1 && value.target_account === true, 'PREFLIGHT_ACCOUNT_INVALID');
  assert(value.worker_count === 1 && value.worker_name === WORKER_NAME, 'PREFLIGHT_WORKER_INVALID');
  assert(value.d1_count === 1 && value.d1_name === D1_NAME, 'PREFLIGHT_D1_INVALID');
  assert(/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(value.d1_id) && value.d1_id !== ZERO_D1_ID, 'PREFLIGHT_D1_ID_INVALID');
  assert(value.remote_code_sha256 === BOOTSTRAP_SHA256, 'REMOTE_CODE_HASH_MISMATCH');
  assert(exactSet(value.bindings, [ASSET_BINDING, D1_BINDING]), 'PREFLIGHT_BINDING_INVALID');
  assert((value.vars ?? []).length === 0, 'PREFLIGHT_VAR_FORBIDDEN');
  assert(value.routes === 0 && value.schedules === 0 && value.preview_urls === false && value.workers_dev === false, 'PREFLIGHT_EXPOSURE_INVALID');
  assert(value.observability === false && value.logs === false && value.traces === false && value.logpush === false, 'PREFLIGHT_OBSERVABILITY_INVALID');
  return true;
}

export function createDescriptorConfig(source, d1Id) {
  assert(/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(d1Id) && d1Id !== ZERO_D1_ID, 'DESCRIPTOR_D1_ID_INVALID');
  assert(Array.isArray(source?.d1_databases) && source.d1_databases.length === 1, 'DESCRIPTOR_D1_COUNT_INVALID');
  const original = source.d1_databases[0];
  assert(original.binding === D1_BINDING && original.database_name === D1_NAME, 'DESCRIPTOR_D1_TARGET_INVALID');
  const descriptor = structuredClone(source);
  descriptor.d1_databases[0].database_id = d1Id;
  descriptor.send_metrics = false;
  descriptor.dependencies_instrumentation = { enabled: false };
  return descriptor;
}

export async function withEphemeralDescriptor({ source, d1Id, store, run }) {
  assert(store && typeof store.create === 'function' && typeof store.inspect === 'function' && typeof store.remove === 'function', 'DESCRIPTOR_STORE_INVALID');
  assert(typeof run === 'function', 'DESCRIPTOR_RUNNER_INVALID');
  const bytes = Buffer.from(`${stableJson(createDescriptorConfig(source, d1Id))}\n`, 'utf8');
  let handle;
  try {
    handle = await store.create(bytes, { acl: 'current-user-only', creates: 1 });
    const state = await store.inspect(handle);
    assert(state?.exists === true && state.acl === 'current-user-only' && state.create_count === 1, 'DESCRIPTOR_ACL_INVALID');
    return await run(handle);
  } finally {
    bytes.fill(0);
    if (handle !== undefined) await store.remove(handle);
  }
}

function ownedBuffer(value) {
  assert(Buffer.isBuffer(value) || value instanceof Uint8Array, 'SECRET_BUFFER_REQUIRED');
  return Buffer.from(value);
}

export function generateSecretMaterial(randomBytes = osRandomBytes) {
  assert(typeof randomBytes === 'function', 'CSPRNG_REQUIRED');
  const values = new Map();
  const seen = new Set();
  try {
    for (const name of SECRET_NAMES) {
      const entropy = ownedBuffer(randomBytes(32));
      assert(entropy.length >= 32, 'SECRET_TOO_SHORT');
      const fingerprint = sha256(entropy);
      assert(!seen.has(fingerprint), 'SECRET_DUPLICATE');
      seen.add(fingerprint);
      const value = Buffer.from(entropy.toString('base64url'), 'ascii');
      entropy.fill(0);
      values.set(name, value);
    }
    return new SecretSet(values);
  } catch (error) {
    for (const value of values.values()) value.fill(0);
    throw error;
  }
}

export class SecretSet {
  constructor(values) {
    assert(values instanceof Map && exactSet(values.keys(), SECRET_NAMES), 'SECRET_NAME_SET_INVALID');
    this.values = values;
    this.zeroed = false;
  }

  toBulkStdin() {
    assert(!this.zeroed, 'SECRET_ALREADY_ZEROED');
    const chunks = [Buffer.from('{', 'ascii')];
    SECRET_NAMES.forEach((name, index) => {
      if (index) chunks.push(Buffer.from(',', 'ascii'));
      chunks.push(Buffer.from(`${JSON.stringify(name)}:"`, 'ascii'), this.values.get(name), Buffer.from('"', 'ascii'));
    });
    chunks.push(Buffer.from('}', 'ascii'));
    return Buffer.concat(chunks);
  }

  zeroize() {
    for (const value of this.values.values()) value.fill(0);
    this.zeroed = true;
  }

  allZero() {
    return [...this.values.values()].every((value) => value.every((byte) => byte === 0));
  }
}

export function buildWranglerSpecs({ nodePath, wranglerPath, configPath, candidateRoot }) {
  for (const value of [nodePath, wranglerPath, configPath, candidateRoot]) assert(typeof value === 'string' && value.length > 0, 'WRANGLER_PATH_INVALID');
  const common = ['--config', configPath, '--name', WORKER_NAME, '--experimental-provision=false', '--install-skills=false'];
  const environment = Object.freeze({
    CI: 'true',
    NO_COLOR: '1',
    WRANGLER_HIDE_BANNER: 'true',
    WRANGLER_SEND_METRICS: 'false',
    CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false',
  });
  return Object.freeze({
    executable: nodePath,
    cwd: candidateRoot,
    env: environment,
    secret_bulk: Object.freeze({ args: Object.freeze([wranglerPath, 'secret', 'bulk', ...common]), stdin: 'required', attempts: 1, timeout_ms: 120_000 }),
    deploy: Object.freeze({ args: Object.freeze([wranglerPath, 'deploy', '--strict', ...common]), stdin: 'none', attempts: 1, timeout_ms: 180_000 }),
  });
}

function postcheckSafe(value) {
  return value?.worker_count === 1
    && value.worker_name === WORKER_NAME
    && value.d1_binding === D1_BINDING
    && value.d1_name === D1_NAME
    && exactSet(value.secret_names, SECRET_NAMES)
    && value.routes === 0
    && value.schedules === 0
    && value.preview_urls === false
    && value.workers_dev === false
    && value.observability === false
    && value.runtime_requests === 0
    && value.d1_queries === 0;
}

function safeResult(phase, attempts, stop, postcheck = false) {
  return Object.freeze({
    schema_version: 1,
    operation: 'b2-2c4-3-live-adapter',
    phase,
    attempts: Object.freeze({ ...attempts }),
    mutation_stages: attempts.secret_bulk + attempts.deploy,
    postcheck_safe: Boolean(postcheck),
    stop,
  });
}

export function createSingleUseLiveSession({ adapters }) {
  for (const key of ['preflight', 'secretBulk', 'deploy', 'postcheck']) assert(typeof adapters?.[key] === 'function', `ADAPTER_${key.toUpperCase()}_REQUIRED`);
  let consumed = false;
  return Object.freeze({
    async run(secrets) {
      assert(!consumed, 'SESSION_ALREADY_CONSUMED');
      consumed = true;
      const attempts = { preflight: 0, secret_bulk: 0, deploy: 0, postcheck: 0 };
      let phase = 'preflight';
      let payload;
      try {
        attempts.preflight = 1;
        validatePreflight(await adapters.preflight());
        phase = 'secret_bulk';
        payload = secrets.toBulkStdin();
        attempts.secret_bulk = 1;
        let secretResult;
        try { secretResult = await adapters.secretBulk(payload); } catch { secretResult = { outcome: 'unknown' }; }
        payload.fill(0);
        payload = undefined;
        if (secretResult?.outcome !== 'success' || secretResult.complete !== true) return safeResult(phase, attempts, 'SECRET_STATE_UNKNOWN');
        phase = 'deploy';
        attempts.deploy = 1;
        let deployResult;
        try { deployResult = await adapters.deploy(); } catch { deployResult = { outcome: 'unknown' }; }
        phase = 'postcheck';
        attempts.postcheck = 1;
        let checked = false;
        try { checked = postcheckSafe(await adapters.postcheck()); } catch { checked = false; }
        if (deployResult?.outcome !== 'success' || deployResult.complete !== true) return safeResult(phase, attempts, 'DEPLOY_STATE_UNKNOWN', checked);
        if (!checked) return safeResult(phase, attempts, 'POSTCHECK_STOP');
        return safeResult('complete', attempts, 'none', true);
      } catch (error) {
        return safeResult(phase, attempts, error instanceof C43Stop ? error.code : 'SAFE_STOP');
      } finally {
        if (payload) payload.fill(0);
        secrets.zeroize();
      }
    },
  });
}

export function validateObservedRequests(observed, budget = REQUEST_BUDGET) {
  assert(Array.isArray(observed), 'REQUEST_TRACE_REQUIRED');
  const allowed = [];
  for (const entry of budget.direct_control_plane) allowed.push({ phase: entry.phase, method: entry.method, path: entry.path, max: entry.max });
  for (const child of budget.wrangler_children) {
    for (const entry of child.expected_internal) allowed.push({ phase: child.phase, method: entry.method, path: entry.path, max: entry.max });
  }
  const counts = new Map();
  for (const request of observed) {
    const match = allowed.find((entry) => entry.phase === request.phase && entry.method === request.method && entry.path === request.path);
    assert(match, 'UNKNOWN_ENDPOINT');
    const key = stableJson(match);
    const count = (counts.get(key) ?? 0) + 1;
    assert(count <= match.max, 'REQUEST_BUDGET_EXCEEDED');
    counts.set(key, count);
  }
  return true;
}

export function assertSafeSerializedResult(result, forbiddenValues = []) {
  const text = stableJson(result);
  for (const value of forbiddenValues) assert(!text.includes(String(value)), 'SAFE_OUTPUT_LEAK');
  assert(!/(?:https?:\/\/|authorization|bearer|account[_-]?id|database[_-]?id|version[_-]?id|stderr|raw[_-]?response)/i.test(text), 'SAFE_OUTPUT_FIELD_FORBIDDEN');
  return true;
}
