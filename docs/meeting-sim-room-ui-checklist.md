# 会议模拟室 · UI 一致性检查清单（对照议事厅）

在 `生态/业主端.html` 议事模块逐项勾选（Y/N）。

## 色彩与品牌

- [ ] 主操作按钮与议事申请一致：实心 `send-btn` + `var(--brand-main)`  
- [ ] 次级入口：白底 + 品牌色描边，hover 浅蓝 `#e6f7ff`  
- [ ] 说明文字层级：`#333` 标题、`#666` 辅助正文，与申请表单一致  

## 字体与字号

- [ ] 弹窗标题 `.apply-title`：16px / 700  
- [ ] Tab：与 `.council-tab-btn` 同一套 padding / font-size / active 白底阴影  
- [ ] 预览区标题 `.meeting-title`：与议事卡片列表一致  

## 间距与圆角

- [ ] 卡片 `border-radius: 16px`，与 `.meeting-card` 一致  
- [ ] 区块内边距：申请面板体系 `#f5f7fa` 与 20px 级 padding  
- [ ] 双按钮 `gap: 10px`，窄屏折行（≤360px 全宽堆叠）  

## 交互与动效

- [ ] 遮罩与面板进入动画 ≤300ms，曲线与材质不「跳变」  
- [ ] Tab `active` 状态切换清晰  
- [ ] 预览内容切换带淡出/入，加载层有骨架条动画  

## 无障碍

- [ ] `role="dialog"`、`aria-modal="true"`、`aria-labelledby` / `aria-describedby`  
- [ ] Tab：`role="tablist"` / `role="tab"` / `aria-selected`，预览 `role="tabpanel"`  
- [ ] 加载区域：`aria-busy`、加载层 `aria-hidden` 随显隐切换  
- [ ] `Esc` 关闭、`Tab` 顺序合理，关闭后焦点回到入口按钮  
- [ ] 左右方向键在 Tab 间循环（与常见 Tab 控件一致）  

## 响应式

- [ ] 桌面：`meeting-sim-panel` max-width 提升至 520px，预览区略增高  
- [ ] 移动：与 `apply-modal` 同宽、同 max-height 行为，内容可滚动  
