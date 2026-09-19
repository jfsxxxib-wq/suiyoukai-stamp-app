export function createStubTransport({ scenario, expectedToken, expectedStatementCount = 23 }) {
  const safeCalls = [];
  const state = { committed: false };

  function delivered(response, clientAttempts = 1) {
    return { response, safe_meta: { http_status: 200, client_attempts: clientAttempts } };
  }

  async function transport(request) {
    if (request.token !== expectedToken) {
      throw Object.assign(new Error('stub token mismatch'), { classification: 'AUTH_OR_SCOPE', httpStatus: 403, numericCodes: [10000] });
    }
    safeCalls.push({ method: request.method, path: request.path, purpose: request.purpose, sql_bytes: Buffer.byteLength(request.body.sql, 'utf8') });

    if (scenario === 'auth_fail') {
      throw Object.assign(new Error(`untrusted raw ${expectedToken}`), { classification: 'AUTH_OR_SCOPE', httpStatus: 403, numericCodes: [10000], clientAttempts: 1 });
    }

    if (request.purpose === 'REMOTE_EMPTY_CHECK') {
      const row = {
        cf_internal_tables: scenario === 'cf_only' ? 1 : scenario === 'cf_multiple' || scenario === 'cf_sqlite' ? 2 : 0,
        sqlite_internal_tables: scenario === 'sqlite_only' ? 2 : scenario === 'cf_sqlite' ? 2 : 0,
        goencho_tables: scenario === 'goencho_exists' ? 1 : 0,
        schema_meta_tables: scenario === 'schema_meta_exists' ? 1 : 0,
        d1_migrations_tables: scenario === 'd1_migrations_exists' ? 1 : 0,
        unexpected_user_tables: scenario === 'unexpected_user_table' ? 1 : 0,
        unexpected_named_indexes: scenario === 'unexpected_named_index' ? 1 : 0,
        unexpected_user_objects: scenario === 'unexpected_view' || scenario === 'unexpected_trigger' ? 1 : 0,
      };
      const totalAttempts = scenario === 'pre_attempts_two' ? 2
        : scenario === 'pre_attempts_invalid' ? null
          : scenario === 'pre_attempts_missing' ? undefined
            : 1;
      const item = { success: true, results: [row] };
      if (totalAttempts !== undefined) item.total_attempts = totalAttempts;
      return delivered(
        { success: true, result: [item] },
        scenario === 'pre_client_attempts_two' ? 2 : 1,
      );
    }

    if (request.purpose === 'BOOTSTRAP_0001') {
      if (scenario === 'timeout') {
        throw Object.assign(new Error(`timeout with ${expectedToken}`), { classification: 'REMOTE_TIMEOUT', clientAttempts: 1 });
      }
      const results = Array.from({ length: expectedStatementCount }, () => ({ success: true, results: [] }));
      if (scenario === 'partial_failure') {
        results[7] = { success: false, errors: [{ code: 7500, message: `raw ${expectedToken}` }] };
        state.committed = false;
      } else {
        state.committed = true;
      }
      for (const item of results) item.total_attempts = 1;
      if (scenario === 'write_attempts_missing') delete results[0].total_attempts;
      if (scenario === 'write_attempts_invalid') results[0].total_attempts = null;
      if (scenario === 'write_attempts_two') results[0].total_attempts = 2;
      return delivered(
        { success: scenario !== 'partial_failure', result: results },
        scenario === 'write_client_attempts_two' ? 2 : 1,
      );
    }

    if (request.purpose === 'POSTCHECK_SCHEMA') {
      const totalAttempts = scenario === 'post_attempts_two' ? 2
        : scenario === 'post_attempts_invalid' ? null
          : scenario === 'post_attempts_missing' ? undefined
            : 1;
      const item = {
        success: true,
        results: [{
          cf_internal_tables: 2,
          sqlite_internal_tables: 2,
          schema_meta_tables: scenario === 'post_schema_meta_mismatch' ? 0 : 1,
          schema_meta_rows: scenario === 'post_schema_meta_rows_mismatch' ? 2 : 1,
          goencho_tables: scenario === 'post_goencho_mismatch' ? 15 : 16,
          d1_migrations_tables: 0,
          unexpected_user_tables: scenario === 'post_unexpected_table' ? 1 : 0,
          named_indexes: scenario === 'post_index_mismatch' ? 3 : 4,
          unexpected_named_indexes: scenario === 'post_unexpected_index' ? 1 : 0,
          unexpected_user_objects: scenario === 'post_unexpected_view' || scenario === 'post_unexpected_trigger' ? 1 : 0,
          foreign_keys: scenario === 'post_foreign_key_mismatch' ? 14 : 15,
          business_rows: scenario === 'post_business_rows' ? 1 : 0,
          schema_version: scenario === 'post_version_mismatch' ? 1 : 2,
        }],
      };
      if (totalAttempts !== undefined) item.total_attempts = totalAttempts;
      return delivered({
        success: true,
        result: [item],
      });
    }

    throw new Error('UNEXPECTED_STUB_PURPOSE');
  }

  return { transport, safeCalls, state };
}
