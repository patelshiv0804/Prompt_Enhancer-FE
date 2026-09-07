import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme/theme';
import ComparisonBlock from '@/features/optimizer/components/ComparisonBlock';

type Props = Partial<React.ComponentProps<typeof ComparisonBlock>>;

function renderBlock(props: Props = {}) {
  const defaults = {
    isAnalyzing: false,
    isAnalyzed: false,
    isOptimizing: false,
    isOptimized: false,
    onAnalyze: vi.fn(),
    onOptimize: vi.fn(),
  };
  const merged = { ...defaults, ...props };
  render(
    <ThemeProvider>
      <ComparisonBlock {...(merged as React.ComponentProps<typeof ComparisonBlock>)} />
    </ThemeProvider>,
  );
  return merged;
}

describe('ComparisonBlock', () => {
  it('seeds the editor from initialOriginalPromptText', () => {
    renderBlock({ initialOriginalPromptText: 'my seeded prompt' });
    expect(screen.getByPlaceholderText('Paste or write below...')).toHaveValue('my seeded prompt');
  });

  it('passes the edited prompt and role to onOptimize', async () => {
    const { onOptimize } = renderBlock({ initialOriginalPromptText: 'start' });
    const textarea = screen.getByPlaceholderText('Paste or write below...');

    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'rewrite this nicely');
    await userEvent.click(screen.getByRole('button', { name: 'Optimize' }));

    expect(onOptimize).toHaveBeenCalledWith('rewrite this nicely', 'general', '', 'auto');
  });

  it('calls onAnalyze with the current prompt text', async () => {
    const { onAnalyze } = renderBlock({ initialOriginalPromptText: 'analyze me' });

    await userEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    expect(onAnalyze).toHaveBeenCalledWith('analyze me');
  });

  it('disables both actions while optimizing', () => {
    renderBlock({ isOptimizing: true });
    expect(screen.getByRole('button', { name: 'Optimizing...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Analyze' })).toBeDisabled();
  });

  it('renders the enhanced prompt once optimized', () => {
    renderBlock({
      isOptimized: true,
      optimizationResult: { enhanced_prompt: 'You are an expert. Do the thing.' },
    });
    expect(screen.getByText(/You are an expert\. Do the thing\./)).toBeInTheDocument();
  });
});
