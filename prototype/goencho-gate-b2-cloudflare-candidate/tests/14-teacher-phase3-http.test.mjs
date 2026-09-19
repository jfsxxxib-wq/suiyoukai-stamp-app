import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../lib/config.mjs';
import { randomToken } from '../lib/crypto.mjs';
import { createGateB1Application } from '../server.mjs';

const config = Object.freeze({
  ...CONFIG,
  ownerPort: 4299,
  ownerAllowedHost: '127.0.0.1:4299',
  teacherPort: 4300,
  teacherAllowedHost: 'localhost:4300',
});
const origin = 'http://localhost:4300';
const secondConfig = Object.freeze({
  ...CONFIG,
  ownerPort: 4301,
  ownerAllowedHost: '127.0.0.1:4301',
  teacherPort: 4302,
  teacherAllowedHost: 'localhost:4302',
});
const secondOrigin = 'http://localhost:4302';
const thirdConfig = Object.freeze({
  ...CONFIG,
  ownerPort: 4303,
  ownerAllowedHost: '127.0.0.1:4303',
  teacherPort: 4304,
  teacherAllowedHost: 'localhost:4304',
});
const thirdOrigin = 'http://localhost:4304';

function cookieFrom(response, name) {
  return response.headers.getSetCookie()
    .map((value) => value.split(';')[0])
    .find((value) => value.startsWith(`${name}=`));
}

function request(path, { method = 'GET', body, cookie } = {}, requestOrigin = origin) {
  return fetch(`${requestOrigin}${path}`, {
    method,
    headers: {
      ...(method === 'POST' ? { Origin: requestOrigin, 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function prepareEnrollment(app, displayName = 'HTTP先生（架空）') {
  const bootstrap = app.ownerAuth.createBootstrapTicket(randomToken());
  const owner = app.ownerAuth.activate({ ticket: bootstrap, pin: '640281' });
  const actor = app.ownerAuth.resolveSession(owner.sessionToken);
  const teacher = app.ownerAuth.createInitialTeacherEnrollment({ actor, displayName });
  return { actor, ...teacher };
}

test('phase3-http-01 QR claimからpending・承認・unlock・logoutまで接続', async () => {
  const app = createGateB1Application({
    dbPath: ':memory:', config, seed: false, now: () => Date.parse('2026-09-17T09:00:00+09:00'),
  });
  await app.start();
  try {
    const before = await request('/api/teacher/state');
    assert.equal(before.status, 200);
    assert.deepEqual(await before.json(), { state: 'enrollment_required' });

    const enrollment = prepareEnrollment(app);
    const claimResponse = await request('/api/teacher/enrollment/claim', {
      method: 'POST', body: { ticket: enrollment.ticket },
    });
    assert.equal(claimResponse.status, 200);
    const claim = await claimResponse.json();
    assert.equal(claim.displayName, 'HTTP先生（架空）');
    assert.equal(claim.purpose, 'initial');
    assert.ok(claim.claimToken);

    const pinResponse = await request('/api/teacher/enrollment/set-pin', {
      method: 'POST', body: { claimToken: claim.claimToken, pin: '510824' },
    });
    assert.equal(pinResponse.status, 202);
    const pendingBody = await pinResponse.json();
    const deviceCookie = cookieFrom(pinResponse, config.teacherDeviceCookie);
    assert.ok(deviceCookie);
    assert.ok(pendingBody.confirmationCode);

    const pendingState = await request('/api/teacher/state', { cookie: deviceCookie });
    assert.equal(pendingState.status, 200);
    const pending = await pendingState.json();
    assert.equal(pending.state, 'pending');
    assert.equal(pending.confirmationCode, pendingBody.confirmationCode);
    assert.equal('teacherId' in pending, false);

    const pendingMatches = await request('/api/teacher/matches/today', { cookie: deviceCookie });
    assert.equal(pendingMatches.status, 401);
    assert.equal((await pendingMatches.json()).error, 'TEACHER_DEVICE_UNAVAILABLE');

    const row = app.db.prepare(`SELECT device_authorization_id FROM goencho_teacher_device_authorizations
      WHERE teacher_id = ?`).get(enrollment.teacherId);
    app.ownerAuth.approveDevice({
      actor: enrollment.actor,
      authorizationId: row.device_authorization_id,
      confirmationCode: pendingBody.confirmationCode,
    });

    const approvedState = await request('/api/teacher/state', { cookie: deviceCookie });
    const approved = await approvedState.json();
    assert.deepEqual(approved, {
      state: 'unlock_required', displayName: 'HTTP先生（架空）', reason: 'session_required',
    });
    assert.equal('confirmationCode' in approved, false);

    const unlockResponse = await request('/api/teacher/session/unlock', {
      method: 'POST', body: { pin: '510824' }, cookie: deviceCookie,
    });
    assert.equal(unlockResponse.status, 200);
    const sessionCookie = cookieFrom(unlockResponse, config.teacherSessionCookie);
    assert.ok(sessionCookie);
    const authenticatedCookies = `${deviceCookie}; ${sessionCookie}`;

    const activeState = await request('/api/teacher/state', { cookie: authenticatedCookies });
    assert.deepEqual(await activeState.json(), { state: 'active', displayName: 'HTTP先生（架空）' });

    const matches = await request('/api/teacher/matches/today', { cookie: authenticatedCookies });
    assert.equal(matches.status, 200);
    assert.deepEqual(await matches.json(), { date: '2026-09-17', matches: [] });

    const logout = await request('/api/teacher/session/logout', {
      method: 'POST', body: {}, cookie: authenticatedCookies,
    });
    assert.equal(logout.status, 200);
    const afterLogout = await request('/api/teacher/state', { cookie: authenticatedCookies });
    assert.equal((await afterLogout.json()).state, 'unlock_required');
  } finally {
    await app.close();
  }
});

test('phase3-http-02 sessionだけではmatchを取得できない', async () => {
  const app = createGateB1Application({ dbPath: ':memory:', config: secondConfig, seed: false });
  await app.start();
  try {
    const enrollment = prepareEnrollment(app, '端末照合先生（架空）');
    const claim = app.teacherAuth.claimEnrollment({ ticket: enrollment.ticket });
    const device = app.teacherAuth.setPin({ claimToken: claim.claimToken, pin: '510824' });
    app.ownerAuth.approveDevice({
      actor: enrollment.actor,
      authorizationId: device.authorizationId,
      confirmationCode: device.confirmationCode,
    });
    const session = app.teacherAuth.unlock({ deviceToken: device.deviceToken, pin: '510824' });
    const sessionOnly = `${secondConfig.teacherSessionCookie}=${encodeURIComponent(session.sessionToken)}`;
    const response = await request('/api/teacher/matches/today', { cookie: sessionOnly }, secondOrigin);
    assert.equal(response.status, 401);
    assert.equal((await response.json()).error, 'TEACHER_DEVICE_REQUIRED');
  } finally {
    await app.close();
  }
});

test('phase3-http-03 client teacher ID持込みと不正deviceを拒否', async () => {
  const app = createGateB1Application({ dbPath: ':memory:', config: thirdConfig, seed: false });
  await app.start();
  try {
    const carried = await request('/api/teacher/state?teacher_id=fake_teacher_b', {}, thirdOrigin);
    assert.equal(carried.status, 400);
    assert.equal((await carried.json()).error, 'TEACHER_ID_NOT_ACCEPTED');

    const unknownCookie = `${thirdConfig.teacherDeviceCookie}=${encodeURIComponent(randomToken())}`;
    const unknown = await request('/api/teacher/state', { cookie: unknownCookie }, thirdOrigin);
    assert.equal(unknown.status, 401);
    assert.equal((await unknown.json()).error, 'TEACHER_DEVICE_UNKNOWN');
  } finally {
    await app.close();
  }
});
