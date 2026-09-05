import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider, useTheme } from '@/theme/theme';

// Mock the API client and auth so the component runs without a backend.
const { patchMock } = vi.hoisted(() => ({ patchMock: vi.fn() }));
vi.mock('@/utils/apiClient', () => ({ apiClient: { patch: patchMock } }));

const authState = vi.hoisted(() => ({ isAuthenticated: true }));
vi.mock('@/context/AuthContext', () => ({ useAuth: () => authState }));

import ThemeBackendSync from './ThemeBackendSync';

/** Tiny probe that lets a test flip the shared preference like a real toggle. */
function PreferenceProbe() {
  const { setPreference } = useTheme();
  return (
    <button onClick={() => setPreference('dark')}>go-dark</button>
  );
}

function renderSync() {
  return render(
    <ThemeProvider>
      <ThemeBackendSync />
      <PreferenceProbe />
    </ThemeProvider>,
  );
}

describe('ThemeBackendSync', () => {
  beforeEach(() => {
    patchMock.mockReset();
    patchMock.mockResolvedValue(undefined);
    authState.isAuthenticated = true;
    localStorage.clear();
  });

  it('does not persist the bootstrap preference on mount', async () => {
    renderSync();
    // Give the provider's mount sync a tick to settle.
    await screen.findByRole('button', { name: 'go-dark' });
    expect(patchMock).not.toHaveBeenCalled();
  });

  it('persists a theme change made from any page when authenticated', async () => {
    const user = userEvent.setup();
    renderSync();

    await user.click(await screen.findByRole('button', { name: 'go-dark' }));

    await waitFor(() => {
      expect(patchMock).toHaveBeenCalledWith('/api/v1/settings/theme', { theme: 'dark' });
    });
    expect(patchMock).toHaveBeenCalledTimes(1);
  });

  it('does not persist when the user is not authenticated', async () => {
    authState.isAuthenticated = false;
    const user = userEvent.setup();
    renderSync();

    await user.click(await screen.findByRole('button', { name: 'go-dark' }));

    // Let any effect flush, then assert no network write happened.
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });
    expect(patchMock).not.toHaveBeenCalled();
  });
});
