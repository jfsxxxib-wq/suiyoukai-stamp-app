(() => {
  'use strict';
  const portal = 'https://suiyoukai-portal.c84s4n967v.chatgpt.site';
  const pendingKey = 'suiyoukai-stamp-qr-pending-v1';
  const deviceKey = 'suiyoukai-gate-device-v1';
  const incoming = new URLSearchParams(location.hash.slice(1)).get('stamp-qr');
  let token = '';
  if (incoming) {
    history.replaceState(null, '', location.pathname + location.search);
    if (/^[A-Za-z0-9_-]{22}$/.test(incoming)) {
      token = incoming;
      try { sessionStorage.setItem(pendingKey, token); } catch { /* The current tab can still continue. */ }
    }
  } else {
    try { token = sessionStorage.getItem(pendingKey) || ''; } catch { /* No pending QR. */ }
  }
  if (!token) return;

  const overlay = document.createElement('section');
  overlay.className = 'stamp-receive-overlay'; overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', 'スタンプの受け取り確認');
  const card = document.createElement('article'); card.className = 'stamp-receive-card';
  const badge = document.createElement('small'); badge.textContent = '水曜会 花図鑑';
  const title = document.createElement('h2'); title.textContent = 'スタンプの受け取り確認';
  const status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = '本人の登録を確認しています。';
  const details = document.createElement('div'); details.className = 'stamp-receive-details';
  const action = document.createElement('button'); action.type = 'button'; action.textContent = '内容を確認して受け取る'; action.disabled = true;
  const back = document.createElement('button'); back.type = 'button'; back.className = 'stamp-receive-back'; back.textContent = '花図鑑へ戻る';
  const portalLink = document.createElement('a'); portalLink.href = portal; portalLink.textContent = '水曜会の入口へ';
  portalLink.hidden = true;
  card.append(badge, title, status, details, action, back, portalLink); overlay.append(card); document.body.append(overlay);
  back.addEventListener('click', () => {
    overlay.remove(); document.querySelector('[data-panel="profile"]')?.click();
  });
  const failText = code => ({
    registration_required: '登録済みの端末を確認できません。いつものブラウザーで水曜会の入口から開いてください。',
    registration_suspended: 'この登録は確認中です。管理者にご相談ください。',
    baseline_required: '旧スタンプの回数確認がまだです。管理者に本人端末の記録を見せてください。',
    local_state_mismatch: 'この端末と管理側の回数が違います。反映せずに止めました。管理者に確認してください。',
    wrong_participant: 'このQRは別の方のものです。回数は変えていません。',
    already_participated: '今日の参加スタンプはすでに受け取っています。',
    qr_expired_or_cancelled: 'このQRは期限切れか取消済みです。管理者に新しいQRを確認してください。',
    state_changed: 'ほかの記録が先に反映されました。回数を読み直して管理者に確認してください。',
    duplicate_game_record: 'この対局記録はすでにスタンプへ反映されています。管理者に確認してください。',
    invalid_count: 'スタンプの上限または下限を超えるため反映できません。',
  })[code] || '受け取りを確認できませんでした。通信とQRの内容を確認してください。';
  const request = async (path, body) => {
    const device = localStorage.getItem(deviceKey);
    if (!device || !/^[0-9a-f]{64}$/.test(device)) throw new Error('registration_required');
    const response = await fetch(`${portal}/api/flower/stamp/${path}`, {
      method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${device}` },
      body: JSON.stringify(body), signal: AbortSignal.timeout(35000),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'unavailable');
    return data;
  };
  const row = (left, right) => {
    const line = document.createElement('div'); line.className = 'stamp-receive-row';
    const label = document.createElement('span'); label.textContent = left;
    const value = document.createElement('strong'); value.textContent = right;
    line.append(label, value); details.append(line);
  };
  const render = data => {
    details.replaceChildren();
    const kind = { today: '今日の参加スタンプ', games: '指導碁をまとめて受け取る',
      restore: '過去分の復旧', adjust: '後日の回数調整' }[data.grant.kind] || 'スタンプ';
    title.textContent = kind;
    const person = window.suiyoukaiGate?.participant;
    row('対象', person ? `${person.familyName} ${person.givenName}` : 'この端末の本人');
    if (data.grant.kind === 'games') {
      const teacherNames = Object.fromEntries((window.teacherStampTargets || []).map(item => [item.teacherId, item.teacherName]));
      data.grant.details.games.forEach((game, index) =>
        row(`${index + 1}局目（${game.sourceRef}）`, `${teacherNames[game.teacherId] || game.teacherId}・${game.handicap}・${game.result}`));
    }
    if (data.grant.kind === 'today' || data.grant.kind === 'games') row('日付', data.grant.details.date);
    if (data.before.participation !== data.after.participation)
      row('参加スタンプ', `${data.before.participation}回 → ${data.after.participation}回`);
    for (const teacher of window.teacherStampTargets || []) {
      const id = teacher.teacherId;
      if (data.before.teachers[id] !== data.after.teachers[id])
        row(teacher.teacherName, `${data.before.teachers[id]}回 → ${data.after.teachers[id]}回`);
    }
    if (data.grant.kind === 'restore' || data.grant.kind === 'adjust')
      row('確認の根拠', data.grant.details.evidence);
    status.textContent = data.alreadyApplied
      ? '管理側には受取済みと記録されています。この端末の表示を再確認します。'
      : '内容と受け取り前後の回数を確認してください。';
    action.disabled = false;
  };
  let preview;
  const start = async () => {
    const gate = window.suiyoukaiGate;
    if (!gate || gate.status === 'checking') return;
    if (gate.status !== 'registered') { status.textContent = failText('registration_required'); portalLink.hidden = false; return; }
    try {
      const counts = window.suiyoukaiLinkage.getStampCounts();
      preview = await request('preview', { token, counts });
      render(preview);
    } catch (error) { status.textContent = failText(error.message); portalLink.hidden = error.message !== 'registration_required'; }
  };
  action.addEventListener('click', async () => {
    if (!preview) return;
    action.disabled = true; status.textContent = '受け取りを確認しています。';
    try {
      const result = await request('redeem', { token, counts: window.suiyoukaiLinkage.getStampCounts(), revision: preview.revision });
      if (!window.suiyoukaiLinkage.applyStampResult(result)) {
        status.textContent = '管理側では受取済みですが、この端末への保存を確認できません。画面を閉じず、同じQRから再確認してください。';
        action.disabled = false; return;
      }
      try { sessionStorage.removeItem(pendingKey); } catch { /* No pending value persisted. */ }
      token = ''; status.textContent = 'スタンプを受け取り、端末の表示を更新しました。';
      action.hidden = true; back.textContent = '花図鑑で回数を見る';
    } catch (error) { status.textContent = failText(error.message); action.disabled = false; }
  });
  window.addEventListener('suiyoukai-gate-change', start);
  start();
})();
