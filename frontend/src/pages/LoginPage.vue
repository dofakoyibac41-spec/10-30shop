<template>
  <div class="page-login">
    <div class="container">
      <section class="section">
        <p class="label-sm text-muted">Администратор</p>
        <h1 class="headline-md">Вход в панель управления</h1>

        <!-- Демо-форма — Sprint 4 добавит реальную авторизацию -->
        <form class="page-login__form" @submit.prevent>
          <div class="page-login__field">
            <label class="label-sm text-muted" for="login">Логин</label>
            <input
              id="login"
              type="text"
              class="input-underline"
              placeholder="admin"
              autocomplete="username"
            />
          </div>
          <div class="page-login__field">
            <label class="label-sm text-muted" for="password">Пароль</label>
            <input
              id="password"
              type="password"
              class="input-underline"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>
          <button type="submit" class="btn-primary page-login__submit">
            Войти
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
// Sprint 4 добавит: useAuth, POST /api/auth/login, redirect на /admin
</script>

<style scoped>
.page-login__form {
  margin-top: 40px;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.page-login__field {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-login__submit {
  margin-top: 8px;
  align-self: flex-start;
}
</style>
