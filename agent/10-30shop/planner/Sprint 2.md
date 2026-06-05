# 📋 TASKS — Sprint 2: Дизайн-система

**Дата:** 2026-06-05
**Планировщик:** AGENT_PLANNER
**Фича:** Sprint 2 — Дизайн-система (Editorial Brutalism)
**Статус:** 🔄 В работе

---

## Контекст

**Стиль:** Editorial Brutalism — монохромная палитра, нулевые радиусы, Sharp shapes 0px, 1px границы.
**Источники:**
- `design-reference/design-tokens.yaml` — цвета, типографика, отступы
- `design-reference/main/DESIGN.md` — философия дизайна и описание компонентов
- `design-reference/main/screen.png` — макет главной страницы
- `design-reference/main/code.html` — HTML-код главной из Stitch
- `design-reference/catalog/screen.png` — макет каталога
- `design-reference/catalog/code.html` — HTML-код каталога из Stitch
- `design-reference/logo/logo.png` — логотип магазина
- `design-reference/logo/main-photo.png` — Hero-фото

**Ключевые правила дизайна (из DESIGN.md):**
- Все углы строго 0px (никаких border-radius)
- 1px solid границы (`#444748` = outline-variant)
- Hover: переход границы в `#ffffff`, transition 0.25s ease-in-out
- Шрифты: Space Grotesk (700) для заголовков, Inter (400/600) для текста
- Spacing: кратно 8px. Gutter: 24px. Desktop margin: 64px. Mobile: 24px
- Section gap: 120px между секциями
- Глубина — через тональные слои (tonal layering), НЕ через тени

---

## Порядок выполнения

### [DEV-1] Создать `frontend/src/styles/tokens.css` — CSS-переменные из design-tokens.yaml
**Агент:** DEVELOPER
**Зависит от:** —
**Статус:** ⏳ Ожидает

Создать файл `frontend/src/styles/tokens.css` со всеми CSS-переменными из `design-reference/design-tokens.yaml`.

**Что включить:**

```css
/* Цвета */
--color-surface: #121314;
--color-surface-dim: #121314;
--color-surface-bright: #393939;
--color-surface-container-lowest: #0d0e0f;
--color-surface-container-low: #1b1c1c;
--color-surface-container: #1f2020;
--color-surface-container-high: #292a2a;
--color-surface-container-highest: #343535;
--color-on-surface: #e4e2e2;
--color-on-surface-variant: #c4c7c8;
--color-outline: #8e9192;
--color-outline-variant: #444748;
--color-primary: #ffffff;
--color-on-primary: #2f3131;
--color-error: #ffb4ab;
--color-background: #121314;
--color-on-background: #e4e2e2;

/* Типографика — headline-xl */
--font-size-headline-xl: 80px;
--font-weight-headline-xl: 700;
--line-height-headline-xl: 1.0;
--letter-spacing-headline-xl: -0.04em;

/* Типографика — headline-xl-mobile */
--font-size-headline-xl-mobile: 48px;

/* Типографика — headline-lg */
--font-size-headline-lg: 48px;
--font-weight-headline-lg: 700;
--line-height-headline-lg: 1.1;
--letter-spacing-headline-lg: -0.02em;

/* Типографика — headline-md */
--font-size-headline-md: 24px;
--font-weight-headline-md: 600;
--line-height-headline-md: 1.2;
--letter-spacing-headline-md: -0.01em;

/* Типографика — body-lg */
--font-size-body-lg: 18px;
--font-weight-body-lg: 400;
--line-height-body-lg: 1.6;
--letter-spacing-body-lg: 0.01em;

/* Типографика — body-md */
--font-size-body-md: 16px;
--line-height-body-md: 1.5;

/* Типографика — label-sm */
--font-size-label-sm: 12px;
--font-weight-label-sm: 600;
--line-height-label-sm: 1;
--letter-spacing-label-sm: 0.1em;

/* Spacing */
--spacing-base: 8px;
--spacing-gutter: 24px;
--spacing-margin-desktop: 64px;
--spacing-margin-mobile: 24px;
--spacing-section-gap: 120px;
--container-max: 1440px;

/* Transitions */
--transition-default: 0.25s ease-in-out;
```

---

### [DEV-2] Создать `frontend/src/styles/reset.css` — глобальный сброс и базовые стили
**Агент:** DEVELOPER
**Зависит от:** DEV-1
**Статус:** ⏳ Ожидает

Создать `frontend/src/styles/reset.css`:

- `box-sizing: border-box` для всего
- `margin: 0; padding: 0` глобально
- `border-radius: 0` везде (ключевое правило Editorial Brutalism)
- `body`: `background: var(--color-background)`, `color: var(--color-on-surface)`, `font-family: 'Inter', system-ui, sans-serif`
- `a`: `color: inherit; text-decoration: none`
- `img`: `display: block; max-width: 100%; object-fit: cover`
- `button`: `cursor: pointer; border: none; background: none; font: inherit`
- `input, textarea`: `font: inherit; border: none; outline: none; background: transparent`
- `*`: `transition: border-color var(--transition-default), color var(--transition-default)`

---

### [DEV-3] Создать `frontend/src/styles/typography.css` — CSS-классы типографики
**Агент:** DEVELOPER
**Зависит от:** DEV-1
**Статус:** ⏳ Ожидает

Создать `frontend/src/styles/typography.css` с утилитарными классами:

```css
/* По токенам из design-tokens.yaml */
.headline-xl      { font-family: 'Space Grotesk'; font-size: var(--font-size-headline-xl); ... }
.headline-xl-mobile { /* 48px на мобилке */ }
.headline-lg      { /* 48px */ }
.headline-md      { /* 24px */ }
.body-lg          { /* 18px Inter */ }
.body-md          { /* 16px Inter */ }
.label-sm         { /* 12px Inter 600, text-transform: uppercase, letter-spacing: 0.1em */ }
```

**Важно:** `.label-sm` всегда uppercase (как ярлык на одежде — промышленный тег).

---

### [DEV-4] Подключить Google Fonts и импортировать все CSS в `main.js`
**Агент:** DEVELOPER
**Зависит от:** DEV-1, DEV-2, DEV-3
**Статус:** ⏳ Ожидает

**В `frontend/index.html`** добавить в `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
```

**В `frontend/src/main.js`** добавить импорты в правильном порядке:
```js
import './styles/tokens.css'
import './styles/reset.css'
import './styles/typography.css'
```

**Удалить** инлайн-стили из `App.vue` (они уже перенесены в reset.css).

---

### [DEV-5] Реализовать компонент `NavBar.vue` по макету
**Агент:** DEVELOPER
**Зависит от:** DEV-4
**Статус:** ⏳ Ожидает

Переписать `frontend/src/components/NavBar.vue` по макету `design-reference/main/screen.png` и `main/code.html`.

**Структура:**
```
[ЛОГО]                    [КАТАЛОГ]  [О НАС]
```

**Требования:**
- Высота: 64px (8 × spacing-base)
- Горизонтальные отступы: `var(--spacing-margin-desktop)` (64px desktop / 24px mobile)
- Нижняя граница: `1px solid var(--color-outline-variant)` — разделяет навбар от контента
- Лого: `<img>` из `design-reference/logo/logo.png` (скопировать в `frontend/public/logo.png`)
- Навигация: `.label-sm` класс (uppercase, Inter 600, 12px, 0.1em spacing)
- Ссылки: `RouterLink` с hover → `color: var(--color-primary)` (transition 0.25s)
- Position: sticky top 0, `z-index: 100`, `background: var(--color-background)`
- Мобилка (< 768px): лого слева, навигация скрыта (hamburger — в следующих спринтах)

---

### [DEV-6] Реализовать компонент `Footer.vue` по макету
**Агент:** DEVELOPER
**Зависит от:** DEV-4
**Статус:** ⏳ Ожидает

Переписать `frontend/src/components/Footer.vue` по макету.

**Требования:**
- Верхняя граница: `1px solid var(--color-outline-variant)`
- Padding: 48px сверху и снизу
- Горизонтальные отступы: `var(--spacing-margin-desktop)` / mobile: 24px
- Содержимое: лого (или текст «10:30 AM») слева, копирайт `© 2026` справа
- Цвет текста: `var(--color-on-surface-variant)` (приглушённый)
- Класс типографики: `.label-sm`

---

### [DEV-7] Реализовать компонент `ProductCard.vue` по макету каталога
**Агент:** DEVELOPER
**Зависит от:** DEV-4
**Статус:** ⏳ Ожидает

Переписать `frontend/src/components/ProductCard.vue` по макету `design-reference/catalog/screen.png` и `catalog/code.html`.

**Props:**
```js
props: {
  id: Number,
  name: String,
  description: String,
  image_url: String,
  category_id: Number
}
```

**Требования:**
- Контейнер: `1px solid var(--color-outline-variant)`, `border-radius: 0`
- Изображение: занимает 100% ширины, соотношение сторон 4:5 (portrait), `object-fit: cover`
- Hover на карточке: изображение scale(1.03) с `overflow: hidden` на контейнере (clip по краю)
- Подпись: padding 16px, название `.headline-md`, описание `.body-md` `var(--color-on-surface-variant)`
- Если `image_url` не загрузилось — показать placeholder с `background: var(--color-surface-container)`
- Transition: `transition: transform 0.25s ease-in-out` на img

---

### [DEV-8] Реализовать компонент `CategoryFilter.vue` по макету
**Агент:** DEVELOPER
**Зависит от:** DEV-4
**Статус:** ⏳ Ожидает

Переписать `frontend/src/components/CategoryFilter.vue` по макету каталога.

**Props:**
```js
props: {
  categories: Array,    // [{ id, name }]
  activeId: Number      // активная категория (null = все)
}
emits: ['select']       // emit('select', categoryId)
```

**Требования:**
- Чип «ВСЕ» — всегда первый, при клике `emit('select', null)`
- Чипы: rectangular (0px radius), `1px solid var(--color-outline-variant)`, padding `8px 16px`
- Текст чипа: `.label-sm` (uppercase, 12px, 0.1em spacing)
- Активный чип: `background: var(--color-primary)`, `color: var(--color-on-primary)`, border white
- Неактивный hover: `border-color: var(--color-primary)`, transition 0.25s
- Layout: flex wrap, gap 8px
- Мобилка: горизонтальный скролл без переноса (`overflow-x: auto`)

---

### [DEV-9] Обновить `App.vue` — layout-обёртка с sticky navbar и flex-колонкой
**Агент:** DEVELOPER
**Зависит от:** DEV-5, DEV-6
**Статус:** ⏳ Ожидает

Обновить `frontend/src/App.vue`:

```vue
<template>
  <NavBar />
  <main class="app-main">
    <RouterView />
  </main>
  <Footer />
</template>
```

**CSS для `.app-main`:**
- `min-height: calc(100vh - 64px - footer-height)` — контент не «прыгает»
- `padding: 0` — внутренние страницы сами управляют своими отступами

**Убрать** все инлайн-стили Sprint 0/1 — они заменены системой.

---

### [DEV-10] Создать `frontend/src/styles/utilities.css` — вспомогательные классы
**Агент:** DEVELOPER
**Зависит от:** DEV-1
**Статус:** ⏳ Ожидает

Создать файл с переиспользуемыми вспомогательными классами:

```css
/* Контейнер с максимальной шириной и авто-отступами */
.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--spacing-margin-desktop);
}

/* Кнопка Primary */
.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: 12px 32px;
  border: 1px solid var(--color-primary);
  font-family: 'Inter'; font-size: 12px; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  cursor: pointer; transition: 0.25s ease-in-out;
}
.btn-primary:hover { background: transparent; color: var(--color-primary); }

/* Кнопка Ghost */
.btn-ghost {
  background: transparent;
  color: var(--color-on-surface);
  padding: 12px 32px;
  border: 1px solid var(--color-outline-variant);
  /* аналогично btn-primary */
}
.btn-ghost:hover { border-color: var(--color-primary); color: var(--color-primary); }

/* Divider */
.divider { height: 1px; background: var(--color-outline-variant); }

/* Responsive */
@media (max-width: 768px) {
  .container { padding: 0 var(--spacing-margin-mobile); }
  .hide-mobile { display: none; }
}
```

---

### [DEV-11] Обновить stub-страницы — применить layout-классы
**Агент:** DEVELOPER
**Зависит от:** DEV-9, DEV-10
**Статус:** ⏳ Ожидает

Обновить все 4 stub-страницы в `frontend/src/pages/` чтобы они использовали дизайн-систему:

- Обернуть содержимое в `<div class="container">`
- Добавить `<h1 class="headline-xl">` с названием страницы
- Добавить `<p class="body-lg">` с описанием что будет в следующем спринте
- Sprint 3 и 4 наполнят страницы реальным контентом

**Цель:** убедиться что дизайн-система визуально работает на всех маршрутах.

---

### [DEV-12] Проверить responsive layout на мобилке
**Агент:** DEVELOPER
**Зависит от:** DEV-5, DEV-6, DEV-7, DEV-8, DEV-10, DEV-11
**Статус:** ⏳ Ожидает

Проверить все компоненты в DevTools (375px и 768px):

- NavBar: лого видно, навигация адаптирована (или скрыта)
- Footer: не ломается на узком экране
- `.container` padding: 64px desktop → 24px mobile
- `CategoryFilter`: горизонтальный скролл без overflow
- `ProductCard`: занимает полную ширину на мобилке

Исправить все видимые проблемы адаптивности.

---

### [TESTER-1] Визуальная и функциональная проверка дизайн-системы
**Агент:** TESTER
**Зависит от:** DEV-12
**Статус:** ⏳ Ожидает

**Что проверить через браузер (`localhost:5173`):**

1. **Шрифты подключены** — Space Grotesk виден в заголовках, Inter в тексте (DevTools → Network → Fonts)
2. **CSS-переменные** — в DevTools Elements открыть `:root` → видны `--color-*`, `--font-size-*`
3. **NavBar** — sticky при скролле, 1px нижняя граница, лого отображается, ссылки работают
4. **Footer** — 1px верхняя граница, содержимое на месте
5. **ProductCard** — рендерится с border, hover → image scale, 0px radius
6. **CategoryFilter** — чипы uppercase, активный = белый фон, hover работает
7. **Маршрутизация** — `/`, `/catalog`, `/admin`, `/admin/login` → все открываются корректно
8. **Мобилка 375px** — нет горизонтального overflow, container padding = 24px
9. **Нет border-radius** нигде (ни на одном элементе)
10. **Нет теней** (box-shadow) нигде — глубина только через tonal layering

Сохранить `TEST_REPORT.md` в `/agent/10-30shop/tester/TEST_REPORT_sprint2.md`

---

### [REVIEW-1] Финальное ревью Sprint 2
**Агент:** REVIEWER
**Зависит от:** TESTER-1
**Статус:** ⏳ Ожидает

**Проверить через view_file (не верить отчётам):**

1. `frontend/src/styles/tokens.css` — все переменные из design-tokens.yaml присутствуют
2. `frontend/src/styles/reset.css` — `border-radius: 0` везде, глобальный сброс корректен
3. `frontend/src/styles/typography.css` — все 6 классов (headline-xl, headline-xl-mobile, headline-lg, headline-md, body-lg, body-md, label-sm)
4. `frontend/src/styles/utilities.css` — `.container`, `.btn-primary`, `.btn-ghost`, `.divider`, responsive
5. `frontend/index.html` — подключение Google Fonts в `<head>`
6. `frontend/src/main.js` — импорты CSS в правильном порядке
7. `NavBar.vue` — sticky, 1px border-bottom, RouterLink, responsive
8. `Footer.vue` — 1px border-top, копирайт
9. `ProductCard.vue` — props типизированы, hover на img, 0px radius
10. `CategoryFilter.vue` — emit('select'), активный чип, mobile scroll

Сохранить отчёт в `/agent/10-30shop/reviewer/REVIEW_REPORT_sprint2_v1.md`

---

## Статусы задач

| ID | Задача | Агент | Статус |
|----|--------|-------|--------|
| DEV-1 | CSS-переменные из design-tokens.yaml → `tokens.css` | DEVELOPER | ✅ Готово |
| DEV-2 | Глобальный сброс стилей → `reset.css` | DEVELOPER | ✅ Готово |
| DEV-3 | Классы типографики → `typography.css` | DEVELOPER | ✅ Готово |
| DEV-4 | Google Fonts в index.html + импорты CSS в main.js | DEVELOPER | ✅ Готово |
| DEV-5 | `NavBar.vue` — sticky, лого, nav-ссылки, 1px border | DEVELOPER | ✅ Готово |
| DEV-6 | `Footer.vue` — 1px border-top, копирайт | DEVELOPER | ✅ Готово |
| DEV-7 | `ProductCard.vue` — border, 4:5 image, hover scale | DEVELOPER | ✅ Готово |
| DEV-8 | `CategoryFilter.vue` — чипы, active state, emit | DEVELOPER | ✅ Готово |
| DEV-9 | `App.vue` — layout-обёртка, убрать inline-стили | DEVELOPER | ✅ Готово |
| DEV-10 | `utilities.css` — `.container`, `.btn-primary`, `.btn-ghost` | DEVELOPER | ✅ Готово |
| DEV-11 | Stub-страницы: применить `.container`, `.headline-xl` | DEVELOPER | ✅ Готово |
| DEV-12 | Responsive проверка — 375px / 768px | DEVELOPER | ✅ Готово |
| TESTER-1 | Визуальная и функциональная проверка в браузере | TESTER | ✅ Готово |
| REVIEW-1 | Финальное ревью Sprint 2 | REVIEWER | ✅ Готово |

---

## Порядок агентов

```
DEV-1 (tokens)
  ├── DEV-2 (reset)    ──┐
  ├── DEV-3 (typography)─┤
  └── DEV-10 (utilities)─┤
                         ↓
                     DEV-4 (fonts + import CSS)
                         ↓
         ┌───────────────┬───────────────┬──────────────┐
         ↓               ↓               ↓              ↓
      DEV-5 (Navbar)  DEV-6 (Footer)  DEV-7 (Card)  DEV-8 (Filter)
         └───────────────┘               │              │
                 ↓                       └──────────────┘
            DEV-9 (App.vue)                    ↓
                 ↓                        DEV-11 (Stubs)
            DEV-11 (Stubs)                     ↓
                 └──────────────────→    DEV-12 (Responsive)
                                               ↓
                                          TESTER-1
                                               ↓
                                          REVIEW-1
```

---

*Версия: 1.0 | Sprint: 2 | Проект: 10:30 AM Shop*
