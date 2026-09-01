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
