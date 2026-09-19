import {
  FIXED_ENDPOINT,
  FIXED_TARGET,
  READONLY_EMPTY_CHECK_SQL,
  SAFE_COUNT_KEYS,
  assertFixedTarget,
} from './scope.mjs';

function safeFailure(error, phase, transportMeta = null) {
  return {
    phase,
    classification: error?.classification ?? 'REMOTE_UNKNOWN',
    http_status: Number.isInteger(error?.httpStatus)
      ? error.httpStatus
      : (Number.isInteger(transportMeta?.http_status) ? transportMeta.http_status : null),
    safe_code: typeof error?.safeCode === 'string' ? error.safeCode : null,
    client_requests: Number.isInteger(error?.clientRequests)
      ? error.clientRequests
      : (Number.isInteger(transportMeta?.client_requests) ? transportMeta.client_requests : 0),
    client_retry: transportMeta?.client_retry === true,
    total_attempts: Number.isInteger(error?.totalAttempts) ? error.totalAttempts : null,
  };
}

function stop(code, classification, totalAttempts = null) {
  throw Object.assign(new Error(code), {
    safeCode: code,
    classification,
    totalAttempts,
  });
}

function validateTransportResult(value) {
  if (value?.response?.success !== true || !Array.isArray(value?.response?.result) || value.response.result.length !== 1) {
    stop('READONLY_RESULT_INVALID', 'REMOTE_RESULT_INVALID');
  }
  if (value?.safe_meta?.client_requests !== 1 || value?.safe_meta?.client_retry !== false) {
    stop('CLIENT_REQUEST_INVARIANT', 'CLIENT_REQUEST_LIMIT');
  }
  const item = value.response.result[0];
  if (item?.success !== true || item.counts === null || typeof item.counts !== 'object' || Array.isArray(item.counts)) {
    stop('READONLY_RESULT_INVALID', 'REMOTE_RESULT_INVALID');
  }

  const totalAttempts = item.total_attempts;
  if (!Number.isInteger(totalAttempts) || totalAttempts < 1 || totalAttempts > 3) {
    stop('TOTAL_ATTEMPTS_INVALID', 'REMOTE_RESULT_INVALID');
  }
  if (totalAttempts > 1) {
    stop('CLOUDFLARE_INTERNAL_RETRY', 'CLOUDFLARE_INTERNAL_RETRY', totalAttempts);
  }

  const counts = {};
  for (const key of SAFE_COUNT_KEYS) {
    const valueForKey = item.counts[key];
    if (!Number.isInteger(valueForKey) || valueForKey < 0) {
      stop('SAFE_COUNT_INVALID', 'REMOTE_RESULT_INVALID', totalAttempts);
    }
    counts[key] = valueForKey;
  }
  for (const key of Object.keys(item.counts)) {
    if (!SAFE_COUNT_KEYS.includes(key)) stop('UNEXPECTED_RESULT_FIELD', 'REMOTE_RESULT_INVALID', totalAttempts);
  }

  for (const [key, code] of [
    ['d1_migrations_tables', 'D1_MIGRATIONS_ALREADY_EXISTS'],
    ['schema_meta_tables', 'SCHEMA_META_ALREADY_EXISTS'],
    ['goencho_tables', 'GOENCHO_TABLES_ALREADY_EXIST'],
    ['unexpected_user_tables', 'UNEXPECTED_USER_TABLES'],
    ['unexpected_named_indexes', 'UNEXPECTED_NAMED_INDEXES'],
    ['unexpected_user_objects', 'UNEXPECTED_USER_OBJECTS'],
  ]) {
    if (counts[key] !== 0) stop(code, 'REMOTE_DATABASE_NOT_EMPTY', totalAttempts);
  }
  return { counts, totalAttempts };
}

export async function runReadOnlyEmptyCheck({ transport, tokenBuffer, target = FIXED_TARGET }) {
  let phase = 'LOCAL_TARGET_PREFLIGHT';
  let transportMeta = null;
  try {
    assertFixedTarget(target);
    if (typeof transport !== 'function') stop('TRANSPORT_REQUIRED', 'LOCAL_PROCESS_OR_CONFIG');
    if (!Buffer.isBuffer(tokenBuffer) || tokenBuffer.length < 1) stop('TOKEN_REQUIRED', 'AUTH_OR_SCOPE');

    phase = 'REMOTE_EMPTY_CHECK';
    const value = await transport({
      method: 'POST',
      endpoint: FIXED_ENDPOINT,
      tokenBuffer,
      body: { sql: READONLY_EMPTY_CHECK_SQL },
    });
    transportMeta = value?.safe_meta ?? null;
    const checked = validateTransportResult(value);

    return {
      status: 'PASS',
      phase: 'COMPLETE_TOKEN_REVOCATION_REQUIRED',
      account_id: FIXED_TARGET.account_id,
      database_name: FIXED_TARGET.database_name,
      database_uuid: FIXED_TARGET.database_uuid,
      binding: FIXED_TARGET.binding,
      http_status: transportMeta.http_status,
      client_requests: 1,
      client_retry: false,
      total_attempts: checked.totalAttempts,
      counts: checked.counts,
      token_stored: false,
      raw_response_stored: false,
      migration_loaded: false,
      write_performed: false,
    };
  } catch (error) {
    return {
      status: 'STOPPED',
      phase,
      safe_failure: safeFailure(error, phase, transportMeta),
      token_stored: false,
      raw_response_stored: false,
      migration_loaded: false,
      write_performed: false,
    };
  }
}
