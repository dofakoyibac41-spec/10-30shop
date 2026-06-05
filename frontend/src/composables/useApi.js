// ─── useApi.js — Централизованный HTTP-клиент ─────────────────────────────────
// Sprint 3: публичные эндпоинты (categories, products)
// Sprint 4 расширит методами auth и admin-операций
// Все запросы идут через Vite proxy: /api/* → http://backend:3001/api/*
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Базовая функция fetch с обработкой HTTP-ошибок.
 * Выбрасывает Error с текстом из JSON-ответа бэкенда или статусом.
 */
export async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    // Пробуем прочитать JSON с полем error от бэкенда
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Composable useApi — набор методов для работы с API.
 *
 * Использование:
 *   const { getCategories, getProducts } = useApi()
 *   const cats = await getCategories()
 *   const { items, total } = await getProducts({ categoryId: 2, limit: 6, offset: 0 })
 */
export function useApi() {
  // ─── GET /api/categories ─────────────────────────────────────────────────
  // Возвращает: [{ id, name, image_url }]
  const getCategories = () => apiFetch('/api/categories');

  // ─── GET /api/products ───────────────────────────────────────────────────
  // Параметры: categoryId (null = все), limit (default 6), offset (default 0)
  // Возвращает: { items: [...], total: N }
  const getProducts = ({ categoryId = null, limit = 6, offset = 0 } = {}) => {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    if (categoryId !== null) {
      params.set('category_id', String(categoryId));
    }
    return apiFetch(`/api/products?${params.toString()}`);
  };

  return { getCategories, getProducts };
}
