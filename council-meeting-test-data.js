/**
 * 议事厅会议测试数据生成器
 * 用于生成覆盖会议全生命周期的虚拟测试数据
 * 
 * 支持状态：
 * - 会前：not_started, starting_soon, cancelled, postponed
 * - 会中：ongoing_5min, ongoing_30min, ending_soon
 * - 会后：ended_just_now, ended_1day, ended_1week, archived
 */
(function (global) {
  'use strict';

  var PREFIX = 'council_test_';
  var TEST_DATA_KEY = 'council_meeting_test_data';
  var TEST_DATA_VERSION = '1.0.0';

  function getStorage() {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  }

  function getKey(k) {
    return PREFIX + k;
  }

  function get(key) {
    var storage = getStorage();
    if (!storage) return null;
    try {
      var raw = storage.getItem(getKey(key));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function set(key, value) {
    var storage = getStorage();
    if (!storage) return;
    try {
      storage.setItem(getKey(key), JSON.stringify(value));
    } catch (e) {}
  }

  function now() {
    return Date.now();
  }

  function formatTime(timestamp) {
    var d = new Date(timestamp);
    var year = d.getFullYear();
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    var hour = String(d.getHours()).padStart(2, '0');
    var minute = String(d.getMinutes()).padStart(2, '0');
    return year + '年' + month + '月' + day + '日 ' + hour + ':' + minute;
  }

  function formatTimeISO(timestamp) {
    return new Date(timestamp).toISOString();
  }

  var PARTICIPANTS_POOL = [
    { id: 'user_001', name: '张业主', room: '1-101', area: 120 },
    { id: 'user_002', name: '李业主', room: '2-202', area: 95 },
    { id: 'user_003', name: '王业主', room: '3-303', area: 110 },
    { id: 'user_004', name: '赵业主', room: '4-401', area: 88 },
    { id: 'user_005', name: '陈业主', room: '5-501', area: 135 },
    { id: 'user_006', name: '孙业主', room: '6-601', area: 102 },
    { id: 'user_007', name: '周业主', room: '7-701', area: 98 },
    { id: 'user_008', name: '吴业主', room: '8-801', area: 145 },
    { id: 'user_009', name: '郑业主', room: '9-901', area: 78 },
    { id: 'user_010', name: '刘业主', room: '10-1001', area: 125 },
    { id: 'user_011', name: '黄业主', room: '11-1101', area: 92 },
    { id: 'user_012', name: '杨业主', room: '12-1201', area: 108 }
  ];

  var HOSTS_POOL = [
    { name: '张业主', room: '1-101' },
    { name: '业委会', room: '' },
    { name: '李业主', room: '2-202' },
    { name: '王业委会主任', room: '3-301' },
    { name: '陈业主', room: '5-501' }
  ];

  var TOPICS_POOL = [
    { title: '小区电梯更新方案讨论会', topic: '电梯更新', focus: '品牌选择与费用分摊方案', category: '设施维修' },
    { title: '地下车库管理改革讨论会', topic: '停车管理', focus: '车位分配与收费标准调整', category: '停车管理' },
    { title: '小区绿化改造方案协商', topic: '绿化改造', focus: '绿化带重新规划与植物更换', category: '环境改善' },
    { title: '物业服务费调整讨论会', topic: '物业费调整', focus: '服务费标准与服务内容对应', category: '物业服务' },
    { title: '小区安防系统升级讨论会', topic: '安防升级', focus: '监控设备更换与门禁系统升级', category: '安全设施' },
    { title: '公共收益使用方案协商', topic: '公共收益', focus: '电梯广告收益分配方案', category: '财务管理' },
    { title: '儿童游乐设施更新讨论', topic: '游乐设施', focus: '滑梯与秋千更换方案', category: '公共设施' },
    { title: '楼道照明系统升级协商', topic: '照明升级', focus: 'LED灯具更换与智能控制系统', category: '设施维修' },
    { title: '小区门禁系统改造协商', topic: '门禁改造', focus: '人脸识别与刷卡双系统', category: '安全设施' },
    { title: '业主大会（临时会议）-物业选聘表决', topic: '物业选聘', focus: '新物业公司投票表决', category: '物业服务' },
    { title: '业主大会（临时会议）-维修资金使用表决', topic: '维修资金', focus: '电梯大修资金申请', category: '财务管理' },
    { title: '小区停车管理改革讨论会', topic: '停车管理', focus: '车位分配与收费标准调整', category: '停车管理' }
  ];

  var AGENDAS_POOL = [
    ['现状分析与问题梳理', '改造方案介绍', '业主意见征集', '投票表决'],
    ['现行问题分析', '新方案介绍', '业主讨论', '投票建议'],
    ['设施现状评估', '更新方案讨论', '安全标准确认'],
    ['改造需求分析', '技术方案介绍', '费用预算', '业主讨论'],
    ['上期工作总结', '新合同条款解读', '费用对比分析', '业主提问与讨论']
  ];

  var MATERIALS_POOL = [
    [{ name: '改造方案.pdf', url: '#' }, { name: '预算明细表.xlsx', url: '#' }],
    [{ name: '设备报价单.pdf', url: '#' }, { name: '技术参数.docx', url: '#' }],
    [{ name: '合同草案.pdf', url: '#' }, { name: '费用对比表.pdf', url: '#' }],
    [{ name: '检测报告.pdf', url: '#' }, { name: '维修预算明细.pdf', url: '#' }],
    [{ name: '方案建议.pdf', url: '#' }]
  ];

  function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function generateParticipants(count) {
    var shuffled = PARTICIPANTS_POOL.slice().sort(function() { return 0.5 - Math.random(); });
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  function generateMeetingBase(id, topicInfo, hostInfo, timestamp, status) {
    var n = now();
    var hour = 3600000;
    var day = 86400000;

    return {
      id: id,
      title: topicInfo.title,
      type: Math.random() > 0.3 ? 'assembly' : 'slow',
      meetingType: topicInfo.title.indexOf('业主大会') !== -1 ? '业主大会（临时会议）' : '议事厅会议',
      status: status,
      startTime: formatTime(timestamp),
      meetingTime: timestamp,
      host: hostInfo.name,
      hostName: hostInfo.name,
      hostRoom: hostInfo.room,
      proposer: hostInfo.name,
      proposerRoom: hostInfo.room,
      participants: 0,
      consensus: 0,
      aiSummary: {
        topic: topicInfo.topic,
        focus: topicInfo.focus
      },
      agenda: randomPick(AGENDAS_POOL),
      materials: randomPick(MATERIALS_POOL),
      description: '讨论' + topicInfo.focus + '相关事宜，欢迎各位业主积极参与讨论。',
      createTime: n - Math.floor(Math.random() * 7 * day),
      voteRule: topicInfo.title.indexOf('业主大会') !== -1 ? '双三分之二' : '双过半',
      place: '线上会议室',
      category: topicInfo.category,
      isTestData: true,
      testVersion: TEST_DATA_VERSION
    };
  }

  function generatePreMeetingData() {
    var n = now();
    var hour = 3600000;
    var day = 86400000;
    var minute = 60000;
    var meetings = [];

    var topic1 = TOPICS_POOL[0];
    var host1 = HOSTS_POOL[0];
    meetings.push(Object.assign({}, generateMeetingBase(
      'test_not_started_1',
      topic1,
      host1,
      n + 2 * day,
      'not_started'
    ), {
      participants: 8,
      description: '会议尚未开始，将于2天后召开。欢迎各位业主提前了解议题内容。',
      statusLabel: '未开始',
      statusDesc: '会议尚未开始'
    }));

    var topic2 = TOPICS_POOL[1];
    var host2 = HOSTS_POOL[1];
    meetings.push(Object.assign({}, generateMeetingBase(
      'test_starting_soon_1',
      topic2,
      host2,
      n + 5 * minute,
      'starting_soon'
    ), {
      participants: 15,
      description: '会议即将在5分钟内开始，请参会业主做好准备。',
      statusLabel: '即将开始',
      statusDesc: '会议将在10分钟内开始',
      canEnterPrep: true,
      countdownMinutes: 5
    }));

    var topic3 = TOPICS_POOL[2];
    var host3 = HOSTS_POOL[2];
    meetings.push(Object.assign({}, generateMeetingBase(
      'test_cancelled_1',
      topic3,
      host3,
      n + 3 * day,
      'cancelled'
    ), {
      participants: 0,
      description: '该会议已取消。原因：申请人对议题内容进行调整，将重新申请。',
      statusLabel: '已取消',
      statusDesc: '会议已取消',
      cancelReason: '申请人对议题内容进行调整，将重新申请',
      cancelTime: n - 2 * hour
    }));

    var topic4 = TOPICS_POOL[3];
    var host4 = HOSTS_POOL[3];
    meetings.push(Object.assign({}, generateMeetingBase(
      'test_postponed_1',
      topic4,
      host4,
      n + 1 * day,
      'postponed'
    ), {
      participants: 12,
      description: '会议已延期。原定时间因故调整，新时间待定。',
      statusLabel: '已延期',
      statusDesc: '会议已延期',
      postponeReason: '部分参会业主时间冲突，需重新协调',
      originalTime: formatTime(n + 1 * day),
      newTime: null,
      postponeTime: n - 1 * day
    }));

    return meetings;
  }

  function generateOngoingMeetingData() {
    var n = now();
    var hour = 3600000;
    var day = 86400000;
    var minute = 60000;
    var meetings = [];

    var topic1 = TOPICS_POOL[4];
    var host1 = HOSTS_POOL[0];
    meetings.push(Object.assign({}, generateMeetingBase(
      'test_ongoing_5min_1',
      topic1,
      host1,
      n - 5 * minute,
      'ongoing_5min'
    ), {
      participants: 18,
      consensus: 0.08,
      description: '会议刚刚开始5分钟，正在进行第一项议程。',
      statusLabel: '进行中',
      statusDesc: '会议进行中（刚开始）',
      currentAgenda: 0,
      speakerQueue: ['李业主', '王业主'],
      elapsedMinutes: 5,
      totalDuration: 120
    }));

    var topic2 = TOPICS_POOL[5];
    var host2 = HOSTS_POOL[1];
    meetings.push(Object.assign({}, generateMeetingBase(
      'test_ongoing_30min_1',
      topic2,
      host2,
      n - 30 * minute,
      'ongoing_30min'
    ), {
      participants: 25,
      consensus: 0.15,
      description: '会议进行中，正在讨论核心议题，业主积极参与讨论。',
      statusLabel: '进行中',
      statusDesc: '会议进行中（30分钟）',
      currentAgenda: 2,
      speakerQueue: ['张业主', '陈业主', '刘业主'],
      elapsedMinutes: 30,
      totalDuration: 120,
      votes: [
        { option: '同意', count: 8 },
        { option: '反对', count: 3 },
        { option: '弃权', count: 2 }
      ]
    }));

    var topic3 = TOPICS_POOL[6];
    var host3 = HOSTS_POOL[2];
    meetings.push(Object.assign({}, generateMeetingBase(
      'test_ending_soon_1',
      topic3,
      host3,
      n - 100 * minute,
      'ending_soon'
    ), {
      participants: 32,
      consensus: 0.22,
      description: '会议即将结束，正在进行最后表决，请未投票的业主尽快参与。',
      statusLabel: '进行中',
      statusDesc: '会议即将结束',
      currentAgenda: 3,
      speakerQueue: [],
      elapsedMinutes: 100,
      totalDuration: 120,
      remainingMinutes: 20,
      votes: [
        { option: '同意', count: 18 },
        { option: '反对', count: 8 },
        { option: '弃权', count: 6 }
      ],
      nearEnd: true
    }));

    return meetings;
  }

  function generatePostMeetingData() {
    var n = now();
    var hour = 3600000;
    var day = 86400000;
    var meetings = [];

    var topic1 = TOPICS_POOL[7];
    var host1 = HOSTS_POOL[0];
    meetings.push(Object.assign({}, generateMeetingBase(
      'test_ended_just_now_1',
      topic1,
      host1,
      n - 2 * hour,
      'ended_just_now'
    ), {
      participants: 28,
      consensus: 0.65,
      description: '会议刚刚结束，会议纪要正在生成中。',
      statusLabel: '已结束',
      statusDesc: '会议刚结束',
      completedAt: n - 30 * 60000,
      result: '通过',
      minutes: '会议纪要：经讨论，参会业主对楼道照明系统升级方案达成共识，同意采用LED灯具更换方案，预算控制在5万元以内。表决结果：同意65%，反对25%，弃权10%。',
      voteResult: {
        agree: 18,
        disagree: 7,
        abstain: 3
      }
    }));

    var topic2 = TOPICS_POOL[8];
    var host2 = HOSTS_POOL[1];
    meetings.push(Object.assign({}, generateMeetingBase(
      'test_ended_1day_1',
      topic2,
      host2,
      n - 1 * day,
      'ended_1day'
    ), {
      participants: 35,
      consensus: 0.48,
      description: '会议于1天前结束，未达到通过条件。',
      statusLabel: '已结束',
      statusDesc: '会议已结束（1天前）',
      completedAt: n - 1 * day,
      result: '未通过',
      minutes: '会议纪要：经讨论，同意采用人脸识别与刷卡双系统方案，但表决结果未达到双过半标准。建议继续协商或提交业主大会表决。表决结果：同意48%，反对35%，弃权17%。',
      voteResult: {
        agree: 17,
        disagree: 12,
        abstain: 6
      }
    }));

    var topic3 = TOPICS_POOL[9];
    var host3 = HOSTS_POOL[3];
    meetings.push(Object.assign({}, generateMeetingBase(
      'test_ended_1week_1',
      topic3,
      host3,
      n - 7 * day,
      'ended_1week'
    ), {
      participants: 45,
      consensus: 0.72,
      description: '会议于1周前结束，已通过决议。',
      statusLabel: '已结束',
      statusDesc: '会议已结束（1周前）',
      completedAt: n - 7 * day,
      result: '通过',
      minutes: '会议纪要：业主大会临时会议，对物业选聘进行正式投票表决。经表决，同意选聘新物业公司，表决结果：同意72%，反对18%，弃权10%。达到双三分之二标准，决议通过。',
      voteResult: {
        agree: 32,
        disagree: 8,
        abstain: 5
      },
      complianceItems: [
        { text: '已提前15日公示会议议程', done: true },
        { text: '已送达全体业主会议通知', done: true },
        { text: '表决票已准备完毕', done: true },
        { text: '监票人已确定', done: true }
      ]
    }));

    var topic4 = TOPICS_POOL[10];
    var host4 = HOSTS_POOL[1];
    meetings.push(Object.assign({}, generateMeetingBase(
      'test_archived_1',
      topic4,
      host4,
      n - 14 * day,
      'archived'
    ), {
      participants: 58,
      consensus: 0.78,
      description: '会议已归档，相关决议已执行。',
      statusLabel: '已归档',
      statusDesc: '会议已归档',
      completedAt: n - 14 * day,
      archivedAt: n - 10 * day,
      result: '通过',
      minutes: '会议纪要：业主大会临时会议，表决电梯大修资金使用申请。经表决，同意使用维修资金进行电梯大修，预算金额28万元。表决结果：同意78%，反对15%，弃权7%。',
      voteResult: {
        agree: 45,
        disagree: 9,
        abstain: 4
      },
      executionStatus: '已执行',
      executionTime: n - 5 * day,
      complianceItems: [
        { text: '已提前15日公示会议议程', done: true },
        { text: '已送达全体业主会议通知', done: true },
        { text: '表决票已准备完毕', done: true },
        { text: '监票人已确定', done: true },
        { text: '决议已公示', done: true },
        { text: '维修资金已划拨', done: true }
      ]
    }));

    return meetings;
  }

  function generateAllTestData() {
    var preMeetings = generatePreMeetingData();
    var ongoingMeetings = generateOngoingMeetingData();
    var postMeetings = generatePostMeetingData();

    var allMeetings = preMeetings.concat(ongoingMeetings).concat(postMeetings);

    return {
      version: TEST_DATA_VERSION,
      generatedAt: new Date().toISOString(),
      total: allMeetings.length,
      categories: {
        preMeeting: preMeetings.length,
        ongoing: ongoingMeetings.length,
        postMeeting: postMeetings.length
      },
      meetings: allMeetings
    };
  }

  function generateTestData() {
    var data = generateAllTestData();
    set(TEST_DATA_KEY, data);

    if (typeof EcosystemBridge !== 'undefined' && EcosystemBridge.setCouncilMeetings) {
      EcosystemBridge.setCouncilMeetings(data.meetings);
    }

    console.log('[CouncilMeetingTestData] 已生成 ' + data.total + ' 条测试数据');
    return data;
  }

  function clearTestData() {
    var storage = getStorage();
    if (storage) {
      storage.removeItem(getKey(TEST_DATA_KEY));
    }

    if (typeof EcosystemBridge !== 'undefined' && EcosystemBridge.setCouncilMeetings) {
      EcosystemBridge.setCouncilMeetings([]);
    }

    console.log('[CouncilMeetingTestData] 已清空所有测试数据');
    return { success: true, message: '测试数据已清空' };
  }

  function resetTestData() {
    clearTestData();
    return generateTestData();
  }

  function getTestData() {
    return get(TEST_DATA_KEY);
  }

  function getTestDataStats() {
    var data = getTestData();
    if (!data) {
      return {
        hasData: false,
        message: '暂无测试数据'
      };
    }

    var stats = {
      hasData: true,
      version: data.version,
      generatedAt: data.generatedAt,
      total: data.total,
      categories: data.categories,
      statusBreakdown: {}
    };

    if (data.meetings) {
      data.meetings.forEach(function(m) {
        var status = m.status;
        stats.statusBreakdown[status] = (stats.statusBreakdown[status] || 0) + 1;
      });
    }

    return stats;
  }

  function getMeetingsByStatus(status) {
    var data = getTestData();
    if (!data || !data.meetings) return [];

    return data.meetings.filter(function(m) {
      return m.status === status;
    });
  }

  function getMeetingsByCategory(category) {
    var data = getTestData();
    if (!data || !data.meetings) return [];

    var categoryMap = {
      'preMeeting': ['not_started', 'starting_soon', 'cancelled', 'postponed'],
      'ongoing': ['ongoing_5min', 'ongoing_30min', 'ending_soon'],
      'postMeeting': ['ended_just_now', 'ended_1day', 'ended_1week', 'archived']
    };

    var statuses = categoryMap[category];
    if (!statuses) return [];

    return data.meetings.filter(function(m) {
      return statuses.indexOf(m.status) !== -1;
    });
  }

  function getStatusLabel(status) {
    var labels = {
      'not_started': '未开始',
      'starting_soon': '即将开始',
      'cancelled': '已取消',
      'postponed': '已延期',
      'ongoing_5min': '进行中（刚开始）',
      'ongoing_30min': '进行中（30分钟）',
      'ending_soon': '进行中（即将结束）',
      'ended_just_now': '已结束（刚结束）',
      'ended_1day': '已结束（1天前）',
      'ended_1week': '已结束（1周前）',
      'archived': '已归档'
    };
    return labels[status] || status;
  }

  function getStatusCategory(status) {
    var preMeeting = ['not_started', 'starting_soon', 'cancelled', 'postponed'];
    var ongoing = ['ongoing_5min', 'ongoing_30min', 'ending_soon'];
    var postMeeting = ['ended_just_now', 'ended_1day', 'ended_1week', 'archived'];

    if (preMeeting.indexOf(status) !== -1) return '会前';
    if (ongoing.indexOf(status) !== -1) return '会中';
    if (postMeeting.indexOf(status) !== -1) return '会后';
    return '未知';
  }

  function exportTestData() {
    var data = getTestData();
    if (!data) {
      return { success: false, message: '暂无测试数据可导出' };
    }

    var jsonStr = JSON.stringify(data, null, 2);
    var blob = new Blob([jsonStr], { type: 'application/json' });
    var url = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.href = url;
    a.download = 'council-meeting-test-data-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, message: '测试数据已导出' };
  }

  function importTestData(jsonStr) {
    try {
      var data = JSON.parse(jsonStr);
      if (!data.meetings || !Array.isArray(data.meetings)) {
        return { success: false, message: '无效的测试数据格式' };
      }

      data.version = data.version || TEST_DATA_VERSION;
      data.generatedAt = new Date().toISOString();
      data.total = data.meetings.length;

      set(TEST_DATA_KEY, data);

      if (typeof EcosystemBridge !== 'undefined' && EcosystemBridge.setCouncilMeetings) {
        EcosystemBridge.setCouncilMeetings(data.meetings);
      }

      return { success: true, message: '已导入 ' + data.total + ' 条测试数据' };
    } catch (e) {
      return { success: false, message: '导入失败：' + e.message };
    }
  }

  function isTestEnvironment() {
    var hostname = window.location.hostname;
    return hostname === 'localhost' ||
           hostname === '127.0.0.1' ||
           hostname.indexOf('test') !== -1 ||
           hostname.indexOf('dev') !== -1;
  }

  function validateTestData() {
    var data = getTestData();
    if (!data) {
      return { valid: false, errors: ['暂无测试数据'] };
    }

    var errors = [];

    if (!data.meetings || !Array.isArray(data.meetings)) {
      errors.push('会议数据格式错误');
    } else {
      var requiredFields = ['id', 'title', 'status', 'startTime', 'meetingTime'];
      data.meetings.forEach(function(m, index) {
        requiredFields.forEach(function(field) {
          if (!m[field]) {
            errors.push('会议 ' + (index + 1) + ' 缺少必填字段: ' + field);
          }
        });
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      total: data.meetings ? data.meetings.length : 0
    };
  }

  var CouncilMeetingTestData = {
    generate: generateTestData,
    clear: clearTestData,
    reset: resetTestData,
    get: getTestData,
    getStats: getTestDataStats,
    getByStatus: getMeetingsByStatus,
    getByCategory: getMeetingsByCategory,
    getStatusLabel: getStatusLabel,
    getStatusCategory: getStatusCategory,
    export: exportTestData,
    import: importTestData,
    isTestEnvironment: isTestEnvironment,
    validate: validateTestData,
    version: TEST_DATA_VERSION,

    STATUS: {
      NOT_STARTED: 'not_started',
      STARTING_SOON: 'starting_soon',
      CANCELLED: 'cancelled',
      POSTPONED: 'postponed',
      ONGOING_5MIN: 'ongoing_5min',
      ONGOING_30MIN: 'ongoing_30min',
      ENDING_SOON: 'ending_soon',
      ENDED_JUST_NOW: 'ended_just_now',
      ENDED_1DAY: 'ended_1day',
      ENDED_1WEEK: 'ended_1week',
      ARCHIVED: 'archived'
    },

    CATEGORY: {
      PRE_MEETING: 'preMeeting',
      ONGOING: 'ongoing',
      POST_MEETING: 'postMeeting'
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CouncilMeetingTestData;
  } else {
    global.CouncilMeetingTestData = CouncilMeetingTestData;
  }

})(typeof window !== 'undefined' ? window : this);
