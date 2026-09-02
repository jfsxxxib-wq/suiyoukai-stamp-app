export type Teacher = { id: string; displayName: string };

export type Match = {
  id: string;
  playedOn: string;
  playedAt: string | null;
  participantName: string;
  rank: string | null;
  teacherId: string;
  teacherName: string;
  handicapType: 'sen' | 'stones' | null;
  stoneCount: number | null;
  reverseKomiHalfPoints: number | null;
  reverseKomiRecipient: 'black';
  result: 'participant_win' | 'participant_loss' | 'jigo' | null;
  source: 'app' | 'admin';
  version: number;
};

export const resultLabels = {
  participant_win: '参加者の勝ち',
  participant_loss: '参加者の負け',
  jigo: '持碁（引き分け）',
} as const;

export function formatHandicap(match: Match) {
  const base = match.handicapType === 'sen' ? '先' : match.handicapType === 'stones' ? `${match.stoneCount}子局` : '未記入';
  const half = match.reverseKomiHalfPoints;
  if (!half) return base;
  const whole = Math.floor(half / 2);
  const points = half === 1 ? '半目' : half % 2 === 0 ? `${whole}目` : `${whole}目半`;
  return `${base}・逆コミ${points}`;
}

export function localActorHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const localRole = new URLSearchParams(window.location.search).get('localRole');
  return localRole ? { 'x-suiyoukai-test-actor': localRole } : {};
}

export function todayInputValue() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
