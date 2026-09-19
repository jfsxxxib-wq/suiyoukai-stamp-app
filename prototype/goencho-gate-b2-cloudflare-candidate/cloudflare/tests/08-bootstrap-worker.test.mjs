import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import worker from '../bootstrap/disabled-worker.mjs';

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const config = JSON.parse(readFileSync(join(root, 'wrangler.bootstrap.jsonc'), 'utf8'));
const source = readFileSync(join(root, 'cloudflare', 'bootstrap', 'disabled-worker.mjs'), 'utf8');

test('b2-c0-01 初回作成設定は固定名で外部入口を持たない', () => {
  assert.equal(config.name, 'goencho-b2-canary-202609');
  assert.equal(config.workers_dev, false);
  assert.equal(config.preview_urls, false);
  assert.equal('route' in config, false);
  assert.equal('routes' in config, false);
  assert.equal('triggers' in config, false);
});

test('b2-c0-02 初回作成設定はbinding、assets、secret、環境値を持たない', () => {
  for (const key of [
    'assets', 'd1_databases', 'kv_namespaces', 'r2_buckets', 'services', 'vars',
    'secrets', 'secrets_store_secrets', 'queues', 'durable_objects', 'hyperdrive', 'env',
  ]) {
    assert.equal(key in config, false, `${key} must be absent`);
  }
});

test('b2-c0-03 初回作成設定は全observabilityを無効にする', () => {
  assert.equal(config.observability.enabled, false);
  assert.equal(config.observability.logs.enabled, false);
  assert.equal(config.observability.logs.invocation_logs, false);
  assert.equal(config.observability.logs.head_sampling_rate, 0);
  assert.equal(config.observability.traces.enabled, false);
  assert.equal(config.observability.traces.head_sampling_rate, 0);
});

test('b2-c0-04 停止中Workerは固定503だけを返す', async () => {
  const response = await worker.fetch(new Request('https://invalid.example/private?secret=not-reflected', {
    method: 'POST',
    headers: { Authorization: 'Bearer not-reflected' },
    body: 'not-reflected',
  }));
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(response.headers.get('Content-Type'), 'application/json; charset=utf-8');
  assert.equal(await response.text(), '{"ok":false,"code":"CANARY_DISABLED"}');
});

test('b2-c0-05 停止中Workerはrequest、binding、log、外部通信を参照しない', () => {
  const sourceWithoutHandler = source.replace(/async\s+fetch\s*\(\s*\)\s*\{/, '');
  assert.doesNotMatch(source, /\b(?:request|env|ctx)\b/);
  assert.doesNotMatch(source, /console\s*\./);
  assert.doesNotMatch(sourceWithoutHandler, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /\b(?:GOENCHO_DB|D1Database|secret|cookie|authorization)\b/i);
  assert.doesNotMatch(source, /^\s*import\s/m);
});
