'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Check, CircleAlert, Clock3, Flower2, History, KeyRound,
  Link2, RefreshCw, RotateCcw, Search, Sheet, Smartphone, TicketCheck, UserRoundCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { localActorHeader } from '@/components/match-types';
import type { LinkageParticipant } from '@/lib/linkage-store';

type MirrorItem = { receptionId: string; row: Record<string, string>; syncStatus: string; updatedAt: number };

const statusClass = (value: string) => {
  if (value === '完了' || value === '連携済み' || value === '反映済み') return 'is-complete';
  if (value === '送信待ち' || value === '連携券発行済み') return 'is-waiting';
  return 'is-pending';
};

export function ParticipantLinkagePreview() {
  const [participants, setParticipants] = useState<LinkageParticipant[]>([]);
  const [mirror, setMirror] = useState<MirrorItem[]>([]);
  const [selectedId, setSelectedId] = useState('p-003');
  const [query, setQuery] = useState('');
  const [onlyNeedsAction, setOnlyNeedsAction] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ticketLinks, setTicketLinks] = useState<Record<string, string>>({});

  const load = useCallback(async (seedWhenEmpty = false) => {
    let { response, data } = await requestOverview();
    if (seedWhenEmpty && !data.participants?.length) {
      const seeded = await fetch('/api/test/linkage', { method: 'POST', headers: localActorHeader() });
      if (!seeded.ok) throw new Error('試験データを準備できませんでした。');
      ({ response, data } = await requestOverview());
    }
    if (!response.ok) throw new Error(data.error || '試験データを読み込めませんでした。');
    setParticipants(data.participants || []);
    setMirror(data.mirror || []);
  }, []);

  useEffect(() => {
    load(true).catch((reason) => setError(reason instanceof Error ? reason.message : '読み込めませんでした。'));
    const refresh = () => load(false).catch(() => undefined);
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [load]);

  const selected = participants.find((participant) => participant.id === selectedId) || participants[0];
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return participants.filter((participant) => {
      const matches = !normalized || participant.name.toLowerCase().includes(normalized)
        || participant.receptionNumber.toLowerCase().includes(normalized)
        || participant.appNumber?.toLowerCase().includes(normalized);
      const needsAction = participant.linkStatus !== '連携済み' || participant.stampStatus !== '反映済み';
      return matches && (!onlyNeedsAction || needsAction);
    });
  }, [participants, query, onlyNeedsAction]);

  async function issueTicket() {
    if (!selected || selected.linkStatus === '連携済み') return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/test/linkage/ticket', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...localActorHeader() },
        body: JSON.stringify({ receptionId: selected.id }),
      });
      const data = await response.json() as { ticket?: string; receptionId?: string; displayName?: string; error?: string };
      if (!response.ok || !data.ticket) throw new Error(data.error || '連携券を発行できませんでした。');
      const link = `/flower-app-linkage-preview?ticket=${encodeURIComponent(data.ticket)}&reception=${encodeURIComponent(selected.receptionNumber)}&name=${encodeURIComponent(data.displayName || selected.name)}`;
      setTicketLinks((current) => ({ ...current, [selected.id]: link }));
      await load(false);
      setNotice(`${selected.name}さんの一度だけ使える連携券を発行しました。次に花記録の試験画面を開いてください。`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '連携券を発行できませんでした。');
    } finally { setBusy(false); }
  }

  function openFlowerApp() {
    if (!selected) return;
    const link = ticketLinks[selected.id];
    if (link) window.location.href = link;
  }

  async function refreshState() {
    setBusy(true); setError('');
    try { await load(false); setNotice('試験用データベースから最新の状態を読み直しました。'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : '読み直せませんでした。'); }
    finally { setBusy(false); }
  }

  async function resetDemo() {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/test/linkage', { method: 'POST', headers: localActorHeader() });
      const data = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(data.error || '最初の状態へ戻せませんでした。');
      setTicketLinks({}); setSelectedId('p-003'); setQuery(''); setOnlyNeedsAction(false);
      await load(false); setNotice(data.message || '最初の状態へ戻しました。');
    } catch (reason) { setError(reason instanceof Error ? reason.message : '戻せませんでした。'); }
    finally { setBusy(false); }
  }

  const linkedCount = participants.filter((participant) => participant.linkStatus === '連携済み').length;
  const reflectedCount = participants.filter((participant) => participant.stampStatus === '反映済み').length;
  const needsActionCount = participants.filter((participant) => participant.linkStatus !== '連携済み' || participant.stampStatus !== '反映済み').length;

  if (!selected) return <main className="linkage-shell min-h-svh p-8"><p>{error || '試験データを準備しています…'}</p></main>;

  return (
    <main className="linkage-shell min-h-svh px-3 py-5 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1180px]">
        <header className="linkage-header">
          <div className="linkage-brand"><Flower2 aria-hidden="true" /></div>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">水曜会 花記録・管理者確認用</p>
            <h1>参加者番号とスタンプ連携</h1>
            <p>受付番号と8桁のアプリ個人番号を分けたまま、安全に結びます。</p>
          </div>
          <Badge className="preview-label">試験DB接続・本番未接続</Badge>
        </header>

        <section className="flow-strip" aria-label="連携の流れ">
          <span><UserRoundCheck />名前保存</span><ArrowRight />
          <span><TicketCheck />受付番号</span><ArrowRight />
          <span><KeyRound />連携券</span><ArrowRight />
          <span><Smartphone />個人番号</span><ArrowRight />
          <span><Flower2 />スタンプ反映</span>
        </section>

        {notice && <output className="linkage-notice"><Check />{notice}</output>}
        {error && <div className="linkage-notice is-error" role="alert"><CircleAlert />{error}</div>}

        <section className="linkage-stats" aria-label="本日の集計">
          <article><span>受付済み</span><strong>{participants.length}<small>名</small></strong><em>受付番号を発行</em></article>
          <article><span>アプリ連携済み</span><strong>{linkedCount}<small>名</small></strong><em>二つの番号を紐づけ</em></article>
          <article><span>スタンプ反映済み</span><strong>{reflectedCount}<small>名</small></strong><em>本人アプリで確認</em></article>
          <article className="needs-action"><span>確認が必要</span><strong>{needsActionCount}<small>名</small></strong><em>未連携・送信待ち</em></article>
        </section>

        <div className="linkage-layout">
          <section className="linkage-list-panel" aria-label="参加者一覧">
            <div className="panel-title-row">
              <div><p className="eyebrow">2026年9月2日・架空データ</p><h2>本日の受付一覧</h2></div>
              <Button variant="outline" onClick={resetDemo} disabled={busy}><RotateCcw />最初に戻す</Button>
            </div>
            <div className="linkage-tools">
              <label className="search-box" htmlFor="linkage-search"><Search /><Input id="linkage-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="名前・受付番号・個人番号で検索" /></label>
              <button type="button" className={`action-filter ${onlyNeedsAction ? 'active' : ''}`} onClick={() => setOnlyNeedsAction((value) => !value)}>
                <CircleAlert />確認が必要な人だけ
              </button>
            </div>
            <div className="participant-list">
              {filtered.map((participant) => (
                <button type="button" key={participant.id} className={`participant-row ${selected.id === participant.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedId(participant.id); setNotice(''); setError(''); }}>
                  <span className="participant-time">{participant.receivedAt}</span>
                  <span className="participant-main"><strong>{participant.name}</strong><small>受付 {participant.receptionNumber}</small><small>個人 {participant.appNumber ?? '未連携'}</small></span>
                  <span className="participant-statuses"><i className={statusClass(participant.linkStatus)}>{participant.linkStatus}</i><i className={statusClass(participant.stampStatus)}>{participant.stampStatus}</i></span>
                </button>
              ))}
              {!filtered.length && <p className="linkage-empty">条件に合う方はいません。</p>}
            </div>
          </section>

          <aside className="linkage-detail-panel" aria-label="選択した参加者の詳細">
            <div className="detail-heading"><span className="detail-avatar">{selected.name.slice(0, 1)}</span><div><p className="eyebrow">選択中の参加者</p><h2>{selected.name}</h2></div></div>
            <div className="number-pair">
              <div><span>アプリ個人番号</span><strong>{selected.appNumber ?? 'まだありません'}</strong><small>同じ人を継続して識別</small></div>
              <Link2 aria-hidden="true" />
              <div><span>本日の受付番号</span><strong>{selected.receptionNumber}</strong><small>今日の受付を識別</small></div>
            </div>
            <ol className="status-steps">
              <li className="done"><span><Check /></span><div><strong>名前保存済み</strong><small>試験用受付データ</small></div></li>
              <li className={selected.linkStatus === '未連携' ? 'current' : 'done'}><span>{selected.linkStatus === '未連携' ? '2' : <Check />}</span><div><strong>アプリ連携</strong><small>{selected.linkStatus}</small></div></li>
              <li className={selected.stampStatus === '反映済み' ? 'done' : selected.linkStatus === '連携済み' ? 'current' : ''}><span>{selected.stampStatus === '反映済み' ? <Check /> : '3'}</span><div><strong>参加スタンプ</strong><small>{selected.stampStatus}</small></div></li>
            </ol>
            {selected.note && <p className="participant-note"><CircleAlert />{selected.note}</p>}
            <div className="demo-actions">
              <Button onClick={issueTicket} disabled={busy || selected.linkStatus === '連携済み'}><KeyRound />連携券を発行</Button>
              <Button onClick={openFlowerApp} disabled={!ticketLinks[selected.id]}><Link2 />花記録の試験画面を開く</Button>
              <Button onClick={refreshState} disabled={busy}><RefreshCw />反映状態を確認</Button>
            </div>
            <p className="demo-caption">試験用データベースへ保存しますが、本番の受付・花記録・正式スプレッドシートには触れません。</p>
            <div className="history-box"><h3><History />変更・反映履歴</h3><ul>
              {selected.history.map((item, index) => <li key={`${item.time}-${index}`} className={item.tone}><time>{item.time}</time><span>{item.text}</span></li>)}
            </ul></div>
          </aside>
        </div>

        <Card className="sheet-preview">
          <CardHeader className="sheet-preview-heading">
            <div><p className="eyebrow">確認・印刷・予備保存用</p><CardTitle><Sheet />スプレッドシートへ自動転記する内容</CardTitle></div>
            <Badge variant="outline">正式シートは未接続</Badge>
          </CardHeader>
          <CardContent className="px-0">
            <div className="sheet-table-wrap"><table><thead><tr><th>受付番号</th><th>アプリ個人番号</th><th>氏名</th><th>受付状態</th><th>アプリ連携</th><th>参加スタンプ</th><th>受付日時</th></tr></thead>
              <tbody>{mirror.map((item) => <tr key={item.receptionId}><td>{item.row.受付番号}</td><td>{item.row.アプリ個人番号}</td><td>{item.row.氏名}</td><td>{item.row.受付状態}</td><td>{item.row.アプリ連携}</td><td>{item.row.参加スタンプ}</td><td>{item.row.受付日時}</td></tr>)}</tbody>
            </table></div>
            <p className="sheet-footnote"><Clock3 />同じ試験用データベースから作る「写し」です。次の段階でテスト用Googleスプレッドシートへ接続できます。</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

async function requestOverview() {
  const response = await fetch('/api/test/linkage', { headers: localActorHeader(), cache: 'no-store' });
  const data = await response.json() as { participants?: LinkageParticipant[]; mirror?: MirrorItem[]; error?: string };
  return { response, data };
}
