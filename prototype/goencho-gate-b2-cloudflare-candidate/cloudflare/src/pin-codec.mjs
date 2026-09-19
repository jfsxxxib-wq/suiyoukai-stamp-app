import { fail } from '../../lib/errors.mjs';
import { fromHex, hmacBytes, randomHex, toHex } from './web-crypto.mjs';

export const PBKDF2_ALGORITHM = 'pbkdf2-hmac-sha256-v1';
export const PBKDF2_MIN_ITERATIONS = 600_000;
export const PIN_SALT_BYTES = 16;
export const PIN_HASH_BYTES = 32;

function requirePin(pin, digits = 6) {
  if (typeof pin !== 'string' || !new RegExp(`^\\d{${digits}}$`, 'u').test(pin)) {
    fail(400, 'INVALID_PIN_FORMAT', 'PIN format is invalid');
  }
  return pin;
}

function requireIterations(iterations) {
  if (!Number.isSafeInteger(iterations) || iterations < PBKDF2_MIN_ITERATIONS) {
    fail(503, 'SERVICE_UNAVAILABLE', 'PIN work factor is unavailable');
  }
  return iterations;
}

async function derive(pin, pepper, saltHex, iterations) {
  const peppered = await hmacBytes(pepper, pin);
  const material = await crypto.subtle.importKey('raw', peppered, 'PBKDF2', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    hash: 'SHA-256',
    salt: fromHex(saltHex),
    iterations,
  }, material, PIN_HASH_BYTES * 8));
}

function equalConstantTime(actual, expected) {
  if (typeof crypto.subtle.timingSafeEqual === 'function') {
    return crypto.subtle.timingSafeEqual(actual, expected);
  }
  let difference = actual.length ^ expected.length;
  const length = Math.max(actual.length, expected.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (actual[index % actual.length] ?? 0) ^ (expected[index % expected.length] ?? 0);
  }
  return difference === 0;
}

export class Pbkdf2PinCodec {
  constructor({ iterations = PBKDF2_MIN_ITERATIONS, keyVersion = 'v1', digits = 6 } = {}) {
    this.iterations = requireIterations(iterations);
    this.keyVersion = keyVersion;
    this.digits = digits;
  }

  async create(pin, pepper) {
    requirePin(pin, this.digits);
    if (typeof pepper !== 'string' || pepper.length < 32) {
      fail(503, 'SERVICE_UNAVAILABLE', 'PIN pepper is unavailable');
    }
    const salt = randomHex(PIN_SALT_BYTES);
    const hash = toHex(await derive(pin, pepper, salt, this.iterations));
    return {
      salt,
      hash,
      algorithm: PBKDF2_ALGORITHM,
      workFactor: this.iterations,
      parametersJson: JSON.stringify({ hash: 'SHA-256', outputBytes: PIN_HASH_BYTES }),
      pepperKeyVersion: this.keyVersion,
    };
  }

  async verify(pin, record, pepperForVersion) {
    requirePin(pin, this.digits);
    if (record?.algorithm !== PBKDF2_ALGORITHM) {
      fail(503, 'SERVICE_UNAVAILABLE', 'PIN algorithm is unavailable');
    }
    const iterations = requireIterations(Number(record.work_factor ?? record.workFactor));
    const keyVersion = record.pepper_key_version ?? record.pepperKeyVersion;
    const pepper = pepperForVersion(keyVersion);
    if (typeof pepper !== 'string' || pepper.length < 32) {
      fail(503, 'SERVICE_UNAVAILABLE', 'PIN pepper is unavailable');
    }
    let salt;
    let expected;
    try {
      salt = fromHex(record.salt);
      expected = fromHex(record.pin_hash ?? record.hash);
    } catch {
      fail(503, 'SERVICE_UNAVAILABLE', 'PIN credential is invalid');
    }
    if (salt.length < PIN_SALT_BYTES || expected.length !== PIN_HASH_BYTES) {
      fail(503, 'SERVICE_UNAVAILABLE', 'PIN credential is invalid');
    }
    const actual = await derive(pin, pepper, record.salt, iterations);
    return equalConstantTime(actual, expected);
  }
}
