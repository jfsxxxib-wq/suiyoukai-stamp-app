import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../lib/config.mjs';
import { randomToken } from '../lib/crypto.mjs';
import { createGateB1Application } from '../server.mjs';

const config = Object.freeze({
  ...CONFIG,
  ownerPort: 4295,
  ownerAllowedHost: '127.0.0.1:4295',
  teacherPort: 4296,
  teacherAllowedHost: 'localhost:4296',
});
const origin = 'http://127.0.0.1:4295';

function cookieHeader(response) {
  return response.headers.getSetCookie().map((value) => value.split(';')[0]).join('; ');
}

function request(path, { method = 'GET', body, cookie } = {}) {
  return fetch(`${origin}${path}`, {
    method,
    headers: {
      ...(method === 'POST' ? { Origin: origin, 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

test('phase2-http-01 setupから先生端末承認・失効までowner sessionだけで接続する', async () => {
  const app = createGateB1Application({ dbPath: ':memory:', config, seed: false });
  await app.start();
  try {
    const before = await request('/api/owner/state');
    assert.equal(before.status, 200);
    assert.deepEqual(await before.json(), { state: 'setup_required' });

    const bootstrap = app.ownerAuth.createBootstrapTicket(randomToken());
    const activate = await request('/api/owner/bootstrap/activate', {
      method: 'POST', body: { ticket: bootstrap, pin: '640281' },
    });
    assert.equal(activate.status, 201);
    const cookie = cookieHeader(activate);
    assert.match(cookie, new RegExp(`${config.ownerCookie}=`));
    assert.match(cookie, new RegExp(`${config.ownerSessionCookie}=`));

    const active = await request('/api/owner/state', { cookie });
    assert.deepEqual(await active.json(), { state: 'active' });

    const enrollmentResponse = await request('/api/owner/teacher-enrollments', {
      method: 'POST', body: { displayName: 'HTTP接続先生（架空）' }, cookie,
    });
    assert.equal(enrollmentResponse.status, 201);
    const enrollment = await enrollmentResponse.json();
    assert.ok(enrollment.ticket);
    assert.match(enrollment.teacherId, /^teacher_/);

    const claim = app.teacherAuth.claimEnrollment({ ticket: enrollment.ticket });
    const pendingDevice = app.teacherAuth.setPin({ claimToken: claim.claimToken, pin: '510824' });

    const pendingResponse = await request('/api/owner/teacher-devices?status=pending', { cookie });
    assert.equal(pendingResponse.status, 200);
    const pending = (await pendingResponse.json()).devices;
    assert.equal(pending.length, 1);
    assert.equal(pending[0].device_authorization_id, pendingDevice.authorizationId);
    assert.equal(pending[0].confirmation_code, pendingDevice.confirmationCode);

    const approve = await request(`/api/owner/teacher-devices/${encodeURIComponent(pendingDevice.authorizationId)}/approve`, {
      method: 'POST', body: { confirmationCode: pendingDevice.confirmationCode }, cookie,
    });
    assert.equal(approve.status, 200);

    const approvedResponse = await request('/api/owner/teacher-devices?status=approved', { cookie });
    assert.equal(approvedResponse.status, 200);
    const approved = (await approvedResponse.json()).devices;
    assert.equal(approved.length, 1);
    assert.equal('confirmation_code' in approved[0], false);
    assert.equal('token_hash' in approved[0], false);

    const revoke = await request(`/api/owner/teacher-devices/${encodeURIComponent(pendingDevice.authorizationId)}/revoke`, {
      method: 'POST', body: {}, cookie,
    });
    assert.equal(revoke.status, 200);
    assert.equal(app.db.prepare('SELECT status FROM goencho_teacher_device_authorizations WHERE device_authorization_id = ?')
      .get(pendingDevice.authorizationId).status, 'revoked');
  } finally {
    await app.close();
  }
});

test('phase2-http-02 sessionなしでは一覧と一括先生登録を拒否する', async () => {
  const secondConfig = Object.freeze({
    ...config,
    ownerPort: 4297,
    ownerAllowedHost: '127.0.0.1:4297',
    teacherPort: 4298,
    teacherAllowedHost: 'localhost:4298',
  });
  const secondOrigin = 'http://127.0.0.1:4297';
  const app = createGateB1Application({ dbPath: ':memory:', config: secondConfig, seed: false });
  await app.start();
  try {
    const list = await fetch(`${secondOrigin}/api/owner/teacher-devices?status=pending`);
    assert.equal(list.status, 401);
    assert.equal((await list.json()).error, 'OWNER_SESSION_REQUIRED');

    const create = await fetch(`${secondOrigin}/api/owner/teacher-enrollments`, {
      method: 'POST',
      headers: { Origin: secondOrigin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: '拒否確認先生（架空）' }),
    });
    assert.equal(create.status, 401);
    assert.equal((await create.json()).error, 'OWNER_SESSION_REQUIRED');
  } finally {
    await app.close();
  }
});
