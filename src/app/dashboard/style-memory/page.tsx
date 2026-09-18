'use client';

import dynamic from 'next/dynamic';
import StyleMemorySkeleton from '@/features/style-memory/components/StyleMemorySkeleton';

const StyleMemoryView = dynamic(
  () => import('@/features/style-memory/components/StyleMemoryView'),
  {
    loading: () => <StyleMemorySkeleton />,
    ssr: false,
  }
);

export default function StyleMemoryPage() {
  return <StyleMemoryView />;
}
