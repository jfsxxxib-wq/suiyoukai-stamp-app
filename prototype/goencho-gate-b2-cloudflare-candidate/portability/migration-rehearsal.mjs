import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { DOMAIN_ID_TABLES, LOGICAL_SCHEMA_VERSION, TABLES } from './schema-manifest.mjs';

function quoteIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number' || typeof value === 'bigint') return String(value);
  if (value instanceof Uint8Array) return `X'${Buffer.from(value).toString('hex')}'`;
  return `'${String(value).replaceAll("'", "''")}'`;
}

function csvCell(value) {
  if (value === null || value === undefined) return '\\N';
  const text = String(value);
  return /[",\r\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function rowsToCsv(table, rows) {
  return [
    table.columns.map(csvCell).join(','),
    ...rows.map((row) => table.columns.map((column) => csvCell(row[column])).join(',')),
  ].join('\n');
}

export function csvToRows(table, csv) {
  const records = [];
  let record = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    if (quoted) {
      if (character === '"' && csv[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field === '') {
      quoted = true;
    } else if (character === ',') {
      record.push(field);
      field = '';
    } else if (character === '\n') {
      record.push(field.replace(/\r$/u, ''));
      records.push(record);
      record = [];
      field = '';
    } else {
      field += character;
    }
  }
  record.push(field.replace(/\r$/u, ''));
  records.push(record);
  const [header, ...values] = records;
  if (JSON.stringify(header) !== JSON.stringify(table.columns)) {
    throw new Error(`CSV columns differ for ${table.name}`);
  }
  return values.filter((row) => row.length > 1 || row[0] !== '').map((row) => Object.fromEntries(
    table.columns.map((column, index) => [column, row[index] === '\\N' ? null : row[index]]),
  ));
}

function selectSql(table) {
  const columns = table.columns.map(quoteIdentifier).join(', ');
  const order = table.primaryKey.map(quoteIdentifier).join(', ');
  return `SELECT ${columns} FROM ${quoteIdentifier(table.name)} ORDER BY ${order}`;
}

export function readSqliteTables(sqlite) {
  return Object.fromEntries(TABLES.map((table) => [table.name, sqlite.prepare(selectSql(table)).all()]));
}

export async function readPostgresTables(client) {
  const entries = [];
  for (const table of TABLES) {
    const result = await client.query(selectSql(table));
    entries.push([table.name, result.rows]);
  }
  return Object.fromEntries(entries);
}

export function createSqliteSnapshotSql(sqlite) {
  const lines = ['PRAGMA foreign_keys = OFF;', 'BEGIN TRANSACTION;'];
  for (const table of TABLES) {
    const definition = sqlite.prepare(
      "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?",
    ).get(table.name)?.sql;
    if (!definition) throw new Error(`SQLite schema missing ${table.name}`);
    lines.push(`${definition};`);
    for (const row of sqlite.prepare(selectSql(table)).all()) {
      lines.push(`INSERT INTO ${quoteIdentifier(table.name)} (${table.columns.map(quoteIdentifier).join(', ')}) VALUES (${table.columns.map((column) => sqlLiteral(row[column])).join(', ')});`);
    }
  }
  const indexes = sqlite.prepare(`SELECT sql FROM sqlite_master
    WHERE type = 'index' AND sql IS NOT NULL ORDER BY name`).all();
  for (const index of indexes) lines.push(`${index.sql};`);
  lines.push('COMMIT;', 'PRAGMA foreign_keys = ON;');
  return lines.join('\n');
}

export function restoreSqliteSnapshot(snapshotSql) {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(snapshotSql);
  return sqlite;
}

export function createCsvBundle(sqlite) {
  const rows = readSqliteTables(sqlite);
  return Object.fromEntries(TABLES.map((table) => [table.name, rowsToCsv(table, rows[table.name])]));
}

export async function importCsvBundleToPostgres(client, bundle) {
  await client.transaction(async (tx) => {
    for (const table of [...TABLES].reverse()) {
      await tx.query(`DELETE FROM ${quoteIdentifier(table.name)}`);
    }
    for (const table of TABLES) {
      const rows = csvToRows(table, bundle[table.name]);
      const columns = table.columns.map(quoteIdentifier).join(', ');
      const placeholders = table.columns.map((_, index) => `$${index + 1}`).join(', ');
      for (const row of rows) {
        await tx.query(
          `INSERT INTO ${quoteIdentifier(table.name)} (${columns}) VALUES (${placeholders})`,
          table.columns.map((column) => row[column]),
        );
      }
    }
  });
}

function normalizeValue(table, column, value) {
  if (value === null || value === undefined) return null;
  if (table.numeric?.includes(column)) return String(value);
  if (value instanceof Uint8Array) return Buffer.from(value).toString('hex');
  return String(value);
}

function canonicalRows(table, rows) {
  return rows.map((row) => table.columns.map((column) => normalizeValue(table, column, row[column])));
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function buildManifest(tables) {
  const manifest = {
    logicalSchemaVersion: LOGICAL_SCHEMA_VERSION,
    tables: {},
    domainIds: {},
  };
  for (const table of TABLES) {
    const rows = tables[table.name];
    const canonical = canonicalRows(table, rows);
    const keyIndexes = table.primaryKey.map((column) => table.columns.indexOf(column));
    const keys = canonical.map((row) => keyIndexes.map((index) => row[index]));
    manifest.tables[table.name] = {
      rowCount: rows.length,
      primaryKeyHash: sha256(JSON.stringify(keys)),
      rowHash: sha256(JSON.stringify(canonical)),
    };
  }
  for (const entry of DOMAIN_ID_TABLES) {
    const table = TABLES.find((candidate) => candidate.name === entry.table);
    manifest.domainIds[entry.column] = tables[entry.table]
      .map((row) => normalizeValue(table, entry.column, row[entry.column]))
      .sort();
  }
  return manifest;
}

export function compareManifests(expected, actual) {
  const differences = [];
  if (expected.logicalSchemaVersion !== actual.logicalSchemaVersion) differences.push('logicalSchemaVersion');
  for (const table of TABLES) {
    for (const field of ['rowCount', 'primaryKeyHash', 'rowHash']) {
      if (expected.tables[table.name]?.[field] !== actual.tables[table.name]?.[field]) {
        differences.push(`${table.name}.${field}`);
      }
    }
  }
  for (const id of Object.keys(expected.domainIds)) {
    if (JSON.stringify(expected.domainIds[id]) !== JSON.stringify(actual.domainIds[id])) {
      differences.push(`domainIds.${id}`);
    }
  }
  return differences;
}

export function sqliteForeignKeyViolations(sqlite) {
  return sqlite.prepare('PRAGMA foreign_key_check').all();
}

export async function postgresForeignKeyViolations(client) {
  const violations = [];
  for (const table of TABLES) {
    for (const [index, foreignKey] of (table.foreignKeys ?? []).entries()) {
      const conditions = foreignKey.columns.map((column, columnIndex) => (
        `child.${quoteIdentifier(column)} = parent.${quoteIdentifier(foreignKey.parentColumns[columnIndex])}`
      )).join(' AND ');
      const present = foreignKey.columns.map((column) => `child.${quoteIdentifier(column)} IS NOT NULL`).join(' AND ');
      const missing = foreignKey.parentColumns.map((column) => `parent.${quoteIdentifier(column)} IS NULL`).join(' AND ');
      const result = await client.query(`SELECT COUNT(*) AS count FROM ${quoteIdentifier(table.name)} child
        LEFT JOIN ${quoteIdentifier(foreignKey.parent)} parent ON ${conditions}
        WHERE ${present} AND ${missing}`);
      const count = Number(result.rows[0].count);
      if (count > 0) violations.push({ table: table.name, foreignKey: index, count });
    }
  }
  return violations;
}
