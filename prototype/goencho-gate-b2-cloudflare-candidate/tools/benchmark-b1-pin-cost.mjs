import { createPinRecord, randomToken, verifyPin } from '../lib/crypto.mjs';

const pepper = randomToken(32);
const samples = [];
for (let index = 0; index < 8; index += 1) {
  const createStart = performance.now();
  const record = createPinRecord('123456', pepper);
  const verifyStart = performance.now();
  verifyPin('123456', record, pepper);
  const end = performance.now();
  samples.push({
    createMs: verifyStart - createStart,
    verifyMs: end - verifyStart,
  });
}
const average = (key) => samples.reduce((sum, sample) => sum + sample[key], 0) / samples.length;
process.stdout.write(JSON.stringify({
  algorithm: 'scrypt-v1',
  samples: samples.length,
  averageCreateMs: Number(average('createMs').toFixed(2)),
  averageVerifyMs: Number(average('verifyMs').toFixed(2)),
}) + '\n');
