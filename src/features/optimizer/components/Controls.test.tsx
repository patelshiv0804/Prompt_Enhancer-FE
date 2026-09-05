import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Controls from '@/features/optimizer/components/Controls';

describe('Controls', () => {
  it('renders the optimization mode chips', () => {
    render(<Controls onAnalyze={vi.fn()} isAnalyzing={false} />);
    expect(screen.getByRole('button', { name: 'Coding' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'SEO' })).toBeInTheDocument();
  });

  it('calls onAnalyze when the action button is clicked', async () => {
    const onAnalyze = vi.fn();
    render(<Controls onAnalyze={onAnalyze} isAnalyzing={false} />);

    await userEvent.click(screen.getByRole('button', { name: /Analyze & Optimize/ }));

    expect(onAnalyze).toHaveBeenCalledOnce();
  });

  it('disables the action and shows a busy label while analyzing', () => {
    render(<Controls onAnalyze={vi.fn()} isAnalyzing={true} />);
    const button = screen.getByRole('button', { name: 'Analyzing...' });
    expect(button).toBeDisabled();
  });
});
