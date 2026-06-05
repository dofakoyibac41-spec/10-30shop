# 🔍 Review Report v2 — Sprint 0: Проверка исправлений

**Дата:** 2026-06-05
**Ревьюер:** AGENT_REVIEWER
**Sprint:** Sprint 0 — Docker-окружение (повторное ревью)
**Git:** ✅ `main` → коммит `c6ef5d8` (chore: Sprint 0 — Docker dev environment)
**Проверено файлов:** 10
**Предыдущий отчёт:** REVIEW_REPORT_v1.md

---

## Общая оценка

Все 8 замечаний из v1 проверены по реальному коду. **6 из 8 исправлены полностью и корректно.** 2 замечания закрыты частично — появились новые дочерние проблемы при исправлении. Найдено 2 новых замечания. Контейнеры работают, git инициализирован, `.env` не попал в репозиторий.

**Статус:** 🟡 Требует минорной доработки (3 замечания, ни одно не блокирует dev-среду)

---

## ✅ Закрытые замечания v1 (проверено по коду)

| ID | Замечание | Статус | Подтверждение |
|----|-----------|--------|---------------|
| КР-1 | Слабый пароль и JWT_SECRET в `.env` | ✅ Закрыто | `JWT_SECRET=0ef5fc4f...` (64 hex символа), пароль `Dev#1030!Local` |
| КР-2 | Открытый CORS без ограничений | ✅ Закрыто | `cors({ origin: allowedOrigins, credentials: true })`, live-тест: evil.com не получил `Allow-Origin` |
| ВА-1 | `console.log` в продакшн-коде | ✅ Закрыто | `server.js:45` — блок `if (NODE_ENV !== 'production')` |
| ВА-3 | Git не инициализирован | ✅ Закрыто | `git log` показывает коммит `c6ef5d8`, ветка `main`, `.env` не в индексе |
| РЕ-1 | `npx nodemon` вместо `npm run dev` | ✅ Закрыто | `Dockerfile:19` — `CMD ["npm", "run", "dev"]` |
| РЕ-2 | Нет volume для `backend/node_modules` | ✅ Закрыто | `docker-compose.yml:26` — `- /app/node_modules` добавлен |
| РЕ-3 | Нет `README.md` | ✅ Закрыто | Создан `README.md` с инструкцией запуска, переменными, структурой, API |

---

## 🔴 КРИТИЧЕСКИЕ ПРОБЛЕМЫ

*Нет новых критических проблем.*

---

## 🟡 ВАЖНЫЕ ПРОБЛЕМЫ

### [ВА-2'] `docker-compose.prod.yml` создан, но ссылается на несуществующий файл Nginx

**Файл:** `docker-compose.prod.yml`, строка 54
**Проблема:** Prod-compose монтирует `./nginx/nginx.prod.conf:/etc/nginx/conf.d/default.conf:ro`, но директория `nginx/` и файл `nginx.prod.conf` в проекте **не существуют** (проверено через `find`). При запуске `docker compose -f docker-compose.prod.yml up` nginx-контейнер упадёт с ошибкой монтирования.
**Почему важно:** ВА-2 закрыт номинально — файл создан, но не работоспособен. При деплое в Sprint 5 это создаст блокер если не исправить заранее. Также prod-compose ссылается на `target: production` и `target: nginx` в multi-stage build, но `backend/Dockerfile` и `frontend/Dockerfile` — однослойные, без `target`.
**Задача для разработчика (DEVOPS):** Создать директорию `nginx/` и файл `nginx/nginx.prod.conf` с минимальной конфигурацией: отдавать статику frontend и проксировать `/api` на backend. Этот файл можно создать в Sprint 5, но нужно снять ссылку на `target:` — в текущих Dockerfile нет stage'ей.

---

### [ВА-4] `backend/.env.example` не синхронизирован — отсутствует переменная `ALLOWED_ORIGINS`

**Файл:** `backend/.env.example`, строки 1–22
**Проблема:** После исправления КР-2 в `server.js` появилась новая переменная окружения `ALLOWED_ORIGINS`. Она добавлена в `backend/.env` (строка 26), но **отсутствует** в `backend/.env.example`. Разработчик, создающий `.env` по шаблону `cp .env.example .env`, не получит эту переменную и CORS будет работать только через hardcoded fallback `['http://localhost:5173']` без возможности конфигурации.
**Почему важно:** `.env.example` — единственный источник истины о переменных окружения. Несинхронизированный шаблон ломает onboarding новых разработчиков и деплой.
**Задача для разработчика:** Добавить секцию `ALLOWED_ORIGINS` в `backend/.env.example` с документацией — аналогично тому как она описана в `backend/.env`.

---

## 🟢 РЕКОМЕНДАЦИИ

### [РЕ-4] Prod-compose содержит `target:` для однослойных Dockerfile

**Файл:** `docker-compose.prod.yml`, строки 24–25 и 47–48
**Проблема:** Prod-compose указывает `target: production` для backend и `target: nginx` для frontend, но текущие `backend/Dockerfile` и `frontend/Dockerfile` — однослойные (нет `FROM ... AS production`). Docker выдаст ошибку `target stage not found` при сборке.
**Задача для разработчика (DEVOPS):** До Sprint 5 добавить multi-stage build в оба Dockerfile: для backend — stage `production` с `node server.js` (без nodemon); для frontend — stage `build` (Vite build) и stage `nginx` (копирование `dist/` в nginx-образ).

---

## 📊 Статистика v2

| Категория | v1 | v2 (после исправлений) |
|-----------|----|-----------------------|
| 🔴 Критические | 2 | 0 |
| 🟡 Важные | 3 | 2 (новых) |
| 🟢 Рекомендации | 3 | 1 (новая) |
| **Закрыто из v1** | — | **7 из 8** |
| **Итого открытых** | **8** | **3** |

---

## 📋 Верификация всех замечаний v1 (построчно)

| Критерий | Файл:строка | Факт |
|----------|-------------|------|
| JWT_SECRET — случайная строка | `backend/.env:18` | ✅ 64 hex символа |
| ADMIN_PASSWORD — не `secret1030` | `backend/.env:13` | ✅ `Dev#1030!Local` |
| CORS ограничен по origin | `server.js:17–22` | ✅ `allowedOrigins` из env |
| CORS live-тест evil.com | curl результат | ✅ нет `Access-Control-Allow-Origin` |
| console.log только в dev | `server.js:44–50` | ✅ `if (NODE_ENV !== 'production')` |
| `docker-compose.prod.yml` создан | корень проекта | ✅ файл существует. ⚠️ [ВА-2'] ссылается на несуществующий nginx-конфиг |
| Git инициализирован | `git log` | ✅ коммит `c6ef5d8`, ветка `main` |
| `backend/.env` не в git | `git ls-files backend/.env` | ✅ пусто |
| CMD — `npm run dev` | `backend/Dockerfile:19` | ✅ |
| `- /app/node_modules` в backend | `docker-compose.yml:26` | ✅ |
| README.md создан | корень проекта | ✅ 161 строка, все секции есть |
| `ALLOWED_ORIGINS` в `.env.example` | `backend/.env.example` | ❌ отсутствует [ВА-4] |

---

## 🛑 Что нужно исправить перед Sprint 5 (Деплой)

1. **[ВА-4]** Добавить `ALLOWED_ORIGINS` в `backend/.env.example` — простая правка, 3 строки.
2. **[ВА-2']** Создать `nginx/nginx.prod.conf` или убрать `target:` из prod-compose — до деплоя.
3. **[РЕ-4]** Multi-stage Dockerfile — сделать в Sprint 5 вместе с деплоем.

**Для старта Sprint 1 блокеров нет.** Все критические проблемы закрыты.

---

## ✅ Итоговый вердикт по файлам

| Файл | Вердикт |
|------|---------|
| `backend/server.js` | ✅ ПРИНЯТО |
| `backend/Dockerfile` | ✅ ПРИНЯТО |
| `backend/.env` | ✅ ПРИНЯТО (не в git) |
| `backend/.env.example` | ⚠️ ЗАМЕЧАНИЕ — отсутствует `ALLOWED_ORIGINS` [ВА-4] |
| `docker-compose.yml` | ✅ ПРИНЯТО |
| `docker-compose.prod.yml` | ⚠️ ЗАМЕЧАНИЕ — `nginx/nginx.prod.conf` не существует [ВА-2'], `target:` без multi-stage [РЕ-4] |
| `.gitignore` | ✅ ПРИНЯТО |
| `README.md` | ✅ ПРИНЯТО |
| `frontend/Dockerfile` | ✅ ПРИНЯТО |
| `frontend/vite.config.js` | ✅ ПРИНЯТО |

---

*Версия отчёта: v2 | Ревью: Sprint 0 — проверка исправлений | Проект: 10:30 AM Shop*
*Следующий шаг: исправить [ВА-4] (быстро), затем → Sprint 1*
