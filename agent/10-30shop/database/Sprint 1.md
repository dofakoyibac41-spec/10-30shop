# 🗄️ DB Design Report — Sprint 1: Фундамент

**Дата:** 2026-06-05
**Агент:** AGENT_DATABASE
**Модуль:** shop.db — таблицы `categories`, `products`
**Файлы:** `backend/db.js`, `backend/seed.js`
**Статус:** ✅ Реализовано и проверено в контейнере

---

## Схема таблиц

### `categories`

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Авто-инкремент |
| `name` | TEXT | NOT NULL | Название категории |
| `image_url` | TEXT | NULL | URL обложки из облака (опционально) |

**Решение:** `image_url` — nullable, потому что категория должна создаваться без фото. Фронт показывает `#1f2020` placeholder если null.

---

### `products`

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Авто-инкремент |
| `name` | TEXT | NOT NULL | Название товара |
| `description` | TEXT | NULL | Описание (необязательно) |
| `category_id` | INTEGER | NOT NULL, FK → categories(id) RESTRICT | Связь с категорией |
| `image_url` | TEXT | NOT NULL | URL фото из облака (обязательно) |
| `created_at` | TEXT | NOT NULL DEFAULT datetime('now') | Дата добавления |

**Решение по FK:** `ON DELETE RESTRICT` — SQLite запретит удаление категории, если в ней есть товары. Это обеспечивает целостность на уровне БД, а не только в бизнес-логике роутера.

---

## Прагмы SQLite

| Прагма | Значение | Назначение |
|--------|----------|------------|
| `journal_mode` | `WAL` | Write-Ahead Logging: читатели не блокируют писателей |
| `foreign_keys` | `ON` | Проверка FK constraints (по умолчанию OFF в SQLite!) |

> ⚠️ **Критически важно:** без `PRAGMA foreign_keys = ON` SQLite молча игнорирует все REFERENCES. Прагма включена в `db.js` при каждом подключении.

---

## Индексы

| Индекс | Таблица | Поле | Причина |
|--------|---------|------|---------|
| `idx_products_category_id` | products | category_id | `GET /api/products?category_id=N` — самый частый запрос каталога |

**Почему не нужен индекс на `products.id` и `categories.id`:** INTEGER PRIMARY KEY в SQLite автоматически является `rowid` — уже индексирован.

**Почему не нужен индекс на `created_at`:** сортировка идёт по `id DESC` (AUTOINCREMENT = хронологический порядок). Отдельный индекс по тексту не нужен.

---

## Потенциальные проблемы и решения

### 1. Пагинация при большом каталоге
- **Ситуация:** OFFSET становится медленным при тысячах записей
- **Для Sprint 1:** LIMIT/OFFSET достаточно (магазин малого объёма, < 1000 товаров)
- **Будущее:** при необходимости перейти на cursor-based pagination по `id`

### 2. Конкурентные запросы к SQLite
- **Ситуация:** SQLite — файловая БД, при параллельных write может быть блокировка
- **Решение:** WAL-режим снимает большинство проблем для данного сценария
- **Масштаб:** для магазина с одним администратором — никакой проблемы

### 3. Нет `updated_at` в таблицах
- **Решение:** не нужно для MVP — товары не редактируются, только добавляются/удаляются
- **Sprint 4:** при реализации редактирования — добавить `updated_at` через ALTER TABLE

### 4. Хранение `created_at` как TEXT
- **Формат:** `datetime('now')` возвращает `YYYY-MM-DD HH:MM:SS` (UTC)
- **Почему TEXT:** SQLite не имеет нативного DATETIME типа, TEXT — стандарт
- **Для фронта:** строка парсится через `new Date(created_at)`

---

## Seed данные

### Категории (4 шт.)
| ID | Название |
|----|----------|
| 1 | Верхняя одежда |
| 2 | Брюки |
| 3 | Рубашки |
| 4 | Аксессуары |

### Товары (8 шт., по 2 на категорию)
| ID | Название | Категория |
|----|----------|-----------|
| 1 | Пальто оверсайз | Верхняя одежда |
| 2 | Куртка-бомбер | Верхняя одежда |
| 3 | Прямые брюки | Брюки |
| 4 | Широкие брюки-карго | Брюки |
| 5 | Рубашка оверсайз | Рубашки |
| 6 | Рубашка с принтом | Рубашки |
| 7 | Шарф объёмной вязки | Аксессуары |
| 8 | Кепка с козырьком | Аксессуары |

**Image URL:** placeholder-ссылки в цветах дизайн-системы (`#1f2020` / `#e4e2e2`)

---

## Задачи для разработчика (DEV)

| Задача | Файл | Что использовать |
|--------|------|------------------|
| DEV-1 | `backend/server.js` | `require('./db')` — импортировать при старте (таблицы создадутся) |
| DEV-3 | `backend/routes/categories.js` | `db.prepare(...).all()`, `.run()`, `.get()` |
| DEV-4 | `backend/routes/products.js` | Динамический SQL с `category_id` WHERE, `parseInt` для limit/offset |
| DEV-5 | `backend/routes/products.js` | Для `/bulk`: `DELETE FROM products WHERE id IN (${ids.map(() => '?').join(',')})` |

### Важная рекомендация для DEV-5 (bulk delete):
```js
// Правильный способ строить IN-плейсхолдеры для better-sqlite3:
const placeholders = ids.map(() => '?').join(', ');
const stmt = db.prepare(`DELETE FROM products WHERE id IN (${placeholders})`);
stmt.run(...ids);
// Возвращает: stmt.changes — количество удалённых строк
```

### Напоминание для DEV-3 (delete category):
FK `ON DELETE RESTRICT` на уровне БД уже защищает от удаления категории с товарами — `db.run()` выбросит ошибку `FOREIGN KEY constraint failed`. Роутер должен её поймать и вернуть `409 Conflict`.

---

## Верификация (выполнено в контейнере)

```
Tables:  categories, sqlite_sequence, products
Indexes: idx_products_category_id
FK enabled: true
WAL mode: wal

Seed: ✅ 4 категории, 8 товаров
Idempotency: ✅ повторный запуск → "Seed пропущен"
```

---

*Версия: 1.0 | Sprint: 1 | Проект: 10:30 AM Shop*
