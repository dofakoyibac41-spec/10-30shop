// ─── Auth Router — POST /api/auth/login ──────────────────────────────────────
// Принимает { login, password }, сверяет с .env, возвращает JWT.
'use strict';

const express = require('express');
const jwt     = require('jsonwebtoken');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { login, password } = req.body || {};

  // Валидация обязательных полей
  if (!login || !password) {
    return res.status(400).json({ error: 'Поля login и password обязательны' });
  }

  // Сравнение с учётными данными из .env (не хардкод)
  if (
    login    !== process.env.ADMIN_LOGIN    ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ error: 'Неверные учётные данные' });
  }

  // Подписываем JWT на 24 часа
  const token = jwt.sign(
    { role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ token });
});

module.exports = router;
