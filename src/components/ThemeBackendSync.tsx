'use client';

/**
 * Persists the active theme *preference* to the user's account whenever it
 * changes anywhere in the authenticated app — the navbar/header quick-toggle,
 * the Settings pills, anything that goes through the theme provider.
 *
 * The provider already shares the choice live across every route and mirrors it
 * to localStorage for this device. This closes the last gap by writing it to
 * the backend too, so the account's saved theme is always the user's most
 * recent choice: no page can later fetch a stale value and revert the theme,
 * and the preference follows the user across devices.
 *
 * Mounted once inside the authenticated area (dashboard layout). It waits for
 * the provider to finish syncing from localStorage, records that first resolved
 * preference as its baseline without writing it back, and only PATCHes genuine
 * changes after that — so simply entering the app never re-writes an unchanged
 * theme. Failures are swallowed: the device copy (localStorage) still holds the
 * choice, so a flaky network never disrupts the UI.
 */

import { useEffect, useRef } from 'react';
import { useTheme, type ThemePreference } from '@/theme/theme';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/apiClient';

export default function ThemeBackendSync() {
  const { preference, mounted } = useTheme();
  const { isAuthenticated } = useAuth();
  const lastSynced = useRef<ThemePreference | null>(null);

  useEffect(() => {
    // Wait until the provider has resolved the stored preference; the initial
    // "system" → stored transition is bootstrap, not a user change.
    if (!mounted) return;
    // Record the resolved baseline once, without echoing it back.
    if (lastSynced.current === null) {
      lastSynced.current = preference;
      return;
    }
    if (!isAuthenticated) return;
    if (preference === lastSynced.current) return;
    lastSynced.current = preference;
    apiClient
      .patch('/api/v1/settings/theme', { theme: preference })
      .catch(() => {
        // Non-fatal: localStorage already holds the choice for this device.
      });
  }, [preference, mounted, isAuthenticated]);

  return null;
}
