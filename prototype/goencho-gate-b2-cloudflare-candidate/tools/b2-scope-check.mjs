import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const failures = [];
const checked = [];

function fail(message) {
  failures.push(message);
}

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (['.local', '.wrangler', 'node_modules', 'coverage'].includes(entry.name)) continue;
    const full = join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (['.mjs', '.js', '.sql', '.json', '.jsonc', '.html', '.css', '.md'].includes(extname(entry.name))) {
      checked.push(full);
    }
  }
}

walk(root);
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const config = JSON.parse(readFileSync(join(root, 'wrangler.jsonc'), 'utf8'));
const migrationDirectory = join(root, 'cloudflare', 'migrations');
const migrations = readdirSync(migrationDirectory)
  .filter((name) => /^\d+_[a-z0-9_-]+\.sql$/i.test(name))
  .sort()
  .map((name) => readFileSync(join(migrationDirectory, name), 'utf8'));
const migration = migrations.join('\n');
const workerSource = readFileSync(join(root, 'cloudflare', 'src', 'worker.mjs'), 'utf8');
const cloudflareSources = checked
  .filter((path) => path.includes(join('cloudflare', 'src')))
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n');

if (Object.keys(packageJson.dependencies ?? {}).length) fail('runtime dependency exists');
const expectedDevDependencies = {
  '@electric-sql/pglite': '0.5.8',
  wrangler: '4.112.0',
};
if (JSON.stringify(packageJson.devDependencies) !== JSON.stringify(expectedDevDependencies)) {
  fail('Only pinned local PGlite and Wrangler development dependencies are allowed');
}
if (config.name !== 'goencho-b2-canary-202609') fail('unexpected Worker name');
if (config.workers_dev !== false) fail('workers.dev must be disabled');
if (config.preview_urls !== false) fail('Preview URLs must be disabled');
if (config.routes || config.route) fail('route must not be configured');
if (config.observability?.enabled !== false) fail('observability must be disabled');
if (config.observability?.logs?.enabled !== false) fail('Workers Logs must be disabled');
if (config.observability?.logs?.invocation_logs !== false) fail('invocation logs must be disabled');
if (config.observability?.logs?.head_sampling_rate !== 0) fail('log sampling must be zero');
if (config.observability?.traces?.enabled !== false) fail('traces must be disabled');
if (config.observability?.traces?.head_sampling_rate !== 0) fail('trace sampling must be zero');
if (config.d1_databases?.length !== 1) fail('exactly one isolated D1 binding is required');
if (config.d1_databases?.[0]?.binding !== 'GOENCHO_DB') fail('unexpected D1 binding');
if (config.d1_databases?.[0]?.database_name !== 'goencho-b2-canary-db-202609') fail('unexpected D1 name');
if (config.d1_databases?.[0]?.database_id !== '00000000-0000-0000-0000-000000000000') {
  fail('remote D1 ID must remain an all-zero local placeholder');
}
if (config.d1_databases?.[0]?.preview_database_id !== 'goencho-b2-local-only') {
  fail('local D1 preview ID must remain isolated');
}
if ('account_id' in config) fail('account ID must not be stored');
if (!existsSync(join(root, 'SOURCE_MANIFEST.sha256'))) fail('source manifest missing');
for (const filename of ['.dev.vars', '.env']) {
  if (existsSync(join(root, filename))) fail(`${filename} must not be stored`);
}
if (/\b(?:test_receptions|receptions)\b/i.test(migration)) fail('forbidden reception object in migration');
if (/PRAGMA\s+journal_mode/i.test(migration)) fail('D1 migration must not set WAL');
const tables = [...migration.matchAll(/CREATE TABLE IF NOT EXISTS\s+([a-z0-9_]+)/gi)].map((match) => match[1]);
if (tables.some((table) => table !== 'schema_meta' && !table.startsWith('goencho_'))) {
  fail('migration contains a table outside the goencho namespace');
}
if (/node:sqlite|DatabaseSync|node:http|node:fs/i.test(cloudflareSources)) {
  fail('Worker runtime source contains an unsupported local runtime dependency');
}
if (/console\.(?:log|error|warn|info|debug)/.test(cloudflareSources)) fail('Worker runtime source emits console logs');
if (!/rejectTeacherIdInput/.test(workerSource)) fail('Worker does not reject client teacher IDs');
if (!/assertRuntimeBindings/.test(workerSource)) fail('Worker does not fail closed on missing bindings');

if (failures.length) {
  process.stderr.write(`B2 scope check failed (${failures.length})\n`);
  for (const message of failures) process.stderr.write(`- ${message}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`B2 scope check passed: ${checked.length} files, no route, no logs, isolated D1 placeholder only\n`);
}
