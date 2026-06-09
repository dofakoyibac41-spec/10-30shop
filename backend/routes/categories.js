// ─── Categories Router — /api/categories ────────────────────────────────────────────────
// GET    /api/categories        — публичный, список всех категорий
// POST   /api/categories        — 🔒 JWT, создать категорию
// PATCH  /api/categories/:id   — 🔒 JWT, переименовать категорию [РЕК-1 Sprint 1]
// DELETE /api/categories/:id   — 🔒 JWT, удалить (запрет если есть товары)
'use strict';

const express        = require('express');
const db             = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ─── GET /api/categories ──────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, id ASC').all();
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

// ─── PATCH /api/categories/:id ────────────────────────────────────────────────────────────────
// [РЕК-1 из Sprint 1] Переименование без удаления
// Принимает: { name, image_url? }
// Возвращает: обновлённый объект категории
router.patch('/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Некорректный id' });
  }

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!category) {
    return res.status(404).json({ error: 'Категория не найдена' });
  }

  const { name, image_url } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Поле name обязательно' });
  }

  // image_url: если передан — обновляем, если нет — оставляем текущий
  const newImageUrl = image_url !== undefined ? (image_url || null) : category.image_url;

  db.prepare('UPDATE categories SET name = ?, image_url = ? WHERE id = ?')
    .run(name.trim(), newImageUrl, id);

  const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  res.json(updated);
});

// ─── POST /api/categories/reorder ────────────────────────────────────────────────────
// Принимает: [{ id, sort_order }] — обновляет sort_order батчем
router.post('/reorder', authMiddleware, (req, res) => {
  const items = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Ожидается массив [{id, sort_order}]' });
  }
  const stmt = db.prepare('UPDATE categories SET sort_order=? WHERE id=?');
  const updateAll = db.transaction((rows) => {
    for (const row of rows) stmt.run(row.sort_order, row.id);
  });
  updateAll(items);
  res.json({ ok: true });
});

module.exports = router;
