import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '水曜会 花記録・対局名簿',
  description: '先生ごとに閲覧範囲を分けた、水曜会の対局名簿です。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
