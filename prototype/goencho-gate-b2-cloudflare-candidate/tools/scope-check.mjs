import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG } from '../lib/config.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const failures = [];
const checked = [];

function fail(message) {
  failures.push(message);
}

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.local' || entry.name === 'node_modules') continue;
    const full = join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (['.mjs', '.js', '.sql', '.json', '.html', '.css', '.md'].includes(extname(entry.name))) checked.push(full);
  }
}

walk(root);
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
if (Object.keys(packageJson.dependencies ?? {}).length) fail('runtime dependency exists');
if (Object.keys(packageJson.devDependencies ?? {}).length) fail('development dependency exists');
if (existsSync(join(root, 'package-lock.json'))) fail('package-lock.json exists');
if (CONFIG.ownerHost !== '127.0.0.1' || CONFIG.teacherHost !== '127.0.0.1') fail('non-loopback bind configured');
if (CONFIG.ownerPort !== 4191 || CONFIG.teacherPort !== 4192) fail('unexpected port configured');
if (CONFIG.ownerAllowedHost !== '127.0.0.1:4191' || CONFIG.teacherAllowedHost !== 'localhost:4192') fail('host allowlist changed');

for (const file of checked) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/https?:\/\/[^\s'"`<>)]+/gi)) {
    if (match[0].includes('${')) continue;
    if (!/^http:\/\/(?:127\.0\.0\.1:(?:4191|4193|4291|4293|4295|4297|4299|4301|4303|4311|4313)|localhost:(?:4192|4292|4294|4296|4298|4300|4302|4304|4312|4314))(?:\/|$)/i.test(match[0])) {
      fail(`external URL in ${file.slice(root.length)}`);
    }
  }
}

const schema = readFileSync(join(root, 'db', 'schema.sql'), 'utf8');
const fixture = readFileSync(join(root, 'db', 'fake-fixtures.sql'), 'utf8');
const executable = checked
  .filter((file) => ['.mjs', '.js', '.sql', '.json', '.html'].includes(extname(file)))
  .filter((file) => !file.endsWith(join('tools', 'scope-check.mjs')))
  .filter((file) => !file.endsWith(join('db', 'schema-invariants.mjs')))
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');
if (/\btest_receptions\b|\b(?:CREATE|ALTER|DROP|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+(?:TABLE\s+)?receptions?\b/i.test(executable)) {
  fail('forbidden reception object reference');
}
if (/\b(?:wrangler|cloudflare|database_id|account_id|d1_databases)\b/i.test(executable)) fail('remote platform binding reference');
const tableNames = [...schema.matchAll(/CREATE TABLE IF NOT EXISTS\s+([a-z0-9_]+)/gi)].map((match) => match[1]);
if (tableNames.some((name) => name !== 'schema_meta' && !name.startsWith('goencho_'))) fail('schema table outside goencho namespace');
const deviceBlock = schema.match(/CREATE TABLE IF NOT EXISTS goencho_teacher_device_authorizations[\s\S]*?\);/)?.[0] ?? '';
if (!deviceBlock || /expires_at/i.test(deviceBlock)) fail('teacher device expiry column exists or table missing');
if (/\b(teacher|participant|match)_id\b/i.test(fixture) && !/fake_teacher_a/.test(fixture)) fail('fixture ID prefix check failed');

if (failures.length) {
  process.stderr.write(`scope check failed (${failures.length})\n`);
  for (const message of failures) process.stderr.write(`- ${message}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`scope check passed: ${checked.length} files, loopback only, no external dependency or forbidden DB object\n`);
}
