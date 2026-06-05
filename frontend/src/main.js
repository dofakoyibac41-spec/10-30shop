// ─── Vue App Entry Point — 10:30 AM Shop — Sprint 2 ──────────────────────────
// Порядок импортов CSS важен:
//   1. tokens.css  — CSS-переменные (должны быть первыми)
//   2. reset.css   — глобальный сброс (использует переменные)
//   3. typography.css — утилитарные классы типографики
//   4. utilities.css  — layout и компонентные классы
import './styles/tokens.css';
import './styles/reset.css';
import './styles/typography.css';
import './styles/utilities.css';

import { createApp } from 'vue';
import App    from './App.vue';
import router from './router/index.js';

createApp(App).use(router).mount('#app');
