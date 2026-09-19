import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { GoenchoD1Adapter } from '../src/d1-repository.mjs';
import { createWorkerApplication } from '../src/worker.mjs';
import { hmacHex } from '../src/web-crypto.mjs';
import { GoenchoPostgresAdapter } from '../../portability/postgres-adapter.mjs';
import { GoenchoService } from '../../portability/goencho-service.mjs';
import {
  buildManifest,
  compareManifests,
  createCsvBundle,
  createSqliteSnapshotSql,
  importCsvBundleToPostgres,
  postgresForeignKeyViolations,
  readPostgresTables,
  readSqliteTables,
  restoreSqliteSnapshot,
  sqliteForeignKeyViolations,
} from '../../portability/migration-rehearsal.mjs';
import { GOENCHO_DB_CONTRACT_METHODS } from '../../portability/db-contract.mjs';
import { fakeSecrets, FIXED_NOW } from './helpers.mjs';
import { NodeD1Database } from './node-d1.mjs';

const DEVICE_TOKEN = 'fake-portability-device-token';
const SESSION_TOKEN = 'fake-portability-session-token';
const AUTHORIZATION_ID = 'fake_teacher_device_portability';
const SESSION_ID = 'fake_teacher_session_portability';

async function insertCompleteFakeData(db, secrets) {
  const [deviceHash, sessionHash] = await Promise.all([
    hmacHex(secrets.GOENCHO_DEVICE_TOKEN_HMAC_KEY_V1, DEVICE_TOKEN),
    hmacHex(secrets.GOENCHO_SESSION_HMAC_KEY_V1, SESSION_TOKEN),
  ]);
  const statements = [
    [`INSERT INTO goencho_operators VALUES (?, 'owner', 'active', ?, ?)`, ['fake_owner_portability', FIXED_NOW, FIXED_NOW]],
    [`INSERT INTO goencho_operator_credentials
      (credential_id, operator_id, salt, pin_hash, algorithm, status, created_at, work_factor, parameters_json, pepper_key_version)
      VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)`, [
      'fake_owner_credential_portability', 'fake_owner_portability', 'fake-salt', 'fake-hash',
      'fake-test-only', FIXED_NOW, 600000, '{"fake":true}', 'v1',
    ]],
    [`INSERT INTO goencho_operator_devices
      (device_authorization_id, operator_id, token_hash, status, created_at, approved_at, last_seen_at)
      VALUES (?, ?, ?, 'approved', ?, ?, ?)`, [
      'fake_owner_device_portability', 'fake_owner_portability', 'fake-owner-device-hash',
      FIXED_NOW, FIXED_NOW, FIXED_NOW,
    ]],
    [`INSERT INTO goencho_operator_sessions
      (session_id, device_authorization_id, session_hash, status, created_at, last_seen_at)
      VALUES (?, ?, ?, 'active', ?, ?)`, [
      'fake_owner_session_portability', 'fake_owner_device_portability', 'fake-owner-session-hash',
      FIXED_NOW, FIXED_NOW,
    ]],
    [`INSERT INTO goencho_bootstrap_tickets
      (ticket_id, token_hash, status, created_at, expires_at, consumed_at, last_mutation_id)
      VALUES (?, ?, 'consumed', ?, ?, ?, ?)`, [
      'fake_bootstrap_portability', 'fake-bootstrap-hash', FIXED_NOW - 1000, FIXED_NOW + 1000,
      FIXED_NOW, 'fake_mutation_bootstrap',
    ]],
    [`INSERT INTO goencho_operator_recovery_codes
      (recovery_code_id, operator_id, batch_id, code_hash, status, created_at, consumed_at, last_mutation_id)
      VALUES (?, ?, ?, ?, 'consumed', ?, ?, ?)`, [
      'fake_recovery_portability', 'fake_owner_portability', 'fake_recovery_batch', 'fake-recovery-hash',
      FIXED_NOW, FIXED_NOW, 'fake_mutation_recovery',
    ]],
    [`INSERT INTO goencho_teacher_credentials
      (credential_id, teacher_id, salt, pin_hash, algorithm, status, created_at, work_factor, parameters_json, pepper_key_version)
      VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)`, [
      'fake_teacher_credential_portability', 'fake_teacher_a', 'fake-teacher-salt', 'fake-teacher-hash',
      'fake-test-only', FIXED_NOW, 600000, '{"fake":true}', 'v1',
    ]],
    [`INSERT INTO goencho_teacher_enrollment_tickets
      (ticket_id, teacher_id, token_hash, claim_hash, purpose, status, created_at, expires_at,
       claimed_at, consumed_at, last_mutation_id)
      VALUES (?, ?, ?, ?, 'initial', 'consumed', ?, ?, ?, ?, ?)`, [
      'fake_enrollment_portability', 'fake_teacher_a', 'fake-enrollment-hash', 'fake-claim-hash',
      FIXED_NOW - 2000, FIXED_NOW + 2000, FIXED_NOW - 1000, FIXED_NOW, 'fake_mutation_enrollment',
    ]],
    [`INSERT INTO goencho_teacher_device_authorizations
      (device_authorization_id, teacher_id, token_hash, status, confirmation_code, created_at,
       approved_at, last_seen_at, approved_by_operator_id, last_mutation_id)
      VALUES (?, ?, ?, 'approved', '4821', ?, ?, ?, ?, ?)`, [
      AUTHORIZATION_ID, 'fake_teacher_a', deviceHash, FIXED_NOW, FIXED_NOW, FIXED_NOW,
      'fake_owner_portability', 'fake_mutation_device',
    ]],
    [`INSERT INTO goencho_teacher_sessions
      (session_id, device_authorization_id, session_hash, status, created_at, last_seen_at)
      VALUES (?, ?, ?, 'active', ?, ?)`, [SESSION_ID, AUTHORIZATION_ID, sessionHash, FIXED_NOW, FIXED_NOW]],
    [`INSERT INTO goencho_auth_attempts VALUES (?, 1, NULL, ?)`, ['teacher:fake_teacher_b', FIXED_NOW]],
    [`INSERT INTO goencho_verified_person_links
      (link_id, teacher_id, participant_id, league_member_id, verified_by_operator_id, verified_at)
      VALUES (?, ?, ?, ?, ?, ?)`, [
      'fake_link_portability', 'fake_teacher_member', 'fake_participant_member',
      'fake_league_member_portability', 'fake_owner_portability', FIXED_NOW,
    ]],
    [`INSERT INTO goencho_audit_events
      (audit_id, actor_kind, actor_id, action, target_kind, target_id, result_code, request_id, created_at)
      VALUES (?, 'owner', ?, 'fake.portability', 'teacher', ?, 'ok', ?, ?)`, [
      'fake_audit_portability', 'fake_owner_portability', 'fake_teacher_a', 'fake_request_portability', FIXED_NOW,
    ]],
  ];
  for (const [sql, bindings] of statements) db.sqlite.prepare(sql).run(...bindings);
}

async function createHarness() {
  const secrets = fakeSecrets();
  const d1 = new NodeD1Database();
  await insertCompleteFakeData(d1, secrets);

  const snapshotSql = createSqliteSnapshotSql(d1.sqlite);
  const restoredSqlite = restoreSqliteSnapshot(snapshotSql);
  const csvBundle = createCsvBundle(restoredSqlite);

  const postgres = new PGlite();
  await postgres.waitReady;
  await postgres.exec(readFileSync(new URL('../../portability/postgres-schema.sql', import.meta.url), 'utf8'));
  await importCsvBundleToPostgres(postgres, csvBundle);

  return {
    d1,
    postgres,
    restoredSqlite,
    snapshotSql,
    csvBundle,
    secrets,
    d1Service: new GoenchoService(new GoenchoD1Adapter(d1)),
    postgresService: new GoenchoService(new GoenchoPostgresAdapter(postgres)),
    close: async () => {
      restoredSqlite.close();
      d1.close();
      await postgres.close();
    },
  };
}

function request(path, cookie) {
  return new Request(`https://goencho-b2.invalid${path}`, {
    headers: cookie ? { cookie } : {},
  });
}

function teacherCookie() {
  return `goencho_teacher_device=${encodeURIComponent(DEVICE_TOKEN)}; goencho_teacher_session=${encodeURIComponent(SESSION_TOKEN)}`;
}

async function responseRecord(application, env, path) {
  const response = await application.fetch(request(path, teacherCookie()), env);
  return { status: response.status, body: await response.json() };
}

test('b2-portability-01 共通contractと業務serviceにD1固有APIを置かない', () => {
  assert.deepEqual(GOENCHO_DB_CONTRACT_METHODS, [
    'schemaVersion',
    'findTeacherAuthContext',
    'lockTeacherSession',
    'touchTeacherAuth',
    'selectMatchesByDate',
    'selectMatchDates',
    'selectParticipantMatches',
    'insertMatch',
  ]);
  const serviceSource = readFileSync(new URL('../../portability/goencho-service.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(serviceSource, /\.prepare\(|\.bind\(|\.batch\(|meta\.changes|GOENCHO_DB/u);
  const d1Source = readFileSync(new URL('../src/d1-repository.mjs', import.meta.url), 'utf8');
  assert.match(d1Source, /\.prepare\(/u);
  assert.match(d1Source, /\.batch\(/u);
  assert.match(d1Source, /meta\?\.changes/u);
});

test('b2-portability-02 D1 snapshotをSQLiteで確認し明示列CSV経由で全17 tableを移す', async () => {
  const harness = await createHarness();
  try {
    assert.match(harness.snapshotSql, /CREATE TABLE goencho_match_records/u);
    assert.equal(Object.keys(harness.csvBundle).length, 17);
    assert.equal(harness.csvBundle.goencho_match_records.split('\n')[0],
      'match_id,teacher_id,participant_id,played_on,played_at,result_code,handicap_text,source_reference,created_at');
    const d1Manifest = buildManifest(readSqliteTables(harness.d1.sqlite));
    const restoredManifest = buildManifest(readSqliteTables(harness.restoredSqlite));
    const postgresManifest = buildManifest(await readPostgresTables(harness.postgres));
    assert.deepEqual(compareManifests(d1Manifest, restoredManifest), []);
    assert.deepEqual(compareManifests(d1Manifest, postgresManifest), []);
    assert.equal(d1Manifest.tables.goencho_match_records.rowCount, 23);
    assert.equal(d1Manifest.tables.goencho_teacher_sessions.rowCount, 1);
    assert.deepEqual(sqliteForeignKeyViolations(harness.restoredSqlite), []);
    assert.deepEqual(await postgresForeignKeyViolations(harness.postgres), []);
  } finally {
    await harness.close();
  }
});

test('b2-portability-03 teacher・participant・matchの全ID文字列を一字も変えない', async () => {
  const harness = await createHarness();
  try {
    const d1Manifest = buildManifest(readSqliteTables(harness.d1.sqlite));
    const postgresManifest = buildManifest(await readPostgresTables(harness.postgres));
    assert.deepEqual(postgresManifest.domainIds, d1Manifest.domainIds);
    assert.equal(postgresManifest.domainIds.teacher_id.includes('fake_teacher_a'), true);
    assert.equal(postgresManifest.domainIds.participant_id.includes('fake_participant_same_1'), true);
    assert.equal(postgresManifest.domainIds.match_id.includes('fake_match_today_16'), true);
  } finally {
    await harness.close();
  }
});

test('b2-portability-04 同じ公開API requestはD1とPostgresでstatus・JSON・sort順が完全一致する', async () => {
  const harness = await createHarness();
  try {
    const d1Application = createWorkerApplication({ now: () => FIXED_NOW + 1000 });
    const postgresApplication = createWorkerApplication({
      now: () => FIXED_NOW + 1000,
      assertBindings: () => true,
      repositoryFactory: () => harness.postgresService,
    });
    const d1Env = { GOENCHO_DB: harness.d1, ...harness.secrets };
    const postgresEnv = { ...harness.secrets };
    for (const path of [
      '/api/health',
      '/api/teacher/matches/today',
      '/api/teacher/matches/dates',
      '/api/teacher/matches/by-date?date=2026-09-18',
      '/api/teacher/participants/fake_participant_same_1/matches',
    ]) {
      assert.deepEqual(
        await responseRecord(postgresApplication, postgresEnv, path),
        await responseRecord(d1Application, d1Env, path),
        path,
      );
    }
  } finally {
    await harness.close();
  }
});

test('b2-portability-05 認証とteacher境界の業務結果は両adapterで一致する', async () => {
  const harness = await createHarness();
  try {
    const input = {
      deviceToken: DEVICE_TOKEN,
      sessionToken: SESSION_TOKEN,
      deviceHmacKey: harness.secrets.GOENCHO_DEVICE_TOKEN_HMAC_KEY_V1,
      sessionHmacKey: harness.secrets.GOENCHO_SESSION_HMAC_KEY_V1,
      now: FIXED_NOW + 1000,
      inactivityMs: 30 * 60 * 1000,
    };
    assert.deepEqual(
      await harness.postgresService.resolveTeacherActor(input),
      await harness.d1Service.resolveTeacherActor(input),
    );
    const actorA = { kind: 'teacher', teacherId: 'fake_teacher_a' };
    const actorB = { kind: 'teacher', teacherId: 'fake_teacher_b' };
    assert.deepEqual(
      await harness.postgresService.participantMatches(actorA, 'fake_participant_shared'),
      await harness.d1Service.participantMatches(actorA, 'fake_participant_shared'),
    );
    assert.deepEqual(
      await harness.postgresService.participantMatches(actorB, 'fake_participant_shared'),
      await harness.d1Service.participantMatches(actorB, 'fake_participant_shared'),
    );
    assert.notDeepEqual(
      await harness.d1Service.participantMatches(actorA, 'fake_participant_shared'),
      await harness.d1Service.participantMatches(actorB, 'fake_participant_shared'),
    );
    const todayD1 = await harness.d1Service.todayMatches(actorA, '2026-09-18');
    const todayPostgres = await harness.postgresService.todayMatches(actorA, '2026-09-18');
    const pastD1 = await harness.d1Service.matchesByDate(actorA, '2026-09-18');
    const personalD1 = await harness.d1Service.participantMatches(actorA, 'fake_participant_same_1');
    const personalPostgres = await harness.postgresService.participantMatches(actorA, 'fake_participant_same_1');
    assert.equal(todayD1.length, 16);
    assert.deepEqual(todayPostgres, todayD1);
    assert.deepEqual(todayD1.map((match) => match.matchId), pastD1.map((match) => match.matchId));
    assert.equal(personalD1.filter((match) => match.playedOn === '2026-09-17').length, 2);
    assert.deepEqual(personalPostgres, personalD1);
    assert.equal(personalD1.some((match) => match.matchId === 'fake_match_today_01'), true);
    assert.equal(personalD1.some((match) => match.matchId === 'fake_match_today_16'), true);
    const sameNameOne = await harness.postgresService.participantMatches(actorA, 'fake_participant_same_1');
    const sameNameTwo = await harness.postgresService.participantMatches(actorA, 'fake_participant_same_2');
    assert.equal(sameNameOne.some((match) => match.matchId === 'fake_match_same_name'), false);
    assert.equal(sameNameTwo.some((match) => match.matchId === 'fake_match_same_name'), true);
  } finally {
    await harness.close();
  }
});

test('b2-portability-08 SQLite TEXT・INTEGERの意味をPostgres取込後も維持する', async () => {
  const harness = await createHarness();
  try {
    const sourceMatch = harness.d1.sqlite.prepare(`SELECT played_on, played_at, handicap_text, created_at
      FROM goencho_match_records WHERE match_id = ?`).get('fake_match_today_03');
    const targetMatch = (await harness.postgres.query(`SELECT played_on, played_at, handicap_text, created_at
      FROM goencho_match_records WHERE match_id = $1`, ['fake_match_today_03'])).rows[0];
    assert.deepEqual({
      played_on: targetMatch.played_on,
      played_at: targetMatch.played_at,
      handicap_text: targetMatch.handicap_text,
      created_at: String(targetMatch.created_at),
    }, {
      played_on: sourceMatch.played_on,
      played_at: sourceMatch.played_at,
      handicap_text: sourceMatch.handicap_text,
      created_at: String(sourceMatch.created_at),
    });
    const sourceCredential = harness.d1.sqlite.prepare(`SELECT parameters_json, work_factor
      FROM goencho_teacher_credentials WHERE credential_id = ?`).get('fake_teacher_credential_portability');
    const targetCredential = (await harness.postgres.query(`SELECT parameters_json, work_factor
      FROM goencho_teacher_credentials WHERE credential_id = $1`, ['fake_teacher_credential_portability'])).rows[0];
    assert.equal(targetCredential.parameters_json, sourceCredential.parameters_json);
    assert.equal(String(targetCredential.work_factor), String(sourceCredential.work_factor));
  } finally {
    await harness.close();
  }
});

test('b2-portability-06 match_idとsource_reference重複を両DBが拒否する', async () => {
  const harness = await createHarness();
  try {
    const base = {
      matchId: 'fake_portability_new_match',
      teacherId: 'fake_teacher_a',
      participantId: 'fake_participant_same_1',
      playedOn: '2026-09-18',
      playedAt: '16:30',
      resultCode: 'pending',
      handicapText: '5子局',
      sourceReference: 'fake:portability:new-match:v1',
      createdAt: FIXED_NOW,
    };
    for (const service of [harness.d1Service, harness.postgresService]) {
      assert.equal((await service.insertMatch(base)).affectedRows, 1);
      await assert.rejects(service.insertMatch({ ...base, sourceReference: 'fake:portability:other:v1' }));
      await assert.rejects(service.insertMatch({
        ...base,
        matchId: 'fake_portability_new_match_2',
        sourceReference: base.sourceReference,
      }));
    }
  } finally {
    await harness.close();
  }
});

test('b2-portability-07 同時二重書込みせず最終snapshotで差分検出後に一致へ戻せる', async () => {
  const harness = await createHarness();
  try {
    const record = {
      matchId: 'fake_final_snapshot_match',
      teacherId: 'fake_teacher_a',
      participantId: 'fake_participant_same_1',
      playedOn: '2026-09-18',
      playedAt: '16:45',
      resultCode: 'participant_win',
      handicapText: '4子局',
      sourceReference: 'fake:final-snapshot:v1',
      createdAt: FIXED_NOW + 5000,
    };
    await harness.d1Service.insertMatch(record);
    const sourceAfterWrite = buildManifest(readSqliteTables(harness.d1.sqlite));
    const targetBeforeFinalSnapshot = buildManifest(await readPostgresTables(harness.postgres));
    assert.equal(compareManifests(sourceAfterWrite, targetBeforeFinalSnapshot).includes(
      'goencho_match_records.rowCount',
    ), true);

    const finalSnapshot = restoreSqliteSnapshot(createSqliteSnapshotSql(harness.d1.sqlite));
    try {
      await importCsvBundleToPostgres(harness.postgres, createCsvBundle(finalSnapshot));
    } finally {
      finalSnapshot.close();
    }
    const targetAfterFinalSnapshot = buildManifest(await readPostgresTables(harness.postgres));
    assert.deepEqual(compareManifests(sourceAfterWrite, targetAfterFinalSnapshot), []);
    assert.equal(targetAfterFinalSnapshot.domainIds.match_id.includes(record.matchId), true);
  } finally {
    await harness.close();
  }
});
