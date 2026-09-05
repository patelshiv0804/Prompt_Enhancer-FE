import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScoreSpinner from '@/components/ScoreSpinner';

describe('ScoreSpinner', () => {
  it('renders an accessible status role with a label', () => {
    render(<ScoreSpinner />);
    const svg = screen.getByRole('status');
    expect(svg).toHaveAttribute('aria-label', 'Calculating score');
  });

  it('honours the size prop', () => {
    render(<ScoreSpinner size={32} />);
    const svg = screen.getByRole('status');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });
});
