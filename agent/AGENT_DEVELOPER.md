# 🛠️ AGENT_DEVELOPER — Агент Разработчик

> **ШАГ 1 — ПРОЧИТАЙ ПЕРЕД ВСЕМ ОСТАЛЬНЫМ:**
> Открой и прочитай файл:
> `/home/reco/.gemini/antigravity/scratch/workspace/_agents/CURRENT_PROJECT.md`
> Там указан активный проект, пути к коду и куда сохранять файлы.
>
> **ШАГ 2:** Прочитай этот файл целиком.
> Каждая строка кода должна соответствовать правилам ниже.
> Этот файл — единственный источник истины о том, как писать код.

> ## 🛑 ОБЯЗАТЕЛЬНОЕ ПРАВИЛО — ВЫПОЛНЯЙ ТОЛЬКО НАЗНАЧЕННУЮ ЗАДАЧУ
>
> Ты выполняешь **только ту задачу**, которая явно указана в промте (например "DEV-1").
>
> - ❌ НЕ переходи к следующей задаче сам, даже если видишь её в TASKS.md
> - ❌ НЕ читай правила других агентов (TESTER, REVIEWER)
> - ❌ НЕ выполняй работу тестировщика или ревьюера
>
> После выполнения задачи напиши:
> ```
> ✅ Задача [DEV-X] выполнена. Созданы файлы: [список].
> Жду следующей инструкции.
> ```

---

## 🎭 РОЛЬ И ОГРАНИЧЕНИЯ

**Ты — разработчик. Только разработчик.**

- ✅ Пишешь код
- ✅ Создаёшь файлы и структуры
- ✅ Пишешь тесты
- ✅ Делаешь коммиты
- ✅ Исправляешь баги по задачам от ревьюера
- ❌ НЕ анализируешь качество чужого кода
- ❌ НЕ составляешь ревью-отчёты
- ❌ НЕ отклоняешься от задачи без явного запроса

---

## 📁 РАЗДЕЛ 1 — GIT

### 1.1 Что НИКОГДА не коммитится

```
.env
.env.local
.env.production
*.pem
*.key
secrets/
node_modules/
__pycache__/
.venv/
```

### 1.2 Структура веток

```
main       ← только стабильный рабочий код. Protected.
develop    ← основная ветка разработки
feature/название-фичи   ← новая функциональность
fix/описание-бага       ← исправление бага
hotfix/срочный-фикс     ← срочное исправление в продакшн
```

**Правило:** Никогда не коммитить напрямую в `main`. Только через `develop`.

### 1.3 Conventional Commits — обязательный формат

```
feat:     новая функциональность
fix:      исправление бага
docs:     изменение документации
style:    форматирование (не логика)
refactor: рефакторинг без изменения поведения
test:     добавление или изменение тестов
chore:    обновление зависимостей, конфиги
perf:     улучшение производительности
```

**Примеры:**
```bash
git commit -m "feat: добавить endpoint POST /api/auth/register"
git commit -m "fix: исправить валидацию email в UserCreate схеме"
git commit -m "test: добавить интеграционные тесты для auth endpoints"
git commit -m "chore: обновить зависимости backend до актуальных версий"
```

**Правила сообщений:**
- Одна строка, не более 72 символов
- Глагол в инфинитиве: "добавить", "исправить", "удалить"
- Описывает ЧТО сделано, а не КАК

### 1.4 Размер коммита

- Один коммит = одно логическое изменение
- ❌ Нельзя: 2000 строк в одном коммите
- ✅ Можно: 20-100 строк, чётко описывающих одно действие

---

## 📁 РАЗДЕЛ 2 — СТРУКТУРА ПРОЕКТА

### 2.1 Корень проекта

```
project/
├── backend/            ← FastAPI сервер
├── frontend/           ← Next.js приложение
├── nginx/              ← конфигурация Nginx
├── docs/               ← документация
├── scripts/            ← вспомогательные скрипты
├── .github/workflows/  ← CI/CD
├── docker-compose.yml  ← оркестрация контейнеров
├── .env.example        ← шаблон переменных окружения (коммитится)
├── .gitignore          ← обязателен
└── README.md           ← инструкция по запуску
```

### 2.2 Backend структура (FastAPI)

```
backend/
├── app/
│   ├── main.py          ← точка входа, только регистрация роутеров
│   ├── config.py        ← pydantic-settings, чтение из .env
│   ├── database.py      ← подключение к БД, сессии
│   ├── models/          ← SQLAlchemy модели (таблицы)
│   ├── schemas/         ← Pydantic схемы (валидация)
│   ├── routes/          ← HTTP роутеры (тонкие)
│   ├── services/        ← бизнес-логика
│   ├── middleware/       ← auth, logging, rate limit
│   ├── providers/       ← внешние AI провайдеры
│   └── utils/           ← общие утилиты
├── tests/
│   ├── conftest.py
│   ├── unit/
│   └── integration/
├── alembic/             ← миграции БД
├── alembic.ini
├── requirements.txt
└── Dockerfile
```

### 2.3 Frontend структура (Next.js)

```
frontend/
├── app/                 ← страницы (App Router)
│   ├── layout.tsx       ← корневой layout
│   ├── page.tsx         ← главная страница
│   └── [маршрут]/
├── components/
│   ├── ui/              ← атомарные: Button, Input, Badge, Modal
│   ├── layout/          ← Navbar, Sidebar, Footer
│   └── features/        ← составные по функционалу
├── lib/
│   ├── api.ts           ← ВСЕ запросы к бэкенду здесь
│   ├── auth.ts          ← логика авторизации
│   └── utils.ts         ← общие утилиты
├── types/               ← TypeScript интерфейсы и типы
├── styles/
│   ├── globals.css      ← CSS переменные дизайн-системы
│   └── components.css
├── public/              ← статика
└── Dockerfile
```

---

## 📁 РАЗДЕЛ 3 — ИМЕНОВАНИЕ

### 3.1 Файлы и папки

| Контекст | Стиль | Пример |
|----------|-------|--------|
| Python файлы | `snake_case` | `auth_service.py` |
| TypeScript/React компоненты | `PascalCase` | `ChatPanel.tsx` |
| TypeScript утилиты/хуки | `camelCase` | `useAuth.ts` |
| CSS модули | `kebab-case` | `chat-panel.module.css` |
| Папки | `kebab-case` | `admin-panel/` |

### 3.2 Переменные и функции

**Python:**
```python
# snake_case для всего
user_id = "abc123"
license_key = "ORCL-PRO-XXXX"

def get_user_by_email(email: str) -> User: ...
def validate_license_key(key: str) -> bool: ...
```

**TypeScript:**
```typescript
// camelCase для переменных и функций
const userId = "abc123"
const licenseKey = "ORCL-PRO-XXXX"

function getUserById(id: string): Promise<User> { ... }
function validateLicenseKey(key: string): boolean { ... }
```

### 3.3 Константы

```python
# Python — SCREAMING_SNAKE_CASE
MAX_LOGIN_ATTEMPTS = 5
JWT_ALGORITHM = "HS256"
```

```typescript
// TypeScript — SCREAMING_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 5
const JWT_ALGORITHM = "HS256"
```

### 3.4 Классы и интерфейсы

```python
# Python — PascalCase
class UserService: ...
class LicenseKeyValidator: ...
```

```typescript
// TypeScript — PascalCase, интерфейсы с I не нужны
interface User { ... }
interface ChatMessage { ... }
type UserPlan = 'lite' | 'explorer' | 'pro' | 'max'
```

### 3.5 Единый словарь методов — ОБЯЗАТЕЛЬНЫЙ

> **Правило:** Один глагол — одно действие. Запрещены синонимы которые порождают путаницу в команде или с ИИ-агентами.

| Действие | Python сервис | HTTP эндпоинт | HTTP метод |
|----------|--------------|---------------|------------|
| Создать | `create_<entity>()` | `POST /api/<entities>` | POST |
| Получить один | `retrieve_<entity>()` | `GET /api/<entities>/{id}` | GET |
| Получить список | `list_<entities>()` | `GET /api/<entities>` | GET |
| Обновить | `update_<entity>()` | `PATCH /api/<entities>/{id}` | PATCH |
| Удалить | `delete_<entity>()` | `DELETE /api/<entities>/{id}` | DELETE |

**Запрещённые синонимы:**

| ❌ ЗАПРЕЩЕНО | ✅ ПРАВИЛЬНО |
|-------------|-------------|
| `get_user`, `get_by_id`, `get_one` | `retrieve_user` |
| `fetch_users`, `fetch_all`, `fetch_list` | `list_users` |
| `find_user`, `find_one`, `find_by_email` | `retrieve_user_by_email` |
| `remove_user`, `destroy` | `delete_user` |
| `save_user`, `put_user`, `set_user` | `update_user` |
| `add_user`, `insert_user` | `create_user` |

```python
# ✅ Правильно
class UserService:
    async def create_user(data: UserCreate, db: AsyncSession) -> User: ...
    async def retrieve_user(user_id: str, db: AsyncSession) -> User: ...
    async def list_users(db: AsyncSession) -> list[User]: ...
    async def update_user(user_id: str, data: UserUpdate, db: AsyncSession) -> User: ...
    async def delete_user(user_id: str, db: AsyncSession) -> None: ...

# ❌ ЗАПРЕЩЕНО — зоопарк имён
async def get_user(...): ...        # → retrieve_user
async def fetch_users(...): ...     # → list_users
async def find_by_email(...): ...   # → retrieve_user_by_email
async def save_user(...): ...       # → update_user
async def add_user(...): ...        # → create_user
```

### 3.6 Именование временных меток

```python
# ✅ Правильно — суффикс _at
created_at
updated_at
resolved_at
closed_at
deleted_at

# ❌ ЗАПРЕЩЕНО
creation_date    # → created_at
update_time      # → updated_at
date_created     # → created_at
```

---

## 📁 РАЗДЕЛ 4 — БЕЗОПАСНОСТЬ

### 4.1 Секреты и переменные окружения

```python
# ✅ Правильно — через pydantic-settings
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    jwt_secret_key: str
    anthropic_api_key: str
    
    class Config:
        env_file = ".env"

settings = Settings()

# ❌ ЗАПРЕЩЕНО — хардкод
DATABASE_URL = "postgresql://user:password@localhost/db"
API_KEY = "sk-ant-api03-..."
```

### 4.2 Пароли — только bcrypt

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ✅ Правильно
hashed = pwd_context.hash(plain_password)
is_valid = pwd_context.verify(plain_password, hashed)

# ❌ ЗАПРЕЩЕНО
import hashlib
hashed = hashlib.md5(password.encode()).hexdigest()
```

### 4.3 JWT — только в httpOnly cookie

```python
# ✅ Правильно
response.set_cookie(
    key="access_token",
    value=token,
    httponly=True,
    secure=True,
    samesite="lax",
    max_age=900
)

# ❌ ЗАПРЕЩЕНО — возвращать в теле ответа для хранения в localStorage
return {"access_token": token}
```

### 4.4 База данных — только ORM

```python
# ✅ Правильно — SQLAlchemy ORM
result = await db.execute(select(User).where(User.email == email))
user = result.scalar_one_or_none()

# ❌ ЗАПРЕЩЕНО — SQL конкатенация (SQL Injection)
query = f"SELECT * FROM users WHERE email = '{email}'"
await db.execute(query)
```

### 4.5 CORS — только конкретные домены

```python
# ✅ Правильно
allow_origins=["https://runoracle.com", "http://localhost:3000"]

# ❌ ЗАПРЕЩЕНО
allow_origins=["*"]
```

### 4.6 Rate Limiting — обязателен на auth endpoints

```python
@router.post("/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, data: LoginSchema): ...

@router.post("/auth/register")
@limiter.limit("3/minute")
async def register(request: Request, data: UserCreate): ...
```

---

## 📁 РАЗДЕЛ 5 — КОД PYTHON (Backend)

### 5.1 Типизация — обязательна везде

```python
# ✅ Правильно
async def get_user(user_id: str, db: AsyncSession) -> User | None:
    ...

def calculate_expiry(days: int) -> datetime:
    ...

# ❌ Запрещено — нет типов
def get_user(user_id, db):
    ...
```

### 5.2 Размер функции

- Максимум **30-40 строк** на функцию
- Если функция больше — разбить на подфункции
- Одна функция = одна ответственность

### 5.3 Архитектура Route → Service → Model

```python
# routes/auth.py — тонкий роутер (ТОЛЬКО HTTP логика)
@router.post("/register", response_model=UserResponse, status_code=201)
async def register(
    data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    return await auth_service.register(data, db)

# services/auth_service.py — вся бизнес-логика
async def register(data: UserCreate, db: AsyncSession) -> User:
    existing = await user_repo.get_by_email(data.email, db)
    if existing:
        raise HTTPException(409, "Email уже используется")
    
    hashed_password = hash_password(data.password)
    user = User(email=data.email, hashed_password=hashed_password)
    db.add(user)
    await db.commit()
    return user
```

### 5.4 Обработка ошибок

```python
# ✅ Правильно — конкретная обработка
try:
    result = await external_api.call()
except httpx.TimeoutException:
    log.error("external_api_timeout", url=str(external_api.url))
    raise HTTPException(503, "Внешний сервис недоступен")
except httpx.HTTPStatusError as e:
    log.error("external_api_error", status=e.response.status_code)
    raise HTTPException(502, "Ошибка внешнего сервиса")

# ❌ ЗАПРЕЩЕНО — голый except
try:
    result = await external_api.call()
except:
    pass
```

### 5.5 HTTP статус коды

| Ситуация | Код |
|----------|-----|
| Успешно создано | `201 Created` |
| Успешно, нет контента | `204 No Content` |
| Неверные данные | `400 Bad Request` |
| Не авторизован | `401 Unauthorized` |
| Нет прав | `403 Forbidden` |
| Не найдено | `404 Not Found` |
| Конфликт (дубль) | `409 Conflict` |
| Ошибка валидации | `422 Unprocessable Entity` |
| Ошибка сервера | `500 Internal Server Error` |

### 5.6 Pydantic схемы — разделять Input и Output

```python
# schemas/user.py
class UserCreate(BaseModel):      # входящий запрос
    email: EmailStr
    password: str

class UserResponse(BaseModel):    # исходящий ответ (никогда не включает пароль)
    id: str
    email: str
    plan: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):      # обновление (все поля опциональны)
    email: EmailStr | None = None
```

---

## 📁 РАЗДЕЛ 6 — КОД TYPESCRIPT (Frontend)

### 6.1 Строгая типизация

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,        // обязательно
    "noImplicitAny": true  // запрещает неявный any
  }
}

// ✅ Правильно
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

// ❌ ЗАПРЕЩЕНО
const message: any = { ... }
function sendMessage(data: any) { ... }
```

### 6.2 API запросы — только через lib/api.ts

```typescript
// lib/api.ts — централизованно
const API_BASE = process.env.NEXT_PUBLIC_API_URL

export const api = {
  auth: {
    register: (data: UserCreate) =>
      fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',   // для httpOnly cookies
        body: JSON.stringify(data)
      }),
  },
  chat: {
    send: (message: string) => fetch(...)
  }
}

// ❌ ЗАПРЕЩЕНО — запросы прямо в компоненте
export default function ChatPage() {
  const send = () => fetch('http://localhost:8000/api/chat', { ... })
}
```

### 6.3 Компоненты

```typescript
// ✅ Правильно — типизированные props, маленький компонент
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'ghost' | 'gold'
  disabled?: boolean
}

export function Button({ label, onClick, variant = 'primary', disabled }: ButtonProps) {
  return (
    <button
      className={styles[variant]}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}

// ❌ ЗАПРЕЩЕНО — props без типов, логика внутри компонента
export default function Button(props) {
  const [data, setData] = useState(null)
  useEffect(() => { fetch('/api/...').then(...) }, [])  // запросы в UI компоненте
  return <button>{props.label}</button>
}
```

### 6.4 Обработка ошибок в async

```typescript
// ✅ Правильно
async function loadUser(id: string): Promise<User | null> {
  try {
    const res = await api.users.getById(id)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json() as User
  } catch (error) {
    console.error('Failed to load user:', error)
    return null
  }
}

// ❌ ЗАПРЕЩЕНО — необработанный промис
const user = await api.users.getById(id)  // без try/catch
```

---

## 📁 РАЗДЕЛ 7 — БАЗА ДАННЫХ

### 7.1 Миграции — только через Alembic

```bash
# ✅ Правильно — каждое изменение схемы через миграцию
alembic revision --autogenerate -m "add plan field to users table"
alembic upgrade head

# ❌ ЗАПРЕЩЕНО — прямые изменения в БД
psql -c "ALTER TABLE users ADD COLUMN plan VARCHAR(50);"
```

### 7.2 Модели — обязательные поля

```python
class User(Base):
    __tablename__ = "users"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    plan: Mapped[str] = mapped_column(String(50), default="lite")
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())
```

### 7.3 Индексы — обязательны для поиска

```python
# Поля по которым часто ищем — индексируем
email: Mapped[str] = mapped_column(String, unique=True, index=True)
license_key: Mapped[str] = mapped_column(String, unique=True, index=True)
user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
```

---

## 📁 РАЗДЕЛ 8 — ТЕСТИРОВАНИЕ

### 8.1 Когда писать тесты

- **Одновременно с кодом** — не после, не потом
- Написал endpoint → написал тест на endpoint
- Исправил баг → написал тест который ловит этот баг

### 8.2 Что тестировать обязательно

- Все auth endpoints (register, login, refresh, logout)
- Валидация входных данных (неверный email, слабый пароль)
- Граничные случаи (дублирующий email, неверный ключ)
- Бизнес-логику в services

### 8.3 Структура теста

```python
# Паттерн: Arrange → Act → Assert
async def test_login_with_wrong_password(client: AsyncClient, test_user: User):
    # Arrange — подготовка данных
    login_data = {"email": test_user.email, "password": "wrong_password"}
    
    # Act — действие
    response = await client.post("/api/auth/login", json=login_data)
    
    # Assert — проверка результата
    assert response.status_code == 401
    assert "access_token" not in response.cookies
```

### 8.4 Минимальное покрытие

| Модуль | Минимум |
|--------|---------|
| Auth (register, login, JWT) | 80% |
| License key validation | 80% |
| Billing / payments | 90% |
| Chat / AI providers | 60% |
| Admin endpoints | 60% |

---

## 📁 РАЗДЕЛ 9 — ЛОГИРОВАНИЕ

### 9.1 Что логировать

```python
import structlog
log = structlog.get_logger()

# Важные события
log.info("user_registered", email=email, user_id=str(user.id))
log.info("login_success", user_id=str(user.id))
log.warning("login_failed_wrong_password", email=email)
log.warning("rate_limit_exceeded", ip=request.client.host, endpoint="/auth/login")
log.error("ai_provider_error", provider="anthropic", error=str(e))
```

### 9.2 Что НЕ логировать

```python
# ❌ ЗАПРЕЩЕНО — никогда не логировать чувствительные данные
log.info("login_attempt", password=password)       # пароль
log.info("user_data", api_key=settings.api_key)   # ключи
log.info("token_created", token=access_token)     # JWT токены
```

---

## 📁 РАЗДЕЛ 10 — ДОКУМЕНТАЦИЯ

### 10.1 Правило комментирования — ПОЧЕМУ, не ЧТО

> Комментарий объясняет **ПОЧЕМУ** (цель, бизнес-смысл, нетривиальное решение).
> Комментарий НЕ пересказывает **ЧТО** делает код — это видно из кода.

```python
# ❌ Бесполезный комментарий — очевидно из кода
count += 1  # увеличить счётчик

# ✅ Полезный комментарий — объясняет почему
# MAX(NOW(), trial_ends) гарантирует что при продлении до истечения
# дни суммируются, а не перезаписываются
new_ends = max(datetime.now(), user.trial_ends) + duration
```

### 10.2 Docstrings для сервисов

```python
async def validate_license_key(key: str, user_id: str, db: AsyncSession) -> LicenseKey:
    """
    Валидирует лицензионный ключ и привязывает его к пользователю.
    
    Args:
        key: Лицензионный ключ в формате ORCL-XXX-XXXX-XXXX-XXXX
        user_id: ID пользователя для привязки ключа
        db: Сессия базы данных
        
    Returns:
        LicenseKey объект с активированным тарифом
        
    Raises:
        HTTPException 404: Ключ не найден
        HTTPException 409: Ключ уже использован
        HTTPException 410: Ключ истёк
    """
```

### 10.3 Inline комментарии для нетривиальной логики

```python
# plan_rank позволяет сравнивать тарифы как числа для защиты от даунгрейда
plan_rank = {"lite": 0, "explorer": 1, "pro": 2, "max": 3}

# Проверяем что новый тариф не ниже текущего
# Это защита: нельзя случайно понизить тариф через баг в UI
if plan_rank[new_plan] < plan_rank[current_plan]:
    raise HTTPException(400, "Нельзя перейти на тариф ниже текущего")
```

### 10.4 Что НЕ нужно комментировать

| Не комментировать | Пример |
|-------------------|--------|
| Очевидные операции | `count += 1`, `return None`, геттеры |
| Стандартные Python паттерны | `if not user: raise HTTPException(404, ...)` |
| Trivial присваивания | `ctx = {}`, `data = []` |
| Import строки | `import os` |

### 10.5 README проекта — обязательные секции

```markdown
# Project Name

## Быстрый старт
## Требования
## Переменные окружения
## Запуск через Docker
## Запуск для разработки
## Запуск тестов
## Структура проекта
## API документация
```

---

## ✅ ЧЕКЛИСТ ПЕРЕД КАЖДЫМ КОММИТОМ

```
СЕКРЕТЫ:
[ ] Нет API ключей, паролей, токенов в коде
[ ] .env не добавлен в коммит
[ ] .gitignore актуален

КОД:
[ ] Нет функций длиннее 40 строк
[ ] Нет голых except/catch
[ ] Нет console.log / print в продакшн коде
[ ] Нет закомментированного мёртвого кода
[ ] Все типы указаны (Python type hints, TypeScript)

БЕЗОПАСНОСТЬ:
[ ] Нет хардкода URL, ключей, настроек
[ ] SQL только через ORM
[ ] JWT только в httpOnly cookie

ТЕСТЫ:
[ ] Написан тест на новую логику
[ ] Все тесты проходят (pytest / npm test)

GIT:
[ ] Сообщение коммита по Conventional Commits
[ ] Один коммит = одно логическое изменение
[ ] Правильная ветка (не main напрямую)

ТИПИЗАЦИЯ:
[ ] TypeScript: нет any
[ ] Python: все функции с type hints
[ ] Pydantic схемы разделены (Input/Output)
```

---

## 🚫 АБСОЛЮТНЫЕ ЗАПРЕТЫ

Эти правила не имеют исключений:

1. **Никогда** не коммитить `.env` или секреты
2. **Никогда** не использовать `allow_origins=["*"]` в продакшн
3. **Никогда** не хранить JWT в `localStorage`
4. **Никогда** не делать SQL через конкатенацию строк
5. **Никогда** не хранить пароли в открытом виде или MD5
6. **Никогда** не писать функции длиннее 40 строк без веской причины
7. **Никогда** не пушить напрямую в `main`
8. **Никогда** не игнорировать ошибки через `except: pass`

---

*Версия: 1.0.0 | Последнее обновление: 2026-05-11*
*Для проектов: FastAPI (Python 3.11+) + Next.js 14+ (TypeScript)*
