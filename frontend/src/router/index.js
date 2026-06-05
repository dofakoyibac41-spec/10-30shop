// ─── Vue Router — 10:30 AM Shop ───────────────────────────────────────────────
// 4 маршрута: главная, каталог, админка, страница входа.
// createWebHistory() — HTML5 history mode (без #). Nginx/Vite настроен под SPA.
// [DEV-4 Sprint 4] beforeEach guard защищает /admin (кроме /admin/login)

import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';

import HomePage    from '../pages/HomePage.vue';
import CatalogPage from '../pages/CatalogPage.vue';
import AdminPage   from '../pages/AdminPage.vue';
import LoginPage   from '../pages/LoginPage.vue';

const routes = [
  { path: '/',            component: HomePage,    name: 'home'    },
  { path: '/catalog',     component: CatalogPage, name: 'catalog' },
  { path: '/admin',       component: AdminPage,   name: 'admin'   },
  { path: '/admin/login', component: LoginPage,   name: 'login'   },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Плавный скролл к якорям (/#about для секции «О нас» на главной)
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' };
    return { top: 0 };
  },
});

// ─── Route Guard ──────────────────────────────────────────────────────────────
// [РЕК-3 из ревью Sprint 1 — обязательно]
// Все маршруты /admin (кроме /admin/login) требуют JWT в localStorage.
// Если токена нет → редирект на страницу входа.
router.beforeEach((to, _from, next) => {
  const { isAuthenticated } = useAuth();
  const isProtectedAdmin =
    to.path.startsWith('/admin') && to.path !== '/admin/login';

  if (isProtectedAdmin && !isAuthenticated()) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router;
