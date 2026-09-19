export const FIXED_ACCOUNT_ID = '242d67724ca0baef96a00553df0fac35';
export const FIXED_DATABASE_UUID = 'f12fe289-977c-4215-ae73-40aaa34bff97';
export const FIXED_ENDPOINT = `https://api.cloudflare.com/client/v4/accounts/${FIXED_ACCOUNT_ID}/d1/database/${FIXED_DATABASE_UUID}/query`;

const allowedResultKeys = new Set([
  'sentinel',
  'cf_internal_tables',
  'sqlite_internal_tables',
  'schema_meta_tables',
  'schema_meta_rows',
  'd1_migrations_tables',
  'goencho_tables',
  'unexpected_user_tables',
  'unexpected_user_objects',
  'named_indexes',
  'unexpected_named_indexes',
  'foreign_keys',
  'business_rows',
  'schema_version',
]);

export class SafeTransportError extends Error {
  constructor(classification, httpStatus = null, clientAttempts = 0) {
    super('SAFE_TRANSPORT_ERROR');
    this.name = 'SafeTransportError';
    this.classification = classification;
    this.httpStatus = Number.isInteger(httpStatus) ? httpStatus : null;
    this.clientAttempts = clientAttempts;
  }
}

export function safeErrorRecord(error, phase = 'LIVE_TRANSPORT') {
  return {
    phase,
    classification: error instanceof SafeTransportError ? error.classification : 'REMOTE_UNKNOWN',
    http_status: error instanceof SafeTransportError ? error.httpStatus : null,
    client_attempts: error instanceof SafeTransportError ? error.clientAttempts : 0,
  };
}

export function assertFixedEndpoint(candidate) {
  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new SafeTransportError('ENDPOINT_GUARD');
  }
  const expectedPath = `/client/v4/accounts/${FIXED_ACCOUNT_ID}/d1/database/${FIXED_DATABASE_UUID}/query`;
  if (
    candidate !== FIXED_ENDPOINT ||
    parsed.protocol !== 'https:' ||
    parsed.hostname !== 'api.cloudflare.com' ||
    parsed.port !== '' ||
    parsed.pathname !== expectedPath ||
    parsed.search !== '' ||
    parsed.hash !== ''
  ) {
    throw new SafeTransportError('ENDPOINT_GUARD');
  }
  return true;
}

function normalizeResponse(value) {
  if (value === null || typeof value !== 'object') throw new SafeTransportError('REMOTE_RESULT_INVALID');
  const normalized = {
    success: value.success === true,
    result: [],
  };
  if (!Array.isArray(value.result)) return normalized;
  normalized.result = value.result.map((item) => {
    const safeItem = {
      success: item?.success === true,
      total_attempts: typeof item?.meta?.total_attempts === 'number' ? item.meta.total_attempts : null,
      results: [],
    };
    if (Array.isArray(item?.results)) {
      safeItem.results = item.results.map((row) => {
        const safeRow = {};
        if (row && typeof row === 'object') {
          for (const [key, field] of Object.entries(row)) {
            if (allowedResultKeys.has(key) && ['string', 'number', 'boolean'].includes(typeof field)) {
              safeRow[key] = field;
            }
          }
        }
        return safeRow;
      });
    }
    return safeItem;
  });
  return normalized;
}

export function createLiveTransport({ fetchLike, timeoutMs = 30_000, setTimer = setTimeout, clearTimer = clearTimeout }) {
  if (typeof fetchLike !== 'function') throw new SafeTransportError('LOCAL_PROCESS_OR_CONFIG');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30_000) {
    throw new SafeTransportError('LOCAL_PROCESS_OR_CONFIG');
  }

  const debug = {
    active_requests: 0,
    client_attempts: 0,
    raw_response_held: false,
    raw_json_held: false,
  };

  async function send({ method = 'POST', endpoint = FIXED_ENDPOINT, tokenBuffer, body }) {
    assertFixedEndpoint(endpoint);
    if (method !== 'POST') throw new SafeTransportError('METHOD_GUARD');
    if (!Buffer.isBuffer(tokenBuffer) || tokenBuffer.length < 1) {
      throw new SafeTransportError('AUTH_OR_SCOPE');
    }
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      throw new SafeTransportError('LOCAL_PROCESS_OR_CONFIG');
    }

    let tokenText = tokenBuffer.toString('utf8');
    let requestBody = JSON.stringify(body);
    if (requestBody.includes(tokenText)) {
      tokenText = null;
      requestBody = null;
      throw new SafeTransportError('AUTH_OR_SCOPE');
    }

    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimer(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    let rawResponse = null;
    let rawJson = null;
    let authorization = `Bearer ${tokenText}`;
    debug.active_requests += 1;
    debug.client_attempts += 1;

    try {
      rawResponse = await fetchLike(FIXED_ENDPOINT, {
        method: 'POST',
        redirect: 'error',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization,
        },
        body: requestBody,
      });
      debug.raw_response_held = true;

      if (rawResponse?.redirected === true || rawResponse?.url !== FIXED_ENDPOINT) {
        throw new SafeTransportError('ENDPOINT_GUARD', Number.isInteger(rawResponse?.status) ? rawResponse.status : null, 1);
      }
      if (rawResponse?.ok !== true) {
        if (typeof rawResponse?.body?.cancel === 'function') await rawResponse.body.cancel().catch(() => {});
        throw new SafeTransportError('REMOTE_HTTP', Number.isInteger(rawResponse?.status) ? rawResponse.status : null, 1);
      }
      if (typeof rawResponse.json !== 'function') throw new SafeTransportError('REMOTE_RESULT_INVALID', rawResponse.status, 1);
      try {
        rawJson = await rawResponse.json();
      } catch {
        throw new SafeTransportError('REMOTE_RESULT_INVALID', rawResponse.status, 1);
      }
      debug.raw_json_held = true;
      return {
        response: normalizeResponse(rawJson),
        safe_meta: { http_status: rawResponse.status, client_attempts: 1 },
      };
    } catch (error) {
      if (error instanceof SafeTransportError) throw error;
      if (timedOut || error?.name === 'AbortError') throw new SafeTransportError('REMOTE_TIMEOUT', null, 1);
      throw new SafeTransportError('NETWORK_OR_TLS', null, 1);
    } finally {
      clearTimer(timer);
      authorization = null;
      tokenText = null;
      requestBody = null;
      rawJson = null;
      rawResponse = null;
      debug.raw_json_held = false;
      debug.raw_response_held = false;
      debug.active_requests -= 1;
    }
  }

  return {
    send,
    getDebugState() {
      return { ...debug };
    },
  };
}
