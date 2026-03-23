# 项目：美洽客服系统 (Meiqia Customer Service System)

基于美洽 SDK 构建的全栈客服系统，包含 Web 前端客户端和 Python 后端服务。

## 技术栈

### 前端 (Web Client)
- 框架：React 18 + TypeScript
- 构建工具：Vite
- 样式：Tailwind CSS
- 状态管理：Zustand
- HTTP 客户端：Axios
- WebSocket：原生 WebSocket API
- 美洽 SDK：`@meiqia/meiqia-web-sdk`（或通过 script 标签引入）

### 后端 (Python Server)
- 框架：FastAPI
- 异步运行时：Uvicorn
- HTTP 客户端：httpx（异步）
- WebSocket：FastAPI 内置 WebSocket 支持
- 美洽 SDK：通过 REST API 调用（Python 无官方 SDK，直接调用 HTTP API）
- 环境变量管理：python-dotenv
- 数据验证：Pydantic v2

## 项目结构

```
.
├── CLAUDE.md
├── .env                          # 敏感配置，不得提交 git
├── .env.example                  # 环境变量示例模板
├── frontend/                     # Web 客户端
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/            # 管理后台组件
│   │   │   │   ├── ConversationHistory/
│   │   │   │   │   ├── ConversationList.tsx      # 历史会话列表（支持搜索/筛选）
│   │   │   │   │   ├── ConversationDetail.tsx    # 单条会话消息时间线
│   │   │   │   │   ├── MessageBubble.tsx         # 消息气泡（区分客户/坐席/系统）
│   │   │   │   │   └── ConversationFilter.tsx    # 筛选栏（时间范围、坐席、来源渠道）
│   │   │   │   └── ...
│   │   │   └── common/           # 通用组件（Pagination、DateRangePicker 等）
│   │   ├── hooks/
│   │   │   ├── useConversationHistory.ts   # 历史会话分页加载 Hook
│   │   │   └── useConversationMessages.ts  # 会话消息加载 Hook
│   │   ├── stores/
│   │   │   └── conversationHistoryStore.ts # 历史会话 Zustand Store
│   │   ├── services/
│   │   │   └── conversationService.ts      # 历史会话相关 API 调用
│   │   ├── types/
│   │   │   └── conversation.ts             # 会话、消息相关 TypeScript 类型
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── backend/                      # Python 服务端
│   ├── app/
│   │   ├── main.py               # FastAPI 入口
│   │   ├── routers/
│   │   │   ├── conversations.py  # 历史会话路由 /api/conversations/*
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── meiqia_service.py           # 美洽 API 统一封装
│   │   │   └── conversation_service.py     # 历史会话业务逻辑
│   │   ├── models/               # Pydantic 数据模型
│   │   ├── config.py             # 配置加载
│   │   └── utils/
│   ├── tests/
│   │   └── test_conversations.py
│   └── requirements.txt
└── README.md
```

## 常用命令

### 前端
```bash
cd frontend
npm install          # 安装依赖
npm run dev          # 启动开发服务器 (http://localhost:5173)
npm run build        # 生产构建
npm run preview      # 预览生产构建
npm run lint         # ESLint 检查
npm run typecheck    # TypeScript 类型检查（tsc --noEmit）
```

### 后端
```bash
cd backend
pip install -r requirements.txt          # 安装依赖
uvicorn app.main:app --reload            # 启动开发服务器 (http://localhost:8000)
uvicorn app.main:app --host 0.0.0.0 --port 8000  # 生产启动
pytest tests/                           # 运行测试
pytest tests/test_meiqia.py -v          # 运行单个测试文件
```

## 美洽 API 集成要点

### 关键配置
- `MEIQIA_APP_ID`：美洽应用 App ID
- `MEIQIA_APP_SECRET`：美洽应用 App Secret
- `MEIQIA_API_HOST`：API 基础地址，默认 `https://api.meiqia.com`

### 重要 API 端点（后端负责调用）
- `POST /2.0/token`：获取 access token（有效期 2 小时，需缓存，IMPORTANT）
- `POST /2.0/client/token`：获取客户端 token（用于前端 SDK 初始化）
- `GET /2.0/conversations`：获取会话列表（支持 `page`、`page_size`、`start_time`、`end_time` 参数）
- `GET /2.0/conversation/:id`：获取单条会话详情
- `GET /2.0/conversation/:id/messages`：获取会话消息列表（分页）
- `POST /2.0/message`：发送消息
- Webhook 接收地址：`POST /api/webhook/meiqia`（后端实现，需在美洽控制台配置）

### 历史会话功能 — 后端代理接口（供前端调用）
- `GET /api/conversations`：历史会话列表，支持查询参数：`page`、`page_size`、`start_time`、`end_time`、`agent_id`、`status`（open/closed）
- `GET /api/conversations/:id`：单条会话详情
- `GET /api/conversations/:id/messages`：会话消息流水，支持 `page`、`page_size` 分页

### IMPORTANT：历史会话分页
美洽历史会话数据量可能很大，前端 MUST 使用分页加载，禁止一次性拉取全量数据。默认 `page_size=20`，支持用户滚动加载更多（infinite scroll）或翻页。

### IMPORTANT：Token 缓存
后端必须缓存美洽 access token，切勿每次请求都重新获取。使用内存缓存或 Redis，在 token 到期前 5 分钟刷新。

### 前端 SDK 初始化（index.html 或 main.tsx）
前端通过从后端获取的 `client_token` 初始化美洽 Web SDK，不得将 App Secret 暴露在前端代码中。

## 编码规范

### TypeScript / 前端
- 所有组件使用函数式组件 + Hooks，禁止 Class 组件
- 使用具名导出（named exports），避免 default export（组件除外）
- API 调用统一放在 `src/services/` 目录，组件内不直接调用 axios
- 类型定义放在 `src/types/`，与业务逻辑分离
- 禁止使用 `any` 类型

### Python / 后端
- 所有路由函数使用 `async def`
- 外部 HTTP 请求使用 `httpx.AsyncClient`，禁止使用同步 `requests`
- 使用 Pydantic 模型做请求/响应的数据验证
- 美洽 API 封装统一放在 `app/services/meiqia_service.py`
- 异常处理：使用 FastAPI 的 `HTTPException`，并记录日志
- 环境变量通过 `app/config.py` 统一读取，禁止在业务代码中直接读取 `os.environ`

## 安全注意事项

- **NEVER** 将 `.env` 文件提交到 git（已加入 .gitignore）
- **NEVER** 在前端代码中暴露 `MEIQIA_APP_SECRET`
- 美洽 Webhook 需验证签名，后端收到 Webhook 必须校验 `X-Meiqia-Signature` 请求头
- 前后端通信敏感接口需加鉴权（JWT 或 Session）

## 历史会话功能说明

### 功能范围
管理后台的历史对话记录模块，供坐席/管理员查阅已结束或进行中的会话内容。

### 页面交互流程
1. 进入「历史对话」页面，默认展示最近 7 天的已结束会话列表（分页）
2. 顶部筛选栏支持：时间范围（DateRangePicker）、会话状态（全部/进行中/已结束）、接待坐席（下拉）、来源渠道
3. 点击列表中某条会话，右侧面板展开该会话的完整消息时间线
4. 消息时间线区分消息类型：客户发送、坐席回复、系统事件（转接、结束等）
5. 支持在消息时间线内搜索关键字（前端本地过滤）

### 前端关键实现
- `useConversationHistory` Hook：封装分页逻辑，管理 `page`、`filters`、`loading`、`hasMore` 状态
- `useConversationMessages` Hook：按需加载单条会话的消息列表，支持消息懒加载
- `conversationHistoryStore`（Zustand）：缓存已加载的会话列表和消息，避免重复请求
- 列表与详情采用左右分栏布局（master-detail），消息详情面板内部可独立滚动

### 后端关键实现
- `conversation_service.py` 负责调用美洽 API 并做数据转换，路由层只做参数校验和响应格式化
- 时间范围筛选参数转换为美洽 API 要求的 Unix 时间戳格式后再转发
- 会话消息类型（文本/图片/文件/系统事件）在后端统一映射为前端约定的枚举值

### TypeScript 类型约定（`src/types/conversation.ts`）
```typescript
type MessageType = 'text' | 'image' | 'file' | 'system_event'
type ConversationStatus = 'open' | 'closed'

interface Conversation {
  id: string
  status: ConversationStatus
  startedAt: string       // ISO 8601
  endedAt: string | null
  agentName: string
  customerName: string
  messageCount: number
}

interface Message {
  id: string
  conversationId: string
  type: MessageType
  content: string
  senderRole: 'customer' | 'agent' | 'system'
  sentAt: string          // ISO 8601
}
```

## 架构说明

```
用户浏览器
  │
  ├─── 前端 React App (Vite, :5173)
  │      ├── 美洽 Web SDK（客户端聊天 UI）
  │      └── 自定义管理 UI
  │             ├── 会话列表 / 坐席后台
  │             └── 历史对话记录（ConversationHistory 模块）
  │                    ├── 会话列表（筛选、分页）
  │                    └── 消息时间线（按需加载）
  │
  └─── 后端 FastAPI (:8000)
         ├── /api/conversations/*  历史会话代理接口
         ├── /api/meiqia/*         其他美洽 API 代理（避免暴露 Secret）
         ├── /api/webhook/meiqia   接收美洽推送事件
         └── 美洽 REST API (api.meiqia.com)
```

## 开发注意事项

- 修改完一批文件后务必运行 `npm run typecheck` 和 `pytest`
- Webhook 本地联调使用 `ngrok` 或 `localtunnel` 暴露本地端口
- 美洽 API 有限流，批量操作需加延迟
- 参考文档：https://dev.meiqia.com/  （开发前先阅读）
