import { describe, expect, it, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '@/test/msw/server';
import { api, TEST_PROFILE } from '@/test/msw/handlers';
import { routerMock } from '@/test/router';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function Harness() {
  const { isAuthenticated, user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="state">{isAuthenticated ? `in:${user?.email}` : 'out'}</span>
      <button onClick={() => login('test@promptiq.test', 'pw').catch(() => {})}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <Harness />
    </AuthProvider>,
  );
}

/** Start every test logged-out: the mount probe returns 401. */
beforeEach(() => {
  server.use(http.get(api('/api/v1/profile/me'), () => HttpResponse.json({ detail: 'no' }, { status: 401 })));
});

describe('AuthContext', () => {
  it('starts unauthenticated when the session probe 401s', async () => {
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('out'));
  });

  it('login persists the token to both localStorage keys and authenticates', async () => {
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('out'));

    let profileServed = false;
    server.use(
      http.post(api('/api/v1/auth/login'), () => HttpResponse.json({ access_token: 'jwt-123' })),
      http.get(api('/api/v1/profile/me'), () => {
        profileServed = true;
        return HttpResponse.json(TEST_PROFILE);
      }),
      http.get(api('/api/v1/styles'), () => HttpResponse.json([])),
    );

    await userEvent.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('in:test@promptiq.test'));
    expect(profileServed).toBe(true);
    expect(localStorage.getItem('token')).toBe('jwt-123');
    expect(localStorage.getItem('promptiq_access_token')).toBe('jwt-123');
    expect(routerMock.replace).toHaveBeenCalledWith('/dashboard/optimizer');
  });

  it('logout clears both token keys and drops the user', async () => {
    localStorage.setItem('token', 'jwt-123');
    localStorage.setItem('promptiq_access_token', 'jwt-123');
    server.use(
      http.get(api('/api/v1/profile/me'), () => HttpResponse.json(TEST_PROFILE)),
      http.get(api('/api/v1/styles'), () => HttpResponse.json([])),
      http.post(api('/api/v1/auth/logout'), () => HttpResponse.json({ ok: true })),
    );
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('in:'));

    await userEvent.click(screen.getByText('logout'));

    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('out'));
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('promptiq_access_token')).toBeNull();
    expect(routerMock.push).toHaveBeenCalledWith('/');
  });

  it('clears auth state on a promptiq:unauthorized event', async () => {
    server.use(
      http.get(api('/api/v1/profile/me'), () => HttpResponse.json(TEST_PROFILE)),
      http.get(api('/api/v1/styles'), () => HttpResponse.json([])),
    );
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('in:'));

    act(() => {
      window.dispatchEvent(new CustomEvent('promptiq:unauthorized', { detail: { path: '/x' } }));
    });

    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('out'));
  });
});
