CREATE TABLE schema_meta (
  version integer NOT NULL
);

CREATE TABLE goencho_operators (
  operator_id text PRIMARY KEY,
  role text NOT NULL CHECK (role = 'owner'),
  status text NOT NULL CHECK (status IN ('active', 'locked', 'revoked')),
  created_at bigint NOT NULL,
  updated_at bigint NOT NULL
);

CREATE TABLE goencho_operator_credentials (
  credential_id text PRIMARY KEY,
  operator_id text NOT NULL REFERENCES goencho_operators(operator_id),
  salt text NOT NULL,
  pin_hash text NOT NULL,
  algorithm text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'superseded', 'revoked')),
  created_at bigint NOT NULL,
  changed_at bigint,
  work_factor integer,
  parameters_json text,
  pepper_key_version text NOT NULL DEFAULT 'v1'
);

CREATE TABLE goencho_operator_devices (
  device_authorization_id text PRIMARY KEY,
  operator_id text NOT NULL REFERENCES goencho_operators(operator_id),
  token_hash text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('approved', 'revoked')),
  created_at bigint NOT NULL,
  approved_at bigint NOT NULL,
  last_seen_at bigint,
  revoked_at bigint,
  revocation_reason text
);

CREATE TABLE goencho_operator_sessions (
  session_id text PRIMARY KEY,
  device_authorization_id text NOT NULL REFERENCES goencho_operator_devices(device_authorization_id),
  session_hash text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('active', 'locked', 'revoked')),
  created_at bigint NOT NULL,
  last_seen_at bigint NOT NULL,
  locked_at bigint,
  revoked_at bigint
);

CREATE TABLE goencho_bootstrap_tickets (
  ticket_id text PRIMARY KEY,
  token_hash text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('active', 'consumed', 'revoked')),
  created_at bigint NOT NULL,
  expires_at bigint NOT NULL,
  consumed_at bigint,
  last_mutation_id text
);

CREATE TABLE goencho_operator_recovery_codes (
  recovery_code_id text PRIMARY KEY,
  operator_id text NOT NULL REFERENCES goencho_operators(operator_id),
  batch_id text NOT NULL,
  code_hash text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('active', 'consumed', 'revoked')),
  created_at bigint NOT NULL,
  consumed_at bigint,
  revoked_at bigint,
  last_mutation_id text
);

CREATE TABLE goencho_teachers (
  teacher_id text PRIMARY KEY,
  display_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'revoked')),
  created_at bigint NOT NULL,
  updated_at bigint NOT NULL
);

CREATE TABLE goencho_teacher_credentials (
  credential_id text PRIMARY KEY,
  teacher_id text NOT NULL REFERENCES goencho_teachers(teacher_id),
  salt text NOT NULL,
  pin_hash text NOT NULL,
  algorithm text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'superseded', 'revoked')),
  created_at bigint NOT NULL,
  changed_at bigint,
  work_factor integer,
  parameters_json text,
  pepper_key_version text NOT NULL DEFAULT 'v1'
);

CREATE TABLE goencho_teacher_enrollment_tickets (
  ticket_id text PRIMARY KEY,
  teacher_id text NOT NULL REFERENCES goencho_teachers(teacher_id),
  token_hash text NOT NULL UNIQUE,
  claim_hash text UNIQUE,
  purpose text NOT NULL CHECK (purpose IN ('initial', 'new_device', 'pin_reset')),
  status text NOT NULL CHECK (status IN ('active', 'claimed', 'consumed', 'revoked')),
  created_at bigint NOT NULL,
  expires_at bigint NOT NULL,
  claimed_at bigint,
  consumed_at bigint,
  revoked_at bigint,
  last_mutation_id text
);

CREATE TABLE goencho_teacher_device_authorizations (
  device_authorization_id text PRIMARY KEY,
  teacher_id text NOT NULL REFERENCES goencho_teachers(teacher_id),
  token_hash text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'revoked')),
  confirmation_code text NOT NULL,
  created_at bigint NOT NULL,
  approved_at bigint,
  last_seen_at bigint,
  revoked_at bigint,
  revocation_reason text,
  approved_by_operator_id text REFERENCES goencho_operators(operator_id),
  replaced_by_authorization_id text REFERENCES goencho_teacher_device_authorizations(device_authorization_id),
  last_mutation_id text
);

CREATE TABLE goencho_teacher_sessions (
  session_id text PRIMARY KEY,
  device_authorization_id text NOT NULL REFERENCES goencho_teacher_device_authorizations(device_authorization_id),
  session_hash text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('active', 'locked', 'revoked')),
  created_at bigint NOT NULL,
  last_seen_at bigint NOT NULL,
  locked_at bigint,
  revoked_at bigint
);

CREATE TABLE goencho_auth_attempts (
  scope_key text PRIMARY KEY,
  failure_count integer NOT NULL,
  locked_until bigint,
  updated_at bigint NOT NULL
);

CREATE TABLE goencho_participants (
  participant_id text PRIMARY KEY,
  display_name text NOT NULL,
  display_rank text,
  created_at bigint NOT NULL,
  updated_at bigint NOT NULL
);

CREATE TABLE goencho_verified_person_links (
  link_id text PRIMARY KEY,
  teacher_id text REFERENCES goencho_teachers(teacher_id),
  participant_id text REFERENCES goencho_participants(participant_id),
  league_member_id text,
  verified_by_operator_id text REFERENCES goencho_operators(operator_id),
  verified_at bigint NOT NULL,
  UNIQUE (teacher_id, participant_id, league_member_id)
);

CREATE TABLE goencho_match_records (
  match_id text PRIMARY KEY,
  teacher_id text NOT NULL REFERENCES goencho_teachers(teacher_id),
  participant_id text NOT NULL REFERENCES goencho_participants(participant_id),
  played_on text NOT NULL,
  played_at text NOT NULL,
  result_code text NOT NULL,
  handicap_text text NOT NULL,
  source_reference text NOT NULL UNIQUE,
  created_at bigint NOT NULL
);

CREATE TABLE goencho_audit_events (
  audit_id text PRIMARY KEY,
  actor_kind text NOT NULL,
  actor_id text,
  action text NOT NULL,
  target_kind text,
  target_id text,
  result_code text NOT NULL,
  request_id text NOT NULL,
  created_at bigint NOT NULL
);

CREATE INDEX idx_goencho_teacher_device_teacher_status
  ON goencho_teacher_device_authorizations(teacher_id, status);
CREATE INDEX idx_goencho_operator_session_device_status
  ON goencho_operator_sessions(device_authorization_id, status);
CREATE INDEX idx_goencho_match_teacher_date
  ON goencho_match_records(teacher_id, played_on, played_at, match_id);
CREATE INDEX idx_goencho_match_teacher_participant
  ON goencho_match_records(teacher_id, participant_id, played_on DESC, played_at DESC, match_id);

CREATE UNIQUE INDEX uq_goencho_one_active_owner
  ON goencho_operators(role) WHERE status = 'active';
CREATE UNIQUE INDEX uq_goencho_operator_active_credential
  ON goencho_operator_credentials(operator_id) WHERE status = 'active';
CREATE UNIQUE INDEX uq_goencho_teacher_active_credential
  ON goencho_teacher_credentials(teacher_id) WHERE status = 'active';
CREATE UNIQUE INDEX uq_goencho_teacher_device_active_session
  ON goencho_teacher_sessions(device_authorization_id) WHERE status = 'active';

INSERT INTO schema_meta(version) VALUES (3);
