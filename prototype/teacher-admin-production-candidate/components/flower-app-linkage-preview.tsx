'use client';

import { useState } from 'react';
import { Check, Flower2, Link2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function FlowerAppLinkagePreview() {
  const [ticket] = useState(() => typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('ticket') || '');
  const [receptionNumber, setReceptionNumber] = useState(() => typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('reception') || '');
  const [displayName, setDisplayName] = useState(() => typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('name') || '');
  const [appNumber, setAppNumber] = useState('31415926');
  const [linked, setLinked] = useState(false);
  const [synced, setSynced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function connect() {
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/test/linkage/redeem', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket, appNumber }),
      });
      const data = await response.json() as { error?: string; receptionNumber?: string; displayName?: string };
      if (!response.ok) throw new Error(data.error || '連携できませんでした。');
      setReceptionNumber(data.receptionNumber || receptionNumber);
      setDisplayName(data.displayName || displayName);
      setLinked(true);
      setNotice('受付番号と花記録の個人番号を安全に連携しました。');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '連携できませんでした。');
    } finally { setBusy(false); }
  }

  async function receiveStamp() {
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/test/linkage/sync', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appNumber }),
      });
      const data = await response.json() as { error?: string; appliedCount?: number; total?: number };
      if (!response.ok) throw new Error(data.error || 'スタンプを受け取れませんでした。');
      setSynced(true);
      setNotice(data.appliedCount
        ? `今日の参加スタンプを反映しました。試験用の累計は${data.total}個です。`
        : '新しい送信待ちスタンプはありません。');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'スタンプを受け取れませんでした。');
    } finally { setBusy(false); }
  }

  return (
    <main className="flower-link-shell min-h-svh px-4 py-8">
      <Card className="flower-link-card mx-auto max-w-[520px]">
        <CardHeader>
          <div className="flower-link-mark"><Flower2 /></div>
          <p className="eyebrow">花記録アプリ・安全な連携の試験</p>
          <CardTitle>受付記録を花記録へつなぎます</CardTitle>
          <p className="flower-link-lead">連携券は一度だけ使え、URLには個人番号を載せません。</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flower-link-summary">
            <div><span>お名前</span><strong>{displayName || '受付から受け取り中'}</strong></div>
            <div><span>本日の受付番号</span><strong>{receptionNumber || '受付から受け取り中'}</strong></div>
          </div>

          <label className="flower-link-input" htmlFor="app-number">
            <span>この花記録の8桁個人番号</span>
            <Input id="app-number" inputMode="numeric" maxLength={8} value={appNumber} onChange={(event) => setAppNumber(event.target.value.replace(/\D/g, ''))} disabled={linked} />
            <small>試験用として「31415926」が入っています。</small>
          </label>

          {notice && <p className="flower-link-message good"><Check />{notice}</p>}
          {error && <p className="flower-link-message error">{error}</p>}

          {!linked ? (
            <Button className="w-full" size="lg" onClick={connect} disabled={busy || !ticket || appNumber.length !== 8}>
              <Link2 />{busy ? '連携しています…' : 'この花記録と連携する'}
            </Button>
          ) : (
            <Button className="w-full" size="lg" onClick={receiveStamp} disabled={busy || synced}>
              <Flower2 />{synced ? '参加スタンプ反映済み' : busy ? '受け取っています…' : '参加スタンプを受け取る'}
            </Button>
          )}

          <p className="flower-link-safety"><ShieldCheck />これはローカルの試験専用です。本番の花記録や今日の受付記録は変わりません。</p>
        </CardContent>
      </Card>
    </main>
  );
}
