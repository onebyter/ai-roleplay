# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

AI RolePlay 是多智能体 AI 角色扮演桌面应用。用户创建角色（每个有独立 AI system prompt），以群聊形式对话，支持 GM 主导和自由群聊模式。技术栈：Electron + React 19 + TypeScript + Vite + Zustand + Tailwind CSS v4 + sql.js (WASM)。

当前阶段：v0.2.1（单角色对话 + Bug 修复完成）。下一步 v0.3.0（多智能体系统）。

## 常用命令

```bash
npm run dev           # 完整开发（Vite + Electron TS watch + Electron）
npm run dev:vite      # 仅 Vite（http://localhost:5173）
npm run dev:electron  # 编译 Electron TS 并启动
npm run build         # 生产构建
npm test              # vitest run（17 测试，3 文件）
npm run test:watch    # 监听模式
```

无 lint / format 配置。

## 架构

### 双进程

- **主进程** `electron/`：Node.js CommonJS。`main.ts` 创建 BrowserWindow（contextIsolation: true, nodeIntegration: false），注册 3 组 IPC handler。`electron/tsconfig.json`（module: commonjs）。
- **渲染进程** `src/`：React SPA，ESNext，Vite + HMR，Tailwind CSS v4 `@theme`。路径别名 `@/` → `src/`。入口 `src/main.tsx` → `App.tsx`。

`electron/preload.ts` 通过 contextBridge 暴露 `window.electronAPI`，类型声明在 `src/utils/llm-client.ts` 的 `declare global`。

### IPC 模块

| 模块 | 文件 | 处理器 |
|------|------|--------|
| Database | `electron/ipc/database.ts` | `db:query`, `db:run`, `db:saveSession`, `db:loadSession`, `db:listSessions`, `db:deleteSession` — sql.js WASM，文件在 `app.getPath('userData')/ai-roleplay.db` |
| LLM | `electron/ipc/llm.ts` | `llm:streamChat`（流式对话）, `llm:stopStream`, `llm:fetchModels`（获取模型列表）, `llm:testConnection`（连接测试）— 基于 OpenAI SDK |
| File | `electron/ipc/file.ts` | `file:readTxt`, `file:openFile`, `file:saveFile` |

### 状态管理（Zustand，4 个 store）

| Store | 持久化 | 核心职责 |
|-------|--------|----------|
| `sessionStore` | SQLite `sessions` 表 | 当前会话：worldSetting, worldState, characters, messages, userRole, turnOrder。修改后自动 `saveSession()` |
| `chatStore` | 无（通过 sessionStore 间接） | 本地消息列表、流式状态（`isGenerating`, `generatingAgentId`, `streamingContent`） |
| `characterStore` | SQLite `characters` 表 | 角色库 CRUD |
| `settingsStore` | localStorage | API 配置列表、选中配置 ID、主题（dark/light） |

### LLM 流式调用流程

1. `ChatArea.handleSendMessage` 过滤会话角色中非发言者的角色
2. 匹配 API 配置（`provider: 'default'` → 回退到 `selectedConfigId`），大小写不敏感
3. `src/utils/llm-client.ts` 的 `streamChat()` async generator：先注册 `onStreamChunk/End/Error` 监听，再调 IPC `llm:streamChat`
4. 主进程 `OpenAI.chat.completions.create({ stream: true })`，chunk 通过 `webContents.send` 推送到渲染进程
5. 事件通过 buffer + Promise 统一处理，error 通过 `throw` 传播到 ChatArea
6. ChatArea 的 try/catch 将错误显示为 system 消息

### UI 布局

三栏（`App.tsx`）：`Sidebar`(256px) | `ChatArea`(flex-1) | `RightPanel`(288px, 可收起)

- **Sidebar** — 两个 Tab（会话/角色），底部齿轮按钮打开 `SettingsModal`。可创建/加载/删除会话，点击角色打开 `CharacterEditor`，hover 角色显示"加入会话"按钮。
- **ChatArea** — 消息列表（`MessageBubble`），顶部模式/角色切换，底部 `MessageInput`（浮起卡片式，仅显示会话角色）。
- **RightPanel** — 三个 Tab（世界/角色/信息），角色列表可编辑世界状态、查看/移除会话角色。

### 设置界面

`SettingsModal` — 820×520 模态框，左导航(176px) + 右内容区：
- **外观**：深色/浅色主题卡片，带预览色块
- **API 配置**：`ApiConfigPanel` 内部左列表(192px) + 右详情区，单击选中、单击"编辑"进入编辑模式。模型逐条显示，每条可删除。支持获取模型（/v1/models）和连接测试。

### 消息类型与渲染

`Message.type`：`'dialogue'` | `'narration'` | `'system'` | `'ooc'`。

`MessageBubble.tsx`：system 居中灰色，narration GM 粉红左边框，dialogue 左右气泡（Avatar 首字 + 角色颜色）。Markdown 通过 `react-markdown` + `remark-gfm` 渲染。

### 设计令牌

`src/index.css` 的 `@theme` 块定义 CSS 变量。暗色默认，`[data-theme='light']` 覆盖亮色。主题从 localStorage 初始化（无闪烁），切换后写入 localStorage。body 有 `transition: background-color 0.3s`。

### 角色提示词构建

`buildCharacterPrompt()` 组装：角色名称 → 描述 → 性格 → 说话风格 → 世界设定 → 系统提示词（"核心指令（最高优先级）"）→ 示例对话 → 通用规则。`buildMessagesForAgent()` 将历史消息截取最近 20 条，`characterId === 'user'` → `role: 'user'`，其余 → `role: 'assistant'`。

## 关键约束

- **不依赖原生模块** — sql.js 替代 better-sqlite3。新依赖不能需要 node-gyp。
- **界面中文** — UI 文案和 LLM 输出均为中文。
- **electronAPI 仅 Electron 环境可用** — 始终 `npm run dev` 而非仅 `npm run dev:vite`。
- **settingsStore 用 localStorage** — API 配置和主题不经过 SQLite，直接用 localStorage。
- **sessionStore 变更即持久化** — `updateSession()` 自动调 `saveSession()` 写 SQLite。
- **数据库 camelCase 别名** — `listSessions` SQL 中 `created_at as createdAt, updated_at as updatedAt`，否则前端拿到 snake_case 字段导致日期显示异常。

## 文档索引

| 文档 | 用途 |
|------|------|
| `README.md` | 项目入口 |
| `docs/requirements.md` | 功能需求与实现状态 |
| `docs/design-spec.md` | 设计规格（色板、组件、动效、设置界面） |
| `docs/progress.md` | 版本开发进度 |
| `docs/testing.md` | 测试流程 |
| `docs/test-cases.xlsx` | 手动测试用例（v0.1.0 ~ v0.2.1） |
| `docs/superpowers/plans/archive/` | 已完成实施计划 |
