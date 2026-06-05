// ─── 10:30 AM Shop — Backend Server ──────────────────────────────────────────
// Sprint 1: подключены роутеры, инициализирована БД, рабочий API.
'use strict';

const express = require('express');
const cors    = require('cors');

// Инициализация БД при старте — создаёт таблицы если не существуют
require('./db');

const productsRouter   = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const authRouter       = require('./routes/auth');

const app      = express();
const PORT     = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ─── CORS ─────────────────────────────────────────────────────────────────────
// ALLOWED_ORIGINS читается из .env — в dev: http://localhost:5173
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    project: '10:30 AM Shop',
    version: '0.1.0-sprint1',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routers ──────────────────────────────────────────────────────────────
app.use('/api/auth',       authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products',   productsRouter);

// ─── 404 Catch-all ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
// Перехватывает необработанные ошибки из роутеров (next(err))
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (NODE_ENV !== 'production') console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  if (NODE_ENV !== 'production') {
    console.log(`✅ 1030shop-backend запущен на порту ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Env: ${NODE_ENV} | CORS: ${allowedOrigins.join(', ')}`);
  }
});
