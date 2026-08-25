'use client';

import React, { Suspense } from 'react';
import { SettingsComponent } from '../settings/SettingsComponent';
import SettingsSkeleton from '../settings/SettingsSkeleton';

export default function ProfilePage() {
  return (
    <Suspense fallback={<SettingsSkeleton activeTab="profile" />}>
      <SettingsComponent initialTab="profile" />
    </Suspense>
  );
}
