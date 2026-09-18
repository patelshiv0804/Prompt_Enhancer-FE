'use client';

import dynamic from 'next/dynamic';
import VaultSkeleton from '@/features/history/components/VaultSkeleton';

const VaultView = dynamic(
  () => import('@/features/history/components/VaultView'),
  {
    loading: () => <VaultSkeleton />,
    ssr: false,
  }
);

export default function VaultPage() {
  return <VaultView />;
}
