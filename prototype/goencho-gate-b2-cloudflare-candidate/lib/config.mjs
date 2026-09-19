export const CONFIG = Object.freeze({
  ownerHost: '127.0.0.1',
  ownerPort: 4191,
  ownerAllowedHost: '127.0.0.1:4191',
  teacherHost: '127.0.0.1',
  teacherPort: 4192,
  teacherAllowedHost: 'localhost:4192',
  teacherPinDigits: 6,
  inactivityMs: 30 * 60 * 1000,
  recoveryCodeCount: 5,
  maxPinFailures: 5,
  pinLockMs: 5 * 60 * 1000,
  ticketLifetimeMs: 10 * 60 * 1000,
  // Local-only browser credential retention candidate. This is not a device
  // authorization expiry; valid use reissues the cookie and DB approval has no
  // date-based expiry.
  deviceCredentialMaxAgeSeconds: 400 * 24 * 60 * 60,
  ownerCookie: 'goencho_owner_local',
  ownerSessionCookie: 'goencho_owner_session_local',
  teacherDeviceCookie: 'goencho_teacher_device_local',
  teacherSessionCookie: 'goencho_teacher_session_local',
});

export function assertRuntimeConfig(config = CONFIG, mode = 'local') {
  if (config.ownerHost !== '127.0.0.1' || config.teacherHost !== '127.0.0.1') {
    throw new Error('Gate B1 servers must bind to 127.0.0.1');
  }
  if (mode === 'production') {
    throw new Error('Gate B1 candidate cannot start in production mode');
  }
  if (!Number.isSafeInteger(config.deviceCredentialMaxAgeSeconds)
    || config.deviceCredentialMaxAgeSeconds <= 0) {
    throw new Error('Gate B1 device credential retention must be a positive integer');
  }
  return true;
}
