import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  WorkerDeployOnceInputError,
  createWorkerDeployOnceSession,
} from './cloudflare-worker-deploy-once-probe.mjs';

const accountId = 'a'.repeat(32);
const token = `fake_${'t'.repeat(40)}`;
const workerName = 'goencho-b2-canary-202609';
const disabledObservability = {
  enabled: false,
  logs: { enabled: false, invocation_logs: false },
  traces: { enabled: false },
};

function apiResponse(result, { status = 200, success = true, errors = [] } = {}) {
  return new Response(JSON.stringify({ success, result, errors }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function successQueue(overrides = {}) {
  return [
    apiResponse(overrides.preflight ?? []),
    apiResponse(overrides.workerList ?? [{ id: workerName, routes: [] }]),
    apiResponse(overrides.subdomain ?? { enabled: false, previews_enabled: false }),
    apiResponse(overrides.versionSettings ?? { bindings: [], observability: disabledObservability }),
    apiResponse(overrides.scriptSettings ?? {
      logpush: false,
      tail_consumers: [],
      observability: disabledObservability,
    }),
    apiResponse(overrides.secrets ?? []),
    apiResponse(overrides.schedules ?? []),
  ];
}

function mockFetch(responses, calls = []) {
  const queue = [...responses];
  return async (url, options) => {
    calls.push({ url: String(url), options });
    if (!queue.length) throw new Error('unexpected request');
    return queue.shift();
  };
}

function successfulDeploy(calls = []) {
  return async (input) => {
    calls.push(input);
    return Object.freeze({ attempted: true, outcome: 'success', exit_code: 0 });
  };
}

test('C1-LOCAL-01 Worker 0件から固定名を一回だけdeployし全設定を確認する', async () => {
  const fetchCalls = [];
  const deployCalls = [];
  const session = createWorkerDeployOnceSession({
    fetchImpl: mockFetch(successQueue(), fetchCalls),
    deployImpl: successfulDeploy(deployCalls),
  });
  const result = await session.run({ accountId, token });
  assert.equal(result.stopped_reason, 'none');
  assert.equal(result.deploy_attempts, 1);
  assert.equal(deployCalls.length, 1);
  assert.deepEqual(deployCalls[0], { accountId, token });
  assert.equal(result.postcheck.all_safe, true);
  assert.equal(fetchCalls.length, 7);
  assert.equal(fetchCalls.every((call) => call.options.method === 'GET'), true);
});

test('C1-LOCAL-02 Workerが既に1件ならdeploy前に停止する', async () => {
  const deployCalls = [];
  const session = createWorkerDeployOnceSession({
    fetchImpl: mockFetch([apiResponse([{ id: 'existing-worker', routes: [] }])]),
    deployImpl: successfulDeploy(deployCalls),
  });
  const result = await session.run({ accountId, token });
  assert.equal(result.stopped_reason, 'resource_found');
  assert.equal(result.deploy_attempts, 0);
  assert.equal(deployCalls.length, 0);
});

test('C1-LOCAL-03 固定名が既にあれば上書きせず停止する', async () => {
  const deployCalls = [];
  const session = createWorkerDeployOnceSession({
    fetchImpl: mockFetch([apiResponse([{ id: workerName, routes: [] }])]),
    deployImpl: successfulDeploy(deployCalls),
  });
  const result = await session.run({ accountId, token });
  assert.equal(result.stopped_reason, 'resource_found');
  assert.equal(deployCalls.length, 0);
});

test('C1-LOCAL-04 認可失敗ではdeployしない', async () => {
  const deployCalls = [];
  const session = createWorkerDeployOnceSession({
    fetchImpl: mockFetch([apiResponse(null, { status: 403, success: false, errors: [{ code: 10000 }] })]),
    deployImpl: successfulDeploy(deployCalls),
  });
  const result = await session.run({ accountId, token });
  assert.equal(result.stopped_reason, 'preflight_failure');
  assert.equal(result.preflight.http_status, 403);
  assert.deepEqual(result.preflight.error_codes, [10000]);
  assert.equal(deployCalls.length, 0);
});

test('C1-LOCAL-05 deploy結果不明は一回で停止し再deployしない', async () => {
  let deployCount = 0;
  const session = createWorkerDeployOnceSession({
    fetchImpl: mockFetch([
      apiResponse([]),
      apiResponse([]),
    ]),
    deployImpl: async () => {
      deployCount += 1;
      return { attempted: true, outcome: 'unknown', exit_code: null };
    },
  });
  const result = await session.run({ accountId, token });
  assert.equal(result.stopped_reason, 'deploy_outcome_unknown');
  assert.equal(result.deploy_attempts, 1);
  assert.equal(deployCount, 1);
});

test('C1-LOCAL-06 workers.dev有効なら作成後不合格で停止する', async () => {
  const session = createWorkerDeployOnceSession({
    fetchImpl: mockFetch(successQueue({ subdomain: { enabled: true, previews_enabled: false } })),
    deployImpl: successfulDeploy(),
  });
  const result = await session.run({ accountId, token });
  assert.equal(result.stopped_reason, 'postcheck_failed');
  assert.equal(result.postcheck.subdomain.enabled, true);
});

test('C1-LOCAL-07 Preview URL有効なら作成後不合格で停止する', async () => {
  const session = createWorkerDeployOnceSession({
    fetchImpl: mockFetch(successQueue({ subdomain: { enabled: false, previews_enabled: true } })),
    deployImpl: successfulDeploy(),
  });
  const result = await session.run({ accountId, token });
  assert.equal(result.stopped_reason, 'postcheck_failed');
});

test('C1-LOCAL-08 bindingまたはsecretがあれば作成後不合格で停止する', async () => {
  const session = createWorkerDeployOnceSession({
    fetchImpl: mockFetch(successQueue({
      versionSettings: { bindings: [{ name: 'FORBIDDEN', type: 'secret_text' }], observability: disabledObservability },
      secrets: [{ name: 'FORBIDDEN', type: 'secret_text' }],
    })),
    deployImpl: successfulDeploy(),
  });
  const result = await session.run({ accountId, token });
  assert.equal(result.stopped_reason, 'postcheck_failed');
  assert.equal(result.postcheck.version_settings.bindings_count, 1);
  assert.equal(result.postcheck.secrets.count, 1);
});

test('C1-LOCAL-09 log・trace・scheduleのいずれかが有効なら不合格', async () => {
  const enabled = {
    enabled: true,
    logs: { enabled: true, invocation_logs: true },
    traces: { enabled: true },
  };
  const session = createWorkerDeployOnceSession({
    fetchImpl: mockFetch(successQueue({
      versionSettings: { bindings: [], observability: enabled },
      scriptSettings: { logpush: false, tail_consumers: [], observability: enabled },
      schedules: [{ cron: '* * * * *' }],
    })),
    deployImpl: successfulDeploy(),
  });
  const result = await session.run({ accountId, token });
  assert.equal(result.stopped_reason, 'postcheck_failed');
  assert.equal(result.postcheck.schedules.count, 1);
});

test('C1-LOCAL-10 同じsessionの二重実行を拒否する', async () => {
  const session = createWorkerDeployOnceSession({
    fetchImpl: mockFetch(successQueue()),
    deployImpl: successfulDeploy(),
  });
  await session.run({ accountId, token });
  await assert.rejects(
    () => session.run({ accountId, token }),
    (error) => error instanceof WorkerDeployOnceInputError && error.code === 'SESSION_ALREADY_CONSUMED',
  );
});

test('C1-LOCAL-11 safe outputへaccountとTokenを出さない', async () => {
  const session = createWorkerDeployOnceSession({
    fetchImpl: mockFetch(successQueue()),
    deployImpl: successfulDeploy(),
  });
  const serialized = JSON.stringify(await session.run({ accountId, token }));
  assert.equal(serialized.includes(accountId), false);
  assert.equal(serialized.includes(token), false);
});

test('C1-LOCAL-12 production sourceは固定config deploy以外のwrite操作を持たない', () => {
  const source = readFileSync(new URL('./cloudflare-worker-deploy-once-probe.mjs', import.meta.url), 'utf8');
  assert.match(source, /'deploy',\s*'--config',\s*'wrangler\.bootstrap\.jsonc'/);
  assert.doesNotMatch(source, /\b(?:delete|rename|secret|migration|d1)\s+(?:put|execute|apply|delete|rename)\b/i);
  assert.doesNotMatch(source, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/);
  assert.doesNotMatch(source, /console\.(?:log|error|warn|info|debug)/);
});

test('C1-LOCAL-13 非表示入力フォームは2条件確認後だけ実行し秘密を保存しない', () => {
  const form = readFileSync(new URL('./start-cloudflare-worker-deploy-once-input.ps1', import.meta.url), 'utf8');
  assert.match(form, /INPUT_WAITING_READY/);
  assert.match(form, /UseSystemPasswordChar\s*=\s*\$true/g);
  assert.match(form, /-not \$stateCheck\.Checked -or -not \$permissionCheck\.Checked/);
  assert.match(form, /cloudflare-worker-deploy-once-probe\.mjs/);
  assert.doesNotMatch(form, /Out-File|Set-Content|Add-Content|Export-Clixml|Start-Transcript/);
  assert.doesNotMatch(form, /Write-(?:Host|Output).*\$(?:token|accountId)/i);
});
