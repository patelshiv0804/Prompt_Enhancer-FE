import { afterEach, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { api } from '@/test/msw/handlers';
import { apiClient, streamEnhance } from '@/utils/apiClient';

/** Build an SSE ReadableStream from raw chunks; chunk boundaries are preserved
 *  so tests can split a single frame across two reads. */
function sseStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const c of chunks) controller.enqueue(encoder.encode(c));
      controller.close();
    },
  });
}

function sseResponse(chunks: string[]) {
  return new HttpResponse(sseStream(chunks), {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

// ── window.location control (jsdom pathname + href capture) ──────────────────
let hrefSetTo: string | null;
const realLocation = window.location;

function setLocation(pathname: string) {
  hrefSetTo = null;
  // jsdom location is configurable when deleted
  delete (window as any).location;
  (window as any).location = {
    pathname,
    get href() {
      return hrefSetTo ?? '';
    },
    set href(v: string) {
      hrefSetTo = v;
    },
  };
}

afterEach(() => {
  // restore the real jsdom location
  delete (window as any).location;
  (window as any).location = realLocation;
});

describe('apiRequest', () => {
  it('returns parsed JSON for a 200 and hits the absolute API origin', async () => {
    server.use(
      http.get(api('/api/v1/ping'), () => HttpResponse.json({ ok: true, from: 'origin' })),
    );

    const body = await apiClient.get('/api/v1/ping');

    expect(body).toEqual({ ok: true, from: 'origin' });
  });

  it('appends query params to the URL', async () => {
    let seen = '';
    server.use(
      http.get(api('/api/v1/prompts/'), ({ request }) => {
        seen = new URL(request.url).search;
        return HttpResponse.json({ data: [] });
      }),
    );

    await apiClient.get('/api/v1/prompts/', { params: { page: '2', page_size: '8' } });

    expect(seen).toBe('?page=2&page_size=8');
  });

  it('sends the localStorage "token" as a Bearer header', async () => {
    localStorage.setItem('token', 'tok-primary');
    let auth: string | null = null;
    server.use(
      http.get(api('/api/v1/profile/me'), ({ request }) => {
        auth = request.headers.get('authorization');
        return HttpResponse.json({ id: 'x' });
      }),
    );

    await apiClient.get('/api/v1/profile/me');

    expect(auth).toBe('Bearer tok-primary');
  });

  it('falls back to promptiq_access_token when "token" is absent', async () => {
    localStorage.setItem('promptiq_access_token', 'tok-fallback');
    let auth: string | null = null;
    server.use(
      http.get(api('/api/v1/profile/me'), ({ request }) => {
        auth = request.headers.get('authorization');
        return HttpResponse.json({ id: 'x' });
      }),
    );

    await apiClient.get('/api/v1/profile/me');

    expect(auth).toBe('Bearer tok-fallback');
  });
});

describe('apiRequest content-type handling', () => {
  it('sets application/json for a plain object POST body', async () => {
    let ct: string | null = null;
    server.use(
      http.post(api('/api/v1/x'), ({ request }) => {
        ct = request.headers.get('content-type');
        return HttpResponse.json({});
      }),
    );

    await apiClient.post('/api/v1/x', { a: 1 });

    expect(ct).toBe('application/json');
  });

  it('omits Content-Type for URLSearchParams so the browser sets it', async () => {
    let ct: string | null = 'sentinel';
    server.use(
      http.post(api('/api/v1/auth/login'), ({ request }) => {
        ct = request.headers.get('content-type');
        return HttpResponse.json({ access_token: 't' });
      }),
    );

    const form = new URLSearchParams();
    form.append('username', 'u');
    await apiClient.post('/api/v1/auth/login', form);

    // fetch defaults URLSearchParams bodies to application/x-www-form-urlencoded;
    // the key property is that apiClient did NOT force application/json.
    expect(ct).not.toBe('application/json');
  });

  it('omits Content-Type for FormData bodies', async () => {
    let ct: string | null = null;
    server.use(
      http.post(api('/api/v1/upload'), ({ request }) => {
        ct = request.headers.get('content-type');
        return HttpResponse.json({});
      }),
    );

    const fd = new FormData();
    fd.append('f', 'v');
    await apiClient.post('/api/v1/upload', fd);

    expect(ct).not.toBe('application/json');
  });

  it('returns null for a 204 No Content', async () => {
    server.use(
      http.delete(api('/api/v1/prompts/abc'), () => new HttpResponse(null, { status: 204 })),
    );

    const result = await apiClient.delete('/api/v1/prompts/abc');

    expect(result).toBeNull();
  });
});

describe('apiRequest error handling', () => {
  it('throws an Error carrying the JSON detail and the numeric status', async () => {
    server.use(
      http.get(api('/api/v1/boom'), () =>
        HttpResponse.json({ detail: 'nope' }, { status: 422 }),
      ),
    );

    await expect(apiClient.get('/api/v1/boom')).rejects.toMatchObject({
      message: 'nope',
      status: 422,
    });
  });

  it('stringifies a non-string detail (e.g. pydantic error array)', async () => {
    server.use(
      http.get(api('/api/v1/boom'), () =>
        HttpResponse.json({ detail: [{ loc: ['body'], msg: 'bad' }] }, { status: 422 }),
      ),
    );

    const err = await apiClient.get('/api/v1/boom').catch((e) => e);

    expect(err.status).toBe(422);
    expect(err.message).toContain('bad');
  });

  it('on a 401 from a dashboard route: dispatches both events AND redirects to /auth', async () => {
    setLocation('/dashboard/optimizer');
    const events: string[] = [];
    const onAure = () => events.push('aure_unauthorized');
    const onPromptiq = () => events.push('promptiq:unauthorized');
    window.addEventListener('aure_unauthorized', onAure);
    window.addEventListener('promptiq:unauthorized', onPromptiq);

    server.use(
      http.get(api('/api/v1/prompts/'), () =>
        HttpResponse.json({ detail: 'unauth' }, { status: 401 }),
      ),
    );

    await apiClient.get('/api/v1/prompts/').catch(() => {});

    window.removeEventListener('aure_unauthorized', onAure);
    window.removeEventListener('promptiq:unauthorized', onPromptiq);
    expect(events).toEqual(['aure_unauthorized', 'promptiq:unauthorized']);
    expect(hrefSetTo).toBe('/auth');
  });

  it('on a 401 from a PUBLIC route: dispatches events but does NOT redirect', async () => {
    setLocation('/');
    const seen: string[] = [];
    const onPromptiq = () => seen.push('promptiq:unauthorized');
    window.addEventListener('promptiq:unauthorized', onPromptiq);

    server.use(
      http.get(api('/api/v1/profile/me'), () =>
        HttpResponse.json({ detail: 'unauth' }, { status: 401 }),
      ),
    );

    await apiClient.get('/api/v1/profile/me').catch(() => {});

    window.removeEventListener('promptiq:unauthorized', onPromptiq);
    expect(seen).toEqual(['promptiq:unauthorized']);
    expect(hrefSetTo).toBeNull();
  });

  it('on a 401 from an auth endpoint: does NOT dispatch or redirect', async () => {
    setLocation('/dashboard/optimizer');
    let dispatched = false;
    const onPromptiq = () => {
      dispatched = true;
    };
    window.addEventListener('promptiq:unauthorized', onPromptiq);

    server.use(
      http.post(api('/api/v1/auth/login'), () =>
        HttpResponse.json({ detail: 'bad creds' }, { status: 401 }),
      ),
    );

    await apiClient.post('/api/v1/auth/login', { x: 1 }).catch(() => {});

    window.removeEventListener('promptiq:unauthorized', onPromptiq);
    expect(dispatched).toBe(false);
    expect(hrefSetTo).toBeNull();
  });
});

const STREAM = '/api/v1/enhance/stream';

describe('streamEnhance', () => {
  it('dispatches meta → token(s) → done in order and parses each frame', async () => {
    server.use(
      http.post(api(STREAM), () =>
        sseResponse([
          'event: meta\ndata: {"detected_level": "standard"}\n\n',
          'event: token\ndata: {"text": "Hello "}\n\n',
          'event: token\ndata: {"text": "world"}\n\n',
          'event: done\ndata: {"original_prompt": "p", "enhanced_prompt": "Hello world"}\n\n',
        ]),
      ),
    );

    const calls: string[] = [];
    const tokens: string[] = [];
    let done: any = null;
    await streamEnhance(STREAM, { prompt: 'p' }, {
      onMeta: (m) => calls.push(`meta:${m.detected_level}`),
      onToken: (t) => {
        calls.push('token');
        tokens.push(t);
      },
      onDone: (d) => {
        calls.push('done');
        done = d;
      },
      onError: () => calls.push('error'),
    });

    expect(calls).toEqual(['meta:standard', 'token', 'token', 'done']);
    expect(tokens.join('')).toBe('Hello world');
    expect(done.enhanced_prompt).toBe('Hello world');
  });

  it('reassembles a frame that is split across two network reads', async () => {
    server.use(
      http.post(api(STREAM), () =>
        sseResponse([
          'event: token\ndata: {"text": "Hel',
          'lo"}\n\nevent: done\ndata: {"original_prompt":"p","enhanced_prompt":"Hello"}\n\n',
        ]),
      ),
    );

    const tokens: string[] = [];
    let done: any = null;
    await streamEnhance(STREAM, { prompt: 'p' }, {
      onToken: (t) => tokens.push(t),
      onDone: (d) => {
        done = d;
      },
    });

    expect(tokens).toEqual(['Hello']);
    expect(done.enhanced_prompt).toBe('Hello');
  });

  it('flushes a trailing frame that is not terminated by a blank line', async () => {
    server.use(
      http.post(api(STREAM), () =>
        // No trailing \n\n on the done frame — must still be flushed at stream end.
        sseResponse(['event: done\ndata: {"original_prompt":"p","enhanced_prompt":"x"}']),
      ),
    );

    let done: any = null;
    await streamEnhance(STREAM, { prompt: 'p' }, { onDone: (d) => (done = d) });

    expect(done.enhanced_prompt).toBe('x');
  });
});

describe('streamEnhance failure paths', () => {
  it('routes a server "error" frame to onError and never fires onDone', async () => {
    server.use(
      http.post(api(STREAM), () =>
        sseResponse(['event: error\ndata: {"detail": "Prompt content cannot be empty."}\n\n']),
      ),
    );

    let doneFired = false;
    let error: Error | null = null;
    await streamEnhance(STREAM, { prompt: '' }, {
      onDone: () => {
        doneFired = true;
      },
      onError: (e) => {
        error = e;
      },
    });

    expect(doneFired).toBe(false);
    expect((error as Error | null)?.message).toBe('Prompt content cannot be empty.');
  });

  it('the settled guard prevents onError after a done frame', async () => {
    server.use(
      http.post(api(STREAM), () =>
        sseResponse([
          'event: done\ndata: {"original_prompt":"p","enhanced_prompt":"ok"}\n\n',
          'event: error\ndata: {"detail": "late failure"}\n\n',
        ]),
      ),
    );

    const calls: string[] = [];
    await streamEnhance(STREAM, { prompt: 'p' }, {
      onDone: () => calls.push('done'),
      onError: () => calls.push('error'),
    });

    expect(calls).toEqual(['done']);
  });

  it('surfaces a non-2xx pre-stream response as an onError with status + detail', async () => {
    server.use(
      http.post(api(STREAM), () =>
        HttpResponse.json({ detail: 'Requested resource or matching template was not found.' }, { status: 404 }),
      ),
    );

    let error: any = null;
    await streamEnhance(STREAM, { prompt: 'p' }, { onError: (e) => (error = e) });

    expect(error.status).toBe(404);
    expect(error.message).toBe('Requested resource or matching template was not found.');
  });

  it('swallows an aborted request: neither onDone nor onError fires', async () => {
    server.use(
      http.post(api(STREAM), () =>
        sseResponse(['event: token\ndata: {"text": "hi"}\n\n']),
      ),
    );

    const controller = new AbortController();
    controller.abort();
    const calls: string[] = [];
    await streamEnhance(STREAM, { prompt: 'p' }, {
      signal: controller.signal,
      onDone: () => calls.push('done'),
      onError: () => calls.push('error'),
    });

    expect(calls).toEqual([]);
  });

  it('sends the Bearer token alongside the cookie credentials', async () => {
    localStorage.setItem('token', 'stream-tok');
    let auth: string | null = null;
    server.use(
      http.post(api(STREAM), ({ request }) => {
        auth = request.headers.get('authorization');
        return sseResponse(['event: done\ndata: {"original_prompt":"p","enhanced_prompt":"x"}\n\n']);
      }),
    );

    await streamEnhance(STREAM, { prompt: 'p' }, {});

    expect(auth).toBe('Bearer stream-tok');
  });
});
