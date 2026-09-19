import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let quote = null;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql[index + 1] ?? '';

    if (lineComment) {
      current += char;
      if (char === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      current += char;
      if (char === '*' && next === '/') {
        current += next;
        index += 1;
        blockComment = false;
      }
      continue;
    }
    if (quote) {
      current += char;
      if (char === quote) {
        if (next === quote) {
          current += next;
          index += 1;
        } else {
          quote = null;
        }
      }
      continue;
    }
    if (char === '-' && next === '-') {
      current += char + next;
      index += 1;
      lineComment = true;
      continue;
    }
    if (char === '/' && next === '*') {
      current += char + next;
      index += 1;
      blockComment = true;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      current += char;
      continue;
    }
    if (char === ';') {
      if (current.trim()) statements.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) statements.push(current.trim());
  return statements;
}

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex').toUpperCase();
}

function assertEqual(actual, expected, code) {
  if (actual !== expected) throw Object.assign(new Error(code), { safeCode: code, classification: 'LOCAL_ASSERTION' });
}

function firstResultRow(response, code, attemptsCode) {
  if (response?.success !== true || !Array.isArray(response?.result) || response.result.length < 1) {
    throw Object.assign(new Error(code), { safeCode: code, classification: 'REMOTE_RESULT_INVALID' });
  }
  const block = response.result[0];
  if (block?.success !== true || !Array.isArray(block?.results) || block.results.length < 1) {
    throw Object.assign(new Error(code), { safeCode: code, classification: 'REMOTE_RESULT_INVALID' });
  }
  if (!Number.isInteger(block.total_attempts) || block.total_attempts !== 1) {
    throw Object.assign(new Error(attemptsCode), {
      safeCode: attemptsCode,
      classification: 'REMOTE_ATTEMPTS_INVALID',
      totalAttempts: Number.isInteger(block.total_attempts) ? block.total_attempts : null,
    });
  }
  return block.results[0];
}

function allStatementsSucceeded(response, expectedCount) {
  return response?.success === true &&
    Array.isArray(response?.result) &&
    response.result.length === expectedCount &&
    response.result.every((item) => item?.success === true);
}

function allStatementAttemptsAreOne(response, expectedCount) {
  return Array.isArray(response?.result) &&
    response.result.length === expectedCount &&
    response.result.every((item) => Number.isInteger(item?.total_attempts) && item.total_attempts === 1);
}

function safeFailure(error, phase) {
  return {
    phase,
    classification: error?.classification ?? 'REMOTE_UNKNOWN',
    http_status: Number.isInteger(error?.httpStatus) ? error.httpStatus : null,
    cloudflare_numeric_codes: Array.isArray(error?.numericCodes)
      ? error.numericCodes.filter((value) => Number.isInteger(value)).slice(0, 8)
      : [],
    client_attempts: Number.isInteger(error?.clientAttempts) ? error.clientAttempts : null,
    total_attempts: Number.isInteger(error?.totalAttempts) ? error.totalAttempts : null,
    safe_code: typeof error?.safeCode === 'string' ? error.safeCode : null,
  };
}

function restoreTimestamp(now) {
  const value = new Date(now);
  if (Number.isNaN(value.getTime())) throw Object.assign(new Error('INVALID_UTC_CLOCK'), { safeCode: 'INVALID_UTC_CLOCK', classification: 'LOCAL_TIME' });
  value.setUTCSeconds(0, 0);
  value.setUTCMinutes(value.getUTCMinutes() - 1);
  return {
    rfc3339: value.toISOString().replace('.000Z', 'Z'),
    unix: Math.floor(value.getTime() / 1000),
  };
}

export async function loadAndValidate({ workspaceRoot }) {
  const manifestPath = resolve(workspaceRoot, 'tools/goencho-gate-b2-c3-1a-write-20260919/manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const migrationPath = resolve(workspaceRoot, manifest.migration_file);
  const sql = await readFile(migrationPath, 'utf8');
  const statements = splitSqlStatements(sql);

  assertEqual(manifest.account_id, '242d67724ca0baef96a00553df0fac35', 'ACCOUNT_MISMATCH');
  assertEqual(manifest.database_name, 'goencho-b2-canary-db-202609', 'DATABASE_NAME_MISMATCH');
  assertEqual(manifest.database_uuid, 'f12fe289-977c-4215-ae73-40aaa34bff97', 'DATABASE_UUID_MISMATCH');
  assertEqual(manifest.binding, 'GOENCHO_DB', 'BINDING_MISMATCH');
  assertEqual(manifest.remote_history_authority, 'schema_meta.version', 'HISTORY_AUTHORITY_MISMATCH');
  assertEqual(manifest.wrangler_d1_migrations_authority, false, 'WRANGLER_HISTORY_MUST_BE_FALSE');
  assertEqual(sha256(sql), manifest.migration_sha256, 'MIGRATION_HASH_MISMATCH');
  assertEqual(statements.length, manifest.expected_statement_count, 'STATEMENT_COUNT_MISMATCH');
  assertEqual(Buffer.byteLength(sql, 'utf8'), 6502, 'MIGRATION_SIZE_MISMATCH');
  assertEqual(/(^|\n)\s*(BEGIN|COMMIT|ROLLBACK)\b/im.test(sql), false, 'TRANSACTION_CONTROL_FORBIDDEN');
  assertEqual((sql.match(/^CREATE TABLE IF NOT EXISTS /gm) ?? []).length, manifest.expected_tables, 'STATIC_TABLE_COUNT_MISMATCH');
  assertEqual((sql.match(/^CREATE INDEX IF NOT EXISTS /gm) ?? []).length, manifest.expected_named_indexes, 'STATIC_INDEX_COUNT_MISMATCH');

  return { manifest, sql, statements };
}

export async function runBootstrapSafely({ workspaceRoot, transport, token, now }) {
  let phase = 'LOCAL_PREFLIGHT';
  let timestamp = null;
  let bootstrapRequests = 0;
  let transportCalls = 0;
  let clientAttempts = 0;

  const safeBase = {
    token_stored: false,
    raw_response_stored: false,
    retry_performed: false,
    restore_performed: false,
    d1_migrations_touched: false,
  };

  try {
    if (typeof transport !== 'function') throw Object.assign(new Error('TRANSPORT_REQUIRED'), { safeCode: 'TRANSPORT_REQUIRED', classification: 'LOCAL_SCOPE' });
    const tokenIsString = typeof token === 'string' && token.length > 0;
    const tokenIsBuffer = Buffer.isBuffer(token) && token.length > 0;
    if (!tokenIsString && !tokenIsBuffer) throw Object.assign(new Error('TOKEN_REQUIRED'), { safeCode: 'TOKEN_REQUIRED', classification: 'AUTH_OR_SCOPE' });
    const { manifest, sql, statements } = await loadAndValidate({ workspaceRoot });
    const path = `/accounts/${manifest.account_id}/d1/database/${manifest.database_uuid}/query`;

    const call = async (purpose, body) => {
      transportCalls += 1;
      try {
        const delivered = await transport({ method: 'POST', path, purpose, token, body });
        const attempts = delivered?.safe_meta?.client_attempts;
        if (Number.isInteger(attempts) && attempts >= 0) clientAttempts += attempts;
        if (attempts !== 1) {
          throw Object.assign(new Error('CLIENT_ATTEMPTS_INVALID'), {
            safeCode: 'CLIENT_ATTEMPTS_INVALID',
            classification: 'REMOTE_ATTEMPTS_INVALID',
            clientAttempts: Number.isInteger(attempts) ? attempts : null,
            clientAttemptsCounted: true,
          });
        }
        return delivered.response;
      } catch (error) {
        if (error?.clientAttemptsCounted !== true && Number.isInteger(error?.clientAttempts) && error.clientAttempts > 0) {
          clientAttempts += error.clientAttempts;
        }
        throw error;
      }
    };

    phase = 'REMOTE_EMPTY_CHECK';
    const preflightSql = "SELECT SUM(CASE WHEN type='table' AND name LIKE '_cf_%' THEN 1 ELSE 0 END) AS cf_internal_tables,SUM(CASE WHEN type='table' AND name LIKE 'sqlite_%' THEN 1 ELSE 0 END) AS sqlite_internal_tables,SUM(CASE WHEN type='table' AND name='d1_migrations' THEN 1 ELSE 0 END) AS d1_migrations_tables,SUM(CASE WHEN type='table' AND name='schema_meta' THEN 1 ELSE 0 END) AS schema_meta_tables,SUM(CASE WHEN type='table' AND name LIKE 'goencho_%' THEN 1 ELSE 0 END) AS goencho_tables,SUM(CASE WHEN type='table' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'sqlite_%' AND name NOT IN ('d1_migrations','schema_meta') AND name NOT LIKE 'goencho_%' THEN 1 ELSE 0 END) AS unexpected_user_tables,SUM(CASE WHEN type='index' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'sqlite_%' THEN 1 ELSE 0 END) AS unexpected_named_indexes,SUM(CASE WHEN type IN ('view','trigger') AND name NOT LIKE '_cf_%' AND name NOT LIKE 'sqlite_%' THEN 1 ELSE 0 END) AS unexpected_user_objects FROM sqlite_schema;";
    const preflight = firstResultRow(await call('REMOTE_EMPTY_CHECK', { sql: preflightSql }), 'PREFLIGHT_RESULT_INVALID', 'PREFLIGHT_TOTAL_ATTEMPTS_INVALID');
    assertEqual(Number(preflight.d1_migrations_tables), 0, 'D1_MIGRATIONS_ALREADY_EXISTS');
    assertEqual(Number(preflight.schema_meta_tables), 0, 'SCHEMA_META_ALREADY_EXISTS');
    assertEqual(Number(preflight.goencho_tables), 0, 'GOENCHO_TABLES_ALREADY_EXIST');
    assertEqual(Number(preflight.unexpected_user_tables), 0, 'UNEXPECTED_USER_TABLES');
    assertEqual(Number(preflight.unexpected_named_indexes), 0, 'UNEXPECTED_NAMED_INDEXES');
    assertEqual(Number(preflight.unexpected_user_objects), 0, 'UNEXPECTED_USER_OBJECTS');

    phase = 'TIMESTAMP_CAPTURE';
    timestamp = restoreTimestamp(now);

    phase = 'BOOTSTRAP_0001';
    bootstrapRequests += 1;
    const bootstrapResponse = await call('BOOTSTRAP_0001', { sql });
    if (!allStatementsSucceeded(bootstrapResponse, statements.length)) {
      throw Object.assign(new Error('BOOTSTRAP_BATCH_NOT_FULLY_SUCCESSFUL'), {
        safeCode: 'BOOTSTRAP_BATCH_NOT_FULLY_SUCCESSFUL',
        classification: 'REMOTE_BATCH_FAILURE',
      });
    }
    if (!allStatementAttemptsAreOne(bootstrapResponse, statements.length)) {
      const observed = bootstrapResponse?.result?.find((item) => item?.total_attempts !== 1)?.total_attempts;
      throw Object.assign(new Error('WRITE_TOTAL_ATTEMPTS_INVALID'), {
        safeCode: 'WRITE_TOTAL_ATTEMPTS_INVALID',
        classification: 'REMOTE_ATTEMPTS_INVALID',
        totalAttempts: Number.isInteger(observed) ? observed : null,
      });
    }

    phase = 'POSTCHECK_SCHEMA';
    const foreignKeys = "(SELECT COUNT(*) FROM pragma_foreign_key_list('goencho_operator_credentials'))+(SELECT COUNT(*) FROM pragma_foreign_key_list('goencho_operator_devices'))+(SELECT COUNT(*) FROM pragma_foreign_key_list('goencho_operator_sessions'))+(SELECT COUNT(*) FROM pragma_foreign_key_list('goencho_operator_recovery_codes'))+(SELECT COUNT(*) FROM pragma_foreign_key_list('goencho_teacher_credentials'))+(SELECT COUNT(*) FROM pragma_foreign_key_list('goencho_teacher_enrollment_tickets'))+(SELECT COUNT(*) FROM pragma_foreign_key_list('goencho_teacher_device_authorizations'))+(SELECT COUNT(*) FROM pragma_foreign_key_list('goencho_teacher_sessions'))+(SELECT COUNT(*) FROM pragma_foreign_key_list('goencho_verified_person_links'))+(SELECT COUNT(*) FROM pragma_foreign_key_list('goencho_match_records'))";
    const expectedIndexes = "'idx_goencho_teacher_device_teacher_status','idx_goencho_operator_session_device_status','idx_goencho_match_teacher_date','idx_goencho_match_teacher_participant'";
    const businessTables = ['goencho_operators','goencho_operator_credentials','goencho_operator_devices','goencho_operator_sessions','goencho_bootstrap_tickets','goencho_operator_recovery_codes','goencho_teachers','goencho_teacher_credentials','goencho_teacher_enrollment_tickets','goencho_teacher_device_authorizations','goencho_teacher_sessions','goencho_auth_attempts','goencho_participants','goencho_verified_person_links','goencho_match_records','goencho_audit_events'];
    const businessRows = businessTables.map((name) => `(SELECT COUNT(*) FROM ${name})`).join('+');
    const postcheckSql = `SELECT (SELECT COUNT(*) FROM sqlite_schema WHERE type='table' AND name LIKE '_cf_%') AS cf_internal_tables,(SELECT COUNT(*) FROM sqlite_schema WHERE type='table' AND name LIKE 'sqlite_%') AS sqlite_internal_tables,(SELECT COUNT(*) FROM sqlite_schema WHERE type='table' AND name='d1_migrations') AS d1_migrations_tables,(SELECT COUNT(*) FROM sqlite_schema WHERE type='table' AND name='schema_meta') AS schema_meta_tables,(SELECT COUNT(*) FROM schema_meta) AS schema_meta_rows,(SELECT COUNT(*) FROM sqlite_schema WHERE type='table' AND name LIKE 'goencho_%') AS goencho_tables,(SELECT COUNT(*) FROM sqlite_schema WHERE type='table' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'sqlite_%' AND name NOT IN ('d1_migrations','schema_meta') AND name NOT LIKE 'goencho_%') AS unexpected_user_tables,(SELECT COUNT(*) FROM sqlite_schema WHERE type='index' AND name IN (${expectedIndexes})) AS named_indexes,(SELECT COUNT(*) FROM sqlite_schema WHERE type='index' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'sqlite_%' AND name NOT IN (${expectedIndexes})) AS unexpected_named_indexes,(SELECT COUNT(*) FROM sqlite_schema WHERE type IN ('view','trigger') AND name NOT LIKE '_cf_%' AND name NOT LIKE 'sqlite_%') AS unexpected_user_objects,(${foreignKeys}) AS foreign_keys,(${businessRows}) AS business_rows,(SELECT version FROM schema_meta LIMIT 1) AS schema_version;`;
    const postcheck = firstResultRow(await call('POSTCHECK_SCHEMA', { sql: postcheckSql }), 'POSTCHECK_RESULT_INVALID', 'POSTCHECK_TOTAL_ATTEMPTS_INVALID');
    assertEqual(Number(postcheck.d1_migrations_tables), 0, 'UNEXPECTED_D1_MIGRATIONS');
    assertEqual(Number(postcheck.schema_meta_tables), 1, 'SCHEMA_META_COUNT_MISMATCH');
    assertEqual(Number(postcheck.schema_meta_rows), 1, 'SCHEMA_META_ROW_COUNT_MISMATCH');
    assertEqual(Number(postcheck.goencho_tables), manifest.expected_tables - 1, 'GOENCHO_TABLE_COUNT_MISMATCH');
    assertEqual(Number(postcheck.unexpected_user_tables), 0, 'UNEXPECTED_USER_TABLES');
    assertEqual(Number(postcheck.named_indexes), manifest.expected_named_indexes, 'INDEX_COUNT_MISMATCH');
    assertEqual(Number(postcheck.unexpected_named_indexes), 0, 'UNEXPECTED_NAMED_INDEXES');
    assertEqual(Number(postcheck.unexpected_user_objects), 0, 'UNEXPECTED_USER_OBJECTS');
    assertEqual(Number(postcheck.foreign_keys), manifest.expected_foreign_keys, 'FOREIGN_KEY_COUNT_MISMATCH');
    assertEqual(Number(postcheck.business_rows), 0, 'BUSINESS_ROWS_NOT_EMPTY');
    assertEqual(Number(postcheck.schema_version), manifest.to_version, 'SCHEMA_VERSION_MISMATCH');

    return {
      ...safeBase,
      status: 'PASS',
      phase: 'COMPLETE_TOKEN_REVOCATION_REQUIRED',
      account_id: manifest.account_id,
      database_name: manifest.database_name,
      database_uuid: manifest.database_uuid,
      binding: manifest.binding,
      migration_name: manifest.migration_name,
      migration_sha256: manifest.migration_sha256,
      restore_timestamp_rfc3339: timestamp.rfc3339,
      restore_timestamp_unix: timestamp.unix,
      transport_calls: transportCalls,
      client_attempts: clientAttempts,
      bootstrap_requests: bootstrapRequests,
      result_counts: { tables: 17, named_indexes: 4, foreign_keys: 15, schema_version: 2 },
      safe_failure: null,
    };
  } catch (error) {
    return {
      ...safeBase,
      status: 'STOPPED',
      phase,
      restore_timestamp_rfc3339: timestamp?.rfc3339 ?? null,
      restore_timestamp_unix: timestamp?.unix ?? null,
      transport_calls: transportCalls,
      client_attempts: clientAttempts,
      bootstrap_requests: bootstrapRequests,
      safe_failure: safeFailure(error, phase),
    };
  }
}
