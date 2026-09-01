import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const testReceptions = sqliteTable(
  'test_receptions',
  {
    id: text('id').primaryKey(),
    receptionCode: text('reception_code').notNull().unique(),
    status: text('status', { enum: ['in_progress', 'complete'] }).notNull(),
    resumeTokenHash: text('resume_token_hash').notNull().unique(),
    clientRequestId: text('client_request_id').unique(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [index('test_receptions_status_updated_idx').on(table.status, table.updatedAt)],
);

export const receptionSequences = sqliteTable('reception_sequences', {
  eventKey: text('event_key').primaryKey(),
  lastNumber: integer('last_number').notNull(),
});

export const receptions20260902 = sqliteTable(
  'receptions_20260902',
  {
    id: text('id').primaryKey(),
    receptionCode: text('reception_code').notNull().unique(),
    status: text('status', { enum: ['in_progress', 'complete'] }).notNull(),
    resumeTokenHash: text('resume_token_hash').notNull().unique(),
    clientRequestId: text('client_request_id').unique(),
    displayName: text('display_name').unique(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [index('receptions_20260902_status_updated_idx').on(table.status, table.updatedAt)],
);

export const receptionSequences20260902 = sqliteTable('reception_sequences_20260902', {
  eventKey: text('event_key').primaryKey(),
  lastNumber: integer('last_number').notNull(),
});
