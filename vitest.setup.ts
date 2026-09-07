import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './src/test/msw/server';

// next/navigation has no App Router context under jsdom. Expose a shared router
// mock so components that call useRouter() render, and tests can assert
// navigation via `import { routerMock } from './src/test/router'`.
import { routerMock } from './src/test/router';

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
  usePathname: () => routerMock.__pathname,
  useSearchParams: () => routerMock.__searchParams,
  useParams: () => ({}),
  redirect: (url: string) => routerMock.push(url),
}));

// jsdom ships no matchMedia; provide a non-matching default so ThemeProvider and
// other consumers render. Individual tests override via vi.stubGlobal.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

// Fail loudly on any request the handlers don't explicitly cover, so a test
// can never silently pass against an accidental real network call.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  localStorage.clear();
  routerMock.__reset();
});

afterAll(() => server.close());
