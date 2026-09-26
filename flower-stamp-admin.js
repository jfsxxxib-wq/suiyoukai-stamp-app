(() => {
  'use strict';
  const screen = document.querySelector('.admin-refresh-screen');
  if (!screen) return;
  const portal = 'https://suiyoukai-portal.c84s4n967v.chatgpt.site';
  const teachers = window.teacherStampTargets || [];
  const $ = selector => screen.querySelector(selector);
  const selectTargets = ['[data-stamp-baseline-person]', '[data-stamp-games-person]',
    '[data-stamp-restore-person]', '[data-stamp-adjust-person]'];
  const names = new Map();
  let participants = [];
  let ready = false;
  const status = text => { $('[data-stamp-admin-status]').textContent = text; };
  const message = (selector, text) => { const node = $(selector); if (node) node.textContent = text; };
  const todayJst = () => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
  const ticket = () => window.FlowerAdminAccess?.ticket?.() || '';
  const currentPerson = selector => participants.find(person => person.id === $(selector)?.value);
  const request = async (name, payload = {}) => {
    const adminTicket = ticket();
    if (!adminTicket) throw new Error('管理者の確認期限が切れました。ポータルの管理者画面から開き直してください。');
    const response = await fetch(`${portal}/api/flower/stamp/admin/${name}`, {
      method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, adminTicket }),
      signal: AbortSignal.timeout(30000),
    });
    const data = await response.json();
    if (!response.ok) {
      const translations = {
        admin_confirmation_required: '管理者の確認期限が切れました。ポータルから開き直してください。',
        baseline_required: 'この方の旧スタンプ回数の照合がまだです。',
        baseline_exists: 'この方の初期回数は登録済みです。変更が必要なら調整QRを使ってください。',
        participant_not_ready: '登録番号と本人の状態を確認してください。',
        request_id_conflict: '発行の確認が必要です。履歴を読み直してください。',
        duplicate_game_record: '同じ方の対局記録IDが重複しています。記録を確認してください。',
      };
      throw new Error(translations[data.error] || '保存を確認できませんでした。内容を確認して再試行してください。');
    }
    return data;
  };
  const addOption = (select, value, text) => {
    const option = document.createElement('option'); option.value = value; option.textContent = text; select.append(option);
  };
  const addTeacherOptions = select => {
    for (const teacher of teachers) addOption(select, teacher.teacherId, teacher.teacherName);
  };
  const renderTeacherInputs = (container, prefix, initial = {}) => {
    container.replaceChildren();
    for (const teacher of teachers) {
      const label = document.createElement('label');
      label.textContent = `${teacher.teacherName}：`;
      const input = document.createElement('input');
      input.type = 'number'; input.min = '0'; input.max = '15'; input.inputMode = 'numeric';
      input.value = String(initial[teacher.teacherId] ?? 0); input.dataset.teacherCount = teacher.teacherId;
      input.disabled = !ready || prefix === 'restore' && !currentPerson('[data-stamp-restore-person]')?.baselineReady;
      label.append(input); container.append(label);
    }
  };
  const readTeacherCounts = selector => Object.fromEntries([...$(selector).querySelectorAll('[data-teacher-count]')]
    .map(input => [input.dataset.teacherCount, Number(input.value)]));
  const renderQr = (container, data) => {
    container.hidden = false; container.replaceChildren();
    const title = document.createElement('strong'); title.textContent = '発行したQR';
    const img = document.createElement('img'); img.alt = '本人のスマホで読むスタンプQR';
    img.src = window.suiyoukaiLinkage.renderStampQrImage(data.url);
    const link = document.createElement('a'); link.href = data.url; link.textContent = '読み取り用リンクを開く';
    link.rel = 'noopener noreferrer'; link.target = '_blank';
    const note = document.createElement('small');
    note.textContent = `有効期限：${new Date(data.grant.expiresAt).toLocaleString('ja-JP')}。対象と内容を本人と確認してください。`;
    container.append(title, img, link, note);
  };
  const issue = async (key, grant, selector) => {
    const output = $(selector);
    const storeKey = `suiyoukai-stamp-issue-${key}`;
    let requestId;
    try { requestId = sessionStorage.getItem(storeKey) || crypto.randomUUID(); sessionStorage.setItem(storeKey, requestId); }
    catch { requestId = crypto.randomUUID(); }
    try {
      output.hidden = false; output.textContent = 'QRを発行しています。';
      const data = await request('issue', { requestId, grant });
      renderQr(output, data);
      try { sessionStorage.removeItem(storeKey); } catch { /* Retry remains possible from history. */ }
      await loadHistory();
    } catch (error) { output.textContent = error.message; }
  };
  const loadParticipants = async () => {
    const data = await request('participants'); participants = data.participants;
    names.clear(); for (const p of participants) names.set(p.id, p.name);
    for (const selector of selectTargets) {
      const select = $(selector); const selected = select.value;
      select.replaceChildren(); addOption(select, '', '登録済みの方を選ぶ');
      for (const p of participants) addOption(select, p.id,
        `${p.name}（サイト ${p.participantNumber}・花図鑑 ${p.appNumber || '未接続'}）${p.baselineReady ? ' 照合済み' : ' 要照合'}`);
      select.value = selected;
    }
  };
  const loadHistory = async () => {
    const node = $('[data-stamp-history]');
    const data = await request('history'); node.replaceChildren();
    if (!data.grants.length) { node.textContent = '発行履歴はありません。'; return; }
    for (const grant of data.grants) {
      const row = document.createElement('div'); row.className = 'admin-refresh-history-row';
      const label = document.createElement('span');
      label.textContent = `${new Date(grant.issuedAt).toLocaleString('ja-JP')} ${grant.kind} ${names.get(grant.targetParticipantId) || '共通'} ／受取 ${grant.usedCount}件${grant.cancelledAt ? '／取消済み' : ''}`;
      row.append(label);
      if (!grant.cancelledAt && grant.expiresAt > Date.now()) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = 'これ以降の受取を止める';
        button.addEventListener('click', async () => {
          if (!window.confirm('このQRの今後の受取を止めますか？ すでに受け取った分は残ります。')) return;
          button.disabled = true;
          try { await request('cancel', { grantId: grant.id }); await loadHistory(); }
          catch (error) { button.disabled = false; status(error.message); }
        }); row.append(button);
      }
      node.append(row);
    }
  };
  const enable = () => {
    for (const node of screen.querySelectorAll('[data-stamp-issue-today], [data-stamp-baseline-person], [data-stamp-baseline-participation], [data-stamp-baseline-last-date], [data-stamp-baseline-evidence], [data-stamp-baseline-save], [data-stamp-games-person], [data-stamp-games-date], [data-stamp-game-source], [data-stamp-game-teacher], [data-stamp-game-handicap], [data-stamp-game-result], [data-stamp-add-game], [data-stamp-issue-games], [data-stamp-restore-person], [data-stamp-restore-adopted-participation], [data-stamp-restore-evidence], [data-stamp-issue-restore], [data-stamp-adjust-person], [data-stamp-adjust-type], [data-stamp-adjust-teacher], [data-stamp-adjust-delta], [data-stamp-adjust-evidence], [data-stamp-issue-adjust], [data-stamp-history-refresh]')) node.disabled = false;
    renderTeacherInputs($('[data-stamp-baseline-teachers]'), 'baseline');
    renderTeacherInputs($('[data-stamp-restore-teachers]'), 'restore');
    $('[data-stamp-games-date]').value = todayJst();
    status('管理者の確認ができました。本人の旧回数を照合してからスタンプQRを使ってください。');
  };
  const boot = async () => {
    if (ready || !window.FlowerAdminAccess?.isAuthorized?.()) return;
    try { ready = true; await loadParticipants(); enable(); await loadHistory(); }
    catch (error) { ready = false; status(error.message); }
  };
  $('[data-stamp-issue-today]').addEventListener('click', () => issue('today', { kind: 'today' }, '[data-stamp-today-result]'));
  $('[data-stamp-baseline-save]').addEventListener('click', async () => {
    const p = currentPerson('[data-stamp-baseline-person]');
    if (!p || p.baselineReady || !p.appNumber) { message('[data-stamp-baseline-message]', '対象者と登録状態を確認してください。'); return; }
    const counts = { participation: Number($('[data-stamp-baseline-participation]').value),
      teachers: readTeacherCounts('[data-stamp-baseline-teachers]'),
      lastParticipationDate: $('[data-stamp-baseline-last-date]').value || null };
    const evidence = $('[data-stamp-baseline-evidence]').value.trim();
    if (!evidence || !window.confirm(`${p.name}さんの旧回数を本人端末・記録と照合しましたか？ 初期回数は後から上書きできません。`)) return;
    try { await request('baseline', { participantId: p.id, appNumber: p.appNumber, counts, evidence });
      message('[data-stamp-baseline-message]', '初期回数を登録しました。本人端末の回数が一致するか、最初のQRで確認します。');
      await loadParticipants(); }
    catch (error) { message('[data-stamp-baseline-message]', error.message); }
  });
  $('[data-stamp-add-game]').addEventListener('click', () => {
    const holder = $('[data-stamp-extra-games]');
    if (holder.children.length >= 19) return;
    const row = document.createElement('div'); row.className = 'admin-refresh-slot';
    const title = document.createElement('h4'); title.textContent = `${holder.children.length + 2}局目`;
    const grid = document.createElement('div'); grid.className = 'admin-refresh-grid';
    const source = document.createElement('input'); source.type = 'text'; source.maxLength = 80; source.placeholder = '例：20260927-02'; source.dataset.stampGameSource = '';
    const teacher = document.createElement('select'); teacher.dataset.stampGameTeacher = ''; addOption(teacher, '', '先生を選ぶ'); addTeacherOptions(teacher);
    const handicap = $('[data-stamp-game-handicap]').cloneNode(true); handicap.removeAttribute('data-stamp-game-handicap'); handicap.dataset.stampGameHandicap = '';
    const result = $('[data-stamp-game-result]').cloneNode(true); result.removeAttribute('data-stamp-game-result'); result.dataset.stampGameResult = '';
    for (const [text, field] of [['対局記録ID', source], ['先生', teacher], ['ハンデ', handicap], ['勝敗', result]]) {
      const label = document.createElement('label'); label.textContent = text; label.append(field); grid.append(label);
    }
    row.append(title, grid); holder.append(row);
  });
  $('[data-stamp-issue-games]').addEventListener('click', () => {
    const p = currentPerson('[data-stamp-games-person]');
    if (!p?.baselineReady) { status('対象者の旧回数の照合を先に行ってください。'); return; }
    const rows = [$('.admin-refresh-slot [data-stamp-game-teacher]')?.closest('.admin-refresh-slot'),
      ...$('[data-stamp-extra-games]').children].filter(Boolean);
    const games = rows.map(row => ({ sourceRef: row.querySelector('[data-stamp-game-source]').value.trim(),
      teacherId: row.querySelector('[data-stamp-game-teacher]').value,
      handicap: row.querySelector('[data-stamp-game-handicap]').value,
      result: row.querySelector('[data-stamp-game-result]').value }));
    issue('games', { kind: 'games', target: p.id, date: $('[data-stamp-games-date]').value, games }, '[data-stamp-games-result]');
  });
  $('[data-stamp-restore-person]').addEventListener('change', () => {
    const p = currentPerson('[data-stamp-restore-person]'); const counts = p?.counts;
    $('[data-stamp-restore-current-participation]').value = counts?.participation ?? '';
    $('[data-stamp-restore-adopted-participation]').value = counts?.participation ?? '';
    renderTeacherInputs($('[data-stamp-restore-teachers]'), 'restore', counts?.teachers);
  });
  $('[data-stamp-issue-restore]').addEventListener('click', () => {
    const p = currentPerson('[data-stamp-restore-person]');
    if (!p?.baselineReady) { status('対象者の旧回数の照合を先に行ってください。'); return; }
    const adopted = { participation: Number($('[data-stamp-restore-adopted-participation]').value),
      teachers: readTeacherCounts('[data-stamp-restore-teachers]'), lastParticipationDate: p.counts.lastParticipationDate };
    issue('restore', { kind: 'restore', target: p.id, expected: p.counts, adopted,
      evidence: $('[data-stamp-restore-evidence]').value.trim() }, '[data-stamp-restore-result]');
  });
  $('[data-stamp-issue-adjust]').addEventListener('click', () => {
    const p = currentPerson('[data-stamp-adjust-person]');
    if (!p?.baselineReady) { status('対象者の旧回数の照合を先に行ってください。'); return; }
    issue('adjust', { kind: 'adjust', target: p.id, stamp: $('[data-stamp-adjust-type]').value,
      teacherId: $('[data-stamp-adjust-teacher]').value, delta: Number($('[data-stamp-adjust-delta]').value),
      evidence: $('[data-stamp-adjust-evidence]').value.trim() }, '[data-stamp-adjust-result]');
  });
  $('[data-stamp-history-refresh]').addEventListener('click', async () => {
    try { await loadParticipants(); await loadHistory(); status('履歴を読み直しました。'); }
    catch (error) { status(error.message); }
  });
  addTeacherOptions($('[data-stamp-game-teacher]'));
  addTeacherOptions($('[data-stamp-adjust-teacher]'));
  window.addEventListener('flower-admin-access-change', boot);
  boot();
})();
