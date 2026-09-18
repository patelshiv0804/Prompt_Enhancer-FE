'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import TemplatesHubSkeleton from '@/features/templates/components/TemplatesHubSkeleton';

const TemplatesPage = dynamic(
  () => import('@/features/templates/components/TemplatesPage'),
  {
    loading: () => <TemplatesHubSkeleton />,
    ssr: false,
  }
);

export default function TemplatesRoute() {
  return <TemplatesPage />;
}

