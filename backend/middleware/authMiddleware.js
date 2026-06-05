// ─── Auth Middleware ──────────────────────────────────────────────────────────
// Верифицирует JWT из заголовка Authorization: Bearer <token>.
// При успехе: добавляет req.admin = payload и вызывает next().
// При ошибке: возвращает 401.
'use strict';

const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  const token = header.slice(7); // убрать "Bearer "

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    next();
  } catch {
    // TokenExpiredError, JsonWebTokenError и т.д. — все → 401
    return res.status(401).json({ error: 'Токен недействителен или истёк' });
  }
};
