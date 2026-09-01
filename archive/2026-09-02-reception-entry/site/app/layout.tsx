import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '水曜会 花記録・受付',
  description: 'お名前の受付、受付番号の発行、参加QRから花記録へ進むための水曜会の玄関です。',
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
