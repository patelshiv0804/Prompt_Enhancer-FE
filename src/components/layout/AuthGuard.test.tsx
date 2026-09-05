import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { routerMock } from '@/test/router';
import AuthGuard from '@/components/layout/AuthGuard';

// Control auth state directly rather than driving the real provider's network
// probe — AuthGuard's contract is purely a function of { isAuthenticated, loading }.
const authState = { isAuthenticated: false, loading: true };
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => authState,
}));

beforeEach(() => {
  authState.isAuthenticated = false;
  authState.loading = true;
});

describe('AuthGuard', () => {
  it('shows the initializing spinner while loading', () => {
    authState.loading = true;
    render(
      <AuthGuard>
        <div>secret</div>
      </AuthGuard>,
    );

    expect(screen.getByText('Initializing session...')).toBeInTheDocument();
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
  });

  it('redirects to /auth once loading resolves unauthenticated, rendering nothing', async () => {
    authState.loading = false;
    authState.isAuthenticated = false;
    render(
      <AuthGuard>
        <div>secret</div>
      </AuthGuard>,
    );

    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith('/auth'));
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
  });

  it('renders children when authenticated and never redirects', async () => {
    authState.loading = false;
    authState.isAuthenticated = true;
    render(
      <AuthGuard>
        <div>secret</div>
      </AuthGuard>,
    );

    expect(screen.getByText('secret')).toBeInTheDocument();
    expect(routerMock.push).not.toHaveBeenCalled();
  });
});
