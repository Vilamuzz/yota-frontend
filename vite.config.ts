import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    // Only load devtools in development — keeps production bundle lean
    mode !== 'production' && vueDevTools(),
    tailwindcss(),
    visualizer({ open: false, filename: 'stats.html' }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Warn when a single chunk exceeds 600 kB (gzipped threshold)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vue core — cached separately, rarely changes
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          // Data fetching — changes with library updates only
          'vendor-query': ['@tanstack/vue-query', 'axios'],
          // Charts — heavy (~1 MB), only used in dashboard
          'vendor-charts': ['echarts', 'vue-echarts'],
          // Icons — large icon set, static
          'vendor-icons': ['lucide-vue-next'],
          // Animation — small but separate for caching
          'vendor-motion': ['motion-v'],
        },
      },
    },
  },
}))

