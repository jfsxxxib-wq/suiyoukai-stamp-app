ALTER TABLE goencho_operator_credentials ADD COLUMN work_factor INTEGER;
ALTER TABLE goencho_operator_credentials ADD COLUMN parameters_json TEXT;
ALTER TABLE goencho_operator_credentials ADD COLUMN pepper_key_version TEXT NOT NULL DEFAULT 'v1';

ALTER TABLE goencho_teacher_credentials ADD COLUMN work_factor INTEGER;
ALTER TABLE goencho_teacher_credentials ADD COLUMN parameters_json TEXT;
ALTER TABLE goencho_teacher_credentials ADD COLUMN pepper_key_version TEXT NOT NULL DEFAULT 'v1';

ALTER TABLE goencho_bootstrap_tickets ADD COLUMN last_mutation_id TEXT;
ALTER TABLE goencho_operator_recovery_codes ADD COLUMN last_mutation_id TEXT;
ALTER TABLE goencho_teacher_enrollment_tickets ADD COLUMN last_mutation_id TEXT;
ALTER TABLE goencho_teacher_device_authorizations ADD COLUMN last_mutation_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_goencho_one_active_owner
  ON goencho_operators(role) WHERE status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS uq_goencho_operator_active_credential
  ON goencho_operator_credentials(operator_id) WHERE status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS uq_goencho_teacher_active_credential
  ON goencho_teacher_credentials(teacher_id) WHERE status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS uq_goencho_teacher_device_active_session
  ON goencho_teacher_sessions(device_authorization_id) WHERE status = 'active';

UPDATE schema_meta SET version = 3;
