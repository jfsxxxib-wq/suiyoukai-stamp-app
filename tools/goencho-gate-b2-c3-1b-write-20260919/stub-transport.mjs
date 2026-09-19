const basePreflight = {
  cf_internal_tables: 2,
  sqlite_internal_tables: 2,
  d1_migrations_tables: 0,
  schema_meta_tables: 1,
  schema_meta_rows: 1,
  schema_version: 2,
  goencho_tables: 16,
  unexpected_user_tables: 0,
  named_indexes: 4,
  unexpected_named_indexes: 0,
  unexpected_user_objects: 0,
  foreign_keys: 15,
  business_rows: 0,
  total_columns: 122,
  added_columns: 0,
  new_indexes: 0,
  column_shape_matches: 0,
  new_index_shape_matches: 0,
  new_index_column_matches: 0,
  new_index_predicate_matches: 0,
};

const basePostcheck = {
  ...basePreflight,
  schema_version: 3,
  named_indexes: 8,
  total_columns: 132,
  added_columns: 10,
  new_indexes: 4,
  column_shape_matches: 10,
  new_index_shape_matches: 4,
  new_index_column_matches: 4,
  new_index_predicate_matches: 4,
};

const preMutations = {
  pre_d1_migrations: ['d1_migrations_tables', 1],
  pre_schema_meta: ['schema_meta_tables', 0],
  pre_schema_meta_rows: ['schema_meta_rows', 2],
  pre_version: ['schema_version', 3],
  pre_goencho: ['goencho_tables', 15],
  pre_unexpected_table: ['unexpected_user_tables', 1],
  pre_index_count: ['named_indexes', 3],
  pre_unexpected_index: ['unexpected_named_indexes', 1],
  pre_unexpected_object: ['unexpected_user_objects', 1],
  pre_foreign_keys: ['foreign_keys', 14],
  pre_business_rows: ['business_rows', 1],
  pre_total_columns: ['total_columns', 123],
  pre_added_columns: ['added_columns', 1],
  pre_new_indexes: ['new_indexes', 1],
};

const postMutations = {
  post_d1_migrations: ['d1_migrations_tables', 1],
  post_schema_meta: ['schema_meta_tables', 0],
  post_schema_meta_rows: ['schema_meta_rows', 2],
  post_version: ['schema_version', 2],
  post_goencho: ['goencho_tables', 15],
  post_unexpected_table: ['unexpected_user_tables', 1],
  post_index_count: ['named_indexes', 7],
  post_unexpected_index: ['unexpected_named_indexes', 1],
  post_unexpected_object: ['unexpected_user_objects', 1],
  post_foreign_keys: ['foreign_keys', 14],
  post_business_rows: ['business_rows', 1],
  post_total_columns: ['total_columns', 131],
  post_added_columns: ['added_columns', 9],
  post_new_indexes: ['new_indexes', 3],
  post_column_shape: ['column_shape_matches', 9],
  post_index_shape: ['new_index_shape_matches', 3],
  post_index_column: ['new_index_column_matches', 3],
  post_index_predicate: ['new_index_predicate_matches', 3],
};

export function createStubTransport({ scenario, expectedToken, expectedStatementCount = 15 }) {
  const safeCalls = [];
  const state = { committed: false };
  const delivered = (response, clientAttempts = 1) => ({ response, safe_meta: { http_status: 200, client_attempts: clientAttempts } });
  const selectResponse = (row, totalAttempts) => {
    const item = { success: true, results: [row] };
    if (totalAttempts !== undefined) item.total_attempts = totalAttempts;
    return { success: true, result: [item] };
  };

  async function transport(request) {
    if (request.token !== expectedToken) throw Object.assign(new Error('stub token mismatch'), { classification: 'AUTH_OR_SCOPE', httpStatus: 403, numericCodes: [10000] });
    safeCalls.push({ method: request.method, path: request.path, purpose: request.purpose, sql_bytes: Buffer.byteLength(request.body.sql, 'utf8') });
    if (scenario === 'auth_fail') throw Object.assign(new Error(`untrusted ${expectedToken}`), { classification: 'AUTH_OR_SCOPE', httpStatus: 403, numericCodes: [10000], clientAttempts: 1 });

    if (request.purpose === 'REMOTE_0001_STATE_CHECK') {
      const row = { ...basePreflight };
      if (preMutations[scenario]) row[preMutations[scenario][0]] = preMutations[scenario][1];
      const attempts = scenario === 'pre_attempts_two' ? 2 : scenario === 'pre_attempts_invalid' ? null : scenario === 'pre_attempts_missing' ? undefined : 1;
      return delivered(selectResponse(row, attempts), scenario === 'pre_client_attempts_two' ? 2 : 1);
    }

    if (request.purpose === 'MIGRATE_0002') {
      if (scenario === 'write_timeout') throw Object.assign(new Error(`untrusted ${expectedToken}`), { classification: 'REMOTE_TIMEOUT', clientAttempts: 1 });
      const results = Array.from({ length: expectedStatementCount }, () => ({ success: true, total_attempts: 1, results: [] }));
      if (scenario === 'write_partial_failure') {
        results[7] = { success: false, total_attempts: 1, results: [] };
        state.committed = false;
      } else {
        state.committed = true;
      }
      if (scenario === 'write_attempts_missing') delete results[0].total_attempts;
      if (scenario === 'write_attempts_invalid') results[0].total_attempts = null;
      if (scenario === 'write_attempts_two') results[0].total_attempts = 2;
      return delivered({ success: scenario !== 'write_partial_failure', result: results }, scenario === 'write_client_attempts_two' ? 2 : 1);
    }

    if (request.purpose === 'POSTCHECK_SCHEMA_V3') {
      const row = { ...basePostcheck };
      if (postMutations[scenario]) row[postMutations[scenario][0]] = postMutations[scenario][1];
      const attempts = scenario === 'post_attempts_two' ? 2 : scenario === 'post_attempts_invalid' ? null : scenario === 'post_attempts_missing' ? undefined : 1;
      return delivered(selectResponse(row, attempts));
    }
    throw new Error('UNEXPECTED_STUB_PURPOSE');
  }
  return { transport, safeCalls, state };
}
