# [版本号] [功能名称] 实施计划

> **创建时间**: YYYY-MM-DD
> **对应管线**: Phase 0 → Phase 5（详见 `CLAUDE.md` 开发 Skill 使用规范）
> **关联 Skill**: brainstorming / ui-ux-pro-max / frontend-design / writing-plans / test-driven-development / verification-before-completion / security-review / simplify / requesting-code-review / finishing-a-development-branch

---

## Phase 0 — 立项（brainstorming 产物）

### 需求来源

<!-- 从哪来的需求：用户反馈 / requirements.md 编号 / bug 报告 -->

### 用户意图与边界

<!-- 用户真正要什么，不做什么，为什么 -->

### 方案取舍

| 方案 | 优点 | 缺点 | 决策 |
|------|------|------|------|
| A: | | | |
| B: | | | ✅ 选用 |

### 关键决策记录

<!-- 非直觉的选择及其原因 -->

---

## Phase 1 — 设计

### 1.1 UX 结构（ui-ux-pro-max 产物）

> **仅 UI 任务填写**。纯逻辑任务（IPC、store、工具函数）跳过本节。

<!-- 交互流程、信息架构、可访问性、组件层级关系 -->

### 1.2 视觉方向（frontend-design 产物）

> **仅 UI 任务填写**。纯逻辑任务（IPC、store、工具函数）跳过本节。

<!-- 设计方向、关键交互、视觉参考。产出物作为 Phase 2 实现的视觉标准 -->

### 1.3 实施计划（writing-plans 产物）

> 3+ 步骤或跨文件变更时必填。1-2 步简单任务可简化为 checklist。

#### 依赖关系

```
Task 1: [名称] (基础)
  ├─→ Task 2: [名称] (依赖 1)
  └─→ Task 3: [名称] (依赖 1)
Task 4: [名称] (独立，可与 1 并行)
```

#### 文件变更清单

| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `src/...` | |
| 修改 | `src/...` | |
| 删除 | `src/...` | |

#### 任务拆解

- [ ] Task 1: [名称] — [一句话描述]
- [ ] Task 2: [名称] — [一句话描述]
- [ ] Task 3: [名称] — [一句话描述]

---

## Phase 2 — 实现（test-driven-development）

> 每个 Task 遵循：**先写失败测试 → 最小实现 → 重构 → 测试全绿**

### Task 1: [名称]

- **测试文件**: `src/...test.ts`
- **测试用例**:
  - [ ] [用例 1 描述]
  - [ ] [用例 2 描述]
- **实现文件**: `src/...`
- **重构记录**:

### Task 2: [名称]

- **测试文件**:
- **测试用例**:
- **实现文件**:
- **重构记录**:

---

## Phase 3 — 质检

> 代码写完、声称"完成"前，按顺序执行。

- [ ] `npm run typecheck` — 零错误
- [ ] `npm test` — 全部通过（通过数 / 总数）
- [ ] `npm run build` — 成功
- [ ] 手动测试 — `docs/test-cases.xlsx` 对应版本 Sheet 全部通过
- [ ] `security-review` — 涉敏变更时触发（IPC / 文件 I/O / API Key / 序列化）
- [ ] `simplify` — 检查重复代码、死代码、可读性

---

## Phase 4 — 审查（requesting-code-review 产物）

### 变更摘要

<!-- requesting-code-review 自动生成 -->

### 审查关注点

<!-- 需要 reviewer 重点看的部分 -->

---

## Phase 5 — 收尾（finishing-a-development-branch 产物）

- [ ] 所有 task 完成
- [ ] 质检全绿
- [ ] 审查通过
- [ ] 更新 `docs/progress.md` 的版本状态
- [ ] 更新 `docs/test-cases.xlsx` 的用例状态
- [ ] 确定合并方式（merge / squash / rebase）
- [ ] 清理临时文件、调试日志
