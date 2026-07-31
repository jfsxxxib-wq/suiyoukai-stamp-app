/**
 * create_draft要求の形式検査、正規化、指紋作成。
 *
 * Googleやスプレッドシートへ接続しない純粋な検証処理とする。
 */

function ttlcHasExactObjectKeys_(value, expectedKeys) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  var actualKeys = Object.keys(value).sort();
  var sortedExpectedKeys = expectedKeys.slice().sort();

  if (actualKeys.length !== sortedExpectedKeys.length) {
    return false;
  }

  for (var index = 0; index < actualKeys.length; index += 1) {
    if (actualKeys[index] !== sortedExpectedKeys[index]) {
      return false;
    }
  }

  return true;
}

function ttlcSha256Hex_(value) {
  if (
    typeof Utilities !== "object" ||
    !Utilities.DigestAlgorithm ||
    !Utilities.Charset ||
    typeof Utilities.computeDigest !== "function"
  ) {
    return {
      ok: false,
      code: "digest_unavailable"
    };
  }

  var digest;
  try {
    digest = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      value,
      Utilities.Charset.UTF_8
    );
  } catch (error) {
    return {
      ok: false,
      code: "digest_unavailable"
    };
  }

  if (!Array.isArray(digest) || digest.length !== 32) {
    return {
      ok: false,
      code: "digest_unavailable"
    };
  }

  var hex = "";
  for (var index = 0; index < digest.length; index += 1) {
    var unsignedByte = (digest[index] + 256) % 256;
    hex += ("0" + unsignedByte.toString(16)).slice(-2);
  }

  return {
    ok: true,
    value: hex
  };
}

function ttlcValidateAndFingerprintCreateDraftRequest(
  request,
  serverActorId
) {
  if (
    !ttlcHasExactObjectKeys_(request, [
      "schemaVersion",
      "environmentId",
      "operation",
      "requestId",
      "payload"
    ])
  ) {
    return {
      ok: false,
      result: "invalid_request",
      code: "invalid_format"
    };
  }

  if (
    request.schemaVersion !== 1 ||
    request.operation !== "create_draft" ||
    !ttlcIsValidEnvironmentId(request.environmentId) ||
    !ttlcIsValidPrefixedUuidV4(request.requestId) ||
    request.requestId.indexOf("req_") !== 0 ||
    !ttlcIsValidTrialTeacherId(serverActorId)
  ) {
    return {
      ok: false,
      result: "invalid_request",
      code: "invalid_format"
    };
  }

  if (
    !ttlcHasExactObjectKeys_(request.payload, ["line1", "line2"])
  ) {
    return {
      ok: false,
      result: "invalid_request",
      code: "invalid_format"
    };
  }

  var textResult = ttlcValidateTwoLineComment(
    request.payload.line1,
    request.payload.line2,
    { requiredBoth: false }
  );

  if (!textResult.ok) {
    return {
      ok: false,
      result: "invalid_request",
      code: textResult.code,
      field: textResult.field
    };
  }

  var normalizedPayload = [
    textResult.line1.value,
    textResult.line2.value
  ];
  var canonicalValue = JSON.stringify([
    request.schemaVersion,
    request.environmentId,
    request.operation,
    serverActorId,
    null,
    null,
    normalizedPayload
  ]);
  var digestResult = ttlcSha256Hex_(canonicalValue);

  if (!digestResult.ok) {
    return {
      ok: false,
      result: "temporary_error",
      code: digestResult.code
    };
  }

  return {
    ok: true,
    requestId: request.requestId,
    requestFingerprint: digestResult.value,
    canonicalValue: canonicalValue,
    normalizedRequest: {
      schemaVersion: request.schemaVersion,
      environmentId: request.environmentId,
      operation: request.operation,
      requestId: request.requestId,
      payload: {
        line1: textResult.line1.value,
        line2: textResult.line2.value
      }
    }
  };
}
