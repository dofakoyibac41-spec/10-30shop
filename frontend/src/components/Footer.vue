<template>
  <!-- ─── Footer ─────────────────────────────────────────────────────────────
       1px верхняя граница. Лого/название слева, копирайт справа.
       Цвет: on-surface-variant (приглушённый).
       ─────────────────────────────────────────────────────────────────────── -->
  <footer class="footer">
    <div class="footer__inner">
      <!-- Левая часть: бренд -->
      <RouterLink to="/" class="footer__brand label-sm">
        10:30 AM
      </RouterLink>

      <!-- Правая часть: копирайт -->
      <p class="footer__copy label-sm">
        © 2026 10:30 AM. Все права защищены.
      </p>
    </div>
  </footer>
</template>

<script setup>
// Footer: минималистичный, соответствует Editorial Brutalism
</script>

<style scoped>
/* ─── Обёртка ────────────────────────────────────────────────────────────── */
.footer {
  border-top: 1px solid var(--color-outline-variant);
  background-color: var(--color-background);
}

/* ─── Внутренний контейнер ──────────────────────────────────────────────── */
.footer__inner {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 48px var(--spacing-margin-desktop);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

/* ─── Бренд (левая часть) ────────────────────────────────────────────────── */
.footer__brand {
  color: var(--color-on-surface-variant);
  transition: color var(--transition-default);
}

.footer__brand:hover {
  color: var(--color-primary);
}

/* ─── Копирайт (правая часть) ────────────────────────────────────────────── */
.footer__copy {
  color: var(--color-on-surface-variant);
}

/* ─── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .footer__inner {
    padding: 40px var(--spacing-margin-mobile);
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
