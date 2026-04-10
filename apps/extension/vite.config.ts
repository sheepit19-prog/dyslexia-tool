import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  server: {
    port: 5173,
    hmr: {
      port: 5173,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        popup: 'popup/index.html',
        options: 'options/index.html',
        offscreen: 'src/offscreen-html/index.html',
        'mic-permission': 'src/mic-permission/index.html',
      },
    },
  },
})
