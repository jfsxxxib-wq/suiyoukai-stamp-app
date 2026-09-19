import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

class NodeD1Statement {
  constructor(db, sql, bindings = []) {
    this.db = db;
    this.sql = sql;
    this.bindings = bindings;
  }

  bind(...bindings) {
    return new NodeD1Statement(this.db, this.sql, bindings);
  }

  async first() {
    return this.db.prepare(this.sql).get(...this.bindings) ?? null;
  }

  async all() {
    return {
      success: true,
      results: this.db.prepare(this.sql).all(...this.bindings),
    };
  }

  async run() {
    return this.runSync();
  }

  runSync() {
    const result = this.db.prepare(this.sql).run(...this.bindings);
    return {
      success: true,
      meta: {
        changes: Number(result.changes ?? 0),
        last_row_id: Number(result.lastInsertRowid ?? 0),
      },
    };
  }
}

export class NodeD1Database {
  constructor({ seed = true } = {}) {
    this.sqlite = new DatabaseSync(':memory:');
    this.batchFailureIndex = null;
    this.sqlite.exec('PRAGMA foreign_keys = ON;');
    this.sqlite.exec(readFileSync(new URL('../migrations/0001_goencho.sql', import.meta.url), 'utf8'));
    if (seed) this.sqlite.exec(readFileSync(new URL('../../db/fake-fixtures.sql', import.meta.url), 'utf8'));
    this.sqlite.exec(readFileSync(new URL('../migrations/0002_auth_write_guards.sql', import.meta.url), 'utf8'));
  }

  prepare(sql) {
    return new NodeD1Statement(this.sqlite, sql);
  }

  async batch(statements) {
    this.sqlite.exec('BEGIN IMMEDIATE');
    try {
      const results = [];
      for (let index = 0; index < statements.length; index += 1) {
        if (this.batchFailureIndex === index) {
          this.batchFailureIndex = null;
          throw new Error(`Injected D1 batch failure at statement ${index}`);
        }
        results.push(statements[index].runSync());
      }
      this.sqlite.exec('COMMIT');
      return results;
    } catch (error) {
      this.sqlite.exec('ROLLBACK');
      throw error;
    }
  }

  failNextBatchAt(index) {
    this.batchFailureIndex = index;
  }

  close() {
    this.sqlite.close();
  }
}
