<template>
  <!-- ─── ProductCard ──────────────────────────────────────────────────────────
       Editorial Brutalism: 1px граница, 0px радиус, 4:5 portrait image.
       Hover: изображение scale(1.03), обрезается по контейнеру.
       Props: id, name, description, image_url, category_id
       ─────────────────────────────────────────────────────────────────────── -->
  <article class="product-card">
    <!-- Изображение с hover-эффектом -->
    <div class="product-card__image-wrap">
      <img
        v-if="displayImage"
        :src="displayImage"
        :alt="name"
        class="product-card__image"
        loading="lazy"
        @error="onImageError"
      />
      <!-- Placeholder если URL не загрузился, пустой, или ошибка 404 -->
      <div v-else class="product-card__placeholder" aria-hidden="true" />
    </div>

    <!-- Текстовый блок -->
    <div class="product-card__body">
      <h3 class="product-card__name headline-md">{{ name }}</h3>
      <p v-if="description" class="product-card__desc body-md text-muted">
        {{ description }}
      </p>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  id:          { type: Number, required: true },
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  image_url:   { type: String, default: '' },
  category_id: { type: Number, required: true },
});

// При ошибке загрузки изображения — показать placeholder
const imageError = ref(false);
function onImageError() {
  imageError.value = true;
}

// computed — реактивный: пересчитывается при изменении imageError.
// Переименован в displayImage чтобы не затенять (shadow) props.image_url.
const displayImage = computed(() =>
  imageError.value ? '' : props.image_url
);
</script>

<style scoped>
/* ─── Карточка ───────────────────────────────────────────────────────────── */
.product-card {
  border: none;
  background-color: var(--color-surface-container-high);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: border-color var(--transition-default);
}

.product-card:hover {
  border-color: var(--color-primary);
}

/* ─── Изображение ────────────────────────────────────────────────────────── */
.product-card__image-wrap {
  /* 3:4 — компактнее чем 4:5, хорошо смотрится при 4 колонках */
  aspect-ratio: 3 / 4;
  overflow: hidden; /* clip scale при hover — граница остаётся sharp */
  background-color: var(--color-surface-container-high);
  flex-shrink: 0;
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform var(--transition-default);
}

/* Hover: изображение увеличивается, контейнер обрезает края */
.product-card:hover .product-card__image {
  transform: scale(1.03);
}

/* ─── Placeholder (нет фото или ошибка загрузки) ────────────────────────── */
.product-card__placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--color-surface-container-high);
  /* Нет текста, нет иконок — строгий пустой прямоугольник */
}

/* ─── Текстовый блок ─────────────────────────────────────────────────────── */
.product-card__name {
  /* headline-md задаёт font-family, size, weight через глобальный класс */
  color: var(--color-on-surface);
}

.product-card__body {
  padding: 16px;
  /* [БАГ-3] Фон body слегка выделен на фоне страницы */
  background-color: var(--color-surface-container-high);
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.product-card__desc {
  /* body-md + text-muted через глобальные классы */
  /* Обрезаем длинные описания до 2 строк */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
