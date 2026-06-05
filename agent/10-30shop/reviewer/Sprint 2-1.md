# 🔍 REVIEW REPORT v1 — Sprint 2: Дизайн-система

**Дата:** 2026-06-05
**Ревьюер:** AGENT_REVIEWER
**Спринт:** Sprint 2 — Design System (Editorial Brutalism)
**Метод:** Прямое чтение кода через view_file. Отчётам агентов не верю.

---

## Итог

| Метрика | Значение |
|---------|----------|
| Критических замечаний | **2** |
| Некритических (рекомендации) | **3** |
| Статус | 🟡 **УСЛОВНО ПРИНЯТО** — требует исправления 2 багов |

---

## 🔴 Критические замечания (обязательно исправить)

### [КР-1] ProductCard.vue — `image_url` вычисляется неправильно, `@error` не работает

**Файл:** `frontend/src/components/ProductCard.vue`, строки 44–50

**Реальный код:**
```js
const imageError = ref(false);
function onImageError() {
  imageError.value = true;
}

// ← БАГИ ЗДЕСЬ:
const image_url = imageError.value ? '' : props.image_url;
```

**Проблема 1 — `const` вместо `computed`:**  
`image_url` объявлена как обычная `const` в момент инициализации компонента. `imageError.value` в момент инициализации всегда `false`, значит `image_url` всегда равно `props.image_url`. Когда пользователь потом устанавливает `imageError.value = true` — Vue не реагирует, потому что это не реактивная зависимость. `@error` обработчик вызывается, но визуально ничего не меняется — изображение остаётся.

**Проблема 2 — shadowing props:**  
В `<template>` используется `v-if="image_url"` — это ссылается на константу `const image_url`, а НЕ на `props.image_url`. Это теневое объявление (`shadowing`) — легко запутаться, и в будущем это вызовет баг при передаче `image_url: ''`.

**Правильное исправление:**
```js
import { ref, computed } from 'vue';

const props = defineProps({
  id:          { type: Number, required: true },
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  image_url:   { type: String, default: '' },
  category_id: { type: Number, required: true },
});

const imageError = ref(false);
function onImageError() {
  imageError.value = true;
}

// computed — реактивный, пересчитывается при изменении imageError
const displayImage = computed(() =>
  imageError.value ? '' : props.image_url
);
```

В template:
```html
<img v-if="displayImage" :src="displayImage" ... @error="onImageError" />
<div v-else class="product-card__placeholder" aria-hidden="true" />
```

---

### [КР-2] Favicon отсутствует — сломана ссылка в index.html

**Файл:** `frontend/index.html`, строка 8

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

`/favicon.svg` в `frontend/public/` не существует (проверено: `ls frontend/public/` — только `logo.png` и `main-photo.png`). Браузер делает 404 запрос на каждую загрузку страницы — это лишний 404 в консоли и отсутствие иконки вкладки.

**Исправление:** Создать `frontend/public/favicon.svg` (минималистичный SVG с текстом «10» или иконкой) или заменить на `href="/logo.png"` и `type="image/png"`.

---

## 🟡 Некритические замечания (рекомендации)

### [РЕК-1] CategoryFilter.vue — `aria-pressed` — статическая строка вместо динамического значения

**Файл:** `frontend/src/components/CategoryFilter.vue`, строка 14

```html
aria-pressed="activeId === null"
```

Без двоеточия это передаётся как строка `"activeId === null"`, а не как вычисленное булевое значение. Для корректной accessibility нужно:
```html
:aria-pressed="activeId === null"
```

То же на строке 26 — там двоеточие есть (`:`), то есть несогласованность внутри одного компонента.

---

### [РЕК-2] HomePage.vue — инлайн-стиль нарушает архитектуру дизайн-системы

**Файл:** `frontend/src/pages/HomePage.vue`, строка 40

```html
<p class="body-md text-muted" style="margin-top: 24px;">
```

Использование `style="margin-top: 24px;"` — прямое нарушение правила «нет инлайн-стилей» из DESIGN.md. Весь spacing должен идти через CSS-классы. Исправить: добавить CSS-класс `.categories__text { margin-top: 24px; }` в `<style scoped>` и применить его.

---

### [РЕК-3] NavBar.vue — скрытие навигации через `.hide-mobile` — семантически неверно

**Файл:** `frontend/src/components/NavBar.vue`, строка 15

```html
<nav class="navbar__nav hide-mobile" ...>
```

Класс `.hide-mobile` устанавливает `display: none !important`. Для `<nav>` это скрывает навигацию от screen reader на мобилке — плохо для a11y. Правильнее: использовать `aria-hidden="true"` при скрытии и иметь альтернативную мобильную навигацию (гамбургер), либо оставить `hide-mobile` но добавить `aria-hidden="true"` когда скрыто. Sprint 5 добавит гамбургер — рекомендую зафиксировать это в TASKS.md Sprint 5.

---

## ✅ Что проверено и принято без замечаний

### tokens.css (122 строки)
- ✅ Все цвета из `design-tokens.yaml` перенесены точно (hex-значения совпадают)
- ✅ Все 7 типографических шкал присутствуют с корректными значениями
- ✅ Spacing-переменные: `--spacing-base: 8px`, `--spacing-section-gap: 120px` ✅
- ✅ `--navbar-height: 64px` — кастомная переменная для layout ✅
- ✅ `--transition-default: 0.25s ease-in-out` — единый стандарт ✅

### reset.css (114 строк)
- ✅ `border-radius: 0 !important` на `*, *::before, *::after` — ключевое правило Editorial Brutalism
- ✅ `box-sizing: border-box` глобально ✅
- ✅ `body`: правильные font vars, `background-color`, `-webkit-font-smoothing: antialiased` ✅
- ✅ `img { object-fit: cover }` ✅
- ✅ Сброс `list-style`, `h1-h6`, `table` ✅
- ✅ Глобальный transition только на `a, button` (не на `*` — правильно, иначе layout transition) ✅

### typography.css (100 строк)
- ✅ Все 7 классов: `.headline-xl`, `.headline-xl-mobile`, `.headline-lg`, `.headline-md`, `.body-lg`, `.body-md`, `.label-sm`
- ✅ `.label-sm`: `text-transform: uppercase` + `letter-spacing: 0.1em` ✅
- ✅ `@media (max-width: 768px)` — `.headline-xl` автоматически уменьшается до 48px ✅
- ✅ Модификаторы цвета: `.text-muted`, `.text-primary`, `.text-error` ✅

### utilities.css (150 строк)
- ✅ `.container`: `max-width: var(--container-max)`, `padding: 0 var(--spacing-margin-desktop)`, responsive на 768px ✅
- ✅ `.btn-primary`: white bg → transparent hover (инверсия), uppercase label-sm, 14px 32px padding ✅
- ✅ `.btn-ghost`: transparent bg → white border hover ✅
- ✅ `.input-underline`: только нижняя граница, focus → white ✅
- ✅ `.divider`, `.section` ✅

### index.html
- ✅ `lang="ru"` ✅
- ✅ Google Fonts: `Inter:wght@400;600` + `Space+Grotesk:wght@700` + `display=swap` ✅
- ✅ Оба `preconnect` тега ✅

### main.js
- ✅ Порядок импортов CSS: tokens → reset → typography → utilities (критичный каскад соблюдён) ✅
- ✅ `use(router)` ✅

### NavBar.vue
- ✅ `position: sticky; top: 0; z-index: 100` ✅
- ✅ `height: var(--navbar-height)` ✅
- ✅ `border-bottom: 1px solid var(--color-outline-variant)` ✅
- ✅ RouterLink на лого, `aria-label="На главную"` ✅
- ✅ `label-sm` класс на nav-ссылках ✅
- ✅ `.router-link-active` → `color: var(--color-primary)` ✅
- ✅ Responsive: `padding-mobile` на 768px ✅

### Footer.vue
- ✅ `border-top: 1px solid var(--color-outline-variant)` ✅
- ✅ `label-sm` класс ✅
- ✅ `© 2026 10:30 AM. Все права защищены.` ✅
- ✅ Responsive: `flex-direction: column` на 768px ✅

### CategoryFilter.vue (за исключением РЕК-1)
- ✅ `defineProps`: categories + activeId ✅
- ✅ `defineEmits(['select'])` ✅
- ✅ Чип «Все» → `$emit('select', null)` ✅
- ✅ `.filter__chip--active`: `background-color: var(--color-primary)` ✅
- ✅ `overflow-x: auto; scrollbar-width: none` на мобилке ✅
- ✅ `role="group"` для a11y ✅

### ProductCard.vue (за исключением КР-1)
- ✅ `aspect-ratio: 4 / 5` ✅
- ✅ `overflow: hidden` + `scale(1.03)` hover ✅
- ✅ `loading="lazy"` ✅
- ✅ `<article>` семантика ✅
- ✅ `border: 1px solid var(--color-outline-variant)` ✅
- ✅ hover → `border-color: var(--color-primary)` ✅

### App.vue
- ✅ NavBar/RouterView/Footer — чистый layout ✅
- ✅ `min-height: calc(100vh - var(--navbar-height))` ✅
- ✅ Нет инлайн-стилей Sprint 0/1 ✅

### HomePage.vue (за исключением РЕК-2)
- ✅ Hero: двухколоночный grid 1fr/1fr ✅
- ✅ `main-photo.png` в контейнере `aspect-ratio: 4/5` ✅
- ✅ Responsive: 1 колонка на мобилке, фото сверху ✅
- ✅ `loading="eager"` для hero-изображения (правильно — LCP) ✅

### Public assets
- ✅ `frontend/public/logo.png` — 7.7KB ✅
- ✅ `frontend/public/main-photo.png` — 767KB ✅

---

## Сводная таблица

| ID | Файл | Тип | Статус |
|----|------|-----|--------|
| КР-1 | `ProductCard.vue` — `const image_url` не реактивен | 🔴 Критический | ❌ Требует исправления |
| КР-2 | `index.html` — `/favicon.svg` → 404 | 🔴 Критический | ❌ Требует исправления |
| РЕК-1 | `CategoryFilter.vue` — `aria-pressed` без `:` | 🟡 Некритический | ⚠️ Рекомендация |
| РЕК-2 | `HomePage.vue` — инлайн `style="margin-top"` | 🟡 Некритический | ⚠️ Рекомендация |
| РЕК-3 | `NavBar.vue` — `hide-mobile` + a11y | 🟡 Некритический | ⚠️ В Sprint 5 |

---

## Решение

**Разработчику исправить:**
1. `[КР-1]` — `ProductCard.vue`: заменить `const image_url` на `computed(() => ...)`, переименовать в `displayImage`, убрать shadowing.
2. `[КР-2]` — Создать `frontend/public/favicon.svg` или исправить тип на `image/png` и указать `logo.png`.
3. `[РЕК-1]` — `CategoryFilter.vue`: добавить `:` перед `aria-pressed` на кнопке «Все» (строка 14).
4. `[РЕК-2]` — `HomePage.vue`: убрать инлайн-стиль, перенести в `<style scoped>`.

---

*Версия: 1.0 | Sprint: 2 | Проект: 10:30 AM Shop*
