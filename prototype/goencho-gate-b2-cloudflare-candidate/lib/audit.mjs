import { opaqueId } from './crypto.mjs';

const FORBIDDEN_KEYS = new Set([
  'pin', 'token', 'cookie', 'email', 'name', 'header', 'hash', 'recovery_code', 'digest', 'ip',
]);

export function assertSafeAudit(event) {
  for (const key of Object.keys(event)) {
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) throw new Error(`Forbidden audit field: ${key}`);
  }
  return true;
}

export function recordAudit(db, event, now = Date.now()) {
  assertSafeAudit(event);
  db.prepare(`INSERT INTO goencho_audit_events
    (audit_id, actor_kind, actor_id, action, target_kind, target_id, result_code, request_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(
      opaqueId('audit'),
      event.actorKind,
      event.actorId ?? null,
      event.action,
      event.targetKind ?? null,
      event.targetId ?? null,
      event.resultCode,
      event.requestId ?? opaqueId('request'),
      now,
    );
}
