import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fail } from '../../lib/errors.mjs';
import { GoenchoD1AuthService } from '../src/d1-auth-service.mjs';
import { createWorkerApplication } from '../src/worker.mjs';
import { requiredSecretNames } from '../src/runtime-config.mjs';
import { fakeSecrets, FIXED_NOW } from './helpers.mjs';
import { NodeD1Database } from './node-d1.mjs';

const origin = 'https://goencho-b2.invalid';
const source = readFileSync(new URL('../src/worker.mjs', import.meta.url), 'utf8');
const runtimeConfigSource = readFileSync(new URL('../src/runtime-config.mjs', import.meta.url), 'utf8');
const ownerUi = readFileSync(new URL('../../public/owner/owner.js', import.meta.url), 'utf8');
const teacherUi = readFileSync(new URL('../../public/teacher/teacher.js', import.meta.url), 'utf8');
const serverSource = readFileSync(new URL('../../server.mjs', import.meta.url), 'utf8');

function request(path, { method = 'GET', body, cookie, headers = {} } = {}) {
  const output = new Headers(headers);
  if (cookie) output.set('cookie', cookie);
  if (method === 'POST') {
    output.set('origin', output.get('origin') ?? origin);
    output.set('content-type', output.get('content-type') ?? 'application/json');
  }
  return new Request(`${origin}${path}`, {
    method,
    headers: output,
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function repository(overrides = {}) {
  return {
    schemaVersion: async () => 3,
    resolveTeacherActor: async () => ({ kind: 'teacher', teacherId: 'teacher-a' }),
    todayMatches: async () => [{ matchId: 'match-today' }],
    matchDates: async () => ['2026-09-18'],
    matchesByDate: async () => [{ matchId: 'match-past' }],
    participantMatches: async () => [{ matchId: 'match-person' }],
    ...overrides,
  };
}

function auth(overrides = {}) {
  return {
    ownerState: async () => ({ state: 'setup_required' }),
    activateOwner: async () => ({ deviceToken: 'owner-device', sessionToken: 'owner-session', recoveryCodes: ['RC-1'] }),
    recoverOwner: async () => ({ deviceToken: 'owner-device-2', sessionToken: 'owner-session-2', recoveryCodes: ['RC-2'] }),
    unlockOwner: async () => ({ sessionToken: 'owner-session-3' }),
    logoutOwner: async () => ({ status: 'logged_out' }),
    resolveOwnerActor: async () => ({ kind: 'owner', operatorId: 'owner-a' }),
    createInitialTeacherEnrollment: async () => ({ teacherId: 'teacher-a', token: 'ticket-a', purpose: 'initial' }),
    listTeacherDevices: async ({ status }) => [{ status, device_authorization_id: 'device-a' }],
    approveTeacherDevice: async () => ({ status: 'approved' }),
    rejectTeacherDevice: async () => ({ status: 'revoked' }),
    revokeTeacherDevice: async () => ({ status: 'revoked' }),
    teacherState: async () => ({ state: 'enrollment_required' }),
    claimEnrollment: async () => ({ claimToken: 'claim-a', purpose: 'initial', displayName: '架空先生' }),
    setTeacherPin: async () => ({ status: 'pending', confirmationCode: '1234', deviceToken: 'teacher-device' }),
    unlockTeacher: async () => ({ sessionToken: 'teacher-session' }),
    logoutTeacher: async () => ({ status: 'logged_out' }),
    ...overrides,
  };
}

function application({ repositoryValue, authValue, assertBindings, assets } = {}) {
  return {
    app: createWorkerApplication({
      now: () => FIXED_NOW,
      repositoryFactory: () => repositoryValue ?? repository(),
      authServiceFactory: () => authValue ?? auth(),
      assertBindings: assertBindings ?? (() => true),
    }),
    env: { ...fakeSecrets(), GOENCHO_DB: {}, ...(assets ? { ASSETS: assets } : {}) },
  };
}

test('F01 role別routeとassetは一意で旧surface・root・未知pathを拒否する', async () => {
  const assetCalls = [];
  const assets = {
    async fetch(input) {
      const pathname = new URL(input.url).pathname;
      assetCalls.push(pathname);
      const type = pathname.endsWith('.css') ? 'text/css' : pathname.endsWith('.js') ? 'text/javascript' : 'text/html';
      return new Response('fixture', { status: 200, headers: { 'content-type': type } });
    },
  };
  const { app, env } = application({ assets });
  for (const [path, mime] of [
    ['/owner/', 'text/html'], ['/owner/owner.js', 'text/javascript'],
    ['/teacher/', 'text/html'], ['/teacher/teacher.js', 'text/javascript'],
    ['/shared/styles.css', 'text/css'], ['/shared/api.js', 'text/javascript'],
  ]) {
    const response = await app.fetch(request(path), env);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), new RegExp(mime));
  }
  for (const path of ['/', '/owner/unknown.js', '/api/matches/today', '/api/session/unlock']) {
    assert.equal((await app.fetch(request(path), env)).status, 404);
  }
  assert.equal(assetCalls.length, 6);
  assert.match(ownerUi, /\/api\/owner\//);
  assert.doesNotMatch(ownerUi, /\/api\/teacher\//);
  assert.match(teacherUi, /\/api\/teacher\//);
  assert.doesNotMatch(teacherUi, /\/api\/owner\//);
});

test('F02 binding・5 secret欠落/短値はauth・repository・asset前に503 fail-closed', async () => {
  let downstreamCalls = 0;
  const app = createWorkerApplication({
    repositoryFactory: () => { downstreamCalls += 1; return repository(); },
    authServiceFactory: () => { downstreamCalls += 1; return auth(); },
  });
  for (const name of [undefined, ...requiredSecretNames()]) {
    const env = { ...fakeSecrets(), GOENCHO_DB: { prepare() {} } };
    if (name === undefined) delete env.GOENCHO_DB;
    else delete env[name];
    const response = await app.fetch(request('/owner/'), env);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: 'SERVICE_UNAVAILABLE' });
  }
  for (const name of requiredSecretNames()) {
    const env = { ...fakeSecrets(), GOENCHO_DB: { prepare() {} }, [name]: 'short' };
    assert.equal((await app.fetch(request('/api/health'), env)).status, 503);
  }
  assert.equal(downstreamCalls, 0);
});

test('F03 owner state/mutation公開bodyとdevice/session Cookie属性を分離する', async () => {
  for (const state of ['setup_required', 'recovery_required', 'unlock_required', 'active', 'unavailable']) {
    const { app, env } = application({ authValue: auth({ ownerState: async () => ({ state }) }) });
    const response = await app.fetch(request('/api/owner/state', {
      cookie: 'goencho_owner_device=owner-device; goencho_owner_session=owner-session',
    }), env);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { state });
  }
  const { app, env } = application();
  const activated = await app.fetch(request('/api/owner/bootstrap/activate', {
    method: 'POST', body: { ticket: 'ticket', pin: '123456' },
  }), env);
  assert.equal(activated.status, 201);
  assert.deepEqual(await activated.json(), { status: 'owner_active', recoveryCodes: ['RC-1'] });
  const cookies = activated.headers.getSetCookie();
  assert.equal(cookies.length, 2);
  assert.match(cookies[0], /goencho_owner_device=.*Max-Age=/);
  assert.match(cookies[1], /goencho_owner_session=/);
  assert.doesNotMatch(cookies[1], /Max-Age=/);
  const logout = await app.fetch(request('/api/owner/session/logout', { method: 'POST', body: {} }), env);
  assert.match(logout.headers.getSetCookie()[0], /Max-Age=0/);
});

test('F03-F06 real D1 facadeでowner登録から先生activeまでHTTP終端が一致する', async () => {
  const db = new NodeD1Database({ seed: false });
  const secrets = fakeSecrets();
  const service = new GoenchoD1AuthService({ db, secrets, now: () => FIXED_NOW });
  const app = createWorkerApplication({
    now: () => FIXED_NOW,
    repositoryFactory: () => repository(),
    authServiceFactory: () => service,
  });
  const env = { GOENCHO_DB: db, ...secrets };
  const cookiePair = (value) => value.split(';', 1)[0];
  try {
    assert.deepEqual(await (await app.fetch(request('/api/owner/state'), env)).json(), { state: 'setup_required' });
    await service.createBootstrapTicket({ token: 'offline-bootstrap-ticket' });
    const activated = await app.fetch(request('/api/owner/bootstrap/activate', {
      method: 'POST', body: { ticket: 'offline-bootstrap-ticket', pin: '482105' },
    }), env);
    assert.equal(activated.status, 201);
    const ownerCookies = activated.headers.getSetCookie().map(cookiePair).join('; ');
    assert.deepEqual(await (await app.fetch(request('/api/owner/state', { cookie: ownerCookies }), env)).json(), { state: 'active' });

    const enrollment = await app.fetch(request('/api/owner/teacher-enrollments', {
      method: 'POST', body: { displayName: '架空 統合先生' }, cookie: ownerCookies,
    }), env);
    const enrollmentBody = await enrollment.json();
    assert.equal(enrollment.status, 201);
    const claim = await app.fetch(request('/api/teacher/enrollment/claim', {
      method: 'POST', body: { ticket: enrollmentBody.ticket },
    }), env);
    const claimBody = await claim.json();
    const setPin = await app.fetch(request('/api/teacher/enrollment/set-pin', {
      method: 'POST', body: { claimToken: claimBody.claimToken, pin: '731904' },
    }), env);
    const setPinBody = await setPin.json();
    const teacherDeviceCookie = cookiePair(setPin.headers.getSetCookie()[0]);
    assert.equal((await app.fetch(request('/api/teacher/enrollment/status', {
      cookie: teacherDeviceCookie,
    }), env)).status, 202);

    const pending = await app.fetch(request('/api/owner/teacher-devices?status=pending', {
      cookie: ownerCookies,
    }), env);
    const pendingBody = await pending.json();
    assert.equal(pendingBody.devices.length, 1);
    const authorizationId = pendingBody.devices[0].device_authorization_id;
    const approved = await app.fetch(request(`/api/owner/teacher-devices/${authorizationId}/approve`, {
      method: 'POST', body: { confirmationCode: setPinBody.confirmationCode }, cookie: ownerCookies,
    }), env);
    assert.deepEqual(await approved.json(), { status: 'approved' });
    assert.deepEqual(await (await app.fetch(request('/api/teacher/state', {
      cookie: teacherDeviceCookie,
    }), env)).json(), {
      state: 'unlock_required', displayName: '架空 統合先生', reason: 'session_required',
    });
    const unlocked = await app.fetch(request('/api/teacher/session/unlock', {
      method: 'POST', body: { pin: '731904' }, cookie: teacherDeviceCookie,
    }), env);
    assert.equal(unlocked.status, 200);
    const teacherCookies = unlocked.headers.getSetCookie().map(cookiePair).join('; ');
    assert.deepEqual(await (await app.fetch(request('/api/teacher/state', {
      cookie: teacherCookies,
    }), env)).json(), { state: 'active', displayName: '架空 統合先生' });
  } finally {
    db.close();
  }
});

test('F04 owner先生管理はsession actor、status allowlist、3終端actionを保持する', async () => {
  const calls = [];
  const service = auth({
    resolveOwnerActor: async (token) => { calls.push(['actor', token]); return { kind: 'owner', operatorId: 'owner-a' }; },
    createInitialTeacherEnrollment: async (input) => { calls.push(['enroll', input.actor.kind]); return { teacherId: 'teacher-a', token: 'ticket-a', purpose: 'initial' }; },
    listTeacherDevices: async (input) => { calls.push(['list', input.status]); return input.status === 'pending' ? [{ confirmation_code: '1234' }] : [{}]; },
    approveTeacherDevice: async () => ({ status: 'approved' }),
    rejectTeacherDevice: async () => ({ status: 'revoked' }),
    revokeTeacherDevice: async () => ({ status: 'revoked' }),
  });
  const { app, env } = application({ authValue: service });
  const cookie = 'goencho_owner_session=owner-session';
  assert.equal((await app.fetch(request('/api/owner/teacher-enrollments', {
    method: 'POST', body: { displayName: '架空先生' }, cookie,
  }), env)).status, 201);
  for (const status of ['pending', 'approved', 'revoked']) {
    assert.equal((await app.fetch(request(`/api/owner/teacher-devices?status=${status}`, { cookie }), env)).status, 200);
  }
  for (const action of ['approve', 'reject', 'revoke']) {
    assert.equal((await app.fetch(request(`/api/owner/teacher-devices/device-a/${action}`, {
      method: 'POST', body: action === 'approve' ? { confirmationCode: '1234' } : {}, cookie,
    }), env)).status, 200);
  }
  assert.equal(calls.filter(([kind]) => kind === 'actor').length, 7);
});

test('F05 teacher state・claim・set-pin・statusは公開allowlistと202を守る', async () => {
  for (const state of ['enrollment_required', 'pending', 'unlock_required', 'active', 'teacher_unavailable']) {
    const { app, env } = application({ authValue: auth({ teacherState: async () => ({ state }) }) });
    assert.deepEqual(await (await app.fetch(request('/api/teacher/state'), env)).json(), { state });
  }
  const { app, env } = application();
  const claimed = await app.fetch(request('/api/teacher/enrollment/claim', {
    method: 'POST', body: { ticket: 'ticket-a' },
  }), env);
  assert.deepEqual(await claimed.json(), { claimToken: 'claim-a', purpose: 'initial', displayName: '架空先生' });
  const setPin = await app.fetch(request('/api/teacher/enrollment/set-pin', {
    method: 'POST', body: { claimToken: 'claim-a', pin: '123456' },
  }), env);
  assert.equal(setPin.status, 202);
  assert.deepEqual(await setPin.json(), { status: 'pending', confirmationCode: '1234' });
  assert.match(setPin.headers.getSetCookie()[0], /goencho_teacher_device=/);
  const pending = application({ authValue: auth({ teacherState: async () => ({ state: 'pending' }) }) });
  assert.equal((await pending.app.fetch(request('/api/teacher/enrollment/status'), pending.env)).status, 202);
});

test('F06 teacher unlock/logoutと3方向readは同じserver actorだけを使用する', async () => {
  let actors = 0;
  const repo = repository({ resolveTeacherActor: async () => { actors += 1; return { kind: 'teacher', teacherId: 'teacher-a' }; } });
  const { app, env } = application({ repositoryValue: repo });
  const cookie = 'goencho_teacher_device=device; goencho_teacher_session=session';
  for (const path of [
    '/api/teacher/matches/today', '/api/teacher/matches/dates',
    '/api/teacher/matches/by-date?date=2026-09-18',
    '/api/teacher/participants/participant-a/matches',
  ]) assert.equal((await app.fetch(request(path, { cookie }), env)).status, 200);
  assert.equal(actors, 4);
  const unlocked = await app.fetch(request('/api/teacher/session/unlock', {
    method: 'POST', body: { pin: '123456' }, cookie: 'goencho_teacher_device=device',
  }), env);
  assert.equal(unlocked.headers.getSetCookie().length, 2);
  const logout = await app.fetch(request('/api/teacher/session/logout', { method: 'POST', body: {}, cookie }), env);
  assert.match(logout.headers.getSetCookie()[0], /Max-Age=0/);
});

test('F07 POST security・query・teacher ID・ownerPin・size・JSONを早期拒否する', async () => {
  const { app, env } = application();
  const cases = [
    request('/api/teacher/session/logout', { method: 'POST', body: {}, headers: { origin: 'https://wrong.invalid' } }),
    request('/api/teacher/session/logout', { method: 'POST', body: '{}', headers: { 'content-type': 'text/plain' } }),
    request('/api/teacher/session/logout', { method: 'POST', body: '{' }),
    request('/api/teacher/session/logout', { method: 'POST', body: 'x'.repeat(16_385) }),
    request('/api/teacher/matches/today?extra=1'),
    request('/api/teacher/matches/today?teacherId=teacher-b'),
    request('/api/owner/teacher-enrollments', { method: 'POST', body: { ownerPin: '123456' } }),
  ];
  const expected = [403, 415, 400, 413, 400, 400, 400];
  for (let index = 0; index < cases.length; index += 1) {
    assert.equal((await app.fetch(cases[index], env)).status, expected[index]);
  }
});

test('F08 4 Cookie名は独立headerで反対roleのstateへ渡らない', async () => {
  const seen = [];
  const service = auth({
    ownerState: async (input) => { seen.push(['owner', input]); return { state: 'active' }; },
    teacherState: async (input) => { seen.push(['teacher', input]); return { state: 'active' }; },
  });
  const { app, env } = application({ authValue: service });
  await app.fetch(request('/api/owner/state', {
    cookie: 'goencho_teacher_device=td; goencho_teacher_session=ts',
  }), env);
  await app.fetch(request('/api/teacher/state', {
    cookie: 'goencho_owner_device=od; goencho_owner_session=os',
  }), env);
  assert.deepEqual(seen, [
    ['owner', { deviceToken: undefined, sessionToken: undefined }],
    ['teacher', { deviceToken: undefined, sessionToken: undefined }],
  ]);
  for (const name of ['goencho_owner_device', 'goencho_owner_session', 'goencho_teacher_device', 'goencho_teacher_session']) {
    assert.match(runtimeConfigSource, new RegExp(name));
  }
});

test('F09 HTTP入力拒否ではtransaction/auth factoryを開始せず既存19 atomic fixtureを維持する', async () => {
  let authFactoryCalls = 0;
  const app = createWorkerApplication({
    assertBindings: () => true,
    repositoryFactory: () => repository(),
    authServiceFactory: () => { authFactoryCalls += 1; return auth(); },
  });
  assert.equal((await app.fetch(request('/api/owner/teacher-enrollments?extra=1', {
    method: 'POST', body: {},
  }), {})).status, 400);
  assert.equal(authFactoryCalls, 0);
  const atomicTests = readFileSync(new URL('./05-d1-auth-transactions.test.mjs', import.meta.url), 'utf8');
  assert.equal((atomicTests.match(/test\('b2-auth-/g) ?? []).length, 19);
  assert.match(atomicTests, /20並列/);
  assert.match(atomicTests, /failure injection/);
});

test('F10 namespace・回帰source・migration hashを固定しnetwork/consoleを増やさない', () => {
  for (const text of [source, ownerUi, teacherUi, serverSource]) assert.doesNotMatch(text, /console\./);
  assert.doesNotMatch(source, /https?:\/\/(?!goencho-b2\.invalid)/);
  assert.doesNotMatch(ownerUi, /['"`]\/api\/(?:session|bootstrap|recovery|teacher-enrollments|teacher-devices)/);
  assert.doesNotMatch(teacherUi, /['"`]\/api\/(?:session|enrollment|matches|participants)/);
  const hashes = [
    ['../migrations/0001_goencho.sql', '0EAADB9E1A72D1947414F50A45073D0B00FD8E33DE8267E15288D10A2F6194ED'],
    ['../migrations/0002_auth_write_guards.sql', '1391CCC7B0599C7B22191DD4BD8F801BA3218218E3D989D0199D164DE48D676C'],
  ];
  for (const [path, expected] of hashes) {
    const actual = createHash('sha256').update(readFileSync(new URL(path, import.meta.url))).digest('hex').toUpperCase();
    assert.equal(actual, expected);
  }
});
