<template>
  <div class="page-admin">
    <div class="container">
      <section class="section">
        <p class="label-sm text-muted">Панель управления</p>
        <h1 class="headline-lg">Админка</h1>
        <p class="body-lg text-muted">
          Sprint 4 добавит управление товарами и категориями.
        </p>
        <div class="page-admin__actions">
          <RouterLink to="/admin/login" class="btn-ghost">
            Войти
          </RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
// Sprint 4 наполнит: вкладки Категории/Товары, формы, таблицы
</script>

<style scoped>
.page-admin__actions {
  margin-top: 40px;
  display: flex;
  gap: 16px;
}
</style>
