/**
 * N-01専用の、Googleへ接続しない自己試験。
 */

function ttlcAssertCreateDraftN01_(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function ttlcRunCreateDraftN01SelfTest() {
  var checks = 0;
  var request = {
    schemaVersion: 1,
    environmentId: "teacher-two-line-comment-phase1-20260731-A",
    operation: "create_draft",
    requestId: "req_50f03e1d-aaba-450c-935b-c8ed7895aca8",
    payload: {
      line1: "  囲碁のお知らせ  ",
      line2: "続きを入力してください"
    }
  };
  var fingerprintResult =
    ttlcValidateAndFingerprintCreateDraftRequest(
      request,
      "trial-teacher-001"
    );

  ttlcAssertCreateDraftN01_(
    fingerprintResult.ok &&
      /^[0-9a-f]{64}$/.test(fingerprintResult.requestFingerprint),
    "Valid create_draft request must produce a SHA-256 fingerprint"
  );
  checks += 1;

  ttlcAssertCreateDraftN01_(
    fingerprintResult.normalizedRequest.payload.line1 ===
      "囲碁のお知らせ",
    "Fingerprint input must use the normalized comment"
  );
  checks += 1;

  var baseContext = {
    requestId: request.requestId,
    requestFingerprint: fingerprintResult.requestFingerprint,
    serverNow: "2026-07-31T17:00:00+09:00",
    serverTeacherId: "trial-teacher-001",
    processedRequestResults: [],
    openComments: []
  };

  ttlcAssertCreateDraftN01_(
    ttlcDecideCreateDraftN01(baseContext).decision === "create_draft",
    "No existing row must continue to create_draft"
  );
  checks += 1;

  var draftContext = {
    requestId: baseContext.requestId,
    requestFingerprint: baseContext.requestFingerprint,
    serverNow: baseContext.serverNow,
    serverTeacherId: baseContext.serverTeacherId,
    processedRequestResults: [],
    openComments: [
      {
        teacherId: "trial-teacher-001",
        commentId: "cmt_11111111-1111-4111-8111-111111111111",
        versionNo: 2,
        status: "draft"
      }
    ]
  };
  var draftDecision = ttlcDecideCreateDraftN01(draftContext);
  ttlcAssertCreateDraftN01_(
    draftDecision.decision === "persist_existing_comment" &&
      draftDecision.response.result === "existing_comment" &&
      draftDecision.requestResult.result === "existing_comment",
    "One draft must return an existing_comment result to persist"
  );
  checks += 1;

  ttlcAssertCreateDraftN01_(
    Object.keys(draftDecision.response.data).sort().join(",") ===
      "commentId,status,versionNo",
    "existing_comment response must use the three-item allowlist"
  );
  checks += 1;

  var duplicateContext = {
    requestId: baseContext.requestId,
    requestFingerprint: baseContext.requestFingerprint,
    serverNow: baseContext.serverNow,
    serverTeacherId: baseContext.serverTeacherId,
    processedRequestResults: [
      {
        requestFingerprint: baseContext.requestFingerprint,
        operation: "create_draft",
        result: "accepted",
        commentId: "cmt_22222222-2222-4222-8222-222222222222",
        versionNo: 1,
        status: "draft",
        processedAt: baseContext.serverNow
      }
    ],
    openComments: draftContext.openComments.concat([
      {
        teacherId: "trial-teacher-001",
        commentId: "cmt_33333333-3333-4333-8333-333333333333",
        versionNo: 1,
        status: "pending_review"
      }
    ])
  };
  var duplicateDecision = ttlcDecideCreateDraftN01(
    duplicateContext
  );
  ttlcAssertCreateDraftN01_(
    duplicateDecision.decision === "duplicate" &&
      duplicateDecision.response.data.originalResult === "accepted",
    "duplicate must be decided before open-comment count"
  );
  checks += 1;

  var invalidReuseContext = {
    requestId: duplicateContext.requestId,
    requestFingerprint: duplicateContext.requestFingerprint,
    serverNow: duplicateContext.serverNow,
    serverTeacherId: duplicateContext.serverTeacherId,
    processedRequestResults: [
      {
        requestFingerprint:
          "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        operation: "create_draft",
        result: "accepted",
        commentId: "cmt_22222222-2222-4222-8222-222222222222",
        versionNo: 1,
        status: "draft",
        processedAt: baseContext.serverNow
      }
    ],
    openComments: duplicateContext.openComments
  };
  ttlcAssertCreateDraftN01_(
    ttlcDecideCreateDraftN01(invalidReuseContext).decision ===
      "invalid_request",
    "different fingerprint must be rejected before open-comment count"
  );
  checks += 1;

  var multipleOpenContext = {
    requestId: baseContext.requestId,
    requestFingerprint: baseContext.requestFingerprint,
    serverNow: baseContext.serverNow,
    serverTeacherId: baseContext.serverTeacherId,
    processedRequestResults: [],
    openComments: duplicateContext.openComments
  };
  var multipleOpenDecision = ttlcDecideCreateDraftN01(
    multipleOpenContext
  );
  ttlcAssertCreateDraftN01_(
    multipleOpenDecision.decision === "integrity_stop" &&
      multipleOpenDecision.reasonCode === "multiple_open_comments" &&
      multipleOpenDecision.incident.detected_count === 2,
    "Multiple open comments must stop safely"
  );
  checks += 1;

  var multipleRequestContext = {
    requestId: baseContext.requestId,
    requestFingerprint: baseContext.requestFingerprint,
    serverNow: baseContext.serverNow,
    serverTeacherId: baseContext.serverTeacherId,
    processedRequestResults: [
      invalidReuseContext.processedRequestResults[0],
      duplicateContext.processedRequestResults[0]
    ],
    openComments: []
  };
  var multipleRequestDecision = ttlcDecideCreateDraftN01(
    multipleRequestContext
  );
  ttlcAssertCreateDraftN01_(
    multipleRequestDecision.decision === "integrity_stop" &&
      multipleRequestDecision.reasonCode ===
        "multiple_request_results" &&
      multipleRequestDecision.incident.request_fingerprint === null &&
      multipleRequestDecision.incident.operation === null,
    "Multiple request results must stop without selecting one"
  );
  checks += 1;

  var mismatchedTeacherContext = {
    requestId: baseContext.requestId,
    requestFingerprint: baseContext.requestFingerprint,
    serverNow: baseContext.serverNow,
    serverTeacherId: baseContext.serverTeacherId,
    processedRequestResults: [],
    openComments: [
      {
        teacherId: "trial-teacher-999",
        commentId: "cmt_44444444-4444-4444-8444-444444444444",
        versionNo: 4,
        status: "draft"
      }
    ]
  };
  var mismatchedTeacherDecision = ttlcDecideCreateDraftN01(
    mismatchedTeacherContext
  );
  ttlcAssertCreateDraftN01_(
    mismatchedTeacherDecision.decision === "temporary_error" &&
      !Object.prototype.hasOwnProperty.call(
        mismatchedTeacherDecision.response,
        "data"
      ),
    "Teacher mismatch must not disclose existing comment data"
  );
  checks += 1;

  var approvedOnlyContext = {
    requestId: baseContext.requestId,
    requestFingerprint: baseContext.requestFingerprint,
    serverNow: baseContext.serverNow,
    serverTeacherId: baseContext.serverTeacherId,
    processedRequestResults: [],
    openComments: [
      {
        teacherId: "trial-teacher-001",
        commentId: "cmt_55555555-5555-4555-8555-555555555555",
        versionNo: 5,
        status: "approved"
      }
    ]
  };
  ttlcAssertCreateDraftN01_(
    ttlcDecideCreateDraftN01(approvedOnlyContext).decision ===
      "create_draft",
    "Approved comment alone must not block a new draft"
  );
  checks += 1;

  return {
    ok: true,
    checks: checks
  };
}

function runCreateDraftN01SelfTest() {
  var result = ttlcRunCreateDraftN01SelfTest();

  if (typeof Logger === "object" && typeof Logger.log === "function") {
    Logger.log(JSON.stringify(result));
  }

  return result;
}
