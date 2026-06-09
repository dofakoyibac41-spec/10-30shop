// ─── 10:30 AM Shop — Database Module ─────────────────────────────────────────
// Инициализация SQLite через better-sqlite3.
// Создаёт/открывает БД и применяет схему таблиц при старте сервера.
// DATABASE-1: Sprint 1 — Фундамент

'use strict';

const path = require('path');
const Database = require('better-sqlite3');

// ─── Путь к файлу БД ─────────────────────────────────────────────────────────
// ./db/shop.db → в контейнере это /app/db/shop.db
// /app/db — named Docker volume 1030shop-db: данные не теряются при перезапуске
const DB_PATH = path.join(__dirname, 'db', 'shop.db');

// ─── Открытие / создание БД ──────────────────────────────────────────────────
const db = new Database(DB_PATH);

// ─── Прагмы производительности и целостности ─────────────────────────────────
// WAL-режим: позволяет читателям не блокировать писателей и наоборот
db.pragma('journal_mode = WAL');
// Включить Foreign Key constraints (по умолчанию SQLite их НЕ проверяет)
db.pragma('foreign_keys = ON');

// ─── Схема таблиц ────────────────────────────────────────────────────────────
// Применяется при каждом старте сервера (IF NOT EXISTS — идемпотентно)

db.exec(`
  -- Таблица категорий товаров
  -- image_url необязателен: если null → фронт показывает тёмный placeholder
  CREATE TABLE IF NOT EXISTS categories (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL,
    image_url TEXT
  );

  -- Таблица товаров
  -- image_url обязателен: URL из облака (Cloudinary и т.д.)
  -- category_id → RESTRICT: нельзя удалить категорию, если в ней есть товары
  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT,
    category_id INTEGER NOT NULL
                        REFERENCES categories(id) ON DELETE RESTRICT,
    image_url   TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Индекс для быстрой фильтрации товаров по категории
  -- GET /api/products?category_id=N — самый частый запрос каталога
  CREATE INDEX IF NOT EXISTS idx_products_category_id
    ON products(category_id);

  -- Индекс для сортировки по дате (ORDER BY id DESC — эквивалент для INTEGER PK)
  -- INTEGER PK уже покрыт rowid index, дополнительного не нужно
`);

// ─── Миграция: добавить колонку price если её ещё нет ────────────────────────
// ALTER TABLE ADD COLUMN падает с ошибкой если колонка уже есть — ловим её.
try {
  db.exec('ALTER TABLE products ADD COLUMN price INTEGER NOT NULL DEFAULT 0');
} catch (_) {
  // Колонка уже существует — пропускаем
}

// ─── Миграция: sort_order для категорий и товаров ─────────────────────────────
try {
  db.exec('ALTER TABLE categories ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0');
} catch (_) {}

try {
  db.exec('ALTER TABLE products ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0');
} catch (_) {}

module.exports = db;
