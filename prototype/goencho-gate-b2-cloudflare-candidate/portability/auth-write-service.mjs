import { assertGoenchoAuthWriteContract } from './auth-write-contract.mjs';
import { fail } from '../lib/errors.mjs';

function requireOwner(actor) {
  if (actor?.kind !== 'owner' || !actor.operatorId) fail(403, 'OWNER_REQUIRED', 'Owner required');
}

function requirePin(pin, digits) {
  if (typeof pin !== 'string' || !new RegExp(`^\\d{${digits}}$`, 'u').test(pin)) {
    fail(400, 'INVALID_PIN_FORMAT', 'PIN format is invalid');
  }
}

function requirePurpose(purpose) {
  if (!['initial', 'new_device', 'pin_reset'].includes(purpose)) {
    fail(400, 'INVALID_ENROLLMENT_PURPOSE', 'Enrollment purpose is invalid');
  }
}

export class GoenchoAuthWriteService {
  constructor(adapter, { pinDigits = 6 } = {}) {
    this.adapter = assertGoenchoAuthWriteContract(adapter);
    this.pinDigits = pinDigits;
  }

  createBootstrapTicket(input) { return this.adapter.createBootstrapTicket(input); }
  activateOwner(input) {
    requirePin(input?.pin, this.pinDigits);
    return this.adapter.activateOwner(input);
  }
  recoverOwner(input) {
    requirePin(input?.newPin, this.pinDigits);
    return this.adapter.recoverOwner(input);
  }
  createInitialTeacherEnrollment(input) {
    requireOwner(input?.actor);
    if (typeof input?.displayName !== 'string' || !input.displayName.trim()) {
      fail(400, 'INVALID_DISPLAY_NAME', 'Display name is required');
    }
    return this.adapter.createInitialTeacherEnrollment(input);
  }
  createTeacherEnrollment(input) {
    requireOwner(input?.actor);
    requirePurpose(input?.purpose);
    return this.adapter.createTeacherEnrollment(input);
  }
  claimEnrollment(input) { return this.adapter.claimEnrollment(input); }
  setTeacherPin(input) {
    requirePin(input?.pin, this.pinDigits);
    return this.adapter.setTeacherPin(input);
  }
  approveTeacherDevice(input) {
    requireOwner(input?.actor);
    return this.adapter.approveTeacherDevice(input);
  }
  rejectTeacherDevice(input) {
    requireOwner(input?.actor);
    return this.adapter.rejectTeacherDevice(input);
  }
  revokeTeacherDevice(input) {
    requireOwner(input?.actor);
    return this.adapter.revokeTeacherDevice(input);
  }
}
