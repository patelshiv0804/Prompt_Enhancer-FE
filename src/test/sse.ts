import { HttpResponse } from 'msw';

/**
 * Shared Server-Sent Events helpers for MSW-driven integration tests.
 *
 * `sseResponse` builds a streaming `text/event-stream` response body from a
 * list of already-formatted frames, so a handler can hand the app real SSE
 * bytes to parse — exercising `streamEnhance`'s frame chunking, `event:`
 * dispatch and terminal-frame handling end-to-end (not a mocked callback).
 */

/** Encode one SSE frame: an `event:` line, a JSON `data:` line, blank terminator. */
export function sseFrame(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/** A raw comment/keep-alive line (starts with `:`), ignored by the parser. */
export function sseComment(text = 'keep-alive'): string {
  return `: ${text}\n\n`;
}

/**
 * Build a streaming Response from pre-formatted SSE chunks. Each array entry is
 * enqueued as its own network chunk, so passing a frame split across two
 * entries reproduces the "\n\n split across reads" case the parser must handle.
 */
export function sseResponse(chunks: string[]) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
  return new HttpResponse(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
