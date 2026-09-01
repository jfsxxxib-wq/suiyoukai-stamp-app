'use client';

import { useEffect, useState } from 'react';
import { LoaderCircle, Printer, QrCode } from 'lucide-react';
import Image from 'next/image';
import QRCode from 'qrcode';

export default function EntranceQrPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const target = `${window.location.origin}/`;
    QRCode.toDataURL(target, { width: 360, margin: 2, color: { dark: '#315f48', light: '#fffdf7' } })
      .then(setImageUrl)
      .catch(() => setError('QRを作成できませんでした。'));
  }, []);

  return (
    <main className="reception-shell grid min-h-svh place-items-center px-4 py-8 text-foreground">
      <section className="w-full max-w-[430px] rounded-[28px] bg-[#fffdf7]/96 p-6 text-center shadow-[0_20px_55px_rgba(68,83,69,0.15)] ring-1 ring-[#63836d]/14">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#edf6ef] text-[#3f7658]"><QrCode className="size-7" /></div>
        <p className="mt-4 text-xs font-bold tracking-[0.14em] text-[#b47749]">ENTRANCE QR</p>
        <h1 className="font-serif-jp mt-2 text-2xl font-semibold text-[#315f48]">9月2日 受付入口QR</h1>
        <p className="mt-2 text-sm leading-6 text-[#6f6859]">参加者が最初に読み、お名前を入力します。受付番号が表示されたら、会場の参加QRを読み取ります。</p>
        <div className="mx-auto mt-5 grid aspect-square w-full max-w-[320px] place-items-center rounded-2xl border border-[#6f927c]/20 bg-white p-3">
          {imageUrl ? <Image src={imageUrl} alt="お名前受付を始める入口QRコード" width={360} height={360} unoptimized className="size-full" /> : error ? <p role="alert" className="text-sm font-bold text-[#9b4f43]">{error}</p> : <LoaderCircle className="size-8 animate-spin text-[#3f7658]" />}
        </div>
        <p className="mt-4 rounded-xl bg-[#fff3eb] px-3 py-2 text-xs font-bold leading-5 text-[#8b563f]">この1枚を入口に置きます。受付完了用の参加QRとは別のQRです。</p>
        <button onClick={() => window.print()} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#3f7658] px-5 text-sm font-bold text-white hover:bg-[#35684c] print:hidden"><Printer className="size-4" />印刷する</button>
      </section>
    </main>
  );
}
