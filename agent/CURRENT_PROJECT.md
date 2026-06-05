# ⚙️ Активный проект

> **ОБЯЗАТЕЛЬНО для всех агентов:**
> Прочитай этот файл в самом начале каждой сессии.
> Здесь указано над каким проектом работаешь и куда сохранять файлы.

---

## Текущий проект

```
PROJECT_NAME    = 10:30 AM Shop
PROJECT_PATH    = /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/
STACK           = Vue.js 3 + Vite + Node.js + Express + SQLite + Docker
```

---

## Пути к коду (DEVELOPER, DEVOPS, DOCUMENTER)

```
BACKEND_PATH    = /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/backend/
FRONTEND_PATH   = /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/frontend/
DESIGN_PATH     = /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/design-reference/
```

> Код, тесты, Docker, Nginx, README, CHANGELOG — всё это сохраняется В ПРОЕКТ.

---

## Пути для процессных файлов (отчёты, планы, анализы)

> Планы и отчёты НЕ идут в проект — они сохраняются сюда:

```
PLANNER  → /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/agent/10-30shop/planner/
REVIEWER → /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/agent/10-30shop/reviewer/
TESTER   → /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/agent/10-30shop/tester/
DATABASE → /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/agent/10-30shop/database/
SECURITY → /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/agent/10-30shop/security/
DEVOPS   → /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/agent/10-30shop/devops/
```

---

## Что куда сохраняет каждый агент

| Агент | Файл | Куда сохраняет |
|-------|------|----------------|
| PLANNER | `TASKS.md` | `agent/10-30shop/planner/` |
| REVIEWER | `REVIEW_REPORT_vN.md` | `agent/10-30shop/reviewer/` |
| TESTER | `TEST_REPORT.md` | `agent/10-30shop/tester/` |
| DATABASE | `DB_DESIGN.md` | `agent/10-30shop/database/` |
| SECURITY | `SECURITY_REPORT.md` | `agent/10-30shop/security/` |
| DEVOPS | Docker, Nginx, CI/CD | `agent/10-30shop/devops/` + корень проекта |
| DEVELOPER | код, тесты | `backend/`, `frontend/` |
| DOCUMENTER | README.md, CHANGELOG.md | корень проекта |

---

## Правила агентов

```
DEVELOPER_RULES  = /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/agent/AGENT_DEVELOPER.md
REVIEWER_RULES   = /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/agent/AGENT_REVIEWER.md
PLANNER_RULES    = /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/agent/AGENT_PLANNER.md
TESTER_RULES     = /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/agent/AGENT_TESTER.md
DATABASE_RULES   = /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/agent/AGENT_DATABASE.md
DEVOPS_RULES     = /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/agent/AGENT_DEVOPS.md
DOCUMENTER_RULES = /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/agent/AGENT_DOCUMENTER.md
SECURITY_RULES   = /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/agent/AGENT_SECURITY.md
```

---

## Ключевые документы проекта

```
PLAN             = /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/PLAN.md
DESIGN_TOKENS    = /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/design-reference/design-tokens.yaml
DESIGN_MAIN      = /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/design-reference/main/
DESIGN_CATALOG   = /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/design-reference/catalog/
LOGO             = /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/design-reference/logo/logo.png
HERO_PHOTO       = /home/reco/.gemini/antigravity/scratch/workspace/10-30shop/design-reference/logo/main-photo.png
```

---

## Как менять проект

Когда переходишь на новый проект — меняешь только этот файл.
Правила агентов (AGENT_*.md) не трогаешь никогда.

---

*Последнее обновление: 2026-06-05 | Активный проект: 10:30 AM Shop*
