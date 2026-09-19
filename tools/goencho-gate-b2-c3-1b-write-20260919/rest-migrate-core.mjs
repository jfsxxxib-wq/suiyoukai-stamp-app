import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const businessTables = [
  'goencho_operators', 'goencho_operator_credentials', 'goencho_operator_devices',
  'goencho_operator_sessions', 'goencho_bootstrap_tickets', 'goencho_operator_recovery_codes',
  'goencho_teachers', 'goencho_teacher_credentials', 'goencho_teacher_enrollment_tickets',
  'goencho_teacher_device_authorizations', 'goencho_teacher_sessions', 'goencho_auth_attempts',
  'goencho_participants', 'goencho_verified_person_links', 'goencho_match_records', 'goencho_audit_events',
];

const baselineIndexes = [
  'idx_goencho_teacher_device_teacher_status',
  'idx_goencho_operator_session_device_status',
  'idx_goencho_match_teacher_date',
  'idx_goencho_match_teacher_participant',
];

const addedColumns = [
  ['goencho_operator_credentials', 'work_factor', 'INTEGER', 0, null],
  ['goencho_operator_credentials', 'parameters_json', 'TEXT', 0, null],
  ['goencho_operator_credentials', 'pepper_key_version', 'TEXT', 1, "'v1'"],
  ['goencho_teacher_credentials', 'work_factor', 'INTEGER', 0, null],
  ['goencho_teacher_credentials', 'parameters_json', 'TEXT', 0, null],
  ['goencho_teacher_credentials', 'pepper_key_version', 'TEXT', 1, "'v1'"],
  ['goencho_bootstrap_tickets', 'last_mutation_id', 'TEXT', 0, null],
  ['goencho_operator_recovery_codes', 'last_mutation_id', 'TEXT', 0, null],
  ['goencho_teacher_enrollment_tickets', 'last_mutation_id', 'TEXT', 0, null],
  ['goencho_teacher_device_authorizations', 'last_mutation_id', 'TEXT', 0, null],
];

const addedIndexes = [
  ['uq_goencho_one_active_owner', 'goencho_operators', 'role'],
  ['uq_goencho_operator_active_credential', 'goencho_operator_credentials', 'operator_id'],
  ['uq_goencho_teacher_active_credential', 'goencho_teacher_credentials', 'teacher_id'],
  ['uq_goencho_teacher_device_active_session', 'goencho_teacher_sessions', 'device_authorization_id'],
];

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
      if (char === '*' && next === '/') { current += next; index += 1; blockComment = false; }
      continue;
    }
    if (quote) {
      current += char;
      if (char === quote) {
        if (next === quote) { current += next; index += 1; } else quote = null;
      }
      continue;
    }
    if (char === '-' && next === '-') { current += char + next; index += 1; lineComment = true; continue; }
    if (char === '/' && next === '*') { current += char + next; index += 1; blockComment = true; continue; }
    if (char === "'" || char === '"') { quote = char; current += char; continue; }
    if (char === ';') { if (current.trim()) statements.push(current.trim()); current = ''; continue; }
    current += char;
  }
  if (current.trim()) statements.push(current.trim());
  return statements;
}

function sha256(text) { return createHash('sha256').update(text, 'utf8').digest('hex').toUpperCase(); }
function sqlList(values) { return values.map((value) => `'${value}'`).join(','); }
function assertEqual(actual, expected, code) {
  if (actual !== expected) throw Object.assign(new Error(code), { safeCode: code, classification: 'LOCAL_ASSERTION' });
}
function assertNumber(row, key, expected, code) { assertEqual(Number(row?.[key]), expected, code); }

function firstResultRow(response, code, attemptsCode) {
  if (response?.success !== true || !Array.isArray(response?.result) || response.result.length !== 1) {
    throw Object.assign(new Error(code), { safeCode: code, classification: 'REMOTE_RESULT_INVALID' });
  }
  const block = response.result[0];
  if (block?.success !== true || !Array.isArray(block?.results) || block.results.length !== 1) {
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

function safeFailure(error, phase) {
  return {
    phase,
    classification: error?.classification ?? 'REMOTE_UNKNOWN',
    http_status: Number.isInteger(error?.httpStatus) ? error.httpStatus : null,
    cloudflare_numeric_codes: Array.isArray(error?.numericCodes) ? error.numericCodes.filter(Number.isInteger).slice(0, 8) : [],
    client_attempts: Number.isInteger(error?.clientAttempts) ? error.clientAttempts : null,
    total_attempts: Number.isInteger(error?.totalAttempts) ? error.totalAttempts : null,
    safe_code: typeof error?.safeCode === 'string' ? error.safeCode : null,
  };
}

function recoveryTimestamp(now) {
  const value = new Date(now);
  if (Number.isNaN(value.getTime())) throw Object.assign(new Error('INVALID_UTC_CLOCK'), { safeCode: 'INVALID_UTC_CLOCK', classification: 'LOCAL_TIME' });
  value.setUTCSeconds(0, 0);
  value.setUTCMinutes(value.getUTCMinutes() - 1);
  return { rfc3339: value.toISOString().replace('.000Z', 'Z'), unix: Math.floor(value.getTime() / 1000) };
}

function countExpression(items, mapper) { return items.map(mapper).join('+'); }

function sharedCheckSql({ after }) {
  const expectedIndexes = after ? [...baselineIndexes, ...addedIndexes.map(([name]) => name)] : baselineIndexes;
  const foreignKeys = countExpression([
    'goencho_operator_credentials', 'goencho_operator_devices', 'goencho_operator_sessions',
    'goencho_operator_recovery_codes', 'goencho_teacher_credentials', 'goencho_teacher_enrollment_tickets',
    'goencho_teacher_device_authorizations', 'goencho_teacher_sessions', 'goencho_verified_person_links',
    'goencho_match_records',
  ], (name) => `(SELECT COUNT(*) FROM pragma_foreign_key_list('${name}'))`);
  const businessRows = countExpression(businessTables, (name) => `(SELECT COUNT(*) FROM ${name})`);
  const totalColumns = countExpression(['schema_meta', ...businessTables], (name) => `(SELECT COUNT(*) FROM pragma_table_info('${name}'))`);
  const addedColumnCount = countExpression(addedColumns, ([table, column]) => `(SELECT COUNT(*) FROM pragma_table_info('${table}') WHERE name='${column}')`);
  const columnShape = countExpression(addedColumns, ([table, column, type, notnull, defaultValue]) => {
    const defaultClause = defaultValue === null ? 'dflt_value IS NULL' : `dflt_value='${defaultValue.replaceAll("'", "''")}'`;
    return `(SELECT COUNT(*) FROM pragma_table_info('${table}') WHERE name='${column}' AND type='${type}' AND \"notnull\"=${notnull} AND ${defaultClause})`;
  });
  const newIndexCount = `(SELECT COUNT(*) FROM sqlite_schema WHERE type='index' AND name IN (${sqlList(addedIndexes.map(([name]) => name))}))`;
  const newIndexShape = countExpression(addedIndexes, ([name, table]) => `(SELECT COUNT(*) FROM pragma_index_list('${table}') WHERE name='${name}' AND \"unique\"=1 AND partial=1)`);
  const newIndexColumns = countExpression(addedIndexes, ([name, , column]) => `(SELECT CASE WHEN COUNT(*)=1 AND SUM(CASE WHEN seqno=0 AND name='${column}' THEN 1 ELSE 0 END)=1 THEN 1 ELSE 0 END FROM pragma_index_info('${name}'))`);
  const newIndexPredicates = countExpression(addedIndexes, ([name]) => `(SELECT COUNT(*) FROM sqlite_schema WHERE type='index' AND name='${name}' AND lower(replace(replace(sql,char(10),' '),char(13),' ')) LIKE '%where status = ''active''%')`);
  return `SELECT (SELECT COUNT(*) FROM sqlite_schema WHERE type='table' AND name LIKE '_cf_%') AS cf_internal_tables,(SELECT COUNT(*) FROM sqlite_schema WHERE type='table' AND name LIKE 'sqlite_%') AS sqlite_internal_tables,(SELECT COUNT(*) FROM sqlite_schema WHERE type='table' AND name='d1_migrations') AS d1_migrations_tables,(SELECT COUNT(*) FROM sqlite_schema WHERE type='table' AND name='schema_meta') AS schema_meta_tables,(SELECT COUNT(*) FROM schema_meta) AS schema_meta_rows,(SELECT version FROM schema_meta LIMIT 1) AS schema_version,(SELECT COUNT(*) FROM sqlite_schema WHERE type='table' AND name LIKE 'goencho_%') AS goencho_tables,(SELECT COUNT(*) FROM sqlite_schema WHERE type='table' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'sqlite_%' AND name NOT IN ('d1_migrations','schema_meta') AND name NOT LIKE 'goencho_%') AS unexpected_user_tables,(SELECT COUNT(*) FROM sqlite_schema WHERE type='index' AND name IN (${sqlList(expectedIndexes)})) AS named_indexes,(SELECT COUNT(*) FROM sqlite_schema WHERE type='index' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'sqlite_%' AND name NOT IN (${sqlList(expectedIndexes)})) AS unexpected_named_indexes,(SELECT COUNT(*) FROM sqlite_schema WHERE type IN ('view','trigger') AND name NOT LIKE '_cf_%' AND name NOT LIKE 'sqlite_%') AS unexpected_user_objects,(${foreignKeys}) AS foreign_keys,(${businessRows}) AS business_rows,(${totalColumns}) AS total_columns,(${addedColumnCount}) AS added_columns,${newIndexCount} AS new_indexes,(${columnShape}) AS column_shape_matches,(${newIndexShape}) AS new_index_shape_matches,(${newIndexColumns}) AS new_index_column_matches,(${newIndexPredicates}) AS new_index_predicate_matches;`;
}

export function buildCheckSql({ after }) {
  if (typeof after !== 'boolean') throw new TypeError('after must be boolean');
  return sharedCheckSql({ after });
}

export async function loadAndValidate({ runnerRoot = import.meta.dirname } = {}) {
  const manifest = JSON.parse(await readFile(resolve(runnerRoot, 'manifest.json'), 'utf8'));
  const sql = await readFile(resolve(runnerRoot, manifest.migration_file), 'utf8');
  const statements = splitSqlStatements(sql);
  assertEqual(manifest.account_id, '242d67724ca0baef96a00553df0fac35', 'ACCOUNT_MISMATCH');
  assertEqual(manifest.database_name, 'goencho-b2-canary-db-202609', 'DATABASE_NAME_MISMATCH');
  assertEqual(manifest.database_uuid, 'f12fe289-977c-4215-ae73-40aaa34bff97', 'DATABASE_UUID_MISMATCH');
  assertEqual(manifest.binding, 'GOENCHO_DB', 'BINDING_MISMATCH');
  assertEqual(manifest.remote_history_authority, 'schema_meta.version', 'HISTORY_AUTHORITY_MISMATCH');
  assertEqual(manifest.wrangler_d1_migrations_authority, false, 'WRANGLER_HISTORY_MUST_BE_FALSE');
  assertEqual(sha256(sql), manifest.migration_sha256, 'MIGRATION_HASH_MISMATCH');
  assertEqual(Buffer.byteLength(sql, 'utf8'), manifest.migration_bytes, 'MIGRATION_SIZE_MISMATCH');
  assertEqual(statements.length, manifest.expected_statement_count, 'STATEMENT_COUNT_MISMATCH');
  assertEqual(/(^|\n)\s*(BEGIN|COMMIT|ROLLBACK)\b/im.test(sql), false, 'TRANSACTION_CONTROL_FORBIDDEN');
  assertEqual(statements.filter((value) => /^ALTER TABLE /i.test(value)).length, 10, 'STATIC_ALTER_COUNT_MISMATCH');
  assertEqual(statements.filter((value) => /^CREATE UNIQUE INDEX IF NOT EXISTS /i.test(value)).length, 4, 'STATIC_INDEX_COUNT_MISMATCH');
  assertEqual(statements.filter((value) => /^UPDATE schema_meta SET version = 3$/i.test(value)).length, 1, 'STATIC_VERSION_UPDATE_MISMATCH');
  for (const [table, column] of addedColumns) {
    assertEqual(statements.some((value) => new RegExp(`^ALTER TABLE ${table} ADD COLUMN ${column}\\b`, 'i').test(value)), true, 'STATIC_COLUMN_TARGET_MISMATCH');
  }
  for (const [name, table, column] of addedIndexes) {
    assertEqual(statements.some((value) => new RegExp(`^CREATE UNIQUE INDEX IF NOT EXISTS ${name}\\s+ON ${table}\\(${column}\\) WHERE status = 'active'$`, 'i').test(value.replace(/\s+/g, ' '))), true, 'STATIC_INDEX_TARGET_MISMATCH');
  }
  return { manifest, sql, statements };
}

export async function runMigrationSafely({ runnerRoot = import.meta.dirname, transport, token, now }) {
  let phase = 'LOCAL_PREFLIGHT';
  let timestamp = null;
  let migrationRequests = 0;
  let transportCalls = 0;
  let clientAttempts = 0;
  const safeBase = { token_stored: false, raw_response_stored: false, retry_performed: false, restore_performed: false, d1_migrations_touched: false };
  try {
    if (typeof transport !== 'function') throw Object.assign(new Error('TRANSPORT_REQUIRED'), { safeCode: 'TRANSPORT_REQUIRED', classification: 'LOCAL_SCOPE' });
    if (!((typeof token === 'string' && token.length > 0) || (Buffer.isBuffer(token) && token.length > 0))) throw Object.assign(new Error('TOKEN_REQUIRED'), { safeCode: 'TOKEN_REQUIRED', classification: 'AUTH_OR_SCOPE' });
    const { manifest, sql, statements } = await loadAndValidate({ runnerRoot });
    const path = `/accounts/${manifest.account_id}/d1/database/${manifest.database_uuid}/query`;
    const call = async (purpose, body) => {
      transportCalls += 1;
      try {
        const delivered = await transport({ method: 'POST', path, purpose, token, body });
        const attempts = delivered?.safe_meta?.client_attempts;
        if (Number.isInteger(attempts) && attempts >= 0) clientAttempts += attempts;
        if (attempts !== 1) throw Object.assign(new Error('CLIENT_ATTEMPTS_INVALID'), { safeCode: 'CLIENT_ATTEMPTS_INVALID', classification: 'REMOTE_ATTEMPTS_INVALID', clientAttempts: Number.isInteger(attempts) ? attempts : null, clientAttemptsCounted: true });
        return delivered.response;
      } catch (error) {
        if (error?.clientAttemptsCounted !== true && Number.isInteger(error?.clientAttempts) && error.clientAttempts > 0) clientAttempts += error.clientAttempts;
        throw error;
      }
    };

    phase = 'REMOTE_0001_STATE_CHECK';
    const preflight = firstResultRow(await call('REMOTE_0001_STATE_CHECK', { sql: sharedCheckSql({ after: false }) }), 'PREFLIGHT_RESULT_INVALID', 'PREFLIGHT_TOTAL_ATTEMPTS_INVALID');
    const prechecks = [
      ['d1_migrations_tables', 0, 'UNEXPECTED_D1_MIGRATIONS'], ['schema_meta_tables', 1, 'SCHEMA_META_COUNT_MISMATCH'],
      ['schema_meta_rows', 1, 'SCHEMA_META_ROW_COUNT_MISMATCH'], ['schema_version', manifest.from_version, 'SCHEMA_VERSION_MISMATCH'],
      ['goencho_tables', manifest.expected_goencho_tables, 'GOENCHO_TABLE_COUNT_MISMATCH'], ['unexpected_user_tables', 0, 'UNEXPECTED_USER_TABLES'],
      ['named_indexes', manifest.expected_named_indexes_before, 'INDEX_COUNT_MISMATCH'], ['unexpected_named_indexes', 0, 'UNEXPECTED_NAMED_INDEXES'],
      ['unexpected_user_objects', 0, 'UNEXPECTED_USER_OBJECTS'], ['foreign_keys', manifest.expected_foreign_keys, 'FOREIGN_KEY_COUNT_MISMATCH'],
      ['business_rows', 0, 'BUSINESS_ROWS_NOT_EMPTY'], ['total_columns', manifest.expected_total_columns_before, 'TOTAL_COLUMN_COUNT_MISMATCH'],
      ['added_columns', 0, 'ADDED_COLUMNS_ALREADY_EXIST'], ['new_indexes', 0, 'ADDED_INDEXES_ALREADY_EXIST'],
    ];
    for (const [key, expected, code] of prechecks) assertNumber(preflight, key, expected, code);

    phase = 'TIMESTAMP_CAPTURE';
    timestamp = recoveryTimestamp(now);
    phase = 'MIGRATE_0002';
    migrationRequests += 1;
    const write = await call('MIGRATE_0002', { sql });
    if (write?.success !== true || !Array.isArray(write?.result) || write.result.length !== statements.length || !write.result.every((item) => item?.success === true)) {
      throw Object.assign(new Error('MIGRATION_BATCH_NOT_FULLY_SUCCESSFUL'), { safeCode: 'MIGRATION_BATCH_NOT_FULLY_SUCCESSFUL', classification: 'REMOTE_BATCH_FAILURE' });
    }
    if (!write.result.every((item) => Number.isInteger(item?.total_attempts) && item.total_attempts === 1)) {
      const observed = write.result.find((item) => item?.total_attempts !== 1)?.total_attempts;
      throw Object.assign(new Error('WRITE_TOTAL_ATTEMPTS_INVALID'), { safeCode: 'WRITE_TOTAL_ATTEMPTS_INVALID', classification: 'REMOTE_ATTEMPTS_INVALID', totalAttempts: Number.isInteger(observed) ? observed : null });
    }

    phase = 'POSTCHECK_SCHEMA_V3';
    const postcheck = firstResultRow(await call('POSTCHECK_SCHEMA_V3', { sql: sharedCheckSql({ after: true }) }), 'POSTCHECK_RESULT_INVALID', 'POSTCHECK_TOTAL_ATTEMPTS_INVALID');
    const postchecks = [
      ['d1_migrations_tables', 0, 'UNEXPECTED_D1_MIGRATIONS'], ['schema_meta_tables', 1, 'SCHEMA_META_COUNT_MISMATCH'],
      ['schema_meta_rows', 1, 'SCHEMA_META_ROW_COUNT_MISMATCH'], ['schema_version', manifest.to_version, 'SCHEMA_VERSION_MISMATCH'],
      ['goencho_tables', manifest.expected_goencho_tables, 'GOENCHO_TABLE_COUNT_MISMATCH'], ['unexpected_user_tables', 0, 'UNEXPECTED_USER_TABLES'],
      ['named_indexes', manifest.expected_named_indexes_after, 'INDEX_COUNT_MISMATCH'], ['unexpected_named_indexes', 0, 'UNEXPECTED_NAMED_INDEXES'],
      ['unexpected_user_objects', 0, 'UNEXPECTED_USER_OBJECTS'], ['foreign_keys', manifest.expected_foreign_keys, 'FOREIGN_KEY_COUNT_MISMATCH'],
      ['business_rows', 0, 'BUSINESS_ROWS_NOT_EMPTY'], ['total_columns', manifest.expected_total_columns_after, 'TOTAL_COLUMN_COUNT_MISMATCH'],
      ['added_columns', manifest.expected_added_columns, 'ADDED_COLUMN_COUNT_MISMATCH'], ['new_indexes', manifest.expected_added_indexes, 'ADDED_INDEX_COUNT_MISMATCH'],
      ['column_shape_matches', manifest.expected_added_columns, 'ADDED_COLUMN_SHAPE_MISMATCH'],
      ['new_index_shape_matches', manifest.expected_added_indexes, 'ADDED_INDEX_SHAPE_MISMATCH'],
      ['new_index_column_matches', manifest.expected_added_indexes, 'ADDED_INDEX_COLUMN_MISMATCH'],
      ['new_index_predicate_matches', manifest.expected_added_indexes, 'ADDED_INDEX_PREDICATE_MISMATCH'],
    ];
    for (const [key, expected, code] of postchecks) assertNumber(postcheck, key, expected, code);

    return {
      ...safeBase, status: 'PASS', phase: 'COMPLETE_TOKEN_REVOCATION_REQUIRED',
      account_id: manifest.account_id, database_name: manifest.database_name, database_uuid: manifest.database_uuid,
      binding: manifest.binding, migration_name: manifest.migration_name, migration_sha256: manifest.migration_sha256,
      recovery_timestamp_rfc3339: timestamp.rfc3339, recovery_timestamp_unix: timestamp.unix,
      transport_calls: transportCalls, client_attempts: clientAttempts, migration_requests: migrationRequests,
      result_counts: { tables: 17, named_indexes: 8, foreign_keys: 15, schema_version: 3, total_columns: 132, added_columns: 10, added_indexes: 4 },
      safe_failure: null,
    };
  } catch (error) {
    return {
      ...safeBase, status: 'STOPPED', phase,
      recovery_timestamp_rfc3339: timestamp?.rfc3339 ?? null,
      recovery_timestamp_unix: timestamp?.unix ?? null,
      transport_calls: transportCalls, client_attempts: clientAttempts, migration_requests: migrationRequests,
      safe_failure: safeFailure(error, phase),
    };
  }
}
