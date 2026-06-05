// ─── Vue App Entry Point — 10:30 AM Shop — Sprint 1 ──────────────────────────
import { createApp } from 'vue';
import App    from './App.vue';
import router from './router/index.js';

createApp(App).use(router).mount('#app');
