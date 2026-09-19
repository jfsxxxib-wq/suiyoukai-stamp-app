import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile(new URL('./source-manifest.json', import.meta.url), 'utf8'));
assert.equal(manifest.format, 1);
assert.equal(Array.isArray(manifest.files), true);
const listed = new Set();
for (const item of manifest.files) {
  assert.equal(typeof item.path, 'string');
  assert.match(item.sha256, /^[A-F0-9]{64}$/);
  assert.equal(listed.has(item.path), false, `duplicate ${item.path}`);
  listed.add(item.path);
  const content = await readFile(new URL(`./${item.path}`, import.meta.url));
  assert.equal(content.length, item.bytes, `${item.path}: bytes`);
  assert.equal(createHash('sha256').update(content).digest('hex').toUpperCase(), item.sha256, `${item.path}: sha256`);
}
const actual = (await readdir(import.meta.dirname)).filter((name) => name !== 'source-manifest.json').sort();
assert.deepEqual([...listed].sort(), actual);
process.stdout.write(`REST_0002_SOURCE_MANIFEST_PASS files=${listed.size}\n`);
