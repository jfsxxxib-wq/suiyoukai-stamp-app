import { sameOriginJson } from '/shared/api.js';
import { consumeEnrollmentFragment } from '/shared/enrollment-url.js';
import { groupMatchesByPeriod, playedAtMinutes } from '/shared/match-periods.js';

const root = document.querySelector('#screen');
const statusLive = document.querySelector('#app-status');
const title = document.querySelector('#teacher-title');
const stageButtons = [...document.querySelectorAll('[data-stage]')];
const pendingPollMs = 10_000;

const state = {
  authState: 'loading',
  busy: false,
  requestInFlight: false,
  claimToken: null,
  purpose: null,
  displayName: '',
  confirmationCode: '',
  reason: '',
  message: '',
  error: '',
  pollTimer: null,
  recordsView: 'today',
  recordsInitialized: false,
  recordsLoading: false,
  recordsRequestInFlight: false,
  recordsError: '',
  matches: [],
  dates: [],
  currentDate: '',
  selectedDate: '',
  selectedParticipantId: '',
  selectedParticipantName: '',
  selectedParticipantRank: '',
  returnView: 'today',
  returnDate: '',
  returnScrollY: 0,
};

const errorMessages = {
  INVALID_ENROLLMENT_TICKET: 'この一回限りQRを確認できませんでした。管理者へ確認してください。',
  ENROLLMENT_TICKET_NOT_ACTIVE: 'この一回限りQRはすでに使用済みです。管理者へ確認してください。',
  ENROLLMENT_TICKET_EXPIRED: '一回限りQRの期限が切れています。管理者へ新しい発行を依頼してください。',
  INVALID_ENROLLMENT_CLAIM: 'PIN設定を続けられません。管理者へ新しい一回限りQRを依頼してください。',
  INVALID_PIN_FORMAT: '先生用PINは6桁の数字で入力してください。',
  INVALID_CREDENTIALS: '先生用PINを確認できませんでした。',
  AUTH_TEMPORARILY_LOCKED: '入力が続けて失敗したため、しばらく待ってからお試しください。',
  TEACHER_DEVICE_REQUIRED: 'この端末はまだ登録されていません。',
  TEACHER_DEVICE_UNKNOWN: 'この端末の登録を確認できません。管理者へ確認してください。',
  TEACHER_DEVICE_UNAVAILABLE: 'この端末ではご縁帳を利用できません。管理者へ確認してください。',
  DEVICE_REVOKED: 'この端末の利用は停止されています。管理者へ確認してください。',
  TEACHER_NOT_ACTIVE: '先生用ご縁帳の利用を安全に停止しました。管理者へ確認してください。',
  TEACHER_SESSION_REQUIRED: '先生用PINを入力してください。',
  TEACHER_SESSION_INVALID: '認証が終了しました。先生用PINをもう一度入力してください。',
  TEACHER_SESSION_DEVICE_MISMATCH: 'この端末の認証を確認できません。先生用PINをもう一度入力してください。',
  SESSION_LOCKED: '無操作時間を過ぎました。先生用PINをもう一度入力してください。',
  ORIGIN_REQUIRED: '安全な接続元を確認できませんでした。',
  ORIGIN_NOT_ALLOWED: '許可されていない接続元です。',
  JSON_REQUIRED: '送信形式を確認できませんでした。',
  SERVICE_UNAVAILABLE: '認証状態を確認できないため、安全に停止しました。',
  INVALID_MATCH_DATE: '日付を確認できませんでした。過去の対局一覧から選び直してください。',
  INVALID_PARTICIPANT_ID: '参加者の記録を確認できませんでした。対局一覧から選び直してください。',
  UNEXPECTED_QUERY: '指定された表示条件を確認できませんでした。',
  INVALID_QUERY: '指定された表示条件を確認できませんでした。',
};

const resultLabels = Object.freeze({
  participant_win: '参加者勝',
  participant_loss: '参加者負',
  pending: '確認中',
  jigo: '持碁',
});

function element(tag, { className, text, attrs } = {}, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  for (const [name, value] of Object.entries(attrs ?? {})) {
    if (value !== undefined && value !== false) node.setAttribute(name, value === true ? '' : String(value));
  }
  for (const child of children) if (child) node.append(child);
  return node;
}

function paragraph(text, className = '') {
  return element('p', { text, className });
}

function infoBox(boxTitle, text, tone = '') {
  return element('div', { className: `card ${tone}`.trim() }, [
    element('strong', { text: boxTitle }),
    document.createTextNode(text),
  ]);
}

function actions(...buttons) {
  return element('div', { className: 'actions' }, buttons);
}

function actionButton(text, className, onClick) {
  const button = element('button', { className, text, attrs: { type: 'button' } });
  button.disabled = state.busy;
  button.addEventListener('click', onClick);
  return button;
}

function field(labelText, { autocomplete = 'off' } = {}) {
  const input = element('input', {
    attrs: {
      type: 'password',
      inputmode: 'numeric',
      maxlength: 6,
      autocomplete,
      placeholder: '6桁の数字',
      required: true,
    },
  });
  return {
    input,
    label: element('label', { className: 'field' }, [element('span', { text: labelText }), input]),
  };
}

function setMessage(message = '', error = '') {
  state.message = message;
  state.error = error;
  statusLive.textContent = error || message;
}

function messageBox() {
  if (state.error) return infoBox('確認してください', state.error, 'warning');
  if (state.message) return infoBox('確認', state.message, 'success');
  return null;
}

function formatDate(dateKey, { withYear = true } = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey ?? '')) return dateKey || '日付確認中';
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'UTC',
    ...(withYear ? { year: 'numeric' } : {}),
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
}

function resultLabel(code) {
  return resultLabels[code] ?? '記録確認中';
}

function clearRecordData({ resetNavigation = true } = {}) {
  state.matches = [];
  state.dates = [];
  state.recordsInitialized = false;
  state.recordsLoading = false;
  state.recordsRequestInFlight = false;
  state.recordsError = '';
  state.currentDate = '';
  if (resetNavigation) {
    state.recordsView = 'today';
    state.selectedDate = '';
    state.selectedParticipantId = '';
    state.selectedParticipantName = '';
    state.selectedParticipantRank = '';
    state.returnView = 'today';
    state.returnDate = '';
    state.returnScrollY = 0;
  }
}

function stageForState() {
  if (state.authState === 'enrollment_claimed') return 'pin';
  if (state.authState === 'pending') return 'pending';
  if (state.authState === 'unlock_required') return 'unlock';
  if (state.authState === 'active') return 'records';
  return 'qr';
}

function updateProgress() {
  const current = stageForState();
  for (const button of stageButtons) {
    const active = button.dataset.stage === current;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  }
}

function updateTitle() {
  title.textContent = state.displayName ? `${state.displayName}の 一局のご縁帳` : '先生の 一局のご縁帳';
}

function screenFrame(screenTitle, lead, content) {
  const heading = element('h2', { text: screenTitle, attrs: { tabindex: '-1' } });
  const header = element('header', { className: 'screen-head' }, [
    element('span', { className: 'step-chip', text: '先生端末' }),
    heading,
    paragraph(lead),
  ]);
  const body = element('div', { className: 'screen-body' }, [messageBox(), ...content]);
  root.replaceChildren(header, body);
  root.setAttribute('aria-busy', String(state.busy || state.requestInFlight || state.recordsLoading));
  updateTitle();
  updateProgress();
  heading.focus({ preventScroll: true });
}

function clearPendingDetails() {
  state.confirmationCode = '';
}

function clearClaim() {
  state.claimToken = null;
  state.purpose = null;
}

function clearPolling() {
  if (state.pollTimer !== null) window.clearTimeout(state.pollTimer);
  state.pollTimer = null;
}

function schedulePendingPoll() {
  clearPolling();
  if (state.authState !== 'pending' || document.visibilityState !== 'visible') return;
  state.pollTimer = window.setTimeout(() => refreshState({ announce: false }), pendingPollMs);
}

function purposeCopy() {
  if (state.purpose === 'new_device') {
    return {
      title: '新しい端末を登録',
      lead: '今まで使っていた先生用PINで、この端末の申請を作ります。',
      label: '現在の先生用PIN',
      button: 'この端末を申請する',
      autocomplete: 'current-password',
    };
  }
  if (state.purpose === 'pin_reset') {
    return {
      title: '先生用PINを再設定',
      lead: '新しいPINを設定すると、以前の先生端末は利用停止になります。',
      label: '新しい先生用PIN',
      button: 'PINを再設定する',
      autocomplete: 'new-password',
    };
  }
  return {
    title: '先生用PINを設定',
    lead: 'リーグPINとは別の、6桁の数字を設定します。',
    label: '新しい先生用PIN',
    button: 'PINを設定する',
    autocomplete: 'new-password',
  };
}

function renderLoading() {
  screenFrame('認証状態を確認しています', 'この端末で安全に開ける画面を確認しています。', [
    infoBox('確認中です', '対局データは取得していません。'),
  ]);
}

function renderEnrollmentRequired() {
  const retry = actionButton('状態をもう一度確認する', 'secondary', () => refreshState({ announce: true }));
  screenFrame('一回限りQRを読み取ってください', 'この端末は、まだ先生端末として登録されていません。', [
    infoBox('管理者から受け取ります', '先生登録で発行された一回限りQRを、この端末で読み取ってください。'),
    paragraph('名前やURL入力だけで別の先生へ切り替わることはありません。', 'mini'),
    actions(retry),
  ]);
}

function renderEnrollmentClaimed() {
  const copy = purposeCopy();
  const pin = field(copy.label, { autocomplete: copy.autocomplete });
  const button = actionButton(copy.button, 'primary', () => submitEnrollmentPin(button, pin.input));
  screenFrame(copy.title, copy.lead, [
    infoBox('確認した先生', state.displayName || '先生名を確認中です'),
    pin.label,
    actions(button),
    paragraph('PIN平文はDB・ログ・画面保存へ残しません。', 'mini'),
  ]);
}

function renderPending() {
  const code = element('div', { className: 'code' }, [
    element('span', { text: '対面確認番号' }),
    element('strong', { text: state.confirmationCode }),
  ]);
  const refresh = actionButton('承認状態を確認する', 'primary', () => refreshState({ announce: true }));
  screenFrame('管理端末の承認待ち', '同じ確認番号を見ていることを、管理者と対面で確認します。', [
    code,
    infoBox('状態：承認待ち', '承認されるまで対局データは取得しません。', 'warning'),
    actions(refresh),
    paragraph('この画面が見えている間だけ、低頻度でも状態を確認します。', 'mini'),
  ]);
}

function renderUnlock() {
  const pin = field('先生用PIN', { autocomplete: 'current-password' });
  const button = actionButton('ご縁帳を開く', 'primary', () => unlock(button, pin.input));
  const reason = state.reason === 'inactivity'
    ? infoBox('無操作時間を過ぎました', '端末承認は失効していません。PIN再認証後に同じ先生として戻ります。', 'success')
    : infoBox('端末は承認済みです', '先生用PINを入力すると利用を開始できます。', 'success');
  screenFrame('先生用PINを入力', 'リーグPINではなく、ご縁帳専用PINを使います。', [
    reason,
    pin.label,
    actions(button),
  ]);
}

function recordNavigation() {
  const today = actionButton('今日の対局', state.recordsView === 'today' ? 'primary' : 'secondary', () => openToday());
  const past = actionButton('過去の対局', state.recordsView === 'dates' ? 'primary' : 'secondary', () => openDates());
  const logout = actionButton('利用を終了', 'secondary', () => logoutSession(logout));
  return element('nav', { className: 'records-nav', attrs: { 'aria-label': '対局記録の表示' } }, [today, past, logout]);
}

function matchCard(match, index, { history = false } = {}) {
  const nameButton = element('button', {
    className: 'match-name',
    text: match.participantDisplayName,
    attrs: { type: 'button', 'aria-label': `${match.participantDisplayName}さんとの対局記録を見る` },
  });
  nameButton.addEventListener('click', () => openParticipant(match));
  const validTime = playedAtMinutes(match.playedAt) !== null;
  const timeLabel = validTime ? match.playedAt : '時刻確認中';
  const when = history ? `${formatDate(match.playedOn, { withYear: false })} ${timeLabel}` : timeLabel;
  return element('article', { className: 'match-card', attrs: { 'data-match-id': match.matchId } }, [
    element('div', { className: 'match-number', text: String(index + 1), attrs: { 'aria-hidden': 'true' } }),
    element('div', { className: 'match-main' }, [
      element('div', { className: 'match-top' }, [
        element('time', { className: 'match-time', text: when, attrs: { datetime: validTime ? `${match.playedOn}T${match.playedAt}` : undefined } }),
        element('span', { className: 'result-tag', text: resultLabel(match.resultCode) }),
      ]),
      nameButton,
      paragraph(`${match.participantDisplayRank || '棋力確認中'}・${match.handicapText}`, 'match-detail'),
    ]),
    element('span', { className: 'match-arrow', text: '›', attrs: { 'aria-hidden': 'true' } }),
  ]);
}

function matchList(matches, { startIndex = 0, ...options } = {}) {
  return element('div', { className: 'match-list' }, matches.map((match, index) => matchCard(match, startIndex + index, options)));
}

function groupedMatchSections(matches) {
  const groups = groupMatchesByPeriod(matches);
  const sections = [];
  let startIndex = 0;
  for (const [key, label] of [['morning', '午前の対局'], ['afternoon', '午後の対局'], ['unconfirmed', '時刻確認中']]) {
    const periodMatches = groups[key];
    if (!periodMatches.length) continue;
    const headingId = `match-period-${key}`;
    sections.push(element('section', { className: 'match-period', attrs: { 'aria-labelledby': headingId } }, [
      element('h3', { className: 'match-period-title', text: `${label}　${periodMatches.length}局`, attrs: { id: headingId } }),
      matchList(periodMatches, { startIndex }),
    ]));
    startIndex += periodMatches.length;
  }
  return sections;
}

function recordsStatusContent() {
  if (state.recordsLoading) return [infoBox('読み込み中です', '認証済みの先生の記録だけを確認しています。')];
  if (state.recordsError) {
    const retry = actionButton('もう一度読み込む', 'secondary', () => retryRecords());
    return [infoBox('記録を読み込めませんでした', state.recordsError, 'warning'), actions(retry)];
  }
  return null;
}

function todayView() {
  const status = recordsStatusContent();
  if (status) return { title: '今日の対局', lead: '対局記録を確認しています。', content: status };
  const count = state.matches.length;
  return {
    title: '今日の対局',
    lead: `${formatDate(state.currentDate)}　${count}局`,
    content: count ? groupedMatchSections(state.matches) : [infoBox('今日の対局はまだありません', '記録が追加されると、ここに表示されます。')],
  };
}

function groupDatesByMonth(dates) {
  const groups = new Map();
  for (const item of dates) {
    const month = item.playedOn.slice(0, 7);
    if (!groups.has(month)) groups.set(month, []);
    groups.get(month).push(item);
  }
  return groups;
}

function datesView() {
  const status = recordsStatusContent();
  if (status) return { title: '過去の対局', lead: '日付ごとの記録を確認しています。', content: status };
  if (!state.dates.length) {
    return { title: '過去の対局', lead: '日付から対局を探します。', content: [infoBox('過去の対局はまだありません', '対局記録がある日付だけが表示されます。')] };
  }
  const blocks = [];
  for (const [month, dates] of groupDatesByMonth(state.dates)) {
    const [year, monthNumber] = month.split('-').map(Number);
    const list = element('div', { className: 'date-list' }, dates.map((item) => {
      const button = element('button', { className: 'date-button', attrs: { type: 'button' } }, [
        element('span', { text: formatDate(item.playedOn) }),
        element('strong', { text: `${item.matchCount}局　›` }),
      ]);
      button.addEventListener('click', () => openDate(item.playedOn));
      return button;
    }));
    blocks.push(element('section', { className: 'month-block' }, [element('h3', { text: `${year}年${monthNumber}月` }), list]));
  }
  return { title: '過去の対局', lead: '日付を選ぶと、その日の対局を表示します。', content: blocks };
}

function dateView() {
  const back = actionButton('‹ 日付一覧へ戻る', 'secondary back-button', () => openDates());
  const status = recordsStatusContent();
  if (status) return { title: formatDate(state.selectedDate), lead: 'この日の対局を確認しています。', content: [back, ...status] };
  const count = state.matches.length;
  return {
    title: formatDate(state.selectedDate),
    lead: `この日の対局　${count}局`,
    content: [back, ...(count ? groupedMatchSections(state.matches) : [infoBox('この日の対局記録はありません', '日付一覧へ戻って選び直せます。')])],
  };
}

function participantView() {
  const backLabel = state.returnView === 'date' ? '‹ この日の対局へ戻る' : '‹ 今日の対局へ戻る';
  const back = actionButton(backLabel, 'secondary back-button', () => returnFromParticipant());
  const status = recordsStatusContent();
  if (status) return { title: `${state.selectedParticipantName} さん`, lead: '先生との対局記録を確認しています。', content: [back, ...status] };
  const count = state.matches.length;
  if (!count) {
    return { title: `${state.selectedParticipantName} さん`, lead: '先生との対局記録', content: [back, infoBox('対局記録はありません', '別の人の記録へ置き換えず、安全に停止しました。', 'warning')] };
  }
  const latest = state.matches[0];
  const first = state.matches[state.matches.length - 1];
  const summary = element('dl', { className: 'history-summary' }, [
    element('dt', { text: '先生とのご縁' }), element('dd', { text: `${count}局目` }),
    element('dt', { text: '最初の対局' }), element('dd', { text: formatDate(first.playedOn) }),
    element('dt', { text: '最近の対局' }), element('dd', { text: formatDate(latest.playedOn) }),
  ]);
  const content = [back, summary];
  if (count >= 2) {
    const progress = [...state.matches].reverse().map((match) => match.handicapText).join(' → ');
    content.push(infoBox('手合の歩み', progress));
  }
  content.push(element('h3', { className: 'section-title', text: '最近の記録' }), matchList(state.matches, { history: true }));
  return {
    title: `${state.selectedParticipantName} さん`,
    lead: `${state.displayName}との対局　${state.selectedParticipantRank || '棋力確認中'}`,
    content,
  };
}

function renderActive() {
  const view = state.recordsView === 'dates' ? datesView()
    : state.recordsView === 'date' ? dateView()
      : state.recordsView === 'participant' ? participantView()
        : todayView();
  screenFrame(view.title, view.lead, [recordNavigation(), ...view.content]);
}

function renderUnavailable() {
  const retry = actionButton('状態をもう一度確認する', 'secondary', () => refreshState({ announce: true }));
  screenFrame('この端末では利用できません', '別の先生へ切り替えず、安全に停止しました。', [
    infoBox('管理者へ確認してください', state.error || '端末の登録状態を確認できません。', 'warning'),
    actions(retry),
  ]);
}

function renderTeacherUnavailable() {
  screenFrame('先生用ご縁帳を開けません', '先生の利用状態または認証設定を安全に確認できませんでした。', [
    infoBox('記録は取得していません', state.error || '管理者へ確認してください。', 'warning'),
  ]);
}

function render() {
  clearPolling();
  if (state.authState === 'loading') renderLoading();
  else if (state.authState === 'enrollment_required') renderEnrollmentRequired();
  else if (state.authState === 'enrollment_claimed') renderEnrollmentClaimed();
  else if (state.authState === 'pending') renderPending();
  else if (state.authState === 'unlock_required') renderUnlock();
  else if (state.authState === 'active') renderActive();
  else if (state.authState === 'teacher_unavailable') renderTeacherUnavailable();
  else renderUnavailable();
  schedulePendingPoll();
}

function isSessionError(error) {
  return error.status === 401 || [
    'TEACHER_SESSION_REQUIRED',
    'TEACHER_SESSION_INVALID',
    'TEACHER_SESSION_DEVICE_MISMATCH',
    'SESSION_LOCKED',
  ].includes(error.message);
}

function handleRecordError(error) {
  if (isSessionError(error)) {
    clearRecordData({ resetNavigation: false });
    if (['TEACHER_DEVICE_REQUIRED', 'TEACHER_DEVICE_UNKNOWN', 'TEACHER_DEVICE_UNAVAILABLE', 'DEVICE_REVOKED'].includes(error.message)) {
      state.authState = 'device_unavailable';
    } else {
      state.authState = 'unlock_required';
      state.reason = error.message === 'SESSION_LOCKED' ? 'inactivity' : 'session_required';
    }
    setMessage('', errorMessages[error.message] ?? '先生用PINをもう一度入力してください。');
    return;
  }
  if (error.status === 403 || error.status === 503) {
    clearRecordData({ resetNavigation: false });
    state.authState = 'teacher_unavailable';
    setMessage('', errorMessages[error.message] ?? '対局記録を安全に確認できないため停止しました。');
    return;
  }
  state.recordsError = errorMessages[error.message] ?? '通信状態を確認して、もう一度お試しください。';
}

async function loadRecords(path, apply) {
  if (state.recordsRequestInFlight || state.authState !== 'active') return;
  state.recordsRequestInFlight = true;
  state.recordsLoading = true;
  state.recordsError = '';
  state.matches = [];
  render();
  try {
    const result = await sameOriginJson(path);
    apply(result);
    state.recordsInitialized = true;
  } catch (error) {
    handleRecordError(error);
  } finally {
    state.recordsRequestInFlight = false;
    state.recordsLoading = false;
    render();
  }
}

async function openToday() {
  state.recordsView = 'today';
  state.selectedDate = '';
  state.selectedParticipantId = '';
  await loadRecords('/api/teacher/matches/today', (result) => {
    state.currentDate = result.date ?? '';
    state.matches = Array.isArray(result.matches) ? result.matches : [];
  });
}

async function openDates() {
  state.recordsView = 'dates';
  state.selectedDate = '';
  state.selectedParticipantId = '';
  await loadRecords('/api/teacher/matches/dates', (result) => {
    state.dates = Array.isArray(result.dates) ? result.dates : [];
  });
}

async function openDate(date) {
  state.recordsView = 'date';
  state.selectedDate = date;
  state.selectedParticipantId = '';
  await loadRecords(`/api/teacher/matches/by-date?date=${encodeURIComponent(date)}`, (result) => {
    state.selectedDate = result.date ?? date;
    state.matches = Array.isArray(result.matches) ? result.matches : [];
  });
}

async function openParticipant(match) {
  state.returnView = state.recordsView === 'date' ? 'date' : 'today';
  state.returnDate = state.selectedDate;
  state.returnScrollY = window.scrollY;
  state.recordsView = 'participant';
  state.selectedParticipantId = match.participantId;
  state.selectedParticipantName = match.participantDisplayName;
  state.selectedParticipantRank = match.participantDisplayRank;
  await loadRecords(`/api/teacher/participants/${encodeURIComponent(match.participantId)}/matches`, (result) => {
    state.matches = Array.isArray(result.matches) ? result.matches : [];
  });
}

async function returnFromParticipant() {
  const scrollY = state.returnScrollY;
  if (state.returnView === 'date' && state.returnDate) await openDate(state.returnDate);
  else await openToday();
  window.scrollTo({ top: scrollY, behavior: 'instant' });
}

function retryRecords() {
  if (state.recordsView === 'dates') return openDates();
  if (state.recordsView === 'date') return openDate(state.selectedDate);
  if (state.recordsView === 'participant') {
    return loadRecords(`/api/teacher/participants/${encodeURIComponent(state.selectedParticipantId)}/matches`, (result) => {
      state.matches = Array.isArray(result.matches) ? result.matches : [];
    });
  }
  return openToday();
}

function resumeRecordsView() {
  if (state.recordsView === 'dates') return openDates();
  if (state.recordsView === 'date' && state.selectedDate) return openDate(state.selectedDate);
  if (state.recordsView === 'participant' && state.selectedParticipantId) {
    return loadRecords(`/api/teacher/participants/${encodeURIComponent(state.selectedParticipantId)}/matches`, (result) => {
      state.matches = Array.isArray(result.matches) ? result.matches : [];
    });
  }
  return openToday();
}

function applyServerState(result) {
  const wasActive = state.authState === 'active';
  state.authState = result.state;
  state.displayName = result.displayName ?? '';
  state.reason = result.reason ?? '';
  if (result.state === 'pending') state.confirmationCode = result.confirmationCode ?? '';
  else clearPendingDetails();
  if (result.state !== 'active') clearRecordData();
  else if (!wasActive) state.recordsInitialized = false;
}

function handleStateError(error) {
  clearRecordData();
  clearPendingDetails();
  clearClaim();
  setMessage('', errorMessages[error.message] ?? '認証状態を確認できませんでした。');
  if (error.status === 403 || error.status === 503) state.authState = 'teacher_unavailable';
  else state.authState = 'device_unavailable';
}

async function refreshState({ announce = false } = {}) {
  if (state.requestInFlight || state.busy) return;
  state.requestInFlight = true;
  try {
    const result = await sameOriginJson('/api/teacher/state');
    applyServerState(result);
    if (announce) setMessage('現在の承認状態を確認しました。');
    else setMessage();
  } catch (error) {
    handleStateError(error);
  } finally {
    state.requestInFlight = false;
    render();
  }
  if (state.authState === 'active' && !state.recordsInitialized) await resumeRecordsView();
}

async function run(button, work) {
  if (state.busy || state.requestInFlight) return;
  state.busy = true;
  button.disabled = true;
  root.setAttribute('aria-busy', 'true');
  setMessage();
  try {
    await work();
  } finally {
    state.busy = false;
    render();
  }
}

async function submitEnrollmentPin(button, input) {
  const pin = input.value;
  input.value = '';
  await run(button, async () => {
    try {
      const result = await sameOriginJson('/api/teacher/enrollment/set-pin', {
        method: 'POST',
        body: { claimToken: state.claimToken, pin },
      });
      clearClaim();
      state.authState = 'pending';
      state.confirmationCode = result.confirmationCode ?? '';
      state.reason = '';
      setMessage('端末申請を作成しました。管理端末の承認を待ちます。');
    } catch (error) {
      setMessage('', errorMessages[error.message] ?? '端末申請を完了できませんでした。');
      const canRetryPin = [400, 429].includes(error.status) || error.message === 'INVALID_CREDENTIALS';
      if (!canRetryPin) {
        clearClaim();
        state.authState = error.status === 403 ? 'teacher_unavailable' : 'enrollment_required';
      }
    }
  });
}

async function unlock(button, input) {
  const pin = input.value;
  input.value = '';
  await run(button, async () => {
    try {
      await sameOriginJson('/api/teacher/session/unlock', { method: 'POST', body: { pin } });
      state.authState = 'active';
      state.reason = '';
      clearPendingDetails();
      setMessage('先生用ご縁帳の認証が完了しました。');
    } catch (error) {
      setMessage('', errorMessages[error.message] ?? '先生用PINを確認できませんでした。');
      if (error.status === 403) state.authState = 'teacher_unavailable';
      else if (error.message === 'TEACHER_DEVICE_UNAVAILABLE' || error.message === 'DEVICE_REVOKED') {
        state.authState = 'device_unavailable';
      } else state.authState = 'unlock_required';
    }
  });
  if (state.authState === 'active' && !state.recordsInitialized) await openToday();
}

async function logoutSession(button) {
  await run(button, async () => {
    try {
      await sameOriginJson('/api/teacher/session/logout', { method: 'POST', body: {} });
      clearRecordData();
      state.authState = 'unlock_required';
      state.reason = 'logged_out';
      setMessage('利用を終了しました。端末承認は維持されています。');
    } catch (error) {
      setMessage('', errorMessages[error.message] ?? '利用終了を確認できませんでした。');
    }
  });
}

async function claimEnrollment(ticket) {
  state.requestInFlight = true;
  state.authState = 'loading';
  render();
  try {
    const result = await sameOriginJson('/api/teacher/enrollment/claim', { method: 'POST', body: { ticket } });
    state.claimToken = result.claimToken;
    state.purpose = result.purpose;
    state.displayName = result.displayName ?? '';
    state.authState = 'enrollment_claimed';
    setMessage('一回限りQRを確認しました。');
  } catch (error) {
    clearClaim();
    state.authState = error.status === 403 ? 'teacher_unavailable' : 'enrollment_required';
    setMessage('', errorMessages[error.message] ?? '一回限りQRを確認できませんでした。');
  } finally {
    state.requestInFlight = false;
    render();
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && state.authState === 'pending') refreshState({ announce: false });
  else if (document.visibilityState !== 'visible') clearPolling();
});

const enrollmentTicket = consumeEnrollmentFragment(window.location, window.history);
if (enrollmentTicket) claimEnrollment(enrollmentTicket);
else refreshState({ announce: false });
