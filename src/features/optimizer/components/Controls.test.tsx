import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Controls from './Controls';

describe('Controls', () => {
  it('calls onAnalyze when the primary action is clicked', async () => {
    const user = userEvent.setup();
    const onAnalyze = vi.fn();

    render(<Controls onAnalyze={onAnalyze} isAnalyzing={false} />);

    await user.click(screen.getByRole('button', { name: /analyze & optimize/i }));

    expect(onAnalyze).toHaveBeenCalledTimes(1);
  });

  it('disables the primary action while analyzing', async () => {
    const onAnalyze = vi.fn();

    render(<Controls onAnalyze={onAnalyze} isAnalyzing />);

    expect(screen.getByRole('button', { name: /analyzing/i })).toBeDisabled();
  });

  it('lets the user change the active optimization target', async () => {
    const user = userEvent.setup();

    render(<Controls onAnalyze={vi.fn()} isAnalyzing={false} />);

    const coding = screen.getByRole('button', { name: 'Coding' });
    await user.click(coding);

    expect(coding).toHaveStyle({ transform: 'translateY(-1px)' });
  });
});
