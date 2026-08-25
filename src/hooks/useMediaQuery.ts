'use client';

import { useState, useEffect } from 'react';

/**
 * SSR-safe media-query hook.
 *
 * Initializes to `false` (desktop-first) so the first client render matches the
 * server render — this avoids hydration mismatches. The real match is resolved
 * in an effect after mount, then kept in sync via a change listener.
 *
 * The app is styled with inline styles, which CSS `@media` rules cannot override
 * (inline wins specificity), so responsive layout decisions are driven from JS
 * with this hook.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);

    // Sync immediately in case the viewport already matches on mount.
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export default useMediaQuery;
