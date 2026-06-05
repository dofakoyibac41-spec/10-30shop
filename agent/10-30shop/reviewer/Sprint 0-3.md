# 🔍 Review Report v3 — Sprint 0: Проверка исправлений v2

**Дата:** 2026-06-05
**Ревьюер:** AGENT_REVIEWER
**Sprint:** Sprint 0 — Docker-окружение (третье ревью)
**Git:** ✅ `main` → 2 коммита (`c6ef5d8`, `8dcd9fc`)
**Проверено файлов:** 7
**Предыдущий отчёт:** REVIEW_REPORT_v2.md

---

## Общая оценка

Все 3 замечания из v2 проверены по реальному коду и живым тестам. Замечания ВА-4 и РЕ-4 исправлены корректно. Замечание ВА-2' исправлено частично: `nginx.prod.conf` создан, но при введении multi-stage Dockerfile'а **появилась новая критическая регрессия** — dev-окружение сломано. Frontend-контейнер запускает nginx вместо Vite.

**Статус:** 🔴 Есть критическая регрессия. Dev-окружение сломано: frontend не отдаёт Vite-сервер.

---

## ✅ Закрытые замечания v2 (проверено по коду)

| ID | Замечание | Статус | Подтверждение |
|----|-----------|--------|---------------|
| ВА-4 | `ALLOWED_ORIGINS` отсутствовал в `.env.example` | ✅ Закрыто | `.env.example:23–28` — секция `CORS` с `ALLOWED_ORIGINS` добавлена |
| ВА-2' (частично) | `nginx/nginx.prod.conf` не существовал | ✅ Файл создан | `nginx/nginx.prod.conf` — 50 строк, proxy + SPA fallback + cache headers |
| РЕ-4 (частично) | Dockerfile'ы однослойные, `target:` вызывал ошибку | ✅ Stages добавлены | `backend/Dockerfile` — stages `base`, `dev`, `production`; `frontend/Dockerfile` — stages `dev`, `build`, `nginx` |

---

## 🔴 КРИТИЧЕСКАЯ РЕГРЕССИЯ

### [КР-3] `docker-compose.yml` (dev) не указывает `target: dev` — frontend запускает nginx вместо Vite

**Файл:** `docker-compose.yml`, строка 39
**Подтверждение живым тестом:**
- `docker compose logs frontend` → `nginx -g daemon off;` запущен вместо Vite
- `docker inspect 1030shop-frontend` → `CMD: ['nginx', '-g', 'daemon off;']`
- `curl http://localhost:5173` → `HTTP 000` (не может подключиться, nginx слушает :80, не :5173)

**Причина:** Когда `docker-compose.yml` использует `build: ./frontend` **без `target:`**, Docker собирает multi-stage Dockerfile до **последнего** stage — `nginx` (строка 40 `frontend/Dockerfile`). Это стандартное поведение Docker. Разработчик добавил multi-stage build, но не обновил dev-compose.

**Почему критично:** Dev-окружение полностью сломано для frontend — HMR не работает, Vue-приложение не запускается через Vite. `docker compose up` теперь не работает для разработки.

> **Простым языком:**
> **Ситуация:** При введении multi-stage build для решения РЕ-4 разработчик обновил только `docker-compose.prod.yml` (добавил `target: nginx`), но забыл добавить `target: dev` в dev-compose. Docker взял последний stage по умолчанию.
> **Почему важно:** Это главный рабочий инструмент разработки. Без Vite — нет hot-reload, нет HMR, нет разработки.
> **Фикс:** В `docker-compose.yml` заменить `build: ./frontend` на:
> ```yaml
> build:
>   context: ./frontend
>   target: dev
> ```
> То же самое для backend — `build: ./backend` → `target: dev`.

---

## 🟡 ВАЖНЫЕ ПРОБЛЕМЫ

### [ВА-5] `docker-compose.yml` (dev) не указывает `target: dev` для backend — может получить неверный stage

**Файл:** `docker-compose.yml`, строка 16
**Проблема:** `build: ./backend` без `target:`. В `backend/Dockerfile` последний stage — `production` (строка 31). Аналогично frontend: Docker без `target` возьмёт последний stage.

**Текущий статус:** В данный момент backend работает корректно — при проверке `docker compose logs backend` виден nodemon. Это потому что multi-stage build для backend был применён давно и кеш Docker ещё хранит старый image. **При следующем полном `--no-cache` сборке** backend получит stage `production` и запустится через `node server.js` без nodemon — hot-reload сломается.

> **Фикс:** В `docker-compose.yml` заменить `build: ./backend` на:
> ```yaml
> build:
>   context: ./backend
>   target: dev
> ```

---

## 🟢 РЕКОМЕНДАЦИИ

*Новых рекомендаций нет. Замечание РЕ-4 закрыто корректно для prod-compose.*

---

## 📊 Статистика v3

| Категория | v2 (открытых) | v3 (после проверки) |
|-----------|---------------|---------------------|
| 🔴 Критические | 0 | 1 (регрессия КР-3) |
| 🟡 Важные | 2 | 1 (новая ВА-5) |
| 🟢 Рекомендации | 1 | 0 |
| **Закрыто из v2** | — | **3 из 3** |
| **Новых проблем** | — | **2** |
| **Итого открытых** | **3** | **2** |

---

## 📋 Верификация замечаний v2 (построчно)

| Критерий | Файл:строка | Факт |
|----------|-------------|------|
| `ALLOWED_ORIGINS` в `.env.example` | `.env.example:23–27` | ✅ Секция CORS добавлена |
| `nginx/nginx.prod.conf` существует | `nginx/nginx.prod.conf` | ✅ 50 строк, proxy + SPA fallback |
| `backend/Dockerfile` — multi-stage | `backend/Dockerfile:7,18,31` | ✅ Stages: `base`, `dev`, `production` |
| `frontend/Dockerfile` — multi-stage | `frontend/Dockerfile:9,24,40` | ✅ Stages: `dev`, `build`, `nginx` |
| `docker-compose.prod.yml` — `target: production` | `docker-compose.prod.yml:27` | ✅ Корректно |
| `docker-compose.prod.yml` — `target: nginx` | `docker-compose.prod.yml:50` | ✅ Корректно |
| `docker-compose.yml` — frontend `target: dev` | `docker-compose.yml:39` | ❌ Отсутствует [КР-3] |
| `docker-compose.yml` — backend `target: dev` | `docker-compose.yml:16` | ❌ Отсутствует [ВА-5] |
| Frontend Vite запущен (не nginx) | `docker inspect` | ❌ Запущен nginx [КР-3] |

---

## 🛑 Блокеры — исправить немедленно

1. **[КР-3]** Добавить `target: dev` для frontend в `docker-compose.yml` — dev-окружение сломано.
2. **[ВА-5]** Добавить `target: dev` для backend в `docker-compose.yml` — упредить аналогичный сбой при следующей чистой сборке.

Оба фикса — это буквально 4 строки в `docker-compose.yml`. После исправления — пересборка `docker compose up --build` и проверка что frontend отвечает Vite (не nginx).

---

## ✅ Итоговый вердикт по файлам

| Файл | Вердикт |
|------|---------|
| `backend/server.js` | ✅ ПРИНЯТО |
| `backend/Dockerfile` | ✅ ПРИНЯТО (multi-stage корректен) |
| `frontend/Dockerfile` | ✅ ПРИНЯТО (multi-stage корректен) |
| `backend/.env` | ✅ ПРИНЯТО (не в git) |
| `backend/.env.example` | ✅ ПРИНЯТО (ALLOWED_ORIGINS добавлен) |
| `docker-compose.yml` | 🔴 НЕ ПРИНЯТО — нет `target: dev` для frontend и backend |
| `docker-compose.prod.yml` | ✅ ПРИНЯТО |
| `nginx/nginx.prod.conf` | ✅ ПРИНЯТО |
| `.gitignore` | ✅ ПРИНЯТО |
| `README.md` | ✅ ПРИНЯТО |

---

*Версия отчёта: v3 | Ревью: Sprint 0 — проверка исправлений v2 | Проект: 10:30 AM Shop*
*Следующий шаг: исправить [КР-3] и [ВА-5] в docker-compose.yml, затем → Sprint 1*
