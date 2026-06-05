# ─── Frontend Dockerfile ─────────────────────────────────────────────────────
# Node.js 20 Alpine — Vite dev-сервер в контейнере
# Код монтируется через volume, node_modules изолированы

FROM node:20-alpine

# Рабочая директория внутри контейнера
WORKDIR /app

# Устанавливаем зависимости отдельным слоем (кешируется до изменения package.json)
COPY package*.json ./
RUN npm install

# Открываем порт Vite dev-сервера
EXPOSE 5173

# --host 0.0.0.0 обязателен — без него Vite слушает только localhost внутри контейнера
# и порт недоступен снаружи (с хост-машины)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
