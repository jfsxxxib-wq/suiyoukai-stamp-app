import { fail } from './errors.mjs';

export function assertNotLocked(db, scopeKey, now) {
  const attempt = db.prepare('SELECT * FROM goencho_auth_attempts WHERE scope_key = ?').get(scopeKey);
  if (attempt?.locked_until && attempt.locked_until > now) {
    fail(429, 'AUTH_TEMPORARILY_LOCKED', 'Authentication is temporarily locked');
  }
}

export function registerFailure(db, scopeKey, now, config) {
  const previous = db.prepare('SELECT * FROM goencho_auth_attempts WHERE scope_key = ?').get(scopeKey);
  const failureCount = (previous?.failure_count ?? 0) + 1;
  const lockedUntil = failureCount >= config.maxPinFailures ? now + config.pinLockMs : null;
  db.prepare(`INSERT INTO goencho_auth_attempts(scope_key, failure_count, locked_until, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(scope_key) DO UPDATE SET
      failure_count = excluded.failure_count,
      locked_until = excluded.locked_until,
      updated_at = excluded.updated_at`)
    .run(scopeKey, failureCount, lockedUntil, now);
  if (lockedUntil) fail(429, 'AUTH_TEMPORARILY_LOCKED', 'Authentication is temporarily locked');
  fail(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
}

export function clearFailures(db, scopeKey) {
  db.prepare('DELETE FROM goencho_auth_attempts WHERE scope_key = ?').run(scopeKey);
}
