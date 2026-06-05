<template>
  <!-- ─── CategoryFilter ────────────────────────────────────────────────────────
       Чипы-фильтры по категориям. Editorial Brutalism: rectangular (0px),
       1px граница, label-sm uppercase. Мобилка: горизонтальный скролл.
       Props: categories [{id, name}], activeId (null = все)
       Emits: select(categoryId | null)
       ─────────────────────────────────────────────────────────────────────── -->
  <div class="filter" role="group" aria-label="Фильтр по категориям">
    <!-- Чип «ВСЕ» — сбрасывает фильтр -->
    <button
      class="filter__chip label-sm"
      :class="{ 'filter__chip--active': activeId === null }"
      @click="$emit('select', null)"
      :aria-pressed="activeId === null"
    >
      Все
    </button>

    <!-- Чипы категорий -->
    <button
      v-for="cat in categories"
      :key="cat.id"
      class="filter__chip label-sm"
      :class="{ 'filter__chip--active': activeId === cat.id }"
      @click="$emit('select', cat.id)"
      :aria-pressed="activeId === cat.id"
    >
      {{ cat.name }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  categories: {
    type: Array,
    default: () => [],
    // Ожидаем: [{ id: Number, name: String }]
  },
  activeId: {
    type: Number,
    default: null,
  },
});

defineEmits(['select']);
</script>

<style scoped>
/* ─── Контейнер: flex wrap, мобилка → горизонтальный скролл ─────────────── */
.filter {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-base); /* 8px */
}

/* ─── Чип ────────────────────────────────────────────────────────────────── */
.filter__chip {
  /* Rectangular: нет border-radius (reset.css глобально, но явно тоже) */
  padding: 8px 16px;
  background-color: transparent;
  color: var(--color-on-surface-variant);
  border: 1px solid var(--color-outline-variant);

  cursor: pointer;
  white-space: nowrap; /* не переносить текст */

  transition:
    color var(--transition-default),
    border-color var(--transition-default),
    background-color var(--transition-default);
}

/* Hover: белая граница */
.filter__chip:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

/* Активный чип: белый фон — сигнализирует о выбранном состоянии */
.filter__chip--active {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
}

.filter__chip--active:hover {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}

/* ─── Responsive: горизонтальный скролл на мобилке ──────────────────────── */
@media (max-width: 768px) {
  .filter {
    flex-wrap: nowrap;
    overflow-x: auto;
    /* Скрыть скроллбар визуально (работает в большинстве браузеров) */
    scrollbar-width: none;
    -ms-overflow-style: none;
    /* Отступы по краям для возможности скролла до последнего чипа */
    padding-bottom: 4px;
  }

  .filter::-webkit-scrollbar {
    display: none;
  }
}
</style>
