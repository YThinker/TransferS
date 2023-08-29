import { defineConfig } from 'vite';
import { resolve } from "path";
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  base: "./",
  server: {
    port: 3010,
    proxy: {
      '^/api': {
        target: 'http://localhost:3000/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
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
