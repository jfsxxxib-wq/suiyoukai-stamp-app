/* oxlint-disable typescript/no-require-imports -- This test helper intentionally uses CommonJS. */
const http = require('node:http');

const port = Number(process.env.MOCK_SHEET_PORT || 43192);
const expectedSecret = process.env.MOCK_SHEET_SECRET || 'local-preview-secret';
const rows = [];

const server = http.createServer((request, response) => {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method === 'GET' && request.url === '/rows') {
    response.end(JSON.stringify({ rows }));
    return;
  }

  if (request.method === 'POST' && request.url === '/reset') {
    rows.length = 0;
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  if (request.method !== 'POST' || request.url !== '/') {
    response.statusCode = 404;
    response.end(JSON.stringify({ ok: false }));
    return;
  }

  let source = '';
  request.setEncoding('utf8');
  request.on('data', (chunk) => { source += chunk; });
  request.on('end', () => {
    const payload = JSON.parse(source || '{}');
    if (payload.secret !== expectedSecret) {
      response.end(JSON.stringify({ ok: false, error: 'unauthorized' }));
      return;
    }
    if (payload.displayName === '保存 失敗確認') {
      response.statusCode = 503;
      response.end(JSON.stringify({ ok: false, error: 'forced_failure' }));
      return;
    }
    const duplicate = rows.some((row) =>
      row.receptionCode === payload.receptionCode || row.clientRequestId === payload.clientRequestId,
    );
    if (!duplicate && rows.some((row) => row.displayName === payload.displayName)) {
      response.end(JSON.stringify({ ok: false, error: 'duplicate_name' }));
      return;
    }
    if (!duplicate) rows.push(payload);
    response.end(JSON.stringify({ ok: true, duplicate }));
  });
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`Mock reception sheet: http://127.0.0.1:${port}\n`);
});
