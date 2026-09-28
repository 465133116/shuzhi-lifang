# 社区端虚拟测试数据说明文档

## 概述

本文档详细说明社区端虚拟测试数据的结构、字段含义、取值范围及关联关系，用于支持功能测试、界面测试和性能测试。

**版本**: 1.0.0  
**生成时间**: 2026-03-18  
**数据规模**: 完整测试集

---

## 1. 社区/小区基础数据 (communities)

### 数据结构

| 字段名 | 类型 | 含义 | 取值范围 | 必填 | 示例 |
|--------|------|------|----------|------|------|
| id | string | 小区唯一标识 | 格式: community_XXX | 是 | community_001 |
| name | string | 小区名称 | 2-20字符 | 是 | 阳光小区 |
| address | string | 详细地址 | 完整地址字符串 | 是 | 北京市朝阳区阳光路88号 |
| totalHouseholds | number | 总户数 | 1-10000 | 是 | 520 |
| totalArea | number | 总建筑面积(平方米) | 1-500000 | 是 | 68000 |
| buildYear | number | 建成年份 | 1900-当前年份 | 是 | 2015 |
| propertyCompany | string | 物业公司名称 | 2-50字符 | 是 | 阳光物业管理有限公司 |
| committeeId | string | 业委会ID | 格式: committee_XXX | 是 | committee_001 |
| status | string | 状态 | active/inactive | 是 | active |

### 关联关系

- `committeeId` 关联业委会数据
- `propertyCompany` 关联物业评分数据

### 测试场景

| 场景 | 数据示例 | 说明 |
|------|----------|------|
| 正常状态 | community_001-004 | status='active' |
| 非活跃状态 | community_005 | status='inactive' |

---

## 2. 用户角色数据 (users)

### 2.1 社区管理员 (communityAdmins)

| 字段名 | 类型 | 含义 | 取值范围 | 必填 |
|--------|------|------|----------|------|
| id | string | 用户唯一标识 | 格式: user_admin_XXX | 是 |
| name | string | 姓名 | 2-10字符 | 是 |
| role | string | 角色 | 固定值: community_admin | 是 |
| communityId | string | 管辖小区 | 'all' 或具体小区ID | 是 |
| phone | string | 手机号 | 11位数字 | 是 |
| email | string | 邮箱 | 有效邮箱格式 | 是 |
| permissions | array | 权限列表 | view/edit/delete/export/manage/audit/config | 是 |
| createTime | string | 创建时间 | YYYY-MM-DD HH:mm:ss | 是 |
| lastLogin | string | 最后登录时间 | YYYY-MM-DD HH:mm:ss | 是 |
| status | string | 状态 | active/inactive | 是 |

### 2.2 社区治理专员 (communitySpecialists)

| 字段名 | 类型 | 含义 | 取值范围 | 必填 |
|--------|------|------|----------|------|
| id | string | 用户唯一标识 | 格式: user_specialist_XXX | 是 |
| name | string | 姓名 | 2-10字符 | 是 |
| role | string | 角色 | 固定值: community_specialist | 是 |
| communityId | string | 管辖小区 | 具体小区ID | 是 |
| phone | string | 手机号 | 11位数字 | 是 |
| email | string | 邮箱 | 有效邮箱格式 | 是 |
| permissions | array | 权限列表 | view/edit/export/audit | 是 |
| createTime | string | 创建时间 | YYYY-MM-DD HH:mm:ss | 是 |
| lastLogin | string | 最后登录时间 | YYYY-MM-DD HH:mm:ss | 是 |
| status | string | 状态 | active/inactive | 是 |

### 2.3 社区协管员 (communityAssistants)

| 字段名 | 类型 | 含义 | 取值范围 | 必填 |
|--------|------|------|----------|------|
| id | string | 用户唯一标识 | 格式: user_assistant_XXX | 是 |
| name | string | 姓名 | 2-10字符 | 是 |
| role | string | 角色 | 固定值: community_assistant | 是 |
| communityId | string | 管辖小区 | 具体小区ID | 是 |
| phone | string | 手机号 | 11位数字 | 是 |
| email | string | 邮箱 | 有效邮箱格式 | 否 |
| permissions | array | 权限列表 | view | 是 |
| createTime | string | 创建时间 | YYYY-MM-DD HH:mm:ss | 是 |
| lastLogin | string | 最后登录时间 | YYYY-MM-DD HH:mm:ss | 是 |
| status | string | 状态 | active/inactive | 是 |

### 权限说明

| 权限 | 说明 | 管理员 | 专员 | 协管员 |
|------|------|--------|------|--------|
| view | 查看数据 | ✓ | ✓ | ✓ |
| edit | 编辑数据 | ✓ | ✓ | ✗ |
| delete | 删除数据 | ✓ | ✗ | ✗ |
| export | 导出数据 | ✓ | ✓ | ✗ |
| manage | 系统管理 | ✓ | ✗ | ✗ |
| audit | 审计操作 | ✓ | ✓ | ✗ |
| config | 配置设置 | ✓ | ✗ | ✗ |

---

## 3. 工单数据 (tickets)

### 数据结构

| 字段名 | 类型 | 含义 | 取值范围 | 必填 |
|--------|------|------|----------|------|
| id | string | 工单唯一标识 | 格式: WO-YYYY-XXXX | 是 |
| type | string | 工单类型 | 报修/投诉/咨询/建议 | 是 |
| subType | string | 工单子类型 | 见子类型表 | 是 |
| room | string | 所属小区 | 小区名称 | 是 |
| building | string | 楼栋 | 如: A栋 | 否 |
| unit | string | 单元 | 如: 1单元 | 否 |
| roomNumber | string | 房号 | 如: 101 | 否 |
| description | string | 问题描述 | 10-500字符 | 是 |
| urgency | string | 紧急程度 | 紧急/一般/低 | 是 |
| status | string | 状态 | 见状态流转表 | 是 |
| source | string | 来源端 | 业主端/物业端/业委会端/AI端 | 是 |
| assignee | string | 承接方 | 物业维修部/物业客服部/null | 否 |
| createTime | string | 创建时间 | YYYY-MM-DD HH:mm:ss | 是 |
| acceptTime | string | 接单时间 | YYYY-MM-DD HH:mm:ss | 否 |
| completeTime | string | 完成时间 | YYYY-MM-DD HH:mm:ss | 否 |
| evaluateTime | string | 评价时间 | YYYY-MM-DD HH:mm:ss | 否 |
| satisfaction | number | 满意度评分 | 1-5 | 否 |
| evaluation | string | 评价内容 | 0-200字符 | 否 |
| rejectReason | string | 退单原因 | 0-200字符 | 否 |

### 工单子类型 (subType)

| 工单类型 | 子类型 |
|----------|--------|
| 报修 | 水电维修、电梯故障、门禁问题、公共设施、其他 |
| 投诉 | 物业服务、停车管理、噪音扰民、环境卫生、其他 |
| 咨询 | 政策咨询、流程咨询、费用咨询、其他 |
| 建议 | 设施改善、服务提升、管理优化、其他 |

### 状态流转

```
待接单 → 处理中 → 已完成 → 已评价
   ↓         ↓
 已退单    已退单
```

| 状态 | 说明 |
|------|------|
| 待接单 | 工单已创建，等待承接方接单 |
| 处理中 | 工单已被接单，正在处理 |
| 已完成 | 工单已完成处理 |
| 已退单 | 工单被退回，无法处理 |

### 测试场景

| 场景 | 工单ID | 说明 |
|------|--------|------|
| 紧急工单 | WO-2026-0001 | urgency='紧急', status='处理中' |
| 一般工单 | WO-2026-0002 | urgency='一般', status='待接单' |
| 已完成工单 | WO-2026-0003 | status='已完成', 有评价 |
| 已退单工单 | WO-2026-0006 | status='已退单', 有退单原因 |
| 超时工单 | WO-2026-0004 | createTime较早, status='待接单' |

---

## 4. 合规通报数据 (complianceNotices)

### 数据结构

| 字段名 | 类型 | 含义 | 取值范围 | 必填 |
|--------|------|------|----------|------|
| id | string | 通报唯一标识 | 格式: CN-YYYY-XXXX | 是 |
| community | string | 所属小区 | 小区名称 | 是 |
| source | string | 来源 | AI端自动检测/业主举报/物业上报/定期检查 | 是 |
| type | string | 类型 | 程序违规/资金异常/合同违约/权限越界/资料缺失 | 是 |
| level | string | 风险等级 | 高/中/低 | 是 |
| detail | string | 详细描述 | 10-500字符 | 是 |
| evidence | string | 证据/依据 | 0-500字符 | 否 |
| related | string | 关联信息 | 工单ID/合同ID等 | 否 |
| status | string | 状态 | 待研判/已研判/已归档 | 是 |
| receivedAt | string | 接收时间 | YYYY-MM-DD HH:mm:ss | 是 |
| complianceScore | number | 合规评分 | 0-100 | 是 |
| handler | string | 处理人 | 用户ID | 否 |
| action | string | 处置措施 | 0-200字符 | 否 |
| actionTime | string | 处置时间 | YYYY-MM-DD HH:mm:ss | 否 |

### 风险等级说明

| 等级 | 评分范围 | 颜色标识 | 处理优先级 |
|------|----------|----------|------------|
| 高 | 0-70 | 红色 | 立即处理 |
| 中 | 71-85 | 橙色 | 24小时内 |
| 低 | 86-100 | 黄色 | 7天内 |

### 状态流转

```
待研判 → 已研判 → 已归档
```

---

## 5. 临时业主大会建议 (tempMeetingSuggestions)

### 数据结构

| 字段名 | 类型 | 含义 | 取值范围 | 必填 |
|--------|------|------|----------|------|
| id | string | 建议唯一标识 | 格式: TMS-YYYY-XXXX | 是 |
| community | string | 所属小区 | 小区名称 | 是 |
| meetingTitle | string | 会议标题 | 5-50字符 | 是 |
| topic | string | 表决议题 | 5-100字符 | 是 |
| voteRate | string | 投票参与率 | 百分比格式: XX.X% | 是 |
| participantCount | number | 参与人数 | 正整数 | 是 |
| totalOwnerCount | number | 业主总数 | 正整数 | 是 |
| meetingSummary | string | 会议摘要 | 10-500字符 | 是 |
| receivedAt | string | 接收时间 | YYYY-MM-DD HH:mm:ss | 是 |
| status | string | 状态 | 待研判/已研判 | 是 |
| complianceResult | string | 研判结论 | 建议召开/继续协商/暂不具备召开条件/null | 否 |
| complianceTime | string | 研判时间 | YYYY-MM-DD HH:mm:ss | 否 |
| complianceOpinion | string | 研判意见 | 0-500字符 | 否 |

### 触发条件

当业主端议事厅表决投票参与人数 ≥ 业主总人数的 20% 时，系统自动推送临时业主大会建议。

### 测试场景

| 场景 | 建议ID | voteRate | 说明 |
|------|--------|----------|------|
| 正常触发 | TMS-2026-0001 | 25.5% | 参与率>20%, 待研判 |
| 已研判通过 | TMS-2026-0002 | 22.3% | 参与率>20%, 已研判 |
| 接近阈值 | TMS-2026-0003 | 19.8% | 参与率<20%, 不触发 |

---

## 6. 物业评分数据 (propertyScores)

### 数据结构

```javascript
{
  "小区名称": {
    "overall": number,        // 综合评分 (0-100)
    "accept": {               // 接单时限评分
      "score": number,        // 得分 (0-100)
      "contract": string,     // 合同约定
      "actual": string,       // 实际情况
      "status": string        // 状态: 达标/预警/超时
    },
    "repair": {...},          // 维修响应评分
    "report": {...},          // 上报回访评分
    "cleanliness": {...},     // 保洁评分
    "maintenance": {...},     // 维保评分
    "lastUpdate": string      // 最后更新时间
  }
}
```

### 评分节点说明

| 节点 | 说明 | 合同约定示例 |
|------|------|--------------|
| accept | 接单时限 | 30分钟内 |
| repair | 维修响应 | 24小时内 |
| report | 上报/回访 | 48小时内 |
| cleanliness | 保洁频次 | 每日1次 |
| maintenance | 设备维保 | 每月1次 |

### 状态说明

| 状态 | 说明 |
|------|------|
| 达标 | 实际情况符合合同约定 |
| 预警 | 接近违约，需要关注 |
| 超时 | 已超过合同约定时限 |
| 待执行 | 尚未到执行时间 |

---

## 7. 治理态势统计 (governanceStats)

### 数据结构

```javascript
{
  "last7Days": {
    "dates": array,           // 日期数组
    "tickets": array,         // 每日工单数
    "complaints": array,      // 每日投诉数
    "completionRates": array  // 每日完成率
  },
  "last30Days": {
    "totalTickets": number,       // 总工单数
    "completedTickets": number,   // 已完成工单数
    "pendingTickets": number,     // 待处理工单数
    "avgCompletionTime": string,  // 平均完成时间
    "satisfactionRate": string    // 满意度
  },
  "riskAlerts": [
    {
      "level": string,    // 风险等级
      "count": number,    // 数量
      "types": array      // 风险类型
    }
  ]
}
```

---

## 8. 政策推送记录 (policyPushRecords)

### 数据结构

| 字段名 | 类型 | 含义 | 取值范围 | 必填 |
|--------|------|------|----------|------|
| id | string | 记录唯一标识 | 格式: PPR-YYYY-XXX | 是 |
| name | string | 政策名称 | 5-100字符 | 是 |
| time | string | 推送时间 | YYYY-MM-DD HH:mm:ss | 是 |
| target | string | 推送目标 | 全体业主/业委会/物业/特定群体 | 是 |
| feedbackRate | string | 反馈率 | 百分比格式: XX% | 是 |
| feedbackCount | number | 反馈数量 | 非负整数 | 是 |
| status | string | 状态 | 已推送/待推送 | 是 |

---

## 9. 合同履约数据 (contractExecutions)

### 数据结构

| 字段名 | 类型 | 含义 | 取值范围 | 必填 |
|--------|------|------|----------|------|
| id | string | 履约记录ID | 格式: CE-XXX | 是 |
| community | string | 所属小区 | 小区名称 | 是 |
| propertyCompany | string | 物业公司名称 | 2-50字符 | 是 |
| contractStart | string | 合同开始日期 | YYYY-MM-DD | 是 |
| contractEnd | string | 合同结束日期 | YYYY-MM-DD | 是 |
| progress | number | 履约进度 | 0-100 | 是 |
| nodes | array | 履约节点数组 | 见节点结构 | 是 |
| lastUpdate | string | 最后更新时间 | YYYY-MM-DD HH:mm:ss | 是 |

### 履约节点结构

| 字段名 | 类型 | 含义 |
|--------|------|------|
| name | string | 节点名称 |
| contract | string | 合同约定 |
| actual | string | 实际情况 |
| status | string | 状态 |
| score | number | 得分 |

---

## 10. 区块链存证数据 (blockchainRecords)

### 数据结构

| 字段名 | 类型 | 含义 | 取值范围 |
|--------|------|------|----------|
| hash | string | 存证哈希值 | 0x开头的十六进制字符串 |
| time | string | 存证时间 | YYYY-MM-DD HH:mm:ss |
| type | string | 存证类型 | 会议纪要/投票结果/合同文件 |
| community | string | 所属小区 | 小区名称 |
| blockHeight | number | 区块高度 | 正整数 |
| txId | string | 交易ID | tx_XXX |

---

## 11. 预警规则配置 (warningRules)

### 数据结构

| 字段名 | 类型 | 含义 | 取值范围 |
|--------|------|------|----------|
| id | number | 规则ID | 正整数 |
| name | string | 规则名称 | 5-30字符 |
| type | string | 预警类型 | 工单/投诉/合规/物业/舆情 |
| condition | string | 触发条件 | 描述性文本 |
| threshold | string | 阈值 | 具体数值或描述 |
| level | string | 预警级别 | 高/中/低 |
| enabled | boolean | 是否启用 | true/false |

---

## 12. 边界场景测试数据 (edgeCaseData)

### 12.1 空数据场景

用于测试数据为空时的界面显示和功能处理。

```javascript
{
  emptyCommunity: { ... },      // 空小区
  emptyTickets: [],             // 空工单列表
  emptyNotices: [],             // 空通报列表
  emptySuggestions: []          // 空建议列表
}
```

### 12.2 大量数据场景

用于测试性能和分页功能。

```javascript
{
  largeCommunity: { ... },      // 大型小区(10000户)
  largeTickets: [ ... ],        // 1000条工单
  largeNotices: [ ... ]         // 100条通报
}
```

### 12.3 异常数据场景

用于测试异常处理和容错能力。

```javascript
{
  ticketWithInvalidUrgency: { ... },    // 无效紧急度
  noticeWithMissingFields: { ... },     // 缺失必填字段
  suggestionWithExpiredToken: { ... }   // 过期token
}
```

---

## 使用方法

### 1. 加载测试数据

在浏览器控制台执行:
```javascript
loadTestData()
```

### 2. 清除测试数据

```javascript
clearTestData()
```

### 3. 导出测试数据

```javascript
exportTestData()
```

### 4. 打印数据摘要

```javascript
printTestDataSummary()
```

### 5. URL参数自动加载

在页面URL中添加 `?loadTestData=true` 参数，页面加载时自动加载测试数据。

---

## 数据关联图

```
communities (小区)
    ├── users (用户) - communityId
    ├── tickets (工单) - room
    ├── complianceNotices (通报) - community
    ├── tempMeetingSuggestions (建议) - community
    ├── propertyScores (评分) - 小区名称
    └── contractExecutions (履约) - community

users (用户)
    ├── complianceNotices - handler
    └── archiveLogs - person

tickets (工单)
    └── complianceNotices - related

tempMeetingSuggestions (建议)
    └── complianceNotices - related
```

---

## 更新日志

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.0.0 | 2026-03-18 | 初始版本，包含完整测试数据集 |
