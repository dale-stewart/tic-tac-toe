import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  // GitHub Pages serves this project under the `/tic-tac-toe/` path prefix.
  // Hard-coding the base matches the repo name and keeps the pipeline simple;
  // a test/prod parity regression test (tests/e2e/production-bundle.spec.ts)
  // guards against future drift.
  base: '/tic-tac-toe/',
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      input: 'index.html',
    },
  },
});
