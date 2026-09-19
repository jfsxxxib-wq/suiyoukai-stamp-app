import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, assertRuntimeConfig } from '../lib/config.mjs';
import { recordAudit } from '../lib/audit.mjs';
import { openDatabase } from '../lib/db.mjs';
import { AppError, publicError } from '../lib/errors.mjs';
import { rejectOwnerPinInput } from '../lib/actor.mjs';
import {
  assertHost,
  assertNoCrossOrigin,
  assertStateChangingRequest,
  localCookie,
  securityHeaders,
} from '../lib/http-security.mjs';

test('boundary-01 auditへ秘密fieldを入れられない', () => {
  const db = openDatabase();
  assert.throws(() => recordAudit(db, { actorKind: 'owner', action: 'test', resultCode: 'bad', token: 'runtime' }), /Forbidden audit field/);
  db.close();
});

test('boundary-02 local cookieはhost-only・HttpOnly・SameSite Strict', () => {
  const cookie = localCookie(CONFIG.ownerCookie, 'runtime-value');
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Strict/);
  assert.doesNotMatch(cookie, /Domain=/);
});

test('boundary-03 security headerはno-store・no-referrer・CSP', () => {
  const headers = securityHeaders('http://127.0.0.1:4191');
  assert.equal(headers['Cache-Control'], 'no-store');
  assert.equal(headers['Referrer-Policy'], 'no-referrer');
  assert.match(headers['Content-Security-Policy'], /frame-ancestors 'none'/);
});

test('boundary-04 許可外Hostを拒否', () => {
  assert.throws(() => assertHost({ headers: { host: 'outside.example' } }, CONFIG.ownerAllowedHost), (error) => error.code === 'INVALID_HOST');
});

test('boundary-05 cross-origin requestを拒否', () => {
  assert.throws(() => assertNoCrossOrigin({ headers: { origin: 'http://localhost:4192' } }, 'http://127.0.0.1:4191'), (error) => error.code === 'ORIGIN_NOT_ALLOWED');
});

test('boundary-06 公開errorは内部messageを返さない', () => {
  const result = publicError(new AppError(401, 'SAFE_CODE', 'sensitive internal detail'));
  assert.deepEqual(result, { status: 401, body: { error: 'SAFE_CODE' } });
});

test('boundary-07 Gate B1 candidateはproduction modeで起動不可', () => {
  assert.throws(() => assertRuntimeConfig(CONFIG, 'production'), /cannot start in production mode/);
});

test('boundary-08 両serverはloopback bind限定', () => {
  assert.equal(CONFIG.ownerHost, '127.0.0.1');
  assert.equal(CONFIG.teacherHost, '127.0.0.1');
  assert.notEqual(CONFIG.ownerAllowedHost, CONFIG.teacherAllowedHost);
});

test('boundary-09 保護APIはownerPin bodyを拒否', () => {
  assert.throws(() => rejectOwnerPinInput({ body: { ownerPin: 'runtime-value' } }), (error) => {
    assert.equal(error.code, 'OWNER_PIN_NOT_ACCEPTED');
    assert.equal(error.status, 400);
    return true;
  });
});

test('boundary-10 保護APIはx-owner-pin headerを拒否', () => {
  assert.throws(() => rejectOwnerPinInput({ headers: { 'x-owner-pin': 'runtime-value' } }), (error) => {
    assert.equal(error.code, 'OWNER_PIN_NOT_ACCEPTED');
    assert.equal(error.status, 400);
    return true;
  });
});

test('boundary-11 状態変更POSTは完全一致OriginとJSONを要求', () => {
  assert.equal(assertStateChangingRequest({
    method: 'POST',
    headers: { origin: 'http://127.0.0.1:4191', 'content-type': 'application/json; charset=utf-8' },
  }, 'http://127.0.0.1:4191'), true);
});

test('boundary-12 OriginなしPOSTを拒否', () => {
  assert.throws(() => assertStateChangingRequest({
    method: 'POST', headers: { 'content-type': 'application/json' },
  }, 'http://127.0.0.1:4191'), (error) => error.code === 'ORIGIN_REQUIRED' && error.status === 403);
});

test('boundary-13 JSON以外のPOSTを拒否', () => {
  assert.throws(() => assertStateChangingRequest({
    method: 'POST', headers: { origin: 'http://127.0.0.1:4191', 'content-type': 'text/plain' },
  }, 'http://127.0.0.1:4191'), (error) => error.code === 'JSON_REQUIRED' && error.status === 415);
});
