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

## 线上地址

| 服务 | 地址 |
|------|------|
| **Backend API** | https://perfect-courtesy-production-44b9.up.railway.app |
| **API 文档** | https://perfect-courtesy-production-44b9.up.railway.app/docs |
| **健康检查** | https://perfect-courtesy-production-44b9.up.railway.app/api/health |
| **Frontend** | 在 Railway 新建 Frontend 服务后生成（见下方） |

访问 Backend 根路径 `/` 会返回 API 与 Frontend 地址说明。

## Railway 部署

### 推荐：3 个服务

1. **PostgreSQL**（已有）
2. **Backend** — Root Directory: `backend`（已部署）
3. **Frontend** — Root Directory: `frontend`（待创建）

### 创建 Frontend 服务

1. Railway Project → **+ New** → **GitHub Repo** → 选 `wallstreetinsights/todolist`
2. **Root Directory** 设为 `frontend`
3. **Variables**：一般不需要手动设置（`frontend/.env.production` 已包含 Backend 地址）
4. **Generate Domain** 获取 Frontend 公网地址，例如：  
   `https://todolist-production-97ed.up.railway.app`
5. 回到 **Backend（perfect-courtesy）** 服务 Variables，添加：  
   `FRONTEND_URL=https://todolist-production-97ed.up.railway.app`  
   （**不要**把 `FRONTEND_URL` 配在 Frontend 服务上）
6. Redeploy Backend（让 CORS 允许前端域名）

### Backend 环境变量

在 Backend 服务的 Variables 里添加 **Reference Variable**，引用 Postgres 服务的 `DATABASE_URL`。

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | 引用 Postgres 的 `DATABASE_URL`（内网，Railway 部署用） |
| `FRONTEND_URL` | Frontend 公网地址（部署 Frontend 后填写） |
| `BACKEND_URL` | 可选，Backend 公网地址（用于 `/` 响应） |

Backend 启动时会通过 SQLAlchemy **自动建表**（`create_all`），无需手动执行 SQL。

### Frontend 环境变量

| 变量 | 说明 |
|------|------|
| `VITE_API_URL` | 后端公网地址（已写入 `frontend/.env.production`） |

`VITE_API_URL` 需要在 **构建时** 生效；修改后请 Redeploy Frontend。

### GitHub 推送后 Railway 会自动更新吗？

**会，前提是服务已连接 GitHub 并开启了 Autodeploy。**

你的 Backend 已从 `main` 分支的 `/backend` 目录部署，因此：

1. 代码 push 到 GitHub **`main`** 分支
2. Railway 检测到新 commit
3. 自动重新 build 和 deploy

注意：

- Backend 和 Frontend 是 **两个独立服务**，需要分别连接 GitHub（Root Directory 分别设为 `backend` / `frontend`）
- 只 push 代码不会更新 Frontend，除非你也创建了 Frontend 服务并连到同一仓库
- 可在 Service → **Settings → Source** 查看 Autodeploy 是否开启、监听哪个分支

### 本地连 Railway Postgres（可选）

本地开发请使用 Postgres 变量里的 **`DATABASE_PUBLIC_URL`**（公网代理，例如 `switchyard.proxy.rlwy.net:34410`），**不要**使用 `postgres.railway.internal`。

```bash
cp backend/.env.example backend/.env
# 编辑 backend/.env，填入 DATABASE_PUBLIC_URL 的值
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
