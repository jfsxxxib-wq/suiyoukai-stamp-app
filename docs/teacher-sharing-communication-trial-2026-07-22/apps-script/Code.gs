const TRIAL_PROPERTY_PREFIX = "teacherSharingTimeoutTrial20260723:";
const TEST_RUN_ID_PREFIX = "pages-gas-trial-";
const RESPONSE_DELAY_MS = 20000;
const LOCK_WAIT_MS = 5000;
const MAX_BODY_LENGTH = 4096;
const DELETE_PREPARATION_TTL_MS = 10 * 60 * 1000;
const CLEANUP_TEST_RUN_ID = "pages-gas-trial-20260722-A";
const CLEANUP_CONFIRMATION_TOKEN = "";

function doPost(e) {
  try {
    const raw = e && e.postData && typeof e.postData.contents === "string"
      ? e.postData.contents
      : "";
    if (!raw || raw.length > MAX_BODY_LENGTH) return jsonOutput_(invalidRequest_());

    let payload;
    try {
      payload = JSON.parse(raw);
    } catch (error) {
      return jsonOutput_(invalidRequest_());
    }
    if (!isValidTrialPayload_(payload)) return jsonOutput_(invalidRequest_());

    const lock = LockService.getScriptLock();
    if (!lock.tryLock(LOCK_WAIT_MS)) return jsonOutput_({ result: "temporary_error" });

    let response;
    try {
      response = acceptOnce_(payload);
    } finally {
      lock.releaseLock();
    }

    if (payload.recordId === "trial-record-003") {
      Utilities.sleep(RESPONSE_DELAY_MS);
    }
    return jsonOutput_(response);
  } catch (error) {
    return jsonOutput_({ result: "temporary_error" });
  }
}

function acceptOnce_(payload) {
  const properties = PropertiesService.getScriptProperties();
  const key = recordKey_(payload.testRunId, payload.recordId);
  const existing = properties.getProperty(key);
  if (existing !== null) {
    return acceptedResponse_(payload.recordId, false, true, countRecords_(properties, payload.testRunId));
  }

  properties.setProperty(key, JSON.stringify({
    testRunId: payload.testRunId,
    recordId: payload.recordId,
    deviceId: payload.deviceId,
    firstRequestId: payload.requestId,
    firstReceivedAt: new Date().toISOString()
  }));
  return acceptedResponse_(payload.recordId, true, false, countRecords_(properties, payload.testRunId));
}

function acceptedResponse_(recordId, stored, duplicate, storedCount) {
  return {
    result: "accepted",
    recordId: recordId,
    stored: stored,
    duplicate: duplicate,
    storedCount: storedCount
  };
}

function invalidRequest_() {
  return { result: "invalid_request" };
}

function isValidTrialPayload_(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;
  if (payload.schemaVersion !== 1) return false;
  if (!safeToken_(payload.testRunId, 64) || !payload.testRunId.startsWith(TEST_RUN_ID_PREFIX)) return false;
  if (!safeToken_(payload.requestId, 64)) return false;
  if (!safeToken_(payload.recordId, 64) || !payload.recordId.startsWith("trial-record-")) return false;
  if (!safeToken_(payload.deviceId, 64) || !payload.deviceId.startsWith("trial-device-")) return false;
  if (typeof payload.sentAt !== "string" || payload.sentAt.length > 40 || Number.isNaN(Date.parse(payload.sentAt))) return false;
  return Object.keys(payload).every((key) => [
    "schemaVersion", "testRunId", "requestId", "recordId", "deviceId", "sentAt"
  ].includes(key));
}

function safeToken_(value, maxLength) {
  return typeof value === "string"
    && value.length > 0
    && value.length <= maxLength
    && /^[A-Za-z0-9_-]+$/.test(value);
}

function recordKey_(testRunId, recordId) {
  return namespacePrefix_(testRunId) + "record:" + recordId;
}

function namespacePrefix_(testRunId) {
  return TRIAL_PROPERTY_PREFIX + testRunId + ":";
}

function countRecords_(properties, testRunId) {
  const prefix = namespacePrefix_(testRunId) + "record:";
  return Object.keys(properties.getProperties()).filter((key) => key.startsWith(prefix)).length;
}

function jsonOutput_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Apps Scriptエディターから実行する削除準備関数。
 * 対象キーを一覧にして確認用トークンを返す。Web APIからは呼び出さない。
 */
function prepareTrialDeletion(testRunId) {
  assertTestRunId_(testRunId);
  const keys = trialKeys_(testRunId);
  const token = Utilities.getUuid();
  PropertiesService.getUserProperties().setProperty("trialDeletionPreparation", JSON.stringify({
    testRunId: testRunId,
    keys: keys,
    token: token,
    expiresAt: Date.now() + DELETE_PREPARATION_TTL_MS
  }));
  console.log(JSON.stringify({ testRunId: testRunId, keys: keys }, null, 2));
  return { testRunId: testRunId, keys: keys, confirmationToken: token };
}

/**
 * エディターの「実行」から使う入口。実行ログで対象キーとトークンを確認する。
 */
function prepareConfiguredTrialDeletion() {
  return prepareTrialDeletion(CLEANUP_TEST_RUN_ID);
}

/**
 * prepareTrialDeletionの一覧を人が確認した後、同じtestRunIdとトークンで実行する。
 */
function deletePreparedTrialData(testRunId, confirmationToken) {
  assertTestRunId_(testRunId);
  const userProperties = PropertiesService.getUserProperties();
  const preparedRaw = userProperties.getProperty("trialDeletionPreparation");
  if (!preparedRaw) throw new Error("削除準備がありません。");
  const prepared = JSON.parse(preparedRaw);
  if (prepared.testRunId !== testRunId || prepared.token !== confirmationToken || Date.now() > prepared.expiresAt) {
    throw new Error("削除準備が一致しないか、期限切れです。");
  }

  const currentKeys = trialKeys_(testRunId);
  if (JSON.stringify(currentKeys) !== JSON.stringify(prepared.keys)) {
    throw new Error("一覧確認後に対象キーが変化しました。もう一度一覧を確認してください。");
  }

  const properties = PropertiesService.getScriptProperties();
  currentKeys.forEach((key) => properties.deleteProperty(key));
  userProperties.deleteProperty("trialDeletionPreparation");
  return { deletedTestRunId: testRunId, deletedCount: currentKeys.length };
}

/**
 * 一覧確認後、ログのトークンをCLEANUP_CONFIRMATION_TOKENへ一時入力して実行する。
 * 空欄のままでは削除しない。
 */
function deleteConfiguredTrialData() {
  if (!CLEANUP_CONFIRMATION_TOKEN) throw new Error("確認トークンが未入力です。");
  return deletePreparedTrialData(CLEANUP_TEST_RUN_ID, CLEANUP_CONFIRMATION_TOKEN);
}

function trialKeys_(testRunId) {
  const prefix = namespacePrefix_(testRunId);
  return Object.keys(PropertiesService.getScriptProperties().getProperties())
    .filter((key) => key.startsWith(prefix))
    .sort();
}

function assertTestRunId_(testRunId) {
  if (!safeToken_(testRunId, 64) || !testRunId.startsWith(TEST_RUN_ID_PREFIX)) {
    throw new Error("試験用testRunIdではありません。");
  }
}
