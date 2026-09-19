import http from 'node:http';

const securityHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  Pragma: 'no-cache',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
};

const formHtml = '<!doctype html><html lang="ja"><meta charset="utf-8"><title>REST Token 非表示入力</title><body><p>INPUT_WAITING_READY</p><form method="post" action="/submit" autocomplete="off"><label for="token">D1 Write/Edit短期Token</label><input id="token" name="token" type="password" autocomplete="off" spellcheck="false" required><button type="submit">渡す</button></form></body></html>';

export function isLoopbackAddress(value) {
  return value === '127.0.0.1' || value === '::1' || value === '::ffff:127.0.0.1';
}

function send(res, status, body) {
  res.writeHead(status, { ...securityHeaders, 'Content-Type': 'text/html; charset=utf-8' });
  res.end(body);
}

export function createTokenReceiver({ onToken, maxBytes = 4096, closeAfterAccept = true }) {
  if (typeof onToken !== 'function') throw new TypeError('onToken required');
  const state = {
    accepted: false,
    token_buffer_held: false,
    token_buffer_zeroed: false,
    server_closed: false,
  };
  let server;

  async function handle(req, res) {
    if (!isLoopbackAddress(req.socket.remoteAddress)) {
      send(res, 403, '<h1>拒否しました</h1>');
      return;
    }
    if (req.method === 'GET' && req.url === '/') {
      if (state.accepted) {
        send(res, 410, '<h1>使用済みです</h1>');
      } else {
        send(res, 200, formHtml);
      }
      return;
    }
    if (req.method !== 'POST' || req.url !== '/submit' || state.accepted) {
      send(res, state.accepted ? 410 : 404, '<h1>受理できません</h1>');
      return;
    }

    const declaredLength = Number(req.headers['content-length'] ?? 0);
    if (!Number.isFinite(declaredLength) || declaredLength < 1 || declaredLength > maxBytes) {
      send(res, 413, '<h1>入力サイズを受理できません</h1>');
      return;
    }

    const chunks = [];
    let received = 0;
    req.on('data', (chunk) => {
      received += chunk.length;
      if (received > maxBytes) {
        for (const item of chunks) item.fill(0);
        chunks.length = 0;
        req.destroy();
        return;
      }
      chunks.push(Buffer.from(chunk));
    });
    req.on('end', async () => {
      if (received > maxBytes) return;
      let rawBuffer = Buffer.concat(chunks);
      for (const item of chunks) item.fill(0);
      chunks.length = 0;
      let bodyText = rawBuffer.toString('utf8');
      rawBuffer.fill(0);
      rawBuffer = null;
      let params = new URLSearchParams(bodyText);
      bodyText = null;
      let tokenText = params.get('token') ?? '';
      params.delete('token');
      params = null;
      if (!tokenText) {
        tokenText = null;
        send(res, 400, '<h1>Tokenが空です</h1>');
        return;
      }

      const tokenBuffer = Buffer.from(tokenText, 'utf8');
      tokenText = null;
      state.accepted = true;
      state.token_buffer_held = true;
      try {
        await onToken(tokenBuffer);
        send(res, 200, '<p>TOKEN_RECEIVED_HIDDEN</p><p>値は保存・表示していません。</p>');
      } catch {
        send(res, 500, '<p>STOPPED_SAFE</p>');
      } finally {
        tokenBuffer.fill(0);
        state.token_buffer_held = false;
        state.token_buffer_zeroed = true;
        if (closeAfterAccept) {
          server.close(() => { state.server_closed = true; });
        }
      }
    });
  }

  server = http.createServer((req, res) => {
    handle(req, res).catch(() => send(res, 500, '<p>STOPPED_SAFE</p>'));
  });

  return {
    async listen() {
      await new Promise((resolvePromise, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolvePromise);
      });
      const address = server.address();
      return { host: '127.0.0.1', port: address.port };
    },
    async close() {
      if (!server.listening) {
        state.server_closed = true;
        return;
      }
      await new Promise((resolvePromise) => server.close(resolvePromise));
      state.server_closed = true;
    },
    getState() {
      return { ...state };
    },
  };
}
