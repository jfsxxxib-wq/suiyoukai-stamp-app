"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const trialRoot = path.resolve(__dirname, "..");
const appsScriptRoot = path.join(trialRoot, "apps-script");
const sourceFiles = [
  "TextValidation.gs",
  "IdValidation.gs",
  "EnvironmentGuard.gs",
  "FoundationSelfTest.gs"
];

const context = vm.createContext({
  console,
  Intl,
  Symbol
});

for (const sourceFile of sourceFiles) {
  const sourcePath = path.join(appsScriptRoot, sourceFile);
  const source = fs.readFileSync(sourcePath, "utf8");
  vm.runInContext(source, context, { filename: sourcePath });
}

const casesPath = path.join(__dirname, "validation-cases.json");
const cases = JSON.parse(fs.readFileSync(casesPath, "utf8"));
let passed = 0;
const failures = [];

function check(condition, id, message) {
  if (condition) {
    passed += 1;
    return;
  }

  failures.push({ id, message });
}

for (const testCase of cases.textCases) {
  const result = context.ttlcValidateCommentLine(testCase.input, {
    required: testCase.required
  });
  const expected = testCase.expected;

  check(result.ok === expected.ok, testCase.id, "ok mismatch");
  if (Object.hasOwn(expected, "code")) {
    check(result.code === expected.code, testCase.id, "code mismatch");
  }
  if (Object.hasOwn(expected, "length")) {
    check(result.length === expected.length, testCase.id, "length mismatch");
  }
  if (Object.hasOwn(expected, "value")) {
    check(result.value === expected.value, testCase.id, "value mismatch");
  }
  if (expected.preserveInput) {
    check(
      result.value === testCase.input,
      testCase.id,
      "over-limit input was changed or truncated"
    );
  }
}

for (const testCase of cases.twoLineCases) {
  const result = context.ttlcValidateTwoLineComment(
    testCase.line1,
    testCase.line2,
    { requiredBoth: testCase.requiredBoth }
  );
  const expected = testCase.expected;

  check(result.ok === expected.ok, testCase.id, "ok mismatch");
  if (Object.hasOwn(expected, "field")) {
    check(result.field === expected.field, testCase.id, "field mismatch");
  }
  if (Object.hasOwn(expected, "code")) {
    check(result.code === expected.code, testCase.id, "code mismatch");
  }
}

for (const testCase of cases.idCases) {
  let actual;
  if (testCase.kind === "teacher") {
    actual = context.ttlcIsValidTrialTeacherId(testCase.input);
  } else if (testCase.kind === "expectedTeacher") {
    actual = context.ttlcIsExpectedTrialTeacherId(
      testCase.input,
      testCase.expectedValue
    );
  } else if (testCase.kind === "environment") {
    actual = context.ttlcIsValidEnvironmentId(testCase.input);
  } else if (testCase.kind === "spreadsheet") {
    actual = context.ttlcIsValidTrialSpreadsheetId(testCase.input);
  } else if (testCase.kind === "prefixedUuid") {
    actual = context.ttlcIsValidPrefixedUuidV4(testCase.input);
  } else {
    failures.push({ id: testCase.id, message: "unknown ID case kind" });
    continue;
  }

  check(actual === testCase.expected, testCase.id, "ID result mismatch");
}

for (const testCase of cases.environmentCases) {
  const result = context.ttlcValidateEnvironmentConfig(testCase.config);
  const expected = testCase.expected;

  check(result.ok === expected.ok, testCase.id, "ok mismatch");
  if (Object.hasOwn(expected, "code")) {
    check(result.code === expected.code, testCase.id, "code mismatch");
  }
  if (Object.hasOwn(expected, "field")) {
    check(result.field === expected.field, testCase.id, "field mismatch");
  }
}

const validEnvironmentCase = cases.environmentCases.find(
  (testCase) => testCase.id === "active-valid"
);

for (const testCase of cases.spreadsheetMetadataCases) {
  const result = context.ttlcValidateOpenedSpreadsheetMetadata(
    validEnvironmentCase.config,
    { name: testCase.name }
  );
  const expected = testCase.expected;

  check(result.ok === expected.ok, testCase.id, "ok mismatch");
  if (Object.hasOwn(expected, "code")) {
    check(result.code === expected.code, testCase.id, "code mismatch");
  }
}

try {
  const selfTestResult = context.ttlcRunPureFoundationSelfTest();
  check(selfTestResult.ok === true, "foundation-self-test", "self-test failed");
  check(
    selfTestResult.checks === 17,
    "foundation-self-test",
    "self-test check count mismatch"
  );
} catch (error) {
  failures.push({
    id: "foundation-self-test",
    message: error && error.message ? error.message : String(error)
  });
}

const textValidationSource = fs.readFileSync(
  path.join(appsScriptRoot, "TextValidation.gs"),
  "utf8"
);
const unavailableSegmenterContext = vm.createContext({
  console,
  Intl: {},
  Symbol
});
vm.runInContext(textValidationSource, unavailableSegmenterContext, {
  filename: "TextValidation-without-Intl-Segmenter.gs"
});
const unavailableSegmenterResult =
  unavailableSegmenterContext.ttlcValidateCommentLine("囲碁", {
    required: true
  });
check(
  unavailableSegmenterResult.ok === false &&
    unavailableSegmenterResult.code === "segmentation_unavailable",
  "segmenter-unavailable",
  "missing Intl.Segmenter did not fail safely"
);

function createEnvironmentRuntime(properties, timeZone, spreadsheetName) {
  let openCount = 0;
  const runtime = vm.createContext({
    console,
    Intl,
    Symbol,
    PropertiesService: {
      getScriptProperties() {
        return {
          getProperties() {
            return { ...properties };
          }
        };
      }
    },
    Session: {
      getScriptTimeZone() {
        return timeZone;
      }
    },
    SpreadsheetApp: {
      openById() {
        openCount += 1;
        return {
          getName() {
            return spreadsheetName;
          }
        };
      }
    }
  });

  for (const sourceFile of [
    "IdValidation.gs",
    "EnvironmentGuard.gs"
  ]) {
    const sourcePath = path.join(appsScriptRoot, sourceFile);
    vm.runInContext(fs.readFileSync(sourcePath, "utf8"), runtime, {
      filename: sourcePath
    });
  }

  return {
    runtime,
    getOpenCount() {
      return openCount;
    }
  };
}

const expectedTrialName =
  "【試験専用・本番接続禁止】先生2行コメント 第1段階 シート 2026-07-30";
const validProperties = {
  ENVIRONMENT_STATUS: "ACTIVE",
  ENVIRONMENT_ID: "teacher-two-line-comment-phase1-20260730-A",
  TRIAL_SPREADSHEET_ID: "trialSpreadsheetId_ExampleOnly",
  EXPECTED_SPREADSHEET_NAME: expectedTrialName
};

const inconsistentRuntime = createEnvironmentRuntime(
  { ...validProperties, ENVIRONMENT_STATUS: "INCONSISTENT" },
  "Asia/Tokyo",
  expectedTrialName
);
const inconsistentResult =
  inconsistentRuntime.runtime.ttlcOpenTrialSpreadsheetReadOnly_();
check(
  inconsistentResult.ok === false &&
    inconsistentResult.code === "environment_inactive",
  "guard-inconsistent-result",
  "INCONSISTENT did not stop"
);
check(
  inconsistentRuntime.getOpenCount() === 0,
  "guard-inconsistent-no-open",
  "INCONSISTENT reached SpreadsheetApp.openById"
);

const invalidIdRuntime = createEnvironmentRuntime(
  { ...validProperties, ENVIRONMENT_ID: "production" },
  "Asia/Tokyo",
  expectedTrialName
);
const invalidIdResult =
  invalidIdRuntime.runtime.ttlcOpenTrialSpreadsheetReadOnly_();
check(
  invalidIdResult.ok === false &&
    invalidIdResult.code === "invalid_environment_id",
  "guard-invalid-id-result",
  "invalid environment ID did not stop"
);
check(
  invalidIdRuntime.getOpenCount() === 0,
  "guard-invalid-id-no-open",
  "invalid environment ID reached SpreadsheetApp.openById"
);

const archivedRuntime = createEnvironmentRuntime(
  { ...validProperties, ENVIRONMENT_STATUS: "ARCHIVED" },
  "Asia/Tokyo",
  expectedTrialName
);
const archivedResult =
  archivedRuntime.runtime.ttlcOpenTrialSpreadsheetReadOnly_();
check(
  archivedResult.ok === false &&
    archivedResult.code === "environment_inactive",
  "guard-archived-result",
  "ARCHIVED did not stop"
);
check(
  archivedRuntime.getOpenCount() === 0,
  "guard-archived-no-open",
  "ARCHIVED reached SpreadsheetApp.openById"
);

const validRuntime = createEnvironmentRuntime(
  validProperties,
  "Asia/Tokyo",
  expectedTrialName
);
const validGuardResult =
  validRuntime.runtime.ttlcOpenTrialSpreadsheetReadOnly_();
check(
  validGuardResult.ok === true,
  "guard-valid-result",
  "valid trial configuration was rejected"
);
check(
  validRuntime.getOpenCount() === 1,
  "guard-valid-open-once",
  "valid trial configuration did not open exactly once"
);

const mismatchedNameRuntime = createEnvironmentRuntime(
  validProperties,
  "Asia/Tokyo",
  expectedTrialName + " 別環境"
);
const mismatchedNameResult =
  mismatchedNameRuntime.runtime.ttlcOpenTrialSpreadsheetReadOnly_();
check(
  mismatchedNameResult.ok === false &&
    mismatchedNameResult.code === "spreadsheet_name_mismatch",
  "guard-name-mismatch",
  "opened spreadsheet name mismatch was not rejected"
);

const summary = {
  ok: failures.length === 0,
  assertions: passed + failures.length,
  passed,
  failed: failures.length,
  failures
};

console.log(JSON.stringify(summary, null, 2));

if (!summary.ok) {
  process.exitCode = 1;
}
