/**
 * 書き込みを伴わない基礎自己試験。
 */

function ttlcAssertFoundation_(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function ttlcRunPureFoundationSelfTest() {
  var checks = 0;

  var textCases = [
    { value: "囲碁", required: true, ok: true, length: 2 },
    { value: "  囲碁  ", required: true, ok: true, length: 2 },
    { value: "😊", required: true, ok: true, length: 1 },
    { value: "🇯🇵", required: true, ok: true, length: 1 },
    { value: "👨‍👩‍👧‍👦", required: true, ok: true, length: 1 },
    { value: "1️⃣", required: true, ok: true, length: 1 },
    { value: "か\u3099", required: true, ok: true, length: 1 },
    { value: "✈️", required: true, ok: true, length: 1 },
    { value: "", required: false, ok: true, length: 0 },
    { value: "", required: true, ok: false, code: "required" },
    { value: "囲碁\nサロン", required: true, ok: false, code: "contains_newline" },
    { value: "囲碁\tサロン", required: true, ok: false, code: "invalid_format" }
  ];

  for (var index = 0; index < textCases.length; index += 1) {
    var textCase = textCases[index];
    var textResult = ttlcValidateCommentLine(textCase.value, {
      required: textCase.required
    });

    ttlcAssertFoundation_(
      textResult.ok === textCase.ok,
      "Text case " + index + " result mismatch"
    );
    if (textCase.ok) {
      ttlcAssertFoundation_(
        textResult.length === textCase.length,
        "Text case " + index + " length mismatch"
      );
    } else {
      ttlcAssertFoundation_(
        textResult.code === textCase.code,
        "Text case " + index + " code mismatch"
      );
    }
    checks += 1;
  }

  var validUuid = "cmt_3f15de91-4eac-4a44-80c1-16e7e569f546";
  ttlcAssertFoundation_(
    ttlcIsValidTrialTeacherId("trial-teacher-001"),
    "Trial teacher ID must be valid"
  );
  checks += 1;
  ttlcAssertFoundation_(
    ttlcIsValidEnvironmentId(
      "teacher-two-line-comment-phase1-20260730-A"
    ),
    "Environment ID must be valid"
  );
  checks += 1;
  ttlcAssertFoundation_(
    ttlcIsValidPrefixedUuidV4(validUuid),
    "Prefixed UUIDv4 must be valid"
  );
  checks += 1;

  var config = {
    environmentStatus: "ACTIVE",
    environmentId: "teacher-two-line-comment-phase1-20260730-A",
    trialSpreadsheetId: "trialSpreadsheetId_ExampleOnly",
    expectedSpreadsheetName:
      "【試験専用・本番接続禁止】先生2行コメント 第1段階 シート 2026-07-30",
    scriptTimeZone: "Asia/Tokyo"
  };
  ttlcAssertFoundation_(
    ttlcValidateEnvironmentConfig(config).ok,
    "Trial environment configuration must be valid"
  );
  checks += 1;

  var stoppedConfig = {
    environmentStatus: "INCONSISTENT",
    environmentId: config.environmentId,
    trialSpreadsheetId: config.trialSpreadsheetId,
    expectedSpreadsheetName: config.expectedSpreadsheetName,
    scriptTimeZone: config.scriptTimeZone
  };
  var stoppedResult = ttlcValidateEnvironmentConfig(stoppedConfig);
  ttlcAssertFoundation_(
    !stoppedResult.ok && stoppedResult.code === "environment_inactive",
    "INCONSISTENT environment must stop"
  );
  checks += 1;

  return {
    ok: true,
    checks: checks
  };
}

function runFoundationSelfTest() {
  var result = ttlcRunPureFoundationSelfTest();

  if (typeof Logger === "object" && typeof Logger.log === "function") {
    Logger.log(JSON.stringify(result));
  }

  return result;
}

function runEnvironmentGuardReadOnlySelfTest() {
  var result = ttlcOpenTrialSpreadsheetReadOnly_();

  if (typeof Logger === "object" && typeof Logger.log === "function") {
    Logger.log(JSON.stringify(result));
  }

  return result;
}
