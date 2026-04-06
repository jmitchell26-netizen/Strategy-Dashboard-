// vite.config.js — Vite build tool configuration for this project.
// Vite bundles the React app, serves it in development with fast HMR, and produces
// optimized static assets for production (`npm run build`).
// Docs: https://vite.dev/config/

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'       // Enables JSX, Fast Refresh, and React 19 support
import tailwindcss from '@tailwindcss/vite'     // Tailwind CSS v4 integration (processes @import "tailwindcss" in CSS)

export default defineConfig({
  // Plugins run in order: React transforms .jsx; Tailwind scans class names and generates CSS
  plugins: [react(), tailwindcss()],
})
