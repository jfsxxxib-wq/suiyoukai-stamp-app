import assert from 'node:assert/strict';
import test from 'node:test';
import { secureCookie } from '../src/fetch-security.mjs';
import { createWorkerApplication } from '../src/worker.mjs';
import { createCloudflareHarness, FIXED_NOW } from './helpers.mjs';

const application = createWorkerApplication({ now: () => FIXED_NOW });

function request(path, { cookie, method = 'GET', headers = {}, body } = {}) {
  const values = new Headers(headers);
  if (cookie) values.set('cookie', cookie);
  return new Request(`https://goencho-b2.invalid${path}`, {
    method,
    headers: values,
    body,
  });
}

test('b2-worker-01 bindingまたはsecret欠落時は503で安全停止する', async () => {
  const response = await application.fetch(request('/api/health'), {});
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'SERVICE_UNAVAILABLE' });
});

test('b2-worker-02 local D1 schema一致時だけhealthを返す', async () => {
  const harness = await createCloudflareHarness();
  try {
    const response = await application.fetch(request('/api/health'), harness.env);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      service: 'goencho-b2-cloudflare-candidate',
      mode: 'isolated-local-preparation',
    });
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow, noarchive');
  } finally {
    harness.close();
  }
});

test('b2-worker-03 今日・過去・個人APIはcookieから確定した同じteacherだけを返す', async () => {
  const harness = await createCloudflareHarness();
  try {
    const todayResponse = await application.fetch(
      request('/api/teacher/matches/today', { cookie: harness.cookie }),
      harness.env,
    );
    const pastResponse = await application.fetch(
      request('/api/teacher/matches/by-date?date=2026-09-18', { cookie: harness.cookie }),
      harness.env,
    );
    const personResponse = await application.fetch(
      request('/api/teacher/participants/fake_participant_same_1/matches', { cookie: harness.cookie }),
      harness.env,
    );
    assert.equal(todayResponse.status, 200);
    assert.equal(pastResponse.status, 200);
    assert.equal(personResponse.status, 200);
    const today = await todayResponse.json();
    const past = await pastResponse.json();
    const person = await personResponse.json();
    assert.equal(today.matches.length, 16);
    assert.deepEqual(today.matches.map((match) => match.matchId), past.matches.map((match) => match.matchId));
    assert.equal(person.matches.some((match) => match.matchId === 'fake_match_today_01'), true);
    assert.equal(JSON.stringify(today).includes('teacher_id'), false);
    assert.equal(JSON.stringify(today).includes('source_reference'), false);
  } finally {
    harness.close();
  }
});

test('b2-worker-04 別teacherのcookieでは別の記録だけを返す', async () => {
  const harness = await createCloudflareHarness({ teacherId: 'fake_teacher_b' });
  try {
    const response = await application.fetch(
      request('/api/teacher/participants/fake_participant_shared/matches', { cookie: harness.cookie }),
      harness.env,
    );
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body.matches.map((match) => match.matchId), ['fake_match_shared_b']);
  } finally {
    harness.close();
  }
});

test('b2-worker-05 teacher ID持込みをquery・body・header・pathで400拒否する', async () => {
  const cases = [
    request('/api/teacher/matches/today?teacherId=fake_teacher_b'),
    request('/api/teacher/matches/today', { headers: { 'x-teacher-id': 'fake_teacher_b' } }),
    request('/api/teachers/fake_teacher_b/matches'),
    request('/api/teacher/matches/today', {
      method: 'POST',
      headers: {
        origin: 'https://goencho-b2.invalid',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ teacher_id: 'fake_teacher_b' }),
    }),
  ];
  for (const candidate of cases) {
    const response = await application.fetch(candidate, {});
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'TEACHER_ID_NOT_ACCEPTED' });
  }
});

test('b2-worker-06 sessionだけでは記録を取得できない', async () => {
  const harness = await createCloudflareHarness();
  try {
    const response = await application.fetch(request('/api/teacher/matches/today', {
      cookie: `goencho_teacher_session=${encodeURIComponent(harness.sessionToken)}`,
    }), harness.env);
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: 'TEACHER_AUTH_REQUIRED' });
  } finally {
    harness.close();
  }
});

test('b2-worker-07 Secure cookie候補はhost-only・HttpOnly・Secure・SameSite Strict', () => {
  const cookie = secureCookie('goencho_teacher_device', 'fake-runtime-token', { maxAge: 400 });
  assert.match(cookie, /Path=\//);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Strict/);
  assert.match(cookie, /Max-Age=400/);
  assert.doesNotMatch(cookie, /Domain=/);
});
