export const LOGICAL_SCHEMA_VERSION = 3;

export const TABLES = Object.freeze([
  { name: 'schema_meta', primaryKey: ['version'], columns: ['version'], numeric: ['version'] },
  {
    name: 'goencho_operators', primaryKey: ['operator_id'],
    columns: ['operator_id', 'role', 'status', 'created_at', 'updated_at'],
    numeric: ['created_at', 'updated_at'],
  },
  {
    name: 'goencho_operator_credentials', primaryKey: ['credential_id'],
    columns: ['credential_id', 'operator_id', 'salt', 'pin_hash', 'algorithm', 'status', 'created_at',
      'changed_at', 'work_factor', 'parameters_json', 'pepper_key_version'],
    numeric: ['created_at', 'changed_at', 'work_factor'],
    foreignKeys: [{ columns: ['operator_id'], parent: 'goencho_operators', parentColumns: ['operator_id'] }],
  },
  {
    name: 'goencho_operator_devices', primaryKey: ['device_authorization_id'],
    columns: ['device_authorization_id', 'operator_id', 'token_hash', 'status', 'created_at', 'approved_at',
      'last_seen_at', 'revoked_at', 'revocation_reason'],
    numeric: ['created_at', 'approved_at', 'last_seen_at', 'revoked_at'],
    foreignKeys: [{ columns: ['operator_id'], parent: 'goencho_operators', parentColumns: ['operator_id'] }],
  },
  {
    name: 'goencho_operator_sessions', primaryKey: ['session_id'],
    columns: ['session_id', 'device_authorization_id', 'session_hash', 'status', 'created_at', 'last_seen_at',
      'locked_at', 'revoked_at'],
    numeric: ['created_at', 'last_seen_at', 'locked_at', 'revoked_at'],
    foreignKeys: [{ columns: ['device_authorization_id'], parent: 'goencho_operator_devices', parentColumns: ['device_authorization_id'] }],
  },
  {
    name: 'goencho_bootstrap_tickets', primaryKey: ['ticket_id'],
    columns: ['ticket_id', 'token_hash', 'status', 'created_at', 'expires_at', 'consumed_at', 'last_mutation_id'],
    numeric: ['created_at', 'expires_at', 'consumed_at'],
  },
  {
    name: 'goencho_operator_recovery_codes', primaryKey: ['recovery_code_id'],
    columns: ['recovery_code_id', 'operator_id', 'batch_id', 'code_hash', 'status', 'created_at', 'consumed_at',
      'revoked_at', 'last_mutation_id'],
    numeric: ['created_at', 'consumed_at', 'revoked_at'],
    foreignKeys: [{ columns: ['operator_id'], parent: 'goencho_operators', parentColumns: ['operator_id'] }],
  },
  {
    name: 'goencho_teachers', primaryKey: ['teacher_id'],
    columns: ['teacher_id', 'display_name', 'status', 'created_at', 'updated_at'],
    numeric: ['created_at', 'updated_at'],
  },
  {
    name: 'goencho_teacher_credentials', primaryKey: ['credential_id'],
    columns: ['credential_id', 'teacher_id', 'salt', 'pin_hash', 'algorithm', 'status', 'created_at',
      'changed_at', 'work_factor', 'parameters_json', 'pepper_key_version'],
    numeric: ['created_at', 'changed_at', 'work_factor'],
    foreignKeys: [{ columns: ['teacher_id'], parent: 'goencho_teachers', parentColumns: ['teacher_id'] }],
  },
  {
    name: 'goencho_teacher_enrollment_tickets', primaryKey: ['ticket_id'],
    columns: ['ticket_id', 'teacher_id', 'token_hash', 'claim_hash', 'purpose', 'status', 'created_at',
      'expires_at', 'claimed_at', 'consumed_at', 'revoked_at', 'last_mutation_id'],
    numeric: ['created_at', 'expires_at', 'claimed_at', 'consumed_at', 'revoked_at'],
    foreignKeys: [{ columns: ['teacher_id'], parent: 'goencho_teachers', parentColumns: ['teacher_id'] }],
  },
  {
    name: 'goencho_teacher_device_authorizations', primaryKey: ['device_authorization_id'],
    columns: ['device_authorization_id', 'teacher_id', 'token_hash', 'status', 'confirmation_code', 'created_at',
      'approved_at', 'last_seen_at', 'revoked_at', 'revocation_reason', 'approved_by_operator_id',
      'replaced_by_authorization_id', 'last_mutation_id'],
    numeric: ['created_at', 'approved_at', 'last_seen_at', 'revoked_at'],
    foreignKeys: [
      { columns: ['teacher_id'], parent: 'goencho_teachers', parentColumns: ['teacher_id'] },
      { columns: ['approved_by_operator_id'], parent: 'goencho_operators', parentColumns: ['operator_id'] },
      { columns: ['replaced_by_authorization_id'], parent: 'goencho_teacher_device_authorizations', parentColumns: ['device_authorization_id'] },
    ],
  },
  {
    name: 'goencho_teacher_sessions', primaryKey: ['session_id'],
    columns: ['session_id', 'device_authorization_id', 'session_hash', 'status', 'created_at', 'last_seen_at',
      'locked_at', 'revoked_at'],
    numeric: ['created_at', 'last_seen_at', 'locked_at', 'revoked_at'],
    foreignKeys: [{ columns: ['device_authorization_id'], parent: 'goencho_teacher_device_authorizations', parentColumns: ['device_authorization_id'] }],
  },
  {
    name: 'goencho_auth_attempts', primaryKey: ['scope_key'],
    columns: ['scope_key', 'failure_count', 'locked_until', 'updated_at'],
    numeric: ['failure_count', 'locked_until', 'updated_at'],
  },
  {
    name: 'goencho_participants', primaryKey: ['participant_id'],
    columns: ['participant_id', 'display_name', 'display_rank', 'created_at', 'updated_at'],
    numeric: ['created_at', 'updated_at'],
  },
  {
    name: 'goencho_verified_person_links', primaryKey: ['link_id'],
    columns: ['link_id', 'teacher_id', 'participant_id', 'league_member_id', 'verified_by_operator_id', 'verified_at'],
    numeric: ['verified_at'],
    foreignKeys: [
      { columns: ['teacher_id'], parent: 'goencho_teachers', parentColumns: ['teacher_id'] },
      { columns: ['participant_id'], parent: 'goencho_participants', parentColumns: ['participant_id'] },
      { columns: ['verified_by_operator_id'], parent: 'goencho_operators', parentColumns: ['operator_id'] },
    ],
  },
  {
    name: 'goencho_match_records', primaryKey: ['match_id'],
    columns: ['match_id', 'teacher_id', 'participant_id', 'played_on', 'played_at', 'result_code',
      'handicap_text', 'source_reference', 'created_at'],
    numeric: ['created_at'],
    foreignKeys: [
      { columns: ['teacher_id'], parent: 'goencho_teachers', parentColumns: ['teacher_id'] },
      { columns: ['participant_id'], parent: 'goencho_participants', parentColumns: ['participant_id'] },
    ],
  },
  {
    name: 'goencho_audit_events', primaryKey: ['audit_id'],
    columns: ['audit_id', 'actor_kind', 'actor_id', 'action', 'target_kind', 'target_id', 'result_code',
      'request_id', 'created_at'],
    numeric: ['created_at'],
  },
]);

export const DOMAIN_ID_TABLES = Object.freeze([
  { table: 'goencho_teachers', column: 'teacher_id' },
  { table: 'goencho_participants', column: 'participant_id' },
  { table: 'goencho_match_records', column: 'match_id' },
]);
