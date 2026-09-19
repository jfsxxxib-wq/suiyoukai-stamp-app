import assert from 'node:assert/strict';
import test from 'node:test';
import { GoenchoD1Repository } from '../src/d1-repository.mjs';
import { createCloudflareHarness, FIXED_NOW } from './helpers.mjs';

test('b2-d1-01 専用migrationはschema version 3で受付系tableを持たない', async () => {
  const harness = await createCloudflareHarness();
  try {
    const repository = new GoenchoD1Repository(harness.db);
    assert.equal(await repository.schemaVersion(), 3);
    const tables = harness.db.sqlite.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    ).all().map((row) => row.name);
    assert.equal(tables.some((name) => /receptions/i.test(name)), false);
    assert.equal(tables.every((name) => name === 'schema_meta' || name.startsWith('goencho_')), true);
  } finally {
    harness.close();
  }
});

test('b2-d1-02 server確定teacher actorだけで今日・過去・個人が同じmatchを参照する', async () => {
  const harness = await createCloudflareHarness();
  try {
    const repository = new GoenchoD1Repository(harness.db);
    const actor = { kind: 'teacher', teacherId: 'fake_teacher_a' };
    const today = await repository.todayMatches(actor, '2026-09-18');
    const past = await repository.matchesByDate(actor, '2026-09-18');
    const personal = await repository.participantMatches(actor, 'fake_participant_same_1');
    assert.equal(today.length, 16);
    assert.deepEqual(today.map((match) => match.matchId), past.map((match) => match.matchId));
    assert.equal(personal.some((match) => match.matchId === 'fake_match_today_01'), true);
    assert.equal(personal.some((match) => match.matchId === 'fake_match_today_16'), true);
  } finally {
    harness.close();
  }
});

test('b2-d1-03 同日2局・同姓同名・複数先生をIDで分離する', async () => {
  const harness = await createCloudflareHarness();
  try {
    const repository = new GoenchoD1Repository(harness.db);
    const actorA = { kind: 'teacher', teacherId: 'fake_teacher_a' };
    const actorB = { kind: 'teacher', teacherId: 'fake_teacher_b' };
    const participantOne = await repository.participantMatches(actorA, 'fake_participant_same_1');
    const participantTwo = await repository.participantMatches(actorA, 'fake_participant_same_2');
    const sharedA = await repository.participantMatches(actorA, 'fake_participant_shared');
    const sharedB = await repository.participantMatches(actorB, 'fake_participant_shared');
    assert.equal(participantOne.filter((match) => match.playedOn === '2026-09-17').length, 2);
    assert.equal(participantTwo.some((match) => match.matchId === 'fake_match_same_name'), true);
    assert.deepEqual(sharedA.map((match) => match.matchId), ['fake_match_today_03', 'fake_match_shared_a']);
    assert.deepEqual(sharedB.map((match) => match.matchId), ['fake_match_shared_b']);
  } finally {
    harness.close();
  }
});

test('b2-d1-04 match_idとsource_referenceの重複を拒否する', async () => {
  const harness = await createCloudflareHarness();
  try {
    const repository = new GoenchoD1Repository(harness.db);
    const base = {
      matchId: 'b2_new_match',
      teacherId: 'fake_teacher_a',
      participantId: 'fake_participant_same_1',
      playedOn: '2026-09-18',
      playedAt: '16:20',
      resultCode: 'pending',
      handicapText: '5子局',
      sourceReference: 'fake:b2:new-match:v1',
      createdAt: FIXED_NOW,
    };
    await repository.insertMatch(base);
    await assert.rejects(repository.insertMatch({ ...base, sourceReference: 'fake:b2:other:v1' }), /UNIQUE/);
    await assert.rejects(repository.insertMatch({
      ...base,
      matchId: 'b2_new_match_2',
      sourceReference: base.sourceReference,
    }), /UNIQUE/);
  } finally {
    harness.close();
  }
});

test('b2-d1-05 deviceとsessionのHMAC照合からteacher actorを確定する', async () => {
  const harness = await createCloudflareHarness();
  try {
    const repository = new GoenchoD1Repository(harness.db);
    const actor = await repository.resolveTeacherActor({
      deviceToken: harness.deviceToken,
      sessionToken: harness.sessionToken,
      deviceHmacKey: harness.env.GOENCHO_DEVICE_TOKEN_HMAC_KEY_V1,
      sessionHmacKey: harness.env.GOENCHO_SESSION_HMAC_KEY_V1,
      now: FIXED_NOW + 1000,
      inactivityMs: 30 * 60 * 1000,
    });
    assert.equal(actor.kind, 'teacher');
    assert.equal(actor.teacherId, 'fake_teacher_a');
    const stored = harness.db.sqlite.prepare(`SELECT d.token_hash, s.session_hash
      FROM goencho_teacher_device_authorizations d
      JOIN goencho_teacher_sessions s ON s.device_authorization_id = d.device_authorization_id
      WHERE d.device_authorization_id = ?`).get(harness.authorizationId);
    assert.notEqual(stored.token_hash, harness.deviceToken);
    assert.notEqual(stored.session_hash, harness.sessionToken);
  } finally {
    harness.close();
  }
});

test('b2-d1-06 無操作30分でsessionだけをlockし端末承認を維持する', async () => {
  const harness = await createCloudflareHarness({
    sessionLastSeenAt: FIXED_NOW - 30 * 60 * 1000,
  });
  try {
    const repository = new GoenchoD1Repository(harness.db);
    await assert.rejects(repository.resolveTeacherActor({
      deviceToken: harness.deviceToken,
      sessionToken: harness.sessionToken,
      deviceHmacKey: harness.env.GOENCHO_DEVICE_TOKEN_HMAC_KEY_V1,
      sessionHmacKey: harness.env.GOENCHO_SESSION_HMAC_KEY_V1,
      now: FIXED_NOW,
      inactivityMs: 30 * 60 * 1000,
    }), (error) => error.code === 'SESSION_LOCKED');
    const state = harness.db.sqlite.prepare(`SELECT s.status AS session_status, d.status AS device_status
      FROM goencho_teacher_sessions s JOIN goencho_teacher_device_authorizations d
      ON d.device_authorization_id = s.device_authorization_id
      WHERE s.session_id = ?`).get(harness.sessionId);
    assert.deepEqual({ ...state }, { session_status: 'locked', device_status: 'approved' });
  } finally {
    harness.close();
  }
});
