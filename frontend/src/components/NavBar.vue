<template>
  <!-- ─── NavBar ──────────────────────────────────────────────────────────────
       Editorial Brutalism: sticky, 64px высота, 1px нижняя граница.
       Desktop: лого слева, навигация справа (label-sm — uppercase).
       Mobile (<768px): лого слева, навигация скрыта (hamburger — Sprint 5).
       ─────────────────────────────────────────────────────────────────────── -->
  <header class="navbar">
    <div class="navbar__inner">
      <!-- Логотип -->
      <RouterLink to="/" class="navbar__logo" aria-label="На главную">
        <img src="/logo.png" alt="10:30 AM" class="navbar__logo-img" />
      </RouterLink>

      <!-- Навигация (скрыта на мобилке через .hide-mobile → display:none) -->
      <!-- aria-hidden синхронизирован с видимостью через CSS media (Sprint 5 добавит гамбургер) -->
      <nav class="navbar__nav hide-mobile" aria-label="Основная навигация">
        <RouterLink to="/catalog" class="navbar__link label-sm">
          Каталог
        </RouterLink>
        <!-- [РЕК-1 из ревью] exact — не подсвечивает ссылку как active на /catalog и других маршрутах -->
        <RouterLink to="/#about" class="navbar__link label-sm" exact>
          О нас
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup>
// NavBar: роутинг через RouterLink, «О нас» → якорь /#about
// Гамбургер для мобилки — Sprint 5
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

/* ─── Лого ───────────────────────────────────────────────────────────────── */
.navbar__logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.navbar__logo-img {
  height: 32px;
  width: auto;
  object-fit: contain;
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
