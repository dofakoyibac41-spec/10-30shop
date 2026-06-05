# 🔍 REVIEW REPORT v1 — Sprint 4: Авторизация + Админка

**Дата:** 2026-06-05
**Ревьюер:** AGENT_REVIEWER
**Спринт:** Sprint 4 — Authorization & Admin Panel
**Метод:** Прямое чтение кода через view_file + runtime curl. Агентским отчётам не доверяю.

---

## Итог

| Метрика | Значение |
|---------|----------|
| Критических замечаний | **0** |
| Некритических (рекомендации) | **4** |
| Позитивных наблюдений | **10** |
| Статус | 🟢 **ПРИНЯТО** — рекомендации не блокируют |

---

## ✅ Что проверено и принято

### DEV-1: backend/routes/categories.js — PATCH /api/categories/:id

Файл прочитан полностью (97 строк). **Принято без замечаний.**

- ✅ `router.patch('/:id', authMiddleware, ...)` — роут зарегистрирован, строка 70
- ✅ `authMiddleware` применён первым аргументом
- ✅ `parseInt(req.params.id, 10)` + `isNaN(id)` → 400
- ✅ `SELECT * FROM categories WHERE id = ?` → 404 если не найдена
- ✅ `!name || !name.trim()` → 400 без name
- ✅ `image_url !== undefined ? (image_url || null) : category.image_url` — умная логика: если поле не передано, старое значение сохраняется
- ✅ `UPDATE categories SET name = ?, image_url = ? WHERE id = ?` — параметризованный запрос (SQL-инъекции невозможны)
- ✅ Возвращает обновлённый объект через повторный SELECT

**Порядок роутов:** `DELETE /:id` (строка 38) стоит до `PATCH /:id` (строка 70). В Express оба роута имеют разные HTTP-методы, конфликтов нет.

---

### DEV-2: frontend/src/composables/useAuth.js

Файл прочитан полностью (31 строка). **Принято без замечаний.**

- ✅ `getToken()` → `localStorage.getItem('token')`
- ✅ `isAuthenticated()` → `!!getToken()`
- ✅ `getAuthHeader()` → `{ Authorization: \`Bearer ${getToken()}\` }` (строка 11)
- ✅ `login()` — POST с JSON, сохраняет токен, выбрасывает Error при `!res.ok`
- ✅ `logout()` → `localStorage.removeItem('token')`
- ✅ Все 5 методов присутствуют в `return {}`

---

### DEV-3: frontend/src/composables/useApi.js — useAdminApi()

Строки 59–131 прочитаны. **Принято без замечаний.**

- ✅ `export function useAdminApi()` — строка 68
- ✅ 6 методов: `createCategory`, `updateCategory`, `deleteCategory`, `createProduct`, `deleteProduct`, `deleteProductsBulk`
- ✅ Каждый передаёт `...getAuthHeader()` в `headers` объект через spread
- ✅ `deleteProductsBulk` использует `/api/products/bulk` с телом `{ ids }`
- ✅ `deleteCategory` содержит `.catch((e) => { throw e; })` — правильный re-throw (ошибка 409 дойдёт до компонента с оригинальным сообщением)

---

### DEV-4: frontend/src/router/index.js

Файл прочитан полностью (48 строк). **Принято без замечаний.**

- ✅ `router.beforeEach` добавлен после `createRouter` (строка 35)
- ✅ `to.path.startsWith('/admin') && to.path !== '/admin/login'` — логика корректна
- ✅ `isAuthenticated()` — вызов `useAuth()` внутри guard-а, не в `setup()`. Это работает т.к. `isAuthenticated()` только читает `localStorage` без реактивности
- ✅ `next({ name: 'login' })` при отсутствии токена
- ✅ `next()` в else — маршруты `/`, `/catalog`, `/admin/login` открыты без проверки

---

### DEV-5: frontend/src/pages/LoginPage.vue

Файл прочитан полностью (115 строк). **Принято без замечаний.**

- ✅ `@submit.prevent="handleSubmit"` на форме (строка 8)
- ✅ `v-model="loginVal"` / `v-model="password"` — строки 13, 26
- ✅ `id="login-input"` / `id="password-input"` — уникальные id для label связки
- ✅ `:disabled="loading"` на обоих полях и кнопке — UX блокировка формы
- ✅ `{{ loading ? 'Вход...' : 'Войти' }}` — информативный текст кнопки
- ✅ `v-if="error"` блок ошибки (строка 36) — класс `page-login__error`
- ✅ `isAuthenticated()` при монтировании → `router.replace({ name: 'admin' })` (строка 60–62)
- ✅ Нет `style=` инлайн в template
- ✅ `password.value` передаётся без `.trim()` (пробелы в пароле — допустимо)

---

### DEV-6-9: frontend/src/pages/AdminPage.vue

Файл прочитан полностью (701 строка). **Принято с 4 рекомендациями.**

**Что принято:**
- ✅ Структура: Toast → Header (logout) → Tabs → Content (категории / товары)
- ✅ `activeTab = ref('categories')` — вкладки реализованы через v-if/v-else-if (строки 46, 139)
- ✅ `:class="['tab-btn', { 'tab-btn--active': activeTab === 'categories' }]"` — динамический CSS
- ✅ `handleLogout()` → `logout()` + `router.push({ name: 'login' })` (строки 311–314)
- ✅ `watch(activeTab)` — ленивая загрузка товаров при переключении на вкладку (строка 296)
- ✅ Toast через `<Transition name="toast-fade">` + `showToast()` + таймер 3000ms с `clearTimeout` (строки 304–308)
- ✅ `role="alert"` на toast-элементе — доступность
- ✅ `pointer-events: none` на `.toast` — не блокирует интерфейс
- ✅ Inline редактирование категорий: `editingCatId` ref + `startEdit` / `saveEdit` / `Escape`
- ✅ `@error="newCatImageUrl = ''"` на img — автоочистка невалидного URL
- ✅ `allSelected = computed(...)` + `:indeterminate` на главном чекбоксе
- ✅ `selectedIds.value = selectedIds.value.filter(...)` в `deleteOne` — корректное обновление выбора
- ✅ `getCatName(catId)` — корректный fallback `#${catId}` если категория не найдена
- ✅ `v-if="categories.length === 0 && !catLoading"` / `v-if="products.length === 0 && !prodLoading"` — пустые состояния
- ✅ Responsive: скрытие колонки Фото на мобилке
- ✅ Нет `alert()` — только `showToast`

---

## 🟡 Рекомендации (некритично, Sprint 5)

### [РЕК-1] useAuth.js строки 2–4 — комментарий устарел

**Файл:** `frontend/src/composables/useAuth.js`, строки 2–4

**Реальный код:**
```js
// Sprint 4 реализует полную логику авторизации:
// login(), logout(), getToken(), isAuthenticated.
// Сейчас — минимальный stub для подключения роутера.
```

**Проблема:** Комментарий писался в Sprint 3 как заглушка. Сейчас Sprint 4 выполнен — composable полностью реализован. Комментарий «минимальный stub» вводит в заблуждение.

**Исправление:** Обновить комментарий на описание текущего состояния: 5 методов, JWT через localStorage.

---

### [РЕК-2] useApi.js строка 66 — `import` в середине файла

**Файл:** `frontend/src/composables/useApi.js`, строка 66

**Реальный код:**
```js
// (в середине файла, после закрывающей } функции useApi)
import { useAuth } from './useAuth.js';
```

**Проблема:** `import` расположен в середине файла (после функции `useApi`), а не в начале. В ES-модулях это работает корректно (импорты hoisted), но нарушает стандарт eslint `import/first` и может сбивать с толку разработчиков — обычно все импорты идут в начале файла.

**Исправление:** Переместить `import { useAuth } from './useAuth.js'` в начало файла вместе с остальными импортами.

---

### [РЕК-3] AdminPage.vue — двойной import из одного файла

**Файл:** `frontend/src/pages/AdminPage.vue`, строки 281–282

**Реальный код:**
```js
import { useApi }      from '../composables/useApi.js';
import { useAdminApi } from '../composables/useApi.js';
```

**Проблема:** Два отдельных `import` из одного модуля. Это избыточно и нарушает lint-правило `no-duplicate-imports`.

**Исправление:** Объединить в один:
```js
import { useApi, useAdminApi } from '../composables/useApi.js';
```

---

### [РЕК-4] AdminPage.vue строки 41, 81, 201 — 3 инлайн `style=` на divider

**Файл:** `frontend/src/pages/AdminPage.vue`, строки 41, 81, 201

**Реальный код:**
```html
<div class="divider" style="margin: 0 0 40px;"></div>
<div class="divider" style="margin: 40px 0;"></div>
<div class="divider" style="margin: 40px 0;"></div>
```

**Проблема:** 3 инлайн-стиля. Два из них идентичны (`margin: 40px 0`). Нарушает принцип «нет инлайн-стилей».

**Исправление:** Добавить модификаторы в `<style scoped>`:
```css
.divider--section { margin: 40px 0; }
.divider--tabs    { margin: 0 0 40px; }
```
Применить: `<div class="divider divider--section">`.

---

## Финальная сводная таблица

| ID | Файл | Замечание | Приоритет |
|----|------|-----------|-----------|
| РЕК-1 | `useAuth.js:2-4` | Устаревший комментарий «stub» | 🟡 Низкий |
| РЕК-2 | `useApi.js:66` | `import` в середине файла | 🟡 Средний |
| РЕК-3 | `AdminPage.vue:281-282` | Два import из одного модуля | 🟡 Средний |
| РЕК-4 | `AdminPage.vue:41,81,201` | 3 инлайн `style=` на divider | 🟡 Низкий |

---

## 🟢 Решение

**Sprint 4 принят.** Критических и важных замечаний нет.

**Разработчику исправить в начале Sprint 5 (перед деплоем):**
1. `[РЕК-2]` `useApi.js:66` — перенести `import { useAuth }` в начало файла (1 строка)
2. `[РЕК-3]` `AdminPage.vue:281-282` — объединить два `import` из `useApi.js` в один
3. `[РЕК-4]` `AdminPage.vue:41,81,201` — заменить 3 `style=` на CSS-классы `.divider--section` / `.divider--tabs`
4. `[РЕК-1]` `useAuth.js:2-4` — обновить комментарий заголовка

**Код корректен, безопасен, соответствует Editorial Brutalism и паттернам Vue 3.**

---

**→ Sprint 4 закрыт. Готов к Sprint 5 — Деплой на Timeweb.**

---

*Версия: 1.0 | Sprint: 4 | Проект: 10:30 AM Shop*
