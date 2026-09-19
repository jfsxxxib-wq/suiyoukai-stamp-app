export async function sameOriginJson(path, { method = 'GET', body } = {}) {
  const url = new URL(path, window.location.origin);
  if (url.origin !== window.location.origin) {
    throw new Error('Cross-origin request blocked');
  }
  const response = await fetch(url, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({ error: 'INVALID_RESPONSE' }));
  if (!response.ok) {
    const error = new Error(payload.error ?? 'REQUEST_FAILED');
    error.status = response.status;
    throw error;
  }
  return payload;
}
