import path from "path"
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'prompt', injectRegister: false,
    includeAssets: ['favicon.svg', 'pwa-*.png'],
    manifest: {
      id: '/', name: 'folio. – Markdown to PDF', short_name: 'folio.',
      description: 'Tulis Markdown, lihat pratinjau, dan simpan PDF secara lokal.',
      lang: 'id', start_url: '/', scope: '/', display: 'standalone',
      theme_color: '#4263eb', background_color: '#ffffff',
      icons: [
        { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2,ttf}'],
      navigateFallback: 'index.html', cleanupOutdatedCaches: true,
      clientsClaim: true, skipWaiting: false,
    },
  })],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
})
