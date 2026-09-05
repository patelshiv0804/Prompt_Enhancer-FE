import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme/theme';
import ThemeToggle from '@/components/ThemeToggle';

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

describe('ThemeToggle', () => {
  it('defaults to the light-mode affordance (offers to switch to dark)', () => {
    renderToggle();
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
  });

  it('flips the theme (and its label) when clicked', async () => {
    renderToggle();
    const button = screen.getByRole('button', { name: 'Switch to dark mode' });

    await userEvent.click(button);

    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
  });
});
