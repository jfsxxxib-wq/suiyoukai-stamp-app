const REQUIRED_METHODS = Object.freeze([
  'schemaVersion',
  'findTeacherAuthContext',
  'lockTeacherSession',
  'touchTeacherAuth',
  'selectMatchesByDate',
  'selectMatchDates',
  'selectParticipantMatches',
  'insertMatch',
]);

export function assertGoenchoDbContract(adapter) {
  if (!adapter || typeof adapter !== 'object') {
    throw new TypeError('Goencho database adapter is required');
  }
  for (const method of REQUIRED_METHODS) {
    if (typeof adapter[method] !== 'function') {
      throw new TypeError(`Goencho database adapter is missing ${method}()`);
    }
  }
  return adapter;
}

export const GOENCHO_DB_CONTRACT_METHODS = REQUIRED_METHODS;
