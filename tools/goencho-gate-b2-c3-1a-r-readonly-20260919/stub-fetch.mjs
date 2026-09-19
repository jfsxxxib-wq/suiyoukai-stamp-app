import { FIXED_ENDPOINT, SAFE_COUNT_KEYS } from './scope.mjs';

export function emptyCounts(overrides = {}) {
  return Object.fromEntries(SAFE_COUNT_KEYS.map((key) => [key, overrides[key] ?? 0]));
}

function response({ status = 200, url = FIXED_ENDPOINT, redirected = false, payload }) {
  return {
    ok: status >= 200 && status < 300,
    status,
    url,
    redirected,
    body: { async cancel() {} },
    async json() { return payload; },
  };
}

export function createReadOnlyStubFetch({ scenario = 'pass', expectedToken, counts = emptyCounts(), totalAttempts = 1 }) {
  let requests = 0;
  const safeCalls = [];

  async function fetchLike(url, init) {
    requests += 1;
    if (url !== FIXED_ENDPOINT) throw new Error('stub endpoint mismatch');
    if (init.method !== 'POST' || init.redirect !== 'error') throw new Error('stub options mismatch');
    if (init.headers.Authorization !== `Bearer ${expectedToken}`) throw new Error('stub auth mismatch');
    if (init.body.includes(expectedToken)) throw new Error('token in request body');
    safeCalls.push({ url, method: init.method, body_bytes: Buffer.byteLength(init.body, 'utf8') });

    if (scenario === 'http_403') return response({ status: 403, payload: {} });
    if (scenario === 'http_500') return response({ status: 500, payload: {} });
    if (scenario === 'redirect') return response({ url: 'https://redirect.invalid/query', redirected: true, payload: {} });
    if (scenario === 'network_error') throw new TypeError(`untrusted network detail ${expectedToken}`);
    if (scenario === 'invalid_json') {
      const value = response({ status: 200, payload: {} });
      value.json = async () => { throw new Error(`untrusted json ${expectedToken}`); };
      return value;
    }
    if (scenario === 'timeout') {
      return new Promise((resolvePromise, reject) => {
        init.signal.addEventListener('abort', () => {
          const error = new Error(`untrusted timeout ${expectedToken}`);
          error.name = 'AbortError';
          reject(error);
        }, { once: true });
      });
    }
    if (scenario === 'top_level_failure') {
      return response({ status: 200, payload: { success: false, errors: [{ message: expectedToken }] } });
    }
    if (scenario === 'multiple_results') {
      const item = { success: true, results: [counts], meta: { total_attempts: totalAttempts } };
      return response({ status: 200, payload: { success: true, result: [item, item] } });
    }

    const meta = scenario === 'total_attempts_missing' ? {} : { total_attempts: totalAttempts };

    return response({
      status: 200,
      payload: {
        success: true,
        messages: [{ message: `untrusted ${expectedToken}` }],
        result: [{
          success: true,
          results: [{ ...counts, table_name: `_cf_secret_${expectedToken}`, raw_sql: `SELECT '${expectedToken}'` }],
          meta,
          errors: [{ message: `untrusted ${expectedToken}` }],
        }],
      },
    });
  }

  return {
    fetchLike,
    getRequests: () => requests,
    getSafeCalls: () => safeCalls.map((item) => ({ ...item })),
  };
}
