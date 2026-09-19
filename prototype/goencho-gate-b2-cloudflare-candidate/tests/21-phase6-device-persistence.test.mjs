import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CONFIG, assertRuntimeConfig } from '../lib/config.mjs';
import { randomToken } from '../lib/crypto.mjs';
import { localDeviceCookie, localSessionCookie } from '../lib/http-security.mjs';
import { createGateB1Application } from '../server.mjs';
import { createHarness } from './helpers.mjs';

const config = Object.freeze({
  ...CONFIG,
  ownerPort: 4315,
  ownerAllowedHost: '127.0.0.1:4315',
  teacherPort: 4316,
  teacherAllowedHost: 'localhost:4316',
});
const ownerOrigin = `http://${config.ownerAllowedHost}`;
const teacherOrigin = `http://${config.teacherAllowedHost}`;

function setCookie(response, name) {
  return response.headers.getSetCookie().find((value) => value.startsWith(`${name}=`));
}

function cookiePair(header) {
  return header?.split(';')[0];
}

function cookieValue(pair) {
  return decodeURIComponent(pair.slice(pair.indexOf('=') + 1));
}

function request(origin, path, { method = 'GET', body, cookie } = {}) {
  return fetch(`${origin}${path}`, {
    method,
    headers: {
      Connection: 'close',
      ...(method === 'POST' ? { Origin: origin, 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function prepareTeacher(app, displayName = 'Phase 6先生（架空）') {
  const bootstrap = app.ownerAuth.createBootstrapTicket(randomToken());
  const owner = app.ownerAuth.activate({ ticket: bootstrap, pin: '640281' });
  const actor = app.ownerAuth.resolveSession(owner.sessionToken);
  const enrollment = app.ownerAuth.createInitialTeacherEnrollment({ actor, displayName });
  const claim = app.teacherAuth.claimEnrollment({ ticket: enrollment.ticket });
  const device = app.teacherAuth.setPin({ claimToken: claim.claimToken, pin: '510824' });
  return { actor, owner, enrollment, device };
}

test('phase6-01 端末証明Cookieだけが永続属性を持つ', () => {
  const device = localDeviceCookie('device', 'runtime-only', CONFIG.deviceCredentialMaxAgeSeconds);
  const session = localSessionCookie('session', 'runtime-only');
  assert.match(device, new RegExp(`Max-Age=${CONFIG.deviceCredentialMaxAgeSeconds}(?:;|$)`));
  assert.doesNotMatch(session, /Max-Age=/);
  for (const cookie of [device, session]) {
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Strict/);
    assert.match(cookie, /Path=\//);
    assert.doesNotMatch(cookie, /Domain=/);
  }
});

test('phase6-02 不正な端末証明保持設定では安全に停止する', () => {
  assert.throws(() => localDeviceCookie('device', 'runtime-only', 0), /positive integer/);
  assert.throws(() => assertRuntimeConfig({ ...CONFIG, deviceCredentialMaxAgeSeconds: 0 }), /positive integer/);
});

test('phase6-03 owner端末証明は更新されsessionは永続化しない', async () => {
  const app = createGateB1Application({ dbPath: ':memory:', config, seed: false });
  await app.start();
  try {
    const ticket = app.ownerAuth.createBootstrapTicket(randomToken());
    const activate = await request(ownerOrigin, '/api/owner/bootstrap/activate', {
      method: 'POST', body: { ticket, pin: '640281' },
    });
    const deviceHeader = setCookie(activate, config.ownerCookie);
    const sessionHeader = setCookie(activate, config.ownerSessionCookie);
    assert.match(deviceHeader, new RegExp(`Max-Age=${config.deviceCredentialMaxAgeSeconds}(?:;|$)`));
    assert.doesNotMatch(sessionHeader, /Max-Age=/);

    const deviceCookie = cookiePair(deviceHeader);
    const state = await request(ownerOrigin, '/api/owner/state', { cookie: deviceCookie });
    assert.deepEqual(await state.json(), { state: 'unlock_required' });
    assert.match(setCookie(state, config.ownerCookie), /Max-Age=/);

    const unlock = await request(ownerOrigin, '/api/owner/session/unlock', {
      method: 'POST', body: { pin: '640281' }, cookie: deviceCookie,
    });
    assert.match(setCookie(unlock, config.ownerCookie), /Max-Age=/);
    assert.doesNotMatch(setCookie(unlock, config.ownerSessionCookie), /Max-Age=/);
  } finally {
    await app.close();
  }
});

test('phase6-04 先生端末証明はpending・承認後・PIN再認証で更新される', async () => {
  const app = createGateB1Application({ dbPath: ':memory:', config, seed: false });
  await app.start();
  try {
    const bootstrap = app.ownerAuth.createBootstrapTicket(randomToken());
    const owner = app.ownerAuth.activate({ ticket: bootstrap, pin: '640281' });
    const actor = app.ownerAuth.resolveSession(owner.sessionToken);
    const enrollment = app.ownerAuth.createInitialTeacherEnrollment({ actor, displayName: 'Phase 6先生（架空）' });
    const claimResponse = await request(teacherOrigin, '/api/teacher/enrollment/claim', {
      method: 'POST', body: { ticket: enrollment.ticket },
    });
    const claim = await claimResponse.json();
    const setPin = await request(teacherOrigin, '/api/teacher/enrollment/set-pin', {
      method: 'POST', body: { claimToken: claim.claimToken, pin: '510824' },
    });
    assert.equal(setPin.status, 202);
    const pendingBody = await setPin.json();
    const setPinDeviceHeader = setCookie(setPin, config.teacherDeviceCookie);
    assert.match(setPinDeviceHeader, new RegExp(`Max-Age=${config.deviceCredentialMaxAgeSeconds}(?:;|$)`));

    const pendingCookie = cookiePair(setPinDeviceHeader);
    const pending = await request(teacherOrigin, '/api/teacher/state', { cookie: pendingCookie });
    assert.equal((await pending.json()).state, 'pending');
    assert.match(setCookie(pending, config.teacherDeviceCookie), /Max-Age=/);

    const row = app.db.prepare(`SELECT device_authorization_id FROM goencho_teacher_device_authorizations
      WHERE teacher_id = ?`).get(enrollment.teacherId);
    app.ownerAuth.approveDevice({
      actor,
      authorizationId: row.device_authorization_id,
      confirmationCode: pendingBody.confirmationCode,
    });
    const approved = await request(teacherOrigin, '/api/teacher/state', { cookie: pendingCookie });
    assert.equal((await approved.json()).state, 'unlock_required');
    assert.match(setCookie(approved, config.teacherDeviceCookie), /Max-Age=/);

    const unlock = await request(teacherOrigin, '/api/teacher/session/unlock', {
      method: 'POST', body: { pin: '510824' }, cookie: pendingCookie,
    });
    assert.equal(unlock.status, 200);
    assert.match(setCookie(unlock, config.teacherDeviceCookie), /Max-Age=/);
    assert.doesNotMatch(setCookie(unlock, config.teacherSessionCookie), /Max-Age=/);
    assert.deepEqual(await unlock.json(), { status: 'unlocked' });
  } finally {
    await app.close();
  }
});

test('phase6-05 端末証明がなければPINだけで復旧できない', async () => {
  const app = createGateB1Application({ dbPath: ':memory:', config, seed: false });
  await app.start();
  try {
    prepareTeacher(app);
    const state = await request(teacherOrigin, '/api/teacher/state');
    assert.deepEqual(await state.json(), { state: 'enrollment_required' });
    assert.equal(setCookie(state, config.teacherDeviceCookie), undefined);

    const unlock = await request(teacherOrigin, '/api/teacher/session/unlock', {
      method: 'POST', body: { pin: '510824' },
    });
    assert.equal(unlock.status, 401);
    assert.deepEqual(await unlock.json(), { error: 'TEACHER_DEVICE_REQUIRED' });
    assert.equal(setCookie(unlock, config.teacherDeviceCookie), undefined);
  } finally {
    await app.close();
  }
});

test('phase6-06 失効済み端末は古いCookieでも更新・利用できない', async () => {
  const app = createGateB1Application({ dbPath: ':memory:', config, seed: false });
  await app.start();
  try {
    const prepared = prepareTeacher(app);
    app.ownerAuth.approveDevice({
      actor: prepared.actor,
      authorizationId: prepared.device.authorizationId,
      confirmationCode: prepared.device.confirmationCode,
    });
    app.ownerAuth.revokeDevice({ actor: prepared.actor, authorizationId: prepared.device.authorizationId });
    const deviceCookie = `${config.teacherDeviceCookie}=${encodeURIComponent(prepared.device.deviceToken)}`;
    const state = await request(teacherOrigin, '/api/teacher/state', { cookie: deviceCookie });
    assert.equal(state.status, 401);
    assert.deepEqual(await state.json(), { error: 'TEACHER_DEVICE_UNAVAILABLE' });
    assert.equal(setCookie(state, config.teacherDeviceCookie), undefined);
  } finally {
    await app.close();
  }
});

test('phase6-07 ownerと先生の端末証明はoriginを越えて使えない', async () => {
  const app = createGateB1Application({ dbPath: ':memory:', config, seed: false });
  await app.start();
  try {
    const prepared = prepareTeacher(app);
    const ownerCookie = `${config.ownerCookie}=${encodeURIComponent(prepared.owner.deviceToken)}`;
    const teacherCookie = `${config.teacherDeviceCookie}=${encodeURIComponent(prepared.device.deviceToken)}`;
    const teacherState = await request(teacherOrigin, '/api/teacher/state', { cookie: ownerCookie });
    assert.deepEqual(await teacherState.json(), { state: 'enrollment_required' });
    const ownerState = await request(ownerOrigin, '/api/owner/state', { cookie: teacherCookie });
    assert.deepEqual(await ownerState.json(), { state: 'recovery_required' });
  } finally {
    await app.close();
  }
});

test('phase6-08 同じpepperでserver再起動後も同じ承認端末としてPIN再認証できる', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'goencho-phase6-'));
  const dbPath = join(directory, 'candidate.sqlite');
  const pepper = randomToken(32);
  const restartConfig = Object.freeze({
    ...CONFIG,
    ownerPort: 4317,
    ownerAllowedHost: '127.0.0.1:4317',
    teacherPort: 4318,
    teacherAllowedHost: 'localhost:4318',
  });
  const restartTeacherOrigin = `http://${restartConfig.teacherAllowedHost}`;
  let first;
  let second;
  try {
    first = createGateB1Application({
      dbPath, pepper, config: restartConfig, seed: false,
      now: () => Date.parse('2026-09-18T09:00:00+09:00'),
    });
    await first.start();
    const prepared = prepareTeacher(first, '再起動確認先生（架空）');
    first.ownerAuth.approveDevice({
      actor: prepared.actor,
      authorizationId: prepared.device.authorizationId,
      confirmationCode: prepared.device.confirmationCode,
    });
    const deviceToken = prepared.device.deviceToken;
    const teacherId = prepared.enrollment.teacherId;
    await first.close();
    first = null;

    second = createGateB1Application({
      dbPath, pepper, config: restartConfig, seed: false,
      now: () => Date.parse('2026-09-18T09:05:00+09:00'),
    });
    await second.start();
    const deviceCookie = `${restartConfig.teacherDeviceCookie}=${encodeURIComponent(deviceToken)}`;
    const state = await request(restartTeacherOrigin, '/api/teacher/state', { cookie: deviceCookie });
    assert.deepEqual(await state.json(), {
      state: 'unlock_required', displayName: '再起動確認先生（架空）', reason: 'session_required',
    });
    assert.match(setCookie(state, restartConfig.teacherDeviceCookie), /Max-Age=/);

    const unlock = await request(restartTeacherOrigin, '/api/teacher/session/unlock', {
      method: 'POST', body: { pin: '510824' }, cookie: deviceCookie,
    });
    const sessionPair = cookiePair(setCookie(unlock, restartConfig.teacherSessionCookie));
    const actor = second.teacherAuth.resolveDeviceSession({
      deviceToken,
      sessionToken: cookieValue(sessionPair),
    });
    assert.equal(actor.teacherId, teacherId);

    const matches = await request(restartTeacherOrigin, '/api/teacher/matches/today', {
      cookie: `${deviceCookie}; ${sessionPair}`,
    });
    assert.equal(matches.status, 200);
  } finally {
    if (first) await first.close();
    if (second) await second.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test('phase6-09 800日相当の経過でもDB承認状態は自動失効しない', () => {
  const harness = createHarness({ seed: false });
  try {
    const device = harness.enrollTeacher({ approve: true });
    harness.advance(800 * 24 * 60 * 60 * 1000);
    assert.equal(harness.teacherAuth.teacherState({ deviceToken: device.deviceToken }).state, 'unlock_required');
    const row = harness.db.prepare(`SELECT status FROM goencho_teacher_device_authorizations
      WHERE device_authorization_id = ?`).get(device.authorizationId);
    assert.equal(row.status, 'approved');
  } finally {
    harness.close();
  }
});
