<template>
  <div class="page-catalog">
    <div class="container">
      <section class="section">

        <!-- ─── Заголовок + счётчик ──────────────────────────────────────────── -->
        <div class="page-catalog__header">
          <h1 class="headline-lg">Каталог</h1>
          <span v-if="!loading || products.length > 0" class="label-sm text-muted">
            {{ total }} ПОЗИЦИЙ
          </span>
        </div>

        <!-- ─── Фильтр категорий ──────────────────────────────────────────────── -->
        <div class="page-catalog__filter">
          <CategoryFilter
            :categories="categories"
            :active-id="activeCategory"
            @select="onCategorySelect"
          />
        </div>

        <!-- ─── Состояние ошибки ─────────────────────────────────────────────── -->
        <div v-if="error" class="catalog__error">
          <p class="headline-md">Ошибка загрузки</p>
          <p class="body-lg text-muted">{{ error }}</p>
          <button class="btn-ghost catalog__error-btn" @click="loadProducts(true)">
            Попробовать снова
          </button>
        </div>

        <!-- ─── Скелетоны при первой загрузке ───────────────────────────────── -->
        <div v-else-if="loading && products.length === 0" class="page-catalog__grid">
          <div
            v-for="n in 6"
            :key="`skel-${n}`"
            class="product-skeleton"
            aria-hidden="true"
          />
        </div>

        <!-- ─── Состояние «товаров нет» ──────────────────────────────────────── -->
        <div
          v-else-if="products.length === 0 && !loading"
          class="catalog__empty"
        >
          <p class="headline-md">Товаров нет</p>
          <p class="body-lg text-muted catalog__empty-text">
            В этой категории пока нет товаров.
          </p>
          <button class="btn-ghost catalog__empty-btn" @click="onCategorySelect(null)">
            Смотреть все
          </button>
        </div>

        <!-- ─── Сетка товаров ────────────────────────────────────────────────── -->
        <TransitionGroup
          v-else
          name="catalog-fade"
          tag="div"
          class="page-catalog__grid"
        >
          <ProductCard
            v-for="product in products"
            :key="product.id"
            v-bind="product"
          />
        </TransitionGroup>

        <!-- ─── Кнопка «Показать ещё» ─────────────────────────────────────────
             Видна только когда есть ещё товары (hasMore).
             При загрузке — disabled + текст «Загрузка...»
             ─────────────────────────────────────────────────────────────────── -->
        <div v-if="hasMore && !error" class="catalog__more">
          <button
            class="btn-ghost"
            :disabled="loading"
            @click="loadProducts(false)"
          >
            {{ loading ? 'Загрузка...' : 'Показать ещё' }}
          </button>
        </div>

      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute }                from 'vue-router';
import CategoryFilter              from '../components/CategoryFilter.vue';
import ProductCard                 from '../components/ProductCard.vue';
import { useApi }                  from '../composables/useApi.js';

const route = useRoute();
const { getCategories, getProducts } = useApi();

// ─── State ────────────────────────────────────────────────────────────────────
const categories     = ref([]);
const products       = ref([]);
const total          = ref(0);
const activeCategory = ref(null);   // null = «Все»
const offset         = ref(0);
const loading        = ref(false);
const error          = ref(null);

const LIMIT = 6;

// ─── Computed ─────────────────────────────────────────────────────────────────
// Показываем кнопку «Показать ещё» пока не загружены все товары
const hasMore = computed(() => offset.value < total.value);

// ─── Загрузка/догрузка товаров ────────────────────────────────────────────────
// reset = true  → сбрасывает offset и список (смена фильтра, первая загрузка)
// reset = false → добавляет товары к существующим («Показать ещё»)
async function loadProducts(reset = false) {
  if (reset) {
    offset.value   = 0;
    products.value = [];
    error.value    = null;
  }

  loading.value = true;

  try {
    const data = await getProducts({
      categoryId: activeCategory.value,
      limit:      LIMIT,
      offset:     offset.value,
    });

    if (reset) {
      products.value = data.items;
    } else {
      products.value = [...products.value, ...data.items];
    }

    total.value   = data.total;
    offset.value += data.items.length;
  } catch (e) {
    console.error('[CatalogPage] Ошибка загрузки товаров:', e);
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

// ─── Смена фильтра категории ──────────────────────────────────────────────────
async function onCategorySelect(catId) {
  activeCategory.value = catId;
  await loadProducts(true);
}

// ─── Инициализация при монтировании ──────────────────────────────────────────
// [РЕК-2 из ревью Sprint 3] getCategories и loadProducts запускаются параллельно
// через Promise.all — оба запроса независимы, ждать первого не нужно.
onMounted(async () => {
  // DEV-9: Читаем query-параметр ?category=N ДО запроса товаров
  // Позволяет открывать каталог с уже применённым фильтром (клик с главной)
  const catFromUrl = route.query.category ? parseInt(route.query.category, 10) : null;
  if (catFromUrl !== null && !isNaN(catFromUrl)) {
    activeCategory.value = catFromUrl;
  }

  // Параллельная загрузка категорий и товаров
  await Promise.all([
    getCategories()
      .then((cats) => { categories.value = cats; })
      .catch((e) => { console.error('[CatalogPage] Ошибка загрузки категорий:', e); }),
    loadProducts(true),
  ]);
});
</script>

<style scoped>
/* ─── Заголовок + счётчик ────────────────────────────────────────────────── */
.page-catalog__header {
  display: flex;
  align-items: baseline;
  gap: 24px;
  flex-wrap: wrap;
}

/* ─── Фильтр ─────────────────────────────────────────────────────────────── */
.page-catalog__filter {
  margin-top: 48px;
}

/* ─── Сетка товаров: auto-fit — нет пустых серых ячеек [БАГ-5] ────────── */
.page-catalog__grid {
  margin-top: 32px;
  display: grid;
  /* Фиксированные 3 колонки + border-подход вместо background-trick */
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

/* Каждая карточка поверх фона */
.page-catalog__grid > * {
  background-color: var(--color-background);
}

/* ─── Скелетон-загрузчики ────────────────────────────────────────────────── */
.product-skeleton {
  aspect-ratio: 4 / 5;
  background-color: var(--color-surface-container);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1;   }
}

/* ─── Состояние «товаров нет» ────────────────────────────────────────────── */
.catalog__empty {
  padding: 120px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.catalog__empty-text {
  max-width: 400px;
}

.catalog__empty-btn {
  align-self: flex-start;
  margin-top: 16px;
}

/* ─── Состояние ошибки ───────────────────────────────────────────────────── */
.catalog__error {
  padding: 80px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* [КР-1 из ревью] Убран inline style="margin-top: 32px" → CSS-класс */
.catalog__error-btn {
  margin-top: 32px;
  align-self: flex-start;
}

/* ─── Кнопка «Показать ещё» ─────────────────────────────────────────────── */
.catalog__more {
  margin-top: 48px;
  display: flex;
  justify-content: center;
}

/* ─── Анимация TransitionGroup при смене фильтра ─────────────────────────── */
.catalog-fade-enter-active,
.catalog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.catalog-fade-enter-from,
.catalog-fade-leave-to {
  opacity: 0;
}

/* ─── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 1280px) {
  .page-catalog__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .page-catalog__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .page-catalog__grid {
    grid-template-columns: 1fr;
  }

  .catalog__empty {
    padding: 64px 0;
  }
}
</style>
