import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders } from '@/test/utils';
import { server } from '@/test/msw/server';
import { api, TEST_PROFILE } from '@/test/msw/handlers';
import { routerMock } from '@/test/router';
import AuthPage from '@/app/auth/page';

/**
 * Integration: the sign-in form wired to the real AuthContext.login. A
 * successful login must POST credentials as form-urlencoded, persist the token
 * to BOTH localStorage keys, and hand off to the dashboard via router.replace.
 */
describe('Auth sign-in flow', () => {
  async function fillCredentials(email: string, password: string) {
    await userEvent.type(await screen.findByPlaceholderText('name@company.com'), email);
    await userEvent.type(screen.getByPlaceholderText('••••••••'), password);
  }

  async function submit(container: HTMLElement) {
    // The form renders a loading skeleton (no submit button) until AuthContext
    // resolves its session probe. Wait for the enabled button, then click.
    let button: HTMLButtonElement | null = null;
    await waitFor(() => {
      button = container.querySelector('button[type="submit"]');
      expect(button).toBeEnabled();
    });
    await userEvent.click(button!);
  }

  it('logs in and redirects to the dashboard optimizer', async () => {
    let loginBody = '';
    server.use(
      http.post(api('/api/v1/auth/login'), async ({ request }) => {
        loginBody = await request.text();
        return HttpResponse.json({ access_token: 'jwt-abc123' });
      }),
      http.get(api('/api/v1/profile/me'), () => HttpResponse.json(TEST_PROFILE)),
    );

    const { container } = renderWithProviders(<AuthPage />);
    await fillCredentials('test@promptiq.test', 'TestPassword123!');
    await submit(container);

    await waitFor(() => {
      expect(routerMock.replace).toHaveBeenCalledWith('/dashboard/optimizer');
    });
    // OAuth2 password grant is sent form-encoded as username/password.
    expect(loginBody).toContain('username=test%40promptiq.test');
    expect(loginBody).toContain('password=TestPassword123');
    expect(localStorage.getItem('token')).toBe('jwt-abc123');
    expect(localStorage.getItem('promptiq_access_token')).toBe('jwt-abc123');
  });

  it('shows a friendly error and does not redirect on bad credentials', async () => {
    server.use(
      http.post(api('/api/v1/auth/login'), () =>
        HttpResponse.json({ detail: 'Incorrect email or password' }, { status: 401 }),
      ),
    );

    const { container } = renderWithProviders(<AuthPage />);
    await fillCredentials('wrong@promptiq.test', 'nope');
    await submit(container);

    // getUserMessage maps any 401 to this generic copy (the backend detail is
    // intentionally discarded for status-coded errors) — pinned as current UX.
    expect(
      await screen.findByText('Your session has expired. Please sign in again.'),
    ).toBeInTheDocument();
    expect(routerMock.replace).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('does not submit or redirect when the required fields are empty', async () => {
    // Both inputs carry the native `required` attribute, so jsdom's constraint
    // validation blocks form submission before handleSubmit runs — no login
    // request fires and no navigation happens. (The JS-level "Email and
    // password are required." guard is therefore unreachable in a browser.)
    let loginCalled = false;
    server.use(
      http.post(api('/api/v1/auth/login'), () => {
        loginCalled = true;
        return HttpResponse.json({ access_token: 'should-not-happen' });
      }),
    );

    const { container } = renderWithProviders(<AuthPage />);
    await submit(container);

    expect(loginCalled).toBe(false);
    expect(routerMock.replace).not.toHaveBeenCalled();
  });
});
