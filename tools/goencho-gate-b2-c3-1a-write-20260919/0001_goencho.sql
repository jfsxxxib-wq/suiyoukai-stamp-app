CREATE TABLE IF NOT EXISTS schema_meta (
  version INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS goencho_operators (
  operator_id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role = 'owner'),
  status TEXT NOT NULL CHECK (status IN ('active', 'locked', 'revoked')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS goencho_operator_credentials (
  credential_id TEXT PRIMARY KEY,
  operator_id TEXT NOT NULL REFERENCES goencho_operators(operator_id),
  salt TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  algorithm TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'superseded', 'revoked')),
  created_at INTEGER NOT NULL,
  changed_at INTEGER
);

CREATE TABLE IF NOT EXISTS goencho_operator_devices (
  device_authorization_id TEXT PRIMARY KEY,
  operator_id TEXT NOT NULL REFERENCES goencho_operators(operator_id),
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('approved', 'revoked')),
  created_at INTEGER NOT NULL,
  approved_at INTEGER NOT NULL,
  last_seen_at INTEGER,
  revoked_at INTEGER,
  revocation_reason TEXT
);

CREATE TABLE IF NOT EXISTS goencho_operator_sessions (
  session_id TEXT PRIMARY KEY,
  device_authorization_id TEXT NOT NULL REFERENCES goencho_operator_devices(device_authorization_id),
  session_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'locked', 'revoked')),
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  locked_at INTEGER,
  revoked_at INTEGER
);

CREATE TABLE IF NOT EXISTS goencho_bootstrap_tickets (
  ticket_id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'consumed', 'revoked')),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER
);

CREATE TABLE IF NOT EXISTS goencho_operator_recovery_codes (
  recovery_code_id TEXT PRIMARY KEY,
  operator_id TEXT NOT NULL REFERENCES goencho_operators(operator_id),
  batch_id TEXT NOT NULL,
  code_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'consumed', 'revoked')),
  created_at INTEGER NOT NULL,
  consumed_at INTEGER,
  revoked_at INTEGER
);

CREATE TABLE IF NOT EXISTS goencho_teachers (
  teacher_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'revoked')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS goencho_teacher_credentials (
  credential_id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES goencho_teachers(teacher_id),
  salt TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  algorithm TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'superseded', 'revoked')),
  created_at INTEGER NOT NULL,
  changed_at INTEGER
);

CREATE TABLE IF NOT EXISTS goencho_teacher_enrollment_tickets (
  ticket_id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES goencho_teachers(teacher_id),
  token_hash TEXT NOT NULL UNIQUE,
  claim_hash TEXT UNIQUE,
  purpose TEXT NOT NULL CHECK (purpose IN ('initial', 'new_device', 'pin_reset')),
  status TEXT NOT NULL CHECK (status IN ('active', 'claimed', 'consumed', 'revoked')),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  claimed_at INTEGER,
  consumed_at INTEGER,
  revoked_at INTEGER
);

CREATE TABLE IF NOT EXISTS goencho_teacher_device_authorizations (
  device_authorization_id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES goencho_teachers(teacher_id),
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'revoked')),
  confirmation_code TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  approved_at INTEGER,
  last_seen_at INTEGER,
  revoked_at INTEGER,
  revocation_reason TEXT,
  approved_by_operator_id TEXT REFERENCES goencho_operators(operator_id),
  replaced_by_authorization_id TEXT REFERENCES goencho_teacher_device_authorizations(device_authorization_id)
);

CREATE TABLE IF NOT EXISTS goencho_teacher_sessions (
  session_id TEXT PRIMARY KEY,
  device_authorization_id TEXT NOT NULL REFERENCES goencho_teacher_device_authorizations(device_authorization_id),
  session_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'locked', 'revoked')),
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  locked_at INTEGER,
  revoked_at INTEGER
);

CREATE TABLE IF NOT EXISTS goencho_auth_attempts (
  scope_key TEXT PRIMARY KEY,
  failure_count INTEGER NOT NULL,
  locked_until INTEGER,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS goencho_participants (
  participant_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  display_rank TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS goencho_verified_person_links (
  link_id TEXT PRIMARY KEY,
  teacher_id TEXT REFERENCES goencho_teachers(teacher_id),
  participant_id TEXT REFERENCES goencho_participants(participant_id),
  league_member_id TEXT,
  verified_by_operator_id TEXT REFERENCES goencho_operators(operator_id),
  verified_at INTEGER NOT NULL,
  UNIQUE (teacher_id, participant_id, league_member_id)
);

CREATE TABLE IF NOT EXISTS goencho_match_records (
  match_id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES goencho_teachers(teacher_id),
  participant_id TEXT NOT NULL REFERENCES goencho_participants(participant_id),
  played_on TEXT NOT NULL,
  played_at TEXT NOT NULL,
  result_code TEXT NOT NULL,
  handicap_text TEXT NOT NULL,
  source_reference TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS goencho_audit_events (
  audit_id TEXT PRIMARY KEY,
  actor_kind TEXT NOT NULL,
  actor_id TEXT,
  action TEXT NOT NULL,
  target_kind TEXT,
  target_id TEXT,
  result_code TEXT NOT NULL,
  request_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_goencho_teacher_device_teacher_status
  ON goencho_teacher_device_authorizations(teacher_id, status);
CREATE INDEX IF NOT EXISTS idx_goencho_operator_session_device_status
  ON goencho_operator_sessions(device_authorization_id, status);
CREATE INDEX IF NOT EXISTS idx_goencho_match_teacher_date
  ON goencho_match_records(teacher_id, played_on, played_at, match_id);
CREATE INDEX IF NOT EXISTS idx_goencho_match_teacher_participant
  ON goencho_match_records(teacher_id, participant_id, played_on DESC, played_at DESC, match_id);

DELETE FROM schema_meta;
INSERT INTO schema_meta(version) VALUES (2);
