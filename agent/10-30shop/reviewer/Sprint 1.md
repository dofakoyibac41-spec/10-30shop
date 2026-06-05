# 🔍 Review Report v1 — Sprint 1: Фундамент

**Дата:** 2026-06-05
**Ревьюер:** AGENT_REVIEWER
**Sprint:** Sprint 1 — Фундамент
**Задача:** REVIEW-1
**Метод:** view_file (живой код) + live curl edge-case тесты. Отчётам агентов не доверяю.

---

## Общая оценка

**✅ ПРИНЯТО.** Sprint 1 реализован корректно. Критических и важных замечаний нет. Есть 3 рекомендации (minor) — не блокируют следующий спринт.

---

## Проверки по чеклисту TASKS.md REVIEW-1

### Backend

| Пункт | Файл | Результат |
|-------|------|-----------|
| `db.js` — таблицы `products` и `categories` с корректной схемой | `backend/db.js:31-53` | ✅ Схема точная, `ON DELETE RESTRICT`, WAL, `foreign_keys=ON` |
| `products.js` — маршрут `/bulk` зарегистрирован ДО `/:id` | `backend/routes/products.js:74,96` | ✅ `router.delete('/bulk', ...)` на строке 74, `router.delete('/:id', ...)` на строке 96 |
| `categories.js` — `DELETE` проверяет наличие товаров | `backend/routes/categories.js:51-58` | ✅ `COUNT(*) WHERE category_id = ?` → 409 |
| `authMiddleware.js` — проверяет JWT, 401 без токена | `backend/middleware/authMiddleware.js:12-24` | ✅ `startsWith('Bearer ')` + `jwt.verify` + catch → 401 |
| `auth.js` — пароль из `process.env`, не хардкод | `backend/routes/auth.js:21-22` | ✅ `process.env.ADMIN_LOGIN`, `process.env.ADMIN_PASSWORD` |
| `parseInt` для `limit` и `offset` | `backend/routes/products.js:18-19` | ✅ `parseInt(..., 10)` + `Math.max` защита |

### Frontend

| Пункт | Файл | Результат |
|-------|------|-----------|
| `router/index.js` — 4 маршрута | `frontend/src/router/index.js:12-16` | ✅ `/`, `/catalog`, `/admin`, `/admin/login` |
| `App.vue` содержит `<RouterView />` | `frontend/src/App.vue:4` | ✅ |
| `main.js` — router подключён через `app.use(router)` | `frontend/src/main.js:6` | ✅ `createApp(App).use(router).mount('#app')` |
| Все 4 stub-страницы в `frontend/src/pages/` | `ls pages/` | ✅ HomePage, CatalogPage, AdminPage, LoginPage |

### Безопасность

| Пункт | Результат |
|-------|-----------|
| Нет хардкода паролей/токенов в коде | ✅ Все секреты через `process.env` |
| `authMiddleware` на всех POST и DELETE | ✅ Каждый защищённый route явно получает `authMiddleware` |
| `.env` не попадает в git | ✅ `git ls-files backend/.env` → пусто |

---

## Edge-case тесты (выполнены поверх TESTER-1)

| ID | Сценарий | Результат |
|----|----------|-----------|
| R-01 | `login='Admin'` (другой регистр) | ✅ 401 — регистрозависимо, правильно |
| R-02 | `bulk` с несуществующими id | ✅ 200 `{deleted:0}` — корректный ответ |
| R-03 | `?limit=0` | ✅ `Math.max(1,..)` → возвращает 6, не падает |
| R-04 | `?category_id=abc` (нечисло) | ✅ 200, `NaN → null`, возвращает все товары |
| R-05 | `POST /products` с `category_id=0` | ✅ 400 — `!category_id` falsy-проверка работает |
| R-06 | `bulk` с `[1.5, 2.7]` (float) | ✅ 400 — `Number.isInteger` фильтрует |
| R-07 | `POST /categories` без поля `name` | ✅ 400 — `!name` falsy-проверка работает |
| R-08 | `DELETE /products/abc` | ✅ 400 — `isNaN(parseInt(...))` защита |
| R-09 | Невалидный JWT | ✅ 401 |
| R-10 | `/bulk` vs `/:id` routing | ✅ `body.error` содержит 'ids' — попал в bulk handler, не в /:id |

---

## Замечания

### 🟡 РЕКОМЕНДАЦИЯ — РЕК-1: нет `PATCH /api/categories/:id`

**Файл:** `backend/routes/categories.js`
**Описание:** В текущей реализации категорию нельзя переименовать — только создать/удалить. При ошибке в названии нужно удалить и создать заново. Это Sprint 4 (Админка), но стоит учесть при проектировании UI.
**Влияние:** Не блокирует Sprint 2. Добавить в backlog.

---

### 🟡 РЕКОМЕНДАЦИЯ — РЕК-2: `category_id=abc` тихо игнорируется

**Файл:** `backend/routes/products.js:20,26`
**Код:**
```js
const categoryId = req.query.category_id ? parseInt(req.query.category_id, 10) : null;
// ...
if (categoryId !== null && !isNaN(categoryId)) { ... }
```
**Описание:** Если клиент передаёт `?category_id=abc`, `parseInt` возвращает `NaN`, условие `!isNaN` не выполняется, и фильтр тихо игнорируется — возвращаются все товары. Это приемлемо для MVP, но может вводить в заблуждение (клиент получает данные без ожидаемой фильтрации).
**Рекомендация:** В Sprint 3 добавить явный `400 Bad Request` если `category_id` передан, но не является числом.
**Влияние:** Не блокирует. Низкий приоритет.

---

### 🟡 РЕКОМЕНДАЦИЯ — РЕК-3: нет route guard в Vue Router

**Файл:** `frontend/src/router/index.js`
**Описание:** Маршрут `/admin` не защищён — любой пользователь может открыть страницу без JWT. Серверные API защищены (authMiddleware), но UI-уровень пропускает всех.
**Рекомендация:** Sprint 4 (Админка) должен добавить `beforeEach` guard:
```js
router.beforeEach((to) => {
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    if (!localStorage.getItem('token')) return '/admin/login';
  }
});
```
**Влияние:** Не блокирует Sprint 2 и Sprint 3. Обязательно реализовать в Sprint 4.

---

## Итоговая таблица замечаний

| ID | Приоритет | Файл | Описание | Статус |
|----|-----------|------|----------|--------|
| РЕК-1 | 🟡 Рекомендация | `routes/categories.js` | Нет PATCH (редактирование категории) | Backlog Sprint 4 |
| РЕК-2 | 🟡 Рекомендация | `routes/products.js` | `category_id=abc` → тихий ignore | Backlog Sprint 3 |
| РЕК-3 | 🟡 Рекомендация | `router/index.js` | Нет route guard на `/admin` | Sprint 4 (обязательно) |

**Критических замечаний: 0**
**Важных замечаний: 0**
**Рекомендаций: 3** (не блокируют прогресс)

---

## Вердикт

**✅ ПРИНЯТО. Sprint 1 — Фундамент завершён.**

- Backend API полностью рабочий и корректно защищён
- Frontend структура соответствует плану, Vue Router настроен
- БД инициализируется при старте, seed данные корректны
- Нет хардкода секретов, CORS ограничен

**→ Готово к Sprint 2 — Дизайн-система.**

---

*Версия: v1 | Sprint: 1 | Проект: 10:30 AM Shop*
