<template>
  <div class="page-home">

    <!-- ─── Hero Section ─────────────────────────────────────────────────────────
         Левая колонка: заголовок + подзаголовок + CTA.
         Правая колонка: main-photo.png в portrait-контейнере 4:5.
         ─────────────────────────────────────────────────────────────────────── -->
    <section class="hero container">
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

    <!-- ─── Категории из API ───────────────────────────────────────────────────── -->
    <section class="categories container section">
      <p class="label-sm text-muted categories__label">— Категории —</p>

      <!-- Загрузка -->
      <div v-if="categoriesLoading" class="categories__skeleton">
        <div
          v-for="n in 4"
          :key="n"
          class="category-card category-card--skeleton"
          aria-hidden="true"
        />
      </div>

      <!-- Ошибка -->
      <p v-else-if="categoriesError" class="body-md text-muted categories__error">
        Не удалось загрузить категории.
      </p>

      <!-- Сетка категорий -->
      <div v-else class="categories__grid">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="category-card"
          @click="goToCatalog(cat.id)"
        >
          <!-- Обложка категории (или placeholder) -->
          <div class="category-card__image-wrap">
            <img
              v-if="cat.image_url"
              :src="cat.image_url"
              :alt="cat.name"
              class="category-card__image"
              loading="lazy"
            />
            <div v-else class="category-card__placeholder" aria-hidden="true" />
          </div>
          <!-- Название -->
          <div class="category-card__body">
            <span class="label-sm">{{ cat.name }}</span>
          </div>
        </button>
      </div>
    </section>

    <div class="divider"></div>

    <!-- ─── Секция «О НАС» ─────────────────────────────────────────────────────
         id="about" — якорь для NavBar ссылки /#about
         scrollBehavior в роутере обеспечивает плавный скролл
         ─────────────────────────────────────────────────────────────────────── -->
    <section id="about" class="about container section">
      <p class="label-sm text-muted about__label">О бренде</p>
      <h2 class="headline-lg about__title">10:30 AM</h2>
      <p class="body-lg text-muted about__text">
        Мужская одежда без компромиссов. Минимум деталей — максимум характера.
        Каждая вещь спроектирована так, чтобы работать в любой ситуации.
        Никаких лишних элементов — только то, что нужно.
      </p>
      <RouterLink to="/catalog" class="btn-ghost about__cta">
        Смотреть каталог
      </RouterLink>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '../composables/useApi.js';

const router = useRouter();
const { getCategories } = useApi();

// ─── State: категории ─────────────────────────────────────────────────────────
const categories      = ref([]);
const categoriesLoading = ref(true);
const categoriesError   = ref(false);

// ─── Загрузка категорий при монтировании ─────────────────────────────────────
onMounted(async () => {
  try {
    categories.value = await getCategories();
  } catch (e) {
    console.error('[HomePage] Ошибка загрузки категорий:', e);
    categoriesError.value = true;
  } finally {
    categoriesLoading.value = false;
  }
});

// ─── Клик по категории → /catalog?category=N ─────────────────────────────────
function goToCatalog(categoryId) {
  router.push({ path: '/catalog', query: { category: categoryId } });
}
</script>

<style scoped>
/* ─── Hero: двухколоночный layout ────────────────────────────────────────── */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 80px;
  /* [БАГ-1] section-gap=120px слишком много — уменьшено до 60px */
  padding-top: 60px;
  padding-bottom: 60px;
}

.hero__text {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.hero__subtitle {
  max-width: 320px;
}

.hero__cta {
  align-self: flex-start;
}

.hero__image-wrap {
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background-color: var(--color-surface-container);
  border: 1px solid var(--color-outline-variant);
}

.hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ─── Категории label ────────────────────────────────────────────────────── */
.categories__label {
  margin-bottom: 32px;
}

.categories__error {
  margin-top: 24px;
}

/* ─── Сетка категорий: auto-fit — нет пустых ячеек [БАГ-2] ─────────────── */
.categories__grid {
  display: grid;
  /* Фиксированные 4 колонки — нет пустых серых ячеек через border-подход */
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

/* ─── Карточка категории ─────────────────────────────────────────────────── */
.category-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  border: none;
  border: none;
  background-color: var(--color-background);
  text-align: left;
  transition: background-color var(--transition-default);
}

.category-card:hover {
  background-color: var(--color-surface-container);
}

.category-card__image-wrap {
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background-color: var(--color-surface-container);
}

.category-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform var(--transition-default);
}

.category-card:hover .category-card__image {
  transform: scale(1.03);
}

.category-card__placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--color-surface-container);
}

.category-card__body {
  padding: 16px;
  border-top: 1px solid var(--color-outline-variant);
}

/* ─── Skeleton-загрузчики ────────────────────────────────────────────────── */
.categories__skeleton {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background-color: var(--color-outline-variant);
}

.category-card--skeleton {
  aspect-ratio: 3 / 4;
  background-color: var(--color-surface-container);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1;   }
}

/* ─── Секция «О НАС» ─────────────────────────────────────────────────────── */
.about__label {
  margin-bottom: 24px;
}

.about__title {
  margin-bottom: 32px;
}

.about__text {
  max-width: 640px;
  margin-bottom: 48px;
}

.about__cta {
  display: inline-flex;
}

/* ─── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .categories__grid,
  .categories__skeleton {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 40px;
    padding-top: 64px;
    padding-bottom: 64px;
  }

  .hero__image-wrap {
    order: -1;
  }

  .hero__cta {
    align-self: stretch;
    text-align: center;
    justify-content: center;
  }

  .categories__grid,
  .categories__skeleton {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .categories__grid,
  .categories__skeleton {
    grid-template-columns: 1fr;
  }
}
</style>
