import { FIXED_ENDPOINT, READONLY_EMPTY_CHECK_SQL, SAFE_COUNT_KEYS } from './scope.mjs';

export { FIXED_ENDPOINT };

const allowedCountKeys = new Set(SAFE_COUNT_KEYS);

export class SafeReadOnlyTransportError extends Error {
  constructor(classification, httpStatus = null, clientRequests = 0) {
    super('SAFE_READONLY_TRANSPORT_ERROR');
    this.name = 'SafeReadOnlyTransportError';
    this.classification = classification;
    this.httpStatus = Number.isInteger(httpStatus) ? httpStatus : null;
    this.clientRequests = Number.isInteger(clientRequests) ? clientRequests : 0;
  }
}

export function safeTransportFailure(error) {
  return {
    classification: error instanceof SafeReadOnlyTransportError ? error.classification : 'REMOTE_UNKNOWN',
    http_status: error instanceof SafeReadOnlyTransportError ? error.httpStatus : null,
    client_requests: error instanceof SafeReadOnlyTransportError ? error.clientRequests : 0,
    client_retry: false,
  };
}

export function assertFixedEndpoint(candidate) {
  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new SafeReadOnlyTransportError('ENDPOINT_GUARD');
  }
  const expectedPath = `/client/v4/accounts/242d67724ca0baef96a00553df0fac35/d1/database/f12fe289-977c-4215-ae73-40aaa34bff97/query`;
  if (
    candidate !== FIXED_ENDPOINT ||
    parsed.protocol !== 'https:' ||
    parsed.hostname !== 'api.cloudflare.com' ||
    parsed.port !== '' ||
    parsed.pathname !== expectedPath ||
    parsed.search !== '' ||
    parsed.hash !== ''
  ) {
    throw new SafeReadOnlyTransportError('ENDPOINT_GUARD');
  }
  return true;
}

function assertReadOnlyBody(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new SafeReadOnlyTransportError('READONLY_BODY_GUARD');
  }
  const keys = Object.keys(body);
  if (keys.length !== 1 || keys[0] !== 'sql' || body.sql !== READONLY_EMPTY_CHECK_SQL) {
    throw new SafeReadOnlyTransportError('READONLY_BODY_GUARD');
  }
}

function normalizeResponse(value, httpStatus) {
  if (value === null || typeof value !== 'object' || value.success !== true) {
    throw new SafeReadOnlyTransportError('REMOTE_RESULT_INVALID', httpStatus, 1);
  }
  if (!Array.isArray(value.result) || value.result.length !== 1) {
    throw new SafeReadOnlyTransportError('REMOTE_RESULT_INVALID', httpStatus, 1);
  }
  const item = value.result[0];
  if (item?.success !== true || !Array.isArray(item.results) || item.results.length !== 1) {
    throw new SafeReadOnlyTransportError('REMOTE_RESULT_INVALID', httpStatus, 1);
  }
  const rawRow = item.results[0];
  if (rawRow === null || typeof rawRow !== 'object' || Array.isArray(rawRow)) {
    throw new SafeReadOnlyTransportError('REMOTE_RESULT_INVALID', httpStatus, 1);
  }

  const counts = {};
  for (const [key, field] of Object.entries(rawRow)) {
    if (allowedCountKeys.has(key) && typeof field === 'number') counts[key] = field;
  }

  return {
    success: true,
    result: [{
      success: true,
      counts,
      total_attempts: typeof item?.meta?.total_attempts === 'number'
        ? item.meta.total_attempts
        : undefined,
    }],
  };
}

export function createReadOnlyTransport({ fetchLike, timeoutMs = 30_000, setTimer = setTimeout, clearTimer = clearTimeout }) {
  if (typeof fetchLike !== 'function') throw new SafeReadOnlyTransportError('LOCAL_PROCESS_OR_CONFIG');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30_000) {
    throw new SafeReadOnlyTransportError('LOCAL_PROCESS_OR_CONFIG');
  }

  const debug = {
    active_requests: 0,
    client_requests: 0,
    client_retry: false,
    raw_response_held: false,
    raw_json_held: false,
  };

  async function send({ method = 'POST', endpoint = FIXED_ENDPOINT, tokenBuffer, body }) {
    assertFixedEndpoint(endpoint);
    if (method !== 'POST') throw new SafeReadOnlyTransportError('METHOD_GUARD');
    assertReadOnlyBody(body);
    if (!Buffer.isBuffer(tokenBuffer) || tokenBuffer.length < 1) {
      throw new SafeReadOnlyTransportError('AUTH_OR_SCOPE');
    }
    if (debug.client_requests !== 0) throw new SafeReadOnlyTransportError('CLIENT_REQUEST_LIMIT', null, debug.client_requests);

    let tokenText = tokenBuffer.toString('utf8');
    let requestBody = JSON.stringify(body);
    if (requestBody.includes(tokenText)) {
      tokenText = null;
      requestBody = null;
      throw new SafeReadOnlyTransportError('AUTH_OR_SCOPE');
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
    debug.client_requests += 1;

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
        throw new SafeReadOnlyTransportError('ENDPOINT_GUARD', Number.isInteger(rawResponse?.status) ? rawResponse.status : null, 1);
      }
      if (rawResponse?.ok !== true) {
        if (typeof rawResponse?.body?.cancel === 'function') await rawResponse.body.cancel().catch(() => {});
        throw new SafeReadOnlyTransportError('REMOTE_HTTP', Number.isInteger(rawResponse?.status) ? rawResponse.status : null, 1);
      }
      if (typeof rawResponse.json !== 'function') throw new SafeReadOnlyTransportError('REMOTE_RESULT_INVALID', rawResponse.status, 1);
      try {
        rawJson = await rawResponse.json();
      } catch {
        throw new SafeReadOnlyTransportError('REMOTE_RESULT_INVALID', rawResponse.status, 1);
      }
      debug.raw_json_held = true;
      return {
        response: normalizeResponse(rawJson, rawResponse.status),
        safe_meta: {
          http_status: rawResponse.status,
          client_requests: 1,
          client_retry: false,
        },
      };
    } catch (error) {
      if (error instanceof SafeReadOnlyTransportError) throw error;
      if (timedOut || error?.name === 'AbortError') throw new SafeReadOnlyTransportError('REMOTE_TIMEOUT', null, 1);
      throw new SafeReadOnlyTransportError('NETWORK_OR_TLS', null, 1);
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
