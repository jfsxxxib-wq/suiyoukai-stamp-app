'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Flower2, Pencil, Plus, ShieldCheck, X } from 'lucide-react';
import { Match, Teacher, formatHandicap, localActorHeader, resultLabels, todayInputValue } from './match-types';

type Draft = {
  participantName: string;
  rank: string;
  teacherId: string;
  playedAt: string;
  baseHandicap: string;
  hasReverseKomi: boolean;
  reverseKomi: string;
  result: string;
};

const emptyDraft: Draft = { participantName: '', rank: '', teacherId: '', playedAt: '', baseHandicap: '', hasReverseKomi: false, reverseKomi: '', result: '' };

export function AdminMatches() {
  const [date, setDate] = useState(todayInputValue);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Match | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [localTest, setLocalTest] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/matches?date=${encodeURIComponent(date)}`, { headers: localActorHeader(), cache: 'no-store' });
      const data = await response.json() as { error?: string; teachers?: Teacher[]; matches?: Match[] };
      if (!response.ok) throw new Error(data.error || '名簿を読み込めませんでした。');
      setTeachers(data.teachers || []);
      setMatches(data.matches || []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '名簿を読み込めませんでした。');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    queueMicrotask(() => {
      setLocalTest(new URLSearchParams(window.location.search).get('localRole') === 'admin');
      void load();
    });
  }, [load]);

  const missing = useMemo(() => matches.filter((match) => !match.rank || !match.handicapType || !match.result).length, [matches]);
  const adminAdded = useMemo(() => matches.filter((match) => match.source === 'admin').length, [matches]);

  function openNew() {
    setEditing(null);
    setDraft({ ...emptyDraft, teacherId: teachers[0]?.id || '' });
    setError('');
    setDialogOpen(true);
  }

  function openEdit(match: Match) {
    setEditing(match);
    setDraft({
      participantName: match.participantName,
      rank: match.rank || '',
      teacherId: match.teacherId,
      playedAt: match.playedAt || '',
      baseHandicap: match.handicapType === 'sen' ? 'sen' : match.handicapType === 'stones' ? String(match.stoneCount) : '',
      hasReverseKomi: Boolean(match.reverseKomiHalfPoints),
      reverseKomi: match.reverseKomiHalfPoints ? String(match.reverseKomiHalfPoints / 2) : '',
      result: match.result || '',
    });
    setError('');
    setDialogOpen(true);
  }

  async function save(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const stones = Number(draft.baseHandicap);
    const body = {
      ...(editing ? { id: editing.id, version: editing.version } : {}),
      participantName: draft.participantName,
      rank: draft.rank,
      teacherId: draft.teacherId,
      playedOn: date,
      playedAt: draft.playedAt,
      handicapType: draft.baseHandicap === 'sen' ? 'sen' : Number.isInteger(stones) && stones >= 2 ? 'stones' : '',
      stoneCount: Number.isInteger(stones) ? stones : null,
      reverseKomi: draft.hasReverseKomi ? draft.reverseKomi : null,
      result: draft.result,
    };
    try {
      const response = await fetch('/api/admin/matches', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', ...localActorHeader() },
        body: JSON.stringify(body),
      });
      const data = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(data.error || '保存できませんでした。');
      setDialogOpen(false);
      setNotice(data.message || '保存しました。');
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '保存できませんでした。');
    } finally {
      setSaving(false);
    }
  }

  async function seedLocalData() {
    setError('');
    const response = await fetch('/api/test/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...localActorHeader() },
      body: JSON.stringify({ playedOn: date }),
    });
    const data = await response.json() as { error?: string; message?: string };
    if (!response.ok) return setError(data.error || '試験データを準備できませんでした。');
    setNotice(data.message || '試験データを準備しました。');
    await load();
  }

  return (
    <main className="roster-shell min-h-svh px-4 py-6 text-[#35483b]">
      <div className="mx-auto w-full max-w-[1050px]">
        <header className="roster-top">
          <span className="roster-flower"><Flower2 /></span>
          <div className="min-w-0 flex-1"><p className="eyebrow">水曜会 花記録</p><h1>管理者の対局名簿</h1></div>
          <span className="private-badge">管理者専用</span>
        </header>

        <section className="heading-row">
          <div><p className="eyebrow">今日の受付と対局情報</p><h2>対局名簿</h2><p>アプリを使わない方の追加と、受付後に分かった情報の訂正ができます。</p></div>
          <div className="heading-actions"><input aria-label="対局日" type="date" value={date} onChange={(event) => setDate(event.target.value)} /><button className="primary-button" onClick={openNew} disabled={!teachers.length}><Plus />参加者を追加</button></div>
        </section>

        <div className="admin-guide"><span><b>1</b>名簿にいない方を追加</span><span><b>2</b>記入待ちを訂正</span><span><b>3</b>先生本人のページで確認</span></div>
        {localTest && <button className="test-seed" onClick={seedLocalData}>ローカル試験用の架空データを準備</button>}
        {notice && <output className="page-notice">✓ {notice}</output>}
        {error && <p role="alert" className="page-error">{error}</p>}

        <div className="stats-grid">
          <article><span>対局予定</span><strong>{matches.length}<small>名</small></strong></article>
          <article><span>管理者が補足</span><strong>{adminAdded}<small>名</small></strong></article>
          <article className="warn"><span>記入待ち</span><strong>{missing}<small>件</small></strong></article>
        </div>

        {loading ? <p className="empty-state">名簿を読み込んでいます…</p> : !matches.length && !error ? <p className="empty-state">この日の対局はまだありません。</p> : (
          <div className="records-list">{matches.map((match) => (
            <article className="record-card" key={match.id}>
              <div className="record-time"><strong>{match.playedAt || '時刻未定'}</strong><span>{match.teacherName}</span></div>
              <div className="record-main"><div className="record-title"><h3>{match.participantName}</h3><span className={`source ${match.source}`}>{match.source === 'app' ? 'アプリ受付' : '管理者入力'}</span></div>
                <div className="record-details"><span><b>棋力</b><em className={!match.rank ? 'missing' : ''}>{match.rank || '未記入'}</em></span><span><b>手合い</b><em className={!match.handicapType ? 'missing' : ''}>{formatHandicap(match)}</em></span><span><b>勝敗</b><em className={!match.result ? 'missing' : ''}>{match.result ? resultLabels[match.result] : '未記入'}</em></span><span><b>表示先</b>{match.teacherName}だけ</span></div>
              </div>
              <button className="edit-button" onClick={() => openEdit(match)}><Pencil />訂正</button>
            </article>
          ))}</div>
        )}

        <aside className="policy-box"><ShieldCheck /><p><strong>表示の考え方</strong><br />先生ページには、サーバーが確認した先生本人の担当分だけを返します。逆コミは黒が受け取るものとして記録します。</p></aside>
      </div>

      {dialogOpen && <div className="modal-backdrop" role="presentation"><dialog open className="match-modal" aria-labelledby="match-dialog-title">
        <button className="modal-close" aria-label="閉じる" onClick={() => setDialogOpen(false)}><X /></button>
        <form onSubmit={save}>
          <p className="eyebrow">{editing ? '名簿を訂正' : '管理者が補足'}</p>
          <h2 id="match-dialog-title">{editing ? '対局情報を直す' : '参加者を名簿へ追加'}</h2>
          <p>{editing ? '受付後に分かった棋力・手合い・逆コミ・勝敗も補えます。' : 'アプリを使っていない方も、先生のページに表示できます。'}</p>
          <div className="match-form">
            <label><span>お名前（必須）</span><input value={draft.participantName} onChange={(e) => setDraft({ ...draft, participantName: e.target.value })} autoFocus /></label>
            <label><span>棋力</span><input value={draft.rank} onChange={(e) => setDraft({ ...draft, rank: e.target.value })} placeholder="不明なら空欄で保存できます" /></label>
            <label><span>担当の先生（必須）</span><select value={draft.teacherId} onChange={(e) => setDraft({ ...draft, teacherId: e.target.value })}>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.displayName}</option>)}</select></label>
            <label><span>対局時刻</span><input type="time" value={draft.playedAt} onChange={(e) => setDraft({ ...draft, playedAt: e.target.value })} /></label>
            <label><span>基本の手合い</span><select value={draft.baseHandicap} onChange={(e) => setDraft({ ...draft, baseHandicap: e.target.value })}><option value="">未記入</option><option value="sen">先</option>{[2,3,4,5,6,7,8,9].map((n) => <option key={n} value={n}>{n}子局</option>)}</select></label>
            <label><span>追加の逆コミ</span><select value={draft.hasReverseKomi ? 'yes' : 'no'} onChange={(e) => setDraft({ ...draft, hasReverseKomi: e.target.value === 'yes', reverseKomi: e.target.value === 'yes' ? draft.reverseKomi : '' })}><option value="no">なし</option><option value="yes">あり</option></select></label>
            {draft.hasReverseKomi && <label><span className="reverse-label">逆コミの目数（黒が受け取ります）</span><input type="number" min="0.5" step="0.5" inputMode="decimal" value={draft.reverseKomi} onChange={(e) => setDraft({ ...draft, reverseKomi: e.target.value })} placeholder="例：3 または 6.5" /><small>表示時に「3目」「6目半」へ自動変換します。</small></label>}
            <label><span>勝敗</span><select value={draft.result} onChange={(e) => setDraft({ ...draft, result: e.target.value })}><option value="">未記入</option>{Object.entries(resultLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          </div>
          {error && <p role="alert" className="form-error">{error}</p>}
          <div className="modal-actions"><button type="button" onClick={() => setDialogOpen(false)}>やめる</button><button className="primary-button" disabled={saving}>{saving ? '保存中…' : editing ? '訂正を保存' : '名簿に追加'}</button></div>
        </form>
      </dialog></div>}
    </main>
  );
}
