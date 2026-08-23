'use client';

import React, { Suspense } from 'react';
import { SettingsComponent } from '../settings/SettingsComponent';

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div style={{ padding: 48, color: '#7C3AED', fontSize: 14, fontWeight: 600 }}>
        Loading Profile...
      </div>
    }>
      <SettingsComponent initialTab="profile" />
    </Suspense>
  );
}
