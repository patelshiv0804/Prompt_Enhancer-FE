import { describe, expect, it } from 'vitest';
import { getUserMessage } from '@/utils/errorMessages';

describe('getUserMessage', () => {
  it('returns the fallback for null/undefined', () => {
    expect(getUserMessage(null)).toBe('Something went wrong. Please try again.');
    expect(getUserMessage(undefined, 'custom fallback')).toBe('custom fallback');
  });

  it('rewrites template/similarity misses into actionable guidance', () => {
    const msg = getUserMessage({ detail: 'No templates passed the similarity score threshold' });
    expect(msg).toBe('Try selecting a specific role or mode, or rephrasing your prompt.');
  });

  it.each([
    [401, 'Your session has expired. Please sign in again.'],
    [402, 'Usage limit reached. Please upgrade your plan.'],
    [403, 'You do not have permission to perform this action.'],
    [404, 'The requested item or resource could not be found.'],
    [409, 'An account or resource with this detail already exists.'],
    [422, 'Please check your input details and try again.'],
    [429, 'Too many requests. Please wait a moment and try again.'],
    [500, 'A server error occurred. Please try again later.'],
    [503, 'A server error occurred. Please try again later.'],
  ])('maps status %i to its canned message', (status, expected) => {
    const err = Object.assign(new Error('raw backend text'), { status });
    expect(getUserMessage(err)).toBe(expected);
  });

  it('passes a short, clean 400 detail straight through', () => {
    const err = Object.assign(new Error('Prompt content cannot be empty.'), { status: 400 });
    expect(getUserMessage(err)).toBe('Prompt content cannot be empty.');
  });

  it('hides a noisy 400 detail behind the generic invalid-request message', () => {
    const err = Object.assign(new Error('Unhandled Error: [object Object]'), { status: 400 });
    expect(getUserMessage(err)).toBe('Invalid request. Please check your input and try again.');
  });

  it('returns a clean statusless string as-is', () => {
    expect(getUserMessage('Just a friendly message')).toBe('Just a friendly message');
  });

  it('suppresses leaky internal strings even without a status', () => {
    expect(getUserMessage('Traceback (most recent call last): ...')).toBe(
      'Something went wrong. Please try again.',
    );
    expect(getUserMessage('Failed to fetch')).toBe('Something went wrong. Please try again.');
  });

  it('reads detail/message/error from a plain object in that precedence', () => {
    expect(getUserMessage({ detail: 'from detail', message: 'from message' })).toBe('from detail');
    expect(getUserMessage({ message: 'from message', error: 'from error' })).toBe('from message');
  });
});
