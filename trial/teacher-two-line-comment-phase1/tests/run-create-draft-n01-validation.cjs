"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const trialRoot = path.resolve(__dirname, "..");
const appsScriptRoot = path.join(trialRoot, "apps-script");
const sourceFiles = [
  "TextValidation.gs",
  "IdValidation.gs",
  "RequestFingerprint.gs",
  "ApiResponse.gs",
  "CreateDraftDecision.gs",
  "CreateDraftN01SelfTest.gs"
];
const n01SourceFiles = [
  "RequestFingerprint.gs",
  "ApiResponse.gs",
  "CreateDraftDecision.gs",
  "CreateDraftN01SelfTest.gs"
];

const Utilities = {
  DigestAlgorithm: {
    SHA_256: "SHA_256"
  },
  Charset: {
    UTF_8: "UTF_8"
  },
  computeDigest(algorithm, value, charset) {
    if (algorithm !== "SHA_256" || charset !== "UTF_8") {
      throw new Error("Unsupported digest configuration");
    }

    return Array.from(
      crypto.createHash("sha256").update(value, "utf8").digest(),
      (byte) => (byte > 127 ? byte - 256 : byte)
    );
  }
};

const context = vm.createContext({
  console,
  Intl,
  Symbol,
  Utilities
});

for (const sourceFile of sourceFiles) {
  const sourcePath = path.join(appsScriptRoot, sourceFile);
  vm.runInContext(fs.readFileSync(sourcePath, "utf8"), context, {
    filename: sourcePath
  });
}

const casesPath = path.join(__dirname, "n01-cases.json");
const cases = JSON.parse(fs.readFileSync(casesPath, "utf8"));
const results = [];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function record(id, callback) {
  try {
    callback();
    results.push({ id, ok: true });
  } catch (error) {
    results.push({
      id,
      ok: false,
      message: error && error.message ? error.message : String(error)
    });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const testCase of cases.fingerprintCases) {
  record(testCase.id, () => {
    if (testCase.kind === "single") {
      const actual =
        context.ttlcValidateAndFingerprintCreateDraftRequest(
          clone(testCase.request),
          testCase.actorId
        );
      const expected = testCase.expected;

      assert(actual.ok === expected.ok, "ok mismatch");
      if (Object.hasOwn(expected, "result")) {
        assert(actual.result === expected.result, "result mismatch");
      }
      if (Object.hasOwn(expected, "code")) {
        assert(actual.code === expected.code, "code mismatch");
      }
      if (Object.hasOwn(expected, "field")) {
        assert(actual.field === expected.field, "field mismatch");
      }
      if (Object.hasOwn(expected, "normalizedLine1")) {
        assert(
          actual.normalizedRequest.payload.line1 ===
            expected.normalizedLine1,
          "normalized line1 mismatch"
        );
      }
      if (actual.ok) {
        assert(
          /^[0-9a-f]{64}$/.test(actual.requestFingerprint),
          "fingerprint is not lowercase SHA-256 hex"
        );
      }
      return;
    }

    if (testCase.kind === "compare") {
      const left =
        context.ttlcValidateAndFingerprintCreateDraftRequest(
          clone(testCase.requestA),
          testCase.actorIdA
        );
      const right =
        context.ttlcValidateAndFingerprintCreateDraftRequest(
          clone(testCase.requestB),
          testCase.actorIdB
        );
      assert(left.ok && right.ok, "comparison input was rejected");
      assert(
        (left.requestFingerprint === right.requestFingerprint) ===
          testCase.expectedSame,
        "fingerprint comparison mismatch"
      );
      return;
    }

    throw new Error("unknown fingerprint case kind");
  });
}

const validRequest = cases.fingerprintCases.find(
  (testCase) => testCase.id === "FP-01-valid-normalized"
).request;
const fingerprintResult =
  context.ttlcValidateAndFingerprintCreateDraftRequest(
    clone(validRequest),
    "trial-teacher-001"
  );
const matchingFingerprint = fingerprintResult.requestFingerprint;

function resolveRequestResult(name) {
  const value = clone(cases.fixtures.requestResults[name]);
  if (value.requestFingerprint === "MATCH") {
    value.requestFingerprint = matchingFingerprint;
  } else if (value.requestFingerprint === "OTHER") {
    value.requestFingerprint =
      "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
  }
  return value;
}

function buildDecisionContext(testCase) {
  return {
    requestId: validRequest.requestId,
    requestFingerprint: matchingFingerprint,
    serverNow: "2026-07-31T17:00:00+09:00",
    serverTeacherId: "trial-teacher-001",
    processedRequestResults: testCase.processedResults.map(
      resolveRequestResult
    ),
    openComments: testCase.openComments.map((name) =>
      clone(cases.fixtures.comments[name])
    )
  };
}

for (const testCase of cases.decisionCases) {
  record(testCase.id, () => {
    const actual = context.ttlcDecideCreateDraftN01(
      buildDecisionContext(testCase)
    );
    const expected = testCase.expected;

    assert(actual.decision === expected.decision, "decision mismatch");
    if (Object.hasOwn(expected, "responseResult")) {
      assert(
        actual.response.result === expected.responseResult,
        "response result mismatch"
      );
    }
    if (Object.hasOwn(expected, "status")) {
      assert(
        actual.response.data.status === expected.status,
        "status mismatch"
      );
    }
    if (Object.hasOwn(expected, "requestResult")) {
      assert(
        actual.requestResult.result === expected.requestResult,
        "request result mismatch"
      );
    }
    if (Object.hasOwn(expected, "originalResult")) {
      assert(
        actual.response.data.originalResult ===
          expected.originalResult,
        "original result mismatch"
      );
    }
    if (Object.hasOwn(expected, "reasonCode")) {
      assert(
        actual.reasonCode === expected.reasonCode,
        "reason code mismatch"
      );
    }
    if (Object.hasOwn(expected, "responseHasData")) {
      assert(
        Object.hasOwn(actual.response, "data") ===
          expected.responseHasData,
        "response data presence mismatch"
      );
    }
    if (Object.hasOwn(expected, "detectedCommentIds")) {
      assert(
        JSON.stringify(
          actual.incident.detected_comments.map(
            (comment) => comment.comment_id
          )
        ) === JSON.stringify(expected.detectedCommentIds),
        "detected comment order mismatch"
      );
    }
    if (Object.hasOwn(expected, "detectedRequestFingerprints")) {
      assert(
        JSON.stringify(
          actual.incident.detected_request_results.map(
            (row) => row.request_fingerprint
          )
        ) === JSON.stringify(expected.detectedRequestFingerprints),
        "detected request result order mismatch"
      );
    }
    if (Object.hasOwn(expected, "responseDataKeys")) {
      assert(
        JSON.stringify(Object.keys(actual.response.data).sort()) ===
          JSON.stringify(expected.responseDataKeys),
        "response data allowlist mismatch"
      );
    }
    if (Object.hasOwn(expected, "requestResultKeys")) {
      assert(
        JSON.stringify(Object.keys(actual.requestResult).sort()) ===
          JSON.stringify(expected.requestResultKeys),
        "request result allowlist mismatch"
      );
    }

    if (actual.incident) {
      const serializedIncident = JSON.stringify(actual.incident);
      assert(!serializedIncident.includes("line1"), "incident leaked line1");
      assert(!serializedIncident.includes("line2"), "incident leaked line2");
      assert(
        !serializedIncident.includes("spreadsheet"),
        "incident leaked spreadsheet information"
      );
    }
  });
}

record("N01-self-test-11-checks", () => {
  const selfTestResult = context.ttlcRunCreateDraftN01SelfTest();
  assert(selfTestResult.ok === true, "self-test failed");
  assert(selfTestResult.checks === 11, "self-test check count mismatch");
});

record("STATIC-no-google-connection", () => {
  const source = n01SourceFiles
    .map((file) =>
      fs.readFileSync(path.join(appsScriptRoot, file), "utf8")
    )
    .join("\n");
  const forbiddenPatterns = [
    /\bSheets\./,
    /\bSpreadsheetApp\b/,
    /\bPropertiesService\b/,
    /\bLockService\b/,
    /\bUrlFetchApp\b/
  ];

  for (const pattern of forbiddenPatterns) {
    assert(!pattern.test(source), `forbidden integration found: ${pattern}`);
  }
});

record("STATIC-no-write-fallback", () => {
  const source = n01SourceFiles
    .map((file) =>
      fs.readFileSync(path.join(appsScriptRoot, file), "utf8")
    )
    .join("\n");
  const forbiddenWritePatterns = [
    /\.batchUpdate\s*\(/,
    /\.appendRow\s*\(/,
    /\.setValue\s*\(/,
    /\.setValues\s*\(/,
    /\.deleteRow\s*\(/
  ];

  for (const pattern of forbiddenWritePatterns) {
    assert(!pattern.test(source), `write path found: ${pattern}`);
  }
});

const failed = results.filter((result) => !result.ok);
const summary = {
  ok: failed.length === 0,
  tests: results.length,
  passed: results.length - failed.length,
  failed: failed.length,
  failures: failed
};

console.log(JSON.stringify(summary, null, 2));

if (!summary.ok) {
  process.exitCode = 1;
}
