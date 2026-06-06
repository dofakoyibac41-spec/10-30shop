// ─── useApi.js — Централизованный HTTP-клиент ─────────────────────────────────
// Sprint 3: публичные эндпоинты (categories, products)
// Sprint 4: добавлен useAdminApi() — 6 защищённых методов (цатегории + товары)
// Все запросы идут через Vite proxy: /api/* → http://backend:3001/api/*
// ─────────────────────────────────────────────────────────────────────────────

// [РЕК-2 из ревью Sprint 4] import перенесён в начало файла (был в середине, строка 66)
import { useAuth } from './useAuth.js';

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

  // [БАГ-5] DELETE /api/categories/:id и DELETE /api/products/:id возвращают
  // 204 No Content (пустое тело). Парсить JSON нельзя — вернём null.
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return null;
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

// ─── useAdminApi — защищённые методы для панели администратора ───────────────
// [DEV-3 Sprint 4] Все запросы требуют JWT-токена через getAuthHeader().
// Если токен устарел (401) — apiFetch выбросит Error, компонент покажет ошибку.
//
// Использование:
//   const { createCategory, updateCategory, deleteCategory,
//           createProduct,  deleteProduct,  deleteProductsBulk } = useAdminApi()

export function useAdminApi() {
  const { getAuthHeader } = useAuth();

  // ─── Категории ───────────────────────────────────────────────────────────
  // POST /api/categories  { name, image_url? }  → созданный объект
  const createCategory = (data) =>
    apiFetch('/api/categories', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body:    JSON.stringify(data),
    });

  // PATCH /api/categories/:id  { name, image_url? }  → обновлённый объект
  const updateCategory = (id, data) =>
    apiFetch(`/api/categories/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body:    JSON.stringify(data),
    });

  // DELETE /api/categories/:id  → 204 No Content (apiFetch вернёт null)
  const deleteCategory = (id) =>
    apiFetch(`/api/categories/${id}`, {
      method:  'DELETE',
      headers: getAuthHeader(),
    }).catch((e) => {
      // Пробрасываем с более понятным сообщением если 409 (есть товары)
      throw e;
    });

  // ─── Товары ──────────────────────────────────────────────────────────────
  // POST /api/products  { name, description?, category_id, image_url }  → созданный объект
  const createProduct = (data) =>
    apiFetch('/api/products', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body:    JSON.stringify(data),
    });

  // DELETE /api/products/:id  → 204 No Content
  const deleteProduct = (id) =>
    apiFetch(`/api/products/${id}`, {
      method:  'DELETE',
      headers: getAuthHeader(),
    });

  // DELETE /api/products/bulk  { ids: [1, 2, 3] }  → { deleted: N }
  const deleteProductsBulk = (ids) =>
    apiFetch('/api/products/bulk', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body:    JSON.stringify({ ids }),
    });

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    createProduct,
    deleteProduct,
    deleteProductsBulk,
  };
}
