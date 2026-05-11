# AI RolePlay - 测试文档

## 测试体系

本项目采用**自动化测试 + 手动测试**两层体系：

| 层次 | 工具 | 覆盖范围 |
|------|------|----------|
| 单元测试 | Vitest + jsdom | Store 逻辑、工具函数、IPC 处理 |
| 手动测试 | `docs/test-cases.xlsx` | UI 交互、集成流程、外观验证 |

### 自动化测试

```bash
npm test              # 单次运行全部单元测试
npm run test:watch    # 监听模式，文件变更自动重跑
npm run test:coverage # 覆盖率报告
```

测试文件：`src/**/*.test.{ts,tsx}`。编写规范遵循 `test-driven-development` skill。

### 手动测试

测试用例管理在 `docs/test-cases.xlsx`，每个版本一个 Sheet：
- 用例编号、模块、测试项、操作步骤、预期结果
- 优先级（P0/P1/P2 下拉选择）
- 状态（待测试/通过/失败/跳过，下拉选择）
- "汇总" Sheet 自动统计各版本通过率

## 测试流程

1. 功能开发前：在 `test-cases.xlsx` 对应版本 Sheet 中添加用例
2. 功能开发中：运行 `npm run test:watch`，先写测试再写实现
3. 功能完成后：
   - `npm test` 确认单元测试全部通过
   - `npm run dev` 启动应用，按 xlsx 用例逐项手动验证
   - 用例状态填为"通过"或"失败"
4. 回归测试：修复 bug 后，在对应版本 Sheet 末尾追加回归验证行

## 测试报告模板

```
测试日期: YYYY-MM-DD
测试版本: v0.x.x
环境: Windows 11 / macOS / Linux

测试结果:
- 通过: X 项
- 失败: X 项  
- 跳过: X 项
- 通过率: XX%

失败项详情:
1. [用例编号]: [问题描述]
2. ...

备注:
[其他说明]
```
