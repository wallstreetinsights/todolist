# Todo List

FastAPI + React 全栈 Todo 应用。用户在前端输入任务，调用后端 API，数据通过 SQLAlchemy 写入数据库。

## 项目结构

```
backend/     FastAPI + SQLAlchemy API
frontend/    React + Vite 前端
```

## 本地开发

### 1. 启动后端

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

本地默认使用 SQLite（`backend/todos.db`）。连接 PostgreSQL 时设置环境变量：

```bash
export DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`。开发模式下 Vite 会把 `/api` 代理到 `http://localhost:8000`。

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/todos` | 获取全部 todo |
| POST | `/api/todos` | 创建 todo，`{ "title": "..." }` |
| PATCH | `/api/todos/{id}` | 更新 todo |
| DELETE | `/api/todos/{id}` | 删除 todo |

## Railway 部署

你的 Postgres 已创建，公网代理地址示例：

```
switchyard.proxy.rlwy.net:34410
```

### 推荐：在 Railway 创建 3 个服务

1. **PostgreSQL**（已有）
2. **Backend** — 连接 GitHub 仓库，Root Directory 设为 `backend`
3. **Frontend** — 连接 GitHub 仓库，Root Directory 设为 `frontend`

### Backend 环境变量

在 Backend 服务的 Variables 里添加 **Reference Variable**，引用 Postgres 服务的变量（推荐引用 `DATABASE_URL`，或分别引用 `PGHOST` / `PGPORT` / `PGUSER` / `PGPASSWORD` / `PGDATABASE`）。

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | 引用 Postgres 的 `DATABASE_URL`（推荐） |
| `CORS_ORIGINS` | 前端域名，例如 `https://your-frontend.up.railway.app` |

Backend 启动时会通过 SQLAlchemy **自动建表**（`create_all`），无需手动执行 SQL。

健康检查：`GET /api/health` 会返回数据库连接状态。

### Frontend 环境变量

| 变量 | 说明 |
|------|------|
| `VITE_API_URL` | 后端公网地址，例如 `https://your-backend.up.railway.app` |

`VITE_API_URL` 需要在 **构建时** 生效，配置后请 Redeploy Frontend。

### 本地连 Railway Postgres（可选）

从 Railway Postgres 服务的 Variables 复制完整 `DATABASE_URL`，写入 `backend/.env`：

```bash
cp backend/.env.example backend/.env
# 编辑 backend/.env，填入真实 DATABASE_URL
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### GitHub Actions 自动部署（可选）

仓库已包含 `.github/workflows/railway-deploy.yml`。在 GitHub 仓库 Settings → Secrets 添加 `RAILWAY_TOKEN`（Railway Project Token）后，push 到 `main` 会自动部署 backend 和 frontend 服务。

## 技术栈

- **Backend**: FastAPI, SQLAlchemy, Uvicorn
- **Frontend**: React, Vite
- **Database**: PostgreSQL（生产）/ SQLite（本地）
