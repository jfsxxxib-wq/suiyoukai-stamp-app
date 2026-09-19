const screenRoot = document.querySelector('#screen');
const scenarioNav = document.querySelector('#scenario-nav');

const previewNote = '<div class="preview-note">静的見本です。入力やボタンはAPIへ送信されません。</div>';

const ownerScenarios = [
  {
    id: 'owner-unlock',
    label: '管理PINで開く',
    title: '管理画面を開く',
    lead: 'この端末の承認を確認してから、管理用PINを一度入力します。',
    body: `<div class="card success"><strong>この管理端末は登録済みです</strong>先生登録や端末承認を行うため、短時間の管理sessionを開きます。</div><label class="field">管理用PIN<input type="password" inputmode="numeric" maxlength="6" placeholder="6桁の数字"></label><div class="actions"><button class="primary" type="button">管理画面を開く</button></div><p class="mini">PINはこの解除時だけ送ります。先生登録や一覧表示のたびには送りません。</p>`,
  },
  {
    id: 'recovery-codes',
    label: '復旧コード',
    title: '復旧コードを保存',
    lead: 'この5個は、今だけ表示する見本です。',
    body: `<div class="card warning"><strong>同じコードは再表示できません</strong>管理端末とは別の安全な場所へ保管します。</div><div class="code-list" aria-label="架空の復旧コード"><span>見本 01</span><span>見本 02</span><span>見本 03</span><span>見本 04</span><span>見本 05</span></div><label class="confirm-row"><input type="checkbox" data-enable="codes-done"><span>5個すべてを別の場所へ保管しました</span></label><div class="actions"><button id="codes-done" class="primary" type="button" disabled>表示を消して次へ</button></div>`,
  },
  {
    id: 'teacher-register',
    label: '先生登録',
    title: '先生を登録',
    lead: '本人確認を終えた先生の表示名を入力します。',
    body: `<label class="field">先生の表示名<input type="text" value="青葉先生（架空）"></label><div class="card"><strong>名前だけでは人物を結びません</strong>teacher_idはserverが生成し、リーグ参加者IDとは分けて扱います。</div><div class="actions"><button class="primary" type="button">先生を登録して一回限りlinkを作る</button></div><div class="card success"><strong>発行後の表示見本</strong><span class="fake-link">http://localhost:4192/#enrollment=見本（使用不可）</span></div><p class="mini">B1では別スマホからPCのlocalhostを開けないため、実際に読めるQRはまだ作りません。</p>`,
  },
  {
    id: 'pending-request',
    label: '承認待ち',
    title: '先生端末の承認待ち',
    lead: '先生スマホと同じ申請を見ていることを確認します。',
    body: `<div class="card"><strong>青葉先生（架空）</strong><dl class="meta"><dt>状態</dt><dd>承認待ち</dd><dt>確認番号</dt><dd>4821</dd><dt>申請時刻</dt><dd>14:25ごろ</dd></dl></div><label class="confirm-row"><input type="checkbox" data-enable="approve-device"><span>先生本人と、その場にあるスマホの番号を対面で確認しました</span></label><div class="actions"><button id="approve-device" class="primary" type="button" disabled>この端末を承認する</button><button class="secondary" type="button">あとで確認する</button><button class="danger" type="button">この申請を拒否する</button></div><p class="mini">番号が合うだけでは承認しません。</p>`,
  },
  {
    id: 'approved-devices',
    label: '承認済み端末',
    title: '先生の端末を管理',
    lead: '期限ではなく、紛失・交換など必要なときに明示的に止めます。',
    body: `<div class="card success"><strong>青葉先生（架空）</strong><dl class="meta"><dt>端末</dt><dd>先生のスマホ 1台</dd><dt>状態</dt><dd>承認済み・期限なし</dd><dt>最終利用</dt><dd>今日 14:31ごろ</dd></dl><div class="actions"><button class="danger" type="button">この端末を失効する</button></div></div><p class="mini">失効してもteacher_idと過去の対局記録は変わりません。</p>`,
  },
];

const teacherScenarios = [
  {
    id: 'teacher-unlock',
    label: '通常PIN認証',
    title: '一局のご縁帳を開く',
    lead: '承認済みのこのスマホで、先生用PINを入力します。',
    body: `<div class="card success"><strong>この端末は承認済みです</strong>端末承認は期限なしです。</div><label class="field">先生用PIN<input type="password" inputmode="numeric" maxlength="6" placeholder="6桁の数字"></label><div class="actions"><button class="primary" type="button">ご縁帳を開く</button></div><p class="mini">リーグPINとは別です。リーグ権限へ自動で切り替わりません。</p>`,
  },
  {
    id: 'teacher-loading',
    label: '読込中',
    title: '今日の対局',
    lead: '青葉先生の記録だけを確認しています。',
    body: `<div class="card status-line"><span class="spinner" aria-hidden="true"></span><strong>記録を読み込んでいます</strong></div><p class="mini">先生が確定する前に対局データは取得しません。</p>`,
  },
  {
    id: 'teacher-empty',
    label: '0局の日',
    title: '今日の対局',
    lead: '2026年9月17日・0局',
    body: `<div class="card empty"><span class="empty-mark">🌿</span><strong>今日の対局はまだありません</strong><span>記録が追加されると、ここに表示されます。</span></div><div class="actions"><button class="secondary" type="button">過去の対局を見る</button></div>`,
  },
  {
    id: 'teacher-error',
    label: '読込失敗',
    title: '記録を表示できません',
    lead: '先生の記録を安全に取得できなかったため停止しました。',
    body: `<div class="card warning"><strong>記録は変更されていません</strong>通信状態を確認して、もう一度お試しください。</div><div class="actions"><button class="primary" type="button">もう一度読み込む</button><button class="secondary" type="button">PIN入力へ戻る</button></div><p class="mini">別の先生の記録へ切り替えて続行することはありません。</p>`,
  },
  {
    id: 'teacher-locked',
    label: '無操作後',
    title: 'PINをもう一度入力',
    lead: '無操作時間を過ぎました。端末承認は失効していません。',
    body: `<div class="card success"><strong>見ていた場所は保持しています</strong>再認証後に、選択していた日付と参加者の画面へ戻ります。</div><label class="field">先生用PIN<input type="password" inputmode="numeric" maxlength="6" placeholder="6桁の数字"></label><div class="actions"><button class="primary" type="button">元の画面へ戻る</button></div><p class="mini">PIN、cookie、ticket、復旧コードは画面状態へ保存しません。</p>`,
  },
];

let audience = 'owner';
let scenarioId = ownerScenarios[0].id;

function scenarios() {
  return audience === 'owner' ? ownerScenarios : teacherScenarios;
}

function renderNav() {
  scenarioNav.replaceChildren();
  for (const scenario of scenarios()) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = scenario.label;
    button.classList.toggle('active', scenario.id === scenarioId);
    button.addEventListener('click', () => {
      scenarioId = scenario.id;
      render();
    });
    scenarioNav.append(button);
  }
}

function bindPreviewControls() {
  document.querySelectorAll('[data-enable]').forEach((checkbox) => {
    const target = document.getElementById(checkbox.dataset.enable);
    checkbox.addEventListener('change', () => {
      target.disabled = !checkbox.checked;
    });
  });
}

function render() {
  const scenario = scenarios().find((item) => item.id === scenarioId) ?? scenarios()[0];
  screenRoot.innerHTML = `<header class="screen-head"><span class="chip">${audience === 'owner' ? '管理端末' : '先生スマホ'}</span><h2>${scenario.title}</h2><p>${scenario.lead}</p></header><div class="screen-body">${scenario.body}${previewNote}</div>`;
  renderNav();
  bindPreviewControls();
}

document.querySelectorAll('[data-audience]').forEach((button) => {
  button.addEventListener('click', () => {
    audience = button.dataset.audience;
    scenarioId = scenarios()[0].id;
    document.querySelectorAll('[data-audience]').forEach((item) => item.classList.toggle('active', item === button));
    render();
  });
});

render();
