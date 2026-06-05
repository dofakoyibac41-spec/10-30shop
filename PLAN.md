# 🛒 10:30 AM — План разработки

## Описание проекта

Интернет-магазин мужской одежды **10:30 AM** с публичной витриной и простой админкой для управления товарами.
Картинки товаров хранятся в облаке (например Cloudinary / ImgBB / Google Drive) — админ загружает фото вручную, сайт получает их по URL.

---

## Технический стек

| Слой | Технология | Назначение |
|---|---|---|
| **Frontend** | Vue.js 3 + Vite | Реактивный UI, SPA |
| **Стили** | Vanilla CSS | Дизайн-токены из Stitch |
| **Backend** | Node.js + Express | REST API |
| **База данных** | SQLite (better-sqlite3) | Хранение товаров |
| **Docker** | Docker + Docker Compose | Изолированные контейнеры, единая среда |
| **Хостинг** | Timeweb VPS | Деплой через Docker Compose |
| **Reverse Proxy** | Nginx (в контейнере) | Статика + проксирование `/api` |

---

## 🎨 Дизайн-система (Stitch — Editorial Brutalism)

> Токены сохранены в `frontend/design-tokens.yaml`

### Цвета

| Переменная | Значение | Назначение |
|---|---|---|
| `background` | `#121314` | Основной фон |
| `surface-container` | `#1f2020` | Фон карточек |
| `on-surface` | `#e4e2e2` | Основной текст |
| `on-surface-variant` | `#c4c7c8` | Второстепенный текст |
| `outline-variant` | `#444748` | Границы, разделители |
| `primary` | `#ffffff` | Активные элементы, CTA |

### Типографика

| Стиль | Шрифт | Размер | Назначение |
|---|---|---|---|
| `headline-xl` | Space Grotesk 700 | 80px | Главный заголовок Hero |
| `headline-lg` | Space Grotesk 700 | 48px | Заголовки секций |
| `headline-md` | Space Grotesk 600 | 24px | Разделы, названия |
| `body-lg` | Inter 400 | 18px | Основной текст |
| `label-sm` | Inter 600 | 12px | Метки, теги, категории (UPPERCASE) |

### Правила UI
- Все углы **строго 0px** (без скругления)
- Глубина через **тональную слоистость**, не тени
- Границы элементов: 1px solid `#444748`
- Hover: граница становится `#ffffff`, переход 0.25s ease-in-out
- Блок-кнопка: `#F0F0F0` фон, `#111111` текст
- Инпуты: только нижняя граница, фокус → `#ffffff`
- Отступы: кратны 8px, гатер секций 120px

---

## Структура проекта

```
shop/
├── design-reference/      # Дизайн из Stitch (не входит в сборку)
│   ├── main/               # Дизайн главной страницы
│   │   ├── screen.png      # Макет главной страницы
│   │   ├── code.html       # HTML-код страницы
│   │   └── DESIGN.md       # Спецификация дизайна
│   ├── catalog/            # Дизайн страницы каталога
│   │   ├── screen.png      # Макет каталога
│   │   ├── code.html       # HTML-код страницы
│   │   └── DESIGN.md       # Спецификация дизайна
│   ├── logo/               # Ассеты бренда
│   │   ├── logo.png        # Логотип магазина
│   │   └── main-photo.png  # Фото для Hero-секции главной
│   └── design-tokens.yaml  # CSS-токены Stitch (Editorial Brutalism)
│
├── frontend/          # Vue.js + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.vue
│   │   │   ├── CatalogPage.vue
│   │   │   ├── AdminPage.vue
│   │   │   └── LoginPage.vue
│   │   ├── components/
│   │   │   ├── NavBar.vue
│   │   │   ├── ProductCard.vue
│   │   │   ├── CategoryFilter.vue
│   │   │   └── Footer.vue
│   │   ├── composables/
│   │   │   └── useAuth.js
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── App.vue
│   │   └── main.js
│   ├── Dockerfile
│   └── index.html
│
├── backend/           # Node.js + Express
│   ├── db/
│   │   └── shop.db
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── categories.js
│   │   └── auth.js
│   ├── db.js
│   ├── server.js
│   └── Dockerfile
│
├── docker-compose.yml
└── docker-compose.prod.yml
```

> **Изоляция Docker:** в `docker-compose.yml` задано `name: 1030shop` — все контейнеры проекта получают префикс `1030shop-`, что исключает конфликт с другими проектами в Docker Desktop.

---

## Модель данных

### Таблица `products`

| Поле | Тип | Описание |
|---|---|---|
| `id` | INTEGER PK | Авто-инкремент |
| `name` | TEXT | Название товара |
| `description` | TEXT | Описание |
| `category_id` | INTEGER FK | Ссылка на категорию |
| `image_url` | TEXT | Публичный URL картинки из облака |
| `created_at` | TEXT | Дата добавления |

> Фото хранится вне сайта (облако). В БД сохраняется только ссылка (URL). Файлы не загружаются на сервер.

### Таблица `categories`

| Поле | Тип | Описание |
|---|---|---|
| `id` | INTEGER PK | Авто-инкремент |
| `name` | TEXT | Название категории |
| `image_url` | TEXT | URL обложки категории (отображается на главной) |

> Категории динамические — создаются и удаляются через админку.
> `image_url` необязательный — если не задан, карточка показывает тёмный placeholder.

---

## API Endpoints

| Метод | URL | Защита | Описание |
|---|---|---|---|
| `GET` | `/api/products` | Публичный | Все товары (+ `total` в ответе) |
| `GET` | `/api/products?category_id=2` | Публичный | Фильтр по категории |
| `GET` | `/api/products?limit=6&offset=0` | Публичный | Пагинация (кнопка «Показать ещё») |
| `POST` | `/api/products` | 🔒 JWT | Добавить товар |
| `DELETE` | `/api/products/:id` | 🔒 JWT | Удалить товар |
| `DELETE` | `/api/products/bulk` | 🔒 JWT | Удалить массив товаров (bulk) |
| `GET` | `/api/categories` | Публичный | Все категории (с `image_url`) |
| `POST` | `/api/categories` | 🔒 JWT | Создать категорию |
| `DELETE` | `/api/categories/:id` | 🔒 JWT | Удалить категорию |
| `POST` | `/api/auth/login` | Публичный | Получить JWT токен |

> 🔒 JWT — запрос проходит через middleware `authMiddleware`, проверяющий токен в заголовке `Authorization: Bearer <token>`

> Ответ GET `/api/products` возвращает `{ items: [...], total: 24 }` — для отображения счётчика «N ПОЗИЦИЙ» и кнопки «Показать ещё»

> ⚠️ **Важно для Express:** маршрут `/bulk` должен быть зарегистрирован **строго раньше** `/:id`, иначе Express примет слово `bulk` за ID.
> ```js
> router.delete('/bulk', authMiddleware, bulkHandler)  // ← сначала
> router.delete('/:id', authMiddleware, deleteHandler) // ← потом
> ```

---

## Страницы

### 🏠 Главная (`/`)
- Навбар: лого `10:30` слева, навигация ГЛАВНАЯ / КАТАЛОГ / О НАС справа, активный пункт с подчёркиванием
- «О НАС» — якорная ссылка на статичную секцию внизу главной страницы (отдельной страницы нет)
- Hero: левая колонка — крупный текст 3 строки + кнопка «СМОТРЕТЬ КОЛЛЕКЦИЮ»; правая — тёмное фото с силуэтом
- Секция «— КАТЕГОРИИ —»: сетка 2×2, карточки с фото из `image_url` категории, название внизу
- Если у категории нет `image_url` — тёмный placeholder `#1f2020`
- Клик по карточке → каталог с предустановленным фильтром этой категории
- Футер: лого / копирайт / соцсети (Instagram, TikTok, Twitter)

### 👕 Каталог (`/catalog`)
- Навбар: активный пункт «КАТАЛОГ» подчёркнут
- Заголовок «КАТАЛОГ» + счётчик «N ПОЗИЦИЙ» (из `total` в API)
- Фильтр-чипы: ВСЕ / + динамические категории из API; активный — белый фон
- Сетка 3 колонки: карточка — тег категории сверху, фото, название (UPPERCASE), статус «Доступно»
- Кнопка «ПОКАЗАТЬ ЕЩЁ» по центру — ghost-кнопка, догружает следующие 6 товаров (limit/offset)
- Кнопка скрывается когда все товары загружены (`offset + limit >= total`)
- При смене фильтра категории `offset` сбрасывается в `0` и список товаров загружается заново
- Состояние «нет товаров» при пустом каталоге или фильтре

### 🔐 Авторизация (`/admin/login`)
- Страница входа: поля «Логин» и «Пароль»
- Логин/пароль хранятся в `.env` на бэкенде
- После успешного входа — JWT токен сохраняется в `localStorage`
- Все защищённые запросы к API отправляют токен в заголовке `Authorization: Bearer <token>`
- Без токена — редирект на `/admin/login`

### 🔐 Админка (`/admin`)

**Раздел «Категории»:**
- Форма создания новой категории: название + URL обложки (необязательно)
- Превью фото категории по URL непосредственно в форме
- Список категорий с кнопкой удалить каждую
- При удалении категории с товарами — **запрет удаления** + сообщение об ошибке (сначала удали товары)

**Раздел «Товары»:**
- Форма добавления товара (название, описание, категория из списка, картинка)
- Поле ввода URL картинки — админ заранее загружает фото в облако (например Cloudinary) и вставляет готовую ссылку
- Превью картинки по URL непосредственно в форме до сохранения
- Список всех товаров с кнопкой удалить

---

## Спринты

---

### ✅ Sprint 0 — Docker-окружение
**Цель:** Изолированный контейнер для разработки, видимый в Docker Desktop
**Статус: ✅ ВЫПОЛНЕНО** (2026-06-05, ревью v4 принято)

**Задачи:**
- [x] Создать `backend/Dockerfile` — Node.js образ с hot-reload (`nodemon`)
- [x] Создать `frontend/Dockerfile` — Vite dev-сервер в контейнере
- [x] Создать `docker-compose.yml` в корне проекта:
  - `name: 1030shop` — **изоляция** от других проектов в Docker Desktop
  - Сервис `1030shop-backend`: порт `3001:3001`, volume для кода и SQLite
  - Сервис `1030shop-frontend`: порт `5173:5173`, volume для кода
  - Named volume `1030shop-db` для хранения `shop.db` (данные не теряются)
  - `target: dev` для обоих сервисов (multi-stage Dockerfile)
- [x] Проверить запуск: `docker compose up` → оба контейнера видны в Docker Desktop
- [x] Убедиться что фронт открывается на `localhost:5173`, бэкенд на `localhost:3001`
- [x] Настроить CORS (ALLOWED_ORIGINS), JWT_SECRET, ADMIN_PASSWORD в `.env`
- [x] Multi-stage Dockerfiles: dev / production для backend и frontend
- [x] `docker-compose.prod.yml` + `nginx/nginx.prod.conf` для продакшна

> Пример структуры `docker-compose.yml`:
> ```yaml
> name: 1030shop
> services:
>   backend:
>     container_name: 1030shop-backend
>     build:
>       context: ./backend
>       target: dev
>     ports: ["3001:3001"]
>     volumes:
>       - ./backend:/app
>       - 1030shop-db:/app/db
>     env_file: ./backend/.env
>   frontend:
>     container_name: 1030shop-frontend
>     build:
>       context: ./frontend
>       target: dev
>     ports: ["5173:5173"]
>     volumes:
>       - ./frontend:/app
>       - /app/node_modules
> volumes:
>   1030shop-db:
>     name: 1030shop-db
> ```

**Результат:** Проект запускается одной командой `docker compose up`, виден в Docker Desktop как `1030shop`

### ✅ Sprint 1 — Фундамент
**Цель:** Рабочая структура проекта, бэкенд с БД, базовый API
**Статус: ✅ ВЫПОЛНЕНО** (2026-06-05, ревью v1 принято, 27/27 тестов)

**Задачи:**
- [x] Инициализация Vite + Vue.js проекта (`frontend/`)
- [x] Создание stub-компонентов для всех страниц (`HomePage.vue`, `CatalogPage.vue`, `AdminPage.vue`, `LoginPage.vue`) — пустые заглушки
- [x] Настройка Vue Router (4 маршрута: /, /catalog, /admin, /admin/login) — подключить stub-компоненты
- [x] Инициализация Node.js + Express проекта (`backend/`)
- [x] Подключение SQLite, создание таблиц `products` и `categories`
- [x] Наполнение БД тестовыми категориями и товарами
- [x] Реализация GET/POST/DELETE `/api/categories`
- [x] Реализация GET `/api/products` с фильтром по `category_id`, пагинацией (`limit`/`offset`) и полем `total` в ответе
- [x] Реализация POST `/api/products`
- [x] Реализация DELETE `/api/products/:id`
- [x] Реализация DELETE `/api/products/bulk` (**зарегистрирован до `/:id`** в `products.js`)
- [x] Реализация POST `/api/auth/login` + `authMiddleware`
- [x] Настройка CORS между фронтом и бэком

**Результат:** API работает, данные читаются и пишутся

---

### ✅ Sprint 2 — Дизайн-система *(выполнено: 2026-06-05)*
**Цель:** CSS токены из Stitch, базовые компоненты по макетам Stitch

> 📌 **Источники дизайна** (все в `design-reference/`):
> - `design-tokens.yaml` — CSS-токены (Editorial Brutalism)
> - `main/screen.png` — макет Главной страницы
> - `catalog/screen.png` — макет Каталога
> - `logo/logo.png` — логотип магазина
> - `logo/main-photo.png` — фото для Hero-секции
> - `main/code.html`, `catalog/code.html` — HTML-код страниц из Stitch

**Задачи:**
- [x] Перенос цветов из `design-reference/design-tokens.yaml` в CSS переменные → `src/styles/tokens.css`
- [x] Подключение Google Fonts: **Space Grotesk** (700) + **Inter** (400, 600) в `index.html`
- [x] CSS-классы типографики: `.headline-xl/xl-mobile/lg/md`, `.body-lg/md`, `.label-sm` → `typography.css`
- [x] Глобальный сброс: `border-radius: 0 !important`, `box-sizing`, body vars → `reset.css`
- [x] Утилиты: `.container`, `.btn-primary`, `.btn-ghost`, `.input-underline`, `.divider` → `utilities.css`
- [x] Компонент `NavBar.vue` — sticky 64px, 1px border-bottom, лого, `label-sm` навигация
- [x] Компонент `Footer.vue` — 1px border-top, бренд + копирайт, responsive
- [x] Компонент `ProductCard.vue` — `aspect-ratio: 4/5`, hover `scale(1.03)`, `computed displayImage`
- [x] Компонент `CategoryFilter.vue` — чипы, active state, `emit('select')`, mobile horizontal scroll
- [x] `App.vue` — чистый layout NavBar/RouterView/Footer, без инлайн-стилей
- [x] Stub-страницы используют дизайн-систему: `.container`, `.headline-xl`, кнопки
- [x] Hero-секция `HomePage.vue` — двухколоночный grid, `main-photo.png` справа (4:5)
- [x] `public/logo.png`, `public/main-photo.png`, `public/favicon.svg` скопированы
- [x] Responsive layout: 3→2→1 колонки, мобильные отступы 24px

**Ревью:** REVIEW_REPORT_v2 — 0 критических замечаний. 2 критических бага найдены в v1 и исправлены (computed reactivity, favicon 404), 2 рекомендации выполнены.

**Результат:** Дизайн-система готова. Компоненты соответствуют макетам Stitch. Визуально: Editorial Brutalism, монохром, sharp shapes 0px.

---

### ✅ Sprint 3 — Публичные страницы *(выполнено: 2026-06-05)*
**Цель:** Главная и каталог полностью рабочие

**Задачи:**
- [x] Vite proxy `/api` → `http://backend:3001` — единая точка API в приложении
- [x] `composables/useApi.js` — `apiFetch`, `getCategories()`, `getProducts({categoryId, limit, offset})`
- [x] Backend валидация: `?category_id=abc` → `400 Bad Request` (закрыт РЕК-2 из Sprint 1)
- [x] `HomePage.vue` — Hero + динамическая сетка категорий из API (3 состояния: skeleton / ошибка / данные)
- [x] `HomePage.vue` — секция `id="about"` (якорь для NavBar `«О нас»`)
- [x] Клик по категории на главной → `/catalog?category=N` (фильтр применяется сразу)
- [x] `NavBar.vue` — `«О нас»` → `RouterLink to="/#about" exact` (не `<a href>`)
- [x] `CatalogPage.vue` — реальные товары из API, счётчик `N ПОЗИЦИЙ`
- [x] Фильтрация по категории (реактивно, без перезагрузки) — `onCategorySelect` сбрасывает `offset = 0`
- [x] Кнопка `«Показать ещё»` — пагинация limit/offset, `hasMore = computed(() => offset < total)`
- [x] Открытие `/catalog?category=N` с уже применённым фильтром (`route.query.category`)
- [x] Состояние «Товаров нет» + кнопка «Смотреть все»
- [x] `TransitionGroup` — плавный fade при смене фильтра
- [x] Skeleton-загрузчики на время загрузки (6 шт., анимация pulse)
- [x] Параллельная загрузка `getCategories` + `loadProducts` через `Promise.all`

**Ревью:** REVIEW_REPORT_v2 — 0 новых замечаний. 1 критическое (инлайн-стиль) + 2 рекомендации (параллелизм, exact) — все исправлены.

**Результат:** Посетитель может просматривать и фильтровать товары. Главная страница показывает категории. Каталог работает с реальным API.

---

### 🔐 Sprint 4 — Админка
**Цель:** Рабочая панель управления товарами

**Задачи:**
- [ ] Страница `/admin/login` — форма логин + пароль
- [ ] Создание `useAuth.js` composable — хранение токена в `localStorage`, методы `login()`, `logout()`, `getToken()`
- [ ] Логика авторизации: POST `/api/auth/login` → получить JWT → сохранить через `useAuth.js`
- [ ] **[РЕК-3 из ревью Sprint 1 — обязательно]** Route guard во Vue Router — `router.beforeEach`: если путь начинается с `/admin` (кроме `/admin/login`) и нет токена в `localStorage` → редирект на `/admin/login`
- [ ] `AdminPage.vue` — две вкладки: «Категории» и «Товары»
- [ ] Форма создания категории: название + URL обложки (необязательно) + превью
- [ ] Список категорий с удалением (запрет если в ней есть товары)
- [ ] **[РЕК-1 из ревью Sprint 1]** Редактирование категории: `PATCH /api/categories/:id` на бэкенде + форма редактирования в UI (переименовать категорию без удаления)
- [ ] Форма добавления товара (название, описание, категория, картинка)
- [ ] Выпадающий список категорий в форме товара (из API)
- [ ] Поле URL картинки — валидация что URL не пустой
- [ ] Превью картинки по URL прямо в форме (тег `<img>` по URL)
- [ ] Список товаров с чекбоксом у каждого товара
- [ ] Чекбокс «Выбрать все» в шапке таблицы
- [ ] Кнопка «Удалить выбранные (N)» — активна только если что-то выбрано
- [ ] DELETE `/api/products/bulk` — принимает массив `ids`, удаляет все сразу
- [ ] Одиночное удаление товара (кнопка у каждой строки)
- [ ] Кнопка «Выйти» — очищает токен, редирект на `/admin/login`
- [ ] Уведомления об успехе/ошибке

**Результат:** Можно добавлять и удалять товары через UI

---

### 🚀 Sprint 5 — Деплой
**Цель:** Сайт доступен в интернете

**Задачи:**
- [ ] Подключение к серверу Timeweb по SSH
- [ ] Установка Node.js, npm, PM2 на сервере
- [ ] Деплой бэкенда: клонировать репозиторий, запустить через PM2
- [ ] Настройка `.env` на сервере (логин/пароль админки, порт)
- [ ] Сборка фронтенда: `npm run build` → папка `dist/`
- [ ] Настройка Nginx: отдавать `dist/` статику, проксировать `/api` на бэкенд
- [ ] Финальное тестирование на продакшн-окружении
- [ ] Проверка мобильной версии

**Результат:** Сайт работает по публичной ссылке

---

## Оценка времени

| Спринт | Описание | Время |
|---|---|---|
| Sprint 0 | Docker-окружение | ✅ Готово |
| Sprint 1 | Фундамент | ✅ Готово |
| Sprint 2 | Дизайн-система | ✅ Готово |
| Sprint 3 | Публичные страницы | ✅ Готово |
| Sprint 4 | Админка | ~45 мин |
| Sprint 5 | Деплой на Timeweb | ~30 мин |
| **Итого** | | **~1ч 15 мин осталось** |

---

## Открытые вопросы

> Все вопросы решены. **Готов к разработке.** Стартуем с Sprint 1.
