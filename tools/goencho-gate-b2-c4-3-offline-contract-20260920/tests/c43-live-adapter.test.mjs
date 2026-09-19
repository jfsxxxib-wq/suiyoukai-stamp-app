import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ASSET_BINDING,
  BASELINE,
  BASE_COMMIT,
  BOOTSTRAP_SHA256,
  C43Stop,
  D1_BINDING,
  D1_NAME,
  OFFICIAL_BEHAVIOR,
  REQUEST_BUDGET,
  SECRET_NAMES,
  TOOL_POLICY,
  WORKER_NAME,
  assertSafeSerializedResult,
  buildWranglerSpecs,
  createDescriptorConfig,
  createSingleUseLiveSession,
  generateSecretMaterial,
  stableJson,
  validateObservedRequests,
  validatePreflight,
  validateTokenPolicy,
  validateToolPolicy,
  withEphemeralDescriptor,
} from '../c43-live-adapter.mjs';
import {
  CANDIDATE_TREE_SHA256 as C42_TREE,
  EXPECTED_WORKER_SHA256 as C42_WORKER,
  MIGRATION_0001_SHA256 as C42_M1,
  MIGRATION_0002_SHA256 as C42_M2,
  readWranglerConfig,
  verifyCandidateBaseline,
} from '../../goencho-gate-b2-c4-2-offline-20260919/b2c4-2-core.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const gateRoot = resolve(packageRoot, '..', '..');
const candidate = join(gateRoot, 'prototype', 'goencho-gate-b2-cloudflare-candidate');
const guardian = process.env.GOENCHO_C43_GUARDIAN_PATH ?? join(resolve(gateRoot, '..'), 'firewall-guardian-v3b.ps1');
const launcher = join(packageRoot, 'start-c43-live.ps1');
const wranglerCli = join(candidate, 'node_modules', 'wrangler', 'wrangler-dist', 'cli.js');
const goodD1Id = '11111111-2222-4333-8444-555555555555';

function preflight(overrides = {}) {
  return {
    account_count: 1,
    target_account: true,
    worker_count: 1,
    worker_name: WORKER_NAME,
    d1_count: 1,
    d1_name: D1_NAME,
    d1_id: goodD1Id,
    remote_code_sha256: BOOTSTRAP_SHA256,
    bindings: [ASSET_BINDING, D1_BINDING],
    vars: [],
    routes: 0,
    schedules: 0,
    preview_urls: false,
    workers_dev: false,
    observability: false,
    logs: false,
    traces: false,
    logpush: false,
    ...overrides,
  };
}

function postcheck(overrides = {}) {
  return {
    worker_count: 1,
    worker_name: WORKER_NAME,
    d1_binding: D1_BINDING,
    d1_name: D1_NAME,
    secret_names: [...SECRET_NAMES],
    routes: 0,
    schedules: 0,
    preview_urls: false,
    workers_dev: false,
    observability: false,
    runtime_requests: 0,
    d1_queries: 0,
    ...overrides,
  };
}

function sequentialRandom() {
  let counter = 1;
  return () => Buffer.alloc(32, counter++);
}

function makeSession(overrides = {}) {
  const calls = [];
  const adapters = {
    async preflight() { calls.push('preflight'); return preflight(); },
    async secretBulk(payload) { calls.push('secretBulk'); assert(Buffer.isBuffer(payload)); return { outcome: 'success', complete: true }; },
    async deploy() { calls.push('deploy'); return { outcome: 'success', complete: true }; },
    async postcheck() { calls.push('postcheck'); return postcheck(); },
    ...overrides,
  };
  return { calls, session: createSingleUseLiveSession({ adapters }) };
}

test('C4-3-F01 checkpointとcandidate 116 files・tree・worker・migration hashを固定する', () => {
  assert.equal(BASE_COMMIT, '5d90a3e05c86851adccc35af0b8675f9f12c2245');
  const result = verifyCandidateBaseline(candidate);
  assert.equal(result.file_count, BASELINE.candidate_files);
  assert.equal(result.tree_hash, BASELINE.candidate_tree_sha256);
  assert.equal(result.contract_hash, BASELINE.deployment_contract_sha256);
  assert.equal(C42_TREE, BASELINE.candidate_tree_sha256);
  assert.equal(C42_WORKER, BASELINE.worker_sha256);
  assert.equal(C42_M1, BASELINE.migration_0001_sha256);
  assert.equal(C42_M2, BASELINE.migration_0002_sha256);
  assert.equal(BASELINE.migration_0003_present, false);
});

test('C4-3-F02 secret bulk即時deployと別full deployを2 mutation段階として固定する', () => {
  assert.equal(OFFICIAL_BEHAVIOR.secret_bulk.client_attempts, 1);
  assert.equal(OFFICIAL_BEHAVIOR.secret_bulk.immediately_deploys, true);
  assert.equal(OFFICIAL_BEHAVIOR.full_deploy.separate_deploy, true);
  assert.equal(OFFICIAL_BEHAVIOR.mutation_stages, 2);
  assert.equal(OFFICIAL_BEHAVIOR.retry, 0);
});

test('C4-3-F03 remote codeは固定無効bootstrap hashだけを許可する', () => {
  assert.equal(validatePreflight(preflight()), true);
  assert.throws(() => validatePreflight(preflight({ remote_code_sha256: 'A'.repeat(64) })), (error) => error instanceof C43Stop && error.code === 'REMOTE_CODE_HASH_MISMATCH');
  assert.throws(() => validatePreflight(preflight({ remote_code_sha256: undefined })), (error) => error instanceof C43Stop && error.code === 'REMOTE_CODE_HASH_MISMATCH');
});

test('C4-3-F04 exact account・Worker・D1・binding・入口0・observability無効だけを受理する', () => {
  assert.equal(validatePreflight(preflight()), true);
  for (const invalid of [
    { account_count: 2 }, { worker_name: 'other' }, { d1_name: 'other' },
    { bindings: [D1_BINDING] }, { vars: ['X'] }, { routes: 1 }, { observability: true },
  ]) assert.throws(() => validatePreflight(preflight(invalid)), C43Stop);
});

test('C4-3-F05 Tokenは対象1 accountのWorkers Scripts Write＋D1 Readだけを許可する', () => {
  const good = { account_scope_count: 1, target_account_only: true, permissions: ['Workers Scripts Write', 'D1 Read'], zone_permissions: 0, all_accounts: false, expires_within_hours: 24 };
  assert.equal(validateTokenPolicy(good), true);
  for (const invalid of [
    { ...good, permissions: [...good.permissions, 'D1 Write'] },
    { ...good, zone_permissions: 1 }, { ...good, all_accounts: true }, { ...good, expires_within_hours: 25 },
  ]) assert.throws(() => validateTokenPolicy(invalid), C43Stop);
});

test('C4-3-F06 D1 UUIDをcurrent-user-only descriptorへ1回注入し必ず削除する', async () => {
  const source = readWranglerConfig(candidate);
  const events = [];
  let captured;
  const store = {
    async create(bytes, options) { events.push('create'); captured = Buffer.from(bytes); assert.equal(options.acl, 'current-user-only'); return 'opaque-handle'; },
    async inspect() { events.push('inspect'); return { exists: true, acl: 'current-user-only', create_count: 1 }; },
    async remove() { events.push('remove'); captured.fill(0); },
  };
  const result = await withEphemeralDescriptor({ source, d1Id: goodD1Id, store, async run(handle) { assert.equal(handle, 'opaque-handle'); return 'ok'; } });
  assert.equal(result, 'ok');
  assert.deepEqual(events, ['create', 'inspect', 'remove']);
  assert(captured.every((byte) => byte === 0));
  assert.throws(() => createDescriptorConfig(source, '00000000-0000-0000-0000-000000000000'), C43Stop);
});

test('C4-3-F07 telemetry・dependency instrumentation・auto provision・skills・profile・update checkを無効化する', () => {
  assert.equal(validateToolPolicy(TOOL_POLICY), true);
  const config = createDescriptorConfig(readWranglerConfig(candidate), goodD1Id);
  assert.equal(config.send_metrics, false);
  assert.deepEqual(config.dependencies_instrumentation, { enabled: false });
  const specs = buildWranglerSpecs({ nodePath: 'node.exe', wranglerPath: 'wrangler.js', configPath: 'descriptor.json', candidateRoot: 'candidate' });
  assert.equal(specs.env.WRANGLER_HIDE_BANNER, 'true');
  assert.equal(specs.env.WRANGLER_SEND_METRICS, 'false');
  assert(specs.deploy.args.includes('--strict'));
  assert(specs.deploy.args.includes('--experimental-provision=false'));
  assert(specs.deploy.args.includes('--install-skills=false'));
});

test('C4-3-F08 5 secretをCSPRNG相当から一意生成しstdin payload後にzero-fillする', () => {
  const secrets = generateSecretMaterial(sequentialRandom());
  assert.deepEqual([...secrets.values.keys()], SECRET_NAMES);
  assert([...secrets.values.values()].every((value) => value.length >= 43));
  const payload = secrets.toBulkStdin();
  const parsed = JSON.parse(payload.toString('ascii'));
  assert.deepEqual(Object.keys(parsed), SECRET_NAMES);
  assert.equal(new Set(Object.values(parsed)).size, 5);
  secrets.zeroize();
  assert.equal(secrets.allZero(), true);
  payload.fill(0);
});

test('C4-3-F09 secret bulk不明は1 attempt、deploy・postcheck・再送0で停止する', async () => {
  const { calls, session } = makeSession({ async secretBulk() { calls.push('secretBulk'); throw new Error('raw secret error must not escape'); } });
  const secrets = generateSecretMaterial(sequentialRandom());
  const result = await session.run(secrets);
  assert.equal(result.stop, 'SECRET_STATE_UNKNOWN');
  assert.deepEqual(result.attempts, { preflight: 1, secret_bulk: 1, deploy: 0, postcheck: 0 });
  assert.deepEqual(calls, ['preflight', 'secretBulk']);
  assert.equal(secrets.allZero(), true);
});

test('C4-3-F10 full deploy不明は1 attempt、再deploy・rollbackなしで停止する', async () => {
  const { calls, session } = makeSession({ async deploy() { calls.push('deploy'); return { outcome: 'unknown' }; } });
  const result = await session.run(generateSecretMaterial(sequentialRandom()));
  assert.equal(result.stop, 'DEPLOY_STATE_UNKNOWN');
  assert.deepEqual(result.attempts, { preflight: 1, secret_bulk: 1, deploy: 1, postcheck: 1 });
  assert.deepEqual(calls, ['preflight', 'secretBulk', 'deploy', 'postcheck']);
});

test('C4-3-F11 postcheckはdeploy成功または不明時だけ1組、runtime・D1 query 0を必須にする', async () => {
  const ok = makeSession();
  const pass = await ok.session.run(generateSecretMaterial(sequentialRandom()));
  assert.equal(pass.stop, 'none');
  assert.equal(pass.postcheck_safe, true);
  const bad = makeSession({ async postcheck() { return postcheck({ runtime_requests: 1 }); } });
  const stopped = await bad.session.run(generateSecretMaterial(sequentialRandom()));
  assert.equal(stopped.stop, 'POSTCHECK_STOP');
  assert.equal(stopped.attempts.postcheck, 1);
});

test('C4-3-F12 safe resultにToken・secret・private ID・URL・raw responseを含めない', async () => {
  const { session } = makeSession();
  const token = 'token-fixture-never-save';
  const secret = 'secret-fixture-never-save';
  const account = 'a'.repeat(32);
  const result = await session.run(generateSecretMaterial(sequentialRandom()));
  assert.equal(assertSafeSerializedResult(result, [token, secret, account, goodD1Id]), true);
  assert.deepEqual(Object.keys(result).sort(), ['attempts', 'mutation_stages', 'operation', 'phase', 'postcheck_safe', 'schema_version', 'stop']);
});

test('C4-3-F13 deploy失敗後もsecret削除・中間version復元を呼ばない', async () => {
  let destructive = 0;
  const { session } = makeSession({
    async deploy() { return { outcome: 'failure' }; },
    async deleteSecrets() { destructive++; },
    async restoreVersion() { destructive++; },
  });
  const result = await session.run(generateSecretMaterial(sequentialRandom()));
  assert.equal(result.stop, 'DEPLOY_STATE_UNKNOWN');
  assert.equal(destructive, 0);
});

test('C4-3-F14 launcherとsessionはsingle-useで二重実行を拒否する', async () => {
  const text = readFileSync(launcher, 'utf8');
  assert.match(text, /OfflineFixture/);
  assert.match(text, /REMOTE_MODE_NOT_AUTHORIZED/);
  const { session } = makeSession();
  await session.run(generateSecretMaterial(sequentialRandom()));
  await assert.rejects(() => session.run(generateSecretMaterial(sequentialRandom())), (error) => error instanceof C43Stop && error.code === 'SESSION_ALREADY_CONSUMED');
});

test('C4-3-F15 guardianは専用Nodeのoutbound blockと9 phase継続照合を固定する', () => {
  const text = readFileSync(guardian, 'utf8');
  assert.match(text, /Codex-Goencho-C43-Live-Adapter-Offline-V3B-20260920/);
  assert.match(text, /Direction\s+Outbound/);
  assert.match(text, /Action\s+Block/);
  assert.match(text, /ExpectedPhases\s*=\s*9/);
});

test('C4-3-F16 request budget manifest・Wrangler endpoint・既存255回帰の境界を固定する', () => {
  const disk = JSON.parse(readFileSync(join(packageRoot, 'REQUEST_BUDGET.json'), 'utf8'));
  assert.equal(stableJson(disk), stableJson(REQUEST_BUDGET));
  assert.equal(validateObservedRequests([
    { phase: 'secret_bulk', method: 'PATCH', path: '/accounts/{account}/workers/scripts/{worker}/secrets-bulk' },
    { phase: 'full_deploy', method: 'POST', path: '/accounts/{account}/workers/scripts/{worker}/assets-upload-session' },
    { phase: 'full_deploy', method: 'PUT', path: '/accounts/{account}/workers/scripts/{worker}' },
  ]), true);
  assert.throws(() => validateObservedRequests([{ phase: 'full_deploy', method: 'DELETE', path: '/unknown' }]), (error) => error instanceof C43Stop && error.code === 'UNKNOWN_ENDPOINT');
  const wrangler = readFileSync(wranglerCli, 'utf8');
  assert.match(wrangler, /workers\/scripts\/\$\{scriptName\}\/secrets-bulk/);
  assert.match(wrangler, /assets-upload-session/);
  assert.equal(15 + 168 + 72, 255);
});
