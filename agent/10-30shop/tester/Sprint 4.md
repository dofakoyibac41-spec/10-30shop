# 🧪 TEST REPORT — Sprint 4: Авторизация + Админка

**Дата:** 2026-06-05
**Тестировщик:** AGENT_TESTER
**Спринт:** Sprint 4 — Authorization & Admin Panel
**Методология:** API curl (runtime) + статический анализ кода

---

## Итог

| Метрика | Значение |
|---------|----------|
| Всего тестов | **94** |
| ✅ Пройдено | **94** |
| ❌ Провалено | **0** |
| Ложных негативов | **1** (T69 — пробелы в объявлении, код корректен) |
| Статус | 🟢 **ВСЕ ТЕСТЫ ПРОШЛИ** |

---

## Блок 1: POST /api/auth/login (T01–T04)

| ID | Описание | Ожидание | Факт | ✅/❌ |
|----|----------|----------|------|------|
| T01 | Верные данные | 200 | 200 | ✅ |
| T02 | Ответ содержит `token` | JWT в теле | да | ✅ |
| T03 | Неверный пароль | 401 | 401 | ✅ |
| T04 | Пустое тело запроса | 400 | 400 | ✅ |

---

## Блок 2: PATCH /api/categories/:id — DEV-1 (T05–T11)

| ID | Описание | Ожидание | Факт | ✅/❌ |
|----|----------|----------|------|------|
| T05 | PATCH без JWT-токена | 401 | 401 | ✅ |
| T06 | PATCH с токеном, валидные данные | 200 | 200 | ✅ |
| T07 | Ответ содержит обновлённое `name` | `name="Тест PATCH"` | да | ✅ |
| T08 | Ответ содержит `id` | `id` в JSON | да | ✅ |
| T09 | PATCH несуществующей категории | 404 | 404 | ✅ |
| T10 | PATCH без поля `name` | 400 | 400 | ✅ |
| T11 | PATCH с id=abc (не число) | 400 | 400 | ✅ |

---

## Блок 3: POST /api/categories — создание (T12–T13)

| ID | Описание | Ожидание | Факт | ✅/❌ |
|----|----------|----------|------|------|
| T12 | POST новой категории с токеном | 201 | 201 | ✅ |
| T13 | Созданный объект содержит `id` | `id=7` | да | ✅ |

---

## Блок 4: DELETE /api/categories/:id — запрет при наличии товаров (T14–T15)

| ID | Описание | Ожидание | Факт | ✅/❌ |
|----|----------|----------|------|------|
| T14 | DELETE категории с товарами | 409 | 409 | ✅ |
| T15 | Сообщение об ошибке содержит слово «товар» | да | да | ✅ |

---

## Блок 5: POST/DELETE /api/products (T16–T20)

| ID | Описание | Ожидание | Факт | ✅/❌ |
|----|----------|----------|------|------|
| T16 | POST нового товара с токеном | 201 | 201 | ✅ |
| T17 | Созданный объект содержит `id` | `id=10` | да | ✅ |
| T18 | DELETE одиночного товара | 204 | 204 | ✅ |
| T19 | DELETE bulk (массив ids) | 200 | 200 | ✅ |
| T20 | Ответ `{ deleted: 2 }` | `deleted=2` | да | ✅ |

---

## Блок 6: useAuth.js — DEV-2 (T21–T28)

| ID | Описание | Факт | ✅/❌ |
|----|----------|------|------|
| T21 | `getToken()` читает `localStorage.getItem('token')` | ✅ |
| T22 | `isAuthenticated() = !!getToken()` | ✅ |
| T23 | `getAuthHeader()` присутствует | ✅ |
| T24 | `getAuthHeader()` возвращает `Authorization: Bearer ${token}` | ✅ |
| T25 | `login()` делает POST `/api/auth/login` | ✅ |
| T26 | `login()` сохраняет токен в localStorage | ✅ |
| T27 | `logout()` удаляет токен `localStorage.removeItem` | ✅ |
| T28 | `getAuthHeader` присутствует в `return {}` | ✅ |

---

## Блок 7: useApi.js — useAdminApi — DEV-3 (T29–T37)

| ID | Описание | Факт | ✅/❌ |
|----|----------|------|------|
| T29 | `export function useAdminApi` присутствует | ✅ |
| T30 | `createCategory` использует `POST` | ✅ |
| T31 | `updateCategory` использует `PATCH` | ✅ |
| T32 | `deleteCategory` присутствует | ✅ |
| T33 | `createProduct` присутствует | ✅ |
| T34 | `deleteProduct` присутствует | ✅ |
| T35 | `deleteProductsBulk` использует `/api/products/bulk` | ✅ |
| T36 | `getAuthHeader()` вызывается ≥ 4 раз (все защищённые методы) | ✅ |
| T37 | `import { useAuth } from './useAuth.js'` присутствует | ✅ |

---

## Блок 8: router/index.js — DEV-4 Route Guard (T38–T45)

| ID | Описание | Факт | ✅/❌ |
|----|----------|------|------|
| T38 | `router.beforeEach` присутствует | ✅ |
| T39 | Проверяет `to.path.startsWith('/admin')` | ✅ |
| T40 | Исключает `/admin/login` из проверки | ✅ |
| T41 | Вызывает `isAuthenticated()` | ✅ |
| T42 | Редирект на `{ name: 'login' }` | ✅ |
| T43 | `useAuth` импортирован в router | ✅ |
| T44 | Маршрут `/admin` зарегистрирован | ✅ |
| T45 | Маршрут `/admin/login` зарегистрирован | ✅ |

---

## Блок 9: LoginPage.vue — DEV-5 (T46–T55)

| ID | Описание | Факт | ✅/❌ |
|----|----------|------|------|
| T46 | `v-model="loginVal"` на input логина | ✅ |
| T47 | `v-model="password"` на input пароля | ✅ |
| T48 | `@submit.prevent="handleSubmit"` на форме | ✅ |
| T49 | `useAuth` импортирован | ✅ |
| T50 | `await login(...)` вызывается в `handleSubmit` | ✅ |
| T51 | `router.push` после успеха | ✅ |
| T52 | `:disabled="loading"` на кнопке | ✅ |
| T53 | `v-if="error"` — блок ошибки отображается | ✅ |
| T54 | `isAuthenticated()` проверяется при монтировании | ✅ |
| T55 | Нет инлайн `style=` в template | ✅ |

---

## Блок 10: AdminPage.vue — DEV-6-9 (T56–T87)

| ID | Описание | Факт | ✅/❌ |
|----|----------|------|------|
| T56 | `const activeTab = ref(` присутствует | ✅ |
| T57 | Значения вкладок `'categories'` и `'products'` | ✅ |
| T58 | `.tab-btn--active` CSS-класс для активной вкладки | ✅ |
| T59 | `logout()` вызывается в `handleLogout` | ✅ |
| T60 | Редирект `{ name: 'login' }` после logout | ✅ |
| T61 | `useAdminApi` импортирован | ✅ |
| T62 | `createCategory` используется | ✅ |
| T63 | `updateCategory` используется (inline редактирование) | ✅ |
| T64 | `deleteCategory` используется | ✅ |
| T65 | `editingCatId` ref — inline режим редактирования | ✅ |
| T66 | `createProduct` используется | ✅ |
| T67 | `deleteProduct` используется | ✅ |
| T68 | `deleteProductsBulk` используется | ✅ |
| T69 | `selectedIds = ref([])` строка 402 | ✅ (ложный neg.) |
| T70 | `const allSelected = computed(...)` | ✅ |
| T71 | `function toggleAll` присутствует | ✅ |
| T72 | `v-model="selectedIds"` на чекбоксах | ✅ |
| T73 | Чекбокс «Выбрать все» использует `toggleAll` и `allSelected` | ✅ |
| T74 | `function getCatName` — имя категории по id | ✅ |
| T75 | `v-if="toast.message"` — toast блок | ✅ |
| T76 | `<Transition name="toast-fade">` | ✅ |
| T77 | `function showToast` присутствует | ✅ |
| T78 | CSS классы `.toast--success` и `.toast--error` | ✅ |
| T79 | `<select>` + `v-for="cat in categories"` в форме товара | ✅ |
| T80 | `class="form-preview"` — превью картинки | ✅ |
| T81 | Таблица `.admin-table` | ✅ |
| T82 | `.btn-danger` — CSS для кнопок удаления | ✅ |
| T83 | Нет хардкоженных данных (`demo`, `hardcode`) | ✅ |
| T84 | `onMounted` загружает категории | ✅ |
| T85 | `watch(activeTab` загружает товары при переключении | ✅ |
| T86 | Нет `alert()` — только `showToast` | ✅ |
| T87 | `style=` инлайн ≤ 3 (только divider margin) | ✅ |

---

## Блок 11: backend/routes/categories.js — DEV-1 код (T88–T94)

| ID | Описание | Факт | ✅/❌ |
|----|----------|------|------|
| T88 | `router.patch('/:id'` задекларирован | ✅ |
| T89 | `authMiddleware` на PATCH роуте | ✅ |
| T90 | `isNaN(id)` проверка | ✅ |
| T91 | `404` + `'Категория не найдена'` | ✅ |
| T92 | `400` + `'Поле name обязательно'` | ✅ |
| T93 | `UPDATE categories SET` SQL запрос | ✅ |
| T94 | `image_url !== undefined` — сохраняет текущий если не передан | ✅ |

---

## Примечание по T69

**Ложный негатив:** Тест искал строку `"const selectedIds = ref("` (без пробелов), но в коде используются выровненные пробелы: `const selectedIds     = ref([])` (строка 402). Реальный код корректен — переменная объявлена и используется на строках 210, 213, 230, 246, 402, 405, 447, 459, 462, 463.

---

## Дополнительные наблюдения

### ✅ Хорошие практики обнаруженные в коде:
1. `watch(activeTab)` — умная ленивая загрузка товаров только при переходе на вкладку
2. `:indeterminate` на главном чекбоксе — корректное UX поведение (частичный выбор)
3. `@error` на `<img>` — автоочистка невалидного URL превью
4. `toastTimer` с `clearTimeout` — предотвращает наложение уведомлений
5. `Escape` (`@keydown.esc`) для выхода из режима редактирования категории
6. `pointer-events: none` на toast — не блокирует клики

### ⚠️ Мелкие наблюдения (не блокеры):
- `AdminPage.vue` имеет 3 `style=` (все для `.divider margin`) — некритично, т.к. divider не имеет своего gap-класса
- `loadProducts({limit: 200})` — хардкод лимита 200. При базе > 200 товаров список обрежется. Рекомендация на Sprint 5: добавить пагинацию в админке или убрать лимит

---

## Итоговая таблица по задачам

| Задача | Тесты | Статус |
|--------|-------|--------|
| DEV-1 `PATCH /api/categories/:id` | T05–T11, T88–T94 | ✅ 14/14 |
| DEV-2 `useAuth.getAuthHeader()` | T21–T28 | ✅ 8/8 |
| DEV-3 `useAdminApi()` | T29–T37 | ✅ 9/9 |
| DEV-4 Router guard | T38–T45 | ✅ 8/8 |
| DEV-5 LoginPage | T46–T55 | ✅ 10/10 |
| DEV-6-9 AdminPage | T56–T87 | ✅ 32/32 |
| Auth login API | T01–T04 | ✅ 4/4 |
| Categories API | T12–T15 | ✅ 4/4 |
| Products API | T16–T20 | ✅ 5/5 |

**ИТОГО: 94/94 ✅ (100%)**

---

*Версия: 1.0 | Sprint: 4 | Проект: 10:30 AM Shop*
