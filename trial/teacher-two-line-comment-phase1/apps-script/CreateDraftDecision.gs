/**
 * N-01の判定だけを行う純粋関数。
 *
 * シートの読み書き、ScriptLock、事故記録保存は行わない。
 * 呼び出し側が取得した最小データから、次に行う安全な処理を返す。
 */

function ttlcCopyDetectedRequestResult_(row) {
  return {
    request_fingerprint: row.requestFingerprint,
    operation: row.operation,
    result: row.result,
    comment_id: row.commentId,
    version_no: row.versionNo,
    status: row.status,
    processed_at: row.processedAt
  };
}

function ttlcCompareDetectedRequestResults_(left, right) {
  var stringKeys = [
    "request_fingerprint",
    "operation",
    "result",
    "comment_id"
  ];

  for (var index = 0; index < stringKeys.length; index += 1) {
    var key = stringKeys[index];
    var leftValue = String(left[key]);
    var rightValue = String(right[key]);
    if (leftValue < rightValue) {
      return -1;
    }
    if (leftValue > rightValue) {
      return 1;
    }
  }

  if (left.version_no !== right.version_no) {
    return left.version_no - right.version_no;
  }

  var finalKeys = ["status", "processed_at"];
  for (var finalIndex = 0; finalIndex < finalKeys.length; finalIndex += 1) {
    var finalKey = finalKeys[finalIndex];
    var leftFinal = String(left[finalKey]);
    var rightFinal = String(right[finalKey]);
    if (leftFinal < rightFinal) {
      return -1;
    }
    if (leftFinal > rightFinal) {
      return 1;
    }
  }

  return 0;
}

function ttlcCopyDetectedComment_(comment) {
  return {
    comment_id: comment.commentId,
    status: comment.status,
    version_no: comment.versionNo
  };
}

function ttlcCompareDetectedComments_(left, right) {
  if (left.comment_id < right.comment_id) {
    return -1;
  }
  if (left.comment_id > right.comment_id) {
    return 1;
  }
  return 0;
}

function ttlcBuildMultipleRequestResultsIncident_(context, rows) {
  var detected = [];
  for (var index = 0; index < rows.length; index += 1) {
    detected.push(ttlcCopyDetectedRequestResult_(rows[index]));
  }
  detected.sort(ttlcCompareDetectedRequestResults_);

  return {
    failure_reason_code: "multiple_request_results",
    request_id: context.requestId,
    request_fingerprint: null,
    operation: null,
    comment_id: null,
    detected_count: detected.length,
    detected_request_results: detected
  };
}

function ttlcBuildMultipleOpenCommentsIncident_(context, comments) {
  var detected = [];
  for (var index = 0; index < comments.length; index += 1) {
    detected.push(ttlcCopyDetectedComment_(comments[index]));
  }
  detected.sort(ttlcCompareDetectedComments_);

  return {
    failure_reason_code: "multiple_open_comments",
    request_id: context.requestId,
    request_fingerprint: context.requestFingerprint,
    operation: "create_draft",
    comment_id: null,
    before_version_no: null,
    planned_version_no: null,
    before_snapshot: null,
    planned_snapshot: null,
    before_snapshot_hash: null,
    planned_snapshot_hash: null,
    planned_event_id: null,
    detected_count: detected.length,
    detected_comments: detected
  };
}

function ttlcBuildExistingCommentRequestResult_(context, comment) {
  return {
    schema_version: 1,
    request_id: context.requestId,
    request_fingerprint: context.requestFingerprint,
    operation: "create_draft",
    result: "existing_comment",
    comment_id: comment.commentId,
    version_no: comment.versionNo,
    status: comment.status,
    processed_at: context.serverNow
  };
}

function ttlcDecideCreateDraftN01(context) {
  if (
    context === null ||
    typeof context !== "object" ||
    Array.isArray(context) ||
    !Array.isArray(context.processedRequestResults) ||
    !Array.isArray(context.openComments)
  ) {
    return {
      decision: "temporary_error",
      response: ttlcBuildTemporaryErrorResponse_(context || {
        requestId: "",
        serverNow: ""
      })
    };
  }

  var processedRows = context.processedRequestResults;

  if (processedRows.length > 1) {
    return {
      decision: "integrity_stop",
      reasonCode: "multiple_request_results",
      incident: ttlcBuildMultipleRequestResultsIncident_(
        context,
        processedRows
      ),
      response: ttlcBuildTemporaryErrorResponse_(context)
    };
  }

  if (processedRows.length === 1) {
    var processedResult = processedRows[0];
    if (processedResult.requestFingerprint === context.requestFingerprint) {
      return {
        decision: "duplicate",
        response: ttlcBuildDuplicateResponse_(context, processedResult)
      };
    }

    return {
      decision: "invalid_request",
      response: ttlcBuildInvalidRequestResponse_(context)
    };
  }

  var matchingOpenComments = [];
  for (var index = 0; index < context.openComments.length; index += 1) {
    var comment = context.openComments[index];
    if (
      comment.teacherId !== context.serverTeacherId
    ) {
      return {
        decision: "temporary_error",
        response: ttlcBuildTemporaryErrorResponse_(context)
      };
    }

    if (
      comment.status === "draft" ||
      comment.status === "pending_review"
    ) {
      matchingOpenComments.push(comment);
    }
  }

  if (matchingOpenComments.length > 1) {
    return {
      decision: "integrity_stop",
      reasonCode: "multiple_open_comments",
      incident: ttlcBuildMultipleOpenCommentsIncident_(
        context,
        matchingOpenComments
      ),
      response: ttlcBuildTemporaryErrorResponse_(context)
    };
  }

  if (matchingOpenComments.length === 1) {
    var existingComment = matchingOpenComments[0];
    return {
      decision: "persist_existing_comment",
      requestResult: ttlcBuildExistingCommentRequestResult_(
        context,
        existingComment
      ),
      response: ttlcBuildExistingCommentResponse_(
        context,
        existingComment
      )
    };
  }

  return {
    decision: "create_draft"
  };
}
