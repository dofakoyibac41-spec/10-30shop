// ─── 10:30 AM Shop — Seed Script ─────────────────────────────────────────────
// Наполняет БД начальными тестовыми данными: 4 категории + 8 товаров.
// DATABASE-2: Sprint 1 — Фундамент
//
// Запуск (однократно):
//   docker compose exec backend node seed.js
//   или локально: node seed.js
//
// Идемпотентность: если в categories уже есть записи — скрипт завершается
// без изменений. Безопасно запускать повторно.

'use strict';

const db = require('./db');

// ─── Проверка идемпотентности ─────────────────────────────────────────────────
const existing = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (existing.count > 0) {
  console.log(`ℹ️  База данных уже наполнена (${existing.count} категорий). Seed пропущен.`);
  process.exit(0);
}

// ─── Placeholder URL для тестовых фото ───────────────────────────────────────
// Формат: https://placehold.co/{w}x{h}/{bg}/{text}?text={label}
// Цвета из дизайн-системы: bg=#1f2020 (surface), text=#e4e2e2 (on-surface)
const placeholder = (label) =>
  `https://placehold.co/400x500/1f2020/e4e2e2?text=${encodeURIComponent(label)}`;

// ─── Seed данные ─────────────────────────────────────────────────────────────
const categories = [
  { name: 'Верхняя одежда', image_url: null },
  { name: 'Брюки',          image_url: null },
  { name: 'Рубашки',        image_url: null },
  { name: 'Аксессуары',     image_url: null },
];

const products = [
  // Верхняя одежда (category_id = 1)
  {
    name: 'Пальто оверсайз',
    description: 'Классическое пальто свободного кроя. Шерсть 80%, полиэстер 20%.',
    category_id: 1,
    image_url: placeholder('ПАЛЬТО'),
  },
  {
    name: 'Куртка-бомбер',
    description: 'Лёгкая куртка из плотного нейлона. Подкладка — атлас.',
    category_id: 1,
    image_url: placeholder('БОМБЕР'),
  },
  // Брюки (category_id = 2)
  {
    name: 'Прямые брюки',
    description: 'Прямой силуэт, высокая посадка. Хлопок 100%.',
    category_id: 2,
    image_url: placeholder('БРЮКИ'),
  },
  {
    name: 'Широкие брюки-карго',
    description: 'Объёмные брюки с боковыми карманами.',
    category_id: 2,
    image_url: placeholder('КАРГО'),
  },
  // Рубашки (category_id = 3)
  {
    name: 'Рубашка оверсайз',
    description: 'Свободная рубашка из хлопкового поплина.',
    category_id: 3,
    image_url: placeholder('РУБАШКА'),
  },
  {
    name: 'Рубашка с принтом',
    description: 'Графический принт. Вискоза 100%.',
    category_id: 3,
    image_url: placeholder('ПРИНТ'),
  },
  // Аксессуары (category_id = 4)
  {
    name: 'Шарф объёмной вязки',
    description: 'Крупная вязка. Шерсть мериноса.',
    category_id: 4,
    image_url: placeholder('ШАРФ'),
  },
  {
    name: 'Кепка с козырьком',
    description: 'Структурированная кепка. Хлопок.',
    category_id: 4,
    image_url: placeholder('КЕПКА'),
  },
];

// ─── Вставка в транзакции ─────────────────────────────────────────────────────
// Транзакция гарантирует: или всё вставлено, или ничего
const insertAll = db.transaction(() => {
  const insertCategory = db.prepare(
    'INSERT INTO categories (name, image_url) VALUES (?, ?)'
  );
  const insertProduct = db.prepare(
    `INSERT INTO products (name, description, category_id, image_url)
     VALUES (?, ?, ?, ?)`
  );

  for (const cat of categories) {
    insertCategory.run(cat.name, cat.image_url);
  }

  for (const prod of products) {
    insertProduct.run(prod.name, prod.description, prod.category_id, prod.image_url);
  }
});

insertAll();

console.log(`✅ Seed завершён:`);
console.log(`   Категорий: ${categories.length}`);
console.log(`   Товаров:   ${products.length}`);
