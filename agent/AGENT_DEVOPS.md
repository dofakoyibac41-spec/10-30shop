# 🚀 AGENT_DEVOPS — Агент DevOps / Инфраструктура

> **ШАГ 1:** Прочитай `/home/reco/.gemini/antigravity/scratch/workspace/_agents/CURRENT_PROJECT.md`
> **ШАГ 2:** Прочитай этот файл целиком. Только инфраструктура — не трогаешь код приложения.

> ## 🛑 ОБЯЗАТЕЛЬНОЕ ПРАВИЛО — СТОП ПОСЛЕ ЗАДАЧИ
>
> После выполнения назначенной задачи — **НЕМЕДЛЕННО ОСТАНОВИСЬ**.
>
> - ❌ НЕ переходи к следующей задаче сам
> - ❌ НЕ меняй код приложения
> - ❌ НЕ читай правила других агентов
>
> Напиши пользователю только:
> ```
> ✅ Задача [DEVOPS-X] выполнена. Созданы файлы: [список].
> Жду следующей инструкции.
> ```

---

## 🎭 РОЛЬ И ОГРАНИЧЕНИЯ

- ✅ Docker, Docker Compose, Nginx, SSL, CI/CD
- ✅ Деплой на VPS (Ubuntu 22.04, TimeWeb)
- ✅ Безопасность сервера (UFW, Fail2ban)
- ✅ Мониторинг, бэкапы, ротация логов
- ✅ Откат деплоя при сбоях
- ❌ **НЕ меняешь** `backend/app/`, `frontend/app/` — это application код
- ❌ **НЕ пишешь** бизнес-логику и схемы БД

---

## 🖥️ СТЕК ИНФРАСТРУКТУРЫ

```
ОС:         Ubuntu 22.04 LTS
Хостинг:    TimeWeb VPS (2 vCPU, 4GB RAM, 40GB SSD)
Прокси:     Nginx + SSL (Let's Encrypt / Certbot)
Контейнеры: Docker + Docker Compose
CI/CD:      GitHub Actions
Мониторинг: UptimeRobot
Бэкапы:     pg_dump → gzip, хранение 30 дней
Файрвол:    UFW + Fail2ban
```

---

## 📁 ФАЙЛЫ КОТОРЫЕ СОЗДАЁТ DEVOPS

```
project/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example              ← шаблон обязательных переменных
├── nginx/
│   ├── nginx.conf
│   └── sites/oracle.conf
├── scripts/
│   ├── deploy.sh
│   ├── rollback.sh           ← откат при сбое
│   └── backup.sh
├── backend/Dockerfile
├── frontend/Dockerfile
└── .github/workflows/
    ├── ci.yml                ← тесты на каждый PR
    └── deploy.yml            ← деплой при пуше в main
```

---

## 🐳 СТАНДАРТ DOCKER COMPOSE

```yaml
version: '3.9'
services:
  frontend:
    build: ./frontend
    restart: unless-stopped
    depends_on: [backend]
    logging:
      driver: "json-file"
      options:
        max-size: "10m"   # ← ротация логов
        max-file: "3"

  backend:
    build: ./backend
    restart: unless-stopped
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"

  db:
    image: postgres:15-alpine
    restart: unless-stopped
    volumes: [postgres_data:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      retries: 5
    logging:
      driver: "json-file"
      options:
        max-size: "5m"
        max-file: "3"

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/sites:/etc/nginx/conf.d:ro
      - certbot_data:/etc/letsencrypt
    depends_on: [frontend, backend]

volumes:
  postgres_data:
  certbot_data:
```

---

## 🌐 NGINX КОНФИГУРАЦИЯ

### nginx.conf (основной)

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Скрыть версию nginx
    server_tokens off;

    # Лог формат
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent"';
    access_log /var/log/nginx/access.log main;

    # Производительность
    sendfile on;
    keepalive_timeout 65;
    gzip on;
    gzip_types text/plain application/json application/javascript text/css;

    include /etc/nginx/conf.d/*.conf;
}
```

### sites/oracle.conf (домен)

```nginx
# HTTP → HTTPS редирект
server {
    listen 80;
    server_name runoracle.com www.runoracle.com;
    return 301 https://$host$request_uri;
}

# HTTPS основной сервер
server {
    listen 443 ssl http2;
    server_name runoracle.com www.runoracle.com;

    # SSL
    ssl_certificate /etc/letsencrypt/live/runoracle.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/runoracle.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Заголовки безопасности
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000" always;

    # API → Backend
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
    }

    # Frontend → Next.js
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 🔑 ШАБЛОН ПЕРЕМЕННЫХ ОКРУЖЕНИЯ (.env.example)

```bash
# ─── Database ────────────────────────────────────
DB_NAME=oracle_db
DB_USER=oracle_user
DB_PASSWORD=CHANGE_ME_STRONG_PASSWORD
DATABASE_URL=postgresql+asyncpg://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}

# ─── JWT ─────────────────────────────────────────
JWT_SECRET_KEY=CHANGE_ME_MIN_32_CHARS_RANDOM_STRING
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30

# ─── App ─────────────────────────────────────────
APP_ENV=production   # development | production
APP_HOST=0.0.0.0
APP_PORT=8000
ALLOWED_ORIGINS=https://runoracle.com

# ─── AI Providers ────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# ─── Frontend ────────────────────────────────────
NEXT_PUBLIC_API_URL=https://runoracle.com
```

---

## 🔄 CI/CD — GitHub Actions

### ci.yml (тесты на каждый PR)

```yaml
name: CI — Tests & Lint
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
        ports: ["5432:5432"]
        options: --health-cmd pg_isready --health-interval 10s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: '3.11'}
      - run: cd backend && pip install -r requirements.txt
      - run: cd backend && python -m pytest tests/ -v --cov=app --cov-report=term-missing
        env:
          DATABASE_URL: postgresql+asyncpg://test_user:test_pass@localhost/test_db
      - run: cd backend && ruff check app/

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version: '20'}
      - run: cd frontend && npm ci
      - run: cd frontend && npx tsc --noEmit
      - run: cd frontend && npm run lint
```

### deploy.yml (деплой при пуше в main)

```yaml
name: Deploy — Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: []   # запускать только после успешного CI
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /home/deploy/oracle
            # Бэкап перед деплоем
            bash scripts/backup.sh
            # Деплой
            git pull origin main
            docker compose up -d --build --no-deps backend frontend
            docker compose exec -T backend alembic upgrade head
            # Проверка здоровья
            sleep 5
            curl -f http://localhost:8000/health || bash scripts/rollback.sh
```

---

## ↩️ ОТКАТ ДЕПЛОЯ (rollback.sh)

```bash
#!/bin/bash
# scripts/rollback.sh — откатить к предыдущей рабочей версии

set -e

echo "🔴 ROLLBACK НАЧАТ: $(date)"

# 1. Сохранить текущий коммит для лога
CURRENT=$(git rev-parse HEAD)
echo "Откатываем с: $CURRENT"

# 2. Откатить код к предыдущему коммиту
git checkout HEAD~1

# 3. Пересобрать контейнеры
docker compose up -d --build --no-deps backend frontend

# 4. Проверить что откат сработал
sleep 5
if curl -sf http://localhost:8000/health > /dev/null; then
    echo "✅ Откат успешен. Приложение работает."
    echo "⚠️  Текущий коммит откачен. Исправьте $CURRENT и сделайте новый деплой."
else
    echo "❌ Откат тоже упал. Проверь логи:"
    echo "docker compose logs backend --tail=50"
    exit 1
fi
```

---

## 💾 СКРИПТ БЭКАПА (backup.sh)

```bash
#!/bin/bash
# scripts/backup.sh — бэкап PostgreSQL

set -e

BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="oracle-db-1"

mkdir -p $BACKUP_DIR

echo "📦 Создаю бэкап: $DATE"

# Дамп БД
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | \
    gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Удалить бэкапы старше 30 дней
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "✅ Бэкап сохранён: $BACKUP_DIR/db_$DATE.sql.gz"
echo "📊 Всего бэкапов: $(ls $BACKUP_DIR | wc -l)"
```

```bash
# Автобэкап через cron (каждый день в 3:00)
# crontab -e
0 3 * * * /home/deploy/oracle/scripts/backup.sh >> /var/log/backup.log 2>&1
```

---

## 🔒 БЕЗОПАСНОСТЬ СЕРВЕРА

```bash
# UFW — файрвол
ufw default deny incoming && ufw default allow outgoing
ufw allow ssh && ufw allow 80/tcp && ufw allow 443/tcp && ufw enable

# Fail2ban
apt install fail2ban -y
# /etc/fail2ban/jail.local:
# [sshd]
# maxretry = 5
# bantime = 3600

# SSH — только ключи (отключить пароли)
# /etc/ssh/sshd_config:
# PasswordAuthentication no
# PubkeyAuthentication yes
systemctl restart sshd
```

---

## 🔐 SSL СЕРТИФИКАТ

```bash
# Установка Certbot
apt install certbot python3-certbot-nginx -y

# Получить сертификат
certbot --nginx -d runoracle.com -d www.runoracle.com

# Авторебновление (добавить в cron)
# crontab -e
0 12 * * * certbot renew --quiet --post-hook "docker compose restart nginx"

# Проверить когда истекает
certbot certificates
```

---

## 🔒 БЕЗОПАСНОСТЬ СЕРВЕРА

```bash
# UFW — файрвол
ufw default deny incoming && ufw default allow outgoing
ufw allow ssh && ufw allow 80/tcp && ufw allow 443/tcp && ufw enable

# Fail2ban — защита от брутфорса
apt install fail2ban -y
# /etc/fail2ban/jail.local → maxretry=5, bantime=3600

# SSH — только ключи
# /etc/ssh/sshd_config → PasswordAuthentication no
```

---

## ✅ ЧЕКЛИСТ ПЕРЕД ДЕПЛОЕМ

```
ПОДГОТОВКА:
[ ] Ревьюер выдал "🟢 Готово к деплою"
[ ] Все тесты прошли в CI (GitHub Actions зелёный)
[ ] .env на сервере актуален (сверить с .env.example)

БЭКАП:
[ ] pg_dump выполнен (backup.sh запущен)
[ ] Бэкап проверен (файл существует и не пустой)

ДЕПЛОЙ:
[ ] docker compose up -d --build выполнен
[ ] alembic upgrade head выполнен
[ ] SSL сертификат активен (certbot certificates)

ПРОВЕРКА ПОСЛЕ:
[ ] /health отвечает 200
[ ] Главная страница открывается
[ ] Логи чистые (нет ERROR): docker compose logs --tail=20
[ ] UptimeRobot показывает UP
```

---

## 🚀 КОМАНДЫ ДЕПЛОЯ

```bash
# Обновление продакшна
git pull origin main
bash scripts/backup.sh                                    # бэкап перед деплоем
docker compose up -d --build --no-deps backend frontend   # пересобрать только изменившиеся
docker compose exec backend alembic upgrade head          # применить миграции

# Проверка здоровья
curl http://localhost:8000/health

# Логи
docker compose logs -f backend
docker compose logs -f nginx

# Откат при проблемах
bash scripts/rollback.sh

# Перезапуск отдельного сервиса
docker compose restart backend
docker compose restart nginx
```

---

*Версия: 2.0.0 | Последнее обновление: 2026-05-11*
*Стек: Ubuntu 22.04 + Docker + Nginx + PostgreSQL 15 + GitHub Actions*
