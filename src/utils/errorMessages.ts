/**
 * Global Frontend Error Message Sanitizer
 * Transforms technical error objects, status codes, and backend traces
 * into safe, production-ready user messages.
 */

export function getUserMessage(
  err: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (!err) return fallback;

  // Extract raw text message if available
  let rawMsg = '';
  let status: number | undefined;

  if (typeof err === 'string') {
    rawMsg = err;
  } else if (err instanceof Error) {
    rawMsg = err.message || '';
    status = (err as any).status;
  } else if (typeof err === 'object') {
    rawMsg = (err as any).detail || (err as any).message || (err as any).error || '';
    status = (err as any).status;
  }

  // 1. Explicit Check for Similarity Threshold / Template No Match
  const lowerMsg = rawMsg.toLowerCase();
  if (
    lowerMsg.includes('similarity score') ||
    lowerMsg.includes('below the threshold') ||
    lowerMsg.includes('no template match') ||
    lowerMsg.includes('no templates passed')
  ) {
    return 'Try selecting a specific role or mode, or rephrasing your prompt.';
  }

  // 2. HTTP Status Code Mapping
  if (status === 400) {
    if (rawMsg && !rawMsg.includes('Object') && !rawMsg.includes('Error') && rawMsg.length < 150) {
      return rawMsg;
    }
    return 'Invalid request. Please check your input and try again.';
  }

  if (status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  if (status === 402) {
    return 'Usage limit reached. Please upgrade your plan.';
  }

  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }

  if (status === 404) {
    return 'The requested item or resource could not be found.';
  }

  if (status === 409) {
    return 'An account or resource with this detail already exists.';
  }

  if (status === 422) {
    return 'Please check your input details and try again.';
  }

  if (status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  if (status && status >= 500) {
    return 'A server error occurred. Please try again later.';
  }

  // 3. Clean string check: If rawMsg is simple, user-friendly, and contains no internal leaks
  if (
    rawMsg &&
    !rawMsg.includes('Fetch API') &&
    !rawMsg.includes('Failed to fetch') &&
    !rawMsg.includes('NetworkError') &&
    !rawMsg.includes('Pydantic') &&
    !rawMsg.includes('SQL') &&
    !rawMsg.includes('Traceback') &&
    !rawMsg.includes('object at 0x') &&
    rawMsg.length < 160
  ) {
    return rawMsg;
  }

  return fallback;
}
