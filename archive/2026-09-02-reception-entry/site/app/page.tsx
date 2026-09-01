'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCheck,
  ExternalLink,
  Flower2,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Screen = 'welcome' | 'form' | 'resume' | 'complete';
type Reception = {
  receptionCode: string;
  status: 'in_progress' | 'complete';
  resumeToken: string;
  createdAt: number;
  updatedAt: number;
};

const storageKey = 'suiyoukai-reception-token-20260902-production-v1';
const flowerAppUrl = 'https://jfsxxxib-wq.github.io/suiyoukai-stamp-app/';
const eventKey = '20260902';
const participationStampUrl = `${flowerAppUrl}?stamp=eyJ0eXBlIjoicGFydGljaXBhdGlvbl9zdGFtcCIsImlkIjoicGFydGljaXBhdGlvbi0yMDI2LTA5LTAyIiwiZGF0ZSI6IjIwMjYtMDktMDIifQ`;
const steps = ['受付番号', '受付保存', '参加QR', '完了'];

class ReceptionNotFoundError extends Error {}

function createResumeToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

async function fetchReception(token: string) {
  const response = await fetch(`/api/reception?token=${encodeURIComponent(token)}`, { cache: 'no-store' });
  if (response.status === 404) throw new ReceptionNotFoundError();
  if (!response.ok) throw new Error('not-found');
  return (await response.json() as { reception: Reception }).reception;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [reception, setReception] = useState<Reception | null>(null);
  const [restored, setRestored] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [givenName, setGivenName] = useState('');
  const [pendingRequest, setPendingRequest] = useState<{ id: string; resumeToken: string } | null>(null);

  useEffect(() => {
    async function restoreReception() {
      const query = new URLSearchParams(window.location.search);
      const queryToken = query.get('token');
      const token = queryToken || window.localStorage.getItem(storageKey);
      const isParticipationCheckin = query.get('checkin') === '1' && query.get('event') === eventKey;

      if (!token) {
        if (isParticipationCheckin) {
          setError('先にアプリ入口QRを読み、お名前の受付を済ませてください。');
        }
        setBusy(false);
        return;
      }

      try {
        let saved: Reception;
        if (isParticipationCheckin) {
          const response = await fetch('/api/reception', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'complete', token }),
          });
          if (response.status === 404) throw new ReceptionNotFoundError();
          if (!response.ok) throw new Error('complete-failed');
          saved = (await response.json() as { reception: Reception }).reception;
        } else {
          saved = await fetchReception(token);
        }

        window.localStorage.setItem(storageKey, saved.resumeToken);
        window.history.replaceState({}, '', window.location.pathname);
        setReception(saved);
        setScreen(saved.status === 'complete' ? 'complete' : 'resume');
        setRestored(!isParticipationCheckin);
        if (isParticipationCheckin && saved.status === 'complete') {
          window.setTimeout(() => window.location.assign(participationStampUrl), 1400);
        }
      } catch (cause) {
        if (cause instanceof ReceptionNotFoundError) {
          window.localStorage.removeItem(storageKey);
          window.history.replaceState({}, '', window.location.pathname);
          setReception(null);
          setScreen('welcome');
          setRestored(false);
          setError(isParticipationCheckin ? '先にアプリ入口QRを読み、お名前の受付を済ませてください。' : '');
        } else {
          setError('保存された受付を読み込めませんでした。係の方へお声がけください。');
        }
      } finally {
        setBusy(false);
      }
    }

    void restoreReception();
  }, []);

  const saveReception = async () => {
    const normalizedFamilyName = familyName.normalize('NFKC').trim().replace(/\s+/g, ' ');
    const normalizedGivenName = givenName.normalize('NFKC').trim().replace(/\s+/g, ' ');
    if (!normalizedFamilyName || !normalizedGivenName) {
      setError('名字と下のお名前を両方入力してください。');
      return;
    }

    setBusy(true);
    setError('');
    const request = pendingRequest ?? { id: crypto.randomUUID(), resumeToken: createResumeToken() };
    if (!pendingRequest) setPendingRequest(request);
    try {
      const response = await fetch('/api/reception', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          familyName: normalizedFamilyName,
          givenName: normalizedGivenName,
          clientRequestId: request.id,
          resumeToken: request.resumeToken,
        }),
      });
      const result = (await response.json().catch(() => null)) as { reception?: Reception; error?: string } | null;
      if (!response.ok || !result?.reception) throw new Error(result?.error || '保存できませんでした。');
      const saved = result.reception;
      window.localStorage.setItem(storageKey, saved.resumeToken);
      setReception(saved);
      setRestored(false);
      setScreen('resume');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '保存できませんでした。通信を確認して、もう一度お試しください。');
    } finally {
      setBusy(false);
    }
  };

  const currentStep = { welcome: 0, form: 1, resume: 2, complete: 3 }[screen];

  if (busy && !reception && screen === 'welcome') {
    return (
      <main className="reception-shell grid min-h-svh place-items-center text-[#315f48]">
        <div className="text-center"><LoaderCircle className="mx-auto size-8 animate-spin" /><p className="mt-3 text-sm font-bold">保存した受付を確認しています</p></div>
      </main>
    );
  }

  return (
    <main className="reception-shell min-h-svh text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-[430px] flex-col px-4 pb-8 pt-[max(18px,env(safe-area-inset-top))]">
        <header className="mb-4 flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-[13px] border border-[#4f765e]/25 bg-[#fffdf5] text-[#d17e75] shadow-sm" aria-label="コスモスの花"><Flower2 className="size-7" /></span>
            <div><p className="text-[11px] font-bold tracking-[0.12em] text-[#8b7653]">水曜会</p><p className="text-sm font-bold tracking-[0.04em] text-[#315f48]">花記録・受付</p></div>
          </div>
          <span className="rounded-full border border-[#be7b5e]/25 bg-[#fff3eb] px-2.5 py-1 text-[10px] font-bold text-[#995a43]">未公開・見本</span>
        </header>

        <div className="mb-3 rounded-xl border border-[#b86f55]/25 bg-[#fff3eb] px-3 py-2 text-center text-[11px] font-bold leading-5 text-[#8b563f]">本番用受付帳へ接続した未公開見本です。一般公開はしていません。</div>

        <nav aria-label="受付の進み具合" className="mb-4 rounded-2xl border border-[#6f927c]/18 bg-white/72 px-3 py-3 shadow-[0_8px_24px_rgba(61,81,67,0.06)] backdrop-blur-sm">
          <ol className="grid grid-cols-4">
            {steps.map((label, index) => {
              const done = index < currentStep;
              const active = index === currentStep;
              return (
                <li key={label} className="relative flex flex-col items-center gap-1.5 text-center">
                  {index > 0 && <span aria-hidden="true" className={`absolute right-1/2 top-[13px] h-[2px] w-full ${index <= currentStep ? 'bg-[#76a181]' : 'bg-[#dce5de]'}`} />}
                  <span className={`relative z-10 grid size-7 place-items-center rounded-full border text-[11px] font-bold ${done ? 'border-[#5d8b6a] bg-[#5d8b6a] text-white' : active ? 'border-[#d29448] bg-[#fff4dc] text-[#925e20] ring-4 ring-[#f8e6bd]/65' : 'border-[#cfd9d2] bg-[#f8faf8] text-[#839087]'}`}>{done ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}</span>
                  <span className={`relative z-10 text-[9px] font-bold leading-tight ${active ? 'text-[#80541f]' : done ? 'text-[#52745b]' : 'text-[#8b938d]'}`}>{label}</span>
                </li>
              );
            })}
          </ol>
        </nav>

        {restored && <output className="mb-3 flex items-center gap-2 rounded-xl border border-[#d29b55]/30 bg-[#fff7e8] px-3 py-2 text-xs font-bold text-[#7e5b2e]"><RotateCcw className="size-4" />保存された続きから開きました</output>}
        {error && <p role="alert" className="mb-3 rounded-xl bg-[#fff0ed] px-3 py-2 text-xs font-bold text-[#9b4f43]">{error}</p>}

        <section className="flex flex-1 items-center" aria-live="polite">
          {screen === 'welcome' && (
            <Card className="w-full gap-0 rounded-[28px] border-0 bg-[#fffdf7]/96 py-0 shadow-[0_20px_55px_rgba(68,83,69,0.15)] ring-1 ring-[#63836d]/14">
              <CardContent className="px-6 pb-7 pt-7 text-center">
                <div className="flower-halo mx-auto mb-5 grid size-32 place-items-center rounded-full"><span className="grid size-24 place-items-center rounded-[28px] bg-[#fffdf5] text-[#d17e75] shadow-[0_10px_26px_rgba(73,99,78,0.14)]" aria-label="水曜会 花記録の花"><Flower2 className="size-16" strokeWidth={1.5} /></span></div>
                <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#b47749]">WEDNESDAY RECEPTION</p>
                <h1 className="font-serif-jp text-[27px] font-semibold leading-[1.45] tracking-[0.04em] text-[#2f5f47]">水曜会 花記録へ<br />ようこそ</h1>
                <p className="mx-auto mt-4 max-w-[280px] text-sm font-medium leading-7 text-[#6f6859]">お名前を入力して、受付番号を受け取ります。</p>
                <Button onClick={() => setScreen('form')} className="mt-7 h-14 w-full rounded-2xl bg-[#3f7658] text-base font-bold shadow-[0_9px_20px_rgba(63,118,88,0.22)] hover:bg-[#35684c]">受付をはじめる<ArrowRight className="ml-1 size-5" /></Button>
                <button onClick={() => window.location.assign(flowerAppUrl)} className="mt-3 flex min-h-[58px] w-full items-center justify-between rounded-2xl border border-[#6f927c]/40 bg-white px-4 text-left text-[#3f684f] shadow-[0_4px_14px_rgba(58,91,68,0.07)] hover:bg-[#f1f7f1]">
                  <span className="flex min-w-0 flex-col leading-tight"><strong className="text-sm">すでに受付済みの方</strong><small className="mt-1 text-[11px] font-semibold text-[#758078]">花記録アプリへ進みます</small></span><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e7f1e9] text-[#4f795b]"><ArrowRight className="size-4" /></span>
                </button>
              </CardContent>
            </Card>
          )}

          {screen === 'form' && (
            <Card className="w-full gap-0 rounded-[28px] border-0 bg-[#fffdf7]/96 py-0 shadow-[0_20px_55px_rgba(68,83,69,0.15)] ring-1 ring-[#63836d]/14">
              <CardContent className="px-5 pb-6 pt-6">
                <Button variant="ghost" size="sm" onClick={() => setScreen('welcome')} className="-ml-2 mb-3 text-[#617267]"><ArrowLeft />玄関へ戻る</Button>
                <div className="mb-5 flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#fff1db] text-[#a96d2c]"><ClipboardCheck className="size-6" /></span><div><p className="text-xs font-bold tracking-[0.1em] text-[#a36e3c]">水曜会 受付</p><h1 className="font-serif-jp mt-1 text-2xl font-semibold text-[#315f48]">お名前を入力します</h1></div></div>
                <label htmlFor="family-name" className="block text-sm font-bold text-[#52695b]">名字</label>
                <Input
                  id="family-name"
                  name="familyName"
                  value={familyName}
                  onChange={(event) => { setFamilyName(event.target.value); setError(''); }}
                  autoComplete="family-name"
                  maxLength={20}
                  placeholder="例：水曜"
                  className="mt-2 h-14 rounded-2xl border-[#76927f]/35 bg-white px-4 text-base text-[#315f48] shadow-sm"
                />
                <label htmlFor="given-name" className="mt-4 block text-sm font-bold text-[#52695b]">下のお名前</label>
                <Input
                  id="given-name"
                  name="givenName"
                  value={givenName}
                  onChange={(event) => { setGivenName(event.target.value); setError(''); }}
                  autoComplete="given-name"
                  maxLength={20}
                  placeholder="例：はなこ"
                  className="mt-2 h-14 rounded-2xl border-[#76927f]/35 bg-white px-4 text-base text-[#315f48] shadow-sm"
                />
                <p className="mt-2 text-xs font-medium leading-5 text-[#746f65]">同姓の方との取り違えを防ぐため、両方入力してください。</p>
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-[#fff7e8] px-3 py-2.5 text-xs font-bold leading-5 text-[#7c6240]"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#668b70]" />受付番号は保存時に「20260902-001」形式で発行します。</p>
                <Button onClick={saveReception} disabled={busy || !familyName.trim() || !givenName.trim()} className="mt-6 min-h-14 w-full whitespace-normal rounded-2xl bg-[#3f7658] px-4 py-3 text-base font-bold leading-6 hover:bg-[#35684c]">{busy ? <><LoaderCircle className="animate-spin" />受付帳へ保存しています</> : <>受付帳へ保存して次へ<ArrowRight className="ml-1 size-5" /></>}</Button>
              </CardContent>
            </Card>
          )}

          {screen === 'resume' && (
            <Card className="w-full gap-0 rounded-[28px] border-0 bg-[#fffdf7]/96 py-0 shadow-[0_20px_55px_rgba(68,83,69,0.15)] ring-1 ring-[#63836d]/14">
              <CardContent className="px-5 pb-6 pt-7 text-center">
                <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-[#fff0d6] text-[#a76c29] ring-8 ring-[#fff8ea]"><RotateCcw className="size-7" /></div>
                <p className="text-xs font-bold tracking-[0.12em] text-[#a36e3c]">続きから再開</p><h1 className="font-serif-jp mt-2 text-[26px] font-semibold text-[#315f48]">受付の途中です</h1><p className="mt-2 text-sm leading-6 text-[#6f6859]">画面を閉じても、この入口をもう一度開くとここへ戻ります。</p>
                <dl className="mt-5 rounded-2xl border border-[#d5c6a9]/45 bg-[#fffaf0] px-4 py-3 text-left"><div className="flex items-center justify-between gap-4"><dt className="text-xs font-bold text-[#7e7668]">受付番号</dt><dd className="text-lg font-extrabold tracking-[0.08em] text-[#315f48]">{reception?.receptionCode}</dd></div><div className="mt-2 flex items-center justify-between gap-4 border-t border-[#dfd4bf]/50 pt-2"><dt className="text-xs font-bold text-[#7e7668]">次にすること</dt><dd className="text-sm font-bold text-[#895c29]">参加QR</dd></div></dl>
                <div className="mt-5 rounded-2xl bg-[#edf6ef] p-4"><Smartphone className="mx-auto size-7 text-[#4f7c5d]" /><p className="mt-2 text-sm font-bold text-[#315f48]">会場の印刷参加QRを読み取ります</p><p className="mt-1 text-xs leading-5 text-[#6b756e]">この画面を閉じずにスマホのカメラを開き、受付に置かれた「受付用 参加QR」を読み取ってください。</p></div>
                <p className="mt-4 rounded-xl bg-[#fff7e8] px-3 py-2.5 text-xs font-bold leading-5 text-[#805723]">読み取ると受付が完了し、そのまま花記録へ進みます。</p>
              </CardContent>
            </Card>
          )}

          {screen === 'complete' && (
            <Card className="w-full gap-0 rounded-[28px] border-0 bg-[#fffdf7]/96 py-0 shadow-[0_20px_55px_rgba(68,83,69,0.15)] ring-1 ring-[#63836d]/14">
              <CardContent className="px-6 pb-7 pt-8 text-center">
                <div className="flower-halo relative mx-auto grid size-28 place-items-center rounded-full"><span className="grid size-20 place-items-center rounded-[24px] bg-[#fffdf5] text-[#d17e75] shadow-md"><Flower2 className="size-12" /></span><span className="absolute right-0 top-0 grid size-9 place-items-center rounded-full bg-[#4d825e] text-white ring-4 ring-[#fffdf7]"><Check className="size-5" strokeWidth={3} /></span></div>
                <p className="mt-5 text-xs font-bold tracking-[0.16em] text-[#b47749]">RECEPTION COMPLETE</p><h1 className="font-serif-jp mt-2 text-[28px] font-semibold text-[#315f48]">受付が完了しました</h1><p className="mt-3 text-sm font-medium leading-7 text-[#6f6859]">ご参加ありがとうございます。花記録へお進みください。</p>
                <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#edf6ef] px-3 py-2.5 text-xs font-bold text-[#4f765a]"><Flower2 className="size-4" />受付番号 {reception?.receptionCode}・受付完了</div>
                <Button onClick={() => window.location.assign(participationStampUrl)} className="mt-6 min-h-14 w-full whitespace-normal rounded-2xl bg-[#3f7658] px-4 py-3 text-base font-bold leading-6 hover:bg-[#35684c]">花記録アプリへ進む<ExternalLink className="ml-1 size-5" /></Button>
                <p className="mt-2 text-[11px] font-medium text-[#938979]">現在の花記録へ移動する、一方向の出口です</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}
