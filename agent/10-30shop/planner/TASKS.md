# 📋 TASKS — Sprint 0: Docker-окружение

**Дата:** 2026-06-05
**Планировщик:** AGENT_PLANNER
**Фича:** Docker-окружение для разработки (Sprint 0)
**Статус:** 🔄 В работе (DEVOPS ✅ → ожидает TESTER-1, REVIEW-1)

---

## Цель спринта

Создать изолированное Docker-окружение для разработки проекта **10:30 AM Shop**, видимое в Docker Desktop под именем `1030shop`. Оба сервиса (backend + frontend) запускаются одной командой `docker compose up`.

---

## Порядок выполнения

### [DEVOPS-1] Создать `backend/Dockerfile`
**Агент:** DEVOPS
**Зависит от:** —
**Статус:** ⏳ Ожидает

Создать файл `backend/Dockerfile` на базе образа `node:20-alpine`.

Требования:
- Рабочая директория: `/app`
- Копировать `package*.json` → установить зависимости (`npm install`)
- Установить `nodemon` глобально для hot-reload в dev-режиме
- Открыть порт `3001`
- Команда запуска: `npx nodemon server.js` (или через `npm run dev`)
- НЕ копировать весь код в образ — код монтируется через volume

---

### [DEVOPS-2] Создать `frontend/Dockerfile`
**Агент:** DEVOPS
**Зависит от:** —
**Статус:** ⏳ Ожидает

Создать файл `frontend/Dockerfile` на базе образа `node:20-alpine`.

Требования:
- Рабочая директория: `/app`
- Копировать `package*.json` → установить зависимости (`npm install`)
- Открыть порт `5173`
- Команда запуска: `npm run dev -- --host 0.0.0.0` (обязательно `--host` для доступа снаружи контейнера)
- `node_modules` монтируется анонимным volume (чтобы не перезаписывалось с хоста)

---

### [DEVOPS-3] Создать `docker-compose.yml` в корне проекта
**Агент:** DEVOPS
**Зависит от:** DEVOPS-1, DEVOPS-2
**Статус:** ⏳ Ожидает

Создать файл `docker-compose.yml` в корне `10-30shop/`.

Требования:
- Верхний уровень: `name: 1030shop` — изоляция от других проектов в Docker Desktop; все контейнеры получат префикс `1030shop-`
- Сервис `backend`:
  - `container_name: 1030shop-backend`
  - `build: ./backend`
  - `ports: ["3001:3001"]`
  - volumes: `./backend:/app` (code) + `1030shop-db:/app/db` (SQLite data)
  - `env_file: ./backend/.env`
  - `restart: unless-stopped`
- Сервис `frontend`:
  - `container_name: 1030shop-frontend`
  - `build: ./frontend`
  - `ports: ["5173:5173"]`
  - volumes: `./frontend:/app` (code) + `/app/node_modules` (анонимный, изолирует node_modules)
  - `restart: unless-stopped`
- Named volume `1030shop-db` с `name: 1030shop-db` — данные SQLite не теряются при перезапуске

Пример структуры (из PLAN.md):
```yaml
name: 1030shop
services:
  backend:
    container_name: 1030shop-backend
    build: ./backend
    ports: ["3001:3001"]
    volumes:
      - ./backend:/app
      - 1030shop-db:/app/db
    env_file: ./backend/.env
    restart: unless-stopped
  frontend:
    container_name: 1030shop-frontend
    build: ./frontend
    ports: ["5173:5173"]
    volumes:
      - ./frontend:/app
      - /app/node_modules
    restart: unless-stopped
volumes:
  1030shop-db:
    name: 1030shop-db
```

---

### [DEVOPS-4] Создать `backend/.env` с начальными переменными
**Агент:** DEVOPS
**Зависит от:** DEVOPS-3
**Статус:** ⏳ Ожидает

Создать файл `backend/.env` (и `backend/.env.example` для документации) с начальными переменными окружения.

Минимальный состав:
```env
PORT=3001
ADMIN_LOGIN=admin
ADMIN_PASSWORD=secret
JWT_SECRET=change_me_in_production
```

> ⚠️ Добавить `backend/.env` в `.gitignore` в корне проекта.

---

### [DEVOPS-5] Создать `.gitignore` в корне проекта
**Агент:** DEVOPS
**Зависит от:** DEVOPS-4
**Статус:** ⏳ Ожидает

Создать `.gitignore` в корне `10-30shop/` со следующим содержимым:

```
# Dependencies
node_modules/
frontend/node_modules/
backend/node_modules/

# Environment
backend/.env
*.env

# SQLite database
backend/db/shop.db

# Build artifacts
frontend/dist/

# OS
.DS_Store
```

---

### [DEVOPS-6] Создать stub-файлы `server.js` и `package.json` для backend
**Агент:** DEVOPS
**Зависит от:** DEVOPS-1
**Статус:** ⏳ Ожидает

Чтобы Docker мог собрать образ, в `backend/` должен существовать минимальный `package.json` и `server.js`.

Требования:
- `backend/package.json`: name `1030shop-backend`, main `server.js`, скрипт `"dev": "nodemon server.js"`, зависимости: `express`, `better-sqlite3`, `jsonwebtoken`, `cors`; devDependencies: `nodemon`
- `backend/server.js`: минимальный Express-сервер на порту 3001 с ответом `{ status: 'ok' }` на `GET /api/health` — чтобы контейнер поднимался и проверялась связь

---

### [DEVOPS-7] Создать stub-файлы для frontend
**Агент:** DEVOPS
**Зависит от:** DEVOPS-2
**Статус:** ⏳ Ожидает

Чтобы Docker мог собрать образ Vite, в `frontend/` должен существовать минимальный проект.

Требования:
- `frontend/package.json`: name `1030shop-frontend`, скрипты `"dev": "vite"` и `"build": "vite build"`, зависимости: `vue`, devDependencies: `vite`, `@vitejs/plugin-vue`
- `frontend/vite.config.js`: подключить `@vitejs/plugin-vue`, настроить `server.host: '0.0.0.0'` и `server.port: 5173`
- `frontend/index.html`: базовый HTML с точкой монтирования `<div id="app"></div>` и подключением `src/main.js`
- `frontend/src/main.js`: `import { createApp } from 'vue'; import App from './App.vue'; createApp(App).mount('#app')`
- `frontend/src/App.vue`: минимальный компонент с `<template><div>10:30 AM — OK</div></template>`

---

### [DEVOPS-8] Проверить сборку и запуск `docker compose up`
**Агент:** DEVOPS
**Зависит от:** DEVOPS-3, DEVOPS-6, DEVOPS-7
**Статус:** ⏳ Ожидает

Проверить работоспособность окружения:

1. Выполнить `docker compose up --build` в корне проекта
2. Убедиться что оба контейнера (`1030shop-backend` и `1030shop-frontend`) запустились без ошибок
3. Проверить доступность:
   - `http://localhost:5173` → открывается страница Vue (текст «10:30 AM — OK»)
   - `http://localhost:3001/api/health` → JSON `{ "status": "ok" }`
4. Убедиться что оба контейнера видны в Docker Desktop под именем проекта `1030shop`
5. Проверить hot-reload: изменить `App.vue` → страница обновляется без перезапуска контейнера

---

### [TESTER-1] Зафиксировать результат проверки окружения
**Агент:** TESTER
**Зависит от:** DEVOPS-8
**Статус:** ⏳ Ожидает

Провести финальную проверку и зафиксировать результат в `agent/10-30shop/tester/TEST_REPORT_sprint0.md`.

Чек-лист:
- [ ] `docker compose up --build` завершается без ошибок
- [ ] Контейнер `1030shop-backend` запущен, порт `3001` отвечает
- [ ] Контейнер `1030shop-frontend` запущен, порт `5173` отвечает
- [ ] `GET http://localhost:3001/api/health` → `{ "status": "ok" }`
- [ ] `http://localhost:5173` → страница отображается в браузере
- [ ] Docker Desktop показывает проект `1030shop` с двумя контейнерами
- [ ] Named volume `1030shop-db` создан (виден в Docker Desktop → Volumes)
- [ ] Hot-reload frontend работает (изменение `.vue` → мгновенное обновление в браузере)
- [ ] `docker compose down` завершается без ошибок

---

### [REVIEW-1] Ревью Docker-конфигурации
**Агент:** REVIEWER
**Зависит от:** DEVOPS-8, TESTER-1
**Статус:** ⏳ Ожидает

Проверить файлы конфигурации перед переходом к Sprint 1.

Файлы для проверки:
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `docker-compose.yml`
- `backend/.env.example`
- `.gitignore`

Критерии ревью:
- [ ] `name: 1030shop` присутствует в `docker-compose.yml` (изоляция)
- [ ] `backend/.env` НЕ попадает в git (проверить `.gitignore`)
- [ ] `node_modules` НЕ попадает в git и НЕ монтируется с хоста в frontend
- [ ] Named volume `1030shop-db` правильно настроен (данные SQLite сохраняются)
- [ ] `--host 0.0.0.0` присутствует в команде запуска Vite (иначе порт недоступен снаружи контейнера)
- [ ] Нет конфликта портов с другими проектами (3001, 5173 свободны)
- [ ] Написать отчёт `REVIEW_REPORT_sprint0.md` в `agent/10-30shop/reviewer/`

---

## Статусы задач

| ID | Задача | Агент | Статус |
|----|--------|-------|--------|
| DEVOPS-1 | Создать `backend/Dockerfile` | DEVOPS | ✅ |
| DEVOPS-2 | Создать `frontend/Dockerfile` | DEVOPS | ✅ |
| DEVOPS-3 | Создать `docker-compose.yml` | DEVOPS | ✅ |
| DEVOPS-4 | Создать `backend/.env` и `.env.example` | DEVOPS | ✅ |
| DEVOPS-5 | Создать `.gitignore` | DEVOPS | ✅ |
| DEVOPS-6 | Stub-файлы backend (`server.js`, `package.json`) | DEVOPS | ✅ |
| DEVOPS-7 | Stub-файлы frontend (`package.json`, `vite.config.js`, `App.vue`) | DEVOPS | ✅ |
| DEVOPS-8 | Проверить запуск `docker compose up` | DEVOPS | ✅ |
| TESTER-1 | Проверить чек-лист и зафиксировать результат | TESTER | ⏳ |
| REVIEW-1 | Ревью Docker-конфигурации | REVIEWER | ⏳ |

---

## Статусы задач (условные обозначения)

```
⏳ Ожидает    → задача ещё не начата
🔄 В работе   → агент работает над задачей
✅ Готово     → задача выполнена и проверена
🔴 Блокер     → задача заблокирована, нужно решение
```

---

*Создан: 2026-06-05 | Спринт: Sprint 0 — Docker-окружение | Проект: 10:30 AM Shop*
