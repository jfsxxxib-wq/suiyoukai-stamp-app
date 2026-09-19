import { createHash } from 'node:crypto';
import { FIXED_ENDPOINT } from './live-transport.mjs';

function response({ status = 200, url = FIXED_ENDPOINT, redirected = false, payload = { success: true, result: [] } }) {
  return {
    ok: status >= 200 && status < 300,
    status,
    url,
    redirected,
    body: { async cancel() {} },
    async json() { return payload; },
  };
}

export function createStubFetch({ scenario, expectedToken }) {
  const safeCalls = [];
  let attempts = 0;
  async function fetchLike(url, init) {
    attempts += 1;
    if (url !== FIXED_ENDPOINT) throw new Error('stub endpoint mismatch');
    if (init.method !== 'POST' || init.redirect !== 'error') throw new Error('stub options mismatch');
    if (init.headers.Authorization !== `Bearer ${expectedToken}`) throw new Error('stub auth mismatch');
    if (init.body.includes(expectedToken)) throw new Error('token in body');
    safeCalls.push({ url, method: init.method, redirect: init.redirect, body_bytes: Buffer.byteLength(init.body, 'utf8'), body_sha256: createHash('sha256').update(init.body).digest('hex') });
    if (scenario === 'http_403') return response({ status: 403 });
    if (scenario === 'http_500') return response({ status: 500 });
    if (scenario === 'redirect') return response({ url: 'https://redirect.invalid/query', redirected: true });
    if (scenario === 'network_error') throw new TypeError(`untrusted ${expectedToken}`);
    if (scenario === 'invalid_json') {
      const value = response({});
      value.json = async () => { throw new Error(`untrusted ${expectedToken}`); };
      return value;
    }
    if (scenario === 'timeout') {
      return new Promise((resolvePromise, reject) => {
        init.signal.addEventListener('abort', () => {
          const error = new Error(`untrusted ${expectedToken}`);
          error.name = 'AbortError';
          reject(error);
        }, { once: true });
      });
    }
    if (scenario === 'schema_counts') {
      return response({ payload: {
        success: true,
        messages: [{ message: `untrusted ${expectedToken}` }],
        result: [{ success: true, meta: { total_attempts: 1 }, results: [{
          cf_internal_tables: 2, sqlite_internal_tables: 2, d1_migrations_tables: 0,
          schema_meta_tables: 1, schema_meta_rows: 1, schema_version: 3,
          goencho_tables: 16, unexpected_user_tables: 0, named_indexes: 8,
          unexpected_named_indexes: 0, unexpected_user_objects: 0, foreign_keys: 15,
          business_rows: 0, total_columns: 132, added_columns: 10, new_indexes: 4,
          column_shape_matches: 10, new_index_shape_matches: 4,
          new_index_column_matches: 4, new_index_predicate_matches: 4,
          table_name: `_cf_secret_${expectedToken}`, raw_sql: `SELECT '${expectedToken}'`,
        }], errors: [{ message: `untrusted ${expectedToken}` }] }],
      } });
    }
    if (scenario === 'total_attempts_missing') return response({ payload: { success: true, result: [{ success: true, results: [{ sentinel: 1 }] }] } });
    if (scenario === 'total_attempts_invalid') return response({ payload: { success: true, result: [{ success: true, meta: { total_attempts: '1' }, results: [{ sentinel: 1 }] }] } });
    return response({ payload: { success: true, messages: [{ message: `untrusted ${expectedToken}` }], result: [{ success: true, meta: { total_attempts: 1 }, results: [{ sentinel: 1 }], errors: [{ message: `untrusted ${expectedToken}` }] }] } });
  }
  return { fetchLike, getAttempts: () => attempts, getSafeCalls: () => safeCalls.map((item) => ({ ...item })) };
}
