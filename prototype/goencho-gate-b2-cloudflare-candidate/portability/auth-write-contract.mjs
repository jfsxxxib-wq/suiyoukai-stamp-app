const REQUIRED_AUTH_WRITE_METHODS = Object.freeze([
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

export function assertGoenchoAuthWriteContract(adapter) {
  if (!adapter || typeof adapter !== 'object') {
    throw new TypeError('Goencho auth write adapter is required');
  }
  for (const method of REQUIRED_AUTH_WRITE_METHODS) {
    if (typeof adapter[method] !== 'function') {
      throw new TypeError(`Goencho auth write adapter is missing ${method}()`);
    }
  }
  return adapter;
}

export const GOENCHO_AUTH_WRITE_CONTRACT_METHODS = REQUIRED_AUTH_WRITE_METHODS;
