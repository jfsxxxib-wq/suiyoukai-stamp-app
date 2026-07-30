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
  const response = {
    properties: {
      title: testCase.name
    }
  };
  const result = context.ttlcValidateSpreadsheetMetadataResponse(
    validEnvironmentCase.config,
    response
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

function buildEnvironmentRuntime(properties, timeZone, responseOrError) {
  const calls = [];
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
    Sheets: {
      Spreadsheets: {
        get(spreadsheetId, options) {
          calls.push({ spreadsheetId, options });
          if (responseOrError instanceof Error) {
            throw responseOrError;
          }
          return responseOrError;
        }
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
    getCalls() {
      return calls.slice();
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

const validMetadataResponse = {
  properties: {
    title: expectedTrialName
  }
};

const inconsistentRuntime = buildEnvironmentRuntime(
  { ...validProperties, ENVIRONMENT_STATUS: "INCONSISTENT" },
  "Asia/Tokyo",
  validMetadataResponse
);
const inconsistentResult =
  inconsistentRuntime.runtime.ttlcGetTrialSpreadsheetMetadataReadOnly_();
check(
  inconsistentResult.ok === false &&
    inconsistentResult.code === "environment_inactive",
  "guard-inconsistent-result",
  "INCONSISTENT did not stop"
);
check(
  inconsistentRuntime.getCalls().length === 0,
  "guard-inconsistent-no-read",
  "INCONSISTENT reached Sheets.Spreadsheets.get"
);

const invalidIdRuntime = buildEnvironmentRuntime(
  { ...validProperties, ENVIRONMENT_ID: "production" },
  "Asia/Tokyo",
  validMetadataResponse
);
const invalidIdResult =
  invalidIdRuntime.runtime.ttlcGetTrialSpreadsheetMetadataReadOnly_();
check(
  invalidIdResult.ok === false &&
    invalidIdResult.code === "invalid_environment_id",
  "guard-invalid-id-result",
  "invalid environment ID did not stop"
);
check(
  invalidIdRuntime.getCalls().length === 0,
  "guard-invalid-id-no-read",
  "invalid environment ID reached Sheets.Spreadsheets.get"
);

const archivedRuntime = buildEnvironmentRuntime(
  { ...validProperties, ENVIRONMENT_STATUS: "ARCHIVED" },
  "Asia/Tokyo",
  validMetadataResponse
);
const archivedResult =
  archivedRuntime.runtime.ttlcGetTrialSpreadsheetMetadataReadOnly_();
check(
  archivedResult.ok === false &&
    archivedResult.code === "environment_inactive",
  "guard-archived-result",
  "ARCHIVED did not stop"
);
check(
  archivedRuntime.getCalls().length === 0,
  "guard-archived-no-read",
  "ARCHIVED reached Sheets.Spreadsheets.get"
);

const missingPropertyRuntime = buildEnvironmentRuntime(
  {
    ENVIRONMENT_STATUS: validProperties.ENVIRONMENT_STATUS,
    ENVIRONMENT_ID: validProperties.ENVIRONMENT_ID,
    EXPECTED_SPREADSHEET_NAME: validProperties.EXPECTED_SPREADSHEET_NAME
  },
  "Asia/Tokyo",
  validMetadataResponse
);
const missingPropertyResult =
  missingPropertyRuntime.runtime.ttlcGetTrialSpreadsheetMetadataReadOnly_();
check(
  missingPropertyResult.ok === false &&
    missingPropertyResult.code === "invalid_environment_config" &&
    missingPropertyResult.field === "trialSpreadsheetId",
  "guard-missing-property-result",
  "missing spreadsheet ID did not stop"
);
check(
  missingPropertyRuntime.getCalls().length === 0,
  "guard-missing-property-no-read",
  "missing spreadsheet ID reached Sheets.Spreadsheets.get"
);

const invalidSpreadsheetIdRuntime = buildEnvironmentRuntime(
  { ...validProperties, TRIAL_SPREADSHEET_ID: "invalid id" },
  "Asia/Tokyo",
  validMetadataResponse
);
const invalidSpreadsheetIdResult =
  invalidSpreadsheetIdRuntime.runtime.ttlcGetTrialSpreadsheetMetadataReadOnly_();
check(
  invalidSpreadsheetIdResult.ok === false &&
    invalidSpreadsheetIdResult.code === "invalid_spreadsheet_id",
  "guard-invalid-spreadsheet-id-result",
  "invalid spreadsheet ID did not stop"
);
check(
  invalidSpreadsheetIdRuntime.getCalls().length === 0,
  "guard-invalid-spreadsheet-id-no-read",
  "invalid spreadsheet ID reached Sheets.Spreadsheets.get"
);

const validRuntime = buildEnvironmentRuntime(
  validProperties,
  "Asia/Tokyo",
  validMetadataResponse
);
const validGuardResult =
  validRuntime.runtime.ttlcGetTrialSpreadsheetMetadataReadOnly_();
check(
  validGuardResult.ok === true,
  "guard-valid-result",
  "valid trial configuration was rejected"
);
const validCalls = validRuntime.getCalls();
check(
  validCalls.length === 1,
  "guard-valid-read-once",
  "valid trial configuration did not read exactly once"
);
check(
  validCalls[0] &&
    validCalls[0].spreadsheetId === validProperties.TRIAL_SPREADSHEET_ID,
  "guard-valid-spreadsheet-id",
  "unexpected spreadsheet ID was passed"
);
check(
  validCalls[0] &&
    validCalls[0].options &&
    validCalls[0].options.fields === "properties.title",
  "guard-valid-fields",
  "metadata request did not limit fields to properties.title"
);

const mismatchedNameRuntime = buildEnvironmentRuntime(
  validProperties,
  "Asia/Tokyo",
  {
    properties: {
      title: expectedTrialName + " 別環境"
    }
  }
);
const mismatchedNameResult =
  mismatchedNameRuntime.runtime.ttlcGetTrialSpreadsheetMetadataReadOnly_();
check(
  mismatchedNameResult.ok === false &&
    mismatchedNameResult.code === "spreadsheet_name_mismatch",
  "guard-name-mismatch",
  "opened spreadsheet name mismatch was not rejected"
);

const malformedMetadataCases = [
  {
    id: "guard-response-not-object",
    response: null
  },
  {
    id: "guard-response-array",
    response: []
  },
  {
    id: "guard-response-properties-missing",
    response: {}
  },
  {
    id: "guard-response-properties-array",
    response: { properties: [] }
  },
  {
    id: "guard-response-title-missing",
    response: { properties: {} }
  },
  {
    id: "guard-response-title-empty",
    response: { properties: { title: "" } }
  },
  {
    id: "guard-response-title-non-string",
    response: { properties: { title: 123 } }
  }
];

for (const malformedCase of malformedMetadataCases) {
  const malformedRuntime = buildEnvironmentRuntime(
    validProperties,
    "Asia/Tokyo",
    malformedCase.response
  );
  const malformedResult =
    malformedRuntime.runtime.ttlcGetTrialSpreadsheetMetadataReadOnly_();
  check(
    malformedResult.ok === false &&
      malformedResult.code === "invalid_spreadsheet_metadata",
    malformedCase.id,
    "malformed metadata response was not rejected safely"
  );
}

const exceptionRuntime = buildEnvironmentRuntime(
  validProperties,
  "Asia/Tokyo",
  new Error("simulated API failure")
);
const exceptionResult =
  exceptionRuntime.runtime.ttlcGetTrialSpreadsheetMetadataReadOnly_();
check(
  exceptionResult.ok === false &&
    exceptionResult.code === "spreadsheet_read_failed",
  "guard-api-exception-result",
  "Advanced Sheets Service exception did not fail safely"
);
check(
  exceptionRuntime.getCalls().length === 1,
  "guard-api-exception-read-once",
  "Advanced Sheets Service exception caused an unexpected retry"
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
