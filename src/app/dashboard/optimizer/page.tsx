'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import OptimizerSkeleton from '@/features/optimizer/components/OptimizerSkeleton';

const OptimizerView = dynamic(
  () => import('@/features/optimizer/components/OptimizerView'),
  {
    loading: () => <OptimizerSkeleton />,
    ssr: false,
  }
);

export default function OptimizerPage() {
  return (
    <Suspense fallback={<OptimizerSkeleton />}>
      <OptimizerView />
    </Suspense>
  );
}
