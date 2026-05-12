# AI RolePlay

多智能体 AI 角色扮演桌面应用。创建角色（每个角色独立 AI 系统提示词），以群聊形式对话，支持 GM 主导和自由群聊模式。

**技术栈**: Electron + React 19 + TypeScript + Vite + Zustand + Tailwind CSS v4 + sql.js (WASM)

## 快速开始

```bash
npm install
npm run dev        # 启动开发环境（Vite + Electron）
npm test           # 运行单元测试
npm run build      # 生产构建
```

## 文档索引

| 文档 | 用途 |
|------|------|
| [docs/requirements.md](docs/requirements.md) | 功能需求定义 |
| [docs/design-spec.md](docs/design-spec.md) | 设计规格（色板、组件、动效） |
| [docs/progress.md](docs/progress.md) | 版本开发进度 |
| [docs/testing.md](docs/testing.md) | 测试流程说明 |
| [docs/test-cases.xlsx](docs/test-cases.xlsx) | 手动测试用例管理 |

## 当前状态

v0.2.1 — 单角色对话 + Bug 修复完成。亮/暗双主题、API 配置管理、角色编辑器可用。下一步 v0.3.0（多智能体系统）。
