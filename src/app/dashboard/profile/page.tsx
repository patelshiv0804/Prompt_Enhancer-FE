'use client';

import React, { Suspense } from 'react';
import SettingsPage from '../settings/page';

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div style={{ padding: 48, color: '#7C3AED', fontSize: 14, fontWeight: 600 }}>
        Loading Profile...
      </div>
    }>
      <SettingsPage initialTab="profile" />
    </Suspense>
  );
}
