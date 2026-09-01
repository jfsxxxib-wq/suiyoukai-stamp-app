export const RESULT_LABELS = Object.freeze({
  participant_win: '参加者の勝ち',
  participant_loss: '参加者の負け',
  jigo: '持碁（引き分け）',
});

export function halfPointsToNumber(value) {
  return value == null ? null : value / 2;
}

export function formatPointsFromHalfPoints(value) {
  if (!Number.isInteger(value) || value <= 0) return '';
  const whole = Math.floor(value / 2);
  if (value === 1) return '半目';
  return value % 2 === 0 ? `${whole}目` : `${whole}目半`;
}

export function formatHandicap(record) {
  const base = record?.handicapType === 'sen'
    ? '先'
    : record?.handicapType === 'stones' && Number.isInteger(record.stoneCount)
      ? `${record.stoneCount}子局`
      : '未記入';
  const points = formatPointsFromHalfPoints(record?.reverseKomiHalfPoints);
  return points ? `${base}・逆コミ${points}` : base;
}

/**
 * @typedef {{
 * participantName: string,
 * rank: string | null,
 * teacherId: string,
 * playedOn: string,
 * playedAt: string | null,
 * handicapType: 'sen' | 'stones' | null,
 * stoneCount: number | null,
 * reverseKomiHalfPoints: number | null,
 * reverseKomiRecipient: 'black',
 * result: 'participant_win' | 'participant_loss' | 'jigo' | null
 * }} NormalizedMatch
 */

/** @returns {{ ok: true, value: NormalizedMatch } | { ok: false, message: string }} */
export function normalizeMatchInput(input) {
  const participantName = String(input?.participantName ?? '').trim();
  if (!participantName) return invalid('お名前を入力してください。');

  const teacherId = String(input?.teacherId ?? '').trim();
  if (!teacherId) return invalid('担当の先生を選んでください。');

  const playedOn = String(input?.playedOn ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(playedOn)) return invalid('対局日を正しく入力してください。');

  const playedAtValue = String(input?.playedAt ?? '').trim();
  const playedAt = playedAtValue || null;
  if (playedAt && !/^([01]\d|2[0-3]):[0-5]\d$/.test(playedAt)) return invalid('対局時刻を正しく入力してください。');

  const rankValue = String(input?.rank ?? '').trim();
  const rank = rankValue || null;

  /** @type {'sen' | 'stones' | null} */
  let handicapType = null;
  let stoneCount = null;
  if (input?.handicapType === 'sen') {
    handicapType = 'sen';
  } else if (input?.handicapType === 'stones') {
    const stones = Number(input?.stoneCount);
    if (!Number.isInteger(stones) || stones < 2 || stones > 9) return invalid('置き石は2子から9子で入力してください。');
    handicapType = 'stones';
    stoneCount = stones;
  } else if (input?.handicapType != null && input.handicapType !== '') {
    return invalid('基本の手合いを正しく選んでください。');
  }

  let reverseKomiHalfPoints = null;
  const reverseRaw = input?.reverseKomi;
  if (reverseRaw !== '' && reverseRaw != null) {
    const points = Number(reverseRaw);
    if (!Number.isFinite(points) || points <= 0 || !Number.isInteger(points * 2)) {
      return invalid('逆コミは0.5目単位で入力してください。');
    }
    reverseKomiHalfPoints = points * 2;
  }

  const resultValue = String(input?.result ?? '').trim();
  /** @type {'participant_win' | 'participant_loss' | 'jigo' | null} */
  const result = resultValue || null;
  if (result && !(result in RESULT_LABELS)) return invalid('勝敗を正しく選んでください。');

  return {
    ok: true,
    value: {
      participantName,
      rank,
      teacherId,
      playedOn,
      playedAt,
      handicapType,
      stoneCount,
      reverseKomiHalfPoints,
      reverseKomiRecipient: 'black',
      result,
    },
  };
}

export function isCompleteMatch(record) {
  return Boolean(record.rank && record.handicapType && record.result);
}

/** @returns {{ ok: false, message: string }} */
function invalid(message) {
  return { ok: false, message };
}
