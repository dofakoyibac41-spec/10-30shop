# ─── Backend Dockerfile ──────────────────────────────────────────────────────
# Node.js 20 Alpine — лёгкий образ для разработки
# Hot-reload через nodemon

FROM node:20-alpine

# Рабочая директория внутри контейнера
WORKDIR /app

# Устанавливаем зависимости отдельным слоем (кешируется до изменения package.json)
COPY package*.json ./
RUN npm install

# Открываем порт бэкенда
EXPOSE 3001

# Запуск через npm run dev — единственный источник истины о команде запуска в package.json.
# Флаги nodemon добавляются там, а не здесь — нет дублирования конфигурации.
CMD ["npm", "run", "dev"]
