'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import SettingsSkeleton from './SettingsSkeleton';

const SettingsComponent = dynamic(
  () => import('./SettingsComponent').then((mod) => mod.SettingsComponent),
  {
    loading: () => <SettingsSkeleton activeTab="settings" />,
    ssr: false,
  }
);

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton activeTab="settings" />}>
      <SettingsComponent initialTab="settings" />
    </Suspense>
  );
}
