import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiClient, streamEnhance } from './apiClient';
import { server } from '@/test/server';

const API_URL = 'http://127.0.0.1:8000';

function sseFrame(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

afterEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('apiRequest', () => {
  it('builds absolute URLs with query params and includes credentials', async () => {
    server.use(
      http.get(`${API_URL}/api/v1/templates/`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('role')).toBe('writer');
        expect(request.credentials).toBe('include');
        return HttpResponse.json({ success: true, data: [] });
      }),
    );

    await expect(
      apiClient.get('/api/v1/templates/', { params: { role: 'writer' } }),
    ).resolves.toEqual({ success: true, data: [] });
  });

  it('adds a bearer token from localStorage when present', async () => {
    localStorage.setItem('promptiq_access_token', 'token-123');

    server.use(
      http.get(`${API_URL}/api/v1/profile/me`, ({ request }) => {
        expect(request.headers.get('authorization')).toBe('Bearer token-123');
        return HttpResponse.json({ email: 'test@example.com' });
      }),
    );

    await expect(apiClient.get('/api/v1/profile/me')).resolves.toEqual({
      email: 'test@example.com',
    });
  });

  it('does not force JSON content type for URLSearchParams bodies', async () => {
    server.use(
      http.post(`${API_URL}/api/v1/auth/login`, async ({ request }) => {
        expect(request.headers.get('content-type')).toContain(
          'application/x-www-form-urlencoded',
        );
        expect(await request.text()).toContain('username=user%40example.com');
        return HttpResponse.json({ access_token: 'token' });
      }),
    );

    const body = new URLSearchParams({
      username: 'user@example.com',
      password: 'secret',
    });

    await expect(apiClient.post('/api/v1/auth/login', body)).resolves.toEqual({
      access_token: 'token',
    });
  });

  it('returns null for 204 responses', async () => {
    server.use(
      http.delete(`${API_URL}/api/v1/session`, () => new HttpResponse(null, { status: 204 })),
    );

    await expect(apiClient.delete('/api/v1/session')).resolves.toBeNull();
  });

  it('surfaces backend error detail and status', async () => {
    server.use(
      http.get(`${API_URL}/api/v1/profile/me`, () =>
        HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 }),
      ),
    );

    await expect(apiClient.get('/api/v1/profile/me')).rejects.toMatchObject({
      message: 'Not authenticated',
      status: 401,
    });
  });

  it('dispatches unauthorized events for protected non-auth endpoints', async () => {
    const legacy = vi.fn();
    const current = vi.fn();
    window.addEventListener('aure_unauthorized', legacy);
    window.addEventListener('promptiq:unauthorized', current);

    server.use(
      http.get(`${API_URL}/api/v1/profile/me`, () =>
        HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 }),
      ),
    );

    await expect(apiClient.get('/api/v1/profile/me')).rejects.toThrow(
      'Not authenticated',
    );

    expect(legacy).toHaveBeenCalledTimes(1);
    expect(current).toHaveBeenCalledTimes(1);
    window.removeEventListener('aure_unauthorized', legacy);
    window.removeEventListener('promptiq:unauthorized', current);
  });
});

describe('streamEnhance', () => {
  it('dispatches meta, token, and done frames from a successful stream', async () => {
    server.use(
      http.post(`${API_URL}/api/v1/enhance/stream`, () =>
        HttpResponse.text(
          [
            sseFrame('meta', {
              template: { id: 'tpl-1', title: 'Template', similarity: 1 },
            }),
            sseFrame('token', { text: 'You are' }),
            sseFrame('token', { text: ' ready.' }),
            sseFrame('done', {
              original_prompt: 'raw',
              enhanced_prompt: 'You are ready.',
              version: { prompt_id: 'prompt-1', version_number: 1 },
            }),
          ].join(''),
          { headers: { 'content-type': 'text/event-stream' } },
        ),
      ),
    );

    const onMeta = vi.fn();
    const onToken = vi.fn();
    const onDone = vi.fn();
    const onError = vi.fn();

    await streamEnhance('/api/v1/enhance/stream', { prompt: 'raw' }, {
      onMeta,
      onToken,
      onDone,
      onError,
    });

    expect(onMeta).toHaveBeenCalledWith({
      template: { id: 'tpl-1', title: 'Template', similarity: 1 },
    });
    expect(onToken.mock.calls.map(([text]) => text).join('')).toBe(
      'You are ready.',
    );
    expect(onDone).toHaveBeenCalledWith({
      original_prompt: 'raw',
      enhanced_prompt: 'You are ready.',
      version: { prompt_id: 'prompt-1', version_number: 1 },
    });
    expect(onError).not.toHaveBeenCalled();
  });

  it('routes server error frames to onError once', async () => {
    server.use(
      http.post(`${API_URL}/api/v1/enhance/stream`, () =>
        HttpResponse.text(
          [sseFrame('error', { detail: 'Prompt content cannot be empty.' })].join(''),
          { headers: { 'content-type': 'text/event-stream' } },
        ),
      ),
    );

    const onDone = vi.fn();
    const onError = vi.fn();

    await streamEnhance('/api/v1/enhance/stream', { prompt: '' }, {
      onDone,
      onError,
    });

    expect(onDone).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe(
      'Prompt content cannot be empty.',
    );
  });

  it('sends localStorage bearer auth on streaming requests', async () => {
    localStorage.setItem('token', 'stream-token');

    server.use(
      http.post(`${API_URL}/api/v1/enhance/stream`, ({ request }) => {
        expect(request.headers.get('authorization')).toBe('Bearer stream-token');
        return HttpResponse.text(sseFrame('done', { enhanced_prompt: 'ok' }));
      }),
    );

    const onDone = vi.fn();

    await streamEnhance('/api/v1/enhance/stream', { prompt: 'raw' }, { onDone });

    expect(onDone).toHaveBeenCalledWith({ enhanced_prompt: 'ok' });
  });
});
