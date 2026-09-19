import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  C42Stop,
  CANDIDATE_TREE_SHA256,
  D1_BINDING,
  D1_NAME,
  EXPECTED_WORKER_SHA256,
  SECRET_NAMES,
  SecretMaterial,
  WORKER_NAME,
  buildSecretBulkStdin,
  createSingleUseSession,
  decodeInputPacket,
  deploymentContractHash,
  encodeInputPacket,
  readWranglerConfig,
  runOfflineBundleTwice,
  sendSecretBulkViaInjectedStdin,
  sha256File,
  validateWranglerConfig,
  verifyAssetBoundary,
  verifyCandidateBaseline,
} from '../b2c4-2-core.mjs';

const offlineRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const gateRoot = dirname(dirname(offlineRoot));
const candidateRoot = join(gateRoot, 'prototype', 'goencho-gate-b2-cloudflare-candidate');
const fakeAccount = 'a'.repeat(32);
const fakeToken = `fixture_${'t'.repeat(40)}`;
const fakeSecrets = Object.fromEntries(SECRET_NAMES.map((name, index) => [name, `${String(index + 1)}_${'s'.repeat(42)}`]));
let bundleSnapshot;

function material() {
  return SecretMaterial.fromFixtureStrings({ accountId: fakeAccount, token: fakeToken, secrets: fakeSecrets });
}

function safePreflight(overrides = {}) {
  return {
    ok: true,
    worker_count: 1,
    target_worker: true,
    d1_count: 1,
    target_d1: true,
    binding: D1_BINDING,
    exposure_safe: true,
    observability_safe: true,
    ...overrides,
  };
}

function safePostcheck(overrides = {}) {
  return {
    ok: true,
    worker_count: 1,
    target_worker: true,
    binding: D1_BINDING,
    secret_count: 5,
    secret_names: [...SECRET_NAMES],
    exposure_safe: true,
    observability_safe: true,
    runtime_requests: 0,
    ...overrides,
  };
}

function sessionAdapters(overrides = {}) {
  const contractHash = deploymentContractHash(readWranglerConfig(candidateRoot));
  const bundleHash = bundleSnapshot?.bundle_hash ?? 'B'.repeat(64);
  return {
    expected: { bundle_hash: bundleHash, contract_hash: contractHash },
    adapters: {
      preflight: async () => safePreflight(),
      bundle: async () => ({
        ok: true,
        source_hash: CANDIDATE_TREE_SHA256,
        bundle_hash: bundleHash,
        contract_hash: contractHash,
      }),
      secretBulk: async () => ({ outcome: 'success' }),
      deploy: async () => ({ outcome: 'success' }),
      postcheck: async () => safePostcheck(),
      ...overrides,
    },
  };
}

test('C4-2-F01 固定commit相当の116 files・tree・manifest・worker・migration hashを照合する', () => {
  const baseline = verifyCandidateBaseline(candidateRoot);
  assert.equal(baseline.file_count, 116);
  assert.equal(baseline.tree_hash, CANDIDATE_TREE_SHA256);
  assert.equal(sha256File(join(candidateRoot, 'cloudflare/src/worker.mjs')), EXPECTED_WORKER_SHA256);
});

test('C4-2-F02 configは固定Worker・assets・D1だけを許可しremote placeholderを拒否する', () => {
  const config = readWranglerConfig(candidateRoot);
  assert.equal(validateWranglerConfig(config), true);
  assert.throws(() => validateWranglerConfig(config, { remoteReady: true }), (error) => error instanceof C42Stop && error.code === 'REMOTE_D1_PLACEHOLDER_FORBIDDEN');
  const changed = structuredClone(config);
  changed.d1_databases.push({ binding: 'OTHER' });
  assert.throws(() => validateWranglerConfig(changed), /safe stop/);
});

test('C4-2-F03 workers.dev・preview・route・observabilityの有効化を個別に拒否する', () => {
  for (const mutate of [
    (value) => { value.workers_dev = true; },
    (value) => { value.preview_urls = true; },
    (value) => { value.routes = ['example.invalid/*']; },
    (value) => { value.observability.enabled = true; },
    (value) => { value.observability.logs.enabled = true; },
    (value) => { value.observability.traces.enabled = true; },
  ]) {
    const config = structuredClone(readWranglerConfig(candidateRoot));
    mutate(config);
    assert.throws(() => validateWranglerConfig(config), /safe stop/);
  }
});

test('C4-2-F04 local dry-runを2回行いcanonical bundle hashが一致する', { timeout: 150_000 }, () => {
  bundleSnapshot = runOfflineBundleTwice(candidateRoot);
  assert.equal(bundleSnapshot.deterministic, true);
  assert.ok(bundleSnapshot.file_count > 0);
  assert.match(bundleSnapshot.bundle_hash, /^[A-F0-9]{64}$/);
});

test('C4-2-F05 assetsはowner・teacher・sharedだけで禁止生成物を含まない', () => {
  const assets = verifyAssetBoundary(candidateRoot);
  assert.ok(assets.some((path) => path.startsWith('owner/')));
  assert.ok(assets.some((path) => path.startsWith('teacher/')));
  assert.ok(assets.some((path) => path.startsWith('shared/')));
});

test('C4-2-F06 secret名は5件exact setでbulk payloadに値以外の余剰fieldを作らない', () => {
  const input = material();
  const payload = buildSecretBulkStdin(input);
  const parsed = JSON.parse(payload.toString('utf8'));
  assert.deepEqual(Object.keys(parsed), [...SECRET_NAMES]);
  assert.deepEqual(Object.values(parsed), SECRET_NAMES.map((name) => fakeSecrets[name]));
  payload.fill(0);
  input.zeroize();
});

test('C4-2-F07 非表示入力scriptはSecureString・stdin・全buffer zero化を固定する', () => {
  const source = readFileSync(join(offlineRoot, 'start-b2c4-2-offline-input.ps1'), 'utf8');
  assert.match(source, /Read-Host \$prompt -AsSecureString/);
  assert.match(source, /ZeroFreeBSTR/);
  assert.match(source, /\[Array\]::Clear\(\$packet/);
  assert.match(source, /StandardInput\.BaseStream\.Write/);
  assert.doesNotMatch(source, /Environment\[['"](?:CLOUDFLARE_API_TOKEN|GOENCHO_)/);
  assert.doesNotMatch(source, /(?:Set-Content|Out-File|Add-Content)/);
});

test('C4-2-F08 length-prefix stdin packetとbulk payloadは値をargv・env・diskへ渡さずzero化する', async () => {
  const input = material();
  const fields = Object.fromEntries(['account_id', 'api_token', ...SECRET_NAMES].map((name) => [name, input.bytes(name)]));
  const packet = encodeInputPacket(fields);
  const decoded = decodeInputPacket(packet);
  decoded.validate();
  let captured;
  await sendSecretBulkViaInjectedStdin(decoded, async (payload) => { captured = payload; return { outcome: 'fixture' }; });
  assert.equal(captured.every((byte) => byte === 0), true);
  decoded.zeroize();
  packet.fill(0);
  input.zeroize();
});

test('C4-2-F09 secret bulk不明は1 attempt、deploy 0、再送0で停止する', async () => {
  let bulkCalls = 0;
  let deployCalls = 0;
  const setup = sessionAdapters({
    secretBulk: async () => { bulkCalls += 1; return { outcome: 'unknown' }; },
    deploy: async () => { deployCalls += 1; return { outcome: 'success' }; },
  });
  const input = material();
  const result = await createSingleUseSession(setup).run(input);
  assert.equal(result.stopped_reason, 'SECRET_STATE_UNKNOWN');
  assert.deepEqual(result.attempts, { preflight: 1, secret_bulk: 1, deploy: 0, postcheck: 0 });
  assert.equal(bulkCalls, 1);
  assert.equal(deployCalls, 0);
  assert.equal(input.allZero(), true);
});

test('C4-2-F10 deploy失敗・timeout・throwは各1 attemptで再deployしない', async () => {
  for (const deploy of [
    async () => ({ outcome: 'failed' }),
    async () => ({ outcome: 'unknown' }),
    async () => { throw new Error('fixture timeout'); },
  ]) {
    let calls = 0;
    const setup = sessionAdapters({ deploy: async (...args) => { calls += 1; return deploy(...args); } });
    const result = await createSingleUseSession(setup).run(material());
    assert.equal(result.stopped_reason, 'DEPLOY_STATE_UNKNOWN');
    assert.equal(result.attempts.deploy, 1);
    assert.equal(calls, 1);
  }
});

test('C4-2-F11 postcheckはcontrol-plane safe fieldsだけを受理しruntime request 0を必須にする', async () => {
  const good = await createSingleUseSession(sessionAdapters()).run(material());
  assert.equal(good.stopped_reason, 'none');
  const bad = sessionAdapters({ postcheck: async () => safePostcheck({ runtime_requests: 1 }) });
  const stopped = await createSingleUseSession(bad).run(material());
  assert.equal(stopped.stopped_reason, 'POSTCHECK_STOP');
});

test('C4-2-F12 safe outputは秘密・account・D1名・完全hash・raw errorを含まない', async () => {
  const result = await createSingleUseSession(sessionAdapters()).run(material());
  const serialized = JSON.stringify(result);
  for (const value of [fakeAccount, fakeToken, D1_NAME, ...Object.values(fakeSecrets), CANDIDATE_TREE_SHA256]) {
    assert.equal(serialized.includes(value), false);
  }
  assert.equal(serialized.includes('fixture timeout'), false);
});

test('C4-2-F13 session二重実行を拒否しbulk・deployは最大1のまま', async () => {
  let bulkCalls = 0;
  let deployCalls = 0;
  const setup = sessionAdapters({
    secretBulk: async () => { bulkCalls += 1; return { outcome: 'success' }; },
    deploy: async () => { deployCalls += 1; return { outcome: 'success' }; },
  });
  const session = createSingleUseSession(setup);
  await session.run(material());
  await assert.rejects(() => session.run(material()), (error) => error instanceof C42Stop && error.code === 'SESSION_ALREADY_CONSUMED');
  assert.equal(bulkCalls, 1);
  assert.equal(deployCalls, 1);
});

test('C4-2-F14 production coreはfetch・HTTP・Cloudflare CLI writeを持たずoffline adapter注入だけ', () => {
  const source = readFileSync(join(offlineRoot, 'b2c4-2-core.mjs'), 'utf8');
  assert.doesNotMatch(source, /globalThis\.fetch|https:\/\/api\.cloudflare\.com|wrangler[^\n]*(?:secret|deploy)(?![^\n]*--dry-run)/i);
  assert.match(source, /'deploy', '--dry-run'/);
  assert.match(source, /WRANGLER_HIDE_BANNER:\s*'true'/);
  assert.equal(verifyCandidateBaseline(candidateRoot).tree_hash, CANDIDATE_TREE_SHA256);
});

test('入力validatorはpacketだけをstdinで受けsafe JSONだけを返す', () => {
  const input = material();
  const fields = Object.fromEntries(['account_id', 'api_token', ...SECRET_NAMES].map((name) => [name, input.bytes(name)]));
  const packet = encodeInputPacket(fields);
  const result = spawnSync(process.execPath, [join(offlineRoot, 'validate-secret-input.mjs')], { input: packet, encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
  const output = JSON.parse(result.stdout);
  assert.equal(output.accepted, true);
  for (const value of [fakeAccount, fakeToken, ...Object.values(fakeSecrets)]) assert.equal(result.stdout.includes(value), false);
  packet.fill(0);
  input.zeroize();
});
