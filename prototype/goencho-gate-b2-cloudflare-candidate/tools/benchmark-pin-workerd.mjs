import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const samples = Number.parseInt(process.env.GOENCHO_BENCHMARK_SAMPLES ?? '100', 10);
if (!Number.isSafeInteger(samples) || samples < 1 || samples > 100) {
  throw new Error('GOENCHO_BENCHMARK_SAMPLES must be an integer from 1 to 100');
}

const port = 4196;
const externalOrigin = process.env.GOENCHO_BENCHMARK_ORIGIN;
const origin = externalOrigin ?? `http://127.0.0.1:${port}`;
const localRoot = resolve('.local', 'workerd-pin-benchmark');
const xdgRoot = resolve('.local', 'xdg-pin-benchmark');
mkdirSync(localRoot, { recursive: true });
mkdirSync(xdgRoot, { recursive: true });

const env = { ...process.env };
for (const name of [
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_API_KEY',
  'CLOUDFLARE_EMAIL',
  'CLOUDFLARE_ACCOUNT_ID',
]) delete env[name];
env.WRANGLER_SEND_METRICS = 'false';
env.XDG_CONFIG_HOME = xdgRoot;

const child = externalOrigin ? null : spawn(process.execPath, [
    resolve('node_modules', 'wrangler', 'bin', 'wrangler.js'),
    'dev',
    '--local',
    '--ip', '127.0.0.1',
    '--port', String(port),
    '--log-level', 'error',
    '--config', resolve('cloudflare', 'bench', 'wrangler.bench.jsonc'),
    '--persist-to', localRoot,
  ], {
    cwd: process.cwd(),
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

let diagnostics = '';
child?.stdout.on('data', (chunk) => { diagnostics += chunk.toString(); });
child?.stderr.on('data', (chunk) => { diagnostics += chunk.toString(); });

async function waitUntilReady() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (child && child.exitCode !== null) throw new Error(`workerd exited before ready: ${diagnostics.slice(-2000)}`);
    try {
      const response = await fetch(`${origin}/health`);
      if (response.ok) return;
    } catch {
      // Local runtime is still starting.
    }
    await delay(250);
  }
  throw new Error(`workerd did not become ready: ${diagnostics.slice(-2000)}`);
}

function percentile(values, ratio) {
  const ordered = [...values].sort((a, b) => a - b);
  return ordered[Math.min(ordered.length - 1, Math.ceil(ordered.length * ratio) - 1)];
}

function summary(values) {
  const total = values.reduce((sum, value) => sum + value, 0);
  return {
    averageMs: total / values.length,
    p50Ms: percentile(values, 0.5),
    p95Ms: percentile(values, 0.95),
    maxMs: Math.max(...values),
  };
}

async function runAlgorithm(name) {
  const values = { create: [], correct: [], wrong: [] };
  for (let index = 0; index < samples; index += 1) {
    const response = await fetch(`${origin}/sample/${name}`, { method: 'POST' });
    if (!response.ok) throw new Error(`${name} failed with HTTP ${response.status}`);
    const sample = await response.json();
    values.create.push(sample.createMs);
    values.correct.push(sample.correctMs);
    values.wrong.push(sample.wrongMs);
    if ((index + 1) % 10 === 0 || index + 1 === samples) {
      process.stderr.write(`workerd benchmark ${name}: ${index + 1}/${samples}\n`);
    }
  }
  return {
    create: summary(values.create),
    correct: summary(values.correct),
    wrong: summary(values.wrong),
  };
}

try {
  await waitUntilReady();
  const results = {};
  for (const name of ['pbkdf2-600k', 'scrypt-legacy', 'scrypt-owasp']) {
    results[name] = await runAlgorithm(name);
  }
  process.stdout.write(`${JSON.stringify({ runtime: 'wrangler-workerd-local', samples, results }, null, 2)}\n`);
} finally {
  if (child) {
    child.kill('SIGTERM');
    await Promise.race([
      new Promise((resolveExit) => child.once('exit', resolveExit)),
      delay(5000),
    ]);
  }
}
