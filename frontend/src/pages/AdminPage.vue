<template>
  <div class="page-admin">

    <!-- ─── Toast-уведомление ─────────────────────────────────────────────────── -->
    <Transition name="toast-fade">
      <div v-if="toast.message" :class="['toast', `toast--${toast.type}`]" role="alert">
        {{ toast.message }}
      </div>
    </Transition>

    <div class="container">
      <section class="section">

        <!-- ─── Шапка: заголовок + кнопка выхода ───────────────────────────────── -->
        <div class="admin-header">
          <div>
            <p class="label-sm text-muted">Панель управления</p>
            <h1 class="headline-lg">Админка</h1>
          </div>
          <button class="btn-ghost admin-logout" @click="handleLogout">
            Выйти
          </button>
        </div>

        <!-- ─── Вкладки ─────────────────────────────────────────────────────────── -->
        <div class="admin-tabs">
          <button
            :class="['tab-btn', { 'tab-btn--active': activeTab === 'categories' }]"
            @click="activeTab = 'categories'"
          >
            Категории
          </button>
          <button
            :class="['tab-btn', { 'tab-btn--active': activeTab === 'products' }]"
            @click="activeTab = 'products'"
          >
            Товары
          </button>
        </div>

        <div class="divider divider--tabs"></div>

        <!-- ═══════════════════════════════════════════════════════════════════════
             ВКЛАДКА: КАТЕГОРИИ
             ═══════════════════════════════════════════════════════════════════════ -->
        <div v-if="activeTab === 'categories'">

          <!-- Форма создания -->
          <p class="label-sm text-muted admin-section-label">Новая категория</p>
          <form class="admin-form" @submit.prevent="createCat">
            <input
              v-model="newCatName"
              class="input-underline"
              placeholder="Название *"
              :disabled="catLoading"
            />
            <input
              v-model="newCatImageUrl"
              class="input-underline"
              placeholder="URL картинки (необязательно)"
              :disabled="catLoading"
            />
            <!-- Превью обложки -->
            <img
              v-if="newCatImageUrl"
              :src="newCatImageUrl"
              class="form-preview"
              alt="Превью категории"
              @error="newCatImageUrl = ''"
            />
            <p v-if="catError" class="error-text">{{ catError }}</p>
            <button
              type="submit"
              class="btn-primary"
              :disabled="!newCatName.trim() || catLoading"
            >
              {{ catLoading ? 'Сохранение...' : 'Создать категорию' }}
            </button>
          </form>

          <div class="divider divider--section"></div>

          <!-- Список категорий -->
          <p class="label-sm text-muted admin-section-label">
            Список ({{ categories.length }})
          </p>

          <div v-if="categories.length === 0 && !catLoading" class="admin-empty">
            <p class="body-lg text-muted">Категорий пока нет. Создайте первую.</p>
          </div>

          <div
            v-for="(cat, catIdx) in categories"
            :key="cat.id"
            class="admin-row"
            :class="{ 'row--drag-over': catDragOverIdx === catIdx && catDragFromIdx !== catIdx }"
            draggable="true"
            @dragstart="catDragFromIdx = catIdx"
            @dragover.prevent="catDragOverIdx = catIdx"
            @dragleave="catDragOverIdx = null"
            @drop.prevent="onCatDrop(catIdx)"
            @dragend="catDragOverIdx = null"
          >
            <span class="drag-handle" title="Перетащить">⠿</span>

            <!-- Режим просмотра -->
            <template v-if="editingCatId !== cat.id">
              <span class="admin-row__name body-md">{{ cat.name }}</span>
              <div class="admin-row__actions">
                <button class="btn-ghost btn-sm" @click="startEdit(cat)">
                  Редактировать
                </button>
                <button
                  class="btn-ghost btn-sm btn-danger"
                  @click="deleteCat(cat.id)"
                >
                  Удалить
                </button>
              </div>
            </template>

            <!-- Режим редактирования (inline) -->
            <template v-else>
              <div class="admin-row__edit-fields">
                <input
                  v-model="editCatName"
                  class="input-underline admin-row__edit-input"
                  placeholder="Название *"
                  @keydown.esc="editingCatId = null"
                />
                <input
                  v-model="editCatImageUrl"
                  class="input-underline admin-row__edit-input"
                  placeholder="URL картинки (необязательно)"
                  @keydown.esc="editingCatId = null"
                />
                <img
                  v-if="editCatImageUrl"
                  :src="editCatImageUrl"
                  class="form-preview"
                  alt="Превью категории"
                  @error="editCatImageUrl = ''"
                />
              </div>
              <div class="admin-row__actions">
                <button
                  class="btn-primary btn-sm"
                  :disabled="!editCatName.trim() || catLoading"
                  @click="saveEdit(cat.id)"
                >
                  Сохранить
                </button>
                <button class="btn-ghost btn-sm" @click="editingCatId = null">
                  Отмена
                </button>
              </div>
            </template>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════════════
             ВКЛАДКА: ТОВАРЫ
             ═══════════════════════════════════════════════════════════════════════ -->
        <div v-else-if="activeTab === 'products'">

          <!-- Форма добавления товара -->
          <p class="label-sm text-muted admin-section-label">Новый товар</p>
          <form class="admin-form" @submit.prevent="addProduct">
            <input
              v-model="newProdName"
              class="input-underline"
              placeholder="Название *"
              :disabled="prodLoading"
              required
            />
            <textarea
              v-model="newProdDesc"
              class="input-underline admin-textarea"
              placeholder="Описание (необязательно)"
              :disabled="prodLoading"
            />

            <!-- Выпадающий список категорий -->
            <select
              v-model="newProdCategoryId"
              class="input-underline"
              :disabled="prodLoading"
              required
            >
              <option value="" disabled>Выберите категорию *</option>
              <option
                v-for="cat in categories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>

            <!-- URL картинки + превью -->
            <input
              v-model="newProdImageUrl"
              class="input-underline"
              placeholder="URL картинки *"
              :disabled="prodLoading"
              required
            />
            <img
              v-if="newProdImageUrl"
              :src="newProdImageUrl"
              class="form-preview"
              alt="Превью товара"
              @error="newProdImageUrl = ''"
            />

            <!-- Цена -->
            <input
              v-model="newProdPrice"
              class="input-underline"
              type="number"
              min="0"
              step="1"
              placeholder="Цена (₽)"
              :disabled="prodLoading"
            />

            <p v-if="prodError" class="error-text">{{ prodError }}</p>
            <button
              type="submit"
              class="btn-primary"
              :disabled="!newProdName.trim() || !newProdImageUrl.trim() || !newProdCategoryId || prodLoading"
            >
              {{ prodLoading ? 'Сохранение...' : 'Добавить товар' }}
            </button>
          </form>

          <div class="divider divider--section"></div>

          <!-- Панель массового удаления -->
          <div class="admin-bulk-bar">
            <p class="label-sm text-muted admin-section-label">
              Товары ({{ products.length }})
            </p>
            <button
              class="btn-ghost btn-danger"
              :disabled="selectedIds.length === 0 || prodLoading"
              @click="deleteBulk"
            >
              Удалить выбранные ({{ selectedIds.length }})
            </button>
          </div>

          <!-- Пустой список -->
          <div v-if="products.length === 0 && !prodLoading" class="admin-empty">
            <p class="body-lg text-muted">Товаров пока нет. Добавьте первый.</p>
          </div>

          <!-- Таблица товаров -->
          <table v-else class="admin-table">
            <thead>
              <tr>
                <th class="th-drag-check">
                  <input
                    type="checkbox"
                    :checked="allSelected"
                    :indeterminate="selectedIds.length > 0 && !allSelected"
                    @change="toggleAll"
                  />
                </th>
                <th>Фото</th>
                <th>Название</th>
                <th>Категория</th>
                <th>Цена</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(prod, prodIdx) in products" :key="prod.id">
                <!-- Основная строка товара -->
                <tr
                  draggable="true"
                  :class="{ 'row--drag-over': prodDragOverIdx === prodIdx && prodDragFromIdx !== prodIdx }"
                  @dragstart="prodDragFromIdx = prodIdx"
                  @dragover.prevent="prodDragOverIdx = prodIdx"
                  @dragleave="prodDragOverIdx = null"
                  @drop.prevent="onProdDrop(prodIdx)"
                  @dragend="prodDragOverIdx = null"
                >
                  <td class="td-drag-check">
                    <span class="drag-handle" title="Перетащить">⠿</span>
                    <input type="checkbox" :value="prod.id" v-model="selectedIds" />
                  </td>
                  <td>
                    <img :src="prod.image_url" class="table-thumb" :alt="prod.name" />
                  </td>
                  <td class="body-md">{{ prod.name }}</td>
                  <td class="label-sm text-muted">{{ getCatName(prod.category_id) }}</td>
                  <td class="body-md">{{ prod.price ? prod.price.toLocaleString('ru-RU') + ' ₽' : '—' }}</td>
                  <td>
                    <div class="td-actions">
                      <button
                        class="btn-ghost btn-sm"
                        @click="startEditProd(prod)"
                        :disabled="prodLoading"
                      >Редактировать</button>
                      <button
                        class="btn-ghost btn-sm btn-danger"
                        @click="deleteOne(prod.id)"
                        :disabled="prodLoading"
                      >Удалить</button>
                    </div>
                  </td>
                </tr>
                <!-- Развернутая форма редактирования -->
                <tr v-if="editingProdId === prod.id" class="admin-table__edit-row">
                  <td colspan="6">
                    <div class="prod-edit-form">
                      <input v-model="editProdName" class="input-underline" placeholder="Название *" />
                      <textarea v-model="editProdDesc" class="input-underline admin-textarea" placeholder="Описание" />
                      <select v-model="editProdCategoryId" class="input-underline">
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                      </select>
                      <input v-model="editProdImageUrl" class="input-underline" placeholder="URL картинки *" />
                      <img
                        v-if="editProdImageUrl"
                        :src="editProdImageUrl"
                        class="form-preview"
                        alt="Превью"
                        @error="editProdImageUrl = ''"
                      />
                      <input v-model="editProdPrice" class="input-underline" type="number" min="0" placeholder="Цена (₽)" />
                      <div class="prod-edit-actions">
                        <button
                          class="btn-primary btn-sm"
                          :disabled="!editProdName.trim() || !editProdImageUrl.trim() || prodLoading"
                          @click="saveEditProd(prod.id)"
                        >Сохранить</button>
                        <button class="btn-ghost btn-sm" @click="editingProdId = null">Отмена</button>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter }                        from 'vue-router';
import { useAuth }                          from '../composables/useAuth.js';
import { useApi, useAdminApi } from '../composables/useApi.js';

const router  = useRouter();
const { logout }                                 = useAuth();
const { getCategories, getProducts }             = useApi();
const {
  createCategory, updateCategory, deleteCategory,
  createProduct,  updateProduct,  deleteProduct,  deleteProductsBulk,
  reorderCategories, reorderProducts,
} = useAdminApi();

// ─── Вкладки ──────────────────────────────────────────────────────────────────
const activeTab = ref('categories'); // 'categories' | 'products'

// При смене на «Товары» — подгружаем список
watch(activeTab, (tab) => {
  if (tab === 'products') loadProducts();
});

// ─── Toast ────────────────────────────────────────────────────────────────────
const toast     = ref({ message: '', type: '' });
let   toastTimer = null;

function showToast(message, type = 'success') {
  toast.value = { message, type };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.value = { message: '', type: '' }; }, 3000);
}

// ─── Выход ────────────────────────────────────────────────────────────────────
function handleLogout() {
  logout();
  router.push({ name: 'login' });
}

// ═════════════════════════════════════════════════════════════════════════════
// КАТЕГОРИИ
// ═════════════════════════════════════════════════════════════════════════════
const categories   = ref([]);
const newCatName   = ref('');
const newCatImageUrl = ref('');
const catLoading   = ref(false);
const catError     = ref('');
const editingCatId = ref(null);
const editCatName  = ref('');
const editCatImageUrl = ref('');

async function loadCategories() {
  try {
    categories.value = await getCategories();
  } catch (e) {
    console.error('[Admin] Ошибка загрузки категорий:', e);
  }
}

async function createCat() {
  if (!newCatName.value.trim()) return;
  catError.value   = '';
  catLoading.value = true;
  try {
    await createCategory({
      name:      newCatName.value.trim(),
      image_url: newCatImageUrl.value.trim() || null,
    });
    newCatName.value     = '';
    newCatImageUrl.value = '';
    await loadCategories();
    showToast('Категория создана');
  } catch (e) {
    catError.value = e.message;
    showToast(e.message, 'error');
  } finally {
    catLoading.value = false;
  }
}

async function deleteCat(id) {
  catError.value   = '';
  catLoading.value = true;
  try {
    await deleteCategory(id);
    await loadCategories();
    showToast('Категория удалена');
  } catch (e) {
    catError.value = e.message;
    showToast(e.message, 'error');
  } finally {
    catLoading.value = false;
  }
}

function startEdit(cat) {
  editingCatId.value    = cat.id;
  editCatName.value     = cat.name;
  editCatImageUrl.value = cat.image_url || '';
}

async function saveEdit(id) {
  if (!editCatName.value.trim()) return;
  catLoading.value = true;
  try {
    await updateCategory(id, {
      name:      editCatName.value.trim(),
      image_url: editCatImageUrl.value.trim() || null,
    });
    editingCatId.value = null;
    await loadCategories();
    showToast('Категория обновлена');
  } catch (e) {
    catError.value = e.message;
    showToast(e.message, 'error');
  } finally {
    catLoading.value = false;
  }
}// ─── Drag-and-drop: Категории ───────────────────────────────────────────────────
const catDragFromIdx = ref(null);
const catDragOverIdx = ref(null);

async function onCatDrop(toIdx) {
  const fromIdx = catDragFromIdx.value;
  catDragFromIdx.value = null;
  catDragOverIdx.value = null;
  if (fromIdx === null || fromIdx === toIdx) return;

  const arr = [...categories.value];
  const [moved] = arr.splice(fromIdx, 1);
  arr.splice(toIdx, 0, moved);
  categories.value = arr; // Оптимистичное обновление UI

  try {
    await reorderCategories(arr.map((c, i) => ({ id: c.id, sort_order: i })));
  } catch (e) {
    showToast('Ошибка сохранения порядка', 'error');
    await loadCategories(); // Откат при ошибке
  }
}


// ═════════════════════════════════════════════════════════════════════════════
// ТОВАРЫ
// ═════════════════════════════════════════════════════════════════════════════
const products        = ref([]);
const newProdName     = ref('');
const newProdDesc     = ref('');
const newProdCategoryId = ref('');
const newProdImageUrl = ref('');
const newProdPrice    = ref('');
const prodLoading     = ref(false);
const prodError       = ref('');
const selectedIds     = ref([]);

const allSelected = computed(
  () => products.value.length > 0 && selectedIds.value.length === products.value.length,
);

// В админке показываем все товары без пагинации
async function loadProducts() {
  try {
    const data = await getProducts({ limit: 200, offset: 0 });
    products.value = data.items;
  } catch (e) {
    console.error('[Admin] Ошибка загрузки товаров:', e);
  }
}

async function addProduct() {
  if (!newProdName.value.trim() || !newProdImageUrl.value.trim() || !newProdCategoryId.value) return;
  prodError.value   = '';
  prodLoading.value = true;
  try {
    await createProduct({
      name:        newProdName.value.trim(),
      description: newProdDesc.value.trim() || null,
      category_id: newProdCategoryId.value,
      image_url:   newProdImageUrl.value.trim(),
      price:       parseInt(newProdPrice.value, 10) || 0,
    });
    newProdName.value       = '';
    newProdDesc.value       = '';
    newProdCategoryId.value = '';
    newProdImageUrl.value   = '';
    newProdPrice.value      = '';
    await loadProducts();
    showToast('Товар добавлен');
  } catch (e) {
    prodError.value = e.message;
    showToast(e.message, 'error');
  } finally {
    prodLoading.value = false;
  }
}

async function deleteOne(id) {
  prodLoading.value = true;
  try {
    await deleteProduct(id);
    selectedIds.value = selectedIds.value.filter((sid) => sid !== id);
    await loadProducts();
    showToast('Товар удалён');
  } catch (e) {
    prodError.value = e.message;
    showToast(e.message, 'error');
  } finally {
    prodLoading.value = false;
  }
}

async function deleteBulk() {
  if (selectedIds.value.length === 0) return;
  prodLoading.value = true;
  try {
    await deleteProductsBulk(selectedIds.value);
    const count = selectedIds.value.length;
    selectedIds.value = [];
    await loadProducts();
    showToast(`Удалено ${count} товара(-ов)`);
  } catch (e) {
    prodError.value = e.message;
    showToast(e.message, 'error');
  } finally {
    prodLoading.value = false;
  }
}

function toggleAll(e) {
  selectedIds.value = e.target.checked
    ? products.value.map((p) => p.id)
    : [];
}

function getCatName(catId) {
  const cat = categories.value.find((c) => c.id === catId);
  return cat ? cat.name : `#${catId}`;
}

// ─── Drag-and-drop: Товары ─────────────────────────────────────────────────────
const prodDragFromIdx = ref(null);
const prodDragOverIdx = ref(null);

async function onProdDrop(toIdx) {
  const fromIdx = prodDragFromIdx.value;
  prodDragFromIdx.value = null;
  prodDragOverIdx.value = null;
  if (fromIdx === null || fromIdx === toIdx) return;

  const arr = [...products.value];
  const [moved] = arr.splice(fromIdx, 1);
  arr.splice(toIdx, 0, moved);
  products.value = arr; // Оптимистичное обновление UI

  try {
    await reorderProducts(arr.map((p, i) => ({ id: p.id, sort_order: i })));
  } catch (e) {
    showToast('Ошибка сохранения порядка', 'error');
    await loadProducts(); // Откат при ошибке
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// РЕДАКТИРОВАНИЕ ТОВАРА
// ═════════════════════════════════════════════════════════════════════════════
const editingProdId      = ref(null);
const editProdName       = ref('');
const editProdDesc       = ref('');
const editProdCategoryId = ref(null);
const editProdImageUrl   = ref('');
const editProdPrice      = ref('');

function startEditProd(prod) {
  editingProdId.value      = prod.id;
  editProdName.value       = prod.name;
  editProdDesc.value       = prod.description || '';
  editProdCategoryId.value = prod.category_id;
  editProdImageUrl.value   = prod.image_url;
  editProdPrice.value      = prod.price || '';
}

async function saveEditProd(id) {
  if (!editProdName.value.trim() || !editProdImageUrl.value.trim()) return;
  prodLoading.value = true;
  try {
    await updateProduct(id, {
      name:        editProdName.value.trim(),
      description: editProdDesc.value.trim() || null,
      category_id: editProdCategoryId.value,
      image_url:   editProdImageUrl.value.trim(),
      price:       parseInt(editProdPrice.value, 10) || 0,
    });
    editingProdId.value = null;
    await loadProducts();
    showToast('Товар обновлён');
  } catch (e) {
    prodError.value = e.message;
    showToast(e.message, 'error');
  } finally {
    prodLoading.value = false;
  }
}

// ─── Инициализация ────────────────────────────────────────────────────────────
onMounted(async () => {
  await loadCategories();
});
</script>

<style scoped>
/* ─── Toast ──────────────────────────────────────────────────────────────── */
.toast {
  position: fixed;
  top: 80px;
  right: 24px;
  z-index: 200;
  padding: 12px 24px;
  border: 1px solid var(--color-outline-variant);
  background: var(--color-background);
  font-size: var(--fs-label-sm);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  pointer-events: none;
}

.toast--success {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.toast--error {
  border-color: #ff4444;
  color: #ff4444;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.2s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
}

/* ─── Шапка ──────────────────────────────────────────────────────────────── */
.admin-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.admin-logout {
  align-self: center;
}

/* ─── Вкладки ────────────────────────────────────────────────────────────── */
.admin-tabs {
  display: flex;
  gap: 0;
  margin-top: 40px;
  margin-bottom: 0;
  border-bottom: 1px solid var(--color-outline-variant);
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--color-on-surface-variant);
  font-size: var(--fs-label-sm);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  cursor: pointer;
  transition: color var(--transition-default), border-color var(--transition-default);
  margin-bottom: -1px;
}

.tab-btn:hover {
  color: var(--color-primary);
}

.tab-btn--active {
  border-bottom-color: var(--color-primary);
  color: var(--color-primary);
}

/* ─── Секции внутри вкладок ─────────────────────────────────────────────── */
.admin-section-label {
  margin-bottom: 24px;
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 560px;
}

.admin-textarea {
  resize: vertical;
  min-height: 72px;
  font-family: inherit;
  font-size: inherit;
}

.form-preview {
  width: 120px;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border: 1px solid var(--color-outline-variant);
}

/* ─── Список строк (категории) ───────────────────────────────────────────── */
.admin-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-outline-variant);
  flex-wrap: wrap;
}

.admin-row__name {
  flex: 1;
  min-width: 140px;
}

.admin-row__actions {
  display: flex;
  gap: 8px;
}

.admin-row__edit-input {
  flex: 1;
  min-width: 160px;
}

.admin-row__edit-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
}

/* ─── Таблица товаров ────────────────────────────────────────────────────── */
.admin-bulk-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 0;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.admin-table th,
.admin-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--color-outline-variant);
  vertical-align: middle;
}

.admin-table th {
  font-size: var(--fs-label-sm);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.table-thumb {
  width: 40px;
  height: 50px;
  object-fit: cover;
  display: block;
}

/* ─── Кнопки ─────────────────────────────────────────────────────────────── */
.btn-sm {
  padding: 6px 14px;
  font-size: var(--fs-label-sm);
}

.btn-danger {
  color: #ff4444;
}

.btn-danger:not(:disabled):hover {
  border-color: #ff4444;
}

/* ─── Ошибки / пустые состояния ─────────────────────────────────────────── */
.error-text {
  color: #ff4444;
  font-size: var(--fs-body-md);
  border-left: 2px solid #ff4444;
  padding-left: 12px;
}

.admin-empty {
  padding: 48px 0;
}

/* ─── Divider-модификаторы (РЕК-4 — замена инлайн style=) ───────────────── */
.divider--tabs    { margin: 0 0 40px; }
.divider--section { margin: 40px 0; }

/* ─── Drag-and-drop ──────────────────────────────────────────────────────── */
.drag-handle {
  cursor: grab;
  color: var(--color-on-surface-variant);
  font-size: 18px;
  line-height: 1;
  padding: 0 4px;
  user-select: none;
  flex-shrink: 0;
  transition: color var(--transition-default);
}

.drag-handle:hover {
  color: var(--color-primary);
}

.row--drag-over {
  border-top: 2px solid var(--color-primary);
}

.td-drag-check {
  white-space: nowrap;
  vertical-align: middle;
}

.td-drag-check .drag-handle {
  display: inline-block;
  vertical-align: middle;
  margin-right: 6px;
}

.td-drag-check input[type="checkbox"] {
  display: inline-block;
  vertical-align: middle;
}

.th-drag-check {
  width: 80px;
}

.td-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* ─── Форма редактирования товара (expand row) ───────────────────────────── */
.admin-table__edit-row td {
  background-color: var(--color-surface-container);
  border-bottom: 2px solid var(--color-primary);
}

.prod-edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
  max-width: 560px;
}

.prod-edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

/* ─── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .admin-table th:nth-child(2),
  .admin-table td:nth-child(2) {
    display: none; /* скрываем колонку «Фото» на мобилке */
  }

  .admin-table th,
  .admin-table td {
    padding: 10px 8px;
  }
}

</style>
