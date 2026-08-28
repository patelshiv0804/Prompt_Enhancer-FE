import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import ThemeToggle from './ThemeToggle';
import { THEME_STORAGE_KEY, ThemeProvider } from '@/theme/theme';

describe('ThemeToggle', () => {
  it('toggles from light to dark and persists the explicit preference', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const toggle = await screen.findByRole('button', {
      name: 'Switch to dark mode',
    });

    await user.click(toggle);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
    });
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement).toHaveClass('dark');
  });
});
