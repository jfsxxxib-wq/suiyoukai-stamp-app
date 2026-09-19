import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { Pbkdf2PinCodec } from '../src/pin-codec.mjs';

const PIN = '482105';
const WRONG_PIN = '482106';
const PEPPER = 'BENCHMARK-ONLY-PEPPER-'.padEnd(48, 'p');
const codec = new Pbkdf2PinCodec();

function elapsed(start) {
  return performance.now() - start;
}

async function pbkdf2Sample() {
  let start = performance.now();
  const record = await codec.create(PIN, PEPPER);
  const createMs = elapsed(start);
  start = performance.now();
  const correct = await codec.verify(PIN, record, () => PEPPER);
  const correctMs = elapsed(start);
  start = performance.now();
  const wrong = await codec.verify(WRONG_PIN, record, () => PEPPER);
  const wrongMs = elapsed(start);
  return { createMs, correctMs, wrongMs, correct, wrong };
}

function scryptSample({ N, r, p }) {
  const salt = randomBytes(16);
  const options = { N, r, p, maxmem: 128 * 1024 * 1024 };
  let start = performance.now();
  const hash = scryptSync(`${PIN}\u0000${PEPPER}`, salt, 32, options);
  const createMs = elapsed(start);
  start = performance.now();
  const correctHash = scryptSync(`${PIN}\u0000${PEPPER}`, salt, 32, options);
  const correct = timingSafeEqual(hash, correctHash);
  const correctMs = elapsed(start);
  start = performance.now();
  const wrongHash = scryptSync(`${WRONG_PIN}\u0000${PEPPER}`, salt, 32, options);
  const wrong = timingSafeEqual(hash, wrongHash);
  const wrongMs = elapsed(start);
  return { createMs, correctMs, wrongMs, correct, wrong };
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/health') return new Response('ok');
    if (request.method !== 'POST') return Response.json({ error: 'NOT_FOUND' }, { status: 404 });
    let result;
    if (url.pathname === '/sample/pbkdf2-600k') result = await pbkdf2Sample();
    else if (url.pathname === '/sample/scrypt-legacy') result = scryptSample({ N: 2 ** 14, r: 8, p: 1 });
    else if (url.pathname === '/sample/scrypt-owasp') result = scryptSample({ N: 2 ** 14, r: 8, p: 5 });
    else return Response.json({ error: 'NOT_FOUND' }, { status: 404 });
    if (!result.correct || result.wrong) return Response.json({ error: 'CRYPTO_MISMATCH' }, { status: 500 });
    return Response.json({
      createMs: result.createMs,
      correctMs: result.correctMs,
      wrongMs: result.wrongMs,
    }, { headers: { 'cache-control': 'no-store' } });
  },
};
