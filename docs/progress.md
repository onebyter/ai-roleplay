# AI RolePlay - 开发进度文档

## 版本记录

### v0.1.0 - 基础架构 (2026-05-10)

**状态**: 已完成

**完成内容**:

- [X] Electron + React + TypeScript 项目脚手架
- [X] Vite 构建配置
- [X] SQLite 数据库初始化 + schema
- [X] 基础 UI 布局（三栏：侧边栏 + 聊天区 + 右侧面板）
- [X] 消息气泡组件（区分用户/AI/GM/旁白样式）
- [X] 消息输入组件（支持选择发言身份）
- [X] Zustand 状态管理（4 个 store）
- [X] 类型系统定义（Character, Message, Session, Agent）
- [X] LLM 流式调用封装（主进程 IPC + 渲染进程）
- [X] 文件操作 IPC（txt 导入/导出）
- [X] 侧边栏（会话列表、角色库）
- [X] 右侧面板（世界设定、角色列表、会话信息）
- [X] Tailwind CSS v4 集成
- [X] Git 版本管理初始化
- [X] 暗色主题基础配色
- [X] 消息气泡动画（淡入 + 上滑）
- [X] 打字指示器动画（三点脉冲）
- [X] 按钮 hover 交互反馈

**文件清单** (27 个源文件):

```
electron/main.ts, preload.ts
electron/ipc/database.ts, llm.ts, file.ts
src/main.tsx, App.tsx, index.css
src/components/layout/Sidebar.tsx, ChatArea.tsx, RightPanel.tsx
src/components/chat/MessageBubble.tsx, MessageInput.tsx
src/stores/sessionStore.ts, characterStore.ts, chatStore.ts, settingsStore.ts
src/types/character.ts, message.ts, session.ts, agent.ts
src/utils/llm-client.ts
```

**构建状态**: 编译通过 (Electron TS + Vite build)

---

### v0.1.1 - Bug Fixes (2026-05-10)

**状态**: 已完成

**修复内容**:

- [X] 数据持久化：store 现在通过 IPC 调用 SQLite (sql.js)，数据重启不丢失
- [X] 会话列表：侧边栏显示所有会话，支持切换和删除
- [X] GM 模式联动：切换模式时自动切换用户角色，反之亦然
- [X] 消息自动保存：聊天消息实时同步到会话并持久化
- [X] 角色持久化：角色数据自动保存到 SQLite
- [X] 替换 better-sqlite3 为 sql.js（解决 Electron Node 版本不匹配问题）

**回归验证**: 见 testing.md T-007 ~ T-009

---

### v0.1.2 - 工程基础设施 (2026-05-11)

**状态**: 已完成

**完成内容**:

- [X] CLAUDE.md — 项目架构文档、开发规范、skill 使用流程
- [X] `docs/design-spec.md` — 基于 Cherry Studio 分析的完整设计规格（亮/暗双主题色板、组件规格、动效规范）
- [X] Vitest 测试框架搭建（vitest.config.ts + jsdom + @testing-library/react）
- [X] 示例单元测试 `src/stores/chatStore.test.ts`（5 个用例，全部通过）
- [X] `docs/test-cases.xlsx` — 结构化测试用例管理（v0.1.0 28 条 + v0.1.1 12 条），汇总 Sheet 自动统计
- [X] `docs/testing.md` — 精简为测试流程说明 + 模板
- [X] `docs/requirements.md` — 修正过时色值和技术栈描述
- [X] 修复 T-008-3：切换会话时无操作也更新 updatedAt
- [X] 修复会话列表时间显示"非法时间"（SQL snake_case → camelCase 别名）

**构建状态**: 编译通过，5/5 测试通过

---

### v0.2.0 - 单角色对话 (2026-05-11)

**状态**: 已完成

**计划内容**:

- [ ] 角色卡编辑器 UI（表单化编辑所有字段）
- [ ] 角色头像上传/选择
- [ ] 单角色对话功能（1 个 AI agent + 用户）
- [ ] API 配置页面（endpoint、key、model 选择）
- [ ] 流式输出实时显示
- [ ] 对话历史持久化
- [ ] UI：角色卡片设计（头像、名称、标签、预览）
- [ ] UI：输入框样式优化（圆角、阴影、焦点态）

---

### v0.3.0 - 多智能体系统 (计划中)

**状态**: 待开发

**计划内容**:

- [ ] AgentManager 智能体生命周期管理
- [ ] CharacterAgent 实现
- [ ] GMAgent 实现
- [ ] WorldAgent 实现
- [ ] Orchestrator 调度器
- [ ] 群聊多角色消息流

---

### v0.4.0 - GM & 世界系统 (计划中)

**状态**: 待开发

**计划内容**:

- [ ] GM 模式切换
- [ ] GM 控制面板
- [ ] 世界设定编辑器
- [ ] LoreEntry 关键词匹配
- [ ] 世界状态追踪

---

### v0.5.0 - 存档/读档 (计划中)

**状态**: 待开发

**计划内容**:

- [ ] 存档/读档 UI
- [ ] Session 完整快照序列化
- [ ] 自动保存 + 手动存档槽位

---

### v0.6.0 - 小说导入 & 打磨 (计划中)

**状态**: 待开发

**计划内容**:

- [ ] txt 小说文件导入
- [ ] LLM 角色提取流程
- [ ] SillyTavern 格式兼容导入
- [ ] 整体 UI 打磨：
  - [ ] 统一圆角 / 阴影 / 间距规范
  - [ ] Tab 切换下划线滑动动画
  - [ ] 面板展开/收起平滑过渡
  - [ ] 消息 Markdown 渲染样式美化
  - [ ] 图标统一替换为 Lucide Icons
  - [ ] 滚动条自定义样式
  - [ ] 亮色主题（可选）

---

### v1.0.0 - 正式版 (计划中)

**状态**: 待开发

**计划内容**:

- [ ] 端到端测试
- [ ] 性能优化
- [ ] 打包发布

---

## 当前进度

```
Phase 1 [██████████] 100% - 基础架构
Phase 2 [██████████] 100% - 单角色对话
Phase 3 [░░░░░░░░░░]   0% - 多智能体系统
Phase 4 [░░░░░░░░░░]   0% - GM & 世界系统
Phase 5 [░░░░░░░░░░]   0% - 存档/读档
Phase 6 [░░░░░░░░░░]   0% - 小说导入 & 打磨
Phase 7 [░░░░░░░░░░]   0% - 测试 & 发布
```

**总体进度**: ~29%
