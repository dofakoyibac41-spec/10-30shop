// ─── 10:30 AM Shop — Backend Server (stub) ───────────────────────────────────
// Минимальный Express-сервер для проверки работоспособности Docker-окружения.
// Sprint 1 заменит этот файл полноценной реализацией API.

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ─── CORS ─────────────────────────────────────────────────────────────────────
// [КР-2] Ограничиваем список разрешённых источников.
// В dev: http://localhost:5173 (Vite dev-server).
// В prod: домен магазина из переменной ALLOWED_ORIGINS.
// ALLOWED_ORIGINS может содержать несколько доменов через запятую.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────────
// Используется для проверки что контейнер поднялся и отвечает на запросы.
// DEVOPS-8: curl http://localhost:3001/api/health → { "status": "ok" }
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    project: '10:30 AM Shop',
    version: '0.1.0-sprint0',
    timestamp: new Date().toISOString(),
  });
});

// ─── Catch-all ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found. API is under construction.' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  // [ВА-1] console.log только в dev — в продакшне используем структурированный логгер
  if (NODE_ENV !== 'production') {
    console.log(`✅ 1030shop-backend запущен на порту ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   Env: ${NODE_ENV}`);
    console.log(`   CORS origins: ${allowedOrigins.join(', ')}`);
  }
});
