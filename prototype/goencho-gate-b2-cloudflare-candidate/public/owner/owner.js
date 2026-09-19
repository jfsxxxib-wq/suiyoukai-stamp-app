import { sameOriginJson } from '/shared/api.js';

const root = document.querySelector('#screen');
const statusLive = document.querySelector('#app-status');
const navButtons = [...document.querySelectorAll('[data-screen]')];
const confirmDialog = document.querySelector('#confirm-dialog');
const confirmKind = document.querySelector('#confirm-kind');
const confirmTitle = document.querySelector('#confirm-title');
const confirmMessage = document.querySelector('#confirm-message');
const confirmAction = document.querySelector('#confirm-action');

const state = {
  ownerState: 'loading',
  screen: 1,
  busy: false,
  oneTimeCodes: null,
  enrollmentLink: '',
  pending: [],
  approved: [],
  selectedDevice: null,
  viewApproved: false,
  message: '',
  error: '',
};

const errorMessages = {
  INVALID_PIN_FORMAT: 'PINは6桁の数字で入力してください。',
  INVALID_BOOTSTRAP_TICKET: '一回限り券を確認できませんでした。',
  BOOTSTRAP_TICKET_NOT_ACTIVE: 'この一回限り券は使用できません。',
  BOOTSTRAP_TICKET_EXPIRED: '一回限り券の期限が切れています。',
  OWNER_ALREADY_EXISTS: '管理者はすでに登録されています。紛失復旧を利用してください。',
  INVALID_RECOVERY_CODE: '復旧コードを確認できませんでした。',
  AUTH_TEMPORARILY_LOCKED: '入力が続けて失敗したため、しばらく待ってからお試しください。',
  OWNER_SESSION_REQUIRED: '管理用PINを入力して、管理画面を開き直してください。',
  OWNER_SESSION_INVALID: '管理sessionが終了しました。PINをもう一度入力してください。',
  OWNER_SESSION_LOCKED: '無操作時間を過ぎました。PINをもう一度入力してください。',
  OWNER_DEVICE_NOT_APPROVED: 'この端末では管理画面を開けません。紛失復旧を確認してください。',
  OWNER_NOT_ACTIVE: '管理操作を安全に停止しました。',
  INVALID_DISPLAY_NAME: '先生の表示名を入力してください。',
  INVALID_DEVICE_STATUS: '端末一覧の状態を確認できませんでした。',
  DEVICE_NOT_FOUND: '対象の端末申請が見つかりません。',
  DEVICE_NOT_PENDING: 'この申請の状態が変わりました。一覧を読み直してください。',
  CONFIRMATION_MISMATCH: '確認番号が一致しません。一覧を読み直してください。',
  DEVICE_NOT_REVOCABLE: 'この端末はすでに状態が変わっています。',
  ORIGIN_REQUIRED: '安全な接続元を確認できませんでした。',
  ORIGIN_NOT_ALLOWED: '許可されていない接続元です。',
  JSON_REQUIRED: '送信形式を確認できませんでした。',
  SERVICE_UNAVAILABLE: '処理を完了できませんでした。記録は変更済みとみなさず、もう一度状態を確認してください。',
};

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

function actionButton(text, className, onClick, { disabled = false } = {}) {
  const button = element('button', { className, text, attrs: { type: 'button' } });
  button.disabled = disabled || state.busy;
  button.addEventListener('click', onClick);
  return button;
}

function field(labelText, options = {}) {
  const input = element('input', {
    attrs: {
      type: options.type ?? 'text',
      inputmode: options.inputmode,
      maxlength: options.maxlength,
      autocomplete: options.autocomplete ?? 'off',
      placeholder: options.placeholder,
      required: true,
    },
  });
  const label = element('label', { className: 'field' }, [element('span', { text: labelText }), input]);
  return { label, input };
}

function infoBox(title, text, tone = '') {
  return element('div', { className: `card ${tone}`.trim() }, [
    element('strong', { text: title }),
    document.createTextNode(text),
  ]);
}

function actions(...buttons) {
  return element('div', { className: 'actions' }, buttons);
}

function setMessage(message = '', error = '') {
  state.message = message;
  state.error = error;
  statusLive.textContent = error || message;
}

function messageBox() {
  if (state.error) return infoBox('操作を完了できませんでした', state.error, 'warning');
  if (state.message) return infoBox('確認', state.message, 'success');
  return null;
}

function screenFrame(step, title, lead, content) {
  const heading = element('h2', { text: title, attrs: { tabindex: '-1' } });
  const header = element('header', { className: 'screen-head' }, [
    element('span', { className: 'step-chip', text: step ? `画面 ${step} / 6` : '管理端末' }),
    heading,
    paragraph(lead),
  ]);
  const body = element('div', { className: 'screen-body' }, [messageBox(), ...content]);
  root.replaceChildren(header, body);
  root.setAttribute('aria-busy', String(state.busy));
  updateNavigation(step);
  heading.focus({ preventScroll: true });
}

function updateNavigation(step) {
  for (const button of navButtons) {
    const screen = Number(button.dataset.screen);
    const allowed = state.ownerState === 'active' && [3, 4, 5, 6].includes(screen);
    const codeScreen = screen === 2 && Array.isArray(state.oneTimeCodes);
    const setupScreen = screen === 1 && state.ownerState === 'setup_required';
    button.disabled = state.busy || !(allowed || codeScreen || setupScreen);
    button.classList.toggle('active', screen === step);
    if (screen === step) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  }
}

function secretBody(inputMap) {
  return Object.fromEntries(Object.entries(inputMap).map(([key, input]) => [key, input.value]));
}

function clearInputs(...inputs) {
  for (const input of inputs) input.value = '';
}

async function run(button, work) {
  if (state.busy) return;
  state.busy = true;
  button.disabled = true;
  setMessage();
  root.setAttribute('aria-busy', 'true');
  try {
    await work();
  } catch (error) {
    setMessage('', errorMessages[error.message] ?? '安全のため処理を停止しました。');
    if (error.status === 401 || error.status === 403) await refreshOwnerState(false);
  } finally {
    state.busy = false;
    render();
  }
}

function renderLoading() {
  screenFrame(null, '管理状態を確認しています', 'この端末で安全に開ける画面を確認しています。', [
    infoBox('確認中です', '先生や対局の情報はまだ取得していません。'),
  ]);
}

function renderUnavailable() {
  screenFrame(null, '管理画面を開けません', '設定を安全に確認できなかったため停止しました。', [
    infoBox('記録は変更していません', '別の管理者へ切り替えて続行することはありません。', 'warning'),
    actions(actionButton('もう一度確認する', 'secondary', () => refreshOwnerState())),
  ]);
}

function renderUnlock() {
  const pin = field('管理用PIN', { type: 'password', inputmode: 'numeric', maxlength: 6, placeholder: '6桁の数字' });
  const button = actionButton('管理画面を開く', 'primary', () => run(button, async () => {
    try {
      await sameOriginJson('/api/owner/session/unlock', { method: 'POST', body: secretBody({ pin: pin.input }) });
    } finally {
      clearInputs(pin.input);
    }
    state.ownerState = 'active';
    state.screen = 4;
    setMessage('管理画面を開きました。');
  }));
  screenFrame(null, '管理画面を開く', 'この端末の承認を確認してから、管理用PINを一度入力します。', [
    infoBox('この管理端末は登録済みです', '先生登録や端末承認を行うため、短時間の管理sessionを開きます。', 'success'),
    pin.label,
    actions(button, actionButton('管理端末を紛失した場合', 'secondary', () => { state.ownerState = 'recovery_required'; state.screen = 3; render(); })),
    paragraph('PINはこの解除時だけ送ります。先生登録や一覧表示のたびには送りません。', 'mini'),
  ]);
}

function renderSetup() {
  const ticket = field('一回限り券', { placeholder: '事前に安全に渡された券' });
  const pin = field('管理用PIN', { type: 'password', inputmode: 'numeric', maxlength: 6, placeholder: '6桁の数字' });
  const button = actionButton('この端末を登録する', 'primary', () => run(button, async () => {
    let result;
    try {
      result = await sameOriginJson('/api/owner/bootstrap/activate', {
        method: 'POST', body: secretBody({ ticket: ticket.input, pin: pin.input }),
      });
    } finally {
      clearInputs(ticket.input, pin.input);
    }
    state.oneTimeCodes = [...result.recoveryCodes];
    state.ownerState = 'active';
    state.screen = 2;
  }));
  screenFrame(1, '管理端末を最初に登録', '悦子さんが、先生の端末を承認するための管理端末を準備します。', [
    infoBox('現在使う管理端末は1台です。', '紛失・交換時は、復旧手続きで以前の管理端末を解除します。'),
    ticket.label,
    pin.label,
    actions(button),
    paragraph('最初に訪れただけでは管理者になれません。', 'mini'),
  ]);
}

function clearOneTimeCodes() {
  if (state.oneTimeCodes) state.oneTimeCodes.fill('');
  state.oneTimeCodes = null;
}

function renderRecoveryCodes() {
  const list = element('div', { className: 'code-list', attrs: { 'aria-label': '復旧コード' } });
  for (const code of state.oneTimeCodes ?? []) list.append(element('code', { text: code }));
  const checkbox = element('input', { attrs: { type: 'checkbox', id: 'codes-stored' } });
  const done = actionButton('表示を消して次へ', 'primary', () => {
    if (!checkbox.checked) return;
    list.replaceChildren();
    clearOneTimeCodes();
    state.screen = 4;
    setMessage('復旧コードの表示を消しました。');
    render();
  }, { disabled: true });
  checkbox.addEventListener('change', () => { done.disabled = !checkbox.checked || state.busy; });
  screenFrame(2, '復旧コードを保存', '管理端末を紛失したときだけ使う、1回限りのコードです。', [
    infoBox('この画面を閉じると、同じコードはもう表示できません。', '印刷または紙へ書き写し、管理端末とは別の安全な場所に保管してください。', 'warning'),
    list,
    element('label', { className: 'confirm-row' }, [checkbox, element('span', { text: '5個すべてを印刷または書き写し、別の場所へ保管しました' })]),
    actions(done),
    paragraph('clipboardへ自動コピーせず、browserにも保存しません。', 'mini'),
  ]);
}

function renderRecovery() {
  const code = field('復旧コード', { type: 'password', placeholder: '保管している一回限りコード' });
  const pin = field('新しい管理用PIN', { type: 'password', inputmode: 'numeric', maxlength: 6, placeholder: '6桁の数字' });
  const execute = async () => {
    let result;
    try {
      result = await sameOriginJson('/api/owner/recovery/consume', {
        method: 'POST', body: secretBody({ recoveryCode: code.input, newPin: pin.input }),
      });
    } finally {
      clearInputs(code.input, pin.input);
    }
    state.oneTimeCodes = [...result.recoveryCodes];
    state.ownerState = 'active';
    state.screen = 2;
  };
  const button = actionButton('解除内容を確認する', 'danger', () => openConfirmation({
    kind: '紛失復旧の最終確認',
    title: '以前の管理端末を解除しますか？',
    message: 'この操作のあと、以前の管理端末と管理sessionは使えなくなります。新しい復旧コード5個を一度だけ表示します。',
    confirmText: '解除して復旧する',
    onConfirm: () => run(button, execute),
  }));
  screenFrame(3, '管理端末を紛失したとき', '保管した復旧コードで、新しい管理端末へ安全に引き継ぎます。', [
    infoBox('復旧すると、以前の管理端末は使えなくなります。', '復旧コードをすべて失った場合、Web上の迂回復旧は行わず安全に停止します。', 'warning'),
    code.label,
    pin.label,
    actions(button, state.ownerState === 'active' ? actionButton('管理画面へ戻る', 'secondary', () => { state.screen = 4; render(); }) : null),
  ]);
}

function renderTeacherRegistration() {
  const name = field('先生の表示名', { placeholder: '例：青葉先生' });
  const button = actionButton('先生を登録して一回限りlinkを作る', 'primary', () => run(button, async () => {
    const result = await sameOriginJson('/api/owner/teacher-enrollments', {
      method: 'POST', body: { displayName: name.input.value },
    });
    name.input.value = '';
    state.enrollmentLink = `http://localhost:4192/#enrollment=${encodeURIComponent(result.ticket)}`;
    setMessage('先生を登録し、一回限りlinkを作成しました。');
  }));
  const content = [
    name.label,
    infoBox('名前だけでは人物を結びません', 'teacher_idはserverが生成し、リーグ参加者IDとは分けて扱います。'),
    actions(button),
  ];
  if (state.enrollmentLink) {
    content.push(infoBox('一回限りlinkを表示中', 'この画面を離れると表示を消します。', 'success'));
    content.push(element('p', { className: 'one-time-link', text: state.enrollmentLink }));
    content.push(paragraph('B1では本物のQR画像を作らず、同一browser用のlinkだけを確認します。', 'mini'));
  }
  content.push(actions(
    actionButton('承認待ちを見る', 'secondary', () => goToScreen(5)),
    actionButton('管理を終了する', 'secondary', logout),
  ));
  screenFrame(4, '先生を登録', '本人確認を終えた先生の表示名を入力します。', content);
}

function deviceCard(device, actionText, onAction, tone = '') {
  const card = element('div', { className: `card ${tone}`.trim() });
  card.append(element('strong', { text: device.display_name }));
  const meta = element('dl', { className: 'meta' });
  const entries = [['状態', device.status === 'pending' ? '承認待ち' : '承認済み・期限なし']];
  if (device.confirmation_code) entries.push(['確認番号', device.confirmation_code]);
  entries.push(['申請時刻', formatTime(device.created_at)]);
  if (device.last_seen_at) entries.push(['最終利用', formatTime(device.last_seen_at)]);
  for (const [term, value] of entries) meta.append(element('dt', { text: term }), element('dd', { text: value }));
  card.append(meta);
  if (actionText) card.append(actions(actionButton(actionText, device.status === 'approved' ? 'danger' : 'primary', onAction)));
  return card;
}

function formatTime(milliseconds) {
  if (!Number.isFinite(milliseconds)) return '記録なし';
  return new Intl.DateTimeFormat('ja-JP', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Tokyo' })
    .format(new Date(milliseconds));
}

async function loadDevices(status) {
  const result = await sameOriginJson(`/api/owner/teacher-devices?status=${encodeURIComponent(status)}`);
  state[status] = result.devices;
}

function renderPending() {
  const content = [];
  if (!state.pending.length) content.push(infoBox('承認待ちの申請はありません', '先生スマホで準備が終わると、ここに表示されます。'));
  for (const device of state.pending) {
    content.push(deviceCard(device, 'この申請を確認する', () => {
      state.selectedDevice = device;
      state.viewApproved = false;
      state.screen = 6;
      render();
    }));
  }
  content.push(actions(
    actionButton('一覧を更新', 'secondary', () => refreshDeviceView('pending')),
    actionButton('承認済み端末を見る', 'secondary', () => { state.viewApproved = true; refreshDeviceView('approved'); }),
  ));
  screenFrame(5, '先生端末の承認待ち', '先生スマホと同じ申請を見ていることを確認します。', content);
}

function renderApproved() {
  const content = [];
  if (!state.approved.length) content.push(infoBox('承認済み端末はありません', '承認が完了した端末だけがここに表示されます。'));
  for (const device of state.approved) {
    content.push(deviceCard(device, 'この端末を失効する', () => openConfirmation({
      kind: '端末の失効',
      title: 'この先生端末を失効しますか？',
      message: 'この端末の先生sessionは停止します。先生IDと過去の対局記録は変更しません。',
      confirmText: 'この端末を失効する',
      onConfirm: () => revokeDevice(device),
    }), 'success'));
  }
  content.push(actions(
    actionButton('一覧を更新', 'secondary', () => refreshDeviceView('approved')),
    actionButton('承認待ちへ戻る', 'secondary', () => { state.viewApproved = false; goToScreen(5); }),
  ));
  screenFrame(6, '先生の端末を管理', '期限ではなく、紛失・交換など必要なときに明示的に止めます。', content);
}

function renderApproval() {
  const device = state.selectedDevice;
  if (!device) {
    state.screen = 5;
    renderPending();
    return;
  }
  const checkbox = element('input', { attrs: { type: 'checkbox', id: 'face-to-face-check' } });
  const approve = actionButton('確認して承認', 'primary', () => run(approve, async () => {
    await sameOriginJson(`/api/owner/teacher-devices/${encodeURIComponent(device.device_authorization_id)}/approve`, {
      method: 'POST', body: { confirmationCode: device.confirmation_code },
    });
    state.selectedDevice = null;
    state.screen = 5;
    setMessage('先生端末を承認しました。');
    await loadDevices('pending');
  }), { disabled: true });
  checkbox.addEventListener('change', () => { approve.disabled = !checkbox.checked || state.busy; });
  const reject = actionButton('この申請を拒否する', 'danger', () => openConfirmation({
    kind: '申請の拒否',
    title: 'この端末申請を拒否しますか？',
    message: 'あとで確認する場合は拒否せず、承認待ちのまま戻ってください。',
    confirmText: '申請を拒否する',
    onConfirm: () => rejectDevice(device),
  }));
  screenFrame(6, '先生端末を確認', '先生本人と端末を対面で確認してから承認します。', [
    deviceCard(device),
    element('label', { className: 'confirm-row' }, [checkbox, element('span', { text: '先生本人と対面し、同じ申請番号を見ていることを確認しました' })]),
    paragraph('確認番号は秘密情報ではありません。本人確認を番号だけで済ませません。', 'mini'),
    actions(approve, actionButton('あとで確認する', 'secondary', () => { state.selectedDevice = null; goToScreen(5); }), reject),
  ]);
}

function openConfirmation({ kind, title, message, confirmText, onConfirm }) {
  confirmKind.textContent = kind;
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  confirmAction.textContent = confirmText;
  confirmAction.onclick = () => queueMicrotask(onConfirm);
  confirmDialog.showModal();
}

async function rejectDevice(device) {
  const placeholder = { disabled: false };
  await run(placeholder, async () => {
    await sameOriginJson(`/api/owner/teacher-devices/${encodeURIComponent(device.device_authorization_id)}/reject`, {
      method: 'POST', body: {},
    });
    state.selectedDevice = null;
    state.screen = 5;
    setMessage('端末申請を拒否しました。');
    await loadDevices('pending');
  });
}

async function revokeDevice(device) {
  const placeholder = { disabled: false };
  await run(placeholder, async () => {
    await sameOriginJson(`/api/owner/teacher-devices/${encodeURIComponent(device.device_authorization_id)}/revoke`, {
      method: 'POST', body: {},
    });
    setMessage('対象の先生端末を失効しました。');
    await loadDevices('approved');
  });
}

async function refreshDeviceView(status) {
  const placeholder = { disabled: false };
  await run(placeholder, async () => { await loadDevices(status); });
}

async function logout() {
  const placeholder = { disabled: false };
  await run(placeholder, async () => {
    await sameOriginJson('/api/owner/session/logout', { method: 'POST', body: {} });
    state.ownerState = 'unlock_required';
    state.enrollmentLink = '';
    state.pending = [];
    state.approved = [];
    state.selectedDevice = null;
    setMessage('管理sessionを終了しました。');
  });
}

function goToScreen(screen) {
  if (state.oneTimeCodes && screen !== 2) return;
  if (state.screen === 4 && screen !== 4) state.enrollmentLink = '';
  state.screen = screen;
  state.selectedDevice = null;
  state.viewApproved = false;
  setMessage();
  if (screen === 5) refreshDeviceView('pending');
  else if (screen === 6) { state.viewApproved = true; refreshDeviceView('approved'); }
  else render();
}

function render() {
  if (state.ownerState === 'loading') return renderLoading();
  if (state.ownerState === 'unavailable') return renderUnavailable();
  if (state.ownerState === 'setup_required') return renderSetup();
  if (state.ownerState === 'unlock_required') return renderUnlock();
  if (state.ownerState === 'recovery_required') return renderRecovery();
  if (state.oneTimeCodes) return renderRecoveryCodes();
  if (state.screen === 3) return renderRecovery();
  if (state.screen === 4) return renderTeacherRegistration();
  if (state.screen === 5) return renderPending();
  if (state.screen === 6 && state.viewApproved) return renderApproved();
  if (state.screen === 6) return renderApproval();
  state.screen = 4;
  return renderTeacherRegistration();
}

async function refreshOwnerState(announce = true) {
  state.ownerState = 'loading';
  render();
  try {
    const result = await sameOriginJson('/api/owner/state');
    state.ownerState = result.state;
    if (result.state === 'active') state.screen = 4;
    if (result.state === 'setup_required') state.screen = 1;
    if (result.state === 'recovery_required') state.screen = 3;
    if (announce) setMessage('管理状態を確認しました。');
  } catch {
    state.ownerState = 'unavailable';
    setMessage('', '管理状態を確認できませんでした。');
  }
  render();
}

for (const button of navButtons) {
  button.addEventListener('click', () => goToScreen(Number(button.dataset.screen)));
}

refreshOwnerState(false);
