import { commitRecoveryStorage } from './recovery-storage.mjs';

const LEAGUE_ORIGIN = 'https://suiyoukai-league.c84s4n967v.chatgpt.site';
const RECOVERY_SESSION_KEY = 'suiyoukai-device-recovery-session-v1';
const SECRET_PATTERN = /^[0-9a-f]{64}$/;
const content = document.getElementById('recovery-content');

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character]);
}

function recordHtml(record) {
  return `<section class="recovery-record"><h2>復旧済み</h2><dl>
    <div><dt>お名前</dt><dd>${escapeHtml(record.displayName)}さん</dd></div>
    <div><dt>記録</dt><dd>${escapeHtml(record.recordLabel)}</dd></div>
    <div><dt>過去実績</dt><dd>${escapeHtml(record.historySummary)}</dd></div>
    <div><dt>復旧先</dt><dd>このSafariで確定</dd></div>
  </dl></section>`;
}

function renderError(state) {
  const views = {
    expired: ['復旧QRの期限が切れました', 'この画面では続けられません。', '新しい番号や登録は作られていません。悦子さんへお知らせし、新しい復旧QRの発行を依頼してください。'],
    other_browser: ['別のSafariが先に受け取りました', 'このSafariでは続けられません。', '先に正常受取したSafariだけが復旧先です。このSafariでは新しい番号・登録・追加申請は作りません。'],
    used: ['この復旧QRは使用済みです', '同じQRを2回使うことはできません。', '新しい番号・新しい登録・追加申請は作っていません。悦子さんが復旧先を確認します。'],
  };
  const view = views[state] || ['復旧情報を確認できませんでした', 'この画面では続けられません。', '新しい番号や登録は作られていません。悦子さんへお知らせください。'];
  content.innerHTML = `<h1>${view[0]}</h1><p class="recovery-lead">${view[1]}</p><p class="recovery-message recovery-danger">${view[2]}</p><button class="recovery-action secondary" type="button" data-close>画面を閉じる</button><p class="recovery-footnote">この画面から復旧をやり直すことはできません。</p>`;
  content.querySelector('[data-close]').addEventListener('click', () => window.close());
}

async function call(path, body) {
  const response = await fetch(LEAGUE_ORIGIN + path, { method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(35_000) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || 'recovery_unavailable'); error.state = data.state; throw error; }
  return data;
}

function readRecoveryCredentials() {
  const params = new URLSearchParams(location.hash.slice(1));
  const fromHash = { ticket: params.get('ticket') || '', browserKey: params.get('browserKey') || '' };
  if (SECRET_PATTERN.test(fromHash.ticket) && SECRET_PATTERN.test(fromHash.browserKey)) {
    let stored = false;
    try {
      sessionStorage.setItem(RECOVERY_SESSION_KEY, JSON.stringify(fromHash));
      stored = true;
    } catch {}
    if (stored) {
      try { history.replaceState(null, '', location.pathname + location.search); } catch {}
    }
    return fromHash;
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem(RECOVERY_SESSION_KEY) || '{}');
    if (SECRET_PATTERN.test(saved.ticket) && SECRET_PATTERN.test(saved.browserKey)) return saved;
  } catch {}
  return { ticket: '', browserKey: '' };
}

async function start() {
  const { ticket, browserKey } = readRecoveryCredentials();
  if (!SECRET_PATTERN.test(ticket) || !SECRET_PATTERN.test(browserKey)) { renderError('used'); return; }
  try {
    const recovery = await call('/api/recovery/flower', { ticket, browserKey });
    const saved = commitRecoveryStorage(localStorage, recovery.appNumber, recovery.deviceToken);
    const receipt = await call('/api/recovery/flower/receipt', { ticket, browserKey });
    content.innerHTML = `<h1>復旧結果を再表示しました</h1><p class="recovery-lead">通信が切れたあとも、同じ結果を表示しています。</p>${recordHtml(recovery.record)}<p class="recovery-message">新しい番号・新しい登録・追加申請は作っていません。最初の成功結果をそのまま再表示しています。</p><a class="recovery-action" href="${escapeHtml(receipt.returnUrl)}">既存PINの確認へ</a><p class="recovery-footnote">${saved.replay ? '同じ保存結果を確認しました。' : '正本記録をこのSafariへ保存しました。'} PIN確認後も承認待ちです。リーグへ自動承認はしません。</p>`;
  } catch (error) {
    if (error.state) { renderError(error.state); return; }
    content.innerHTML = '<h1>復旧結果を確認しています</h1><p class="recovery-lead">同じSafariでこの画面を開いたままにしてください。</p><p class="recovery-message recovery-danger">通信または保存を確認できませんでした。新しい番号・登録・追加申請は作っていません。</p><button class="recovery-action secondary" type="button" data-recheck>同じ結果を再確認</button><p class="recovery-footnote">再登録ではなく、同じ復旧結果だけを確認します。</p>';
    content.querySelector('[data-recheck]').addEventListener('click', () => location.reload());
  }
}

start();
