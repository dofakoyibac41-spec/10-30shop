// ─── Vite Configuration — 10:30 AM Shop ──────────────────────────────────────
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  server: {
    // Обязательно: без host: '0.0.0.0' Vite слушает только localhost
    // внутри контейнера и порт 5173 недоступен с хост-машины
    host: '0.0.0.0',
    port: 5173,

    // Проксирование API запросов на backend контейнер
    // Все запросы /api/* → http://backend:3001/api/*
    proxy: {
      '/api': {
        target: 'http://backend:3001',
        changeOrigin: true,
      },
    },
  },
})
