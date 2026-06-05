# 📋 TASKS — Sprint 3: Публичные страницы

**Дата:** 2026-06-05
**Планировщик:** AGENT_PLANNER
**Фича:** Sprint 3 — Публичные страницы (HomePage + CatalogPage с реальным API)
**Статус:** 🔄 В работе

---

## Контекст

**Что уже есть (Sprint 1+2):**
- Backend API: `GET /api/categories`, `GET /api/products?limit=6&offset=0&category_id=N`
  - `products` возвращает `{ items: [...], total: N }`
  - `categories` возвращает `[{ id, name, image_url }]`
- Frontend: дизайн-система готова (`tokens.css`, `reset.css`, `typography.css`, `utilities.css`)
- Компоненты: `NavBar.vue`, `Footer.vue`, `ProductCard.vue`, `CategoryFilter.vue`
- Роутер: HTML5 history, 4 маршрута, `scrollBehavior` для якорей
- `HomePage.vue` — Hero-секция статическая (текст + `main-photo.png`), stub категорий
- `CatalogPage.vue` — демо с хардкоженными данными

**API base URL в dev:** `http://localhost:3001` (Docker network)  
**Во Vue:** нужен `composable useApi` или `fetch('/api/...')` через Vite proxy

**Важно — [РЕК-2 из ревью Sprint 1]:** В `GET /api/products`, если `category_id` не число → вернуть `400 Bad Request`. Сейчас `parseInt('abc') = NaN`, фильтрация тихо игнорируется.

---

## Порядок выполнения

### [DEV-1] Настроить Vite proxy для API (`/api` → `http://backend:3001`)
**Агент:** DEVELOPER
**Зависит от:** —
**Статус:** ⏳ Ожидает

Создать/обновить `frontend/vite.config.js`, добавить `server.proxy`:

```js
server: {
  proxy: {
    '/api': {
      target: 'http://backend:3001',  // имя сервиса в docker-compose
      changeOrigin: true,
    }
  }
}
```

**Зачем:** сейчас во Vue нужно писать полный URL `http://localhost:3001/api/...`. После proxy достаточно `/api/...`, что работает одинаково в dev и prod. Это устраняет CORS-проблемы в браузере.

**Внимание:** `target: 'http://backend:3001'` — это имя Docker-сервиса (не `localhost`). Vite работает внутри контейнера, где `localhost` = сам контейнер frontend, а `backend` = соседний контейнер по Docker network.

---

### [DEV-2] Создать composable `useApi.js` — централизованный HTTP-клиент
**Агент:** DEVELOPER
**Зависит от:** DEV-1
**Статус:** ⏳ Ожидает

Создать `frontend/src/composables/useApi.js`:

```js
// Базовая функция fetch с обработкой ошибок
export async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Готовые методы для публичных эндпоинтов
export function useApi() {
  const getCategories = () => apiFetch('/api/categories');

  const getProducts = ({ categoryId = null, limit = 6, offset = 0 } = {}) => {
    const params = new URLSearchParams({ limit, offset });
    if (categoryId !== null) params.set('category_id', categoryId);
    return apiFetch(`/api/products?${params}`);
  };

  return { getCategories, getProducts };
}
```

**Что обеспечивает:**
- Единая точка для всех API-запросов
- Корректная обработка ошибок (выбрасывает Error с текстом из бэкенда)
- Параметры в `getProducts` с дефолтами
- Sprint 4 расширит `useApi.js` методами для авторизации и admin-операций

---

### [DEV-3] Бэкенд: добавить валидацию `category_id` в `GET /api/products`
**Агент:** DEVELOPER
**Зависит от:** —
**Статус:** ⏳ Ожидает

**Файл:** `backend/routes/products.js`

**Сейчас (строка ~20):**
```js
const categoryId = req.query.category_id ? parseInt(req.query.category_id, 10) : null;
```
Если `category_id=abc` → `parseInt = NaN` → фильтрация тихо игнорируется.

**Исправление:**
```js
let categoryId = null;
if (req.query.category_id !== undefined) {
  categoryId = parseInt(req.query.category_id, 10);
  if (isNaN(categoryId)) {
    return res.status(400).json({ error: 'category_id должен быть числом' });
  }
}
```

Это закрывает **[РЕК-2 из ревью Sprint 1]** из PLAN.md.

---

### [DEV-4] `HomePage.vue` — динамическая сетка категорий из API
**Агент:** DEVELOPER
**Зависит от:** DEV-2
**Статус:** ⏳ Ожидает

Дополнить `HomePage.vue` — добавить секцию категорий с реальными данными из `GET /api/categories`.

**Структура секции:**
```
[— КАТЕГОРИИ —]
[Верхняя одежда] [Брюки] [Рубашки] [Аксессуары]
(сетка карточек категорий — клик → /catalog?category=N)
```

**Требования:**
- `const { getCategories } = useApi()` в `<script setup>`
- `onMounted` → вызов `getCategories()` → `categories` реактивный ref
- Каждая карточка категории: название + placeholder если `image_url = null`
- `image_url` из API (пока у всех `null` — показывать placeholder `var(--color-surface-container)`)
- Клик по карточке → `router.push({ path: '/catalog', query: { category: cat.id } })`
- Состояние загрузки: скелетоны или тихое ожидание
- Состояние ошибки: показать сообщение вместо сетки

**Сохранить Hero-секцию** (текст + `main-photo.png`) — не трогать.

---

### [DEV-5] `HomePage.vue` — якорная секция «О НАС»
**Агент:** DEVELOPER
**Зависит от:** DEV-4
**Статус:** ⏳ Ожидает

Добавить секцию с `id="about"` после сетки категорий:

```html
<section id="about" class="about container section">
  <p class="label-sm text-muted">О бренде</p>
  <h2 class="headline-lg">10:30 AM</h2>
  <p class="body-lg text-muted about__text">
    Мужская одежда без компромиссов. Минимум деталей — максимум характера.
    Каждая вещь спроектирована так, чтобы работать в любой ситуации.
  </p>
</section>
```

**Требования:**
- `id="about"` — якорный скролл по ссылке `/#about` из NavBar уже настроен в router
- Верхняя граница: `1px solid var(--color-outline-variant)` — отделяет от категорий

---

### [DEV-6] Обновить NavBar — ссылка «О НАС» → `/#about`
**Агент:** DEVELOPER
**Зависит от:** DEV-5
**Статус:** ⏳ Ожидает

В `NavBar.vue` ссылка «О нас» уже написана как `href="/#about"`. Проверить что работает корректно при навигации со страницы `/catalog`:

- Клик `/#about` с `/catalog` → переход на `/` + скролл к `#about` через `scrollBehavior` в роутере
- Если уже на `/` — просто скролл

**Возможная проблема:** `href="/#about"` — это не `RouterLink`, поэтому перезагрузит страницу при переходе со страниц с history mode. Исправить на `RouterLink to="/#about"`.

---

### [DEV-7] `CatalogPage.vue` — реальные данные из API + счётчик «N ПОЗИЦИЙ»
**Агент:** DEVELOPER
**Зависит от:** DEV-2
**Статус:** ⏳ Ожидает

Полностью переписать `CatalogPage.vue` — убрать хардкоженные демо-данные, подключить API.

**Логика:**
```js
const { getCategories, getProducts } = useApi();

const categories = ref([]);
const products   = ref([]);
const total      = ref(0);
const activeCategory = ref(null);  // null = все
const offset     = ref(0);
const limit      = 6;
const loading    = ref(false);
const error      = ref(null);

// Загрузка категорий (один раз при монтировании)
onMounted(async () => {
  categories.value = await getCategories();
  await loadProducts(true); // сброс = true → offset = 0
});

// Загрузка/догрузка товаров
async function loadProducts(reset = false) {
  if (reset) { offset.value = 0; products.value = []; }
  loading.value = true;
  try {
    const data = await getProducts({ categoryId: activeCategory.value, limit, offset: offset.value });
    products.value = reset ? data.items : [...products.value, ...data.items];
    total.value = data.total;
    offset.value += data.items.length;
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

// Смена фильтра → сброс offset
async function onCategorySelect(catId) {
  activeCategory.value = catId;
  await loadProducts(true);
}
```

**Template:**
- Заголовок `<h1>Каталог</h1>` + счётчик `<span class="label-sm text-muted">{{ total }} ПОЗИЦИЙ</span>`
- `CategoryFilter` с реальными категориями
- Сетка `ProductCard` с реальными данными
- Состояние загрузки (спиннер или текст «Загрузка...»)
- Состояние пустого результата: «Товаров не найдено»
- Состояние ошибки: показать `error`

---

### [DEV-8] `CatalogPage.vue` — кнопка «ПОКАЗАТЬ ЕЩЁ» (пагинация)
**Агент:** DEVELOPER
**Зависит от:** DEV-7
**Статус:** ⏳ Ожидает

Добавить кнопку под сеткой товаров:

```html
<div class="catalog__more" v-if="hasMore">
  <button class="btn-ghost" @click="loadProducts(false)" :disabled="loading">
    {{ loading ? 'Загрузка...' : 'Показать ещё' }}
  </button>
</div>
```

**Логика `hasMore`:**
```js
const hasMore = computed(() => offset.value < total.value);
```

**Правила:**
- Кнопка скрыта когда `!hasMore` (все товары уже загружены)
- При клике `loadProducts(false)` — добавляет товары к существующим (не сбрасывает)
- Пока `loading = true` — кнопка disabled + текст «Загрузка...»

---

### [DEV-9] `CatalogPage.vue` — обработка query-параметра `?category=N` (клик с главной)
**Агент:** DEVELOPER
**Зависит от:** DEV-7
**Статус:** ⏳ Ожидает

При переходе с главной (`/catalog?category=2`) — каталог должен открыться с уже применённым фильтром.

```js
import { useRoute } from 'vue-router';
const route = useRoute();

onMounted(async () => {
  categories.value = await getCategories();
  // Читаем query-параметр из URL
  const catFromUrl = route.query.category ? parseInt(route.query.category, 10) : null;
  if (catFromUrl && !isNaN(catFromUrl)) {
    activeCategory.value = catFromUrl;
  }
  await loadProducts(true);
});
```

**Что обеспечивает:**
- Ссылки с главной `/catalog?category=N` работают
- При прямом открытии `/catalog` без параметра — фильтр «Все»
- CategoryFilter визуально отображает активный чип

---

### [DEV-10] Состояние «товаров нет» — пустой каталог или фильтр
**Агент:** DEVELOPER
**Зависит от:** DEV-7
**Статус:** ⏳ Ожидает

Показать состояние «Товаров нет» когда `products.length === 0 && !loading`:

```html
<div v-if="products.length === 0 && !loading && !error" class="catalog__empty">
  <p class="headline-md">Товаров нет</p>
  <p class="body-lg text-muted">
    В этой категории пока нет товаров.
    <RouterLink to="/" class="text-primary">← На главную</RouterLink>
  </p>
</div>
```

**Стили:**
- Центрирован, `padding: 120px 0`
- Используется `headline-md` + `body-lg` из типографики
- Нет изображений, иконок — строгий Editorial Brutalism

---

### [DEV-11] Анимации: плавный переход сетки при смене фильтра
**Агент:** DEVELOPER
**Зависит от:** DEV-8
**Статус:** ⏳ Ожидает

При смене категории `products` обнуляются, потом заполняются новыми. Добавить плавный fade:

```html
<!-- Обернуть сетку в TransitionGroup -->
<TransitionGroup name="fade" tag="div" class="page-catalog__grid">
  <ProductCard v-for="product in products" :key="product.id" v-bind="product" />
</TransitionGroup>
```

```css
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
```

**Важно:** `TransitionGroup` требует уникального `:key` на каждом элементе (уже есть — `product.id`).

---

### [TEST-1] Тестирование — публичные страницы и API интеграция
**Агент:** TESTER
**Зависит от:** DEV-11
**Статус:** ⏳ Ожидает

**Что проверить:**

1. **API интеграция (curl):**
   - `GET /api/categories` → массив с реальными данными
   - `GET /api/products` → `{ items, total }`
   - `GET /api/products?category_id=1` → только товары категории 1
   - `GET /api/products?category_id=abc` → `400 Bad Request` (РЕК-2)
   - `GET /api/products?limit=2&offset=0` + `?limit=2&offset=2` → пагинация работает

2. **Vite proxy:**
   - `GET http://localhost:5173/api/health` → проксирует на backend → `{ status: ok }`

3. **Код HomePage.vue:**
   - `useApi()` импортирован и вызван
   - `onMounted` загружает категории
   - `id="about"` присутствует в секции «О нас»

4. **Код CatalogPage.vue:**
   - Нет хардкоженных `demoProducts` / `demoCategories`
   - `total` используется для счётчика
   - `hasMore` — computed, логика `offset < total`
   - `loadProducts(false)` — аккумулирует, не заменяет
   - `loadProducts(true)` — сбрасывает offset и products

5. **Query param:**
   - В коде: `route.query.category` читается при монтировании

6. **Пустое состояние:**
   - v-if на пустой список присутствует

Сохранить `TEST_REPORT_sprint3.md` в `/agent/10-30shop/tester/`

---

### [REVIEW-1] Финальное ревью Sprint 3
**Агент:** REVIEWER
**Зависит от:** TEST-1
**Статус:** ⏳ Ожидает

**Проверить через view_file (не верить отчётам):**

1. `vite.config.js` — proxy `/api` → `http://backend:3001` настроен
2. `composables/useApi.js` — `getCategories`, `getProducts` с URLSearchParams
3. `backend/routes/products.js` — валидация `category_id=abc` → `400`
4. `HomePage.vue` — нет хардкоженных данных, `onMounted` с `getCategories`, `id="about"` есть
5. `CatalogPage.vue` — нет `demoProducts`, `total`, `hasMore`, `loadProducts(reset)`, query param
6. `NavBar.vue` — ссылка «О нас» → `RouterLink` (не `href`)
7. Состояние ошибки и пустого каталога присутствуют

Сохранить `REVIEW_REPORT_sprint3_v1.md` в `/agent/10-30shop/reviewer/`

---

## Статусы задач

| ID | Задача | Агент | Статус |
|----|--------|-------|--------|
| DEV-1 | Vite proxy: `/api` → `http://backend:3001` | DEVELOPER | ✅ Готово |
| DEV-2 | `composables/useApi.js` — HTTP-клиент | DEVELOPER | ✅ Готово |
| DEV-3 | Backend: валидация `category_id` → `400` | DEVELOPER | ✅ Готово |
| DEV-4 | `HomePage.vue` — сетка категорий из API | DEVELOPER | ✅ Готово |
| DEV-5 | `HomePage.vue` — секция «О НАС» с `id="about"` | DEVELOPER | ✅ Готово |
| DEV-6 | `NavBar.vue` — «О нас» → `RouterLink` | DEVELOPER | ✅ Готово |
| DEV-7 | `CatalogPage.vue` — реальный API + счётчик | DEVELOPER | ✅ Готово |
| DEV-8 | `CatalogPage.vue` — кнопка «Показать ещё» | DEVELOPER | ✅ Готово |
| DEV-9 | `CatalogPage.vue` — query param `?category=N` | DEVELOPER | ✅ Готово |
| DEV-10 | Состояние «Товаров нет» | DEVELOPER | ✅ Готово |
| DEV-11 | Анимация `TransitionGroup` при смене фильтра | DEVELOPER | ✅ Готово |
| TEST-1 | Тестирование: API + интеграция + код | TESTER | ✅ Готово |
| REVIEW-1 | Финальное ревью Sprint 3 | REVIEWER | ✅ Готово |

---

## Порядок агентов

```
DEV-1 (Vite proxy)
  └── DEV-2 (useApi.js)
        ├── DEV-4 (HomePage: категории)
        │     └── DEV-5 (HomePage: «О нас»)
        │           └── DEV-6 (NavBar: RouterLink)
        └── DEV-7 (CatalogPage: реальный API)
              ├── DEV-8 («Показать ещё»)
              ├── DEV-9 (query param)
              └── DEV-10 (пустое состояние)
                    └── DEV-11 (анимации)

DEV-3 (Backend валидация) — параллельно, независимо

Все DEV → TEST-1 → REVIEW-1
```

---

*Версия: 1.0 | Sprint: 3 | Проект: 10:30 AM Shop*
