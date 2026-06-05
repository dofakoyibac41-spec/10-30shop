# ─── Backend Dockerfile (multi-stage) ────────────────────────────────────────
# Stage "dev"  → nodemon, volume-монтирование кода, hot-reload
# Stage "production" → node server.js, без devDependencies, код внутри образа

# ─── Stage: base ─────────────────────────────────────────────────────────────
# Общий слой: Node.js 20 Alpine, WORKDIR, установка prod-зависимостей
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
# Устанавливаем только production-зависимости (без nodemon)
RUN npm install --omit=dev

# ─── Stage: dev ──────────────────────────────────────────────────────────────
# Dev-сборка: поверх base добавляем devDependencies (nodemon)
# Используется в docker-compose.yml через CMD ["npm", "run", "dev"]
FROM base AS dev

# Доустанавливаем devDependencies (nodemon)
RUN npm install

EXPOSE 3001

# Запуск через npm run dev — единственный источник истины о команде запуска в package.json.
CMD ["npm", "run", "dev"]

# ─── Stage: production ───────────────────────────────────────────────────────
# Prod-сборка: только prod-зависимости + код внутри образа
# Используется в docker-compose.prod.yml
FROM base AS production

# Копируем код приложения внутрь образа (нет volume-монтирования в prod)
COPY . .

EXPOSE 3001

# В продакшне — node напрямую, без nodemon
CMD ["node", "server.js"]
