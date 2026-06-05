<template>
  <div class="page-home">
    <!-- ─── Hero Section ──────────────────────────────────────────────────────
         Слева: заголовок + подзаголовок + CTA.
         Справа: Hero-фото из design-reference/logo/main-photo.png.
         По макету design-reference/main/screen.png
         ─────────────────────────────────────────────────────────────────────── -->
    <section class="hero container">
      <!-- Левая колонка: текст -->
      <div class="hero__text">
        <h1 class="headline-xl hero__title">
          Одевайся<br />как ты<br />живёшь.
        </h1>
        <p class="body-lg text-muted hero__subtitle">
          Мужская одежда. Минимум лишнего.
        </p>
        <RouterLink to="/catalog" class="btn-primary hero__cta">
          Смотреть коллекцию
        </RouterLink>
      </div>

      <!-- Правая колонка: Hero-фото -->
      <div class="hero__image-wrap">
        <img
          src="/main-photo.png"
          alt="10:30 AM — коллекция"
          class="hero__image"
          loading="eager"
        />
      </div>
    </section>

    <div class="divider"></div>

    <!-- ─── Категории placeholder ─────────────────────────────────────────────
         Sprint 3 заменит на реальные категории из API.
         ─────────────────────────────────────────────────────────────────────── -->
    <section class="categories container section">
      <p class="label-sm text-muted categories__label">— Категории —</p>
      <p class="body-md text-muted categories__text">
        Sprint 3 добавит сетку категорий с фото из API.
      </p>
    </section>
  </div>
</template>

<script setup>
// Sprint 3 наполнит реальным контентом:
// - Hero-секция с динамическим текстом
// - Сетка категорий из GET /api/categories
// - Секция «О нас» с якорем /#about
</script>

<style scoped>
/* ─── Hero: двухколоночный layout ────────────────────────────────────────── */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 80px;
  padding-top: var(--spacing-section-gap);
  padding-bottom: var(--spacing-section-gap);
}

/* ─── Левая колонка: текст ───────────────────────────────────────────────── */
.hero__text {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.hero__title {
  /* headline-xl задаёт шрифт, размер и tracking через глобальный класс */
}

.hero__subtitle {
  max-width: 320px;
}

.hero__cta {
  align-self: flex-start; /* кнопка не растягивается на всю ширину */
}

/* ─── Правая колонка: изображение ────────────────────────────────────────── */
.hero__image-wrap {
  /* Фиксируем соотношение 4:5 как у ProductCard — fashion portrait */
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background-color: var(--color-surface-container);
  border: 1px solid var(--color-outline-variant);
  /* Нет border-radius — Editorial Brutalism */
}

.hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ─── Категории placeholder ──────────────────────────────────────────────── */
.categories__label {
  /* label-sm: 12px, uppercase, 0.1em spacing — управляется через глобальный класс */
}

.categories__text {
  margin-top: 24px; /* 3 × spacing-base */
}

/* ─── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 40px;
    padding-top: 64px;
    padding-bottom: 64px;
  }

  /* На мобилке фото идёт ПЕРВЫМ (сверху), текст снизу */
  .hero__image-wrap {
    order: -1;
  }

  .hero__cta {
    align-self: stretch;
    text-align: center;
    justify-content: center;
  }
}
</style>
