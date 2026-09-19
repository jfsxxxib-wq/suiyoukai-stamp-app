import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../lib/config.mjs';
import { randomToken } from '../lib/crypto.mjs';
import { openDatabase } from '../lib/db.mjs';
import { OwnerAuthService } from '../lib/owner-auth.mjs';
import { createHarness, expectCode } from './helpers.mjs';

test('owner-01 bootstrap ticketなしでは登録できない', () => {
  const db = openDatabase();
  const service = new OwnerAuthService({ db, pepper: randomToken(), now: () => 1000 });
  expectCode(() => service.activate({ ticket: randomToken(), pin: String(100000 + Math.floor(Math.random() * 899999)) }), 'INVALID_BOOTSTRAP_TICKET', 401);
  db.close();
});

test('owner-02 PIN形式不正は400', () => {
  const db = openDatabase();
  const service = new OwnerAuthService({ db, pepper: randomToken(), now: () => 1000 });
  const ticket = service.createBootstrapTicket();
  expectCode(() => service.activate({ ticket, pin: 'short' }), 'INVALID_PIN_FORMAT', 400);
  db.close();
});

test('owner-03 bootstrap ticketは一回だけ', () => {
  const h = createHarness();
  expectCode(() => h.ownerAuth.activate({ ticket: randomToken(), pin: h.ownerPin }), 'INVALID_BOOTSTRAP_TICKET', 401);
  assert.equal(h.db.prepare("SELECT COUNT(*) count FROM goencho_operators WHERE status = 'active'").get().count, 1);
  h.close();
});

test('owner-04 期限切れbootstrap ticketは410', () => {
  let now = 1000;
  const db = openDatabase();
  const service = new OwnerAuthService({ db, pepper: randomToken(), now: () => now });
  const ticket = service.createBootstrapTicket();
  now += CONFIG.ticketLifetimeMs + 1;
  expectCode(() => service.activate({ ticket, pin: String(100000 + Math.floor(Math.random() * 899999)) }), 'BOOTSTRAP_TICKET_EXPIRED', 410);
  db.close();
});

test('owner-05 匿名訪問者はowner deviceにならない', () => {
  const h = createHarness();
  expectCode(() => h.ownerAuth.resolveDevice(randomToken()), 'OWNER_DEVICE_NOT_APPROVED', 401);
  h.close();
});

test('owner-06 PIN連続失敗で一時停止', () => {
  const h = createHarness();
  for (let index = 1; index < CONFIG.maxPinFailures; index += 1) {
    expectCode(() => h.ownerAuth.unlock({ deviceToken: h.owner.deviceToken, pin: String(100000 + index) }), 'INVALID_CREDENTIALS', 401);
  }
  expectCode(() => h.ownerAuth.unlock({ deviceToken: h.owner.deviceToken, pin: String(200000 + CONFIG.maxPinFailures) }), 'AUTH_TEMPORARILY_LOCKED', 429);
  expectCode(() => h.ownerAuth.unlock({ deviceToken: h.owner.deviceToken, pin: h.ownerPin }), 'AUTH_TEMPORARILY_LOCKED', 429);
  h.close();
});

test('owner-07 復旧で旧管理端末が失効する', () => {
  const h = createHarness();
  const result = h.ownerAuth.recover({ recoveryCode: h.owner.recoveryCodes[0], newPin: String(100000 + Math.floor(Math.random() * 899999)) });
  expectCode(() => h.ownerAuth.resolveDevice(h.owner.deviceToken), 'OWNER_DEVICE_NOT_APPROVED', 401);
  assert.equal(h.ownerAuth.resolveDevice(result.deviceToken).operatorId, h.owner.operatorId);
  h.close();
});

test('owner-08 復旧後は旧batchの残りも使えない', () => {
  const h = createHarness();
  const newPin = String(100000 + Math.floor(Math.random() * 899999));
  h.ownerAuth.recover({ recoveryCode: h.owner.recoveryCodes[0], newPin });
  expectCode(() => h.ownerAuth.recover({ recoveryCode: h.owner.recoveryCodes[1], newPin }), 'INVALID_RECOVERY_CODE', 401);
  h.close();
});
