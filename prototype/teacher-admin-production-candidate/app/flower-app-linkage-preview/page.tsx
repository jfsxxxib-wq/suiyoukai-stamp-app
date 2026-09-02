import type { Metadata } from 'next';
import { FlowerAppLinkagePreview } from '@/components/flower-app-linkage-preview';

export const metadata: Metadata = {
  title: '花記録・受付連携試験',
  description: '一度だけ使える連携券で受付番号と花記録の個人番号を結ぶ試験画面です。',
};

export default function FlowerAppLinkagePreviewPage() {
  return <FlowerAppLinkagePreview />;
}
