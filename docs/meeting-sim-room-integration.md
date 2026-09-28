# 主持培训室（原会议模拟室）· 与议事厅组件库集成说明

面向 **会议主持人培训**：内容对齐真实页面 `#prep-room-modal`（会前准备室）与 `#online-room`（线上会议室）的职责与控件，非普通业主参会教程。

## 位置

- **入口**：`生态/业主端.html` → `#page-council` → `#council-list-apply` → `.council-apply-intro` 内 `.council-apply-actions`（按钮文案：**主持培训室**）
- **弹窗**：同文件内 `#meeting-sim-modal`（与 `#apply-meeting-modal` 并列）

## 复用的设计系统

| 能力 | 复用类/变量 |
|------|-------------|
| 遮罩与面板栅格 | `.apply-modal`、`.apply-modal-panel`、`.apply-header`、`.apply-title` |
| 阶段切换视觉 | `.council-tab-group`、`.council-tab-btn`、`.active`（与议事 Tab 一致） |
| 预览卡片 | `.meeting-card`、`.meeting-header`、`.meeting-status-badge`、`.meeting-title`、`.meeting-meta` |
| AI/说明条 | `.ai-summary-box`、`.ai-label` |
| 主按钮 | `.send-btn`（发起申请） |
| 品牌色与圆角 | `var(--brand-main)`、`var(--radius-full)` |

## 全局 API（便于联调与测试）

页面加载后挂载在 `window.MeetingSimRoom`：

```js
MeetingSimRoom.open(document.getElementById('btn-open-meeting-sim')); // 打开并聚焦 Tab
MeetingSimRoom.setPhase('during', document.getElementById('meeting-sim-tab-during'));
MeetingSimRoom.getPhase(); // 'pre' | 'during' | 'post'
MeetingSimRoom.close();
MeetingSimRoom.buildHTML('post'); // 仅生成预览 HTML 字符串（单元测试可用）
MeetingSimRoom.refreshWorkshop(); // 仅重绘当前阶段（含跟做操作区），不经过 Tab 切换动画
MeetingSimRoom.resetWorkshopAll(); // 重置会前/会中/会后模拟进度（再次打开弹窗时也会自动重置）
```

## 跟做操作区（主持人视角）

| 大阶段 | 对照真实模块 | 操作概要 |
|--------|----------------|----------|
| 会前 | `prep-room-modal` 六 Tab | 每栏多**细项卡片**（计 25 条）：含真实控件 id、函数名（如 `copyPrepMeetingLink`）、口播话术与异常处置，逐项点「本条已演练」 |
| 会中 | `online-room` 控场 | 六栏与准备室同级：**26 条**可勾选主持细项（每栏多条卡片 + DOM/函数对照）+ 深色条顶栏示意 + **模拟投票收束**；投票栏须完成三条 checklist 且提交模拟表决后栏目标记为通关 |
| 会后 | 纪要 + 公示归档 + 督办 | **纪要 / 公示 / 行动项 / 评价** 四分栏 |

数据均为前端模拟，不写后端。

## 依赖

- 页面已引入的 **Font Awesome** 图标
- 无后端接口；预览内容为前端静态文案

## 后续若拆分为独立模块

1. 将 `getMeetingSimPhaseCopy` / `buildMeetingSimPreviewHTML` / `setMeetingSimPhase` 移至 `生态/meeting-sim-room.js`  
2. 在 `业主端.html` 底部 `script type="module"` 引入，或保留 IIFE 挂载 `window.MeetingSimRoom`  
3. CSS 迁至 `生态/meeting-sim-room.css` 并在 head 引入  

当前交付为 **单文件集成**，与项目「业主端以前端展示为主」约定一致。

## 会中六栏 · 26 条细项（主持培训室）

与 `buildMeetingSimDuringRoomPanel` / `meetingSimDuringFreshState` 一致；**投票**栏除 3 条 checklist 外须点击「宣布收束本轮表决」完成模拟表决后，整栏才显示 ✓。

| 栏 | 条数 | 状态对象键（`meetingSimState.during`） |
|----|------|----------------------------------------|
| 原则 | 5 | `principles.*`（含 `.status-bar`、`#meeting-duration`、`aiActionViewMinutes` 等对照） |
| 资料/白板 | 5 | `docWb.*`（`#doc-viewer-area`、`#wb-toolbar`、`toggleViewMode`） |
| 控麦 | 5 | `queue.*`（含 `handDemo`：按钮走 `meetingSimDuringDemoRaiseHand`） |
| 投票 | 3 + 模拟表决 | `vote.*` + `voted` |
| 名单 | 4 | `roster.*`（`#participant-panel`） |
| 升级 | 4 | `upgrade.*`（`#btn-upgrade`、§5.2.7） |
