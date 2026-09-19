import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const configPath = join(root, 'wrangler.bootstrap.jsonc');
const sourcePath = join(root, 'cloudflare', 'bootstrap', 'disabled-worker.mjs');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const source = readFileSync(sourcePath, 'utf8');
const failures = [];

function fail(message) {
  failures.push(message);
}

const allowedTopLevel = new Set([
  '$schema', 'name', 'main', 'compatibility_date', 'workers_dev', 'preview_urls', 'observability',
]);
for (const key of Object.keys(config)) {
  if (!allowedTopLevel.has(key)) fail(`unexpected bootstrap configuration key: ${key}`);
}
if (config.name !== 'goencho-b2-canary-202609') fail('unexpected bootstrap Worker name');
if (config.main !== 'cloudflare/bootstrap/disabled-worker.mjs') fail('unexpected bootstrap entrypoint');
if (config.compatibility_date !== '2026-09-18') fail('unexpected compatibility date');
if (config.workers_dev !== false) fail('workers.dev must be disabled');
if (config.preview_urls !== false) fail('Preview URLs must be disabled');
if (config.observability?.enabled !== false) fail('observability must be disabled');
if (config.observability?.logs?.enabled !== false) fail('Workers Logs must be disabled');
if (config.observability?.logs?.invocation_logs !== false) fail('invocation logs must be disabled');
if (config.observability?.logs?.head_sampling_rate !== 0) fail('log sampling must be zero');
if (config.observability?.traces?.enabled !== false) fail('traces must be disabled');
if (config.observability?.traces?.head_sampling_rate !== 0) fail('trace sampling must be zero');

if (/^\s*import\s/m.test(source)) fail('bootstrap Worker must not import runtime code');
if (/console\s*\./.test(source)) fail('bootstrap Worker must not emit console logs');
const sourceWithoutHandler = source.replace(/async\s+fetch\s*\(\s*\)\s*\{/, '');
if (/\bfetch\s*\(/.test(sourceWithoutHandler)) fail('bootstrap Worker must not make outbound fetch calls');
if (/\b(?:request|env|ctx|GOENCHO_DB|D1Database|cookie|authorization)\b/i.test(source)) {
  fail('bootstrap Worker must not read requests or bindings');
}
if (!/status:\s*503/.test(source) || !/CANARY_DISABLED/.test(source)) {
  fail('bootstrap Worker must return the fixed disabled response');
}

const outdirArgument = process.argv[2];
let outputFiles = [];
if (outdirArgument) {
  const outdir = resolve(root, outdirArgument);
  if (!existsSync(outdir) || !statSync(outdir).isDirectory()) {
    fail(`dry-run output directory missing: ${outdirArgument}`);
  } else {
    const walk = (directory) => {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const full = join(directory, entry.name);
        if (entry.isDirectory()) walk(full);
        else outputFiles.push(full);
      }
    };
    walk(outdir);
    if (!outputFiles.length) fail('dry-run output is empty');
    const textFiles = outputFiles.filter((path) => ['.js', '.mjs', '.json', '.map', '.txt'].includes(extname(path)));
    const output = textFiles.map((path) => readFileSync(path, 'utf8')).join('\n');
    for (const forbidden of [
      'goencho-b2-canary-db-202609', 'GOENCHO_DB', '00000000-0000-0000-0000-000000000000',
      'preview_database_id', 'd1_databases', 'migrations_dir', 'ASSETS',
    ]) {
      if (output.includes(forbidden)) fail(`dry-run output contains forbidden binding marker: ${forbidden}`);
    }
    if (/console\s*\./.test(output)) fail('dry-run output contains console logging');
    if (!output.includes('CANARY_DISABLED')) fail('dry-run output is not the disabled Worker');
  }
}

if (failures.length) {
  process.stderr.write(`bootstrap Worker check failed (${failures.length})\n`);
  for (const failure of failures) process.stderr.write(`- ${failure}\n`);
  process.exitCode = 1;
} else {
  const outputSummary = outdirArgument
    ? `; dry-run output ${outputFiles.length} file(s) inspected`
    : '';
  process.stdout.write(`bootstrap Worker check passed: no route, binding, asset, secret, log, or outbound request${outputSummary}\n`);
}
