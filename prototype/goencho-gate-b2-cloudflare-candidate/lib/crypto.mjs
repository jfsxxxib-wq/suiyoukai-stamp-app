import {
  createHash,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';

export function opaqueId(prefix) {
  return `${prefix}_${randomUUID()}`;
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}

export function hashToken(value, pepper) {
  return createHash('sha256').update(`${pepper}\u0000${value}`, 'utf8').digest('hex');
}

export function validateNumericPin(pin, digits = 6) {
  return typeof pin === 'string' && new RegExp(`^\\d{${digits}}$`).test(pin);
}

export function createPinRecord(pin, pepper) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(`${pin}\u0000${pepper}`, salt, 32).toString('hex');
  return { salt, hash, algorithm: 'scrypt-v1' };
}

export function verifyPin(pin, record, pepper) {
  const storedHash = record?.hash ?? record?.pin_hash;
  if (!record?.salt || !storedHash) {
    return false;
  }
  const candidate = scryptSync(`${pin}\u0000${pepper}`, record.salt, 32);
  const expected = Buffer.from(storedHash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function confirmationCode() {
  const number = randomBytes(2).readUInt16BE(0) % 10000;
  return String(number).padStart(4, '0');
}

export function fakeRecoveryCodes(count) {
  return Array.from({ length: count }, (_, index) => `FAKE-${String(index + 1).padStart(2, '0')}-${randomBytes(5).toString('hex').toUpperCase()}`);
}
