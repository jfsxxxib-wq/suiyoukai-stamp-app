/**
 * 先生2行コメントの純粋なID形式検証。
 */

var TTLC_TRIAL_TEACHER_ID_PATTERN = /^trial-teacher-[0-9]{3}$/;
var TTLC_ENVIRONMENT_ID_PATTERN =
  /^teacher-two-line-comment-phase1-[0-9]{8}-[ABC]$/;
var TTLC_TRIAL_SPREADSHEET_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
var TTLC_PREFIXED_UUID_V4_PATTERN =
  /^(cmt|evt|req|inc)_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function ttlcIsValidTrialTeacherId(value) {
  return (
    typeof value === "string" &&
    TTLC_TRIAL_TEACHER_ID_PATTERN.test(value)
  );
}

function ttlcIsExpectedTrialTeacherId(value, expectedValue) {
  return (
    ttlcIsValidTrialTeacherId(value) &&
    typeof expectedValue === "string" &&
    value === expectedValue
  );
}

function ttlcIsValidEnvironmentId(value) {
  return (
    typeof value === "string" &&
    TTLC_ENVIRONMENT_ID_PATTERN.test(value)
  );
}

function ttlcIsValidTrialSpreadsheetId(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    TTLC_TRIAL_SPREADSHEET_ID_PATTERN.test(value)
  );
}

function ttlcIsValidPrefixedUuidV4(value) {
  return (
    typeof value === "string" &&
    TTLC_PREFIXED_UUID_V4_PATTERN.test(value)
  );
}
