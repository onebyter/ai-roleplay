# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

AI RolePlay 是一款多智能体 AI 角色扮演桌面应用。用户创建角色（每个角色有独立的 AI system prompt），以群聊界面对话，可在 GM 主导模式和自由群聊模式之间切换。技术栈：Electron + React 19 + TypeScript + Vite + Zustand + Tailwind CSS v4 + sql.js（WASM SQLite，无需原生编译）。

当前阶段：v0.1.0 基础架构已完成，v0.1.1 bug 修复已完成。下一步 v0.2.0（单角色对话）。

## 常用命令

```bash
npm run dev           # 完整开发模式（Vite + Electron TS watch + 启动 Electron）
npm run dev:vite      # 仅启动 Vite 开发服务器（http://localhost:5173）
npm run dev:electron  # 编译 Electron TS 并启动（需要 Vite 已运行）
npm run build         # 生产构建（vite build + electron tsc）
npm run start         # 从 dist/ 启动 Electron
```

```bash
npm test            # 运行所有单元测试（vitest run）
npm run test:watch  # 监听模式
npm run test:coverage  # 覆盖率报告
```

基于 Vitest + jsdom + @testing-library/react。测试文件放在 `src/**/*.test.{ts,tsx}`。纯逻辑（store、utils）优先写测试，UI 交互用手动测试覆盖。

## 架构

### 双进程

- **主进程**（`electron/`）：Node.js，CommonJS 模块。创建 BrowserWindow，注册 IPC 处理器，与 sql.js 和 OpenAI SDK 交互。使用 `electron/tsconfig.json`（module: commonjs, target: ES2020）。
- **渲染进程**（`src/`）：React SPA，ESNext 模块，Vite + HMR，Tailwind CSS v4 `@theme` 自定义设计令牌。使用根目录 `tsconfig.json`（module: ESNext, bundler 模块解析, jsx: react-jsx）。路径别名 `@/` → `src/`。

`electron/preload.ts` 通过 `contextBridge.exposeInMainWorld('electronAPI', { db, llm, file, onStreamChunk, onStreamEnd, onStreamError })` 桥接两个进程。`window.electronAPI` 的类型声明在 `src/utils/llm-client.ts` 的 `declare global` 块中。

### IPC 模块（主进程处理）

| 模块 | 文件 | 功能 |
|------|------|------|
| Database | `electron/ipc/database.ts` | sql.js WASM SQLite。表结构：`sessions`、`characters`、`api_configs`。数据库文件位于 `app.getPath('userData')/ai-roleplay.db`。每次写入后自动调用 `saveDB()` 持久化。 |
| LLM | `electron/ipc/llm.ts` | OpenAI SDK 流式调用。维护 `activeStreams` Map，每个 agentId 对应一个 AbortController。通过 `webContents.send('llm:streamChunk', ...)` 推送流式块，并发送 end/error 信号。 |
| File | `electron/ipc/file.ts` | 原生文件对话框，用于导入 txt/json 和导出会话。 |

### Zustand 状态管理（渲染进程）

- **sessionStore** — 当前会话（mode、worldSetting、worldState、characters、messages、userRole、turnOrder）。所有修改通过 `window.electronAPI.db.saveSession()` 自动持久化到 SQLite。
- **chatStore** — 本地消息列表、流式状态（`isGenerating`、`generatingAgentId`、`streamingContent`）。消息变更时同步回 sessionStore。
- **characterStore** — 角色库，持久化到 SQLite `characters` 表。
- **settingsStore** — API 配置（`APIConfig[]`）、主题、语言。目前仅内存存储。

### LLM 流式调用流程

1. 渲染进程 `src/utils/llm-client.ts` 的 async generator `streamChat()` 调用 `window.electronAPI.llm.streamChat(config, messages, agentId)`。
2. 主进程创建 `OpenAI` 客户端，启动 `chat.completions.create({ stream: true })`。
3. 通过 `webContents.send('llm:streamChunk', { agentId, chunk })` 将流式块推送到渲染进程。
4. 渲染进程 `onStreamChunk` 回调通过 buffer + Promise 异步生成器模式收集流式块。
5. 中断支持：`llm:stopStream` IPC 中止对应 agentId 的 AbortController。

### UI 布局

三栏布局（`App.tsx`）：`Sidebar`（固定 256px）| `ChatArea`（自适应）| `RightPanel`（288px，可收起）。

- **Sidebar** — 三个 Tab：会话列表、角色库、设置占位。可创建/加载/删除会话和角色。
- **ChatArea** — 消息列表自动滚动，顶部模式/角色切换，底部 `MessageInput`。
- **RightPanel** — 三个 Tab：世界状态（可编辑时间/地点/环境）、参与角色列表、会话统计信息。

### 消息类型与渲染

`Message.type` 可取值：`'dialogue'` | `'narration'` | `'system'` | `'ooc'`。`MessageBubble.tsx` 渲染规则：system 消息居中灰色显示，narration 消息为 GM 风格粉红左边框块，dialogue 消息为左右气泡（带头像和角色颜色）。Markdown 通过 `react-markdown` + `remark-gfm` 渲染。

### 设计令牌（Tailwind CSS v4 @theme）

定义在 `src/index.css`。自定义暗色主题：`--color-bg-primary: #0f0f14`，强调色 `--color-accent: #7c6cff`，GM 色 `--color-gm: #f472b6`。8 个 `--color-char-*` 变量用于区分角色气泡颜色。圆角尺寸：sm(6) / md(8) / lg(12) / xl(16) / full(9999)。

## 开发规范

本项目内置了多个 skill，按以下顺序在开发流程中使用：

### 1. 开工前
- **新功能 / 新组件 / 行为变更** → 先调用 `brainstorming`，明确意图和方案后再动手。
- **多步骤任务**（涉及 3+ 文件或 2+ 模块）→ 先调用 `writing-plans`，产出书面计划，获得确认后再执行。不要边想边写。
- **独立的并行子任务** → 用 `subagent-driven-development` 并行推进。

### 2. 编码时
- **所有功能和 bug 修复** → 遵循 `test-driven-development`：先写测试，再写实现。
- **UI 组件/页面** → 调用 `frontend-design`，保证设计质量，避免通用 AI 美学。
- **遇到 bug** → 调用 `systematic-debugging`，先定位根因再修，不要猜测式修复。

### 3. 收尾前
- **代码改动完成** → 调用 `simplify`，检查重复代码、未用抽象、可优化点。
- **声称完成前** → 调用 `verification-before-completion`，运行构建/测试/检查，用证据说话。
- **重要功能完成** → 调用 `requesting-code-review`，检查是否满足需求。
- **分支开发完成** → 调用 `finishing-a-development-branch`，决定合并/PR/清理策略。

### 4. 其他
- **收到 review 反馈** → 调用 `receiving-code-review`，验证后再改，不要盲目接受。
- **需要功能隔离** → 调用 `using-git-worktrees`，创建独立工作树。
- **测试用例管理** → 用 `xlsx` skill 创建和维护 `test-cases.xlsx`。
- **前端 UI 验证** → 用 `webapp-testing`（Playwright）在浏览器中验证，截图确认。

### 沟通风格
- 每次操作文件或执行命令时，简要说明在做什么。

## 关键约束

- **不依赖原生 Node 模块** — sql.js 替代了 better-sqlite3（WASM 实现，无需 node-gyp）。新增依赖不能需要原生编译，除非通过 `@electron/rebuild` 处理。
- **界面为中文** — 所有 UI 文案为中文。LLM 输出也应为中文。
- **electronAPI 仅在 Electron 环境可用** — 渲染进程在纯浏览器环境没有回退方案。始终通过 `npm run dev`（而非仅 `npm run dev:vite`）测试完整功能。
- **数据库每次修改自动持久化** — sessionStore 的修改调用 `saveDB()`。数据库文件存储在 Electron userData 目录。
