import { fail, publicError } from '../../lib/errors.mjs';

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

export function parseCookies(request) {
  const value = request.headers.get('cookie') ?? '';
  return Object.fromEntries(value.split(';').map((item) => item.trim()).filter(Boolean).map((item) => {
    const index = item.indexOf('=');
    return index === -1
      ? [item, '']
      : [item.slice(0, index), decodeURIComponent(item.slice(index + 1))];
  }));
}

export async function readJson(request, limit = 16_384) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(contentLength) && contentLength > limit) {
    fail(413, 'REQUEST_TOO_LARGE', 'Request too large');
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > limit) {
    fail(413, 'REQUEST_TOO_LARGE', 'Request too large');
  }
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    fail(400, 'INVALID_JSON', 'Invalid JSON');
  }
}

export function assertStateChangingRequest(request, origin) {
  if (request.method !== 'POST') return true;
  if (request.headers.get('origin') !== origin) {
    fail(403, 'ORIGIN_REQUIRED', 'Exact origin is required');
  }
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') ?? '')) {
    fail(415, 'JSON_REQUIRED', 'JSON content type is required');
  }
  return true;
}

export function secureCookie(name, value, { maxAge, clear = false } = {}) {
  const parts = [
    `${name}=${clear ? '' : encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
  ];
  if (clear) parts.push('Max-Age=0');
  else if (Number.isSafeInteger(maxAge) && maxAge > 0) parts.push(`Max-Age=${maxAge}`);
  return parts.join('; ');
}

export function jsonResponse(status, body, headers = {}) {
  const outputHeaders = new Headers(headers);
  outputHeaders.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(body), {
    status,
    headers: outputHeaders,
  });
}

export function headersWithCookies(headers, cookies = []) {
  const output = new Headers(headers);
  for (const cookie of cookies.filter(Boolean)) output.append('Set-Cookie', cookie);
  return output;
}

export function errorResponse(error, headers = {}) {
  const output = publicError(error);
  return jsonResponse(output.status, output.body, headers);
}
