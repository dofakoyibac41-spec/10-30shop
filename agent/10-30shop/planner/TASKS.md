# 📋 TASKS — Sprint 4: Админка

**Дата:** 2026-06-05
**Планировщик:** AGENT_PLANNER
**Фича:** Sprint 4 — Авторизация + панель управления товарами и категориями
**Статус:** 🔄 В работе

---

## Контекст (что уже есть)

**Backend (готово, не трогать):**
- `POST /api/auth/login` → JWT-токен (24h), сверяет с `ADMIN_LOGIN` / `ADMIN_PASSWORD` из `.env`
- `GET /api/categories` — публичный
- `POST /api/categories` — 🔒 JWT
- `DELETE /api/categories/:id` — 🔒 JWT (запрет если есть товары)
- `GET /api/products` — публичный
- `POST /api/products` — 🔒 JWT
- `DELETE /api/products/bulk` — 🔒 JWT (массив `ids`)
- `DELETE /api/products/:id` — 🔒 JWT
- `authMiddleware` — проверяет `Authorization: Bearer <token>`

**Backend (отсутствует, нужно создать):**
- `PATCH /api/categories/:id` — переименование категории ([РЕК-1 из Sprint 1])

**Frontend (готово, stub):**
- `LoginPage.vue` — форма без логики (комментарий: Sprint 4)
- `AdminPage.vue` — заглушка (комментарий: Sprint 4)
- `useAuth.js` — уже написан полностью: `login()`, `logout()`, `getToken()`, `isAuthenticated()`
- `router/index.js` — маршруты `/admin` и `/admin/login` существуют, **route guard отсутствует**

---

## Порядок выполнения

### [DEV-1] Backend: `PATCH /api/categories/:id` — переименование категории
**Агент:** DEVELOPER
**Зависит от:** —
**Статус:** ⏳ Ожидает

**Файл:** `backend/routes/categories.js`

Добавить между DELETE и `module.exports`:

```js
// ─── PATCH /api/categories/:id ───────────────────────────────────────────────
// [РЕК-1 из ревью Sprint 1] Переименование без удаления
// Принимает: { name, image_url? }
// Возвращает: обновлённый объект категории
router.patch('/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Некорректный id' });

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!category) return res.status(404).json({ error: 'Категория не найдена' });

  const { name, image_url } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Поле name обязательно' });
  }

  db.prepare('UPDATE categories SET name = ?, image_url = ? WHERE id = ?')
    .run(name.trim(), image_url !== undefined ? image_url : category.image_url, id);

  const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  res.json(updated);
});
```

---

### [DEV-2] `useAuth.js` — добавить метод `getAuthHeader()`
**Агент:** DEVELOPER
**Зависит от:** —
**Статус:** ⏳ Ожидает

**Файл:** `frontend/src/composables/useAuth.js`

Добавить один метод — возвращает заголовок для JWT-запросов:

```js
const getAuthHeader = () => ({ Authorization: `Bearer ${getToken()}` });
```

Это нужно `useApi.js` для защищённых запросов в AdminPage.

---

### [DEV-3] `useApi.js` — добавить защищённые методы для Админки
**Агент:** DEVELOPER
**Зависит от:** DEV-2
**Статус:** ⏳ Ожидает

**Файл:** `frontend/src/composables/useApi.js`

Добавить composable `useAdminApi()` в тот же файл:

```js
import { useAuth } from './useAuth.js';

export function useAdminApi() {
  const { getAuthHeader } = useAuth();

  // Категории
  const createCategory = (data) =>
    apiFetch('/api/categories', { method: 'POST', body: JSON.stringify(data), headers: getAuthHeader() });

  const updateCategory = (id, data) =>
    apiFetch(`/api/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data), headers: getAuthHeader() });

  const deleteCategory = (id) =>
    apiFetch(`/api/categories/${id}`, { method: 'DELETE', headers: getAuthHeader() });

  // Товары
  const createProduct = (data) =>
    apiFetch('/api/products', { method: 'POST', body: JSON.stringify(data), headers: getAuthHeader() });

  const deleteProduct = (id) =>
    apiFetch(`/api/products/${id}`, { method: 'DELETE', headers: getAuthHeader() });

  const deleteProductsBulk = (ids) =>
    apiFetch('/api/products/bulk', { method: 'DELETE', body: JSON.stringify({ ids }), headers: getAuthHeader() });

  return { createCategory, updateCategory, deleteCategory, createProduct, deleteProduct, deleteProductsBulk };
}
```

**Важно:** `apiFetch` уже обрабатывает 401/403 → выбрасывает Error с текстом бэкенда. Компонент поймает через try/catch.

---

### [DEV-4] Router: `beforeEach` guard — защита `/admin`
**Агент:** DEVELOPER
**Зависит от:** —
**Статус:** ⏳ Ожидает

**Файл:** `frontend/src/router/index.js`

Добавить route guard после `createRouter`:

```js
import { useAuth } from '../composables/useAuth.js';

// [РЕК-3 из ревью Sprint 1 — обязательно]
// Все маршруты /admin (кроме /admin/login) требуют JWT в localStorage
router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useAuth();
  const isAdminRoute = to.path.startsWith('/admin') && to.path !== '/admin/login';
  if (isAdminRoute && !isAuthenticated()) {
    next({ name: 'login' });
  } else {
    next();
  }
});
```

**Поведение:**
- `/admin` без токена → редирект на `/admin/login`
- `/admin/login` — всегда доступна (даже если залогинен — не редиректим, пусть сам разберётся)
- Любой публичный маршрут (`/`, `/catalog`) — без проверки

---

### [DEV-5] `LoginPage.vue` — реальная авторизация
**Агент:** DEVELOPER
**Зависит от:** DEV-4
**Статус:** ⏳ Ожидает

Полностью заменить заглушечный `<script setup>`:

```js
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';

const router = useRouter();
const { login, isAuthenticated } = useAuth();

// Если уже залогинен — сразу на /admin
if (isAuthenticated()) router.replace({ name: 'admin' });

const loginVal = ref('');
const password = ref('');
const error    = ref('');
const loading  = ref(false);

async function handleSubmit() {
  if (!loginVal.value || !password.value) {
    error.value = 'Заполните все поля';
    return;
  }
  error.value = '';
  loading.value = true;
  try {
    await login(loginVal.value, password.value);
    router.push({ name: 'admin' });
  } catch (e) {
    error.value = e.message || 'Ошибка авторизации';
  } finally {
    loading.value = false;
  }
}
```

**Template изменения:**
- `v-model="loginVal"` и `v-model="password"` на input-ы
- `@submit.prevent="handleSubmit"` на форме
- `:disabled="loading"` на кнопке, текст «Вход...» при loading
- `v-if="error"` — блок ошибки под кнопкой: `<p class="body-md error-text">{{ error }}</p>`

**CSS добавить в `<style scoped>`:**
```css
.error-text { color: var(--color-error, #ff4444); margin-top: 8px; }
```

---

### [DEV-6] `AdminPage.vue` — структура двух вкладок
**Агент:** DEVELOPER
**Зависит от:** DEV-4
**Статус:** ⏳ Ожидает

Полностью переписать `AdminPage.vue`:

**Структура:**
```
[Заголовок] Панель управления        [Кнопка Выйти]

[Вкладка: Категории] [Вкладка: Товары]

─────────────────────────────────────────
[Контент активной вкладки]
```

**Script:**
```js
const { logout } = useAuth();
const activeTab = ref('categories'); // 'categories' | 'products'

function handleLogout() {
  logout();
  router.push({ name: 'login' });
}
```

**Вкладки реализовать через `v-if` / `v-else-if`:**
```html
<div v-if="activeTab === 'categories'">
  <!-- Блок категорий (DEV-7) -->
</div>
<div v-else-if="activeTab === 'products'">
  <!-- Блок товаров (DEV-8) -->
</div>
```

**CSS класс активной вкладки:**
```css
.tab-btn--active { border-bottom: 2px solid var(--color-primary); color: var(--color-primary); }
```

---

### [DEV-7] `AdminPage.vue` — вкладка «Категории»
**Агент:** DEVELOPER
**Зависит от:** DEV-6, DEV-3
**Статус:** ⏳ Ожидает

**Секция «Категории» внутри AdminPage:**

**Форма создания категории:**
```html
<form @submit.prevent="createCat">
  <input v-model="newCatName" placeholder="Название" class="input-underline" />
  <input v-model="newCatImageUrl" placeholder="URL картинки (необязательно)" class="input-underline" />
  <!-- Превью: показывать img если newCatImageUrl не пустой -->
  <img v-if="newCatImageUrl" :src="newCatImageUrl" class="category-preview" alt="Превью" />
  <button type="submit" class="btn-primary" :disabled="!newCatName.trim() || catLoading">
    {{ catLoading ? 'Сохранение...' : 'Создать' }}
  </button>
</form>
```

**Список категорий:**
```html
<div v-for="cat in categories" :key="cat.id" class="admin-row">
  <!-- Режим просмотра -->
  <template v-if="editingCatId !== cat.id">
    <span>{{ cat.name }}</span>
    <button @click="startEdit(cat)" class="btn-ghost btn-sm">Редактировать</button>
    <button @click="deleteCat(cat.id)" class="btn-ghost btn-sm btn-danger">Удалить</button>
  </template>
  <!-- Режим редактирования (inline) -->
  <template v-else>
    <input v-model="editCatName" class="input-underline" />
    <button @click="saveEdit(cat.id)" class="btn-primary btn-sm">Сохранить</button>
    <button @click="editingCatId = null" class="btn-ghost btn-sm">Отмена</button>
  </template>
</div>
```

**State для категорий:**
```js
const categories     = ref([]);
const newCatName     = ref('');
const newCatImageUrl = ref('');
const catLoading     = ref(false);
const catError       = ref('');
const editingCatId   = ref(null);
const editCatName    = ref('');
```

**Методы:**
- `loadCategories()` — `getCategories()` из `useApi`
- `createCat()` — `createCategory({name, image_url})`, потом `loadCategories()`
- `deleteCat(id)` — `deleteCategory(id)`, потом `loadCategories()`; если ошибка — показать `catError`
- `startEdit(cat)` — `editingCatId.value = cat.id; editCatName.value = cat.name`
- `saveEdit(id)` — `updateCategory(id, {name: editCatName.value})`, потом `loadCategories()`

---

### [DEV-8] `AdminPage.vue` — вкладка «Товары»
**Агент:** DEVELOPER
**Зависит от:** DEV-6, DEV-3
**Статус:** ⏳ Ожидает

**Форма добавления товара:**
```html
<form @submit.prevent="addProduct">
  <input v-model="newProdName" placeholder="Название" class="input-underline" required />
  <textarea v-model="newProdDesc" placeholder="Описание (необязательно)" class="input-underline" />
  <!-- Выпадающий список категорий из API -->
  <select v-model="newProdCategoryId" class="input-underline" required>
    <option value="" disabled>Выберите категорию</option>
    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
  </select>
  <!-- URL картинки + валидация непустоты + превью -->
  <input v-model="newProdImageUrl" placeholder="URL картинки *" class="input-underline" required />
  <img v-if="newProdImageUrl" :src="newProdImageUrl" class="product-preview" alt="Превью" />
  <button type="submit" class="btn-primary" :disabled="!newProdName.trim() || !newProdImageUrl.trim() || prodLoading">
    {{ prodLoading ? 'Сохранение...' : 'Добавить товар' }}
  </button>
</form>
```

**Таблица товаров:**
```html
<table class="admin-table">
  <thead>
    <tr>
      <!-- Чекбокс «Выбрать все» -->
      <th><input type="checkbox" :checked="allSelected" @change="toggleAll" /></th>
      <th>Фото</th>
      <th>Название</th>
      <th>Категория</th>
      <th>Действия</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="prod in products" :key="prod.id">
      <td><input type="checkbox" :value="prod.id" v-model="selectedIds" /></td>
      <td><img :src="prod.image_url" class="table-thumb" alt="" /></td>
      <td>{{ prod.name }}</td>
      <td>{{ getCatName(prod.category_id) }}</td>
      <td>
        <button @click="deleteOne(prod.id)" class="btn-ghost btn-sm btn-danger">Удалить</button>
      </td>
    </tr>
  </tbody>
</table>

<!-- Кнопка массового удаления — активна только если selectedIds.length > 0 -->
<button
  class="btn-ghost btn-danger"
  :disabled="selectedIds.length === 0 || prodLoading"
  @click="deleteBulk"
>
  Удалить выбранные ({{ selectedIds.length }})
</button>
```

**State для товаров:**
```js
const products        = ref([]);
const newProdName     = ref('');
const newProdDesc     = ref('');
const newProdCategoryId = ref('');
const newProdImageUrl = ref('');
const prodLoading     = ref(false);
const prodError       = ref('');
const selectedIds     = ref([]);
```

**Computed:**
```js
const allSelected = computed(
  () => products.value.length > 0 && selectedIds.value.length === products.value.length
);
```

**Методы:**
- `loadProducts()` — `getProducts({limit: 100})` — загружаем все (в админке нет пагинации)
- `addProduct()` — `createProduct({name, description, category_id, image_url})`, потом `loadProducts()`
- `deleteOne(id)` — `deleteProduct(id)`, потом `loadProducts()`, убрать id из `selectedIds`
- `deleteBulk()` — `deleteProductsBulk(selectedIds.value)`, потом `loadProducts()`, `selectedIds.value = []`
- `toggleAll(e)` — если checked: `selectedIds.value = products.value.map(p => p.id)`, иначе `[]`
- `getCatName(catId)` — найти в `categories` по id → вернуть `name`

---

### [DEV-9] `AdminPage.vue` — уведомления успех/ошибка + стили
**Агент:** DEVELOPER
**Зависит от:** DEV-7, DEV-8
**Статус:** ⏳ Ожидает

**Toast-уведомления** в верхней части AdminPage:

```js
const toast = ref({ message: '', type: '' }); // type: 'success' | 'error'
let toastTimer = null;

function showToast(message, type = 'success') {
  toast.value = { message, type };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.value = { message: '', type: '' }; }, 3000);
}
```

```html
<!-- Над заголовком или sticky сверху -->
<Transition name="toast-fade">
  <div v-if="toast.message" :class="['toast', `toast--${toast.type}`]">
    {{ toast.message }}
  </div>
</Transition>
```

**Вызов:**
- После успешного создания категории: `showToast('Категория создана')`
- После удаления: `showToast('Удалено')`
- При ошибке: `showToast(e.message, 'error')`

**CSS:**
```css
.toast {
  position: fixed; top: 80px; right: 24px; z-index: 200;
  padding: 12px 24px;
  border: 1px solid var(--color-outline-variant);
  background: var(--color-background);
  font-size: var(--fs-label-sm);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
}
.toast--success { border-color: var(--color-primary); color: var(--color-primary); }
.toast--error   { border-color: #ff4444; color: #ff4444; }
.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity 0.2s ease; }
.toast-fade-enter-from, .toast-fade-leave-to       { opacity: 0; }

/* Стили таблицы и превью */
.admin-table { width: 100%; border-collapse: collapse; margin-top: 24px; }
.admin-table th, .admin-table td {
  padding: 12px 16px; text-align: left;
  border-bottom: 1px solid var(--color-outline-variant);
}
.admin-table th { font-size: var(--fs-label-sm); letter-spacing: var(--ls-label); text-transform: uppercase; }
.table-thumb { width: 48px; height: 60px; object-fit: cover; display: block; }
.product-preview, .category-preview { width: 120px; aspect-ratio: 4/5; object-fit: cover; margin-top: 8px; }
.admin-row { display: flex; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--color-outline-variant); }
.btn-sm { padding: 6px 12px; font-size: var(--fs-label-sm); }
.btn-danger { color: #ff4444; }
.btn-danger:hover { border-color: #ff4444; }
```

---

### [TEST-1] Тестирование Sprint 4
**Агент:** TESTER
**Зависит от:** DEV-9
**Статус:** ⏳ Ожидает

**Что проверить:**

1. **Backend (curl):**
   - `PATCH /api/categories/1` без токена → `401`
   - `PATCH /api/categories/1` с токеном + `{name: "Новое имя"}` → `200` + обновлённый объект
   - `PATCH /api/categories/999` с токеном → `404`
   - `PATCH /api/categories/1` без `name` → `400`

2. **useAuth.js — код:**
   - `getAuthHeader()` возвращает `{ Authorization: 'Bearer ...' }`
   - `login()`, `logout()`, `isAuthenticated()` присутствуют

3. **useApi.js — код:**
   - `useAdminApi()` экспортирован
   - `createCategory`, `updateCategory`, `deleteCategory` присутствуют
   - `createProduct`, `deleteProduct`, `deleteProductsBulk` присутствуют
   - Все вызывают `apiFetch` с `getAuthHeader()`

4. **router/index.js — код:**
   - `router.beforeEach` присутствует
   - Проверяет `to.path.startsWith('/admin')` и `to.path !== '/admin/login'`
   - Вызывает `isAuthenticated()` и редиректит на `{name: 'login'}`

5. **LoginPage.vue — код:**
   - `v-model` на login и password input-ах
   - `handleSubmit` вызывает `login()` из `useAuth`
   - Ошибка отображается при невалидных данных
   - Redirect на `/admin` после успеха

6. **AdminPage.vue — код:**
   - `activeTab` ref + кнопки вкладок
   - `logout()` вызывается и редирект на `/admin/login`
   - `selectedIds` — массив, `allSelected` — computed
   - `deleteBulk` вызывает `deleteProductsBulk`
   - `v-if="toast.message"` toast-блок

Сохранить `TEST_REPORT_sprint4.md` в `/agent/10-30shop/tester/`

---

### [REVIEW-1] Финальное ревью Sprint 4
**Агент:** REVIEWER
**Зависит от:** TEST-1
**Статус:** ⏳ Ожидает

**Проверить через view_file (не верить отчётам):**

1. `backend/routes/categories.js` — `PATCH /:id` роут существует, `authMiddleware` применён
2. `useAuth.js` — `getAuthHeader()` добавлен
3. `useApi.js` — `useAdminApi()` с 6 методами, корректно использует `getAuthHeader()`
4. `router/index.js` — `beforeEach` guard существует, логика редиректа верна
5. `LoginPage.vue` — нет `@submit.prevent` без handler, `v-model` подключены, ошибка отображается
6. `AdminPage.vue` — нет хардкоженных данных, две вкладки, таблица с чекбоксами
7. Нет инлайн-стилей (`style=` отсутствует, кроме допустимых случаев)
8. Toast работает через `Transition`, не через `alert()`

Сохранить `REVIEW_REPORT_sprint4_v1.md` в `/agent/10-30shop/reviewer/`

---

## Статусы задач

| ID | Задача | Агент | Статус |
|----|--------|-------|--------|
| DEV-1 | Backend: `PATCH /api/categories/:id` | DEVELOPER | ✅ Готово |
| DEV-2 | `useAuth.js` — `getAuthHeader()` | DEVELOPER | ✅ Готово |
| DEV-3 | `useApi.js` — `useAdminApi()` с 6 методами | DEVELOPER | ✅ Готово |
| DEV-4 | Router `beforeEach` guard | DEVELOPER | ✅ Готово |
| DEV-5 | `LoginPage.vue` — реальная авторизация | DEVELOPER | ✅ Готово |
| DEV-6 | `AdminPage.vue` — структура двух вкладок + logout | DEVELOPER | ✅ Готово |
| DEV-7 | `AdminPage.vue` — вкладка «Категории» | DEVELOPER | ✅ Готово |
| DEV-8 | `AdminPage.vue` — вкладка «Товары» | DEVELOPER | ✅ Готово |
| DEV-9 | Toast-уведомления + CSS стили | DEVELOPER | ✅ Готово |
| TEST-1 | Тестирование Sprint 4 | TESTER | ✅ Готово |
| REVIEW-1 | Финальное ревью Sprint 4 | REVIEWER | ✅ Готово |

---

## Порядок агентов

```
DEV-1 (PATCH /api/categories/:id)  ─── независимо ───►

DEV-2 (useAuth getAuthHeader)
  └── DEV-3 (useAdminApi)
        ├── DEV-7 (Категории)
        └── DEV-8 (Товары)

DEV-4 (Route guard)
  └── DEV-5 (LoginPage логика)
        └── DEV-6 (AdminPage структура)
              ├── DEV-7
              └── DEV-8
                    └── DEV-9 (Toast + CSS)

Все DEV → TEST-1 → REVIEW-1
```

---

## Важные замечания для DEVELOPER

1. **`select` в форме товара** — категории берутся из уже загруженного `categories` ref (из вкладки категорий). Использовать общий state или подгрузить отдельно при монтировании вкладки товаров.

2. **`loadProducts` в AdminPage** — использовать `getProducts({limit: 100, offset: 0})` без пагинации. В публичном каталоге пагинация нужна, в админке — нет.

3. **`deleteProductsBulk`** — бэкенд `DELETE /api/products/bulk` принимает тело запроса `{ ids: [...] }`. HTTP DELETE с телом — корректно для REST, Express это поддерживает.

4. **Route guard и `useAuth`** — `useAuth()` вызывается внутри `beforeEach`, это не composable в Vue-смысле (не внутри `setup()`), но поскольку `getToken()` просто читает `localStorage` — это работает корректно.

5. **Редактирование категории** — inline редактирование (показывать input прямо в строке списка), не модальное окно. Брутализм не предполагает оверлеев.

6. **`select` стиль** — добавить `.input-underline` на `<select>`. Если класс не описывает `<select>` в `utilities.css` — добавить стиль в `<style scoped>` AdminPage.

---

*Версия: 1.0 | Sprint: 4 | Проект: 10:30 AM Shop*
