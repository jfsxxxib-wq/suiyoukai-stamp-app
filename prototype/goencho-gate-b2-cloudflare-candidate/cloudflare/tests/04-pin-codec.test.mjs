import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PBKDF2_ALGORITHM,
  PBKDF2_MIN_ITERATIONS,
  Pbkdf2PinCodec,
} from '../src/pin-codec.mjs';

const PEPPER = 'pin-codec-test-pepper-'.padEnd(48, 'p');

test('b2-pin-01 PBKDF2 600000回・salt 16 byte以上・hash 32 byteを記録する', async () => {
  const codec = new Pbkdf2PinCodec();
  const record = await codec.create('482105', PEPPER);
  assert.equal(record.algorithm, PBKDF2_ALGORITHM);
  assert.equal(record.workFactor, PBKDF2_MIN_ITERATIONS);
  assert.equal(record.salt.length >= 32, true);
  assert.equal(record.hash.length, 64);
  assert.equal(record.pepperKeyVersion, 'v1');
  assert.equal(record.hash.includes('482105'), false);
  assert.equal(record.parametersJson.includes(PEPPER), false);
});

test('b2-pin-02 正しいPINだけをconstant-time比較経路で受理する', async () => {
  const codec = new Pbkdf2PinCodec();
  const record = await codec.create('482105', PEPPER);
  const stored = {
    salt: record.salt,
    pin_hash: record.hash,
    algorithm: record.algorithm,
    work_factor: record.workFactor,
    pepper_key_version: record.pepperKeyVersion,
  };
  assert.equal(await codec.verify('482105', stored, () => PEPPER), true);
  assert.equal(await codec.verify('482106', stored, () => PEPPER), false);
});

test('b2-pin-03 同じPINでもsaltとhashが毎回異なる', async () => {
  const codec = new Pbkdf2PinCodec();
  const first = await codec.create('482105', PEPPER);
  const second = await codec.create('482105', PEPPER);
  assert.notEqual(first.salt, second.salt);
  assert.notEqual(first.hash, second.hash);
});

test('b2-pin-04 低work factor・未知algorithm・未知key versionは安全停止する', async () => {
  assert.throws(() => new Pbkdf2PinCodec({ iterations: PBKDF2_MIN_ITERATIONS - 1 }),
    (error) => error.code === 'SERVICE_UNAVAILABLE');
  const codec = new Pbkdf2PinCodec();
  const record = await codec.create('482105', PEPPER);
  await assert.rejects(codec.verify('482105', { ...record, algorithm: 'sha256-fast' }, () => PEPPER),
    (error) => error.code === 'SERVICE_UNAVAILABLE');
  await assert.rejects(codec.verify('482105', record, () => undefined),
    (error) => error.code === 'SERVICE_UNAVAILABLE');
});

test('b2-pin-05 6桁数字以外を拒否し秘密をerrorへ含めない', async () => {
  const codec = new Pbkdf2PinCodec();
  await assert.rejects(codec.create('12345', PEPPER), (error) => {
    assert.equal(error.code, 'INVALID_PIN_FORMAT');
    assert.equal(error.message.includes(PEPPER), false);
    return true;
  });
});
