export function consumeEnrollmentFragment(locationLike, historyLike) {
  const raw = locationLike.hash?.startsWith('#') ? locationLike.hash.slice(1) : '';
  const params = new URLSearchParams(raw);
  const ticket = params.get('enrollment');
  if (!ticket) return null;
  historyLike.replaceState(null, '', `${locationLike.pathname}${locationLike.search}`);
  return ticket;
}
