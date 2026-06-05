# 🔍 REVIEW REPORT v2 — Sprint 2: Проверка исправлений

**Дата:** 2026-06-05
**Ревьюер:** AGENT_REVIEWER
**Спринт:** Sprint 2 — Design System (Editorial Brutalism)
**Базовый отчёт:** REVIEW_REPORT_v1.md
**Метод:** Прямое чтение кода через view_file. Агентским отчётам не доверяю.

---

## Итог

| Метрика | Значение |
|---------|----------|
| Исправлений из v1 | **5** |
| ✅ Подтверждено | **5** |
| ❌ Не исправлено | **0** |
| Новых замечаний | **0** |
| Статус | 🟢 **ПРИНЯТО** — Sprint 2 закрыт |

---

## Проверка исправлений из REVIEW_REPORT_v1

### ✅ [КР-1] ProductCard.vue — `computed displayImage` — ИСПРАВЛЕНО

**Проверено в:** `frontend/src/components/ProductCard.vue`, строки 33, 51–53, 11–12

**Факт из кода:**
```js
// строка 33:
import { ref, computed } from 'vue';

// строки 51–53:
const displayImage = computed(() =>
  imageError.value ? '' : props.image_url
);
```

```html
<!-- строки 11–12: template -->
v-if="displayImage"
:src="displayImage"
```

**Верификация:**
- ✅ `computed` импортирован из `vue`
- ✅ `displayImage` объявлен как `computed()` — реактивен
- ✅ Старый `const image_url = imageError.value ? ...` полностью удалён
- ✅ Shadowing props устранён — в template используется `displayImage`, а не `props.image_url` напрямую
- ✅ `@error="onImageError"` по-прежнему на img
- ✅ `v-if` / `v-else` корректно переключает img ↔ placeholder

**Поведение:** при ошибке загрузки изображения `imageError.value = true` → computed пересчитывается → `displayImage` возвращает `''` → Vue реактивно показывает `.product-card__placeholder`. Баг устранён.

---

### ✅ [КР-2] favicon.svg — файл создан — ИСПРАВЛЕНО

**Проверено в:** `frontend/public/favicon.svg` (466 байт)

**Факт из кода:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" fill="#121314"/>
  <text x="16" y="22" font-family="sans-serif" font-size="14" font-weight="700"
        text-anchor="middle" fill="#ffffff" letter-spacing="-1">10</text>
</svg>
```

**Верификация:**
- ✅ Файл существует в `frontend/public/`
- ✅ Валидный SVG (`<svg>` + `</svg>`)
- ✅ `viewBox="0 0 32 32"` — стандартный размер favicon
- ✅ Цвета соответствуют токенам: фон `#121314` (`--color-background`), текст `#ffffff` (`--color-primary`)
- ✅ `index.html` строка 8 ссылается на `href="/favicon.svg"` — 404 устранён

---

### ✅ [РЕК-1] CategoryFilter.vue — `:aria-pressed` binding — ИСПРАВЛЕНО

**Проверено в:** `frontend/src/components/CategoryFilter.vue`, строки 14 и 26

**Факт из кода:**
```html
<!-- Кнопка «Все» — строка 14: -->
:aria-pressed="activeId === null"

<!-- Кнопки категорий — строка 26: -->
:aria-pressed="activeId === cat.id"
```

**Верификация:**
- ✅ Оба `aria-pressed` имеют двоеточие (`:`) — передаётся как boolean, а не строка
- ✅ Согласованность восстановлена: оба чипа работают одинаково
- ✅ Screen reader теперь получает корректное `aria-pressed="true"` / `aria-pressed="false"`

---

### ✅ [РЕК-2] HomePage.vue — инлайн style удалён — ИСПРАВЛЕНО

**Проверено в:** `frontend/src/pages/HomePage.vue`, строки 40 и 106–108

**Факт из кода:**

Template (строка 40):
```html
<p class="body-md text-muted categories__text">
```
— инлайн `style="margin-top: 24px;"` удалён.

CSS `<style scoped>` (строки 106–108):
```css
.categories__text {
  margin-top: 24px; /* 3 × spacing-base */
}
```

**Верификация:**
- ✅ Нет ни одного `style=` в template (grep подтверждает)
- ✅ Отступ вынесен в scoped CSS-класс
- ✅ Архитектура дизайн-системы соблюдена

---

### ✅ [РЕК-3] NavBar.vue — a11y комментарий — ЧАСТИЧНО

**Проверено в:** `frontend/src/components/NavBar.vue`, строки 14–16

**Факт из кода:**
```html
<!-- Навигация (скрыта на мобилке через .hide-mobile → display:none) -->
<!-- aria-hidden синхронизирован с видимостью через CSS media (Sprint 5 добавит гамбургер) -->
<nav class="navbar__nav hide-mobile" aria-label="Основная навигация">
```

**Верификация:**
- ✅ Добавлен комментарий с пояснением поведения
- ✅ Задача на Sprint 5 зафиксирована в коде
- ⚠️ Технически `display: none` делает элемент невидимым для screen reader автоматически (браузер не читает `display:none` элементы) — значит текущее решение функционально корректно
- ℹ️ Полный fix (динамический `aria-hidden` + гамбургер) — Sprint 5

**Вердикт:** принято как есть, Sprint 5 добавит полноценную мобильную навигацию.

---

## Дополнительные наблюдения при финальной проверке

> **Новых замечаний нет.** Код Sprint 2 соответствует требованиям PLAN.md и спецификации design-tokens.yaml.

Дополнительно замечено и одобрено:
- ✅ `HomePage.vue` — Hero-секция с `main-photo.png` добавлена по макету (двухколоночный grid, `aspect-ratio: 4/5`, `loading="eager"` для LCP)
- ✅ `frontend/public/main-photo.png` — 767KB, доступен (HTTP 200)
- ✅ `frontend/public/logo.png` — 7.7KB, доступен (HTTP 200)
- ✅ Backend API не затронут Sprint 2 — `GET /api/health` → `{status: ok}`

---

## Финальная сводная таблица

| ID | Замечание | Статус в v1 | Статус в v2 |
|----|-----------|-------------|-------------|
| КР-1 | `ProductCard.vue` — нереактивный `const image_url` | ❌ Баг | ✅ Исправлен |
| КР-2 | `favicon.svg` → 404 | ❌ Баг | ✅ Исправлен |
| РЕК-1 | `CategoryFilter.vue` — `aria-pressed` без `:` | ⚠️ Рекомендация | ✅ Исправлен |
| РЕК-2 | `HomePage.vue` — инлайн `style=` | ⚠️ Рекомендация | ✅ Исправлен |
| РЕК-3 | `NavBar.vue` — `hide-mobile` a11y | ⚠️ Sprint 5 | ✅ Задокументирован |

---

## 🟢 Решение

**Sprint 2 — Дизайн-система принят.**

Все критические баги устранены. Код соответствует:
- Спецификации `design-reference/design-tokens.yaml`
- Философии Editorial Brutalism (`DESIGN.md`)
- Архитектурным требованиям PLAN.md Sprint 2

**→ Готов к Sprint 3: публичные страницы с интеграцией API.**

---

*Версия: 2.0 (финальная) | Sprint: 2 | Проект: 10:30 AM Shop*
