import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = resolve(root);
const manifestPath = join(root, 'SOURCE_MANIFEST.sha256');
const exclusions = new Set(['.local', '.wrangler', 'node_modules', 'coverage']);
const excludedFiles = new Set(['SOURCE_MANIFEST.sha256']);

function walk(directory, output = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && exclusions.has(entry.name)) continue;
    const full = join(directory, entry.name);
    if (entry.isDirectory()) walk(full, output);
    else if (!excludedFiles.has(entry.name)) output.push(full);
  }
  return output;
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

const expected = new Map();
for (const line of readFileSync(manifestPath, 'utf8').split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue;
  const match = line.match(/^([a-f0-9]{64})  (.+)$/);
  if (!match) throw new Error('Invalid source manifest line');
  expected.set(match[2], match[1]);
}

const actual = new Map(walk(source).map((path) => [
  relative(source, path).split(sep).join('/'),
  sha256(path),
]));
const failures = [];
for (const [path, hash] of expected) {
  if (!actual.has(path)) failures.push(`missing source file: ${path}`);
  else if (actual.get(path) !== hash) failures.push(`changed source file: ${path}`);
}
for (const path of actual.keys()) {
  if (!expected.has(path)) failures.push(`unrecorded source file: ${path}`);
}

if (failures.length) {
  process.stderr.write(`source manifest verification failed (${failures.length})\n`);
  for (const failure of failures) process.stderr.write(`- ${failure}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`source manifest verified: ${actual.size} offline B2-2C4-1 files unchanged\n`);
}
