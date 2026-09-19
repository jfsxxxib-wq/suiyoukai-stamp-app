import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { buildCheckSql, loadAndValidate } from './rest-migrate-core.mjs';

const source0001 = process.argv[2];
if (!source0001) throw new Error('0001 fixture path required');
const sql0001 = await readFile(resolve(source0001), 'utf8');
const { sql: sql0002 } = await loadAndValidate();
const db = new DatabaseSync(':memory:');
db.exec('PRAGMA foreign_keys = ON;');
db.exec(sql0001);

const before = db.prepare(buildCheckSql({ after: false })).get();
assert.equal(Number(before.schema_version), 2);
assert.equal(Number(before.schema_meta_rows), 1);
assert.equal(Number(before.goencho_tables), 16);
assert.equal(Number(before.named_indexes), 4);
assert.equal(Number(before.foreign_keys), 15);
assert.equal(Number(before.business_rows), 0);
assert.equal(Number(before.total_columns), 122);
assert.equal(Number(before.added_columns), 0);
assert.equal(Number(before.new_indexes), 0);
assert.equal(Number(before.unexpected_named_indexes), 0);

db.exec(sql0002);
const after = db.prepare(buildCheckSql({ after: true })).get();
assert.equal(Number(after.schema_version), 3);
assert.equal(Number(after.schema_meta_rows), 1);
assert.equal(Number(after.goencho_tables), 16);
assert.equal(Number(after.named_indexes), 8);
assert.equal(Number(after.foreign_keys), 15);
assert.equal(Number(after.business_rows), 0);
assert.equal(Number(after.total_columns), 132);
assert.equal(Number(after.added_columns), 10);
assert.equal(Number(after.new_indexes), 4);
assert.equal(Number(after.column_shape_matches), 10);
assert.equal(Number(after.new_index_shape_matches), 4);
assert.equal(Number(after.new_index_column_matches), 4);
assert.equal(Number(after.new_index_predicate_matches), 4);
assert.equal(Number(after.unexpected_named_indexes), 0);
assert.equal(Number(after.unexpected_user_objects), 0);
db.close();

process.stdout.write('REST_0002_SQL_INTEGRATION_PASS pre_version=2 post_version=3 tables=17 indexes=8 foreign_keys=15 total_columns=132 added_columns=10 added_indexes=4 business_rows=0 external_network=0\n');
