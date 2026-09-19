import { fail } from '../../lib/errors.mjs';

export const B2_CONFIG = Object.freeze({
  ownerDeviceCookie: 'goencho_owner_device',
  ownerSessionCookie: 'goencho_owner_session',
  teacherDeviceCookie: 'goencho_teacher_device',
  teacherSessionCookie: 'goencho_teacher_session',
  deviceCredentialMaxAgeSeconds: 400 * 24 * 60 * 60,
  inactivityMs: 30 * 60 * 1000,
});

const requiredSecrets = Object.freeze([
  'GOENCHO_OWNER_PIN_PEPPER_V1',
  'GOENCHO_TEACHER_PIN_PEPPER_V1',
  'GOENCHO_DEVICE_TOKEN_HMAC_KEY_V1',
  'GOENCHO_SESSION_HMAC_KEY_V1',
  'GOENCHO_RECOVERY_CODE_PEPPER_V1',
]);

export function assertRuntimeBindings(env) {
  if (!env?.GOENCHO_DB || typeof env.GOENCHO_DB.prepare !== 'function') {
    fail(503, 'SERVICE_UNAVAILABLE', 'D1 binding is unavailable');
  }
  for (const name of requiredSecrets) {
    if (typeof env[name] !== 'string' || env[name].length < 32) {
      fail(503, 'SERVICE_UNAVAILABLE', 'A required secret is unavailable');
    }
  }
  return true;
}

export function requiredSecretNames() {
  return [...requiredSecrets];
}
