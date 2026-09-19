import { AppError, fail, publicError } from './errors.mjs';

export function securityHeaders(origin) {
  return {
    'Cache-Control': 'no-store',
    'Content-Security-Policy': `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src ${origin}; frame-ancestors 'none'; base-uri 'none'; form-action 'self'`,
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
  };
}

export function assertHost(request, allowedHost) {
  if (request.headers.host !== allowedHost) fail(400, 'INVALID_HOST', 'Invalid host');
}

export function assertNoCrossOrigin(request, allowedOrigin) {
  const origin = request.headers.origin;
  if (origin && origin !== allowedOrigin) fail(403, 'ORIGIN_NOT_ALLOWED', 'Origin not allowed');
}

export function assertStateChangingRequest(request, allowedOrigin) {
  if (request.method !== 'POST') return true;
  if (request.headers.origin !== allowedOrigin) {
    fail(403, 'ORIGIN_REQUIRED', 'Exact origin is required');
  }
  const contentType = request.headers['content-type'] ?? '';
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    fail(415, 'JSON_REQUIRED', 'JSON content type is required');
  }
  return true;
}

export function parseCookies(request) {
  const cookie = request.headers.cookie ?? '';
  return Object.fromEntries(cookie.split(';').map((item) => item.trim()).filter(Boolean).map((item) => {
    const index = item.indexOf('=');
    return index === -1 ? [item, ''] : [item.slice(0, index), decodeURIComponent(item.slice(index + 1))];
  }));
}

export function localCookie(name, value, { maxAge, clear = false } = {}) {
  const pieces = [`${name}=${clear ? '' : encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Strict'];
  if (clear) pieces.push('Max-Age=0');
  else if (Number.isFinite(maxAge)) pieces.push(`Max-Age=${Math.floor(maxAge)}`);
  return pieces.join('; ');
}

export function localDeviceCookie(name, value, maxAgeSeconds) {
  if (!Number.isSafeInteger(maxAgeSeconds) || maxAgeSeconds <= 0) {
    throw new TypeError('Device cookie Max-Age must be a positive integer');
  }
  return localCookie(name, value, { maxAge: maxAgeSeconds });
}

export function localSessionCookie(name, value, { clear = false } = {}) {
  return localCookie(name, value, { clear });
}

export async function readJson(request, limit = 16_384) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) fail(413, 'REQUEST_TOO_LARGE', 'Request too large');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    fail(400, 'INVALID_JSON', 'Invalid JSON');
  }
}

export function sendJson(response, status, body, headers = {}) {
  const data = Buffer.from(JSON.stringify(body));
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': data.length,
    ...headers,
  });
  response.end(data);
}

export function sendError(response, error, headers = {}) {
  const output = publicError(error);
  sendJson(response, output.status, output.body, headers);
}

export function isAppError(error, code) {
  return error instanceof AppError && (!code || error.code === code);
}
