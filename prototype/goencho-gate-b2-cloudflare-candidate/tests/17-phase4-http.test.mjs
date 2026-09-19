import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../lib/config.mjs';
import { randomToken } from '../lib/crypto.mjs';
import { createGateB1Application } from '../server.mjs';

const config = Object.freeze({
  ...CONFIG,
  ownerPort: 4311,
  ownerAllowedHost: '127.0.0.1:4311',
  teacherPort: 4312,
  teacherAllowedHost: 'localhost:4312',
});
const origin = 'http://localhost:4312';
const lockConfig = Object.freeze({
  ...CONFIG,
  ownerPort: 4313,
  ownerAllowedHost: '127.0.0.1:4313',
  teacherPort: 4314,
  teacherAllowedHost: 'localhost:4314',
});
const lockOrigin = 'http://localhost:4314';

function cookieFrom(response, name) {
  return response.headers.getSetCookie().map((value) => value.split(';')[0])
    .find((value) => value.startsWith(`${name}=`));
}

function request(path, { cookie, requestOrigin = origin } = {}) {
  return fetch(`${requestOrigin}${path}`, {
    headers: { ...(cookie ? { Cookie: cookie } : {}), Connection: 'close' },
  });
}

function activateOwner(app) {
  const ticket = app.ownerAuth.createBootstrapTicket(randomToken());
  const owner = app.ownerAuth.activate({ ticket, pin: '640281' });
  return app.ownerAuth.resolveSession(owner.sessionToken);
}

function authenticateFixtureTeacher(app, actor, teacherId, pin = '510824') {
  const enrollment = app.ownerAuth.createEnrollmentTicket({ actor, teacherId, purpose: 'initial', token: randomToken() });
  const claim = app.teacherAuth.claimEnrollment({ ticket: enrollment.token });
  const device = app.teacherAuth.setPin({ claimToken: claim.claimToken, pin });
  app.ownerAuth.approveDevice({ actor, authorizationId: device.authorizationId, confirmationCode: device.confirmationCode });
  const session = app.teacherAuth.unlock({ deviceToken: device.deviceToken, pin });
  return `${config.teacherDeviceCookie}=${encodeURIComponent(device.deviceToken)}; ${config.teacherSessionCookie}=${encodeURIComponent(session.sessionToken)}`;
}

test('phase4-http-01 3方向が同じ公開match IDを返し内部列を返さない', async () => {
  const app = createGateB1Application({ dbPath: ':memory:', config, now: () => Date.parse('2026-09-18T08:00:00+09:00') });
  await app.start();
  try {
    const actor = activateOwner(app);
    const cookie = authenticateFixtureTeacher(app, actor, 'fake_teacher_a');
    const todayResponse = await request('/api/teacher/matches/today', { cookie });
    assert.equal(todayResponse.status, 200);
    const today = await todayResponse.json();
    assert.equal(today.date, '2026-09-18');
    assert.equal(today.matches.length, 16);
    const expected = today.matches[0];
    assert.equal(expected.matchId, 'fake_match_today_01');
    for (const forbidden of ['teacher_id', 'teacherId', 'source_reference', 'sourceReference', 'created_at']) {
      assert.equal(JSON.stringify(today).includes(forbidden), false);
    }

    const past = await (await request('/api/teacher/matches/by-date?date=2026-09-18', { cookie })).json();
    const person = await (await request(`/api/teacher/participants/${expected.participantId}/matches`, { cookie })).json();
    assert.ok(past.matches.some((item) => item.matchId === expected.matchId));
    assert.ok(person.matches.some((item) => item.matchId === expected.matchId));

    const dates = await (await request('/api/teacher/matches/dates', { cookie })).json();
    assert.deepEqual(dates.dates[0], { playedOn: '2026-09-18', matchCount: 16 });
  } finally {
    await app.close();
  }
});

test('phase4-http-02 入力検証とtoday上書きを拒否', async () => {
  const app = createGateB1Application({ dbPath: ':memory:', config, now: () => Date.parse('2026-09-18T08:00:00+09:00') });
  await app.start();
  try {
    const cookie = authenticateFixtureTeacher(app, activateOwner(app), 'fake_teacher_a');
    const cases = [
      ['/api/teacher/matches/today?date=2026-09-17', 'UNEXPECTED_QUERY'],
      ['/api/teacher/matches/dates?extra=1', 'UNEXPECTED_QUERY'],
      ['/api/teacher/matches/by-date', 'INVALID_QUERY'],
      ['/api/teacher/matches/by-date?date=2026-02-30', 'INVALID_MATCH_DATE'],
      ['/api/teacher/matches/by-date?date=2026-09-18&date=2026-09-17', 'INVALID_QUERY'],
      ['/api/teacher/participants/%2E%2E%2Fother/matches', 'INVALID_PARTICIPANT_ID'],
      ['/api/teacher/participants/fake_participant_same_1/matches?extra=1', 'UNEXPECTED_QUERY'],
    ];
    for (const [path, code] of cases) {
      const response = await request(path, { cookie });
      assert.equal(response.status, 400, path);
      assert.equal((await response.json()).error, code, path);
    }
  } finally {
    await app.close();
  }
});

test('phase4-http-03 先生間分離と認証必須', async () => {
  const app = createGateB1Application({ dbPath: ':memory:', config, now: () => Date.parse('2026-09-18T08:00:00+09:00') });
  await app.start();
  try {
    const actor = activateOwner(app);
    const cookieA = authenticateFixtureTeacher(app, actor, 'fake_teacher_a', '510824');
    const cookieB = authenticateFixtureTeacher(app, actor, 'fake_teacher_b', '510825');
    const noAuth = await request('/api/teacher/matches/today');
    assert.equal(noAuth.status, 401);

    const a = await (await request('/api/teacher/participants/fake_participant_shared/matches', { cookie: cookieA })).json();
    const b = await (await request('/api/teacher/participants/fake_participant_shared/matches', { cookie: cookieB })).json();
    assert.deepEqual(a.matches.map((item) => item.matchId), ['fake_match_today_03', 'fake_match_shared_a']);
    assert.deepEqual(b.matches.map((item) => item.matchId), ['fake_match_shared_b']);

    const absent = await (await request('/api/teacher/participants/fake_participant_same_1/matches', { cookie: cookieB })).json();
    assert.deepEqual(absent.matches, []);
  } finally {
    await app.close();
  }
});

test('phase4-http-04 認証切れ後は401で記録を返さない', async () => {
  let time = Date.parse('2026-09-18T08:00:00+09:00');
  const app = createGateB1Application({ dbPath: ':memory:', config: lockConfig, now: () => time });
  await app.start();
  try {
    const actor = activateOwner(app);
    const enrollment = app.ownerAuth.createEnrollmentTicket({ actor, teacherId: 'fake_teacher_a', purpose: 'initial', token: randomToken() });
    const claim = app.teacherAuth.claimEnrollment({ ticket: enrollment.token });
    const device = app.teacherAuth.setPin({ claimToken: claim.claimToken, pin: '510824' });
    app.ownerAuth.approveDevice({ actor, authorizationId: device.authorizationId, confirmationCode: device.confirmationCode });
    const session = app.teacherAuth.unlock({ deviceToken: device.deviceToken, pin: '510824' });
    const cookie = `${lockConfig.teacherDeviceCookie}=${encodeURIComponent(device.deviceToken)}; ${lockConfig.teacherSessionCookie}=${encodeURIComponent(session.sessionToken)}`;
    time += lockConfig.inactivityMs + 1;
    const response = await request('/api/teacher/matches/today', { cookie, requestOrigin: lockOrigin });
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: 'SESSION_LOCKED' });
  } finally {
    await app.close();
  }
});

test('phase4-http-05 読み取りAPIはmatch tableを変更しない', async () => {
  const app = createGateB1Application({ dbPath: ':memory:', config, now: () => Date.parse('2026-09-18T08:00:00+09:00') });
  await app.start();
  try {
    const cookie = authenticateFixtureTeacher(app, activateOwner(app), 'fake_teacher_a');
    const before = app.db.prepare('SELECT COUNT(*) AS count, SUM(created_at) AS checksum FROM goencho_match_records').get();
    await request('/api/teacher/matches/today', { cookie });
    await request('/api/teacher/matches/dates', { cookie });
    await request('/api/teacher/matches/by-date?date=2026-09-17', { cookie });
    await request('/api/teacher/participants/fake_participant_same_1/matches', { cookie });
    const after = app.db.prepare('SELECT COUNT(*) AS count, SUM(created_at) AS checksum FROM goencho_match_records').get();
    assert.deepEqual(after, before);
  } finally {
    await app.close();
  }
});
