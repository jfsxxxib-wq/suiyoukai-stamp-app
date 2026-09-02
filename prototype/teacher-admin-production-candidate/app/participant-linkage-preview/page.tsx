import type { Metadata } from 'next';
import { ParticipantLinkagePreview } from '@/components/participant-linkage-preview';

export const metadata: Metadata = {
  title: '参加者番号とスタンプ連携・ローカル試験',
  description: '受付番号とアプリ個人番号を安全に紐づけるローカル試験画面です。',
};

export default function ParticipantLinkagePreviewPage() {
  return <ParticipantLinkagePreview />;
}
