# 数治理方 · 五端生态系统

业主端、物业端、业委会端、社区端、AI 端通过 **共享数据桥** 实现数据互通。各端功能规范与跨端对应关系详见项目根目录 **《五端功能文档关联索引》** 及《业主功能文档》《物业公司功能文档》《业委会功能文档》《社区功能文档》《AI功能文档》（均为 V2.7）。

## 文件说明

| 文件 | 说明 |
|------|------|
| **index.html** | 生态入口，可从此页跳转各端 |
| **ecosystem-bridge.js** | 共享数据层：localStorage + 跨标签页通知；支持 subscribe/subscribeByStore/getMeta |
| **ecosystem-物业端-adapter.js** | 物业端工单列表与 bridge 双向同步 |
| **ecosystem-ticket-utils.js** | 工单展示工具：badgeClass、statusBadge、markCell、ticketToRowHtml（property/community 模式） |
| **ecosystem-dashboard-utils.js** | 仪表盘统计工具：computeTicketMetrics、computeRiskAlerts、computeComplianceScore |
| **业主端.html** | 业主端：报修提交会写入 bridge，物业端可见 |
| **物业端.html** | 物业端：工单列表从 bridge 读写，其他端变更会同步 |
| **业委会端.html** | 业委会端：已接入 bridge，可读取工单/公告/维修金等 |
| **社区端.html** | 社区端：已接入 bridge，可读取共享数据 |
| **AI端.html** | AI 端：已接入 bridge |

## 数据互通前提：同源访问

五端使用 **localStorage** 和 **BroadcastChannel** 共享数据，必须在 **同一域名（同源）** 下打开才能互通。

- ✅ 推荐：用本地服务器打开本目录，例如：
  - `npx serve .` 然后访问 `http://localhost:3000/`
  - `python -m http.server 8080` 然后访问 `http://127.0.0.1:8080/`
- ❌ 直接双击 HTML（`file://`）时，各端之间 **无法** 共享数据。

## 互通数据项

- **工单**：业主端提交报修 → 写入 bridge → 物业端工单列表展示、接单/处理后会回写 bridge
- **公告**：物业端/业委会端发布，业主端首页社区动态、群聊公告轮播、通知中心均从 bridge 读取并展示
- **业主咨询、维修金申报**（含物业端批量上传的发票/合同附件与本地模拟 **AI 匹配** 元数据，存于 `maintenance_fund[].attachments`）、**评分异议、门禁通行码、不文明行为、认证待办、操作日志**：bridge 中均有存储接口，各端可按需读写

## 使用流程示例

1. 用 `npx serve .` 或 `python -m http.server 8080` 启动本地服务。
2. 打开 `http://localhost:端口/` 或 `http://127.0.0.1:端口/`，进入 **index.html**。
3. 在 **业主端** 提交一笔报修。
4. 打开 **物业端**，在工单列表中应能看到该条工单（若未看到可刷新页面）。
5. 在物业端接单、处理，状态会写入 bridge；其他已打开的同源页面可通过 `storage` 事件或 `subscribe` 收到更新。

## 工单联调与测试（关联数据展示与互动）

为保证生态内工单**展示、使用、互动**一致可用，建议按以下路径自测（同源访问前提下）：

1. **业主端 → 物业端**
   - 业主端：智能报修 / 报修提交，提交后工单写入 bridge。
   - 物业端：工单列表自动从 bridge 拉取；新工单**自动接单**为「处理中」。
   - 物业端：点击「查看」打开工单详情；点击「提交结果」填写说明并提交，工单变为「待验收」，操作会写入 bridge 并记操作日志。

2. **物业端内部联动**
   - 工单详情中「接单」、处理中工单「提交结果」、弹窗内「从本工单发起维修金申报」：状态与维修金申报会回写列表并同步 bridge。
   - 数据看板、侧栏待办数字由当前工单列表统计，随列表更新。

3. **业委会端**
   - 进入「物业监管」，点击「同步物业数据」：从 bridge 拉取工单并展示在监管工单列表。
   - 列表支持筛选、详情、督办意见（详情与督办为本地扩展，工单基础数据来自 bridge）。

4. **社区端**
   - 进入「共治监督广场」→「工单监督」：列表在加载时从 bridge 拉取工单并展示。
   - 支持按状态筛选；可点击「研判」「查看」打开弹窗，与生态内工单数据一致。

## 扩展

- 业委会端、社区端、AI 端已引入 `ecosystem-bridge.js`，可在其脚本中通过 `window.EcosystemBridge.getTickets()`、`getBulletins()` 等读取或写入数据，实现更多联动。
