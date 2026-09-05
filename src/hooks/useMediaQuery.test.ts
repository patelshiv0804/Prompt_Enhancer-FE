import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

type Listener = () => void;

/** Install a controllable matchMedia. Returns a fn to flip the match state and
 *  fire the change listener, mirroring a viewport crossing the breakpoint. */
function installMatchMedia(initial: boolean) {
  let matches = initial;
  const listeners = new Set<Listener>();
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return matches;
    },
    media: query,
    addEventListener: (_: string, cb: Listener) => listeners.add(cb),
    removeEventListener: (_: string, cb: Listener) => listeners.delete(cb),
  }));
  return (next: boolean) => {
    matches = next;
    listeners.forEach((cb) => cb());
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useMediaQuery', () => {
  it('resolves to the current match after mount', () => {
    installMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('starts false when the viewport does not match', () => {
    installMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('updates when the media query change listener fires', () => {
    const setMatches = installMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(false);

    act(() => setMatches(true));

    expect(result.current).toBe(true);
  });
});
