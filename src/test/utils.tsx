import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/theme/theme';

/**
 * next/navigation is mocked here rather than in every test file — AuthProvider
 * calls useRouter() at module init. Tests that need to assert navigation import
 * `routerMock` and read its calls.
 */
export function AllProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
