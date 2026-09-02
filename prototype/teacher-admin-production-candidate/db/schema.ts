import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const teachers = sqliteTable('teachers', {
  id: text('id').primaryKey(),
  displayName: text('display_name').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const matchRecords = sqliteTable(
  'match_records',
  {
    id: text('id').primaryKey(),
    playedOn: text('played_on').notNull(),
    playedAt: text('played_at'),
    participantId: text('participant_id'),
    participantName: text('participant_name').notNull(),
    rank: text('rank'),
    teacherId: text('teacher_id').notNull().references(() => teachers.id),
    handicapType: text('handicap_type', { enum: ['sen', 'stones'] }),
    stoneCount: integer('stone_count'),
    reverseKomiHalfPoints: integer('reverse_komi_half_points'),
    reverseKomiRecipient: text('reverse_komi_recipient', { enum: ['black'] }).notNull().default('black'),
    result: text('result', { enum: ['participant_win', 'participant_loss', 'jigo'] }),
    source: text('source', { enum: ['app', 'admin'] }).notNull(),
    sourceReference: text('source_reference'),
    createdBy: text('created_by').notNull(),
    updatedBy: text('updated_by').notNull(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    version: integer('version').notNull().default(1),
  },
  (table) => [
    index('match_records_teacher_date_time_idx').on(table.teacherId, table.playedOn, table.playedAt),
    index('match_records_date_time_idx').on(table.playedOn, table.playedAt),
    uniqueIndex('match_records_source_reference_idx').on(table.sourceReference),
    check('match_records_stone_count_check', sql`${table.stoneCount} IS NULL OR (${table.stoneCount} BETWEEN 2 AND 9)`),
    check('match_records_reverse_komi_check', sql`${table.reverseKomiHalfPoints} IS NULL OR ${table.reverseKomiHalfPoints} > 0`),
    check(
      'match_records_handicap_pair_check',
      sql`(${table.handicapType} IS NULL AND ${table.stoneCount} IS NULL) OR (${table.handicapType} = 'sen' AND ${table.stoneCount} IS NULL) OR (${table.handicapType} = 'stones' AND ${table.stoneCount} BETWEEN 2 AND 9)`,
    ),
  ],
);

export const matchRecordAudit = sqliteTable(
  'match_record_audit',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    matchId: text('match_id').notNull().references(() => matchRecords.id),
    action: text('action', { enum: ['create', 'update'] }).notNull(),
    actorId: text('actor_id').notNull(),
    snapshotJson: text('snapshot_json').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [index('match_record_audit_match_created_idx').on(table.matchId, table.createdAt)],
);

export const participants = sqliteTable(
  'participants',
  {
    id: text('id').primaryKey(),
    appNumber: text('app_number').notNull(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('participants_app_number_idx').on(table.appNumber),
    check('participants_app_number_check', sql`length(${table.appNumber}) = 8 AND ${table.appNumber} NOT GLOB '*[^0-9]*'`),
  ],
);

export const receptions = sqliteTable(
  'receptions',
  {
    id: text('id').primaryKey(),
    receivedOn: text('received_on').notNull(),
    sequence: integer('sequence').notNull(),
    receptionNumber: text('reception_number').notNull(),
    displayName: text('display_name').notNull(),
    participantId: text('participant_id').references(() => participants.id),
    receptionStatus: text('reception_status', { enum: ['complete'] }).notNull().default('complete'),
    appLinkStatus: text('app_link_status', { enum: ['unlinked', 'ticket_issued', 'linked'] }).notNull().default('unlinked'),
    stampStatus: text('stamp_status', { enum: ['not_sent', 'pending', 'applied', 'correction'] }).notNull().default('not_sent'),
    receivedAt: text('received_at').notNull(),
    version: integer('version').notNull().default(1),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('receptions_number_idx').on(table.receptionNumber),
    uniqueIndex('receptions_date_sequence_idx').on(table.receivedOn, table.sequence),
    index('receptions_date_status_idx').on(table.receivedOn, table.appLinkStatus, table.stampStatus),
    index('receptions_participant_idx').on(table.participantId),
    check('receptions_sequence_check', sql`${table.sequence} BETWEEN 1 AND 999`),
  ],
);

export const appLinkTickets = sqliteTable(
  'app_link_tickets',
  {
    id: text('id').primaryKey(),
    receptionId: text('reception_id').notNull().references(() => receptions.id),
    tokenHash: text('token_hash').notNull(),
    expiresAt: integer('expires_at').notNull(),
    usedAt: integer('used_at'),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('app_link_tickets_token_hash_idx').on(table.tokenHash),
    index('app_link_tickets_reception_idx').on(table.receptionId, table.createdAt),
  ],
);

export const stampEvents = sqliteTable(
  'stamp_events',
  {
    id: text('id').primaryKey(),
    participantId: text('participant_id').notNull().references(() => participants.id),
    receptionId: text('reception_id').references(() => receptions.id),
    amount: integer('amount').notNull(),
    eventType: text('event_type', { enum: ['participation', 'correction'] }).notNull(),
    status: text('status', { enum: ['pending', 'applied', 'cancelled'] }).notNull(),
    sourceReference: text('source_reference').notNull(),
    actorId: text('actor_id').notNull(),
    reason: text('reason'),
    createdAt: integer('created_at').notNull(),
    appliedAt: integer('applied_at'),
  },
  (table) => [
    uniqueIndex('stamp_events_source_reference_idx').on(table.sourceReference),
    index('stamp_events_participant_status_idx').on(table.participantId, table.status, table.createdAt),
    check('stamp_events_amount_check', sql`${table.amount} IN (-1, 1)`),
  ],
);

export const receptionAudit = sqliteTable(
  'reception_audit',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    receptionId: text('reception_id').notNull().references(() => receptions.id),
    action: text('action').notNull(),
    actorId: text('actor_id').notNull(),
    detailJson: text('detail_json').notNull(),
    reason: text('reason'),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [index('reception_audit_reception_created_idx').on(table.receptionId, table.createdAt)],
);

export const spreadsheetMirror = sqliteTable(
  'spreadsheet_mirror',
  {
    receptionId: text('reception_id').primaryKey().references(() => receptions.id),
    rowJson: text('row_json').notNull(),
    syncStatus: text('sync_status', { enum: ['pending', 'synced', 'error'] }).notNull().default('pending'),
    updatedAt: integer('updated_at').notNull(),
    syncedAt: integer('synced_at'),
  },
  (table) => [index('spreadsheet_mirror_sync_status_idx').on(table.syncStatus, table.updatedAt)],
);
