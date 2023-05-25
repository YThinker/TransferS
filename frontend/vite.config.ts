import { defineConfig } from 'vite';
import { resolve } from "path";
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    manifest: true,
  },
  publicDir: 'public',
  resolve: {
    alias: [{
      find: '@',
      replacement: resolve(__dirname, "src")
    }]
  }
});
