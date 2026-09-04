import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const participants=sqliteTable('gate_participants',{
 id:text('id').primaryKey(), number:text('number').notNull().unique(), family:text('family').notNull(), given:text('given').notNull(),
 requestHash:text('request_hash').notNull().unique(), sessionHash:text('session_hash').notNull().unique(), created:text('created').notNull(),
 appNumber:text('app_number'), version:integer('version').notNull().default(1), synced:integer('synced').notNull().default(0)
});
export const tickets=sqliteTable('gate_tickets',{hash:text('hash').primaryKey(),participantId:text('participant_id').notNull().references(()=>participants.id),expires:integer('expires').notNull(),used:integer('used').notNull().default(0)});
export const devices=sqliteTable('gate_devices',{hash:text('hash').primaryKey(),participantId:text('participant_id').notNull().references(()=>participants.id),created:integer('created').notNull()});
export const rates=sqliteTable('gate_rates',{key:text('key').primaryKey(),count:integer('count').notNull(),expires:integer('expires').notNull()});
export const historyClaims=sqliteTable('history_claims',{id:text('id').primaryKey(),deviceHash:text('device_hash').notNull(),appNumber:text('app_number').notNull(),completed:text('completed'),synced:integer('synced').notNull().default(0)});
