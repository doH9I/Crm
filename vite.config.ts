import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Construction CRM',
        short_name: 'CRM',
        description: 'Полноценная CRM система для строительных организаций',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@mui/x-data-grid', '@mui/x-date-pickers', '@mui/x-charts'],
          charts: ['recharts', 'chart.js', 'react-chartjs-2'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query', '@tanstack/react-table'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          utils: ['date-fns', 'axios', 'clsx', 'tailwind-merge'],
          pdf: ['jspdf', 'jspdf-autotable', 'react-pdf'],
          excel: ['xlsx', 'file-saver']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
})