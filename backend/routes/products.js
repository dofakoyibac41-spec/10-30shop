// ─── Products Router — /api/products ─────────────────────────────────────────
// GET    /api/products          — публичный, список с фильтром и пагинацией
// POST   /api/products          — 🔒 JWT, добавить товар
// DELETE /api/products/bulk     — 🔒 JWT, массовое удаление (ВАЖНО: до /:id)
// DELETE /api/products/:id      — 🔒 JWT, удалить один товар
'use strict';

const express        = require('express');
const db             = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ─── GET /api/products ────────────────────────────────────────────────────────
// Query params: category_id (опционально), limit (default 6), offset (default 0)
// Ответ: { items: [...], total: N }
router.get('/', (req, res) => {
  const limit      = Math.max(1, parseInt(req.query.limit,  10) || 6);
  const offset     = Math.max(0, parseInt(req.query.offset, 10) || 0);
  const categoryId = req.query.category_id ? parseInt(req.query.category_id, 10) : null;

  let itemsSql = 'SELECT * FROM products';
  let countSql = 'SELECT COUNT(*) as total FROM products';
  const params = [];

  if (categoryId !== null && !isNaN(categoryId)) {
    itemsSql += ' WHERE category_id = ?';
    countSql += ' WHERE category_id = ?';
    params.push(categoryId);
  }

  itemsSql += ' ORDER BY id DESC LIMIT ? OFFSET ?';

  const items = db.prepare(itemsSql).all(...params, limit, offset);
  const { total } = db.prepare(countSql).get(...params);

  res.json({ items, total });
});

// ─── POST /api/products ───────────────────────────────────────────────────────
router.post('/', authMiddleware, (req, res) => {
  const { name, description, category_id, image_url } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Поле name обязательно' });
  }
  if (!category_id) {
    return res.status(400).json({ error: 'Поле category_id обязательно' });
  }
  if (!image_url || !image_url.trim()) {
    return res.status(400).json({ error: 'Поле image_url обязательно' });
  }

  // Проверяем что категория существует
  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
  if (!category) {
    return res.status(400).json({ error: `Категория с id=${category_id} не найдена` });
  }

  const stmt = db.prepare(
    `INSERT INTO products (name, description, category_id, image_url)
     VALUES (?, ?, ?, ?)`
  );
  const result = stmt.run(name.trim(), description || null, category_id, image_url.trim());

  const created = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// ─── DELETE /api/products/bulk ────────────────────────────────────────────────
// ⚠️ ОБЯЗАТЕЛЬНО до /:id — иначе Express примет "bulk" за числовой id
// Принимает: { ids: [1, 2, 3] }
// Возвращает: { deleted: N }
router.delete('/bulk', authMiddleware, (req, res) => {
  const { ids } = req.body || {};

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Поле ids должно быть непустым массивом' });
  }

  // Фильтруем только целые числа для защиты от инъекций
  const validIds = ids.filter((id) => Number.isInteger(id) && id > 0);
  if (validIds.length === 0) {
    return res.status(400).json({ error: 'ids должны быть положительными целыми числами' });
  }

  // Строим IN-плейсхолдеры безопасно через параметризацию
  const placeholders = validIds.map(() => '?').join(', ');
  const stmt = db.prepare(`DELETE FROM products WHERE id IN (${placeholders})`);
  const result = stmt.run(...validIds);

  res.json({ deleted: result.changes });
});

// ─── DELETE /api/products/:id ─────────────────────────────────────────────────
router.delete('/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Некорректный id' });
  }

  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  res.status(204).send();
});

module.exports = router;
