import { randomInt } from 'node:crypto';
import assert from 'node:assert/strict';
import { CONFIG } from '../lib/config.mjs';
import { randomToken } from '../lib/crypto.mjs';
import { openDatabase } from '../lib/db.mjs';
import { OwnerAuthService } from '../lib/owner-auth.mjs';
import { TeacherAuthService } from '../lib/teacher-auth.mjs';

function runtimePin() {
  return String(randomInt(100000, 1000000));
}

export function createHarness({ seed = true, start = Date.parse('2026-09-17T09:00:00+09:00') } = {}) {
  let currentTime = start;
  const now = () => currentTime;
  const advance = (milliseconds) => { currentTime += milliseconds; };
  const db = openDatabase({ seed });
  const pepper = randomToken(32);
  const ownerAuth = new OwnerAuthService({ db, pepper, now, config: CONFIG });
  const teacherAuth = new TeacherAuthService({ db, pepper, now, config: CONFIG });
  const ownerPin = runtimePin();
  const bootstrapTicket = ownerAuth.createBootstrapTicket(randomToken());
  const owner = ownerAuth.activate({ ticket: bootstrapTicket, pin: ownerPin });
  const ownerActor = ownerAuth.resolveSession(owner.sessionToken);

  function createTeacher(displayName = '試験先生（架空）') {
    return ownerAuth.createTeacher({ actor: ownerActor, displayName }).teacherId;
  }

  function enrollTeacher({ teacherId = createTeacher(), purpose = 'initial', pin = runtimePin(), approve = false } = {}) {
    const enrollment = ownerAuth.createEnrollmentTicket({ actor: ownerActor, teacherId, purpose, token: randomToken() });
    const claim = teacherAuth.claimEnrollment({ ticket: enrollment.token });
    const device = teacherAuth.setPin({ claimToken: claim.claimToken, pin });
    if (approve) {
      ownerAuth.approveDevice({ actor: ownerActor, authorizationId: device.authorizationId, confirmationCode: device.confirmationCode });
    }
    return { teacherId, pin, ...device };
  }

  function readyTeacher(options = {}) {
    const device = enrollTeacher({ ...options, approve: true });
    const session = teacherAuth.unlock({ deviceToken: device.deviceToken, pin: device.pin });
    const actor = teacherAuth.resolveSession(session.sessionToken);
    return { ...device, ...session, actor };
  }

  return {
    db, pepper, now, advance, ownerAuth, teacherAuth, ownerPin, owner, ownerActor,
    createTeacher, enrollTeacher, readyTeacher,
    close: () => db.close(),
  };
}

export function expectCode(fn, code, status) {
  assert.throws(fn, (error) => {
    assert.equal(error.code, code);
    if (status !== undefined) assert.equal(error.status, status);
    return true;
  });
}
