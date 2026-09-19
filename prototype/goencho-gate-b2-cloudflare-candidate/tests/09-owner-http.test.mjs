import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../lib/config.mjs';
import { randomToken } from '../lib/crypto.mjs';
import { createGateB1Application } from '../server.mjs';

const config = Object.freeze({
  ...CONFIG,
  ownerPort: 4291,
  ownerAllowedHost: '127.0.0.1:4291',
  teacherPort: 4292,
  teacherAllowedHost: 'localhost:4292',
});
const ownerOrigin = 'http://127.0.0.1:4291';

async function post(path, body, cookie, overrides = {}) {
  return fetch(`${ownerOrigin}${path}`, {
    method: 'POST',
    headers: {
      Origin: ownerOrigin,
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
      ...overrides,
    },
    body: JSON.stringify(body),
  });
}

test('owner-http-01 owner session cookieで保護APIを利用しlogout後は拒否される', async () => {
  const app = createGateB1Application({ dbPath: ':memory:', config, seed: false });
  await app.start();
  try {
    const ticket = app.ownerAuth.createBootstrapTicket(randomToken());
    const activate = await post('/api/owner/bootstrap/activate', { ticket, pin: '640281' });
    assert.equal(activate.status, 201);
    const setCookies = activate.headers.getSetCookie();
    assert.equal(setCookies.length, 2);
    assert.ok(setCookies.some((value) => value.startsWith(`${config.ownerCookie}=`)));
    assert.ok(setCookies.some((value) => value.startsWith(`${config.ownerSessionCookie}=`)));
    const cookie = setCookies.map((value) => value.split(';')[0]).join('; ');

    const create = await post('/api/owner/teachers', { displayName: 'HTTP試験先生（架空）' }, cookie);
    assert.equal(create.status, 201);

    const legacyPin = await post('/api/owner/teachers', {
      displayName: '拒否確認先生（架空）', ownerPin: '640281',
    }, cookie);
    assert.equal(legacyPin.status, 400);
    assert.equal((await legacyPin.json()).error, 'OWNER_PIN_NOT_ACCEPTED');

    const logout = await post('/api/owner/session/logout', {}, cookie);
    assert.equal(logout.status, 200);
    const afterLogout = await post('/api/owner/teachers', { displayName: '拒否される先生（架空）' }, cookie);
    assert.equal(afterLogout.status, 401);
    assert.equal((await afterLogout.json()).error, 'OWNER_SESSION_INVALID');
  } finally {
    await app.close();
  }
});

test('owner-http-02 POSTはOriginなしを403、JSON以外を415で拒否する', async () => {
  const boundaryConfig = Object.freeze({
    ...config,
    ownerPort: 4293,
    ownerAllowedHost: '127.0.0.1:4293',
    teacherPort: 4294,
    teacherAllowedHost: 'localhost:4294',
  });
  const boundaryOrigin = 'http://127.0.0.1:4293';
  const app = createGateB1Application({ dbPath: ':memory:', config: boundaryConfig, seed: false });
  await app.start();
  try {
    const noOrigin = await fetch(`${boundaryOrigin}/api/owner/session/logout`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    assert.equal(noOrigin.status, 403);
    assert.equal((await noOrigin.json()).error, 'ORIGIN_REQUIRED');

    const notJson = await fetch(`${boundaryOrigin}/api/owner/session/logout`, {
      method: 'POST', headers: { Origin: boundaryOrigin, 'Content-Type': 'text/plain' }, body: '{}',
    });
    assert.equal(notJson.status, 415);
    assert.equal((await notJson.json()).error, 'JSON_REQUIRED');

    const legacyHeader = await fetch(`${boundaryOrigin}/api/owner/teacher-devices/pending`, {
      headers: { 'x-owner-pin': 'placeholder' },
    });
    assert.equal(legacyHeader.status, 400);
    assert.equal((await legacyHeader.json()).error, 'OWNER_PIN_NOT_ACCEPTED');

    const pendingWithoutSession = await fetch(`${boundaryOrigin}/api/owner/teacher-devices/pending`);
    assert.equal(pendingWithoutSession.status, 401);
    assert.equal((await pendingWithoutSession.json()).error, 'OWNER_SESSION_REQUIRED');

    for (const action of ['approve', 'revoke']) {
      const response = await fetch(`${boundaryOrigin}/api/owner/teacher-devices/fake-device/${action}`, {
        method: 'POST',
        headers: { Origin: boundaryOrigin, 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationCode: '0000' }),
      });
      assert.equal(response.status, 401);
      assert.equal((await response.json()).error, 'OWNER_SESSION_REQUIRED');
    }
  } finally {
    await app.close();
  }
});
