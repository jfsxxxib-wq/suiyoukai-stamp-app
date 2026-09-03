import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '水曜会ポータル｜画面見本',
  description: '水曜会ポータル全体と花記録への入口を確認するための画面見本です。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
