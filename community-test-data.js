/**
 * 社区端虚拟测试数据生成器
 * 用于功能测试、界面测试和性能测试
 * 
 * 数据结构与生产环境保持一致
 * 包含正常场景和边界场景的测试用例数据
 * 
 * 使用方法：
 * 1. 在浏览器控制台执行: loadTestData()
 * 2. 或在页面加载完成后自动执行
 */

(function() {
  'use strict';

  // ========== 测试数据配置 ==========
  var TEST_DATA_CONFIG = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    description: '社区端虚拟测试数据集',
    dataScale: 'full' // minimal | normal | full
  };

  // ========== 1. 社区/小区基础数据 ==========
  var communities = [
    {
      id: 'community_001',
      name: '阳光小区',
      address: '北京市朝阳区阳光路88号',
      totalHouseholds: 520,
      totalArea: 68000,
      buildYear: 2015,
      propertyCompany: '阳光物业管理有限公司',
      committeeId: 'committee_001',
      status: 'active'
    },
    {
      id: 'community_002',
      name: '翠湖小区',
      address: '上海市浦东新区翠湖路199号',
      totalHouseholds: 380,
      totalArea: 45000,
      buildYear: 2018,
      propertyCompany: '翠湖物业服务公司',
      committeeId: 'committee_002',
      status: 'active'
    },
    {
      id: 'community_003',
      name: '锦绣花园',
      address: '广州市天河区锦绣大道100号',
      totalHouseholds: 680,
      totalArea: 85000,
      buildYear: 2012,
      propertyCompany: '锦绣物业管理有限公司',
      committeeId: 'committee_003',
      status: 'active'
    },
    {
      id: 'community_004',
      name: '和谐家园',
      address: '深圳市南山区和谐路66号',
      totalHouseholds: 420,
      totalArea: 52000,
      buildYear: 2020,
      propertyCompany: '和谐物业服务公司',
      committeeId: 'committee_004',
      status: 'active'
    },
    {
      id: 'community_005',
      name: '绿城小区',
      address: '杭州市西湖区绿城街188号',
      totalHouseholds: 560,
      totalArea: 72000,
      buildYear: 2016,
      propertyCompany: '绿城物业管理有限公司',
      committeeId: 'committee_005',
      status: 'inactive'
    }
  ];

  // ========== 2. 用户角色数据 ==========
  var users = {
    // 社区管理员
    communityAdmins: [
      {
        id: 'user_admin_001',
        name: '张伟',
        role: 'community_admin',
        communityId: 'all',
        phone: '13800138001',
        email: 'zhangwei@community.gov',
        permissions: ['view', 'edit', 'delete', 'export', 'manage', 'audit', 'config'],
        createTime: '2024-01-15 08:30:00',
        lastLogin: '2026-03-18 09:15:00',
        status: 'active'
      },
      {
        id: 'user_admin_002',
        name: '李娜',
        role: 'community_admin',
        communityId: 'all',
        phone: '13800138002',
        email: 'lina@community.gov',
        permissions: ['view', 'edit', 'export', 'audit'],
        createTime: '2024-03-20 10:00:00',
        lastLogin: '2026-03-17 16:30:00',
        status: 'active'
      }
    ],
    // 社区治理专员
    communitySpecialists: [
      {
        id: 'user_specialist_001',
        name: '王强',
        role: 'community_specialist',
        communityId: 'community_001',
        phone: '13800138101',
        email: 'wangqiang@community.gov',
        permissions: ['view', 'edit', 'export', 'audit'],
        createTime: '2024-06-10 09:00:00',
        lastLogin: '2026-03-18 08:45:00',
        status: 'active'
      },
      {
        id: 'user_specialist_002',
        name: '刘芳',
        role: 'community_specialist',
        communityId: 'community_002',
        phone: '13800138102',
        email: 'liufang@community.gov',
        permissions: ['view', 'edit', 'export'],
        createTime: '2024-08-15 14:00:00',
        lastLogin: '2026-03-16 11:20:00',
        status: 'active'
      }
    ],
    // 社区协管员
    communityAssistants: [
      {
        id: 'user_assistant_001',
        name: '陈明',
        role: 'community_assistant',
        communityId: 'community_001',
        phone: '13800138201',
        email: 'chenming@community.gov',
        permissions: ['view', 'edit'],
        createTime: '2025-01-05 09:30:00',
        lastLogin: '2026-03-18 10:00:00',
        status: 'active'
      },
      {
        id: 'user_assistant_002',
        name: '赵敏',
        role: 'community_assistant',
        communityId: 'community_003',
        phone: '13800138202',
        email: 'zhaomin@community.gov',
        permissions: ['view'],
        createTime: '2025-03-10 08:00:00',
        lastLogin: '2026-03-15 14:30:00',
        status: 'inactive'
      }
    ]
  };

  // ========== 3. 工单测试数据 ==========
  var tickets = [
    // 正常工单
    {
      id: 'WO-2026-0001',
      type: '报修',
      subType: '电梯故障',
      room: '阳光小区',
      building: 'A栋',
      unit: '1单元',
      roomNumber: '101',
      description: '电梯按键失灵，无法正常使用',
      urgency: '紧急',
      status: '已完成',
      source: '业主端',
      assignee: '物业维修部',
      createTime: '2026-03-15 09:30:00',
      acceptTime: '2026-03-15 09:35:00',
      completeTime: '2026-03-15 11:20:00',
      evaluateTime: '2026-03-15 14:00:00',
      satisfaction: 5,
      evaluation: '维修及时，服务态度好'
    },
    {
      id: 'WO-2026-0002',
      type: '投诉',
      subType: '物业服务',
      room: '翠湖小区',
      building: 'B栋',
      unit: '2单元',
      roomNumber: '201',
      description: '楼道卫生打扫不干净，垃圾未及时清理',
      urgency: '一般',
      status: '处理中',
      source: '业主端',
      assignee: '物业客服部',
      createTime: '2026-03-16 14:20:00',
      acceptTime: '2026-03-16 14:30:00',
      completeTime: null,
      evaluateTime: null,
      satisfaction: null,
      evaluation: null
    },
    {
      id: 'WO-2026-0003',
      type: '咨询',
      subType: '政策咨询',
      room: '锦绣花园',
      building: 'C栋',
      unit: '3单元',
      roomNumber: '301',
      description: '咨询维修资金使用方法',
      urgency: '低',
      status: '待接单',
      source: '业主端',
      assignee: null,
      createTime: '2026-03-17 10:00:00',
      acceptTime: null,
      completeTime: null,
      evaluateTime: null,
      satisfaction: null,
      evaluation: null
    },
    // 边界场景 - 紧急工单
    {
      id: 'WO-2026-0004',
      type: '报修',
      subType: '水管爆裂',
      room: '和谐家园',
      building: 'D栋',
      unit: '1单元',
      roomNumber: '102',
      description: '户内水管爆裂，需要紧急抢修',
      urgency: '紧急',
      status: '已完成',
      source: '业主端',
      assignee: '物业维修部',
      createTime: '2026-03-17 08:00:00',
      acceptTime: '2026-03-17 08:05:00',
      completeTime: '2026-03-17 09:30:00',
      evaluateTime: '2026-03-17 10:00:00',
      satisfaction: 4,
      evaluation: '响应很快'
    },
    // 边界场景 - 超时工单
    {
      id: 'WO-2026-0005',
      type: '报修',
      subType: '门禁故障',
      room: '阳光小区',
      building: 'E栋',
      unit: '2单元',
      roomNumber: '202',
      description: '门禁系统无法刷卡进入',
      urgency: '一般',
      status: '处理中',
      source: '业主端',
      assignee: '物业维修部',
      createTime: '2026-03-10 15:00:00',
      acceptTime: '2026-03-11 09:00:00',
      completeTime: null,
      evaluateTime: null,
      satisfaction: null,
      evaluation: null,
      isOverdue: true,
      overdueDays: 5
    },
    // 边界场景 - 退单工单
    {
      id: 'WO-2026-0006',
      type: '投诉',
      subType: '停车管理',
      room: '翠湖小区',
      building: 'F栋',
      unit: '1单元',
      roomNumber: '101',
      description: '外来车辆乱停放，占用业主车位',
      urgency: '一般',
      status: '已退单',
      source: '业主端',
      assignee: null,
      createTime: '2026-03-14 16:00:00',
      acceptTime: '2026-03-14 16:30:00',
      completeTime: null,
      rejectReason: '不属于物业服务范围，建议联系居委会',
      evaluateTime: null,
      satisfaction: null,
      evaluation: null
    },
    // 更多正常工单
    {
      id: 'WO-2026-0007',
      type: '报修',
      subType: '水电维修',
      room: '阳光小区',
      building: 'A栋',
      unit: '3单元',
      roomNumber: '301',
      description: '厨房水龙头漏水',
      urgency: '一般',
      status: '已完成',
      source: '业主端',
      assignee: '物业维修部',
      createTime: '2026-03-16 10:00:00',
      acceptTime: '2026-03-16 10:15:00',
      completeTime: '2026-03-16 12:00:00',
      evaluateTime: '2026-03-16 15:00:00',
      satisfaction: 5,
      evaluation: '维修师傅很专业'
    },
    {
      id: 'WO-2026-0008',
      type: '建议',
      subType: '设施改善',
      room: '锦绣花园',
      building: 'B栋',
      unit: '1单元',
      roomNumber: '101',
      description: '建议增加小区健身器材',
      urgency: '低',
      status: '待接单',
      source: '业主端',
      assignee: null,
      createTime: '2026-03-17 11:00:00',
      acceptTime: null,
      completeTime: null,
      evaluateTime: null,
      satisfaction: null,
      evaluation: null
    },
    {
      id: 'WO-2026-0009',
      type: '投诉',
      subType: '噪音扰民',
      room: '和谐家园',
      building: 'C栋',
      unit: '2单元',
      roomNumber: '202',
      description: '楼上住户深夜装修，噪音扰民',
      urgency: '紧急',
      status: '已完成',
      source: '业主端',
      assignee: '物业客服部',
      createTime: '2026-03-15 22:00:00',
      acceptTime: '2026-03-15 22:10:00',
      completeTime: '2026-03-15 23:30:00',
      evaluateTime: '2026-03-16 09:00:00',
      satisfaction: 4,
      evaluation: '处理及时'
    },
    {
      id: 'WO-2026-0010',
      type: '报修',
      subType: '电梯故障',
      room: '绿城小区',
      building: 'A栋',
      unit: '1单元',
      roomNumber: '1001',
      description: '电梯运行有异响',
      urgency: '一般',
      status: '待接单',
      source: '业主端',
      assignee: null,
      createTime: '2026-03-18 08:00:00',
      acceptTime: null,
      completeTime: null,
      evaluateTime: null,
      satisfaction: null,
      evaluation: null
    }
  ];

  // ========== 4. 合规通报测试数据 ==========
  var complianceNotices = [
    {
      id: 'CN-2026-0001',
      community: '阳光小区',
      source: 'AI端自动检测',
      type: '程序违规',
      level: '高',
      detail: '未经业主大会表决，擅自决定更换小区公共区域广告点位合作方',
      evidence: '业委会会议纪要显示未对此事进行表决',
      related: '相关工单: WO-2025-0089',
      status: '待研判',
      receivedAt: '2026-03-10 09:00:00',
      complianceScore: 65,
      handler: null,
      action: null,
      actionTime: null
    },
    {
      id: 'CN-2026-0002',
      community: '翠湖小区',
      source: '业主举报',
      type: '资金异常',
      level: '高',
      detail: '小区公共收益收支明细未按规定公示',
      evidence: '业主反映从未见过公共收益公示',
      related: null,
      status: '已研判',
      receivedAt: '2026-03-12 14:30:00',
      complianceScore: 70,
      handler: 'user_specialist_002',
      action: '要求业委会限期整改',
      actionTime: '2026-03-14 10:00:00'
    },
    {
      id: 'CN-2026-0003',
      community: '锦绣花园',
      source: '物业上报',
      type: '合同违约',
      level: '中',
      detail: '某业主长期欠缴物业费，经催缴后仍拒绝缴纳',
      evidence: '欠费清单、催缴记录',
      related: null,
      status: '已归档',
      receivedAt: '2026-03-08 11:00:00',
      complianceScore: 85,
      handler: 'user_admin_001',
      action: '已走法律程序',
      actionTime: '2026-03-10 16:00:00'
    },
    // 边界场景 - 低风险
    {
      id: 'CN-2026-0004',
      community: '和谐家园',
      source: '定期检查',
      type: '资料缺失',
      level: '低',
      detail: '业委会会议纪要存档不完整',
      evidence: '2025年Q3会议纪要缺失',
      related: null,
      status: '待研判',
      receivedAt: '2026-03-16 10:00:00',
      complianceScore: 88,
      handler: null,
      action: null,
      actionTime: null
    },
    // 边界场景 - 待归档
    {
      id: 'CN-2026-0005',
      community: '阳光小区',
      source: '定期检查',
      type: '权限越界',
      level: '中',
      detail: '单个业委会委员未经授权代表全体业主签字',
      evidence: '物业服务合同补充协议签字',
      related: '相关合同: HC-2025-001',
      status: '已研判',
      receivedAt: '2026-03-11 15:00:00',
      complianceScore: 75,
      handler: 'user_specialist_001',
      action: '已约谈业委会主任',
      actionTime: '2026-03-13 09:00:00'
    },
    {
      id: 'CN-2026-0006',
      community: '翠湖小区',
      source: 'AI端自动检测',
      type: '程序违规',
      level: '中',
      detail: '业主大会表决结果未按要求公示期公示',
      evidence: '投票结果公示期不足7日',
      related: '投票ID: VT-2026-003',
      status: '待研判',
      receivedAt: '2026-03-17 16:00:00',
      complianceScore: 78,
      handler: null,
      action: null,
      actionTime: null
    }
  ];

  // ========== 5. 临时业主大会建议 ==========
  var tempMeetingSuggestions = [
    {
      id: 'TMS-2026-0001',
      community: '阳光小区',
      meetingTitle: '关于电梯更新的业主议事会',
      topic: '是否启动小区电梯更新改造工程',
      voteRate: '25.5%',
      participantCount: 133,
      totalOwnerCount: 520,
      meetingSummary: '会议讨论了小区电梯使用年限较长，存在安全隐患的问题，业主代表建议启动电梯更新改造工程',
      receivedAt: '2026-03-15 18:00:00',
      status: '待研判',
      complianceResult: null,
      complianceTime: null,
      complianceOpinion: null
    },
    {
      id: 'TMS-2026-0002',
      community: '翠湖小区',
      meetingTitle: '关于公共收益分配的业主讨论',
      topic: '小区公共收益分配方案',
      voteRate: '22.3%',
      participantCount: 85,
      totalOwnerCount: 380,
      meetingSummary: '会议讨论了小区公共收益的使用和分配问题',
      receivedAt: '2026-03-12 14:00:00',
      status: '已研判',
      complianceResult: '建议召开临时业主大会',
      complianceTime: '2026-03-14 10:00:00',
      complianceOpinion: '符合召开临时业主大会的条件，建议按程序推进'
    },
    // 边界场景 - 接近触发阈值
    {
      id: 'TMS-2026-0003',
      community: '锦绣花园',
      meetingTitle: '关于物业服务质量的讨论',
      topic: '是否续聘当前物业公司',
      voteRate: '19.8%',
      participantCount: 135,
      totalOwnerCount: 680,
      meetingSummary: '会议讨论了当前物业服务质量问题，但投票参与率未达到20%',
      receivedAt: '2026-03-10 16:00:00',
      status: '已研判',
      complianceResult: '暂不具备召开条件',
      complianceTime: '2026-03-11 09:00:00',
      complianceOpinion: '投票参与率未达到20%，不符合触发条件'
    }
  ];

  // ========== 6. 物业评分数据 ==========
  var propertyScores = {
    '阳光小区': {
      overall: 85,
      accept: { score: 88, contract: '30分钟内', actual: '平均25分钟', status: '达标' },
      repair: { score: 82, contract: '24小时内', actual: '平均18小时', status: '达标' },
      report: { score: 80, contract: '48小时内', actual: '平均36小时', status: '达标' },
      cleanliness: { score: 90, contract: '每日1次', actual: '每日1次', status: '达标' },
      maintenance: { score: 85, contract: '每月1次', actual: '本月已完成', status: '达标' },
      lastUpdate: '2026-03-18 00:00:00'
    },
    '翠湖小区': {
      overall: 78,
      accept: { score: 75, contract: '30分钟内', actual: '平均28分钟', status: '达标' },
      repair: { score: 72, contract: '24小时内', actual: '平均22小时', status: '达标' },
      report: { score: 80, contract: '48小时内', actual: '平均40小时', status: '预警' },
      cleanliness: { score: 82, contract: '每日1次', actual: '每日1次', status: '达标' },
      maintenance: { score: 78, contract: '每月1次', actual: '上月已完成', status: '达标' },
      lastUpdate: '2026-03-18 00:00:00'
    },
    '锦绣花园': {
      overall: 92,
      accept: { score: 95, contract: '30分钟内', actual: '平均20分钟', status: '达标' },
      repair: { score: 90, contract: '24小时内', actual: '平均15小时', status: '达标' },
      report: { score: 88, contract: '48小时内', actual: '平均30小时', status: '达标' },
      cleanliness: { score: 92, contract: '每日1次', actual: '每日1次+', status: '达标' },
      maintenance: { score: 92, contract: '每月1次', actual: '本月已完成', status: '达标' },
      lastUpdate: '2026-03-18 00:00:00'
    },
    '和谐家园': {
      overall: 80,
      accept: { score: 82, contract: '30分钟内', actual: '平均26分钟', status: '达标' },
      repair: { score: 78, contract: '24小时内', actual: '平均20小时', status: '达标' },
      report: { score: 75, contract: '48小时内', actual: '平均42小时', status: '预警' },
      cleanliness: { score: 85, contract: '每日1次', actual: '每日1次', status: '达标' },
      maintenance: { score: 80, contract: '每月1次', actual: '本月计划中', status: '待执行' },
      lastUpdate: '2026-03-18 00:00:00'
    }
  };

  // ========== 7. 治理态势统计 ==========
  var governanceStats = {
    last7Days: {
      dates: ['03/12', '03/13', '03/14', '03/15', '03/16', '03/17', '03/18'],
      tickets: [12, 15, 8, 18, 14, 22, 10],
      complaints: [3, 5, 2, 6, 4, 8, 3],
      completionRates: [85, 88, 82, 90, 87, 92, 95]
    },
    last30Days: {
      totalTickets: 320,
      completedTickets: 285,
      pendingTickets: 35,
      avgCompletionTime: '18.5小时',
      satisfactionRate: '92%'
    },
    riskAlerts: [
      { level: '高', count: 2, types: ['程序违规', '资金异常'] },
      { level: '中', count: 3, types: ['权限越界', '合同违约'] },
      { level: '低', count: 5, types: ['资料缺失', '公示不及时'] }
    ]
  };

  // ========== 8. 政策推送记录 ==========
  var policyPushRecords = [
    {
      id: 'PPR-2026-001',
      name: '《民法典》物权编解读',
      time: '2026-03-10 09:00:00',
      target: '全体业主',
      feedbackRate: '78%',
      feedbackCount: 156,
      status: '已推送'
    },
    {
      id: 'PPR-2026-002',
      name: '《物业管理条例》2026版',
      time: '2026-03-12 14:00:00',
      target: '业委会',
      feedbackRate: '100%',
      feedbackCount: 9,
      status: '已推送'
    },
    {
      id: 'PPR-2026-003',
      name: '维修资金申请流程指南',
      time: '2026-03-15 10:00:00',
      target: '全体业主',
      feedbackRate: '65%',
      feedbackCount: 130,
      status: '已推送'
    }
  ];

  // ========== 9. 合同履约数据 ==========
  var contractExecutions = [
    {
      id: 'CE-001',
      community: '阳光小区',
      propertyCompany: '阳光物业管理有限公司',
      contractStart: '2023-01-01',
      contractEnd: '2027-12-31',
      progress: 65,
      nodes: [
        { name: '接单时限', contract: '30分钟内', actual: '平均25分钟', status: '达标', score: 88 },
        { name: '维修响应', contract: '24小时内', actual: '平均18小时', status: '达标', score: 82 },
        { name: '上报/回访', contract: '48小时内', actual: '平均36小时', status: '达标', score: 80 },
        { name: '保洁频次', contract: '每日1次', actual: '每日1次', status: '达标', score: 90 },
        { name: '设备维保', contract: '每月1次', actual: '本月已完成', status: '达标', score: 85 }
      ],
      lastUpdate: '2026-03-18 00:00:00'
    },
    {
      id: 'CE-002',
      community: '翠湖小区',
      propertyCompany: '翠湖物业服务公司',
      contractStart: '2024-01-01',
      contractEnd: '2026-12-31',
      progress: 58,
      nodes: [
        { name: '接单时限', contract: '30分钟内', actual: '平均28分钟', status: '达标', score: 75 },
        { name: '维修响应', contract: '24小时内', actual: '平均22小时', status: '达标', score: 72 },
        { name: '上报/回访', contract: '48小时内', actual: '平均40小时', status: '预警', score: 65 },
        { name: '保洁频次', contract: '每日1次', actual: '每日1次', status: '达标', score: 82 },
        { name: '设备维保', contract: '每月1次', actual: '上月已完成', status: '达标', score: 78 }
      ],
      lastUpdate: '2026-03-18 00:00:00'
    }
  ];

  // ========== 10. 社区动态/舆情数据 ==========
  var sentimentData = [
    { date: '03/12', positive: 45, negative: 5 },
    { date: '03/13', positive: 38, negative: 8 },
    { date: '03/14', positive: 52, negative: 3 },
    { date: '03/15', positive: 40, negative: 10 },
    { date: '03/16', positive: 55, negative: 4 },
    { date: '03/17', positive: 35, negative: 12 },
    { date: '03/18', positive: 48, negative: 6 }
  ];

  // ========== 11. 审计日志数据 ==========
  var archiveLogs = [
    { time: '2026-03-18 09:30:00', category: '合规审计', matter: '阳光小区物业合同履约审查', person: '社区管理员', status: '已完成' },
    { time: '2026-03-17 14:20:00', category: '工单监督', matter: '翠湖小区电梯维修工单跟踪', person: '社区治理专员', status: '处理中' },
    { time: '2026-03-16 11:00:00', category: '政策下达', matter: '推送政策：物业管理条例解读 → 全体业主', person: '社区管理员', status: '已推送' },
    { time: '2026-03-15 16:45:00', category: '临时业主大会建议', matter: '锦绣小区临时业主大会建议研判', person: '社区治理专员', status: '已研判' },
    { time: '2026-03-14 10:30:00', category: '风险预警', matter: '阳光小区合规异常：物业费公示不及时', person: '社区管理员', status: '已化解' }
  ];

  // ========== 12. 法规库数据 ==========
  var lawItems = [
    { name: '《中华人民共和国民法典》', type: '法律', keywords: '物权,业主,物业,维修资金', summary: '民法典物权编规定了业主的建筑物区分所有权，包括专有部分所有权、共有部分共有权以及共同管理权。' },
    { name: '《物业管理条例》', type: '条例', keywords: '物业,业主大会,业委会,服务合同', summary: '规范物业管理活动，维护业主和物业服务企业的合法权益。' },
    { name: '《业主大会议事规则》', type: '议事规则', keywords: '业主大会,表决,投票,临时会议', summary: '业主大会的议事方式、表决程序、业主投票权确定办法等事项的规则。' },
    { name: '《管理规约》', type: '管理规约', keywords: '物业使用,禁止行为,违约责任', summary: '有关物业的使用、维护、管理，业主的共同利益等事项的约定。' },
    { name: '《物业服务合同》', type: '合同', keywords: '服务内容,收费标准,违约责任', summary: '物业服务企业与业主委员会签订的，约定物业服务内容、服务标准等事项的协议。' }
  ];

  // ========== 13. 流程引导数据 ==========
  var flowGuides = {
    elevator: {
      title: '如何启动电梯更新？',
      steps: [
        '业主或业委会提出更新动议',
        '编制更新方案并公示（不少于7日）',
        '业主大会表决（双三分之二通过）',
        '选聘电梯施工单位、签订合同',
        '申请维修资金或筹集费用',
        '施工、验收、备案'
      ]
    },
    tempMeeting: {
      title: '如何召开临时业主大会？',
      steps: [
        '经专有部分占建筑物总面积20%以上且占总人数20%以上的业主提议',
        '业委会应在收到提议后按规定组织召开',
        '提前15日通知全体业主，公示议题',
        '会议形式可采取集中或书面征求意见',
        '表决规则按议事规则（双过半或双三分之二）'
      ]
    },
    repairFund: {
      title: '维修资金申请流程',
      steps: [
        '物业服务企业或业委会制定使用方案',
        '使用方案公示（不少于7日）',
        '业主大会或业委会表决通过',
        '向主管部门申请备案',
        '专户银行划款',
        '施工与验收、资金结算'
      ]
    },
    property: {
      title: '物业选聘/续聘流程',
      steps: [
        '合同到期前（如90日）启动续聘或选聘程序',
        '续聘：协商续约条款，业主大会表决（双过半）',
        '选聘：制定选聘方案，业主大会表决，公开招标或协议选聘',
        '签订物业服务合同并备案',
        '新旧物业交接'
      ]
    }
  };

  // ========== 14. 区块链存证数据 ==========
  var blockchainRecords = {
    '0x1a2b3c4d5e6f7890': {
      hash: '0x1a2b3c4d5e6f7890',
      time: '2026-03-01 10:30:45',
      type: '会议纪要',
      community: '阳光小区',
      blockHeight: 1234567,
      txId: 'tx_001'
    },
    '0x7g8h9i0j1k2l3456': {
      hash: '0x7g8h9i0j1k2l3456',
      time: '2026-02-28 15:20:30',
      type: '投票结果',
      community: '翠湖小区',
      blockHeight: 1234566,
      txId: 'tx_002'
    },
    '0x3m4n5o6p7q8r9012': {
      hash: '0x3m4n5o6p7q8r9012',
      time: '2026-02-27 09:15:20',
      type: '合同文件',
      community: '锦绣花园',
      blockHeight: 1234565,
      txId: 'tx_003'
    }
  };

  // ========== 15. 预警规则配置 ==========
  var warningRules = [
    { id: 1, name: '工单超时预警', type: '工单', condition: '超过约定时限', threshold: '24小时', level: '高', enabled: true },
    { id: 2, name: '投诉集中预警', type: '投诉', condition: '同一小区周投诉量', threshold: '≥5件', level: '中', enabled: true },
    { id: 3, name: '合规评分预警', type: '合规', condition: '合规评分低于', threshold: '60分', level: '高', enabled: true },
    { id: 4, name: '物业评分预警', type: '物业', condition: '物业评分低于', threshold: '70分', level: '中', enabled: false },
    { id: 5, name: '舆情负面预警', type: '舆情', condition: '负面舆情占比', threshold: '≥20%', level: '高', enabled: true }
  ];

  // ========== 16. 边界场景测试数据 ==========
  var edgeCaseData = {
    // 空数据场景
    emptyCommunity: {
      id: 'community_empty',
      name: '空测试小区',
      tickets: [],
      notices: [],
      suggestions: []
    },
    // 大量数据场景
    largeCommunity: {
      id: 'community_large',
      name: '大数据测试小区',
      tickets: Array.from({ length: 1000 }, (_, i) => ({
        id: `WO-TEST-${i + 1}`,
        type: ['报修', '投诉', '咨询', '建议'][i % 4],
        status: ['待接单', '处理中', '已完成', '已退单'][i % 4],
        createTime: `2026-03-${String(Math.floor(i / 30) + 1).padStart(2, '0')} ${String(i % 24).padStart(2, '0')}:00:00`
      })),
      notices: Array.from({ length: 100 }, (_, i) => ({
        id: `CN-TEST-${i + 1}`,
        level: ['高', '中', '低'][i % 3],
        status: ['待研判', '已研判', '已归档'][i % 3]
      }))
    },
    // 异常数据场景
    abnormalData: {
      ticketWithInvalidUrgency: { id: 'WO-AB-001', urgency: '未知紧急度', status: '处理中' },
      noticeWithMissingFields: { id: 'CN-AB-001', community: '测试小区', level: '高' },
      userWithExpiredToken: { id: 'user_expired', token: 'expired_token', expireTime: '2025-01-01' }
    }
  };

  // ========== 数据加载函数 ==========
  window.loadTestData = function() {
    console.log('开始加载测试数据...');
    
    try {
      // 保存到 localStorage
      localStorage.setItem('sgzf_communities', JSON.stringify(communities));
      localStorage.setItem('sgzf_users', JSON.stringify(users));
      localStorage.setItem('sgzf_tickets', JSON.stringify(tickets));
      localStorage.setItem('sgzf_compliance_notices', JSON.stringify(complianceNotices));
      localStorage.setItem('sgzf_temp_meeting_suggestions', JSON.stringify(tempMeetingSuggestions));
      localStorage.setItem('sgzf_property_scores', JSON.stringify(propertyScores));
      localStorage.setItem('sgzf_governance_stats', JSON.stringify(governanceStats));
      localStorage.setItem('sgzf_policy_push_records', JSON.stringify(policyPushRecords));
      localStorage.setItem('sgzf_contract_executions', JSON.stringify(contractExecutions));
      localStorage.setItem('sgzf_sentiment_data', JSON.stringify(sentimentData));
      localStorage.setItem('sgzf_archive_logs', JSON.stringify(archiveLogs));
      localStorage.setItem('sgzf_law_items', JSON.stringify(lawItems));
      localStorage.setItem('sgzf_flow_guides', JSON.stringify(flowGuides));
      localStorage.setItem('sgzf_blockchain_records', JSON.stringify(blockchainRecords));
      localStorage.setItem('sgzf_warning_rules', JSON.stringify(warningRules));
      localStorage.setItem('sgzf_edge_case_data', JSON.stringify(edgeCaseData));
      
      // 保存测试数据配置
      localStorage.setItem('sgzf_test_data_config', JSON.stringify(TEST_DATA_CONFIG));
      
      console.log('测试数据加载完成！');
      console.log('- 小区数据:', communities.length, '条');
      console.log('- 工单数据:', tickets.length, '条');
      console.log('- 合规通报:', complianceNotices.length, '条');
      console.log('- 临时业主大会建议:', tempMeetingSuggestions.length, '条');
      console.log('- 物业评分:', Object.keys(propertyScores).length, '条');
      console.log('- 治理态势统计: 已加载');
      console.log('- 政策推送记录:', policyPushRecords.length, '条');
      console.log('- 合同履约数据:', contractExecutions.length, '条');
      console.log('- 舆情数据:', sentimentData.length, '条');
      console.log('- 审计日志:', archiveLogs.length, '条');
      console.log('- 法规库:', lawItems.length, '条');
      console.log('- 流程引导:', Object.keys(flowGuides).length, '条');
      console.log('- 区块链存证:', Object.keys(blockchainRecords).length, '条');
      console.log('- 预警规则:', warningRules.length, '条');
      console.log('- 边界场景数据: 已加载');
      
      return {
        success: true,
        message: '测试数据加载成功',
        stats: {
          communities: communities.length,
          tickets: tickets.length,
          notices: complianceNotices.length,
          suggestions: tempMeetingSuggestions.length,
          propertyScores: Object.keys(propertyScores).length,
          policies: policyPushRecords.length,
          contracts: contractExecutions.length,
          sentiment: sentimentData.length,
          logs: archiveLogs.length,
          laws: lawItems.length,
          flows: Object.keys(flowGuides).length,
          blockchain: Object.keys(blockchainRecords).length,
          rules: warningRules.length
        }
      };
    } catch (e) {
      console.error('测试数据加载失败:', e);
      return { success: false, message: e.message };
    }
  };

  // ========== 数据清除函数 ==========
  window.clearTestData = function() {
    console.log('开始清除测试数据...');
    
    var keysToRemove = [
      'sgzf_communities', 'sgzf_users', 'sgzf_tickets', 'sgzf_compliance_notices',
      'sgzf_temp_meeting_suggestions', 'sgzf_property_scores', 'sgzf_governance_stats',
      'sgzf_policy_push_records', 'sgzf_contract_executions', 'sgzf_sentiment_data',
      'sgzf_archive_logs', 'sgzf_law_items', 'sgzf_flow_guides', 'sgzf_blockchain_records',
      'sgzf_warning_rules', 'sgzf_edge_case_data', 'sgzf_test_data_config'
    ];
    
    keysToRemove.forEach(function(key) {
      localStorage.removeItem(key);
    });
    
    console.log('测试数据已清除');
    return { success: true, message: '测试数据已清除' };
  };

  // ========== 数据导出函数 ==========
  window.exportTestData = function() {
    var data = {
      communities: communities,
      users: users,
      tickets: tickets,
      complianceNotices: complianceNotices,
      tempMeetingSuggestions: tempMeetingSuggestions,
      propertyScores: propertyScores,
      governanceStats: governanceStats,
      policyPushRecords: policyPushRecords,
      contractExecutions: contractExecutions,
      sentimentData: sentimentData,
      archiveLogs: archiveLogs,
      lawItems: lawItems,
      flowGuides: flowGuides,
      blockchainRecords: blockchainRecords,
      warningRules: warningRules,
      edgeCaseData: edgeCaseData
    };
    
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'community_test_data_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
    
    return { success: true, message: '测试数据已导出' };
  };

  // ========== 打印数据摘要 ==========
  window.printTestDataSummary = function() {
    console.log('========================================');
    console.log('  社区端虚拟测试数据摘要');
    console.log('========================================');
    console.log('版本:', TEST_DATA_CONFIG.version);
    console.log('生成时间:', TEST_DATA_CONFIG.generatedAt);
    console.log('----------------------------------------');
    console.log('1. 社区/小区数据:', communities.length, '条');
    console.log('   - 正常状态:', communities.filter(c => c.status === 'active').length, '条');
    console.log('   - 非活跃:', communities.filter(c => c.status !== 'active').length, '条');
    console.log('----------------------------------------');
    console.log('2. 用户数据:');
    console.log('   - 社区管理员:', users.communityAdmins.length, '人');
    console.log('   - 治理专员:', users.communitySpecialists.length, '人');
    console.log('   - 协管员:', users.communityAssistants.length, '人');
    console.log('----------------------------------------');
    console.log('3. 工单数据:', tickets.length, '条');
    console.log('   - 待接单:', tickets.filter(t => t.status === '待接单').length, '条');
    console.log('   - 处理中:', tickets.filter(t => t.status === '处理中').length, '条');
    console.log('   - 已完成:', tickets.filter(t => t.status === '已完成').length, '条');
    console.log('   - 已退单:', tickets.filter(t => t.status === '已退单').length, '条');
    console.log('----------------------------------------');
    console.log('4. 合规通报:', complianceNotices.length, '条');
    console.log('   - 高风险:', complianceNotices.filter(n => n.level === '高').length, '条');
    console.log('   - 中风险:', complianceNotices.filter(n => n.level === '中').length, '条');
    console.log('   - 低风险:', complianceNotices.filter(n => n.level === '低').length, '条');
    console.log('----------------------------------------');
    console.log('5. 临时业主大会建议:', tempMeetingSuggestions.length, '条');
    console.log('   - 待研判:', tempMeetingSuggestions.filter(s => s.status === '待研判').length, '条');
    console.log('   - 已研判:', tempMeetingSuggestions.filter(s => s.status === '已研判').length, '条');
    console.log('----------------------------------------');
    console.log('6. 物业评分:');
    Object.keys(propertyScores).forEach(function(community) {
      console.log('   -', community, ':', propertyScores[community].overall, '分');
    });
    console.log('----------------------------------------');
    console.log('7. 预警规则:', warningRules.length, '条');
    console.log('   - 启用中:', warningRules.filter(r => r.enabled).length, '条');
    console.log('   - 已禁用:', warningRules.filter(r => !r.enabled).length, '条');
    console.log('----------------------------------------');
    console.log('8. 边界场景数据: 已加载');
    console.log('   - 空数据场景');
    console.log('   - 大量数据场景');
    console.log('   - 异常数据场景');
    console.log('========================================');
  };

  // 自动加载测试数据（如果URL中包含test数据参数）
  if (window.location.href.indexOf('loadTestData=true') >= 0) {
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.loadTestData();
        window.printTestDataSummary();
      }, 500);
    });
  }

  console.log('%c 社区端测试数据加载器已就绪 ', 'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px;');
  console.log('使用方法:');
  console.log('  loadTestData() - 加载所有测试数据');
  console.log('  clearTestData() - 清除测试数据');
  console.log('  exportTestData() - 导出测试数据为JSON文件');
  console.log('  printTestDataSummary() - 打印数据摘要');

})();
