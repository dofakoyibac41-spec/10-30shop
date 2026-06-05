# ─── Frontend Dockerfile (multi-stage) ───────────────────────────────────────
# Stage "dev"   → Vite dev-сервер, volume-монтирование кода, HMR
# Stage "build" → Vite production build → dist/
# Stage "nginx" → nginx:alpine со статикой из dist/
# Используется в docker-compose.prod.yml

# ─── Stage: dev ──────────────────────────────────────────────────────────────
# Vite dev-сервер в контейнере. Используется в docker-compose.yml.
FROM node:20-alpine AS dev

WORKDIR /app

COPY package*.json ./
RUN npm install

EXPOSE 5173

# --host 0.0.0.0 обязателен — без него Vite слушает только localhost внутри контейнера
# и порт 5173 недоступен с хост-машины
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# ─── Stage: build ────────────────────────────────────────────────────────────
# Vite production build. Результат: /app/dist/
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

# Копируем весь исходный код для сборки
COPY . .

# Собираем production bundle
RUN npm run build

# ─── Stage: nginx ────────────────────────────────────────────────────────────
# Финальный образ: лёгкий nginx с собранной статикой из dist/
# Используется в docker-compose.prod.yml → nginx сервис
FROM nginx:alpine AS nginx

# Копируем собранную статику из stage build
COPY --from=build /app/dist /usr/share/nginx/html

# nginx.prod.conf монтируется через volume в docker-compose.prod.yml
# Он перенаправляет /api/* на backend и отдаёт статику

EXPOSE 80
