import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt': el SW no se actualiza solo — el usuario confirma.
      // Más seguro que 'autoUpdate': evita recargas durante operaciones
      // críticas (registro de pago, edición de turno, etc.).
      registerType: 'prompt',

      includeAssets: ['icons/*.svg'],

      manifest: {
        name: 'BarberPRO',
        short_name: 'BarberPRO',
        description: 'Gestión de turnos, clientes e ingresos para tu barbería',
        theme_color: '#f59e0b',
        background_color: '#0f1115',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
          {
            // Maskable: fondo full-bleed amber, contenido dentro del safe zone 80%
            src: 'icons/icon-maskable.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        // Precachea solo assets estáticos versionados (con hash en el nombre)
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],

        // El SW sirve el shell de la SPA para navegación, EXCEPTO:
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [
          /^\/api\//,   // API backend → siempre red
          /^\/__\//,    // Rutas internas Firebase (auth redirect, etc.)
        ],

        // Runtime caching: SOLO recursos estáticos de terceros sin datos de usuario.
        // Firebase Auth, Firestore y el backend quedan en NetworkOnly por defecto
        // → sin riesgo de cachear tokens ni datos sensibles.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-css',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],

        // Background Sync deliberadamente deshabilitado:
        // podría reintentar silenciosamente requests de pago o escritura
        // sin que el usuario lo sepa.
      },
    }),
  ],

  resolve: {
    alias: { '@': '/src' },
  },
})
