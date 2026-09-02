'use client';

import { useCallback, useEffect, useState } from 'react';
import { Flower2, LockKeyhole } from 'lucide-react';
import { Match, formatHandicap, localActorHeader, resultLabels, todayInputValue } from './match-types';

export function TeacherMatches() {
  const [date, setDate] = useState(todayInputValue);
  const [teacherName, setTeacherName] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/teacher/matches?date=${encodeURIComponent(date)}`, { headers: localActorHeader(), cache: 'no-store' });
      const data = await response.json() as { error?: string; teacher?: { displayName: string }; matches?: Match[] };
      if (!response.ok) throw new Error(data.error || '対局を読み込めませんでした。');
      setTeacherName(data.teacher?.displayName || '先生');
      setMatches(data.matches || []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '対局を読み込めませんでした。');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { queueMicrotask(() => void load()); }, [load]);

  const displayDate = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'long', timeZone: 'Asia/Tokyo' }).format(new Date(`${date}T12:00:00+09:00`));

  return (
    <main className="roster-shell min-h-svh px-4 py-7 text-[#35483b]">
      <div className="teacher-book">
        <header className="teacher-cover">
          <span className="teacher-lock"><LockKeyhole /></span>
          <p className="eyebrow">先生専用・一局のご縁帳</p>
          <h1>{teacherName ? <>{teacherName}の<br />今日の対局</> : '先生専用ページ'}</h1>
          <p>{displayDate}</p>
          {!error && <span className="teacher-count">{matches.length}名</span>}
          <label className="teacher-date"><span>確認する日</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        </header>

        {error && <p role="alert" className="teacher-error">{error}</p>}
        {loading ? <p className="empty-state">対局を確認しています…</p> : !error && !matches.length ? <p className="empty-state">この日の担当対局はありません。</p> : (
          <div className="teacher-list">{matches.map((match, index) => (
            <article className="teacher-row" key={match.id}>
              <span className="teacher-number">{index + 1}</span>
              <div><small>{match.playedAt ? `${match.playedAt}ごろ` : '時刻未定'}</small><h2>{match.participantName}</h2><p>{match.rank || '棋力は確認中'} ・ {formatHandicap(match)}</p><p className="teacher-result">勝敗：{match.result ? resultLabels[match.result] : '確認中'}</p></div>
            </article>
          ))}</div>
        )}

        <footer className="teacher-footer"><Flower2 /><p><strong>{teacherName || '先生'}の記録だけを表示中</strong><br />別の先生の記録は、この入口へ渡していません。</p></footer>
      </div>
    </main>
  );
}
