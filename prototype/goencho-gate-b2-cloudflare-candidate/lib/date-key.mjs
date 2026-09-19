import { fail } from './errors.mjs';

const tokyoDateFormatter = new Intl.DateTimeFormat('en', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function japanDateKey(timestamp) {
  const parts = Object.fromEntries(tokyoDateFormatter.formatToParts(new Date(timestamp))
    .filter((part) => part.type !== 'literal')
    .map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function requireDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    fail(400, 'INVALID_MATCH_DATE', 'Match date must be YYYY-MM-DD');
  }
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    fail(400, 'INVALID_MATCH_DATE', 'Match date is not a calendar date');
  }
  return value;
}

export function requireParticipantId(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value)) {
    fail(400, 'INVALID_PARTICIPANT_ID', 'Participant ID format is invalid');
  }
  return value;
}
