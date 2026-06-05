<template>
  <div class="page-catalog">
    <div class="container">
      <section class="section">
        <h1 class="headline-lg">Каталог</h1>
        <p class="body-lg text-muted page-catalog__desc">
          Sprint 3 добавит список товаров, фильтры по категориям и пагинацию.
        </p>

        <!-- Демо CategoryFilter с тестовыми данными -->
        <div class="page-catalog__filter">
          <CategoryFilter
            :categories="demoCategories"
            :active-id="activeCategory"
            @select="activeCategory = $event"
          />
        </div>

        <!-- Демо ProductCard сетка -->
        <div class="page-catalog__grid">
          <ProductCard
            v-for="product in demoProducts"
            :key="product.id"
            v-bind="product"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CategoryFilter from '../components/CategoryFilter.vue';
import ProductCard    from '../components/ProductCard.vue';

// Тестовые данные для демонстрации дизайн-системы
const activeCategory = ref(null);

const demoCategories = [
  { id: 1, name: 'Верхняя одежда' },
  { id: 2, name: 'Брюки' },
  { id: 3, name: 'Рубашки' },
  { id: 4, name: 'Аксессуары' },
];

const demoProducts = [
  { id: 1, name: 'Пальто оверсайз', description: 'Шерсть 80%, полиэстер 20%.', category_id: 1, image_url: 'https://placehold.co/400x500/1f2020/e4e2e2?text=ПАЛЬТО' },
  { id: 2, name: 'Куртка-бомбер',   description: 'Нейлон, подкладка — атлас.', category_id: 1, image_url: 'https://placehold.co/400x500/1f2020/e4e2e2?text=БОМБЕР' },
  { id: 3, name: 'Прямые брюки',    description: 'Хлопок 100%, высокая посадка.', category_id: 2, image_url: 'https://placehold.co/400x500/1f2020/e4e2e2?text=БРЮКИ' },
  { id: 4, name: 'Рубашка оверсайз', description: 'Хлопковый поплин.', category_id: 3, image_url: 'https://placehold.co/400x500/1f2020/e4e2e2?text=РУБАШКА' },
  { id: 5, name: 'Шарф объёмной вязки', description: 'Шерсть мериноса.', category_id: 4, image_url: 'https://placehold.co/400x500/1f2020/e4e2e2?text=ШАРФ' },
  { id: 6, name: 'Кепка с козырьком', description: 'Хлопок.', category_id: 4, image_url: 'https://placehold.co/400x500/1f2020/e4e2e2?text=КЕПКА' },
];
</script>

<style scoped>
.page-catalog__desc {
  margin-top: 24px;
  max-width: 560px;
}

.page-catalog__filter {
  margin-top: 48px;
}

/* Сетка товаров: 3 колонки desktop, 2 tablet, 1 mobile */
.page-catalog__grid {
  margin-top: 32px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px; /* 1px gap = «стена» из границ */
  background-color: var(--color-outline-variant); /* фон просвечивает через 1px gap */
}

/* Каждая карточка поверх фона сетки */
.page-catalog__grid > * {
  background-color: var(--color-background);
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
}
</style>
