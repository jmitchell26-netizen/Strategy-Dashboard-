// vite.config.js — Vite build tool configuration for this project.
// Vite bundles the React app, serves it in development with fast HMR, and produces
// optimized static assets for production (`npm run build`).
// Docs: https://vite.dev/config/

import path from "path"
import { fileURLToPath } from "url"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'       // Enables JSX, Fast Refresh, and React 19 support
import tailwindcss from '@tailwindcss/vite'     // Tailwind CSS v4 integration (processes @import "tailwindcss" in CSS)

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  // Plugins run in order: React transforms .jsx; Tailwind scans class names and generates CSS
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Dev-only: browser → same-origin /ollama-proxy → local Ollama (avoids CORS on localhost:11434)
  server: {
    proxy: {
      '/ollama-proxy': {
        target: 'http://127.0.0.1:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama-proxy/, ''),
      },
    },
  },
})
