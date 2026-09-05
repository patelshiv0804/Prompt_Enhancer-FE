import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // The forks pool fails to start workers on this Windows host
    // ("Timeout waiting for worker to respond"); threads is reliable here.
    pool: 'threads',
    // jsdom + SSE ReadableStream parsing + framer-motion under many parallel
    // worker threads on Windows can briefly starve a test past the 5s default,
    // so give slower interactions headroom. Tests still pass in ~1s each in
    // isolation; this only absorbs contention spikes in the full run.
    testTimeout: 15000,
    environment: 'jsdom',
    globals: true,
    // apiClient reads NEXT_PUBLIC_API_URL at module load; pin it so MSW
    // handlers and assertions share one known origin.
    env: {
      NEXT_PUBLIC_API_URL: 'http://localhost:8000',
    },
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/test/**',
        'src/**/*.d.ts',
      ],
    },
  },
});
