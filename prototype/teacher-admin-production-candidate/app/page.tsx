import Link from 'next/link';
import { Flower2, LockKeyhole, Settings } from 'lucide-react';

export default function Home() {
  return (
    <main className="roster-shell grid min-h-svh place-items-center px-4 py-8">
      <section className="w-full max-w-[460px] rounded-[28px] border border-[#d6dfd8] bg-[#fffdf7] p-7 text-center shadow-xl">
        <Flower2 className="mx-auto size-12 text-[#c67971]" />
        <p className="mt-4 text-xs font-bold tracking-[0.15em] text-[#a47542]">水曜会 花記録</p>
        <h1 className="font-serif-jp mt-2 text-3xl text-[#315f47]">対局名簿の入口</h1>
        <p className="mt-3 text-sm leading-7 text-[#6d736d]">入口ごとに権限を確認します。先生には、ご自身が担当する対局だけを表示します。</p>
        <div className="mt-7 grid gap-3">
          <Link href="/teacher" className="entry-link"><LockKeyhole />先生専用ページ</Link>
          <Link href="/admin" className="entry-link secondary"><Settings />管理者用の対局名簿</Link>
        </div>
      </section>
    </main>
  );
}
