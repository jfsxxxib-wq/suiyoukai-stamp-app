import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import worker from '../dist/server/index.js';

class Statement {
  constructor(database, sql, values = []) { this.database = database; this.sql = sql; this.values = values; }
  bind(...values) { return new Statement(this.database, this.sql, values); }
  async first() { return this.database.prepare(this.sql).get(...this.values) ?? null; }
  async all() { return { results: this.database.prepare(this.sql).all(...this.values) }; }
  async run() {
    const result = this.database.prepare(this.sql).run(...this.values);
    return { success: true, meta: { changes: Number(result.changes) } };
  }
}

class LocalD1 {
  constructor() { this.database = new DatabaseSync(':memory:'); }
  prepare(sql) { return new Statement(this.database, sql); }
  async batch(statements) { return Promise.all(statements.map((statement) => statement.run())); }
}

const database = new LocalD1();
database.database.exec('PRAGMA foreign_keys = ON');
for (const migrationPath of ['../drizzle/0000_needy_adam_destine.sql', '../drizzle/0001_teacher_admin_matches.sql', '../drizzle/0002_harsh_invisible_woman.sql']) {
  const migration = readFileSync(new URL(migrationPath, import.meta.url), 'utf8');
  for (const statement of migration.split('--> statement-breakpoint')) if (statement.trim()) database.database.exec(statement);
}

const clientRoot = new URL('../dist/client/', import.meta.url).pathname.replace(/^\/(.:\/)/, '$1');
const contentTypes = { '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json' };

function staticResponse(pathname) {
  const relative = normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, '');
  const file = join(clientRoot, relative);
  if (!file.startsWith(clientRoot)) return null;
  try {
    if (!statSync(file).isFile()) return null;
    return new Response(readFileSync(file), { headers: { 'Content-Type': contentTypes[extname(file)] || 'application/octet-stream' } });
  } catch { return null; }
}

const env = {
  DB: database,
  SUIYOUKAI_LOCAL_TEST_MODE: '1',
  SUIYOUKAI_ADMIN_USER_IDS: '',
  SUIYOUKAI_TEACHER_USER_MAP: '{}',
};
const executionContext = { waitUntil() {}, passThroughOnException() {} };

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', 'http://127.0.0.1:4181');
    const asset = url.pathname.startsWith('/_next/') || url.pathname === '/favicon.svg' ? staticResponse(url.pathname) : null;
    const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : Readable.toWeb(request);
    const webRequest = new Request(url, { method: request.method, headers: request.headers, body, ...(body ? { duplex: 'half' } : {}) });
    const webResponse = asset || await worker.fetch(webRequest, env, executionContext);
    response.statusCode = webResponse.status;
    for (const [name, value] of webResponse.headers) response.setHeader(name, value);
    if (!webResponse.body) return response.end();
    Readable.fromWeb(webResponse.body).pipe(response);
  } catch (error) {
    response.statusCode = 500;
    response.end(error instanceof Error ? error.stack : String(error));
  }
});

server.listen(4181, '127.0.0.1', () => console.log('Local production candidate: http://127.0.0.1:4181'));
