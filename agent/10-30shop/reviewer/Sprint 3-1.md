# 🔍 REVIEW REPORT v1 — Sprint 3: Публичные страницы

**Дата:** 2026-06-05
**Ревьюер:** AGENT_REVIEWER
**Спринт:** Sprint 3 — Public Pages (API integration)
**Метод:** Прямое чтение кода через view_file + runtime curl. Отчётам агентов не доверяю.

---

## Итог

| Метрика | Значение |
|---------|----------|
| Критических замечаний | **1** |
| Некритических (рекомендации) | **2** |
| Позитивных наблюдений | **7** |
| Статус | 🟡 **УСЛОВНО ПРИНЯТО** — 1 некритичный баг, требует исправления |

---

## 🔴 Замечания (нужно исправить)

### [КР-1] CatalogPage.vue строка 27 — инлайн `style=` нарушает архитектуру дизайн-системы

**Файл:** `frontend/src/pages/CatalogPage.vue:27`

**Реальный код:**
```html
<button class="btn-ghost" style="margin-top: 32px;" @click="loadProducts(true)">
  Попробовать снова
</button>
```

**Проблема:** Прямое нарушение правила «нет инлайн-стилей», зафиксированного в DESIGN.md и Sprint 2. Правило последовательно соблюдалось во всех предыдущих файлах — `HomePage.vue` чистый (проверено grep). Нарушение именно здесь выглядит как недосмотр.

**Исправление:** Добавить класс `.catalog__error-btn` в `<style scoped>`:
```css
.catalog__error-btn {
  margin-top: 32px;
}
```
Применить к button: `class="btn-ghost catalog__error-btn"`.

---

## 🟡 Рекомендации (некритично)

### [РЕК-1] NavBar.vue — `RouterLink to="/#about"` может вызвать проблему активного класса

**Файл:** `frontend/src/components/NavBar.vue:20`

**Реальный код:**
```html
<RouterLink to="/#about" class="navbar__link label-sm">О нас</RouterLink>
```

**Проблема:** Vue Router добавляет `.router-link-active` и `.router-link-exact-active` на RouterLink. При `to="/#about"` с текущим CSS:
```css
.navbar__link.router-link-active { color: var(--color-primary); }
```
Ссылка «О нас» будет постоянно подсвечена белым когда пользователь находится на `/` (главной странице), потому что `/#about` частично совпадает с маршрутом `/`. На `/catalog` ссылка не будет активна — это нормально.

**Не является блокером** — поведение функционально корректное, визуально незначительное (подсветка на главной — ожидаема). Рекомендуется добавить `exact` атрибут для точного совпадения: `<RouterLink to="/#about" exact>`.

---

### [РЕК-2] CatalogPage.vue — категории загружаются последовательно, а не параллельно

**Файл:** `frontend/src/pages/CatalogPage.vue:156–172`

**Реальный код:**
```js
onMounted(async () => {
  try {
    categories.value = await getCategories();  // ждём...
  } catch (e) { ... }

  // только потом читаем URL и грузим товары
  const catFromUrl = ...;
  await loadProducts(true);  // ждём...
});
```

**Проблема:** `getCategories()` и `loadProducts()` вызываются последовательно (`await` + `await`). Они полностью независимы — оба можно запустить параллельно через `Promise.all`. При плохом соединении это удваивает время первой загрузки страницы каталога.

**Исправление (Sprint 4):**
```js
onMounted(async () => {
  const catFromUrl = route.query.category ? parseInt(route.query.category, 10) : null;
  if (catFromUrl !== null && !isNaN(catFromUrl)) {
    activeCategory.value = catFromUrl;
  }

  // Параллельный запуск
  await Promise.all([
    getCategories().then(c => { categories.value = c; }).catch(e => console.error(e)),
    loadProducts(true),
  ]);
});
```

---

## ✅ Что проверено и принято без замечаний

### DEV-1: vite.config.js — proxy
```js
proxy: { '/api': { target: 'http://backend:3001', changeOrigin: true } }
```
- ✅ `host: '0.0.0.0'` — обязательно для Docker
- ✅ `target: 'http://backend:3001'` — Docker service name, не localhost
- ✅ `changeOrigin: true` — корректен для backend
- ✅ Runtime проверен: `GET localhost:5173/api/health` → 200 `{status: ok, project: "10:30 AM Shop"}`

---

### DEV-2: useApi.js — HTTP-клиент
- ✅ `export async function apiFetch` — именованный экспорт, доступен для тестирования
- ✅ `export function useApi()` — правильный паттерн composable
- ✅ `res.ok` проверка + `throw new Error(err.error || ...)` — правильная обработка ошибок
- ✅ `URLSearchParams` для построения query-строки — безопасно, не нужен ручной escape
- ✅ `if (categoryId !== null) params.set(...)` — `null` не попадает в запрос как `category_id=null`
- ✅ Дефолты `limit=6, offset=0` — соответствуют backend дефолтам
- ✅ `apiFetch` читает `.error` из JSON при ошибке и fallback на `statusText`

---

### DEV-3: backend/routes/products.js — валидация category_id (строки 22–28)
```js
let categoryId = null;
if (req.query.category_id !== undefined) {
  categoryId = parseInt(req.query.category_id, 10);
  if (isNaN(categoryId)) {
    return res.status(400).json({ error: 'category_id должен быть целым числом' });
  }
}
```
- ✅ `undefined` check — не срабатывает когда параметр не передан
- ✅ `parseInt(..., 10)` с явным radix=10
- ✅ `isNaN` проверка после parseInt
- ✅ `400 Bad Request` с корректным сообщением
- ✅ Runtime: `?category_id=abc` → `{"error":"category_id должен быть целым числом"}` 400
- ✅ Runtime: `?category_id=1.5` → 200 (parseInt('1.5')=1 — корректно)
- ✅ Строка 34: `if (categoryId !== null && !isNaN(categoryId))` — дублирующая проверка безвредна

---

### DEV-4+5: HomePage.vue — категории из API + «О НАС»
- ✅ `useApi()` импортирован, `getCategories` деструктурирован
- ✅ `onMounted` с async/await, try/catch/finally
- ✅ `categoriesLoading = ref(true)` — инициализирован в `true` (правильно: skeleton виден сразу)
- ✅ `categoriesError = ref(false)` 
- ✅ `v-if="categoriesLoading"` → skeleton (4 анимированных placeholder 3:4)
- ✅ `v-else-if="categoriesError"` → текст ошибки
- ✅ `v-else` → реальная сетка (4 колонки desktop, 2 tablet, 1 mobile)
- ✅ `cat.image_url` → img или placeholder div — правильная обработка `null`
- ✅ `goToCatalog(cat.id)` → `router.push({ path: '/catalog', query: { category: cat.id } })`
- ✅ `id="about"` на секции — якорь работает через `scrollBehavior` роутера
- ✅ Hero-секция сохранена: `main-photo.png`, `headline-xl`, `btn-primary`
- ✅ Нет инлайн-стилей (grep: чисто)
- ✅ `useRouter` импортирован (нужен для `router.push`)

---

### DEV-6: NavBar.vue — RouterLink «О нас»
- ✅ `<RouterLink to="/#about">` — НЕ `<a href>` (SPA-навигация без перезагрузки)
- ✅ `<a href="/#about">` отсутствует (grep подтверждает)

---

### DEV-7-11: CatalogPage.vue — полная интеграция
- ✅ Нет `demoProducts`, нет `demoCategories` — хардкод полностью убран
- ✅ `const LIMIT = 6` — константа, не магическое число
- ✅ `hasMore = computed(() => offset.value < total.value)` — правильная реактивная логика
- ✅ `loadProducts(true)` — сброс `offset=0`, `products=[]`, `error=null`
- ✅ `loadProducts(false)` — `[...products.value, ...data.items]` — immutable spread (правильно)
- ✅ `offset.value += data.items.length` — накапливается корректно
- ✅ `onCategorySelect` → `activeCategory.value = catId` + `loadProducts(true)` — фильтр работает
- ✅ `route.query.category` + `parseInt` + `isNaN` — query-param обработан
- ✅ Skeleton: `v-else-if="loading && products.length === 0"` — показывается только при первой загрузке (не при «показать ещё»)
- ✅ Пустой каталог: `v-else-if="products.length === 0 && !loading"` + кнопка «Смотреть все» → `onCategorySelect(null)`
- ✅ `TransitionGroup name="catalog-fade" tag="div"` + CSS `.catalog-fade-enter-active` ✅
- ✅ Кнопка «Показать ещё»: `v-if="hasMore && !error"`, `:disabled="loading"`, текст меняется
- ✅ Счётчик `{{ total }} ПОЗИЦИЙ` с `label-sm text-muted`
- ✅ Responsive: 3→2→1 колонки (`1024px`, `600px`)
- ✅ `aria-hidden="true"` на skeleton-элементах

---

### useAuth.js (бонус)
- ✅ Существует в `composables/` — stub для Sprint 4
- ✅ `login()`, `logout()`, `getToken()`, `isAuthenticated()` объявлены
- ✅ `localStorage` для хранения токена — стандарт для SPA

---

## Сводная таблица

| ID | Файл | Тип | Статус |
|----|------|-----|--------|
| **КР-1** | `CatalogPage.vue:27` — `style="margin-top: 32px"` | 🔴 Нарушение стандарта | ❌ Исправить |
| **РЕК-1** | `NavBar.vue:20` — `router-link-active` на `/#about` | 🟡 Поведение | ⚠️ Мелкая UX-деталь |
| **РЕК-2** | `CatalogPage.vue:156` — последовательные await | 🟡 Производительность | ⚠️ Sprint 4 |

---

## Решение

**Разработчику исправить до закрытия Sprint 3:**
1. `[КР-1]` — `CatalogPage.vue:27`: убрать `style="margin-top: 32px"`, добавить `.catalog__error-btn { margin-top: 32px }` в `<style scoped>`.

**Sprint 4 учесть:**
2. `[РЕК-2]` — `CatalogPage.vue`: `Promise.all([getCategories, loadProducts])` вместо последовательных await.
3. `[РЕК-1]` — При необходимости добавить `exact` к RouterLink «О нас».

---

*Версия: 1.0 | Sprint: 3 | Проект: 10:30 AM Shop*
