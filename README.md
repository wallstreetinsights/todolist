# Todo List

FastAPI + React 全栈 Todo 应用。用户在前端输入任务，调用后端 API，数据通过 SQLAlchemy 写入数据库。

## 项目结构

```
backend/     FastAPI + SQLAlchemy API
frontend/    React + Vite 前端
Dockerfile   单容器：构建前端 + 运行后端（推荐 Railway 部署）
```

## 本地开发

### 方式 A：前后端分开（开发推荐）

```bash
# 后端
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 前端
cd frontend
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`，Vite 会把 `/api` 代理到后端。

### 方式 B：Docker 单容器（接近生产环境）

```bash
docker build -t todolist .
docker run -p 8000:8000 -e DATABASE_URL=sqlite:///./todos.db todolist
```

浏览器打开 `http://localhost:8000` 即可看到 Todo 页面。

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/todos` | 获取全部 todo |
| POST | `/api/todos` | 创建 todo |
| PATCH | `/api/todos/{id}` | 更新 todo |
| DELETE | `/api/todos/{id}` | 删除 todo |
| GET | `/docs` | API 文档 |

## Railway 部署（推荐：2 个服务）

使用 **Docker 单容器** 后，只需：

1. **Postgres** — Database → PostgreSQL
2. **App** — GitHub 仓库，**Root Directory 留空（仓库根目录）**，使用根目录 `Dockerfile`

### App 环境变量

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | 引用 Postgres 的 `DATABASE_URL` |

**不再需要**单独配置：

- Frontend 服务
- `VITE_API_URL`
- `FRONTEND_URL`
- `CORS_ORIGINS`

前后端同域，浏览器直接请求 `/api/todos`。

### 访问地址

部署完成后，打开 App 服务的公网域名即可，例如：

```
https://perfect-courtesy-production-44b9.up.railway.app/
```

- `/` — Todo 网页
- `/api/health` — 健康检查
- `/docs` — API 文档

### GitHub 推送后自动更新

App 服务连接 GitHub `main` 分支并开启 Autodeploy 后，push 到 `main` 会自动重新 build 和 deploy。

### 旧方案：前后端分开部署

仍可使用 `backend/` 和 `frontend/` 两个独立 Railway 服务，但配置更复杂（CORS、`VITE_API_URL` 等）。新部署建议用根目录 Docker 单容器。

## 技术栈

- **Backend**: FastAPI, SQLAlchemy, Uvicorn
- **Frontend**: React, Vite
- **Database**: PostgreSQL（生产）/ SQLite（本地）
