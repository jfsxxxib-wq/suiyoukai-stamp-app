import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { GoenchoD1AuthWriteAdapter } from '../src/d1-auth-write-adapter.mjs';
import { hmacHex } from '../src/web-crypto.mjs';
import { GOENCHO_AUTH_WRITE_CONTRACT_METHODS } from '../../portability/auth-write-contract.mjs';
import { invokeAuthWriteApi } from '../../portability/auth-write-api.mjs';
import { GoenchoAuthWriteService } from '../../portability/auth-write-service.mjs';
import { GoenchoPostgresAuthWriteAdapter } from '../../portability/postgres-auth-write-adapter.mjs';
import {
  buildManifest,
  compareManifests,
  postgresForeignKeyViolations,
  readPostgresTables,
  readSqliteTables,
  sqliteForeignKeyViolations,
} from '../../portability/migration-rehearsal.mjs';
import { fakeSecrets, FIXED_NOW } from './helpers.mjs';
import { NodeD1Database } from './node-d1.mjs';

class DeterministicPinCodec {
  constructor() {
    this.createCount = 0;
  }

  async create(pin, pepper) {
    this.createCount += 1;
    return {
      salt: `fake-salt-${this.createCount}`,
      hash: await hmacHex(pepper, `fake-pin:${pin}`),
      algorithm: 'fake-test-pin-v1',
      workFactor: 600_000,
      parametersJson: '{"testOnly":true}',
      pepperKeyVersion: 'v1',
    };
  }

  async verify(pin, record, pepperForVersion) {
    const expected = await hmacHex(pepperForVersion(record.pepper_key_version), `fake-pin:${pin}`);
    return expected === record.pin_hash;
  }
}

function deterministicFactories() {
  const idCounts = new Map();
  let tokenCount = 0;
  const hexCounts = new Map();
  return {
    idFactory(prefix) {
      const next = (idCounts.get(prefix) ?? 0) + 1;
      idCounts.set(prefix, next);
      return `fake_${prefix}_${next}`;
    },
    tokenFactory() {
      tokenCount += 1;
      return `fake_token_${tokenCount}`;
    },
    hexFactory(bytes) {
      const next = (hexCounts.get(bytes) ?? 0) + 1;
      hexCounts.set(bytes, next);
      return next.toString(16).padStart(bytes * 2, '0');
    },
  };
}

function adapterOptions(factories, pinCodec, mutationHook = null) {
  return {
    secrets: fakeSecrets(),
    now: () => FIXED_NOW,
    pinCodec,
    mutationHook,
    ...factories,
  };
}

async function pairHarness() {
  const d1 = new NodeD1Database({ seed: false });
  const postgres = new PGlite();
  await postgres.waitReady;
  await postgres.exec(readFileSync(new URL('../../portability/postgres-schema.sql', import.meta.url), 'utf8'));
  const d1Adapter = new GoenchoD1AuthWriteAdapter({
    db: d1,
    ...adapterOptions(deterministicFactories(), new DeterministicPinCodec()),
  });
  const postgresAdapter = new GoenchoPostgresAuthWriteAdapter({
    client: postgres,
    ...adapterOptions(deterministicFactories(), new DeterministicPinCodec()),
  });
  return {
    d1,
    postgres,
    d1Service: new GoenchoAuthWriteService(d1Adapter),
    postgresService: new GoenchoAuthWriteService(postgresAdapter),
    close: async () => {
      d1.close();
      await postgres.close();
    },
  };
}

async function operationPair(pair, method, input) {
  const results = await Promise.all([
    pair.d1Service[method](structuredClone(input)),
    pair.postgresService[method](structuredClone(input)),
  ]);
  assert.deepEqual(results[1], results[0]);
  return results[0];
}

async function apiPair(pair, operation, input) {
  const results = await Promise.all([
    invokeAuthWriteApi(pair.d1Service, operation, structuredClone(input)),
    invokeAuthWriteApi(pair.postgresService, operation, structuredClone(input)),
  ]);
  assert.deepEqual(results[1], results[0]);
  return results[0];
}

async function assertDatabaseParity(pair) {
  const sqliteTables = readSqliteTables(pair.d1.sqlite);
  const postgresTables = await readPostgresTables(pair.postgres);
  const sqliteManifest = buildManifest(sqliteTables);
  const postgresManifest = buildManifest(postgresTables);
  assert.deepEqual(compareManifests(sqliteManifest, postgresManifest), []);
  assert.deepEqual(sqliteForeignKeyViolations(pair.d1.sqlite), []);
  assert.deepEqual(await postgresForeignKeyViolations(pair.postgres), []);
  return sqliteManifest;
}

async function activate(pair, ticket = 'fake-bootstrap-ticket') {
  await operationPair(pair, 'createBootstrapTicket', { token: ticket });
  const owner = await operationPair(pair, 'activateOwner', { ticket, pin: '482105' });
  return { ...owner, actor: { kind: 'owner', operatorId: owner.operatorId } };
}

async function makePending(pair, owner, {
  displayName = '架空 青葉先生',
  token = 'fake-initial-enrollment',
  pin = '731904',
} = {}) {
  const enrollment = await operationPair(pair, 'createInitialTeacherEnrollment', {
    actor: owner.actor,
    displayName,
    token,
  });
  const claim = await operationPair(pair, 'claimEnrollment', { ticket: enrollment.token });
  const pending = await operationPair(pair, 'setTeacherPin', { claimToken: claim.claimToken, pin });
  return { ...enrollment, ...claim, ...pending, pin };
}

test('b2-auth-portability-01 共通contractは対象10操作だけをDB非依存で公開する', async () => {
  assert.deepEqual(GOENCHO_AUTH_WRITE_CONTRACT_METHODS, [
    'createBootstrapTicket',
    'activateOwner',
    'recoverOwner',
    'createInitialTeacherEnrollment',
    'createTeacherEnrollment',
    'claimEnrollment',
    'setTeacherPin',
    'approveTeacherDevice',
    'rejectTeacherDevice',
    'revokeTeacherDevice',
  ]);
  const common = [
    readFileSync(new URL('../../portability/auth-write-contract.mjs', import.meta.url), 'utf8'),
    readFileSync(new URL('../../portability/auth-write-service.mjs', import.meta.url), 'utf8'),
    readFileSync(new URL('../../portability/auth-write-api.mjs', import.meta.url), 'utf8'),
  ].join('\n');
  assert.doesNotMatch(common, /\.prepare\(|\.bind\(|\.batch\(|meta\.changes|SELECT\s|INSERT\s|UPDATE\s|DELETE\s/iu);
});

test('b2-auth-portability-02 owner登録から復旧まで全ID・全行hash・FKが一致する', async () => {
  const pair = await pairHarness();
  try {
    const owner = await activate(pair);
    const teacher = await makePending(pair, owner);
    await operationPair(pair, 'approveTeacherDevice', {
      actor: owner.actor,
      authorizationId: teacher.authorizationId,
      confirmationCode: teacher.confirmationCode,
    });

    const deviceTicket = await operationPair(pair, 'createTeacherEnrollment', {
      actor: owner.actor,
      teacherId: teacher.teacherId,
      purpose: 'new_device',
      token: 'fake-new-device-ticket',
    });
    const deviceClaim = await operationPair(pair, 'claimEnrollment', { ticket: deviceTicket.token });
    const secondDevice = await operationPair(pair, 'setTeacherPin', {
      claimToken: deviceClaim.claimToken,
      pin: teacher.pin,
    });
    await operationPair(pair, 'rejectTeacherDevice', {
      actor: owner.actor,
      authorizationId: secondDevice.authorizationId,
    });

    const resetTicket = await operationPair(pair, 'createTeacherEnrollment', {
      actor: owner.actor,
      teacherId: teacher.teacherId,
      purpose: 'pin_reset',
      token: 'fake-pin-reset-ticket',
    });
    const resetClaim = await operationPair(pair, 'claimEnrollment', { ticket: resetTicket.token });
    const resetDevice = await operationPair(pair, 'setTeacherPin', {
      claimToken: resetClaim.claimToken,
      pin: '840216',
    });
    await operationPair(pair, 'approveTeacherDevice', {
      actor: owner.actor,
      authorizationId: resetDevice.authorizationId,
      confirmationCode: resetDevice.confirmationCode,
    });

    const recovered = await operationPair(pair, 'recoverOwner', {
      recoveryCode: owner.recoveryCodes[0],
      newPin: '913702',
    });
    assert.equal(recovered.operatorId, owner.operatorId);
    const manifest = await assertDatabaseParity(pair);
    assert.deepEqual(manifest.domainIds.teacher_id, [teacher.teacherId]);
  } finally {
    await pair.close();
  }
});

test('b2-auth-portability-03 公開HTTP status・bodyと一回限り再実行errorが一致する', async () => {
  const pair = await pairHarness();
  try {
    await operationPair(pair, 'createBootstrapTicket', { token: 'fake-api-bootstrap' });
    const activation = await apiPair(pair, 'activateOwner', { ticket: 'fake-api-bootstrap', pin: '482105' });
    assert.equal(activation.status, 201);
    const actor = { kind: 'owner', operatorId: 'fake_owner_1' };
    const enrollment = await apiPair(pair, 'createInitialTeacherEnrollment', {
      actor, displayName: '架空 HTTP先生', token: 'fake-api-enrollment',
    });
    assert.equal(enrollment.status, 201);
    const claim = await apiPair(pair, 'claimEnrollment', { ticket: enrollment.body.ticket });
    assert.equal(claim.status, 200);
    const repeatedClaim = await apiPair(pair, 'claimEnrollment', { ticket: enrollment.body.ticket });
    assert.deepEqual(repeatedClaim, { status: 409, body: { error: 'ENROLLMENT_TICKET_NOT_ACTIVE' } });
    const pending = await apiPair(pair, 'setTeacherPin', { claimToken: claim.body.claimToken, pin: '731904' });
    assert.equal(pending.status, 202);
    const approval = await apiPair(pair, 'approveTeacherDevice', {
      actor,
      authorizationId: 'fake_teacher_device_1',
      confirmationCode: pending.body.confirmationCode,
    });
    assert.deepEqual(approval, { status: 200, body: { status: 'approved' } });
    const repeatedApproval = await apiPair(pair, 'approveTeacherDevice', {
      actor,
      authorizationId: 'fake_teacher_device_1',
      confirmationCode: pending.body.confirmationCode,
    });
    assert.deepEqual(repeatedApproval, { status: 409, body: { error: 'DEVICE_NOT_PENDING' } });

    const newDeviceTicket = await apiPair(pair, 'createTeacherEnrollment', {
      actor,
      teacherId: enrollment.body.teacherId,
      purpose: 'new_device',
      token: 'fake-api-new-device',
    });
    const newDeviceClaim = await apiPair(pair, 'claimEnrollment', { ticket: newDeviceTicket.body.ticket });
    const newDevice = await apiPair(pair, 'setTeacherPin', {
      claimToken: newDeviceClaim.body.claimToken,
      pin: '731904',
    });
    assert.equal(newDevice.status, 202);
    assert.deepEqual(await apiPair(pair, 'rejectTeacherDevice', {
      actor,
      authorizationId: 'fake_teacher_device_2',
    }), { status: 200, body: { status: 'revoked' } });

    const revokeTicket = await apiPair(pair, 'createTeacherEnrollment', {
      actor,
      teacherId: enrollment.body.teacherId,
      purpose: 'new_device',
      token: 'fake-api-revoke-device',
    });
    const revokeClaim = await apiPair(pair, 'claimEnrollment', { ticket: revokeTicket.body.ticket });
    await apiPair(pair, 'setTeacherPin', { claimToken: revokeClaim.body.claimToken, pin: '731904' });
    assert.deepEqual(await apiPair(pair, 'revokeTeacherDevice', {
      actor,
      authorizationId: 'fake_teacher_device_3',
      reason: 'owner_action',
    }), { status: 200, body: { status: 'revoked' } });

    const resetTicket = await apiPair(pair, 'createTeacherEnrollment', {
      actor,
      teacherId: enrollment.body.teacherId,
      purpose: 'pin_reset',
      token: 'fake-api-pin-reset',
    });
    const resetClaim = await apiPair(pair, 'claimEnrollment', { ticket: resetTicket.body.ticket });
    assert.equal((await apiPair(pair, 'setTeacherPin', {
      claimToken: resetClaim.body.claimToken,
      pin: '840216',
    })).status, 202);

    const recovery = await apiPair(pair, 'recoverOwner', {
      recoveryCode: activation.body.recoveryCodes[0],
      newPin: '913702',
    });
    assert.equal(recovery.status, 200);
    assert.equal(recovery.body.status, 'recovered');
    await assertDatabaseParity(pair);
  } finally {
    await pair.close();
  }
});

test('b2-auth-portability-04 同一bootstrap・recovery・claimの20並列は両DBで一件だけ成功する', async () => {
  for (const backend of ['d1', 'postgres']) {
    const pair = await pairHarness();
    try {
      const service = backend === 'd1' ? pair.d1Service : pair.postgresService;
      await service.createBootstrapTicket({ token: `fake-${backend}-parallel-bootstrap` });
      const bootstrap = await Promise.allSettled(Array.from({ length: 20 }, () => service.activateOwner({
        ticket: `fake-${backend}-parallel-bootstrap`, pin: '482105',
      })));
      assert.equal(bootstrap.filter((result) => result.status === 'fulfilled').length, 1, backend);
      const owner = bootstrap.find((result) => result.status === 'fulfilled').value;
      const recovery = await Promise.allSettled(Array.from({ length: 20 }, () => service.recoverOwner({
        recoveryCode: owner.recoveryCodes[0], newPin: '913702',
      })));
      assert.equal(recovery.filter((result) => result.status === 'fulfilled').length, 1, backend);
      const actor = { kind: 'owner', operatorId: owner.operatorId };
      const enrollment = await service.createInitialTeacherEnrollment({
        actor, displayName: '架空 並列先生', token: `fake-${backend}-parallel-enrollment`,
      });
      const claims = await Promise.allSettled(Array.from({ length: 20 }, () => service.claimEnrollment({
        ticket: enrollment.token,
      })));
      assert.equal(claims.filter((result) => result.status === 'fulfilled').length, 1, backend);
      const claim = claims.find((result) => result.status === 'fulfilled').value;
      const pinSets = await Promise.allSettled(Array.from({ length: 20 }, () => service.setTeacherPin({
        claimToken: claim.claimToken,
        pin: '731904',
      })));
      assert.equal(pinSets.filter((result) => result.status === 'fulfilled').length, 1, backend);
      const pending = pinSets.find((result) => result.status === 'fulfilled').value;
      const approvals = await Promise.allSettled(Array.from({ length: 20 }, () => service.approveTeacherDevice({
        actor,
        authorizationId: pending.authorizationId,
        confirmationCode: pending.confirmationCode,
      })));
      assert.equal(approvals.filter((result) => result.status === 'fulfilled').length, 1, backend);
    } finally {
      await pair.close();
    }
  }
});

test('b2-auth-portability-05 承認・拒否・失効の競合順序は同じ終端状態と公開errorになる', async () => {
  for (const first of ['approve', 'reject']) {
    const pair = await pairHarness();
    try {
      const owner = await activate(pair, `fake-race-${first}-bootstrap`);
      const pending = await makePending(pair, owner, { token: `fake-race-${first}-enrollment` });
      const firstResult = first === 'approve'
        ? await apiPair(pair, 'approveTeacherDevice', {
          actor: owner.actor, authorizationId: pending.authorizationId, confirmationCode: pending.confirmationCode,
        })
        : await apiPair(pair, 'rejectTeacherDevice', {
          actor: owner.actor, authorizationId: pending.authorizationId,
        });
      assert.equal(firstResult.status, 200);
      const secondResult = first === 'approve'
        ? await apiPair(pair, 'rejectTeacherDevice', { actor: owner.actor, authorizationId: pending.authorizationId })
        : await apiPair(pair, 'approveTeacherDevice', {
          actor: owner.actor, authorizationId: pending.authorizationId, confirmationCode: pending.confirmationCode,
        });
      assert.equal(secondResult.status, 409);
      await assertDatabaseParity(pair);
    } finally {
      await pair.close();
    }
  }
  const pair = await pairHarness();
  try {
    const owner = await activate(pair, 'fake-true-race-bootstrap');
    const pending = await makePending(pair, owner, { token: 'fake-true-race-enrollment' });
    const race = async (service) => Promise.all([
      invokeAuthWriteApi(service, 'approveTeacherDevice', {
        actor: owner.actor,
        authorizationId: pending.authorizationId,
        confirmationCode: pending.confirmationCode,
      }),
      invokeAuthWriteApi(service, 'rejectTeacherDevice', {
        actor: owner.actor,
        authorizationId: pending.authorizationId,
      }),
    ]);
    const [d1Results, postgresResults] = await Promise.all([
      race(pair.d1Service),
      race(pair.postgresService),
    ]);
    assert.deepEqual(postgresResults, d1Results);
    assert.deepEqual(d1Results.map((result) => result.status).sort(), [200, 409]);
    await assertDatabaseParity(pair);
  } finally {
    await pair.close();
  }
});

test('b2-auth-portability-06 Postgres全mutation境界はfailure時に完全rollbackする', async () => {
  const postgres = new PGlite();
  await postgres.waitReady;
  await postgres.exec(readFileSync(new URL('../../portability/postgres-schema.sql', import.meta.url), 'utf8'));
  let failAt = null;
  const adapter = new GoenchoPostgresAuthWriteAdapter({
    client: postgres,
    ...adapterOptions(deterministicFactories(), new DeterministicPinCodec(), (index) => {
      if (index === failAt) throw new Error(`fake postgres mutation failure ${index}`);
    }),
  });
  const service = new GoenchoAuthWriteService(adapter);
  const snapshot = async () => buildManifest(await readPostgresTables(postgres));
  const expectRollbackAtEveryStep = async (steps, operation) => {
    for (let index = 0; index < steps; index += 1) {
      const before = await snapshot();
      failAt = index;
      await assert.rejects(operation(), /fake postgres mutation failure/);
      failAt = null;
      assert.deepEqual(compareManifests(before, await snapshot()), [], `mutation ${index}`);
    }
  };
  try {
    await service.createBootstrapTicket({ token: 'fake-failure-bootstrap' });
    await expectRollbackAtEveryStep(11, () => service.activateOwner({ ticket: 'fake-failure-bootstrap', pin: '482105' }));
    const owner = await service.activateOwner({ ticket: 'fake-failure-bootstrap', pin: '482105' });
    const actor = { kind: 'owner', operatorId: owner.operatorId };
    await expectRollbackAtEveryStep(3, () => service.createInitialTeacherEnrollment({
      actor, displayName: '架空 Rollback先生', token: 'fake-failure-enrollment',
    }));
    const enrollment = await service.createInitialTeacherEnrollment({
      actor, displayName: '架空 Rollback先生', token: 'fake-failure-enrollment',
    });
    const claim = await service.claimEnrollment({ ticket: enrollment.token });
    await expectRollbackAtEveryStep(3, () => service.setTeacherPin({ claimToken: claim.claimToken, pin: '731904' }));
    const pending = await service.setTeacherPin({ claimToken: claim.claimToken, pin: '731904' });
    await expectRollbackAtEveryStep(2, () => service.approveTeacherDevice({
      actor, authorizationId: pending.authorizationId, confirmationCode: pending.confirmationCode,
    }));
    await service.approveTeacherDevice({
      actor, authorizationId: pending.authorizationId, confirmationCode: pending.confirmationCode,
    });
    const rejectTicket = await service.createTeacherEnrollment({
      actor, teacherId: enrollment.teacherId, purpose: 'new_device', token: 'fake-failure-reject-device',
    });
    const rejectClaim = await service.claimEnrollment({ ticket: rejectTicket.token });
    const rejectPending = await service.setTeacherPin({ claimToken: rejectClaim.claimToken, pin: '731904' });
    await expectRollbackAtEveryStep(1, () => service.rejectTeacherDevice({
      actor, authorizationId: rejectPending.authorizationId,
    }));
    await service.rejectTeacherDevice({ actor, authorizationId: rejectPending.authorizationId });
    const revokeTicket = await service.createTeacherEnrollment({
      actor, teacherId: enrollment.teacherId, purpose: 'new_device', token: 'fake-failure-revoke-device',
    });
    const revokeClaim = await service.claimEnrollment({ ticket: revokeTicket.token });
    const revokePending = await service.setTeacherPin({ claimToken: revokeClaim.claimToken, pin: '731904' });
    await expectRollbackAtEveryStep(2, () => service.revokeTeacherDevice({
      actor, authorizationId: revokePending.authorizationId,
    }));
    await service.revokeTeacherDevice({ actor, authorizationId: revokePending.authorizationId });
    const reset = await service.createTeacherEnrollment({
      actor, teacherId: enrollment.teacherId, purpose: 'pin_reset', token: 'fake-failure-reset',
    });
    const resetClaim = await service.claimEnrollment({ ticket: reset.token });
    await expectRollbackAtEveryStep(6, () => service.setTeacherPin({ claimToken: resetClaim.claimToken, pin: '840216' }));
    await expectRollbackAtEveryStep(13, () => service.recoverOwner({
      recoveryCode: owner.recoveryCodes[0], newPin: '913702',
    }));
    assert.deepEqual(await postgresForeignKeyViolations(postgres), []);
  } finally {
    await postgres.close();
  }
});

test('b2-auth-portability-07 D1拒否failureもpending状態を完全保持する', async () => {
  const pair = await pairHarness();
  try {
    const owner = await activate(pair, 'fake-d1-reject-rollback-bootstrap');
    const pending = await makePending(pair, owner, { token: 'fake-d1-reject-rollback-enrollment' });
    pair.d1.failNextBatchAt(0);
    await assert.rejects(pair.d1Service.rejectTeacherDevice({
      actor: owner.actor,
      authorizationId: pending.authorizationId,
    }), /Injected D1 batch failure/);
    await assertDatabaseParity(pair);
  } finally {
    await pair.close();
  }
});
