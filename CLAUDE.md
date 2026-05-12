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

## 图片识别（视觉能力）

当前底层模型不具备原生识图能力。遇到图片时**不要用 Read 工具**，改用 vision.js：

```
node vision.js "<图片路径>" "<分析提示词>"
```

支持本地路径和网络 URL（`--url` 参数）。配置：`VISION_API_KEY` + `VISION_MODEL` 环境变量（默认走魔搭社区 Qwen3-VL）。

### 开发场景提示词（管线内使用）

**场景 A — 界面理解**（用户发截图说"看看这个"、"这个怎么做"，需要模型建立视觉认知后才能讨论）：

```
请详细描述这张界面截图：1) 这是什么页面/功能（推断用途）；2) 整体布局（几栏、上中下结构、元素位置关系）；3) 每个区域里有什么（文字内容、按钮、输入框、图标等，逐区域描述）；4) 当前界面处于什么状态（初始/填写中/错误/加载等）；5) 用户可能的操作流程。描述要足够细致，让我即使看不到图也能完全理解这个界面。
```

**场景 B — UI 设计分析**（Phase 1，用户提供参考图/竞品截图/当前界面，要提取技术细节用于实现）：

```
请从 UI/UX 开发角度详细分析这张截图：1) 布局结构（网格/弹性布局、间距体系）；2) 色彩方案（主色/辅色/背景色，如有 hex 值请提取）；3) 字体排印（字号层级、字重、行高）；4) 组件清单（按钮/输入框/卡片/导航栏等，描述各自的样式）；5) 交互模式（hover/点击/过渡效果）；6) 阴影和圆角系统；7) 可用于 Tailwind CSS 实现的技术细节。最后给出 3-5 条可改进的建议。
```

**场景 C — UI 质量对比**（Phase 3，对比实现截图与设计规格/参考图）：

```
请对比分析这张截图：1) 与 design-spec.md 中定义的设计令牌是否一致（色板、圆角、阴影、字体）；2) 组件规格是否匹配（按钮高度、输入框样式、间距）；3) 是否有视觉缺陷（对齐问题、颜色偏差、层级混乱）；4) 列出 3-5 条需修复的问题，按严重程度排序。
```

**场景 D — 通用识图**（非开发场景）：

```
请详细描述这张图片的内容。
```

## 关键约束

- **不依赖原生模块** — sql.js 替代 better-sqlite3。新依赖不能需要 node-gyp。
- **界面中文** — UI 文案和 LLM 输出均为中文。
- **electronAPI 仅 Electron 环境可用** — 始终 `npm run dev` 而非仅 `npm run dev:vite`。
- **settingsStore 用 localStorage** — API 配置和主题不经过 SQLite，直接用 localStorage。
- **sessionStore 变更即持久化** — `updateSession()` 自动调 `saveSession()` 写 SQLite。
- **数据库 camelCase 别名** — `listSessions` SQL 中 `created_at as createdAt, updated_at as updatedAt`，否则前端拿到 snake_case 字段导致日期显示异常。

## 开发 Skill 使用规范

所有 skill 调用自动记录到 `.claude/skill-usage.log`。开发遵循以下四阶段管线，skill 按阶段严格触发。

### 管线总览

```
Phase 0: 立项    → brainstorming
Phase 1: 设计    → vision 截图分析（参考/现状）→ ui-ux-pro-max（UX 结构）→ frontend-design（视觉）/ writing-plans（计划）
Phase 2: 实现    → test-driven-development
Phase 3: 质检    → verification-before-completion（含 vision 对比验证）→ security-review（涉敏）→ /simplify（独立 agent 审查）
Phase 4: 审查    → requesting-code-review → receiving-code-review（有反馈时）
Phase 5: 收尾    → finishing-a-development-branch

例外（随时触发）: systematic-debugging / Explore（子 agent 并行搜索）
```

### Phase 0 — 立项

| Skill | 触发条件 | 说明 |
|-------|----------|------|
| `brainstorming` | 收到任何新功能/组件/创意需求后，**写代码前** | 探索用户意图、需求边界、设计方案取舍。确认后再进入 Phase 1 |

### Phase 1 — 设计

| Skill | 触发条件 | 说明 |
|-------|----------|------|
| `node vision.js` | 用户提供截图/参考图，或要求分析当前 UI、学习其他应用界面、对比改进时 | 调用魔搭 Qwen3-VL 分析图片，产出文字描述。用于设计参考、现状诊断、竞品分析 |
| `ui-ux-pro-max` | 任务涉及 UI 组件、交互流程、页面布局时，视觉分析之后 | UX 架构、可访问性、交互模式、设计系统化。先定结构再定视觉 |
| `frontend-design` | UI 任务在 ux-pro-max 明确结构后 | 生成有辨识度的生产级视觉设计，配色/排版/动效方向。产出物作为实现参考 |
| `writing-plans` | 任务包含 3+ 步骤或跨文件变更时，设计明确后 | 产出 step-by-step 实施计划，含文件清单、依赖关系、验证步骤。1-2 步的简单任务可跳过 |

**选择规则**：
- 纯逻辑任务（IPC、store、工具函数）：只用 `writing-plans`
- UI 任务（组件、页面、样式、交互）：`node vision.js`（有截图/参考时）→ `ui-ux-pro-max`（UX 结构）→ `frontend-design`（视觉方向）→ `writing-plans`（实施计划）
- 小型 UI 调整（单组件微调）：可跳过 `writing-plans`，但必须走 `ui-ux-pro-max` + `frontend-design`

### 代码库探索（Explore 子 agent）

涉及跨文件/跨模块搜索时，使用 Explore 子 agent 并行搜索，而非逐个 Grep/Glob。典型场景：

| 场景 | 示例 |
|------|------|
| 设计前摸底 | "在哪些文件里用到了 X 组件？X 的数据流是怎么走的？" |
| 影响分析 | "改 Y 接口会影响哪些调用方？" |
| 实现中查引用 | "Z 函数在哪些地方被调用了？类型定义在哪里？" |

Explore agent 指定搜索广度：`quick`（单点查找）、`medium`（中等探索）、`very thorough`（多路径多命名搜索）。

### Phase 2 — 实现

| Skill | 触发条件 | 说明 |
|-------|----------|------|
| `test-driven-development` | 编写任何实现代码前，Plan 完成后 | 先写失败测试 → 最小实现 → 重构。不跳过此环节 |
| Explore 子 agent | 实现中需要跨文件搜索引用、类型定义、调用链时 | 并行搜索替代逐个 Grep，搜索广度选 medium 或 very thorough |

**测试边界**：自动化测试（vitest）覆盖 store 逻辑、工具函数、IPC 处理；手动测试覆盖 UI 交互、视觉验证（用例管理在 `docs/test-cases.xlsx`）。详见 `docs/testing.md` 的管线映射表。

### Phase 3 — 质检

| Skill | 触发条件 | 顺序 |
|-------|----------|------|
| `verification-before-completion` | 声称"完成了"之前 | 1 |
| `node vision.js` | UI 变更后，对比截图与 `docs/design-spec.md` 或参考图，验证视觉还原 | 2 |
| `security-review` | 修改了 Electron IPC、文件 I/O、API Key 存取、数据序列化时 | 3 |
| `/simplify` | verification 通过后，commit 前。启动 code-simplifier 独立 agent（opus 模型）审查 | 4 |

**verification 检查清单**：`npm test` 全绿 + `npm run typecheck` 零错误 + `npm run build` 成功 + 手动测试用例通过。

### Phase 4 — 审查

| Skill | 触发条件 | 说明 |
|-------|----------|------|
| `requesting-code-review` | 质检全部通过后，merge/PR 前 | 生成 review 用的代码变更摘要 |
| `receiving-code-review` | 收到审查反馈后，**实施前** | 先验证反馈的合理性再改，不盲从 |

### Phase 5 — 收尾

| Skill | 触发条件 | 说明 |
|-------|----------|------|
| `finishing-a-development-branch` | 审查通过，准备合并 | 结构化的合并/PR/清理决策，不遗留临时文件 |

### 例外流程 — 调试

| Skill | 触发条件 | 说明 |
|-------|----------|------|
| `systematic-debugging` | 遇到任何 bug、测试失败、异常行为 | **必须先诊断再修**，禁止拍脑袋修。发现问题 → 复现 → 定位根因 → 修 → 回归测试 |

## 文档索引

| 文档 | 用途 |
|------|------|
| `README.md` | 项目入口 |
| `docs/requirements.md` | 功能需求与实现状态 |
| `docs/design-spec.md` | 设计规格（色板、组件、动效、设置界面） |
| `docs/progress.md` | 版本开发进度 |
| `docs/testing.md` | 测试流程 |
| `docs/test-cases.xlsx` | 手动测试用例（v0.1.0 ~ v0.2.1） |
| `docs/superpowers/plans/_template.md` | 新计划模板（按 Phase 0-5 结构） |
| `docs/superpowers/plans/archive/` | 已完成实施计划 |
