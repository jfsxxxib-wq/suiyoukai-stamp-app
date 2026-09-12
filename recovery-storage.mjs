export const FLOWER_NUMBER_KEY = 'suiyoukai-adventurer-reception-code-v2';
export const PORTAL_DEVICE_KEY = 'suiyoukai-gate-device-v1';

function restoreValue(storage, key, value) {
  if (value === null) storage.removeItem(key);
  else storage.setItem(key, value);
}

export function commitRecoveryStorage(storage, appNumber, deviceToken) {
  if (!/^\d{8}$/.test(appNumber || '') || !/^[0-9a-f]{64}$/.test(deviceToken || '')) throw new Error('invalid_recovery_payload');
  const beforeNumber = storage.getItem(FLOWER_NUMBER_KEY);
  const beforeDevice = storage.getItem(PORTAL_DEVICE_KEY);
  try {
    storage.setItem(FLOWER_NUMBER_KEY, appNumber);
    storage.setItem(PORTAL_DEVICE_KEY, deviceToken);
    if (storage.getItem(FLOWER_NUMBER_KEY) !== appNumber || storage.getItem(PORTAL_DEVICE_KEY) !== deviceToken) throw new Error('storage_readback_failed');
  } catch (error) {
    try {
      restoreValue(storage, FLOWER_NUMBER_KEY, beforeNumber);
      restoreValue(storage, PORTAL_DEVICE_KEY, beforeDevice);
    } catch { throw new Error('storage_rollback_failed'); }
    throw error;
  }
  return { appNumber, deviceToken, replay: beforeNumber === appNumber && beforeDevice === deviceToken };
}
