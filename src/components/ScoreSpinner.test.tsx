import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ScoreSpinner from './ScoreSpinner';

describe('ScoreSpinner', () => {
  it('renders an accessible status indicator with custom size and color', () => {
    render(<ScoreSpinner size={24} color="#123456" />);

    const spinner = screen.getByRole('status', { name: 'Calculating score' });
    expect(spinner).toHaveAttribute('width', '24');
    expect(spinner).toHaveAttribute('height', '24');
    expect(spinner.querySelector('circle')).toHaveAttribute('stroke', '#123456');
    expect(spinner.querySelector('animateTransform')).toHaveAttribute(
      'repeatCount',
      'indefinite',
    );
  });
});
