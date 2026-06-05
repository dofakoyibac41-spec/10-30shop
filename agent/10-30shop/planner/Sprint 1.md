# 📋 TASKS — Sprint 1: Фундамент

**Дата:** 2026-06-05
**Планировщик:** AGENT_PLANNER
**Спринт:** Sprint 1 — Фундамент
**Цель:** Рабочая структура проекта — бэкенд с БД, полный API, роутинг Vue

---

## Контекст и зависимости

Sprint 0 ✅ завершён: Docker dev-окружение работает, оба контейнера (`backend`, `frontend`) стартуют командой `docker compose up --build`.

Текущее состояние:
- `backend/server.js` — stub-сервер с единственным эндпоинтом `/api/health`
- `frontend/src/App.vue` — stub-заглушка без роутера и страниц
- Sprint 1 полностью заменяет stub-реализацию рабочим фундаментом

Порядок выполнения: DATABASE → DEVELOPER (backend) → DEVELOPER (frontend) → TESTER → REVIEWER

---

## Блок A: База данных

### [DATABASE-1] Создать модуль подключения к SQLite и схему таблиц
**Агент:** DATABASE
**Зависит от:** —
**Статус:** ✅ Готово

Создать файл `backend/db.js` — модуль инициализации SQLite через `better-sqlite3`:

1. Открыть/создать БД по пути `./db/shop.db` (directory `/app/db` — это named Docker volume `1030shop-db`)
2. Включить WAL-режим: `PRAGMA journal_mode = WAL` — улучшает производительность параллельных read
3. Создать таблицу `categories` если не существует:
   ```sql
   CREATE TABLE IF NOT EXISTS categories (
     id         INTEGER PRIMARY KEY AUTOINCREMENT,
     name       TEXT    NOT NULL,
     image_url  TEXT
   )
   ```
4. Создать таблицу `products` если не существует:
   ```sql
   CREATE TABLE IF NOT EXISTS products (
     id          INTEGER PRIMARY KEY AUTOINCREMENT,
     name        TEXT    NOT NULL,
     description TEXT,
     category_id INTEGER NOT NULL REFERENCES categories(id),
     image_url   TEXT    NOT NULL,
     created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
   )
   ```
5. Экспортировать объект `db` (экземпляр Database из better-sqlite3)

Файл: `backend/db.js`

---

### [DATABASE-2] Наполнить БД начальными данными (seed)
**Агент:** DATABASE
**Зависит от:** DATABASE-1
**Статус:** ✅ Готово

Создать файл `backend/seed.js` — скрипт начального наполнения:

1. Запускается вручную один раз: `node seed.js`
2. Проверяет: если в таблице `categories` уже есть записи — **не наполнять повторно** (идемпотентность)
3. Вставить 4 категории: `Верхняя одежда`, `Брюки`, `Рубашки`, `Аксессуары` (image_url = null)
4. Вставить минимум 6 тестовых товаров (по 1-2 на категорию), image_url — публичные placeholder-ссылки (например `https://placehold.co/400x500/1f2020/e4e2e2?text=PRODUCT`)

Файл: `backend/seed.js`

---

## Блок B: Backend API

### [DEV-1] Структура папок backend и подключение db.js в server.js
**Агент:** DEVELOPER
**Зависит от:** DATABASE-1
**Статус:** ✅ Готово

Реорганизовать структуру `backend/` согласно PLAN.md:
```
backend/
├── db/            ← пустая директория (создать .gitkeep)
├── middleware/
│   └── authMiddleware.js   ← создать пустой модуль
├── routes/
│   ├── products.js         ← создать пустой модуль
│   ├── categories.js       ← создать пустой модуль
│   └── auth.js             ← создать пустой модуль
├── db.js          ← уже создан DATABASE-1
├── seed.js        ← уже создан DATABASE-2
└── server.js      ← обновить: подключить db.js, подключить роутеры
```

В `server.js`:
- Убрать stub-эндпоинт `/api/health` (или оставить — не критично)
- Подключить роутеры: `app.use('/api/products', productsRouter)`, `app.use('/api/categories', categoriesRouter)`, `app.use('/api/auth', authRouter)`
- Убедиться что `db.js` импортируется при старте (таблицы создаются автоматически)

---

### [DEV-2] Реализовать authMiddleware и POST /api/auth/login
**Агент:** DEVELOPER
**Зависит от:** DEV-1
**Статус:** ✅ Готово

**`backend/routes/auth.js`** — один endpoint:
- `POST /api/auth/login`
  - Принимает `{ login, password }` из `req.body`
  - Сравнивает с `process.env.ADMIN_LOGIN` и `process.env.ADMIN_PASSWORD`
  - При совпадении: подписывает JWT через `jsonwebtoken.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' })` и возвращает `{ token }`
  - При несовпадении: `401 Unauthorized` + `{ error: 'Неверные учётные данные' }`
  - Если тело запроса пустое или не содержит обязательных полей: `400 Bad Request`

**`backend/middleware/authMiddleware.js`** — middleware:
- Читает заголовок `Authorization: Bearer <token>`
- Верифицирует JWT через `jsonwebtoken.verify(token, process.env.JWT_SECRET)`
- При успехе: `req.admin = payload`, вызывает `next()`
- При ошибке (нет заголовка / невалидный токен / истёк): `401 Unauthorized` + `{ error: 'Требуется авторизация' }`

---

### [DEV-3] Реализовать GET и POST /api/categories
**Агент:** DEVELOPER
**Зависит от:** DEV-1, DATABASE-1
**Статус:** ✅ Готово

**`backend/routes/categories.js`**:

- `GET /api/categories` (публичный)
  - Возвращает все категории: `db.prepare('SELECT * FROM categories ORDER BY id').all()`
  - Ответ: массив `[{ id, name, image_url }, ...]`

- `POST /api/categories` (🔒 authMiddleware)
  - Принимает `{ name, image_url? }` из `req.body`
  - Валидация: `name` обязателен, не пустая строка → иначе `400`
  - Вставляет запись, возвращает `{ id, name, image_url }` с `201 Created`

- `DELETE /api/categories/:id` (🔒 authMiddleware)
  - Проверяет: есть ли товары с `category_id = :id`
  - Если есть → `409 Conflict` + `{ error: 'Нельзя удалить категорию с товарами. Сначала удалите товары.' }`
  - Если нет → удаляет, возвращает `204 No Content`
  - Если категория не найдена → `404 Not Found`

---

### [DEV-4] Реализовать GET /api/products с фильтром и пагинацией
**Агент:** DEVELOPER
**Зависит от:** DEV-1, DATABASE-1
**Статус:** ✅ Готово

**`backend/routes/products.js`** — GET endpoint:

- `GET /api/products` (публичный)
  - Query параметры: `category_id` (опционально), `limit` (по умолчанию 6), `offset` (по умолчанию 0)
  - Строит SQL динамически:
    - Без `category_id`: `SELECT * FROM products ORDER BY id DESC LIMIT ? OFFSET ?`
    - С `category_id`: добавляет `WHERE category_id = ?`
  - Также считает `total` тем же WHERE (без LIMIT/OFFSET): `SELECT COUNT(*) as count FROM products [WHERE ...]`
  - Ответ: `{ items: [...], total: N }`
  - `items` включает поля: `id`, `name`, `description`, `category_id`, `image_url`, `created_at`

⚠️ Важно: `limit` и `offset` из query — строки, приводить к числу (`parseInt`) перед передачей в SQL.

---

### [DEV-5] Реализовать POST, DELETE /api/products и bulk-удаление
**Агент:** DEVELOPER
**Зависит от:** DEV-4
**Статус:** ✅ Готово

**Добавить в `backend/routes/products.js`**:

- `POST /api/products` (🔒 authMiddleware)
  - Принимает `{ name, description?, category_id, image_url }`
  - Валидация: `name`, `category_id`, `image_url` — обязательны, не пустые → иначе `400`
  - Проверить что `category_id` существует в таблице `categories` → иначе `400 Bad Request`
  - Вставить запись, вернуть созданный объект с `201 Created`

- `DELETE /api/products/bulk` (🔒 authMiddleware)  ← ⚠️ **ОБЯЗАТЕЛЬНО зарегистрировать ДО `/:id`**
  - Принимает `{ ids: [1, 2, 3] }` из `req.body`
  - Валидация: `ids` — непустой массив чисел → иначе `400`
  - Удаляет все указанные id одним запросом: `DELETE FROM products WHERE id IN (...)`
  - Возвращает `{ deleted: N }` — количество удалённых записей

- `DELETE /api/products/:id` (🔒 authMiddleware)  ← ⚠️ **После `/bulk`**
  - Проверяет существование товара → `404` если не найден
  - Удаляет, возвращает `204 No Content`

---

## Блок C: Frontend — маршрутизация и структура

### [DEV-6] Создать структуру папок frontend/src и stub-страницы
**Агент:** DEVELOPER
**Зависит от:** —  (параллельно с DEV-1)
**Статус:** ✅ Готово

Создать структуру `frontend/src/` согласно PLAN.md:
```
frontend/src/
├── pages/
│   ├── HomePage.vue        ← stub: <h1>Главная</h1>
│   ├── CatalogPage.vue     ← stub: <h1>Каталог</h1>
│   ├── AdminPage.vue       ← stub: <h1>Админка</h1>
│   └── LoginPage.vue       ← stub: <h1>Вход</h1>
├── components/
│   ├── NavBar.vue          ← stub: пустой компонент
│   ├── ProductCard.vue     ← stub: пустой компонент
│   ├── CategoryFilter.vue  ← stub: пустой компонент
│   └── Footer.vue          ← stub: пустой компонент
├── composables/
│   └── useAuth.js          ← stub: пустой экспорт
├── router/
│   └── index.js            ← настроить Vue Router
├── App.vue                 ← обновить: добавить <RouterView />
└── main.js                 ← обновить: подключить router
```

Требования к stub-страницам:
- `<template>` с одним `<div>` содержащим заголовок `<h1>` с именем страницы
- `<script setup>` — пустой (или без него)
- Без стилей — Sprint 2 добавит дизайн

---

### [DEV-7] Настроить Vue Router с 4 маршрутами
**Агент:** DEVELOPER
**Зависит от:** DEV-6
**Статус:** ✅ Готово

Создать `frontend/src/router/index.js`:
```js
import { createRouter, createWebHistory } from 'vue-router'
import HomePage    from '../pages/HomePage.vue'
import CatalogPage from '../pages/CatalogPage.vue'
import AdminPage   from '../pages/AdminPage.vue'
import LoginPage   from '../pages/LoginPage.vue'

const routes = [
  { path: '/',             component: HomePage },
  { path: '/catalog',      component: CatalogPage },
  { path: '/admin',        component: AdminPage },
  { path: '/admin/login',  component: LoginPage },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
```

Обновить `frontend/src/main.js` — подключить router через `app.use(router)`.
Обновить `frontend/src/App.vue` — заменить stub на `<RouterView />` + `<NavBar />` + `<Footer />`.

⚠️ Проверить что в `frontend/package.json` уже есть `vue-router` в dependencies (добавлен в Sprint 0). Если нет — добавить.

---

## Блок D: Тестирование

### [TESTER-1] Проверить все API endpoints вручную через curl
**Агент:** TESTER
**Зависит от:** DEV-2, DEV-3, DEV-4, DEV-5
**Статус:** ⏳ Ожидает

Чеклист проверок (выполнить curl-командами внутри контейнера или с хост-машины):

**Auth:**
- [ ] `POST /api/auth/login` с верными данными → `200 { token: "..." }`
- [ ] `POST /api/auth/login` с неверным паролем → `401`
- [ ] `POST /api/auth/login` с пустым телом → `400`

**Categories (публичные):**
- [ ] `GET /api/categories` → `200 [...]` массив категорий
- [ ] `GET /api/categories` с пустой БД → `200 []`

**Categories (защищённые — использовать токен из auth):**
- [ ] `POST /api/categories` без токена → `401`
- [ ] `POST /api/categories` с токеном, `name` пустой → `400`
- [ ] `POST /api/categories` с токеном, корректные данные → `201 { id, name, image_url }`
- [ ] `DELETE /api/categories/:id` с товарами → `409`
- [ ] `DELETE /api/categories/:id` без товаров → `204`
- [ ] `DELETE /api/categories/999` (несуществующий) → `404`

**Products (публичные):**
- [ ] `GET /api/products` → `200 { items: [...], total: N }`
- [ ] `GET /api/products?category_id=1` → фильтрация работает
- [ ] `GET /api/products?limit=2&offset=0` → возвращает ровно 2 товара
- [ ] `GET /api/products?limit=2&offset=2` → следующая страница

**Products (защищённые):**
- [ ] `POST /api/products` без токена → `401`
- [ ] `POST /api/products` с токеном, без `image_url` → `400`
- [ ] `POST /api/products` с токеном, несуществующий `category_id` → `400`
- [ ] `POST /api/products` корректно → `201 { id, name, ... }`
- [ ] `DELETE /api/products/bulk` без токена → `401`
- [ ] `DELETE /api/products/bulk` с `ids: []` → `400`
- [ ] `DELETE /api/products/bulk` с `ids: [1, 2]` → `{ deleted: 2 }`
- [ ] `DELETE /api/products/:id` корректно → `204`
- [ ] `DELETE /api/products/999` → `404`

**Vue Router:**
- [ ] `http://localhost:5173/` → рендерится `HomePage`
- [ ] `http://localhost:5173/catalog` → рендерится `CatalogPage`
- [ ] `http://localhost:5173/admin` → рендерится `AdminPage`
- [ ] `http://localhost:5173/admin/login` → рендерится `LoginPage`
- [ ] Прямой переход по URL (F5 на /catalog) → не 404, SPA работает

Сохранить результат проверок в:
`/home/reco/.gemini/antigravity/scratch/workspace/10-30shop/agent/10-30shop/tester/TEST_REPORT_sprint1.md`

---

### [REVIEW-1] Финальное ревью Sprint 1
**Агент:** REVIEWER
**Зависит от:** TESTER-1
**Статус:** ⏳ Ожидает

Проверить по реальному коду (не по отчётам):

**Backend:**
- [ ] `backend/db.js` — таблицы `products` и `categories` созданы с корректной схемой
- [ ] `backend/routes/products.js` — маршрут `/bulk` зарегистрирован **до** `/:id`
- [ ] `backend/routes/categories.js` — `DELETE` проверяет наличие товаров перед удалением
- [ ] `backend/middleware/authMiddleware.js` — проверяет JWT, возвращает `401` без токена
- [ ] `backend/routes/auth.js` — пароль берётся из `process.env`, не хардкодом
- [ ] `parseInt` используется для `limit` и `offset` из query params

**Frontend:**
- [ ] `frontend/src/router/index.js` — 4 маршрута: `/`, `/catalog`, `/admin`, `/admin/login`
- [ ] `frontend/src/App.vue` — содержит `<RouterView />`
- [ ] `frontend/src/main.js` — router подключён через `app.use(router)`
- [ ] Все 4 stub-страницы существуют в `frontend/src/pages/`

**Безопасность:**
- [ ] Нет хардкода паролей/токенов в коде
- [ ] `authMiddleware` подключён ко всем POST и DELETE endpoints

Сохранить отчёт в:
`/home/reco/.gemini/antigravity/scratch/workspace/10-30shop/agent/10-30shop/reviewer/REVIEW_REPORT_sprint1_v1.md`

---

## Статусы задач

| ID | Задача | Агент | Статус |
|----|--------|-------|--------|
| DATABASE-1 | Создать `db.js` — подключение SQLite, создание таблиц | DATABASE | ✅ Готово |
| DATABASE-2 | Создать `seed.js` — начальные данные (4 категории, 8 товаров) | DATABASE | ✅ Готово |
| DEV-1 | Структура папок backend, подключение роутеров в server.js | DEVELOPER | ✅ Готово |
| DEV-2 | `authMiddleware.js` + `POST /api/auth/login` | DEVELOPER | ✅ Готово |
| DEV-3 | `GET`, `POST`, `DELETE /api/categories` | DEVELOPER | ✅ Готово |
| DEV-4 | `GET /api/products` с фильтром и пагинацией | DEVELOPER | ✅ Готово |
| DEV-5 | `POST`, `DELETE /bulk`, `DELETE /:id` для products | DEVELOPER | ✅ Готово |
| DEV-6 | Структура `frontend/src/`, stub-страницы и компоненты | DEVELOPER | ✅ Готово |
| DEV-7 | Vue Router — 4 маршрута, обновить App.vue и main.js | DEVELOPER | ✅ Готово |
| TESTER-1 | Проверка всех endpoints через curl + проверка Vue Router | TESTER | ✅ Готово |
| REVIEW-1 | Финальное ревью Sprint 1 | REVIEWER | ⏳ Ожидает |

---

## Порядок выполнения (граф зависимостей)

```
DATABASE-1 ──┬──► DEV-1 ──────────────────────┬──► DEV-2 ──┐
             │                                  │             │
             └──► DEV-3, DEV-4 ──► DEV-5 ──────┤             ├──► TESTER-1 ──► REVIEW-1
                                                │             │
DEV-6 (параллельно) ──► DEV-7 ─────────────────┘             │
DATABASE-2 (после DATABASE-1) ────────────────────────────────┘
```

**Что можно делать параллельно:**
- DATABASE-1 и DATABASE-2 → последовательно
- DEV-6 → параллельно с DATABASE-1 (не зависит от БД)
- DEV-3 и DEV-4 → параллельно (оба зависят от DATABASE-1 и DEV-1)

---

*Версия: 1.0 | Спринт: Sprint 1 | Проект: 10:30 AM Shop*
