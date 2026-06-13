# Orca Note Plugin: Send to Calendar — Plan

## 插件名
`orca-note-plugin-send-to-calendar`

## 功能
选中多个块 → 右击 → "发送到日历" → 选日期范围 → 批量复制到每日日记

## 文件夹结构
```
orca-note-plugin-send-to-calendar/
├── src/
│   ├── main.tsx                       # 入口（load/unload + 菜单注册）
│   ├── components/
│   │   └── SendToCalendarDialog.tsx   # 日期选择弹窗
│   ├── libs/
│   │   └── l10n.ts                    # 多语言（复用 share-card）
│   ├── translations/
│   │   └── zhCN.ts                    # 中文翻译
│   ├── orca.d.ts                      # 类型定义（复用 share-card）
│   └── vite-env.d.ts                  # Vite 声明
├── public/
│   └── styles.css                     # 预留样式
├── icon.png                           # 日历图标
├── index.html                         # Vite 入口 HTML
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## 依赖 / 脚手架
- 从 `orca-plugin-share-card-main` 复制：`package.json`、`tsconfig.json`、`vite.config.ts`、`index.html`、`src/orca.d.ts`、`src/libs/l10n.ts`、`src/vite-env.d.ts`
- 改 `package.json` 的 `name` 和入口文件名

## 核心 API 路线
1. `orca.blockMenuCommands.registerBlockMenuCommand(id, { worksOnMultipleBlocks: true, render })`
2. `orca.components.DatePicker` 的 `range={true}` 模式
3. `orca.invokeBackend("get-journal-block", date)` — 获取/创建日记块
4. `orca.commands.invokeEditorCommand("core.editor.copyBlocks", null, [blockIds], journalBlockId, "lastChild")`
5. `orca.commands.invokeGroup` — 批量操作原子化
6. `orca.notify("success", ...)` — 完成通知

## 各文件职责

### `src/main.tsx`
- `load(name)`: 注册 `${name}.sendToCalendar` 菜单命令；挂一个 `ref` 存 blockIds
- `unload()`: 注销命令
- 弹窗通过 `ReactDOM.createRoot` 挂到独立容器（同 share-card 的 `Decorations` 模式）

### `src/components/SendToCalendarDialog.tsx`
- 用 `orca.components.ModalOverlay` 包住整体
- 内嵌 `orca.components.DatePicker`（`mode="date"` + `range={true}`）
- 显示选中块数量
- 底部 "发送" 按钮
- 发送逻辑：
  1. `expandDateRange(start, end)` 展开成每日数组
  2. 遍历日期：`get-journal-block` → `invokeGroup` → `copyBlocks`
  3. 结束后 `orca.notify` 并关闭

### `src/translations/zhCN.ts`
```ts
const zhCN = {
  "Send to calendar": "发送到日历",
  "Select date range": "选择日期范围",
  "blocks selected": "个块已选中",
  "Send": "发送",
  "Cancle": "取消",
  "Sent ${blockCount} blocks to ${dayCount} days' journal":
    "已将 ${blockCount} 个块发送到 ${dayCount} 天的日记",
}
```

### `plan.md`
本文件

## 待测试验证项
- `core.editor.copyBlocks` 在 `cursor=null` + 目标块不在当前面板时是否正常工作
- `get-journal-block` 在日记不存在时的行为（预期自动创建）
- 如上述失败，fallback：`orca.nav.openInLastPanel("journal", { date })` 打开面板 → copy → 不关面板

## 构建 & 部署
```bash
cd orca-note-plugin-send-to-calendar
pnpm install
pnpm build
```
复制以下文件到 `C:\Users\huang\Documents\orca\plugins\orca-note-plugin-send-to-calendar\`：
- `dist/index.js`
- `icon.png`
- `package.json`
- `README.md`
