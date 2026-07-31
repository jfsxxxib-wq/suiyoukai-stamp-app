/**
 * N-01で使用する安全なAPI返却の組み立て。
 *
 * 内部例外、接続先、シート情報、本文、履歴は受け取らず返さない。
 */

function ttlcBuildExistingCommentResponse_(context, comment) {
  return {
    schemaVersion: 1,
    result: "existing_comment",
    operation: "create_draft",
    requestId: context.requestId,
    serverNow: context.serverNow,
    data: {
      commentId: comment.commentId,
      versionNo: comment.versionNo,
      status: comment.status
    }
  };
}

function ttlcBuildDuplicateResponse_(context, processedResult) {
  return {
    schemaVersion: 1,
    result: "duplicate",
    operation: "create_draft",
    requestId: context.requestId,
    serverNow: context.serverNow,
    data: {
      originalResult: processedResult.result,
      commentId: processedResult.commentId,
      versionNo: processedResult.versionNo,
      status: processedResult.status
    }
  };
}

function ttlcBuildInvalidRequestResponse_(context) {
  return {
    schemaVersion: 1,
    result: "invalid_request",
    operation: "create_draft",
    requestId: context.requestId,
    serverNow: context.serverNow,
    error: {
      message: "入力内容を確認してください。"
    }
  };
}

function ttlcBuildTemporaryErrorResponse_(context) {
  return {
    schemaVersion: 1,
    result: "temporary_error",
    operation: "create_draft",
    requestId: context.requestId,
    serverNow: context.serverNow,
    error: {
      message:
        "処理結果を確認できませんでした。自動で再送せず、もう一度状態を確認してください。"
    }
  };
}
