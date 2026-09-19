import http from 'node:http';
import { readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const host = '127.0.0.1';
const port = 4193;
const allowedHost = `${host}:${port}`;
const files = new Map([
  ['/', 'index.html'],
  ['/styles.css', 'styles.css'],
  ['/preview.js', 'preview.js'],
]);
const mime = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
]);
const headers = {
  'Cache-Control': 'no-store',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
};

const server = http.createServer((request, response) => {
  if (request.headers.host !== allowedHost) {
    response.writeHead(400, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Invalid host');
    return;
  }
  const pathname = new URL(request.url, `http://${allowedHost}`).pathname;
  const file = files.get(pathname);
  if (!file || request.method !== 'GET') {
    response.writeHead(404, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  response.writeHead(200, { ...headers, 'Content-Type': mime.get(extname(file)) });
  response.end(readFileSync(join(root, file)));
});

server.listen(port, host, () => {
  process.stdout.write('Gate B1 Phase 0 static preview: http://127.0.0.1:4193/\n');
});

const stop = () => server.close(() => process.exit(0));
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
