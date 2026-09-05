import { vi } from 'vitest';

/**
 * Shared next/navigation router double. `push`/`replace` are spies tests can
 * assert on; `__pathname` drives usePathname() and can be set per-test to
 * simulate being on a dashboard vs. public route. `__searchParams` drives
 * useSearchParams() — set it per-test (e.g. `routerMock.__setSearchParams('prompt_id=x')`)
 * to render a page as if it were opened with those query params.
 */
export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  __pathname: '/',
  __searchParams: new URLSearchParams(),
  __setSearchParams(init: string | Record<string, string>) {
    this.__searchParams = new URLSearchParams(init);
  },
  __reset() {
    this.push.mockReset();
    this.replace.mockReset();
    this.prefetch.mockReset();
    this.back.mockReset();
    this.forward.mockReset();
    this.refresh.mockReset();
    this.__pathname = '/';
    this.__searchParams = new URLSearchParams();
  },
};
