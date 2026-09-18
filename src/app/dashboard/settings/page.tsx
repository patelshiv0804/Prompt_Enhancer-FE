'use client';

import React, { Suspense } from 'react';
import { SettingsComponent } from './SettingsComponent';
import SettingsSkeleton from './SettingsSkeleton';

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton activeTab="settings" />}>
      <SettingsComponent initialTab="settings" />
    </Suspense>
  );
}
