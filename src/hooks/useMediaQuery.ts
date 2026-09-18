'use client';

import { useSyncExternalStore, useCallback } from 'react';

/**
 * Helper to determine an intelligent fallback during SSR.
 * Desktop-first min-width queries (e.g. min-width: 1081px) default to true
 * so the initial server markup aligns with desktop views.
 */
function getDefaultServerFallback(query: string, serverFallback?: boolean): boolean {
  if (typeof serverFallback === 'boolean') return serverFallback;
  if (query.includes('min-width') && !query.includes('max-width')) {
    return true;
  }
  return false;
}

/**
 * SSR-safe and hydration-safe media-query hook using React's useSyncExternalStore.
 *
 * On the client, this reads window.matchMedia synchronously during the very first
 * render, eliminating any initial layout flash or skeleton morphing between breakpoints.
 */
export function useMediaQuery(query: string, serverFallback?: boolean): boolean {
  const fallback = getDefaultServerFallback(query, serverFallback);

  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) {
        return () => {};
      }
      const mql = window.matchMedia(query);
      mql.addEventListener('change', callback);
      return () => {
        mql.removeEventListener('change', callback);
      };
    },
    [query]
  );

  const getSnapshot = () => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return fallback;
    }
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => fallback;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default useMediaQuery;

