'use client';

import { useState } from 'react';
import {
  ArrowLeft, ArrowRight, BookOpenText, CalendarDays, CheckCircle2,
  ChevronDown, ChevronRight, ClipboardCheck, Flower2, History, House, Info,
  LockKeyhole, KeyRound, LogIn, MapPin, Megaphone, QrCode, ShieldCheck, Trophy, UserRoundCheck,
  UsersRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type View = 'home' | 'flower-handoff' | 'flower-preview' | 'league-login' | 'league-denied' | 'league' | 'league-admin' | 'teacher-login' | 'teacher';
const leagueRows = [
  { rank: 1, name: '山田さん', games: 8, score: '6勝2敗' },
  { rank: 2, name: '佐藤さん', games: 7, score: '5勝2敗' },
  { rank: 3, name: '鈴木さん', games: 8, score: '5勝3敗' },
];
const participants = [
  { name: '山田さん', wins: 6, losses: 2, rate: '75.0%' },
  { name: '佐藤さん', wins: 5, losses: 2, rate: '71.4%' },
  { name: '鈴木さん', wins: 5, losses: 3, rate: '62.5%' },
  { name: '高橋さん', wins: 4, losses: 4, rate: '50.0%' },
  { name: '伊藤さん', wins: 3, losses: 5, rate: '37.5%' },
];
const pastTeacherDays = [
  { id: '2026-08-12', date: '8月12日（水）', place: '藤沢市民会館', count: 3, records: [
    { name: '田中さん', detail: '六子', time: '13:40' },
    { name: '佐藤さん', detail: '九子', time: '14:30' },
    { name: '山本さん', detail: '三子', time: '15:20' },
  ] },
  { id: '2026-07-08', date: '7月8日（水）', place: '藤沢囲碁サロン', count: 2, records: [
    { name: '鈴木さん', detail: '五子', time: '14:10' },
    { name: '高橋さん', detail: '七子', time: '15:00' },
  ] },
];

export default function Home() {
  const [view, setView] = useState<View>('home');
  const [selectedPlayer, setSelectedPlayer] = useState<(typeof participants)[number] | null>(null);
  const [leagueEnabled, setLeagueEnabled] = useState(false);
  const [openPastDay, setOpenPastDay] = useState<string | null>(pastTeacherDays[0].id);

  if (view === 'league-login') return (
    <PageShell><section className="login-page" aria-labelledby="login-title">
      <Button className="back-button" variant="ghost" onClick={() => setView('home')}><ArrowLeft />入口へ戻る</Button>
      <div className="login-heading"><span><Trophy /></span><div><p className="eyebrow">水曜会リーグ</p><h1 id="login-title">会員確認</h1></div></div>
      <div className="login-card">
        <div className="qr-message"><QrCode /><div><strong>QRから開いた方</strong><span>会員番号は自動で入ります。暗証番号だけ入力してください。</span></div></div>
        <label className="login-field"><span>会員番号</span><Input defaultValue="S-0123" inputMode="text" aria-label="会員番号" /></label>
        <label className="login-field"><span>4桁の暗証番号</span><Input type="password" defaultValue="1234" inputMode="numeric" maxLength={4} aria-label="4桁の暗証番号" /></label>
        <label className="remember-row"><input type="checkbox" defaultChecked /><span><strong>このスマートフォンでは次回から入力を省く</strong><small>共用の端末ではチェックを外してください</small></span></label>
        <Button size="lg" className="login-action" onClick={() => setView('league')}><LogIn />リーグページへ入る</Button>
        <button className="help-link" type="button">会員番号や暗証番号が分からない方</button>
      </div>
      <div className="demo-scenarios" aria-label="確認用の画面切り替え"><span>画面見本の切り替え</span><Button variant="outline" onClick={() => setView('league-denied')}>権限がない場合</Button><Button variant="outline" onClick={() => setView('league-admin')}>管理者画面</Button></div>
      <p className="mock-note">ChatGPTアカウントは必要ありません</p>
    </section></PageShell>
  );

  if (view === 'league-denied') return (
    <PageShell><section className="access-page" aria-labelledby="access-title">
      <Button className="back-button" variant="ghost" onClick={() => setView('league-login')}><ArrowLeft />会員確認へ戻る</Button>
      <div className="access-card"><span className="access-icon"><LockKeyhole /></span><p className="eyebrow">会員番号 S-0456</p><h1 id="access-title">リーグ参加の確認が必要です</h1><p>水曜会の会員確認はできましたが、現在はリーグ参加者として登録されていません。</p><div className="access-guidance"><UsersRound /><span><strong>途中から参加する方へ</strong>悦子さんが管理画面で登録すると、同じ会員番号のままリーグページを見られるようになります。</span></div><Button size="lg" onClick={() => setView('home')}>ポータル入口へ戻る</Button></div>
      <div className="demo-scenarios"><span>画面見本の切り替え</span><Button variant="outline" onClick={() => setView('league-admin')}>管理者画面を見る</Button></div>
    </section></PageShell>
  );

  if (view === 'league-admin') return (
    <PageShell><section className="admin-page" aria-labelledby="admin-title">
      <Button className="back-button" variant="ghost" onClick={() => setView('league-login')}><ArrowLeft />会員確認へ戻る</Button>
      <div className="admin-heading"><span><UserRoundCheck /></span><div><p className="eyebrow">管理者専用</p><h1 id="admin-title">リーグ参加者の管理</h1></div></div>
      <div className="admin-card">
        <label className="login-field"><span>会員を探す</span><Input defaultValue="高橋さん" aria-label="会員を探す" /></label>
        <div className="member-card"><div className="member-avatar">高</div><div><strong>高橋さん</strong><span>会員番号　S-0456</span><small>水曜会会員</small></div><CheckCircle2 /></div>
        <div className="permission-row"><div><strong>第2期リーグ参加者</strong><span>オンにするとリーグページが見られます</span></div><Switch checked={leagueEnabled} onCheckedChange={setLeagueEnabled} aria-label="第2期リーグ参加者" /></div>
        <label className="login-field"><span>参加開始日</span><Input type="date" defaultValue="2026-09-09" aria-label="参加開始日" /></label>
        <Button size="lg" className="login-action" disabled={!leagueEnabled} onClick={() => setView('league')}><UserRoundCheck />参加登録を保存する</Button>
        {leagueEnabled && <p className="ready-message"><CheckCircle2 />保存すると、同じ会員番号ですぐにリーグページへ入れます。</p>}
      </div>
      <p className="mock-note">画面見本のため、実際の登録内容は変更されません</p>
    </section></PageShell>
  );

  if (view === 'teacher-login') return (
    <PageShell><section className="login-page teacher-login-page" aria-labelledby="teacher-login-title">
      <Button className="back-button" variant="ghost" onClick={() => setView('home')}><ArrowLeft />入口へ戻る</Button>
      <div className="login-heading teacher-login-heading"><span><BookOpenText /></span><div><p className="eyebrow">先生専用</p><h1 id="teacher-login-title">ご本人の確認</h1></div></div>
      <div className="login-card">
        <div className="qr-message teacher-qr-message"><QrCode /><div><strong>先生専用QRから開きます</strong><span>先生番号は自動で入ります。4桁の暗証番号だけ入力してください。</span></div></div>
        <label className="login-field"><span>先生番号</span><Input defaultValue="T-0001" inputMode="text" aria-label="先生番号" /></label>
        <label className="login-field"><span>4桁の暗証番号</span><Input type="password" defaultValue="1234" inputMode="numeric" maxLength={4} aria-label="4桁の暗証番号" /></label>
        <label className="remember-row"><input type="checkbox" defaultChecked /><span><strong>このスマートフォンでは次回から入力を省く</strong><small>共用の端末ではチェックを外してください</small></span></label>
        <Button size="lg" className="login-action teacher-login-action" onClick={() => setView('teacher')}><KeyRound />自分のご縁帳を開く</Button>
      </div>
      <p className="mock-note">ほかの先生のご縁帳は表示されません</p>
    </section></PageShell>
  );

  if (view === 'flower-handoff') return (
    <PageShell><section className="handoff-panel" aria-labelledby="handoff-title">
      <Button className="back-button" variant="ghost" onClick={() => setView('home')}><ArrowLeft />入口へ戻る</Button>
      <div className="handoff-illustration" aria-hidden="true"><span className="handoff-site"><House /></span><span className="handoff-line"><ArrowRight /></span><span className="handoff-flower"><Flower2 /></span></div>
      <p className="eyebrow">花記録を開く</p>
      <h1 id="handoff-title">今までの記録を、そのまま使います</h1>
      <p className="lead">この入口から現在の「水曜会 花記録」へ移動します。花やスタンプの記録場所は変わりません。</p>
      <div className="safety-note"><ShieldCheck /><div><strong>参加者の方にお願いする操作はひとつだけ</strong><span>「花記録へ進む」を押します。アプリのインストールは必要ありません。</span></div></div>
      <Button size="lg" className="primary-action" onClick={() => setView('flower-preview')}>花記録へ進む <ChevronRight /></Button>
      <p className="mock-note">画面見本のため、本番アプリは開きません</p>
    </section></PageShell>
  );

  if (view === 'flower-preview') return (
    <div className="flower-preview-page">
      <div className="preview-toolbar"><Button variant="ghost" onClick={() => setView('flower-handoff')}><ArrowLeft />ひとつ前へ</Button><span><Info />現在の花記録を再現した見本です</span></div>
      <section className="flower-app" aria-label="現在の花記録の見本">
        <img className="flower-map" src="/shonan-watercolor-map.png" alt="" /><div className="flower-app-shade" />
        <div className="flower-app-title"><p>水曜会探索マップ</p><h1>花を見つける小さな旅</h1></div>
        <button className="map-pin participation-pin" type="button"><span>水曜会</span><strong>参加する</strong></button>
        <button className="map-pin teacher-pin" type="button"><span>指導碁</span><strong>先生を選ぶ</strong></button>
        <div className="next-journey"><div><span>次の冒険</span><strong>最初の花を見つけよう</strong><small>参加または先生との指導碁を記録すると、冒険が始まります。</small></div><img src="/fairy-apollon-guide.png" alt="案内役の妖精" /></div>
        <nav className="flower-tabs" aria-label="花記録メニュー"><button type="button">冒険者カード</button><button type="button" className="active">花図鑑</button><button type="button">称号</button></nav>
      </section>
      <div className="preview-explanation"><CheckCircle2 /><p><strong>ここから先は今のアプリです。</strong><span>現在の記録を守るため、最初はこの形でつなぎます。</span></p><Button variant="outline" onClick={() => setView('home')}>ポータル入口をもう一度見る</Button></div>
    </div>
  );

  if (view === 'league') return (
    <PageShell><section className="detail-page">
      <Button className="back-button" variant="ghost" onClick={() => setView('home')}><ArrowLeft />入口へ戻る</Button>
      <div className="detail-heading league-heading"><span><Trophy /></span><div><p className="eyebrow">水曜会リーグ</p><h1>第2期 リーグ戦表</h1></div></div>
      <div className="league-actions">
        <button type="button"><ClipboardCheck /><span><strong>対局結果を送る</strong><small>参加者はこちら</small></span><ChevronRight /></button>
        <button type="button"><UserRoundCheck /><span><strong>結果を確認する</strong><small>管理者専用</small></span><LockKeyhole /></button>
      </div>
      <div className="table-card"><div className="table-title"><h2>現在の成績</h2><span>見本データ</span></div>
        <Table><TableHeader><TableRow><TableHead>順位</TableHead><TableHead>お名前</TableHead><TableHead>対局数</TableHead><TableHead className="text-right">成績</TableHead></TableRow></TableHeader><TableBody>{leagueRows.map(row => <TableRow key={row.rank}><TableCell>{row.rank}</TableCell><TableCell className="font-semibold">{row.name}</TableCell><TableCell>{row.games}</TableCell><TableCell className="text-right">{row.score}</TableCell></TableRow>)}</TableBody></Table>
      </div>
      <section className="participant-section" aria-labelledby="participant-heading">
        <div className="participant-heading"><div><p className="eyebrow">リーグ参加者</p><h2 id="participant-heading">名前を押すと成績が開きます</h2></div><span>見本データ</span></div>
        <div className="participant-buttons">{participants.map(player => <Button key={player.name} variant="outline" className={selectedPlayer?.name === player.name ? 'selected' : ''} onClick={() => setSelectedPlayer(player)}>{player.name}<ChevronRight /></Button>)}</div>
        {selectedPlayer ? <div className="participant-result" aria-live="polite"><div className="participant-result-name"><span>個人成績</span><strong>{selectedPlayer.name}</strong></div><dl><div><dt>勝ち</dt><dd>{selectedPlayer.wins}</dd></div><div><dt>負け</dt><dd>{selectedPlayer.losses}</dd></div><div><dt>勝率</dt><dd>{selectedPlayer.rate}</dd></div></dl></div> : <p className="participant-hint">確認したい方のお名前を押してください。</p>}
      </section>
    </section></PageShell>
  );

  if (view === 'teacher') return (
    <PageShell><section className="detail-page">
      <Button className="back-button" variant="ghost" onClick={() => setView('home')}><ArrowLeft />入口へ戻る</Button>
      <div className="detail-heading teacher-heading"><span><BookOpenText /></span><div><p className="eyebrow">先生専用</p><h1>一局のご縁帳</h1></div></div>
      <div className="teacher-identity"><ShieldCheck /><span><strong>松本先生のご縁帳</strong>ログインした先生ご本人の記録だけを表示しています。</span><LockKeyhole /></div>
      <div className="teacher-comment"><div><Megaphone /><span>先生からのお知らせ</span></div><p>今回のお知らせが入ります</p><p>皆さんへのひとことが入ります</p><small>悦子さんの確認後、公開期間中だけ表示</small></div>
      <div className="teacher-records"><div className="record-date"><CalendarDays /><span>今日のご縁</span><strong>3局</strong></div><article><span className="record-flower">✿</span><div><strong>田中さん</strong><p>3か月ぶりの再会　六子</p></div><time>14:20</time></article><article><span className="record-flower">✿</span><div><strong>佐藤さん</strong><p>はじめての一局　九子</p></div><time>15:10</time></article></div>
      <section className="past-teacher-section" aria-labelledby="past-teacher-heading">
        <div className="past-teacher-heading"><History /><div><p className="eyebrow">これまでのご縁</p><h2 id="past-teacher-heading">過去の指導碁</h2></div></div>
        <div className="past-day-list">{pastTeacherDays.map(day => {
          const isOpen = openPastDay === day.id;
          return <article className={isOpen ? 'past-day open' : 'past-day'} key={day.id}>
            <button type="button" aria-expanded={isOpen} onClick={() => setOpenPastDay(isOpen ? null : day.id)}>
              <span className="past-date"><CalendarDays /><strong>{day.date}</strong></span>
              <span className="past-place"><MapPin />{day.place}</span>
              <span className="past-count">{day.count}局</span><ChevronDown />
            </button>
            {isOpen && <div className="past-day-records"><p>その日の記録</p>{day.records.map(record => <div key={`${day.id}-${record.time}`}><span className="record-flower">✿</span><strong>{record.name}</strong><span>{record.detail}</span><time>{record.time}</time></div>)}</div>}
          </article>;
        })}</div>
      </section>
      <div className="private-note"><LockKeyhole /><span><strong>対局者名は管理者が記入・確認します</strong>先生ご本人だけが閲覧でき、勝敗・順位・ほかの先生との比較は表示しません。</span></div>
    </section></PageShell>
  );

  return (
    <PageShell><main className="portal-home">
      <header className="portal-header"><div className="brand-mark"><span className="go-stone black" /><span className="go-stone white" /></div><div><p>湘南・藤沢</p><h1>水曜会ポータル</h1></div><span className="sample-badge">画面見本</span></header>
      <section className="welcome-panel"><div><p className="eyebrow">今月の定例会</p><h2>9月9日（水）</h2><p>いつもの時間・いつもの会場です</p></div><span className="calendar-tile"><small>水</small><strong>9</strong></span></section>
      <section className="primary-card"><div className="primary-card-art"><img src="/fairy-apollon-guide.png" alt="案内役の妖精" /></div><div className="primary-card-copy"><span className="card-kicker">いつもの記録</span><h2>花記録を使う</h2><p>参加の記録、指導碁の花、冒険者カードはこちらです。</p><Button size="lg" onClick={() => setView('flower-handoff')}>花記録を開く <ChevronRight /></Button></div></section>
      <section className="portal-stack" aria-label="水曜会メニュー">
        <button className="portal-card league-card" type="button" onClick={() => setView('league-login')}><span className="card-icon character-icon codex-icon"><img src="/menu-codex-original.png" alt="" /></span><span><small>リーグ参加者専用</small><strong>水曜会リーグ</strong><em>会員確認後、結果送信とリーグ表へ</em></span><LockKeyhole /></button>
        <div className="notice-strip event-notice"><span className="notice-character"><img src="/menu-league.png" alt="" /></span><div><strong>イベントのお知らせ</strong><p>開催日・会場などのお知らせをここに表示します。</p></div><ChevronRight /></div>
        <div className="notice-strip"><span className="notice-character"><img src="/menu-teacher-notice.png" alt="" /></span><div><strong>先生からのお知らせ</strong><p>承認された2行コメントを、ここに表示します。</p></div><ChevronRight /></div>
        <button className="portal-card teacher-card" type="button" onClick={() => setView('teacher-login')}><span className="card-icon character-icon"><img src="/menu-journal.png" alt="" /></span><span><small>先生専用</small><strong>一局のご縁帳</strong><em>本人確認後、自分の記録だけを表示</em></span><LockKeyhole /></button>
      </section>
      <footer className="portal-footer signature-lockup" aria-label="Be Water, Apollon Team, Codex"><span className="signature-motto">Be Water</span><img src="/apollon-team-signature-indigo.png" alt="Apollon Team" /><span className="signature-codex">Codex</span></footer>
    </main></PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) { return <div className="site-shell">{children}</div>; }
