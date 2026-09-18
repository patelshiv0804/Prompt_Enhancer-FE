'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import SettingsSkeleton from '../settings/SettingsSkeleton';

const SettingsComponent = dynamic(
  () => import('../settings/SettingsComponent').then((mod) => mod.SettingsComponent),
  {
    loading: () => <SettingsSkeleton activeTab="profile" />,
    ssr: false,
  }
);

export default function ProfilePage() {
  return (
    <Suspense fallback={<SettingsSkeleton activeTab="profile" />}>
      <SettingsComponent initialTab="profile" />
    </Suspense>
  );
}
