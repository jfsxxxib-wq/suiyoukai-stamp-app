import { readFileSync } from 'node:fs';

const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');
const teacherDeviceBlock = schema.match(/CREATE TABLE IF NOT EXISTS goencho_teacher_device_authorizations[\s\S]*?\);/)?.[0] ?? '';
const ownerSessionBlock = schema.match(/CREATE TABLE IF NOT EXISTS goencho_operator_sessions[\s\S]*?\);/)?.[0] ?? '';

if (!teacherDeviceBlock) throw new Error('teacher device table is missing');
if (/expires_at/i.test(teacherDeviceBlock)) throw new Error('teacher device authorization must not contain expires_at');
if (!ownerSessionBlock) throw new Error('owner session table is missing');
if (/session_token/i.test(ownerSessionBlock)) throw new Error('owner session table must not store raw session tokens');
if (!/session_hash/i.test(ownerSessionBlock)) throw new Error('owner session table must store only a session hash');
if (/test_receptions|\breceptions\b/i.test(schema)) throw new Error('forbidden reception table reference');

process.stdout.write('schema invariants passed\n');
