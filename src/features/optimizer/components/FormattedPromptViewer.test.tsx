import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/theme/theme';
import FormattedPromptViewer from '@/features/optimizer/components/FormattedPromptViewer';

function renderViewer(content: string) {
  return render(
    <ThemeProvider>
      <FormattedPromptViewer content={content} />
    </ThemeProvider>,
  );
}

describe('FormattedPromptViewer', () => {
  it('renders nothing for empty content', () => {
    const { container } = renderViewer('');
    expect(container).toBeEmptyDOMElement();
  });

  it('strips a leading "ENHANCED PROMPT:" marker', () => {
    renderViewer('ENHANCED PROMPT: You are a helpful assistant.');
    expect(screen.getByText(/You are a helpful assistant\./)).toBeInTheDocument();
    expect(screen.queryByText(/ENHANCED PROMPT:/)).not.toBeInTheDocument();
  });

  it('strips **bold** delimiters as a UI safeguard (renders plain text, not <strong>)', () => {
    // The viewer removes `**`/`__` emphasis before inline rendering, so historic
    // un-normalised markdown never shows raw asterisks — the word survives as
    // plain text rather than becoming a <strong>.
    renderViewer('Please be **very** clear.');
    expect(screen.getByText(/Please be very clear\./)).toBeInTheDocument();
    expect(screen.queryByText('very')).not.toBeInTheDocument();
  });

  it('renders `inline code` as a styled <code> element', () => {
    renderViewer('Run `npm test` now.');
    const code = screen.getByText('npm test');
    expect(code.tagName).toBe('CODE');
  });

  it('removes stray single-asterisk emphasis delimiters', () => {
    renderViewer('Write a *concise* summary.');
    // The single-* emphasis is stripped, leaving the bare word.
    expect(screen.getByText(/Write a concise summary\./)).toBeInTheDocument();
  });
});
