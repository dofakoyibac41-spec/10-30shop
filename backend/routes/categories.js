// ─── Categories Router — /api/categories ─────────────────────────────────────
// GET    /api/categories        — публичный, список всех категорий
// POST   /api/categories        — 🔒 JWT, создать категорию
// DELETE /api/categories/:id    — 🔒 JWT, удалить (запрет если есть товары)
'use strict';

const express        = require('express');
const db             = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ─── GET /api/categories ──────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY id').all();
  res.json(categories);
});

// ─── POST /api/categories ─────────────────────────────────────────────────────
router.post('/', authMiddleware, (req, res) => {
  const { name, image_url } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Поле name обязательно' });
  }

  const stmt = db.prepare(
    'INSERT INTO categories (name, image_url) VALUES (?, ?)'
  );
  const result = stmt.run(name.trim(), image_url || null);

  const created = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// ─── DELETE /api/categories/:id ───────────────────────────────────────────────
router.delete('/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Некорректный id' });
  }

  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(id);
  if (!category) {
    return res.status(404).json({ error: 'Категория не найдена' });
  }

  // Проверка: нельзя удалить категорию если в ней есть товары
  // FK ON DELETE RESTRICT тоже защищает на уровне БД, но даём явное сообщение
  const productCount = db
    .prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ?')
    .get(id);

  if (productCount.count > 0) {
    return res.status(409).json({
      error: 'Нельзя удалить категорию с товарами. Сначала удалите товары.',
    });
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.status(204).send();
});

module.exports = router;
