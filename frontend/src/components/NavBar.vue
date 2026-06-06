<template>
  <!-- ─── NavBar ──────────────────────────────────────────────────────────────
       Editorial Brutalism: sticky, 64px высота, 1px нижняя граница.
       Desktop: лого слева, навигация справа (label-sm — uppercase).
       Mobile (<768px): лого слева, навигация скрыта (hamburger — Sprint 5).
       ─────────────────────────────────────────────────────────────────────── -->
  <header class="navbar">
    <div class="navbar__inner">
      <!-- Логотип — текстовый [БАГ-6] -->
      <RouterLink to="/" class="navbar__logo" aria-label="На главную">
        10:30 AM
      </RouterLink>

      <!-- Навигация (скрыта на мобилке через .hide-mobile → display:none) -->
      <nav class="navbar__nav hide-mobile" aria-label="Основная навигация">
        <RouterLink to="/catalog" class="navbar__link label-sm">
          Каталог
        </RouterLink>
        <!-- [БАГ-4] scrollToAbout — программный скролл к секции #about -->
        <button class="navbar__link label-sm" @click="scrollToAbout">
          О нас
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// [БАГ-4] «О нас» → главная + скролл к секции #about
async function scrollToAbout() {
  if (router.currentRoute.value.path !== '/') {
    await router.push('/');
  }
  // Небольшая задержка чтобы DOM успел отрендериться после смены маршрута
  setTimeout(() => {
    const el = document.getElementById('about');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}
</script>

<style scoped>
/* ─── Обёртка ────────────────────────────────────────────────────────────── */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--navbar-height); /* 64px */
  background-color: var(--color-background);
  /* Ключевая граница — отделяет навбар от контента */
  border-bottom: 1px solid var(--color-outline-variant);
}

/* ─── Внутренний контейнер ──────────────────────────────────────────────── */
.navbar__inner {
  max-width: var(--container-max);
  height: 100%;
  margin: 0 auto;
  padding: 0 var(--spacing-margin-desktop);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ─── Лого (текстовый) [БАГ-6] ──────────────────────────────────────────── */
.navbar__logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  font-size: var(--fs-label-sm);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  color: var(--color-primary);
  text-decoration: none;
  font-family: inherit;
}

/* ─── Навигация ──────────────────────────────────────────────────────────── */
.navbar__nav {
  display: flex;
  align-items: center;
  gap: 40px;
}

.navbar__link {
  color: var(--color-on-surface-variant);
  transition: color var(--transition-default);
  /* Сброс для button-элемента (кнопка «О нас») */
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
}

/* Hover и активная ссылка → белый */
.navbar__link:hover,
.navbar__link.router-link-active {
  color: var(--color-primary);
}

/* ─── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .navbar__inner {
    padding: 0 var(--spacing-margin-mobile);
  }
}
</style>
