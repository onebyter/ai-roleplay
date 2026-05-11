# 设计规格文档

基于 Cherry Studio 开源代码分析，为 AI RolePlay 制定设计系统规范。

## 1. 主题切换机制

Cherry Studio 使用 **属性选择器 + class** 双重切换：

- `document.body.setAttribute('theme-mode', 'dark' | 'light')` → CSS `[theme-mode='light']` 覆盖变量
- `document.documentElement.classList.add('dark' | 'light')` → Tailwind v4 `@custom-variant dark`
- 三态支持：`light` / `dark` / `system`（跟随系统）

**AI RolePlay 实行方案：**

```
设置方式: document.documentElement.setAttribute('data-theme', 'dark' | 'light')
CSS 切换: :root 定义暗色（默认），[data-theme='light'] 定义亮色覆盖
组件引用: 全部组件使用 var(--color-*) 引用，无需修改组件代码
切换入口: settingsStore.setTheme() → 更新 data-theme 属性 + 持久化
```

## 2. 完整色板（两套主题）

### 2.1 背景层级

| Token | 暗色 | 亮色 | 用途 |
|-------|------|------|------|
| `--color-bg-primary` | `#0f0f14` | `#ffffff` | 主背景（最深/最亮） |
| `--color-bg-secondary` | `#16161e` | `#f5f5f7` | 侧边栏、面板背景 |
| `--color-bg-tertiary` | `#1e1e2a` | `#e8e8ed` | 输入框、卡片背景 |
| `--color-bg-elevated` | `#252533` | `#fafafa` | 浮层、气泡、标签背景 |
| `--color-bg-hover` | `#2a2a3a` | `#f0f0f0` | 悬停态 |
| `--color-bg-active` | `#32324a` | `#e0e0e7` | 激活/选中态 |
| `--color-bg-overlay` | `rgba(0,0,0,0.6)` | `rgba(0,0,0,0.3)` | 模态框遮罩 |

### 2.2 文字层级

| Token | 暗色 | 亮色 | 用途 |
|-------|------|------|------|
| `--color-text-primary` | `#f0f0f5` | `#1b1b1f` | 主文字 |
| `--color-text-secondary` | `#a0a0b8` | `#6b6b82` | 次要文字 |
| `--color-text-muted` | `#6b6b82` | `#8e8e93` | 禁用/占位符文字 |

### 2.3 强调色（两套主题保持一致）

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-accent` | `#7c6cff` | 主强调色（按钮、链接、选中） |
| `--color-accent-hover` | `#6a5ae0` | 强调色悬停 |
| `--color-accent-soft` | `rgba(124,108,255,0.15)` | 强调色柔光背景 |
| `--color-accent-glow` | `rgba(124,108,255,0.25)` | 强调色发光 |

### 2.4 语义色

| Token | 暗色 | 亮色 | 用途 |
|-------|------|------|------|
| `--color-success` | `#34d399` | `#16a34a` | 成功 |
| `--color-warning` | `#fbbf24` | `#d97706` | 警告 |
| `--color-error` | `#f87171` | `#dc2626` | 错误 |
| `--color-info` | `#60a5fa` | `#3b82f6` | 信息 |

### 2.5 GM 色

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-gm` | `#f472b6` | GM 叙述/操作主色 |
| `--color-gm-soft` | `rgba(244,114,182,0.12)` | GM 柔光背景 |

### 2.6 角色色板（8 色，两套主题共用）

```
--color-char-1: #7c6cff    --color-char-5: #34d399
--color-char-2: #f472b6    --color-char-6: #a78bfa
--color-char-3: #22d3ee    --color-char-7: #f87171
--color-char-4: #fb923c    --color-char-8: #60a5fa
```

### 2.7 边框色

| Token | 暗色 | 亮色 |
|-------|------|------|
| `--color-border` | `#2a2a3a` | `#d1d1d6` |
| `--color-border-subtle` | `#22222e` | `#e5e5ea` |

### 2.8 圆角

| Token | 值 | 用途 |
|-------|-----|------|
| `--radius-sm` | `6px` | 小元素（标签、角标） |
| `--radius-md` | `8px` | 按钮、输入框 |
| `--radius-lg` | `12px` | 卡片、气泡 |
| `--radius-xl` | `16px` | 大卡片、弹窗 |
| `--radius-full` | `9999px` | 药丸形（头像、badge） |

### 2.9 阴影

| Token | 暗色 | 亮色 | 用途 |
|-------|------|------|------|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.4)` | `0 1px 3px rgba(0,0,0,0.08)` | 轻微抬升 |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.4)` | `0 4px 16px rgba(0,0,0,0.1)` | 浮层 |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.5)` | `0 8px 32px rgba(0,0,0,0.15)` | 弹窗 |
| `--shadow-accent` | `0 0 20px rgba(124,108,255,0.15)` | `0 0 20px rgba(124,108,255,0.1)` | 强调色发光 |

## 3. 字体排印

| 层级 | 字号 | 行高 | 字重 | 用途 |
|------|------|------|------|------|
| 标题 1 | 20px | 1.4 | 700 (bold) | 页面主标题 |
| 标题 2 | 16px | 1.4 | 600 (semibold) | 区域标题 |
| 正文 | 14px | 1.6 | 400 (normal) | 正文、列表、消息 |
| 辅助文字 | 12px | 1.5 | 400 (normal) | 标签、时间戳 |
| 小字 | 11px | 1.5 | 500 (medium) | Tab 标签、徽标 |
| 代码 | 13px | 1.5 | 400 (normal) | 行内代码、代码块 |

**字体族**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif`

## 4. 组件规格

### 4.1 Button

| Prop | 可选值 | 说明 |
|------|--------|------|
| `variant` | `default` / `secondary` / `ghost` / `danger` | default 用强调色，secondary 用 elevated 背景+边框，ghost 透明，danger 红色文字 |
| `size` | `sm` (28px) / `md` (32px) / `lg` (40px) | 高度 |
| `disabled` | boolean | 透明度 40%，禁止点击 |

**交互**: `transition-all duration-150`，`active:scale-[0.97]`，focus-visible 显示 2px 强调色轮廓

### 4.2 Input / Textarea

- 高度: Input 32px，Textarea 自适应
- 背景: `--color-bg-tertiary`，边框: `--color-border`
- 聚焦: 边框变 `--color-accent`，附加 `--shadow-accent`
- 过渡: `transition-all duration-150`

### 4.3 Badge

| Variant | 样式 |
|---------|------|
| `default` | 三级背景 + 次要文字 |
| `accent` | 强调色柔光背景 + 强调色文字 |
| `success` / `warning` / `error` | 各自半透明背景 + 对应颜色文字 |
| `gm` | GM 柔光背景 + GM 色文字 |

样式: `inline-flex`，药丸圆角，`px-2 py-0.5`，`text-xs font-medium`

### 4.4 Avatar

| Size | 尺寸 | 字号 |
|------|------|------|
| `sm` | 24×24 | 10px |
| `md` | 32×32 | 12px |
| `lg` | 40×40 | 14px |

圆形。有 `src` 时渲染图片，否则渲染首字母（背景色由 `color` prop 或强调色决定）。

## 5. 动效规范

| 动效 | 时长 | 缓动 | 说明 |
|------|------|------|------|
| 按钮/输入框交互 | 150ms | ease (默认) | 颜色、边框、阴影变化 |
| 消息气泡进入 | 300ms | ease-out | `fadeInUp`：opacity 0→1 + translateY 8px→0 |
| 打字指示器 | 脉冲循环 | — | 3 个点，间隔 0.15s，`animate-pulse` |
| 面板展开/收起 | 250ms | ease-out | 宽度过渡 |
| Tab 下划线切换 | 200ms | ease-out | 左右滑动 |
| Modal 弹出 | 250ms | ease-out | 从底部滑入（参考 Cherry Studio animation-move-down-in） |
| 主题切换 | 300ms | linear | `transition: background-color 0.3s linear`（加在 body 上） |

## 6. 布局系统

- **三栏**: 侧边栏 256px（固定）| 聊天区 flex-1 | 右侧面板 288px（可收起）
- **最小窗口**: 1000×700
- **消息气泡**: 最大宽度 70%，左右交错
- **间距**: 使用 Tailwind 默认间距体系，组件内统一 `p-3` / `gap-2.5` / `space-y-3`

## 7. 图标

使用 `lucide-react`，默认颜色跟随 `--color-icon`（暗色 `#ffffff99`，亮色 `#00000099`）。统一 14-16px 尺寸。

## 8. 实现优先级

| 优先级 | 内容 | 说明 |
|--------|------|------|
| P0 | 亮色色板 + `[data-theme]` 切换 | 核心主题切换机制 |
| P0 | 更新 `src/index.css` 为两套完整色板 | 替换当前单套暗色 |
| P1 | 主题切换过渡动画 | body 上 `transition: background-color` |
| P1 | 扩展组件 variant/size | 补充缺失的 variant |
| P2 | 面板展开/收起动画 | 宽度过渡 + ease-out |
| P2 | Tab 下划线滑动动画 | 替换当前瞬间切换 |
