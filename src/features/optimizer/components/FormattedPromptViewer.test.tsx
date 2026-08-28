import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import FormattedPromptViewer from './FormattedPromptViewer';
import { ThemeProvider } from '@/theme/theme';

describe('FormattedPromptViewer', () => {
  it('strips raw enhanced-prompt markers and markdown emphasis tokens', () => {
    render(
      <ThemeProvider>
        <FormattedPromptViewer content="ENHANCED PROMPT: **Persona:** Use `code` and _clarity_." />
      </ThemeProvider>,
    );

    expect(screen.queryByText(/enhanced prompt/i)).not.toBeInTheDocument();
    expect(screen.getByText('code')).toBeInTheDocument();
    expect(screen.getByText((_content, element) =>
      element?.tagName.toLowerCase() === 'p' &&
      element.textContent === 'Persona: Use code and clarity.',
    )).toBeInTheDocument();
  });

  it('renders code blocks with copy support', async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);
    render(
      <ThemeProvider>
        <FormattedPromptViewer content={'```ts\nconst value = 1;\n```'} />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: /copy code/i }));

    expect(writeText).toHaveBeenCalledWith('const value = 1;');
    expect(await screen.findByText('Copied')).toBeInTheDocument();
  });

  it('renders headings and numbered steps as readable structured content', () => {
    render(
      <ThemeProvider>
        <FormattedPromptViewer content={'# Plan\n1. Gather context\n2. Write tests'} />
      </ThemeProvider>,
    );

    expect(screen.getByText('Plan')).toBeInTheDocument();
    expect(screen.getByText('Gather context')).toBeInTheDocument();
    expect(screen.getByText('Write tests')).toBeInTheDocument();
  });
});
