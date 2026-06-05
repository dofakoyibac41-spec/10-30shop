<template>
  <div class="page-login">
    <div class="container">
      <section class="section">
        <p class="label-sm text-muted">Администратор</p>
        <h1 class="headline-md">Вход в панель управления</h1>

        <form class="page-login__form" @submit.prevent="handleSubmit">
          <div class="page-login__field">
            <label class="label-sm text-muted" for="login-input">Логин</label>
            <input
              id="login-input"
              v-model="loginVal"
              type="text"
              class="input-underline"
              placeholder="admin"
              autocomplete="username"
              :disabled="loading"
            />
          </div>

          <div class="page-login__field">
            <label class="label-sm text-muted" for="password-input">Пароль</label>
            <input
              id="password-input"
              v-model="password"
              type="password"
              class="input-underline"
              placeholder="••••••••"
              autocomplete="current-password"
              :disabled="loading"
            />
          </div>

          <!-- Ошибка авторизации -->
          <p v-if="error" class="body-md page-login__error">{{ error }}</p>

          <button
            type="submit"
            class="btn-primary page-login__submit"
            :disabled="loading"
          >
            {{ loading ? 'Вход...' : 'Войти' }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref }       from 'vue';
import { useRouter } from 'vue-router';
import { useAuth }   from '../composables/useAuth.js';

const router = useRouter();
const { login, isAuthenticated } = useAuth();

// Если уже залогинен — сразу на /admin
if (isAuthenticated()) {
  router.replace({ name: 'admin' });
}

const loginVal = ref('');
const password = ref('');
const error    = ref('');
const loading  = ref(false);

async function handleSubmit() {
  if (!loginVal.value.trim() || !password.value.trim()) {
    error.value = 'Заполните все поля';
    return;
  }

  error.value  = '';
  loading.value = true;

  try {
    await login(loginVal.value.trim(), password.value);
    router.push({ name: 'admin' });
  } catch (e) {
    error.value = e.message || 'Ошибка авторизации';
  } finally {
    loading.value = false;
  }
}
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

.page-login__error {
  color: #ff4444;
  border-left: 2px solid #ff4444;
  padding-left: 12px;
}
</style>
