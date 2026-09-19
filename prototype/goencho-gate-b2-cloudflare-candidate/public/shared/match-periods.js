export const AFTERNOON_START_MINUTES = 12 * 60;

export function playedAtMinutes(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function matchPeriod(playedAt, afternoonStartMinutes = AFTERNOON_START_MINUTES) {
  if (!Number.isInteger(afternoonStartMinutes) || afternoonStartMinutes < 1 || afternoonStartMinutes > 1439) {
    throw new RangeError('Afternoon boundary must be a minute within one day');
  }
  const minutes = playedAtMinutes(playedAt);
  if (minutes === null) return 'unconfirmed';
  return minutes < afternoonStartMinutes ? 'morning' : 'afternoon';
}

export function groupMatchesByPeriod(matches, afternoonStartMinutes = AFTERNOON_START_MINUTES) {
  if (!Array.isArray(matches)) throw new TypeError('Matches must be an array');
  const groups = { morning: [], afternoon: [], unconfirmed: [] };
  for (const match of matches) {
    groups[matchPeriod(match?.playedAt, afternoonStartMinutes)].push(match);
  }
  return groups;
}
