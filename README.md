# 10:30 AM — Интернет-магазин мужской одежды

Минималистичный интернет-магазин мужской одежды в стиле **Editorial Brutalism**.  
Публичная витрина + простая админка для управления товарами.

---

## Технический стек

| Слой | Технология |
|------|-----------|
| Frontend | Vue.js 3 + Vite |
| Стили | Vanilla CSS (дизайн-токены Stitch) |
| Backend | Node.js + Express |
| База данных | SQLite (better-sqlite3) |
| Контейнеры | Docker + Docker Compose |
| Хостинг | Timeweb VPS |
| Proxy | Nginx |

---

## Быстрый старт (dev-окружение)

### Требования

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) или Docker + Docker Compose v2
- Node.js 20+ (только для локальной разработки без Docker)

### 1. Клонировать репозиторий

```bash
git clone <repo-url>
cd 10-30shop
```

### 2. Настроить переменные окружения

```bash
cp backend/.env.example backend/.env
```

Отредактировать `backend/.env`:
- `ADMIN_PASSWORD` — пароль для входа в `/admin`
- `JWT_SECRET` — случайная строка 64 символа (см. инструкцию ниже)
- `ALLOWED_ORIGINS` — оставить `http://localhost:5173` для dev

Сгенерировать JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Запустить контейнеры

```bash
docker compose up --build
```

Первый запуск занимает ~2 минуты (загрузка образов, установка npm-зависимостей).

### 4. Открыть в браузере

| Сервис | Адрес |
|--------|-------|
| Магазин (frontend) | http://localhost:5173 |
| API health check | http://localhost:3001/api/health |

---

## Переменные окружения

Все переменные описаны в `backend/.env.example`.

| Переменная | Описание | Пример |
|-----------|----------|--------|
| `PORT` | Порт backend | `3001` |
| `ADMIN_LOGIN` | Логин для /admin | `admin` |
| `ADMIN_PASSWORD` | Пароль для /admin | `<strong password>` |
| `JWT_SECRET` | Секрет подписи JWT | `<64 hex chars>` |
| `NODE_ENV` | Режим запуска | `development` |
| `ALLOWED_ORIGINS` | Разрешённые CORS-источники | `http://localhost:5173` |

> ⚠️ Файл `backend/.env` **никогда не коммитится** в git. Он добавлен в `.gitignore`.

---

## Команды Docker

```bash
# Запуск (dev)
docker compose up --build

# Запуск в фоне
docker compose up -d --build

# Остановка
docker compose down

# Логи backend
docker compose logs -f backend

# Логи frontend
docker compose logs -f frontend

# Запуск prod-окружения (Sprint 5)
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Структура проекта

```
10-30shop/
├── backend/           # Node.js + Express API
│   ├── server.js      # точка входа (stub → Sprint 1)
│   ├── package.json
│   ├── Dockerfile
│   ├── .env           # ← не в git
│   └── .env.example   # ← шаблон
├── frontend/          # Vue.js 3 + Vite
│   ├── src/
│   │   ├── App.vue    # главный компонент
│   │   └── main.js    # точка входа
│   ├── index.html
│   ├── vite.config.js
│   └── Dockerfile
├── design-reference/  # макеты Stitch (не входит в сборку)
├── docker-compose.yml      # dev-окружение
├── docker-compose.prod.yml # production (Sprint 5)
├── .gitignore
└── README.md
```

---

## Спринты

| Спринт | Статус | Описание |
|--------|--------|----------|
| Sprint 0 | ✅ Готово | Docker dev-окружение |
| Sprint 1 | ⏳ Следующий | Фундамент: БД, API |
| Sprint 2 | ⏳ | Дизайн-система |
| Sprint 3 | ⏳ | Публичные страницы |
| Sprint 4 | ⏳ | Админка |
| Sprint 5 | ⏳ | Деплой на Timeweb |

---

## API

| Метод | URL | Защита | Описание |
|-------|-----|--------|----------|
| `GET` | `/api/health` | Публичный | Проверка состояния сервера |
| `GET` | `/api/products` | Публичный | Список товаров |
| `POST` | `/api/products` | 🔒 JWT | Добавить товар |
| `DELETE` | `/api/products/:id` | 🔒 JWT | Удалить товар |
| `GET` | `/api/categories` | Публичный | Список категорий |
| `POST` | `/api/auth/login` | Публичный | Получить JWT |

> Полный список endpoints — в [PLAN.md](./PLAN.md).
