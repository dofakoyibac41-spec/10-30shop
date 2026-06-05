// ─── Vue Router — Sprint 1 ────────────────────────────────────────────────────
// 4 маршрута: главная, каталог, админка, страница входа.
// createWebHistory() — HTML5 history mode (без #). Nginx/Vite настроен под SPA.

import { createRouter, createWebHistory } from 'vue-router';

import HomePage   from '../pages/HomePage.vue';
import CatalogPage from '../pages/CatalogPage.vue';
import AdminPage  from '../pages/AdminPage.vue';
import LoginPage  from '../pages/LoginPage.vue';

const routes = [
  { path: '/',            component: HomePage,   name: 'home' },
  { path: '/catalog',     component: CatalogPage, name: 'catalog' },
  { path: '/admin',       component: AdminPage,  name: 'admin' },
  { path: '/admin/login', component: LoginPage,  name: 'login' },
];

export default createRouter({
  history: createWebHistory(),
  routes,
  // Плавный скролл к якорям (/#about для секции «О нас» на главной)
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' };
    return { top: 0 };
  },
});
