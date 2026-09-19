// Offline-approved fixed scope for the one-request D1 read-only check.
export const FIXED_TARGET = Object.freeze({
  account_id: '242d67724ca0baef96a00553df0fac35',
  database_name: 'goencho-b2-canary-db-202609',
  database_uuid: 'f12fe289-977c-4215-ae73-40aaa34bff97',
  binding: 'GOENCHO_DB',
});

export const FIXED_ENDPOINT = `https://api.cloudflare.com/client/v4/accounts/${FIXED_TARGET.account_id}/d1/database/${FIXED_TARGET.database_uuid}/query`;

export const READONLY_EMPTY_CHECK_SQL = [
  'SELECT',
  "COUNT(CASE WHEN type='table' AND name LIKE '_cf_%' THEN 1 END) AS cf_internal_tables,",
  "COUNT(CASE WHEN type='table' AND name LIKE 'sqlite_%' THEN 1 END) AS sqlite_internal_tables,",
  "COUNT(CASE WHEN type='table' AND name='d1_migrations' THEN 1 END) AS d1_migrations_tables,",
  "COUNT(CASE WHEN type='table' AND name='schema_meta' THEN 1 END) AS schema_meta_tables,",
  "COUNT(CASE WHEN type='table' AND name LIKE 'goencho_%' THEN 1 END) AS goencho_tables,",
  "COUNT(CASE WHEN type='table' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'sqlite_%' AND name NOT IN ('d1_migrations','schema_meta') AND name NOT LIKE 'goencho_%' THEN 1 END) AS unexpected_user_tables,",
  "COUNT(CASE WHEN type='index' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'sqlite_%' THEN 1 END) AS unexpected_named_indexes,",
  "COUNT(CASE WHEN type IN ('view','trigger') AND name NOT LIKE '_cf_%' AND name NOT LIKE 'sqlite_%' THEN 1 END) AS unexpected_user_objects",
  'FROM sqlite_schema;',
].join(' ');

export const SAFE_COUNT_KEYS = Object.freeze([
  'cf_internal_tables',
  'sqlite_internal_tables',
  'd1_migrations_tables',
  'schema_meta_tables',
  'goencho_tables',
  'unexpected_user_tables',
  'unexpected_named_indexes',
  'unexpected_user_objects',
]);

export function assertFixedTarget(candidate = FIXED_TARGET) {
  if (candidate === null || typeof candidate !== 'object') throw safeLocalError('TARGET_MISMATCH');
  for (const [key, expected] of Object.entries(FIXED_TARGET)) {
    if (candidate[key] !== expected) throw safeLocalError(`${key.toUpperCase()}_MISMATCH`);
  }
  return true;
}

function safeLocalError(code) {
  return Object.assign(new Error(code), {
    safeCode: code,
    classification: 'LOCAL_TARGET_GUARD',
  });
}
