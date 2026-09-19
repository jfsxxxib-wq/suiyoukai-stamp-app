import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';

export const BASE_COMMIT = '9afbc0dea94dd6af2a247a03d01898d0e9d03c2c';
export const CANDIDATE_TREE_SHA256 = '0015C1D9E2A882082BEB82DCFEADDD7321BF83BBBDDD8AFD6742F76A79520A8F';
export const WRANGLER_SHA256 = 'A9391500702CEACE2DAD1A60F4A3E74ADB503EAB074C7504BEFECF82FF519470';
export const PACKAGE_SHA256 = '54C9EDBD4ACB099CB583CA4ADF1C0E70849B91B6ABDE4734864827469BEC37AF';
export const LOCK_SHA256 = '0C97645531AAC68DF0CB6B0920FCDBAB020379945D6B2576C16B4F9422DAF94D';
export const MANIFEST_SHA256 = 'F967FE27B90EAE2C98F1C42BFD5EFDB0E6B38E0D17195769425E18AB9FAF2FA6';
export const MIGRATION_0001_SHA256 = '0EAADB9E1A72D1947414F50A45073D0B00FD8E33DE8267E15288D10A2F6194ED';
export const MIGRATION_0002_SHA256 = '1391CCC7B0599C7B22191DD4BD8F801BA3218218E3D989D0199D164DE48D676C';

export const EXPECTED_WORKER_SHA256 = 'D52283968D001C8024A27B75A5BC7210453DA479A94098AD78FCEAB40F7D0564';

export const WORKER_NAME = 'goencho-b2-canary-202609';
export const D1_NAME = 'goencho-b2-canary-db-202609';
export const D1_BINDING = 'GOENCHO_DB';
export const ASSET_BINDING = 'ASSETS';
export const ZERO_D1_ID = '00000000-0000-0000-0000-000000000000';
export const D1_ID_SENTINEL = '__RUNTIME_VERIFIED_D1_DATABASE_ID__';

export const SECRET_NAMES = Object.freeze([
  'GOENCHO_OWNER_PIN_PEPPER_V1',
  'GOENCHO_TEACHER_PIN_PEPPER_V1',
  'GOENCHO_DEVICE_TOKEN_HMAC_KEY_V1',
  'GOENCHO_SESSION_HMAC_KEY_V1',
  'GOENCHO_RECOVERY_CODE_PEPPER_V1',
]);

export const INPUT_FIELD_NAMES = Object.freeze([
  'account_id',
  'api_token',
  ...SECRET_NAMES,
]);

const FORBIDDEN_CONFIG_KEYS = Object.freeze([
  'route', 'routes', 'triggers', 'vars', 'services', 'dispatch_namespaces', 'tail_consumers',
]);

export class C42Stop extends Error {
  constructor(code) {
    super('B2-2C4-2 safe stop');
    this.name = 'C42Stop';
    this.code = code;
  }
}

export function sha256Bytes(bytes) {
  return createHash('sha256').update(bytes).digest('hex').toUpperCase();
}

export function sha256File(path) {
  return sha256Bytes(readFileSync(path));
}

function filesBelow(root, { excludeRuntime = false } = {}) {
  const found = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory() && excludeRuntime && ['node_modules', '.local', '.wrangler'].includes(entry.name)) {
        continue;
      }
      const full = join(directory, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile()) found.push(full);
    }
  };
  visit(root);
  return found;
}

export function candidateTreeHash(candidateRoot) {
  const lines = filesBelow(candidateRoot, { excludeRuntime: true })
    .map((path) => ({ path: relative(candidateRoot, path), hash: sha256File(path) }))
    .sort((left, right) => left.path.localeCompare(right.path, 'en'))
    .map(({ path, hash }) => `${path}\t${hash}`);
  return Object.freeze({ count: lines.length, hash: sha256Bytes(Buffer.from(lines.join('\n'), 'utf8')) });
}

export function canonicalFileManifest(root) {
  const entries = filesBelow(root)
    .map((path) => ({
      path: relative(root, path).split(sep).join('/'),
      bytes: statSync(path).size,
      sha256: sha256File(path),
    }))
    .sort((left, right) => left.path.localeCompare(right.path, 'en'));
  const canonical = entries.map(({ path, bytes, sha256 }) => `${path}\t${bytes}\t${sha256}`).join('\n');
  return Object.freeze({ entries: Object.freeze(entries), hash: sha256Bytes(Buffer.from(canonical, 'utf8')) });
}

function canonicalBundleSnapshot(root) {
  const paths = filesBelow(root);
  const names = paths.map((path) => relative(root, path).split(sep).join('/')).sort();
  assert(stableJson(names) === stableJson(['README.md', 'worker.js', 'worker.js.map']), 'BUNDLE_FILE_SET_UNEXPECTED');

  const workerBytes = readFileSync(join(root, 'worker.js'));
  const readme = readFileSync(join(root, 'README.md'), 'utf8')
    .replace(/generated at \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/, 'generated at __NORMALIZED_TIMESTAMP__');
  const sourceMap = JSON.parse(readFileSync(join(root, 'worker.js.map'), 'utf8'));
  assert(typeof sourceMap.sourceRoot === 'string' && sourceMap.sourceRoot.length > 0, 'SOURCE_MAP_ROOT_MISSING');
  sourceMap.sourceRoot = '__NORMALIZED_OUTPUT_ROOT__';
  const normalizedMap = stableJson(sourceMap);
  const rootBytes = Buffer.from(resolve(root), 'utf8');
  assert(!workerBytes.includes(rootBytes), 'WORKER_BUNDLE_CONTAINS_ABSOLUTE_PATH');
  assert(!Buffer.from(readme, 'utf8').includes(rootBytes), 'BUNDLE_README_CONTAINS_ABSOLUTE_PATH');
  assert(!Buffer.from(normalizedMap, 'utf8').includes(rootBytes), 'SOURCE_MAP_CONTAINS_ABSOLUTE_PATH_AFTER_NORMALIZATION');

  const entries = [
    { path: 'README.md', sha256: sha256Bytes(Buffer.from(readme, 'utf8')) },
    { path: 'worker.js', sha256: sha256Bytes(workerBytes) },
    { path: 'worker.js.map', sha256: sha256Bytes(Buffer.from(normalizedMap, 'utf8')) },
  ];
  const canonical = entries.map(({ path, sha256 }) => `${path}\t${sha256}`).join('\n');
  return Object.freeze({
    entries: Object.freeze(entries),
    hash: sha256Bytes(Buffer.from(canonical, 'utf8')),
    worker_hash: entries.find((entry) => entry.path === 'worker.js').sha256,
  });
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

export function readWranglerConfig(candidateRoot) {
  return JSON.parse(readFileSync(join(candidateRoot, 'wrangler.jsonc'), 'utf8'));
}

function assert(condition, code) {
  if (!condition) throw new C42Stop(code);
}

function observabilityDisabled(config) {
  const value = config.observability;
  return value?.enabled === false
    && value.logs?.enabled === false
    && value.logs?.invocation_logs === false
    && value.logs?.head_sampling_rate === 0
    && value.traces?.enabled === false
    && value.traces?.head_sampling_rate === 0;
}

export function validateWranglerConfig(config, { remoteReady = false } = {}) {
  assert(config?.name === WORKER_NAME, 'WORKER_NAME_MISMATCH');
  assert(config?.main === 'cloudflare/src/worker.mjs', 'ENTRYPOINT_MISMATCH');
  assert(config?.compatibility_date === '2026-09-18', 'COMPATIBILITY_DATE_MISMATCH');
  assert(config?.workers_dev === false, 'WORKERS_DEV_NOT_DISABLED');
  assert(config?.preview_urls === false, 'PREVIEW_URLS_NOT_DISABLED');
  assert(observabilityDisabled(config), 'OBSERVABILITY_NOT_DISABLED');
  for (const key of FORBIDDEN_CONFIG_KEYS) assert(!(key in config), `FORBIDDEN_CONFIG_${key.toUpperCase()}`);
  assert(config.assets?.directory === './public', 'ASSET_DIRECTORY_MISMATCH');
  assert(config.assets?.binding === ASSET_BINDING, 'ASSET_BINDING_MISMATCH');
  assert(config.assets?.run_worker_first === true, 'RUN_WORKER_FIRST_MISMATCH');
  assert(Array.isArray(config.d1_databases) && config.d1_databases.length === 1, 'D1_COUNT_MISMATCH');
  const d1 = config.d1_databases[0];
  assert(d1.binding === D1_BINDING, 'D1_BINDING_MISMATCH');
  assert(d1.database_name === D1_NAME, 'D1_NAME_MISMATCH');
  assert(d1.migrations_dir === 'cloudflare/migrations', 'D1_MIGRATIONS_DIR_MISMATCH');
  assert(d1.preview_database_id === 'goencho-b2-local-only', 'D1_PREVIEW_ID_MISMATCH');
  assert(typeof d1.database_id === 'string', 'D1_ID_MISSING');
  if (remoteReady) assert(d1.database_id !== ZERO_D1_ID, 'REMOTE_D1_PLACEHOLDER_FORBIDDEN');
  else assert(d1.database_id === ZERO_D1_ID, 'OFFLINE_D1_PLACEHOLDER_MISMATCH');
  return true;
}

export function deploymentContractHash(config) {
  validateWranglerConfig(config, { remoteReady: false });
  const d1 = config.d1_databases[0];
  const contract = {
    worker: config.name,
    main: config.main,
    compatibility_date: config.compatibility_date,
    exposure: { workers_dev: false, preview_urls: false, routes: 0, schedules: 0 },
    observability: config.observability,
    assets: config.assets,
    d1: { binding: d1.binding, database_name: d1.database_name, database_id: D1_ID_SENTINEL },
    secrets: [...SECRET_NAMES],
  };
  return sha256Bytes(Buffer.from(stableJson(contract), 'utf8'));
}

export function verifyCandidateBaseline(candidateRoot) {
  const tree = candidateTreeHash(candidateRoot);
  assert(tree.count === 116, 'CANDIDATE_FILE_COUNT_MISMATCH');
  assert(tree.hash === CANDIDATE_TREE_SHA256, 'CANDIDATE_TREE_HASH_MISMATCH');
  const checks = [
    ['wrangler.jsonc', WRANGLER_SHA256],
    ['package.json', PACKAGE_SHA256],
    ['package-lock.json', LOCK_SHA256],
    ['cloudflare/src/worker.mjs', EXPECTED_WORKER_SHA256],
    ['SOURCE_MANIFEST.sha256', MANIFEST_SHA256],
    ['cloudflare/migrations/0001_goencho.sql', MIGRATION_0001_SHA256],
    ['cloudflare/migrations/0002_auth_write_guards.sql', MIGRATION_0002_SHA256],
  ];
  for (const [path, expected] of checks) assert(sha256File(join(candidateRoot, path)) === expected, `HASH_MISMATCH_${path}`);
  const config = readWranglerConfig(candidateRoot);
  validateWranglerConfig(config);
  return Object.freeze({ file_count: tree.count, tree_hash: tree.hash, contract_hash: deploymentContractHash(config) });
}

export function verifyAssetBoundary(candidateRoot) {
  const publicRoot = join(candidateRoot, 'public');
  const entries = filesBelow(publicRoot).map((path) => relative(publicRoot, path).split(sep).join('/'));
  assert(entries.length > 0, 'ASSET_SET_EMPTY');
  for (const path of entries) {
    assert(/^(owner|teacher|shared)\//.test(path), 'UNEXPECTED_ASSET_PATH');
    assert(!/(?:^|\/)(?:tests?|diagnostics?|\.env|\.dev\.vars)(?:\/|$)/i.test(path), 'FORBIDDEN_ASSET_PATH');
    assert(!/\.(?:map|log|db|sqlite|pem|key)$/i.test(path), 'FORBIDDEN_ASSET_EXTENSION');
  }
  return Object.freeze([...entries].sort());
}

function asOwnedBytes(value) {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  throw new C42Stop('INPUT_BUFFER_REQUIRED');
}

export class SecretMaterial {
  constructor(fields) {
    assert(fields && typeof fields === 'object', 'INPUT_FIELDS_REQUIRED');
    this.fields = new Map();
    for (const name of INPUT_FIELD_NAMES) {
      assert(Object.hasOwn(fields, name), 'INPUT_FIELD_SET_MISMATCH');
      this.fields.set(name, asOwnedBytes(fields[name]));
    }
    assert(Object.keys(fields).length === INPUT_FIELD_NAMES.length, 'INPUT_FIELD_SET_MISMATCH');
    this.zeroed = false;
  }

  static fromFixtureStrings({ accountId, token, secrets }) {
    const fields = {
      account_id: Buffer.from(accountId, 'utf8'),
      api_token: Buffer.from(token, 'utf8'),
    };
    for (const name of SECRET_NAMES) fields[name] = Buffer.from(secrets[name], 'utf8');
    return new SecretMaterial(fields);
  }

  validate() {
    assert(!this.zeroed, 'INPUT_ALREADY_ZEROED');
    const account = this.fields.get('account_id').toString('ascii');
    assert(/^[0-9a-f]{32}$/i.test(account), 'ACCOUNT_ID_SHAPE_INVALID');
    const token = this.fields.get('api_token');
    assert(token.length >= 20 && token.length <= 512 && !token.includes(0x20), 'TOKEN_SHAPE_INVALID');
    for (const name of SECRET_NAMES) {
      const value = this.fields.get(name);
      assert(value.length >= 32 && value.length <= 512, 'SECRET_SHAPE_INVALID');
      assert(/^[A-Za-z0-9_-]+$/.test(value.toString('ascii')), 'SECRET_CHARSET_INVALID');
    }
    return true;
  }

  bytes(name) {
    assert(!this.zeroed, 'INPUT_ALREADY_ZEROED');
    assert(this.fields.has(name), 'UNKNOWN_INPUT_FIELD');
    return this.fields.get(name);
  }

  zeroize() {
    for (const value of this.fields.values()) value.fill(0);
    this.zeroed = true;
  }

  allZero() {
    return [...this.fields.values()].every((value) => value.every((byte) => byte === 0));
  }
}

export function buildSecretBulkStdin(material) {
  material.validate();
  const chunks = [Buffer.from('{', 'ascii')];
  SECRET_NAMES.forEach((name, index) => {
    if (index > 0) chunks.push(Buffer.from(',', 'ascii'));
    chunks.push(Buffer.from(`${JSON.stringify(name)}:"`, 'ascii'));
    chunks.push(material.bytes(name));
    chunks.push(Buffer.from('"', 'ascii'));
  });
  chunks.push(Buffer.from('}', 'ascii'));
  return Buffer.concat(chunks);
}

export async function sendSecretBulkViaInjectedStdin(material, writer) {
  assert(typeof writer === 'function', 'STDIN_WRITER_REQUIRED');
  const payload = buildSecretBulkStdin(material);
  try {
    return await writer(payload);
  } finally {
    payload.fill(0);
  }
}

function safeHash(value) {
  return typeof value === 'string' && /^[A-F0-9]{64}$/i.test(value) ? value.slice(0, 12).toUpperCase() : null;
}

function safeResult({ phase, attempts, stoppedReason, bundle, postcheckSafe }) {
  return Object.freeze({
    schema_version: 1,
    operation: 'b2-2c4-2-offline-runner',
    phase,
    attempts: Object.freeze({ ...attempts }),
    source_hash: safeHash(bundle?.source_hash),
    bundle_hash: safeHash(bundle?.bundle_hash),
    contract_hash: safeHash(bundle?.contract_hash),
    postcheck_safe: Boolean(postcheckSafe),
    stopped_reason: stoppedReason,
  });
}

function preflightIsSafe(value) {
  return value?.ok === true
    && value.worker_count === 1
    && value.target_worker === true
    && value.d1_count === 1
    && value.target_d1 === true
    && value.binding === D1_BINDING
    && value.exposure_safe === true
    && value.observability_safe === true;
}

function bundleIsSafe(value, expected) {
  return value?.ok === true
    && value.source_hash === CANDIDATE_TREE_SHA256
    && value.bundle_hash === expected.bundle_hash
    && value.contract_hash === expected.contract_hash;
}

function postcheckIsSafe(value) {
  return value?.ok === true
    && value.worker_count === 1
    && value.target_worker === true
    && value.binding === D1_BINDING
    && value.secret_count === 5
    && Array.isArray(value.secret_names)
    && stableJson([...value.secret_names].sort()) === stableJson([...SECRET_NAMES].sort())
    && value.exposure_safe === true
    && value.observability_safe === true
    && value.runtime_requests === 0;
}

export function createSingleUseSession({ adapters, expected }) {
  for (const name of ['preflight', 'bundle', 'secretBulk', 'deploy', 'postcheck']) {
    assert(typeof adapters?.[name] === 'function', `ADAPTER_${name.toUpperCase()}_REQUIRED`);
  }
  assert(expected && /^[A-F0-9]{64}$/i.test(expected.bundle_hash), 'EXPECTED_BUNDLE_HASH_REQUIRED');
  assert(expected && /^[A-F0-9]{64}$/i.test(expected.contract_hash), 'EXPECTED_CONTRACT_HASH_REQUIRED');
  let consumed = false;

  return Object.freeze({
    async run(material) {
      if (consumed) throw new C42Stop('SESSION_ALREADY_CONSUMED');
      consumed = true;
      const attempts = { preflight: 0, secret_bulk: 0, deploy: 0, postcheck: 0 };
      let bundle = null;
      let phase = 'input';
      try {
        material.validate();
        phase = 'preflight';
        attempts.preflight = 1;
        const preflight = await adapters.preflight(material);
        if (!preflightIsSafe(preflight)) return safeResult({ phase, attempts, stoppedReason: 'PREFLIGHT_STOP', bundle, postcheckSafe: false });

        phase = 'bundle';
        bundle = await adapters.bundle();
        if (!bundleIsSafe(bundle, expected)) return safeResult({ phase, attempts, stoppedReason: 'BUNDLE_STOP', bundle, postcheckSafe: false });

        phase = 'secret_bulk';
        attempts.secret_bulk = 1;
        let secretOutcome;
        try { secretOutcome = await adapters.secretBulk(material); } catch { secretOutcome = { outcome: 'unknown' }; }
        if (secretOutcome?.outcome !== 'success') {
          return safeResult({ phase, attempts, stoppedReason: 'SECRET_STATE_UNKNOWN', bundle, postcheckSafe: false });
        }

        phase = 'deploy';
        attempts.deploy = 1;
        let deployOutcome;
        try { deployOutcome = await adapters.deploy(material); } catch { deployOutcome = { outcome: 'unknown' }; }

        phase = 'postcheck';
        attempts.postcheck = 1;
        let postcheck;
        try { postcheck = await adapters.postcheck(material); } catch { postcheck = { ok: false }; }
        const postcheckSafe = postcheckIsSafe(postcheck);
        if (deployOutcome?.outcome !== 'success') {
          return safeResult({ phase, attempts, stoppedReason: 'DEPLOY_STATE_UNKNOWN', bundle, postcheckSafe });
        }
        if (!postcheckSafe) return safeResult({ phase, attempts, stoppedReason: 'POSTCHECK_STOP', bundle, postcheckSafe });
        return safeResult({ phase: 'complete', attempts, stoppedReason: 'none', bundle, postcheckSafe: true });
      } catch (error) {
        return safeResult({ phase, attempts, stoppedReason: error instanceof C42Stop ? error.code : 'SAFE_STOP', bundle, postcheckSafe: false });
      } finally {
        material.zeroize();
      }
    },
  });
}

function sanitizedEnvironment() {
  const environment = {
    ...process.env,
    WRANGLER_SEND_METRICS: 'false',
    WRANGLER_HIDE_BANNER: 'true',
    CI: 'true',
    NO_COLOR: '1',
  };
  for (const name of [
    'CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_API_KEY', 'CLOUDFLARE_ACCOUNT_ID', 'CF_API_TOKEN', 'CF_API_KEY',
    ...SECRET_NAMES,
  ]) delete environment[name];
  return environment;
}

export function runOfflineBundleTwice(candidateRoot) {
  verifyCandidateBaseline(candidateRoot);
  const wrangler = join(candidateRoot, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
  const temporaryRoot = mkdtempSync(join(tmpdir(), 'goencho-c4-2-bundle-'));
  const first = join(temporaryRoot, 'first');
  const second = join(temporaryRoot, 'second');
  try {
    for (const outdir of [first, second]) {
      const result = spawnSync(process.execPath, [wrangler, 'deploy', '--dry-run', '--outdir', outdir], {
        cwd: candidateRoot,
        env: sanitizedEnvironment(),
        encoding: 'utf8',
        windowsHide: true,
        timeout: 120_000,
        maxBuffer: 512 * 1024,
      });
      assert(!result.error && result.status === 0, 'OFFLINE_DRY_RUN_FAILED');
      assert(!/https?:\/\//i.test(`${result.stdout}\n${result.stderr}`), 'DRY_RUN_NETWORK_OUTPUT');
    }
    const left = canonicalBundleSnapshot(first);
    const right = canonicalBundleSnapshot(second);
    assert(left.entries.length > 0, 'BUNDLE_EMPTY');
    assert(left.hash === right.hash, 'BUNDLE_NOT_DETERMINISTIC');
    assert(stableJson(left.entries) === stableJson(right.entries), 'BUNDLE_MANIFEST_NOT_DETERMINISTIC');
    return Object.freeze({
      file_count: left.entries.length,
      bundle_hash: left.hash,
      worker_hash: left.worker_hash,
      deterministic: true,
      normalized_metadata: Object.freeze(['README.generated_at', 'worker.js.map.sourceRoot']),
    });
  } finally {
    const resolved = resolve(temporaryRoot);
    assert(basename(resolved).startsWith('goencho-c4-2-bundle-'), 'UNSAFE_TEMP_CLEANUP_TARGET');
    rmSync(resolved, { recursive: true, force: true });
  }
}

export function encodeInputPacket(fields) {
  const chunks = [Buffer.from('GC42', 'ascii')];
  const count = Buffer.alloc(4);
  count.writeUInt32LE(INPUT_FIELD_NAMES.length);
  chunks.push(count);
  for (const name of INPUT_FIELD_NAMES) {
    const bytes = asOwnedBytes(fields[name]);
    const size = Buffer.alloc(4);
    size.writeUInt32LE(bytes.length);
    chunks.push(size, bytes);
  }
  return Buffer.concat(chunks);
}

export function decodeInputPacket(packet) {
  const source = asOwnedBytes(packet);
  assert(source.subarray(0, 4).toString('ascii') === 'GC42', 'INPUT_PACKET_MAGIC_INVALID');
  let offset = 4;
  const count = source.readUInt32LE(offset);
  offset += 4;
  assert(count === INPUT_FIELD_NAMES.length, 'INPUT_PACKET_COUNT_INVALID');
  const fields = {};
  for (const name of INPUT_FIELD_NAMES) {
    assert(offset + 4 <= source.length, 'INPUT_PACKET_TRUNCATED');
    const size = source.readUInt32LE(offset);
    offset += 4;
    assert(size > 0 && offset + size <= source.length, 'INPUT_PACKET_SIZE_INVALID');
    fields[name] = source.subarray(offset, offset + size);
    offset += size;
  }
  assert(offset === source.length, 'INPUT_PACKET_TRAILING_BYTES');
  return new SecretMaterial(fields);
}
