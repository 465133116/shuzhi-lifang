/**
 * 数治理方 - 五端生态系统 共享数据桥
 * 业主端、物业端、业委会端、社区端、AI端 通过 localStorage 同源互通
 * 使用方式：必须通过同一域名访问（如 http://localhost:8080/生态/）才能跨页共享数据
 */
(function (global) {
  'use strict';
  var PREFIX = 'sgzf_';
  var CHANNEL = 'sgzf_ecosystem';
  var storage = typeof localStorage !== 'undefined' ? localStorage : null;
  var broadcast = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL) : null;

  function key(k) { return PREFIX + k; }
  function get(k) {
    if (!storage) return null;
    try {
      var raw = storage.getItem(key(k));
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function set(k, v, detail) {
    if (!storage) return;
    try {
      storage.setItem(key(k), JSON.stringify(v));
      var msg = { type: 'update', store: k };
      if (detail && typeof detail === 'object') msg.detail = detail;
      if (broadcast) broadcast.postMessage(msg);
    } catch (e) {}
  }

  /** 工单：报修/投诉/咨询等，物业端主维护，业主端可新增 */
  function getTickets() {
    var list = get('tickets');
    if (list && Array.isArray(list)) return list;
    seedTickets();
    return get('tickets');
  }
  function setTickets(list) {
    set('tickets', Array.isArray(list) ? list : []);
  }
  function addTicket(ticket) {
    var list = getTickets().slice();
    list.unshift(ticket);
    set('tickets', list, { id: ticket.id, action: 'add' });
    return ticket;
  }
  function updateTicket(id, patch) {
    var list = getTickets().slice();
    var i = list.findIndex(function (t) { return t.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    set('tickets', Array.isArray(list) ? list : [], { id: id, action: 'update' });
    return list[i];
  }
  function findTicket(id) {
    return getTickets().find(function (t) { return t.id === id; }) || null;
  }

  /** 公告：物业端/业委会端发布，业主端/社区端展示 */
  function getBulletins() {
    var list = get('bulletins');
    if (list && Array.isArray(list)) return list;
    seedBulletins();
    return get('bulletins');
  }
  function setBulletins(list) {
    set('bulletins', Array.isArray(list) ? list : []);
  }
  function addBulletin(item) {
    var list = (getBulletins().slice()).concat([item]);
    setBulletins(list);
    return item;
  }

  /** 业主咨询：业主端发起，物业端回复 */
  function getConsult() {
    var list = get('consult');
    if (list && Array.isArray(list)) return list;
    seedConsult();
    return get('consult');
  }
  function setConsult(list) {
    set('consult', Array.isArray(list) ? list : []);
  }
  function addConsult(item) {
    var list = getConsult().slice();
    if (!item.id) item.id = 'consult_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    list.unshift(item);
    setConsult(list);
    return item;
  }
  function updateConsultItem(id, patch) {
    var list = getConsult().slice();
    var i = list.findIndex(function (c) { return c.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    setConsult(list);
    return list[i];
  }

  /** 维修金申报：物业端提交，业委会端审核 */
  function getMaintenanceFund() {
    var list = get('maintenance_fund');
    if (list && Array.isArray(list)) return list;
    seedMaintenanceFund();
    return get('maintenance_fund');
  }
  function setMaintenanceFund(list) {
    set('maintenance_fund', Array.isArray(list) ? list : []);
  }
  function addMaintenanceFund(item) {
    var list = (getMaintenanceFund().slice()).concat([item]);
    setMaintenanceFund(list);
    return item;
  }
  function updateMaintenanceFund(id, patch) {
    var list = getMaintenanceFund().slice();
    var idx = list.findIndex(function (m) { return m.id === id; });
    if (idx === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[idx][k] = patch[k];
    setMaintenanceFund(list);
    return list[idx];
  }

  /** 评分异议 */
  function getObjections() {
    var list = get('objections');
    if (list && Array.isArray(list)) return list;
    set('objections', []);
    return [];
  }
  function setObjections(list, detail) {
    set('objections', Array.isArray(list) ? list : [], detail);
  }
  function addObjection(item) {
    var list = getObjections().slice();
    if (!item.id) item.id = 'obj_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    item.createTime = item.createTime || new Date().toISOString();
    list.push(item);
    setObjections(list, { id: item.id, ticketId: item.ticketId, type: item.type, action: 'add' });
    return item;
  }
  /** 更新评分异议：按 ticketId + type 找到最后一条并更新（业主端回复时用） */
  function updateObjection(ticketId, type, patch) {
    var list = getObjections().slice();
    var idx = -1;
    for (var i = list.length - 1; i >= 0; i--) {
      if (list[i].ticketId === ticketId && list[i].type === type) { idx = i; break; }
    }
    if (idx === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[idx][k] = patch[k];
    var item = list[idx];
    setObjections(list, { id: item.id, ticketId: ticketId, type: type, action: 'update' });
    return item;
  }

  /** 门禁通行码 */
  function getAccessCodes() {
    var list = get('access_codes');
    if (list && Array.isArray(list)) return list;
    seedAccessCodes();
    return get('access_codes');
  }
  function setAccessCodes(list) {
    set('access_codes', Array.isArray(list) ? list : []);
  }

  /** 不文明行为上报 */
  function getUncivil() {
    var list = get('uncivil');
    if (list && Array.isArray(list)) return list;
    set('uncivil', []);
    return [];
  }
  function setUncivil(list) {
    set('uncivil', Array.isArray(list) ? list : []);
  }
  function addUncivil(item) {
    var list = getUncivil().slice();
    list.unshift(item);
    setUncivil(list);
    return item;
  }

  /** 业主认证申请：业主端提交，AI 端审核；status: pending=待审核, approved=已通过, rejected=已驳回；AI驳回且业主异议后写入 auth_pending 给物业人工核验 */
  function getOwnerAuthApplications() {
    var list = get('owner_auth_applications');
    if (list && Array.isArray(list)) return list;
    set('owner_auth_applications', []);
    return [];
  }
  function setOwnerAuthApplications(list) {
    set('owner_auth_applications', Array.isArray(list) ? list : []);
  }
  function addOwnerAuthApplication(item) {
    var list = getOwnerAuthApplications().slice();
    if (!item.id) item.id = 'oa_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.status = item.status || 'pending';
    item.createTime = item.createTime || new Date().toISOString();
    list.unshift(item);
    setOwnerAuthApplications(list);
    return item;
  }
  function updateOwnerAuthApplication(id, patch) {
    var list = getOwnerAuthApplications().slice();
    var i = list.findIndex(function (a) { return a.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    setOwnerAuthApplications(list);
    return list[i];
  }
  function findOwnerAuthApplication(id) {
    return getOwnerAuthApplications().find(function (a) { return a.id === id; }) || null;
  }

  /** 认证待办（业主认证核验） */
  function getAuthPending() {
    var list = get('auth_pending');
    if (list && Array.isArray(list)) return list;
    seedAuthPending();
    return get('auth_pending');
  }
  function setAuthPending(list) {
    set('auth_pending', Array.isArray(list) ? list : []);
  }
  function addAuthPending(item) {
    var list = getAuthPending().slice();
    if (!item.id) item.id = 'auth_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    list.unshift(item);
    setAuthPending(list);
    return item;
  }
  function updateAuthPending(id, patch) {
    var list = getAuthPending().slice();
    var i = list.findIndex(function (a) { return a.id === id; });
    if (i === -1) return null;
    if (patch === null) { list.splice(i, 1); setAuthPending(list); return null; }
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    setAuthPending(list);
    return list[i];
  }

  /** 议事申请：业主端提交，AI 端审核，审核通过后写入 council_meetings */
  function getMeetingApplications() {
    var list = get('meeting_applications');
    if (list && Array.isArray(list)) return list;
    set('meeting_applications', []);
    return [];
  }
  function setMeetingApplications(list) {
    set('meeting_applications', Array.isArray(list) ? list : []);
  }
  function addMeetingApplication(item) {
    var list = (getMeetingApplications()).slice();
    list.unshift(item);
    setMeetingApplications(list);
    return item;
  }
  function updateMeetingApplication(id, patch) {
    var list = getMeetingApplications().slice();
    var i = list.findIndex(function (m) { return m.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    setMeetingApplications(list);
    return list[i];
  }
  function findMeetingApplication(id) {
    return getMeetingApplications().find(function (m) { return m.id === id; }) || null;
  }

  /** 业主大会投票议题：业委会端发起，业主端展示与投票（status: voting=投票中, ended=已结束） */
  function getVotes() {
    var list = get('votes');
    if (list && Array.isArray(list)) return list;
    set('votes', []);
    return [];
  }
  function setVotes(list) {
    set('votes', Array.isArray(list) ? list : []);
  }
  function addVote(item) {
    var list = (getVotes()).slice();
    if (!item.id) item.id = 'vote_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    list.unshift(item);
    setVotes(list);
    return item;
  }
  function updateVote(id, patch) {
    var list = getVotes().slice();
    var i = list.findIndex(function (v) { return v.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    setVotes(list);
    return list[i];
  }

  /** 已发布议事厅会议：AI 审核通过后写入，业主端议事厅/滚动条/我的服务展示 */
  function getCouncilMeetings() {
    var list = get('council_meetings');
    if (list && Array.isArray(list)) return list;
    seedCouncilMeetings();
    return get('council_meetings');
  }
  function setCouncilMeetings(list) {
    set('council_meetings', Array.isArray(list) ? list : []);
  }
  function addCouncilMeeting(item) {
    var list = (getCouncilMeetings()).slice();
    list.unshift(item);
    setCouncilMeetings(list);
    return item;
  }
  function updateCouncilMeeting(id, patch) {
    var list = (getCouncilMeetings()).slice();
    var i = list.findIndex(function (m) {
      return m.id === id;
    });
    if (i === -1) return null;
    var p = patch && typeof patch === 'object' ? patch : {};
    for (var k in p) {
      if (Object.prototype.hasOwnProperty.call(p, k)) list[i][k] = p[k];
    }
    setCouncilMeetings(list);
    return list[i];
  }

  /** 虚拟会议数据：覆盖所有状态（pending/approved/ongoing/completed/escalated）及会议类型 */
  function seedCouncilMeetings() {
    var now = Date.now();
    var hour = 3600000;
    var day = 86400000;
    function formatTime(ts) {
      var d = new Date(ts);
      if (isNaN(d.getTime())) return '待定';
      var y = d.getFullYear();
      var M = String(d.getMonth() + 1);
      var D = String(d.getDate());
      var h = String(d.getHours());
      var m = String(d.getMinutes());
      if (M.length === 1) M = '0' + M;
      if (D.length === 1) D = '0' + D;
      if (h.length === 1) h = '0' + h;
      if (m.length === 1) m = '0' + m;
      return y + '年' + M + '月' + D + '日 ' + h + ':' + m;
    }
    var list = [
      // ========== pending 待审核 ==========
      {
        id: 'meeting_pending_1',
        title: '小区绿化改造方案讨论会',
        type: 'assembly',
        meetingType: '议事厅会议',
        status: 'pending',
        startTime: '2026年03月15日 14:00',
        meetingTime: now + 9 * day,
        host: '张业主',
        hostName: '张业主',
        hostRoom: '1-101',
        proposer: '张业主',
        proposerRoom: '1-101',
        participants: 0,
        consensus: 0,
        aiSummary: { topic: '小区绿化改造', focus: '绿化带重新规划与植物更换方案' },
        agenda: ['现状分析与问题梳理', '改造方案介绍', '业主意见征集', '投票表决'],
        materials: [
          { name: '绿化改造方案.pdf', url: '#' },
          { name: '预算明细表.xlsx', url: '#' }
        ],
        description: '讨论小区绿化带改造方案，包括植物更换、景观设计等内容',
        createTime: now - 2 * hour
      },
      {
        id: 'meeting_pending_2',
        title: '楼道照明系统升级协商',
        type: 'slow',
        meetingType: '议事厅会议',
        status: 'pending',
        startTime: '待定',
        meetingTime: null,
        host: '李业主',
        hostName: '李业主',
        hostRoom: '2-202',
        proposer: '李业主',
        proposerRoom: '2-202',
        participants: 0,
        consensus: 0,
        aiSummary: { topic: '楼道照明升级', focus: 'LED灯具更换与智能控制系统' },
        agenda: [],
        materials: [],
        description: '慢会型议事，多轮次讨论楼道照明系统升级方案',
        createTime: now - 5 * hour
      },
      
      // ========== approved 已通过（即将开始，可进入准备室）==========
      
      // ========== ongoing 进行中 ==========
      {
        id: 'meeting_ongoing_demo',
        title: '小区停车位分配方案协商会',
        type: 'assembly',
        meetingType: '议事厅会议',
        status: 'ongoing',
        startTime: '2026年03月06日 14:30',
        meetingTime: now - 30 * 60000,
        host: '王主任',
        hostName: '王主任',
        hostRoom: '3-101',
        proposer: '王主任',
        proposerRoom: '3-101',
        participants: 12,
        consensus: 0.35,
        aiSummary: { topic: '停车位分配方案', focus: '讨论地面停车位抽签分配方案' },
        agenda: ['现状分析', '分配方案介绍', '业主讨论', '投票表决'],
        materials: [
          { name: '停车位分配方案.pdf', url: '#' }
        ],
        description: '讨论小区停车位分配方案',
        createTime: now - 2 * hour,
        voteRule: '双过半',
        place: '线上会议室',
        expectedParticipants: 15
      },
      {
        id: 'meeting_ongoing_1',
        title: '小区安防系统升级讨论会',
        type: 'assembly',
        meetingType: '议事厅会议',
        status: 'ongoing',
        startTime: '2026年03月06日 15:00',
        meetingTime: now - 30 * 60000,
        host: '赵业主',
        hostName: '赵业主',
        hostRoom: '5-501',
        proposer: '赵业主',
        proposerRoom: '5-501',
        participants: 28,
        consensus: 0.18,
        aiSummary: { topic: '安防系统升级', focus: '监控设备更换与门禁系统升级' },
        agenda: ['现状问题分析', '升级方案介绍', '费用预算说明', '业主讨论'],
        materials: [
          { name: '安防升级方案.pdf', url: '#' },
          { name: '设备报价单.pdf', url: '#' }
        ],
        description: '讨论小区安防系统升级方案，包括监控设备更换、门禁系统升级等',
        createTime: now - 3 * hour,
        voteRule: '双过半',
        place: '线上会议室',
        currentAgenda: 2,
        speakerQueue: ['张业主', '李业主', '王业主']
      },
      {
        id: 'meeting_ongoing_2',
        title: '公共收益使用方案协商',
        type: 'assembly',
        meetingType: '议事厅会议',
        status: 'ongoing',
        startTime: '2026年03月06日 16:30',
        meetingTime: now - 1.5 * hour,
        host: '业委会',
        hostName: '业委会',
        proposer: '业委会',
        participants: 35,
        consensus: 0.25,
        aiSummary: { topic: '公共收益使用', focus: '电梯广告收益分配方案' },
        agenda: ['公共收益公示', '使用方案介绍', '业主意见征集', '投票表决'],
        materials: [
          { name: '公共收益明细.pdf', url: '#' },
          { name: '使用方案建议.pdf', url: '#' }
        ],
        description: '协商公共收益使用方案，认同度已超20%可推动临时业主大会',
        createTime: now - 2 * hour,
        voteRule: '双过半',
        place: '线上会议室',
        currentAgenda: 3,
        speakerQueue: ['陈业主', '刘业主']
      },
      {
        id: 'meeting_ongoing_3',
        title: '儿童游乐设施更新讨论',
        type: 'slow',
        meetingType: '议事厅会议',
        status: 'ongoing',
        startTime: '2026年03月05日 10:00',
        meetingTime: now - 1 * day,
        host: '孙业主',
        hostName: '孙业主',
        hostRoom: '6-601',
        proposer: '孙业主',
        proposerRoom: '6-601',
        participants: 12,
        consensus: 0.15,
        aiSummary: { topic: '游乐设施更新', focus: '滑梯与秋千更换方案' },
        agenda: ['设施现状评估', '更新方案讨论', '安全标准确认'],
        materials: [
          { name: '设施检测报告.pdf', url: '#' }
        ],
        description: '慢会型议事，多轮次讨论儿童游乐设施更新方案',
        createTime: now - 1 * day,
        voteRule: '双过半',
        place: '线上会议室',
        round: 2,
        totalRounds: 3
      },
      
      // ========== completed 已完成 ==========
      /** 已结束 + 问题聚焦 + 可升级：可点「进入准备室」（会后安排决策会议时间） */
      {
        id: 'meeting_ended_prep_ready',
        title: '【演示】地下车库照明改造协商（已结束·可进准备室）',
        type: 'slow',
        meetingType: '议事厅会议',
        status: 'completed',
        startTime: formatTime(now - 2 * day),
        meetingTime: now - 2 * day,
        host: '陈业主',
        hostName: '陈业主',
        hostRoom: '4-201',
        proposer: '陈业主',
        proposerRoom: '4-201',
        participants: 36,
        consensus: 0.34,
        aiSummary: { topic: '地库照明节能改造', focus: '已聚焦：分区改造范围与费用分摊原则' },
        agenda: ['现状勘查说明', '节能方案比选', '分摊原则共识', '后续决策安排'],
        materials: [{ name: '地库照明勘测简表.pdf', url: '#' }],
        description: '协商会议已正常结束，已达问题聚焦，可进入准备室安排第二轮决策会议时间。',
        createTime: now - 3 * day,
        completedAt: now - 2 * day,
        voteRule: '双过半',
        place: '线上会议室',
        expectedParticipants: 40,
        canUpgrade: true,
        focused: true,
        meetingHistory: [
          { round: 1, date: formatTime(now - 2 * day), status: 'completed', participants: 36, consensus: 0.34 }
        ]
      },
      {
        id: 'meeting_completed_1',
        title: '物业服务费调整讨论会',
        type: 'assembly',
        meetingType: '议事厅会议',
        status: 'completed',
        startTime: '2026年03月01日 14:00',
        meetingTime: now - 5 * day,
        host: '业委会',
        hostName: '业委会',
        proposer: '业委会',
        participants: 52,
        consensus: 0.68,
        aiSummary: { topic: '物业费调整', focus: '服务费标准与服务内容对应' },
        agenda: ['现行费用分析', '调整方案说明', '业主讨论', '投票表决'],
        materials: [
          { name: '物业费调整方案.pdf', url: '#' },
          { name: '服务标准对比.pdf', url: '#' }
        ],
        description: '讨论物业服务费调整方案，最终达成共识',
        createTime: now - 6 * day,
        completedAt: now - 5 * day,
        voteRule: '双过半',
        place: '线上会议室',
        minutes: '会议纪要：经讨论，参会业主对物业费调整方案达成共识，同意将物业费从1.8元/㎡调整至2.0元/㎡，同时物业公司承诺提升保洁、安保服务标准。表决结果：同意68%，反对22%，弃权10%。',
        result: '通过'
      },
      {
        id: 'meeting_completed_2',
        title: '小区门禁系统改造协商',
        type: 'assembly',
        meetingType: '议事厅会议',
        status: 'completed',
        startTime: '2026年02月25日 19:00',
        meetingTime: now - 9 * day,
        host: '周业主',
        hostName: '周业主',
        hostRoom: '7-701',
        proposer: '周业主',
        proposerRoom: '7-701',
        participants: 38,
        consensus: 0.45,
        aiSummary: { topic: '门禁改造', focus: '人脸识别与刷卡双系统' },
        agenda: ['改造需求分析', '技术方案介绍', '费用预算', '业主讨论'],
        materials: [
          { name: '门禁改造方案.pdf', url: '#' }
        ],
        description: '协商小区门禁系统改造方案',
        createTime: now - 10 * day,
        completedAt: now - 9 * day,
        voteRule: '双过半',
        place: '线上会议室',
        minutes: '会议纪要：经讨论，同意采用人脸识别与刷卡双系统方案，预算控制在15万元以内。表决结果：同意45%，反对35%，弃权20%。未达到双过半标准，建议继续协商或提交业主大会表决。',
        result: '未通过'
      },
      {
        id: 'meeting_completed_3',
        title: '业主大会（临时会议）-维修资金使用表决',
        type: 'assembly',
        meetingType: '业主大会（临时会议）',
        status: 'completed',
        startTime: '2026年02月20日 09:00',
        meetingTime: now - 14 * day,
        host: '业委会',
        hostName: '业委会',
        proposer: '业委会',
        participants: 156,
        consensus: 0.72,
        aiSummary: { topic: '维修资金使用', focus: '电梯大修资金申请' },
        agenda: ['电梯检测报告', '维修方案说明', '费用预算', '投票表决'],
        materials: [
          { name: '电梯检测报告.pdf', url: '#' },
          { name: '维修预算明细.pdf', url: '#' },
          { name: '维修资金使用申请.pdf', url: '#' }
        ],
        description: '业主大会临时会议，表决电梯大修资金使用申请',
        createTime: now - 15 * day,
        completedAt: now - 14 * day,
        voteRule: '双三分之二',
        place: '线上会议室',
        minutes: '会议纪要：经业主大会表决，同意使用维修资金进行电梯大修，预算金额28万元。表决结果：同意72%，反对18%，弃权10%。达到双三分之二标准，决议通过。',
        result: '通过',
        complianceItems: [
          { text: '已提前15日公示会议议程', done: true },
          { text: '已送达全体业主会议通知', done: true },
          { text: '表决票已准备完毕', done: true },
          { text: '监票人已确定', done: true }
        ]
      },
      {
        id: 'meeting_completed_upgradeable',
        title: '小区公共区域改造方案协商',
        type: 'slow',
        meetingType: '议事厅会议',
        status: 'completed',
        startTime: formatTime(now - 1 * day),
        meetingTime: now - 1 * day,
        host: '张主任',
        hostName: '张主任',
        hostRoom: '2-301',
        proposer: '张主任',
        proposerRoom: '2-301',
        participants: 28,
        consensus: 0.32,
        aiSummary: { topic: '公共区域改造', focus: '已明确改造范围与预算分配方案' },
        agenda: ['现状分析', '改造方案介绍', '业主讨论', '意见征集'],
        materials: [
          { name: '公共区域改造方案.pdf', url: '#' },
          { name: '预算明细表.xlsx', url: '#' }
        ],
        description: '协商小区公共区域改造方案，认同度超20%可发起临时业主大会',
        createTime: now - 2 * day,
        completedAt: now - 1 * day,
        voteRule: '双过半',
        place: '线上会议室',
        expectedParticipants: 35,
        canUpgrade: true,
        focused: true,
        meetingHistory: [
          { round: 1, date: formatTime(now - 1 * day), status: 'completed', participants: 28, consensus: 0.32 }
        ]
      },
      
      // ========== escalated 已升级（认同度超20%，已发起临时业主大会议案）==========
      {
        id: 'meeting_escalated_1',
        title: '小区停车管理改革讨论会',
        type: 'assembly',
        meetingType: '议事厅会议',
        status: 'escalated',
        startTime: '2026年03月02日 15:00',
        meetingTime: now - 4 * day,
        host: '吴业主',
        hostName: '吴业主',
        hostRoom: '8-801',
        proposer: '吴业主',
        proposerRoom: '8-801',
        participants: 42,
        consensus: 0.32,
        aiSummary: { topic: '停车管理改革', focus: '车位分配与收费标准调整' },
        agenda: ['现行问题分析', '改革方案介绍', '业主讨论', '投票建议'],
        materials: [
          { name: '停车管理改革方案.pdf', url: '#' },
          { name: '周边小区对比.pdf', url: '#' }
        ],
        description: '讨论小区停车管理改革方案，认同度超20%已发起临时业主大会议案',
        createTime: now - 5 * day,
        completedAt: now - 4 * day,
        voteRule: '双过半',
        place: '线上会议室',
        minutes: '会议纪要：经讨论，认同度达到32%，已超过20%阈值。系统已自动生成临时业主大会议案，提交业委会审核后进入业主大会投票流程。',
        result: '已升级',
        escalatedTo: 'vote_escalated_1',
        escalatedAt: now - 4 * day
      }
    ];
    setCouncilMeetings(list);
  }

  /** 操作日志 */
  function getLogs() {
    var list = get('logs');
    if (list && Array.isArray(list)) return list;
    set('logs', []);
    return [];
  }
  function addLog(entry) {
    var list = getLogs().slice();
    list.unshift(entry);
    if (list.length > 500) list.length = 500;
    set('logs', list);
  }

  /** 物业评分（综合） */
  function getScore() {
    var o = get('score');
    if (o && typeof o === 'object') return o;
    var empty = { total: 0, avg: 0, rate: '0%', accept: 0, repair: 0, report: 0 };
    set('score', empty);
    return empty;
  }
  function setScore(o) {
    set('score', o && typeof o === 'object' ? o : getScore());
  }

  /**
   * 物业评分系统：基于合同履约的自动评分
   * propertyScoreRecords: [{ id, ticketId, action, score, reason, timestamp, contractRef }]
   * propertyScoreSummary: { totalScore, maxScore, avgScore, records, lastUpdated }
   */
  function getPropertyScoreRecords() {
    var list = get('property_score_records');
    if (list && Array.isArray(list)) return list;
    set('property_score_records', []);
    return [];
  }
  function setPropertyScoreRecords(list) {
    set('property_score_records', Array.isArray(list) ? list : []);
  }
  function addPropertyScoreRecord(item) {
    var list = getPropertyScoreRecords().slice();
    if (!item.id) item.id = 'psr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.timestamp = item.timestamp || new Date().toISOString();
    list.unshift(item);
    setPropertyScoreRecords(list);
    updatePropertyScoreSummary();
    return item;
  }
  function getPropertyScoreSummary() {
    var o = get('property_score_summary');
    if (o && typeof o === 'object') return o;
    var empty = { totalScore: 100, maxScore: 100, records: 0, positiveCount: 0, negativeCount: 0, lastUpdated: null };
    set('property_score_summary', empty);
    return empty;
  }
  function updatePropertyScoreSummary() {
    var records = getPropertyScoreRecords();
    var summary = {
      totalScore: 100,
      maxScore: 100,
      records: records.length,
      positiveCount: 0,
      negativeCount: 0,
      lastUpdated: new Date().toISOString()
    };
    records.forEach(function(r) {
      if (r.score > 0) {
        summary.positiveCount++;
        summary.totalScore = Math.min(100, summary.totalScore + r.score);
      } else if (r.score < 0) {
        summary.negativeCount++;
        summary.totalScore = Math.max(0, summary.totalScore + r.score);
      }
    });
    set('property_score_summary', summary);
    return summary;
  }
  function setPropertyScoreSummary(o) {
    set('property_score_summary', o && typeof o === 'object' ? o : getPropertyScoreSummary());
  }

  /**
   * 物业公司年度工作计划表：物业端填写并发布，业主端实时展示
   * 结构：{ year, months: [], quarters: [], plans: [], publishedAt, publisher }
   * plans: [{ id, title, month (0-11), executionTime, status, department, desc }]
   */
  function getAnnualWorkPlan() {
    var o = get('annual_work_plan');
    if (o && typeof o === 'object' && o.plans && Array.isArray(o.plans)) return o;
    return null;
  }
  function setAnnualWorkPlan(payload) {
    set('annual_work_plan', payload && typeof payload === 'object' ? payload : null);
  }

  /**
   * 设备巡检数据：物业端管理设备巡检计划、任务、记录和异常
   * 结构：{ plans: [], tasks: [], records: [], abnormals: [] }
   */
  function getDeviceInspectionData() {
    var o = get('device_inspection_data');
    if (o && typeof o === 'object') return o;
    return { plans: [], tasks: [], records: [], abnormals: [] };
  }
  function setDeviceInspectionData(payload) {
    set('device_inspection_data', payload && typeof payload === 'object' ? payload : { plans: [], tasks: [], records: [], abnormals: [] });
  }

  /**
   * 服务巡检数据：物业端管理员工定位、轨迹和热力图
   * 结构：{ staff: [], tracks: [], heatmap: null }
   * staff: [{ id, name, dept, chipId, position, status, lastUpdate, x, y }]
   */
  function getServiceInspectionData() {
    var o = get('service_inspection_data');
    if (o && typeof o === 'object') return o;
    return { staff: [], tracks: [], heatmap: null };
  }
  function setServiceInspectionData(payload) {
    set('service_inspection_data', payload && typeof payload === 'object' ? payload : { staff: [], tracks: [], heatmap: null });
  }

  /**
   * 物业管理合同解析结果与 AI 工单执行标准（业委会上传合同后由 AI 解析并写入，AI 端读取用于分派/评分）
   * 结构：{ contractId, contractName, parsedAt, chapters: [], keyPoints: {}, executionStandards: [] }
   * executionStandards: [{ type, contractRef, standard, scenario, scoreRule }]
   */
  function getContractExecutionStandards() {
    var o = get('contract_execution_standards');
    if (o && typeof o === 'object') return o;
    return null;
  }
  function setContractExecutionStandards(payload) {
    set('contract_execution_standards', payload && typeof payload === 'object' ? payload : null);
  }

  /**
   * 业主大会授权委托书：AI 解析后写入规则库，约束维修资金审批
   * delegation_list: [{ id, name, uploadTime, uploader, status, singleLimit, yearLimit, source }]
   * delegationAuthRule: { singleLimit, yearLimit, source } 当前生效规则
   */
  function getDelegationList() {
    var list = get('delegation_list');
    if (list && Array.isArray(list)) return list;
    set('delegation_list', []);
    return [];
  }
  function setDelegationList(list) {
    set('delegation_list', Array.isArray(list) ? list : []);
  }
  function addDelegation(item) {
    var list = getDelegationList().slice();
    if (!item.id) item.id = 'del_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    list.unshift(item);
    setDelegationList(list);
    return item;
  }
  function updateDelegation(id, patch) {
    var list = getDelegationList().slice();
    var i = list.findIndex(function (d) { return d.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    setDelegationList(list);
    return list[i];
  }
  function getDelegationAuthRule() {
    var o = get('delegation_auth_rule');
    if (o && typeof o === 'object') return o;
    return { singleLimit: 0, yearLimit: 0, source: 'default' };
  }
  function setDelegationAuthRule(payload) {
    set('delegation_auth_rule', payload && typeof payload === 'object' ? payload : null);
  }

  /**
   * 论坛话题：用户自主创建议题
   * 结构：{
   *   id, title, summary, content, sourceGroupId, sourceMessages: [], participants: [],
   *   participantCount, discussionCount, likeCount, lastReplyTime, createTime, updateTime,
   *   status: 'draft'|'pending_review'|'active'|'archived'|'voting'|'converted'|'rejected',
   *   hotScore, category, tags: [], priority: 'low'|'normal'|'high'|'urgent',
   *   sourceType: 'chat'|'question'|'manual', sourceQuestionId,
   *   convertedToMeeting: false, meetingId, voteEnabled: false, voteId,
   *   author: { id, name, room, avatar, role }, 
   *   reviewInfo: { reviewerId, reviewerName, reviewTime, reviewComment },
   *   isDraft: false, draftSavedTime
   * }
   */
  function getForumTopics() {
    var list = get('forum_topics');
    if (list && Array.isArray(list)) return list;
    seedForumTopics();
    return get('forum_topics');
  }
  function setForumTopics(list, detail) {
    set('forum_topics', Array.isArray(list) ? list : [], detail);
  }
  function addForumTopic(item) {
    var list = getForumTopics().slice();
    if (!item.id) item.id = 'topic_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.createTime = item.createTime || new Date().toISOString();
    item.updateTime = item.createTime;
    item.participantCount = item.participantCount || (item.participants ? item.participants.length : 0);
    item.discussionCount = item.discussionCount || 0;
    item.likeCount = item.likeCount || 0;
    item.status = item.status || 'active';
    item.hotScore = calculateHotScore(item);
    item.sourceType = item.sourceType || 'manual';
    item.convertedToMeeting = item.convertedToMeeting || false;
    item.voteEnabled = item.voteEnabled || false;
    item.tags = item.tags || [];
    item.priority = item.priority || 'normal';
    item.views = item.views || 0;
    list.unshift(item);
    setForumTopics(list, { id: item.id, action: 'add' });
    addLog({ type: 'forum_topic_add', topicId: item.id, title: item.title, author: item.author, time: new Date().toISOString() });
    return item;
  }
  function updateForumTopic(id, patch) {
    var list = getForumTopics().slice();
    var i = list.findIndex(function (t) { return t.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    list[i].hotScore = calculateHotScore(list[i]);
    list.sort(function(a, b) { return (b.hotScore || 0) - (a.hotScore || 0); });
    setForumTopics(list, { id: id, action: 'update' });
    return list.find(function(t) { return t.id === id; });
  }
  function deleteForumTopic(id) {
    var list = getForumTopics().slice();
    var i = list.findIndex(function (t) { return t.id === id; });
    if (i === -1) return false;
    list.splice(i, 1);
    setForumTopics(list, { id: id, action: 'delete' });
    addLog({ type: 'forum_topic_delete', topicId: id, time: new Date().toISOString() });
    return true;
  }
  function findForumTopic(id) {
    return getForumTopics().find(function(t) { return t.id === id; }) || null;
  }
  function getHotForumTopics(limit) {
    var list = getForumTopics().filter(function(t) { return t.status === 'active' || t.status === 'voting'; });
    list.sort(function(a, b) { return (b.hotScore || 0) - (a.hotScore || 0); });
    return list.slice(0, limit || 3);
  }
  function calculateHotScore(topic) {
    var pWeight = 2;
    var dWeight = 1.5;
    var lWeight = 1;
    var timeDecay = 0.1;
    var now = Date.now();
    var createTime = topic.createTime ? new Date(topic.createTime).getTime() : now;
    var hoursSinceCreate = (now - createTime) / (1000 * 60 * 60);
    var timeFactor = Math.exp(-timeDecay * hoursSinceCreate);
    var score = ((topic.participantCount || 0) * pWeight +
                 (topic.discussionCount || 0) * dWeight +
                 (topic.likeCount || 0) * lWeight) * timeFactor;
    return Math.round(score * 100) / 100;
  }
  function seedForumTopics() {
    var now = Date.now();
    var hour = 3600000;
    var list = [
      {
        id: 'topic_demo_1',
        title: '小区电梯更新方案讨论',
        summary: '关于小区老旧电梯更换的品牌选择、费用分摊等问题讨论。目前小区电梯已使用15年，故障频发，业主们普遍认为需要更换。主要讨论点包括：\n1. 品牌选择：三菱、奥的斯、通力等\n2. 费用分摊：按面积分摊还是按户分摊\n3. 施工时间安排\n欢迎各位业主积极参与讨论！',
        sourceGroupId: 'general',
        sourceMessages: ['msg_1', 'msg_2', 'msg_3'],
        participants: [
          { id: 'user_001', name: '张业主', room: '1-101' },
          { id: 'user_002', name: '李业主', room: '2-202' },
          { id: 'user_003', name: '王业主', room: '3-303' }
        ],
        participantCount: 28,
        discussionCount: 45,
        likeCount: 18,
        lastReplyTime: new Date(now - 2 * hour).toISOString(),
        createTime: new Date(now - 24 * hour).toISOString(),
        status: 'voting',
        category: '设施维修',
        hotScore: 0,
        sourceType: 'chat',
        convertedToMeeting: false,
        voteEnabled: true,
        voteId: 'vote_demo_1'
      },
      {
        id: 'topic_demo_2',
        title: '地下车库管理改革建议',
        summary: '业主们对车位分配、收费标准调整提出的建议和讨论。目前小区车位紧张，管理混乱，建议进行以下改革：\n1. 实行车位摇号分配制度\n2. 调整临时停车收费标准\n3. 增设新能源车充电桩\n欢迎大家发表意见！',
        sourceGroupId: 'general',
        sourceMessages: ['msg_4', 'msg_5'],
        participants: [
          { id: 'user_004', name: '赵业主', room: '4-401' },
          { id: 'user_005', name: '陈业主', room: '5-501' }
        ],
        participantCount: 15,
        discussionCount: 32,
        likeCount: 12,
        lastReplyTime: new Date(now - 5 * hour).toISOString(),
        createTime: new Date(now - 48 * hour).toISOString(),
        status: 'active',
        category: '停车管理',
        hotScore: 0,
        sourceType: 'chat',
        convertedToMeeting: false,
        voteEnabled: false
      },
      {
        id: 'topic_demo_3',
        title: '小区绿化改造方案',
        summary: '讨论小区绿化带重新规划与植物更换方案。目前小区绿化存在以下问题：\n1. 部分树木老化严重，存在安全隐患\n2. 绿化带布局不合理，影响停车\n3. 缺少休闲活动区域\n建议方案：\n- 更换老化树木，种植新苗木\n- 优化绿化带布局\n- 增设休闲座椅和健身器材\n请各位业主积极参与讨论，提出宝贵意见！',
        sourceGroupId: 'general',
        sourceMessages: ['msg_6'],
        participants: [
          { id: 'user_006', name: '孙业主', room: '6-601' },
          { id: 'user_007', name: '周业主', room: '7-701' }
        ],
        participantCount: 22,
        discussionCount: 18,
        likeCount: 15,
        lastReplyTime: new Date(now - 3 * hour).toISOString(),
        createTime: new Date(now - 72 * hour).toISOString(),
        status: 'voting',
        category: '环境改善',
        hotScore: 0,
        sourceType: 'chat',
        convertedToMeeting: false,
        voteEnabled: true,
        voteId: 'vote_demo_3'
      }
    ];
    list.forEach(function(t) { t.hotScore = calculateHotScore(t); });
    setForumTopics(list);
    seedForumVotes();
  }
  
  function seedForumVotes() {
    var list = [
      {
        id: 'vote_demo_1',
        topicId: 'topic_demo_1',
        title: '电梯品牌选择投票',
        description: '请选择您支持的电梯品牌',
        options: [
          { id: 'opt_1', label: '三菱电梯', count: 8 },
          { id: 'opt_2', label: '奥的斯电梯', count: 5 },
          { id: 'opt_3', label: '通力电梯', count: 3 },
          { id: 'opt_4', label: '其他品牌', count: 2 }
        ],
        status: 'voting',
        startTime: new Date(Date.now() - 24 * 3600000).toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
        voters: [
          { userId: 'user_001', optionId: 'opt_1', voteTime: new Date().toISOString(), room: '1-101', area: 120 },
          { userId: 'user_002', optionId: 'opt_1', voteTime: new Date().toISOString(), room: '2-202', area: 95 },
          { userId: 'user_003', optionId: 'opt_2', voteTime: new Date().toISOString(), room: '3-303', area: 110 }
        ],
        totalOwners: 100,
        totalArea: 12000
      },
      {
        id: 'vote_demo_3',
        topicId: 'topic_demo_3',
        title: '绿化改造方案投票',
        description: '请选择您支持的绿化改造方案',
        options: [
          { id: 'opt_a', label: '方案A：全面改造（预算较高）', count: 6 },
          { id: 'opt_b', label: '方案B：局部优化（预算适中）', count: 10 },
          { id: 'opt_c', label: '方案C：基础维护（预算较低）', count: 4 },
          { id: 'opt_d', label: '暂不改造', count: 2 }
        ],
        status: 'voting',
        startTime: new Date(Date.now() - 48 * 3600000).toISOString(),
        endTime: new Date(Date.now() + 5 * 24 * 3600000).toISOString(),
        voters: [],
        totalOwners: 100,
        totalArea: 12000
      }
    ];
    setForumVotes(list);
  }

  /**
   * 论坛讨论/回复：支持多层级回复
   * 结构：{
   *   id, topicId, parentId (null表示顶级评论), replyToId (回复的评论ID),
   *   content, author: { id, name, room }, createTime, updateTime,
   *   likeCount, likedBy: [], status: 'normal'|'hidden'|'deleted'
   * }
   */
  function getForumDiscussions() {
    var list = get('forum_discussions');
    if (list && Array.isArray(list) && list.length > 0) return list;
    seedForumDiscussions();
    return get('forum_discussions');
  }
  function setForumDiscussions(list, detail) {
    set('forum_discussions', Array.isArray(list) ? list : [], detail);
  }
  function addForumDiscussion(item) {
    var list = getForumDiscussions().slice();
    if (!item.id) item.id = 'disc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.createTime = item.createTime || new Date().toISOString();
    item.likeCount = item.likeCount || 0;
    item.likedBy = item.likedBy || [];
    item.status = item.status || 'normal';
    list.unshift(item);
    setForumDiscussions(list, { id: item.id, action: 'add' });
    updateForumTopicDiscussionCount(item.topicId);
    addLog({ type: 'forum_discussion_add', discussionId: item.id, topicId: item.topicId, author: item.author, time: new Date().toISOString() });
    return item;
  }
  function updateForumDiscussion(id, patch) {
    var list = getForumDiscussions().slice();
    var i = list.findIndex(function (d) { return d.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    setForumDiscussions(list, { id: id, action: 'update' });
    return list[i];
  }
  function deleteForumDiscussion(id) {
    var list = getForumDiscussions().slice();
    var i = list.findIndex(function (d) { return d.id === id; });
    if (i === -1) return false;
    var topicId = list[i].topicId;
    list.splice(i, 1);
    setForumDiscussions(list, { id: id, action: 'delete' });
    updateForumTopicDiscussionCount(topicId);
    return true;
  }
  function getDiscussionsByTopic(topicId) {
    return getForumDiscussions().filter(function(d) { return d.topicId === topicId && d.status !== 'deleted'; });
  }
  function updateForumTopicDiscussionCount(topicId) {
    var discussions = getDiscussionsByTopic(topicId);
    var participantIds = discussions.map(function(d) { return d.author ? d.author.id : null; }).filter(Boolean);
    var uniqueParticipants = Array.from(new Set(participantIds));
    updateForumTopic(topicId, {
      discussionCount: discussions.length,
      participantCount: uniqueParticipants.length,
      lastReplyTime: discussions.length > 0 ? discussions[0].createTime : null
    });
  }

  /**
   * 论坛点赞记录
   * 结构：{ id, targetType: 'topic'|'discussion', targetId, userId, createTime }
   */
  function getForumLikes() {
    var list = get('forum_likes');
    if (list && Array.isArray(list)) return list;
    set('forum_likes', []);
    return [];
  }
  function setForumLikes(list) {
    set('forum_likes', Array.isArray(list) ? list : []);
  }
  function toggleForumLike(targetType, targetId, userId) {
    var list = getForumLikes().slice();
    var existingIndex = list.findIndex(function(l) {
      return l.targetType === targetType && l.targetId === targetId && l.userId === userId;
    });
    var liked = false;
    if (existingIndex !== -1) {
      list.splice(existingIndex, 1);
      liked = false;
    } else {
      list.push({
        id: 'like_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        targetType: targetType,
        targetId: targetId,
        userId: userId,
        createTime: new Date().toISOString()
      });
      liked = true;
    }
    setForumLikes(list);
    if (targetType === 'topic') {
      var topic = findForumTopic(targetId);
      if (topic) {
        updateForumTopic(targetId, { likeCount: liked ? (topic.likeCount || 0) + 1 : Math.max(0, (topic.likeCount || 0) - 1) });
      }
    } else if (targetType === 'discussion') {
      var discussions = getForumDiscussions();
      var disc = discussions.find(function(d) { return d.id === targetId; });
      if (disc) {
        updateForumDiscussion(targetId, { likeCount: liked ? (disc.likeCount || 0) + 1 : Math.max(0, (disc.likeCount || 0) - 1) });
      }
    }
    return liked;
  }
  function isForumLiked(targetType, targetId, userId) {
    var list = getForumLikes();
    return list.some(function(l) {
      return l.targetType === targetType && l.targetId === targetId && l.userId === userId;
    });
  }

  /**
   * 论坛收藏记录
   * 结构：{ id, topicId, userId, createTime }
   */
  function getForumFavorites() {
    var list = get('forum_favorites');
    if (list && Array.isArray(list)) return list;
    set('forum_favorites', []);
    return [];
  }
  function setForumFavorites(list) {
    set('forum_favorites', Array.isArray(list) ? list : []);
  }
  function toggleForumFavorite(topicId, userId) {
    var list = getForumFavorites().slice();
    var existingIndex = list.findIndex(function(f) {
      return f.topicId === topicId && f.userId === userId;
    });
    var favorited = false;
    if (existingIndex !== -1) {
      list.splice(existingIndex, 1);
      favorited = false;
    } else {
      list.push({
        id: 'fav_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        topicId: topicId,
        userId: userId,
        createTime: new Date().toISOString()
      });
      favorited = true;
    }
    setForumFavorites(list);
    return favorited;
  }
  function isForumFavorited(topicId, userId) {
    var list = getForumFavorites();
    return list.some(function(f) { return f.topicId === topicId && f.userId === userId; });
  }
  function getUserFavorites(userId) {
    var favorites = getForumFavorites().filter(function(f) { return f.userId === userId; });
    var topicIds = favorites.map(function(f) { return f.topicId; });
    return getForumTopics().filter(function(t) { return topicIds.indexOf(t.id) !== -1; });
  }

  /**
   * 论坛投票：议题热度达到阈值后开启投票
   * 结构：{
   *   id, topicId, title, description, options: [{id, label, count}],
   *   status: 'pending'|'voting'|'ended', startTime, endTime,
   *   voters: [{userId, optionId, voteTime, room, area}],
   *   totalOwners, totalArea, result, passCondition
   * }
   */
  function getForumVotes() {
    var list = get('forum_votes');
    if (list && Array.isArray(list) && list.length > 0) return list;
    seedForumVotes();
    return get('forum_votes');
  }
  function setForumVotes(list) {
    set('forum_votes', Array.isArray(list) ? list : []);
  }
  function addForumVote(item) {
    var list = getForumVotes().slice();
    if (!item.id) item.id = 'fvote_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.createTime = item.createTime || new Date().toISOString();
    item.status = item.status || 'pending';
    item.voters = item.voters || [];
    if (item.options) {
      item.options.forEach(function(opt) {
        opt.count = opt.count || 0;
      });
    }
    list.unshift(item);
    setForumVotes(list, { id: item.id, action: 'add' });
    return item;
  }
  function updateForumVote(id, patch) {
    var list = getForumVotes().slice();
    var i = list.findIndex(function (v) { return v.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    setForumVotes(list, { id: id, action: 'update' });
    return list[i];
  }
  function findForumVote(id) {
    return getForumVotes().find(function(v) { return v.id === id; }) || null;
  }
  function getForumVoteByTopic(topicId) {
    return getForumVotes().find(function(v) { return v.topicId === topicId; }) || null;
  }
  function castForumVote(voteId, userId, optionId, userInfo) {
    var vote = findForumVote(voteId);
    if (!vote || vote.status !== 'voting') return { success: false, message: '投票未开放或已结束' };
    var alreadyVoted = vote.voters.some(function(v) { return v.userId === userId; });
    if (alreadyVoted) return { success: false, message: '您已参与投票' };
    var option = vote.options.find(function(o) { return o.id === optionId; });
    if (!option) return { success: false, message: '选项不存在' };
    vote.voters.push({
      userId: userId,
      optionId: optionId,
      voteTime: new Date().toISOString(),
      room: userInfo.room,
      area: userInfo.area
    });
    option.count = (option.count || 0) + 1;
    updateForumVote(voteId, { voters: vote.voters, options: vote.options });
    addLog({ type: 'forum_vote_cast', voteId: voteId, userId: userId, optionId: optionId, time: new Date().toISOString() });
    return { success: true, message: '投票成功' };
  }
  function checkAndEnableVoting(topicId) {
    var topic = findForumTopic(topicId);
    if (!topic || topic.voteEnabled) return false;
    var hotScore = topic.hotScore || 0;
    var participantCount = topic.participantCount || 0;
    var threshold = { hotScore: 50, participantCount: 20 };
    if (hotScore >= threshold.hotScore || participantCount >= threshold.participantCount) {
      updateForumTopic(topicId, { voteEnabled: true, status: 'voting' });
      var vote = addForumVote({
        topicId: topicId,
        title: topic.title,
        description: topic.summary,
        options: [
          { id: 'agree', label: '同意', count: 0 },
          { id: 'disagree', label: '反对', count: 0 },
          { id: 'abstain', label: '弃权', count: 0 }
        ],
        status: 'voting',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalOwners: 100,
        totalArea: 10000,
        passCondition: '双过半'
      });
      updateForumTopic(topicId, { voteId: vote.id });
      return true;
    }
    return false;
  }

  /**
   * 热门问题：业主端提交的问题，可转化为热门议题
   * 结构：{
   *   id, title, description, category, urgency,
   *   author: { id, name, room }, createTime,
   *   status: 'pending'|'reviewing'|'converted'|'rejected',
   *   likeCount, likedBy: [], convertedToTopic: false, topicId
   * }
   */
  function getHotQuestions() {
    var list = get('hot_questions');
    if (list && Array.isArray(list)) return list;
    set('hot_questions', []);
    return [];
  }
  function setHotQuestions(list) {
    set('hot_questions', Array.isArray(list) ? list : []);
  }
  function addHotQuestion(item) {
    var list = getHotQuestions().slice();
    if (!item.id) item.id = 'hq_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.createTime = item.createTime || new Date().toISOString();
    item.status = item.status || 'pending';
    item.likeCount = item.likeCount || 0;
    item.likedBy = item.likedBy || [];
    item.convertedToTopic = item.convertedToTopic || false;
    list.unshift(item);
    setHotQuestions(list, { id: item.id, action: 'add' });
    addLog({ type: 'hot_question_add', questionId: item.id, title: item.title, time: new Date().toISOString() });
    return item;
  }
  function updateHotQuestion(id, patch) {
    var list = getHotQuestions().slice();
    var i = list.findIndex(function (q) { return q.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    setHotQuestions(list, { id: id, action: 'update' });
    return list[i];
  }
  function findHotQuestion(id) {
    return getHotQuestions().find(function(q) { return q.id === id; }) || null;
  }
  function convertQuestionToTopic(questionId) {
    var question = findHotQuestion(questionId);
    if (!question || question.convertedToTopic) return null;
    var topic = addForumTopic({
      title: question.title,
      summary: question.description,
      category: question.category,
      sourceType: 'question',
      sourceQuestionId: questionId,
      participants: [{ id: question.author.id, name: question.author.name, room: question.author.room }],
      status: 'active'
    });
    updateHotQuestion(questionId, { convertedToTopic: true, topicId: topic.id, status: 'converted' });
    addLog({ type: 'question_to_topic', questionId: questionId, topicId: topic.id, time: new Date().toISOString() });
    return topic;
  }

  /**
   * 论坛操作日志
   * 结构：{ id, type, userId, action, targetId, targetType, detail, createTime }
   */
  function getForumLogs() {
    var list = get('forum_logs');
    if (list && Array.isArray(list)) return list;
    set('forum_logs', []);
    return [];
  }
  function addForumLog(entry) {
    var list = getForumLogs().slice();
    if (!entry.id) entry.id = 'flog_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    entry.createTime = entry.createTime || new Date().toISOString();
    list.unshift(entry);
    if (list.length > 1000) list.length = 1000;
    set('forum_logs', list);
  }

  /**
   * 论坛通知：通知参与讨论的业主有新议题生成
   * 结构：{ id, topicId, topicTitle, notifiedUsers: [], createTime, read: false }
   */
  function getForumNotifications() {
    var list = get('forum_notifications');
    if (list && Array.isArray(list)) return list;
    set('forum_notifications', []);
    return [];
  }
  function setForumNotifications(list) {
    set('forum_notifications', Array.isArray(list) ? list : []);
  }
  function addForumNotification(item) {
    var list = getForumNotifications().slice();
    if (!item.id) item.id = 'fn_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.createTime = item.createTime || new Date().toISOString();
    item.read = false;
    list.unshift(item);
    setForumNotifications(list, { id: item.id, action: 'add' });
    return item;
  }
  function markForumNotificationRead(id) {
    var list = getForumNotifications().slice();
    var i = list.findIndex(function(n) { return n.id === id; });
    if (i !== -1) {
      list[i].read = true;
      setForumNotifications(list);
    }
    return list[i] || null;
  }
  function getUnreadForumNotifications(userId) {
    return getForumNotifications().filter(function(n) {
      return !n.read && n.notifiedUsers && n.notifiedUsers.indexOf(userId) !== -1;
    });
  }

  /**
   * 临时业主大会建议：议事厅投票参与人数≥20%时由系统推送至业委会与社区
   */
  function getTempMeetingSuggestions() {
    var list = get('temp_meeting_suggestions');
    if (list && Array.isArray(list)) return list;
    seedTempMeetingSuggestions();
    return get('temp_meeting_suggestions');
  }
  function setTempMeetingSuggestions(list) {
    set('temp_meeting_suggestions', Array.isArray(list) ? list : []);
  }
  function addTempMeetingSuggestion(item) {
    var list = getTempMeetingSuggestions().slice();
    if (!item.id) item.id = 'tm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    list.unshift(item);
    setTempMeetingSuggestions(list);
    return item;
  }
  function updateTempMeetingSuggestion(id, patch) {
    var list = getTempMeetingSuggestions().slice();
    var i = list.findIndex(function (s) { return s.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    setTempMeetingSuggestions(list);
    return list[i];
  }
  function findTempMeetingSuggestion(id) {
    return getTempMeetingSuggestions().find(function (s) { return s.id === id; }) || null;
  }

  /**
   * 不合规/违法通报：业委会、物业的不合规违法行为通报至社区端
   */
  function getComplianceNotices() {
    var list = get('compliance_notices');
    if (list && Array.isArray(list)) return list;
    seedComplianceNotices();
    return get('compliance_notices');
  }
  function setComplianceNotices(list) {
    set('compliance_notices', Array.isArray(list) ? list : []);
  }
  function addComplianceNotice(item) {
    var list = getComplianceNotices().slice();
    if (!item.id) item.id = 'cn_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    list.unshift(item);
    setComplianceNotices(list);
    return item;
  }
  function updateComplianceNotice(id, patch) {
    var list = getComplianceNotices().slice();
    var i = list.findIndex(function (n) { return n.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    setComplianceNotices(list);
    return list[i];
  }

  /**
   * 社区投诉建议数据：AI端从业主端投诉建议中筛选后推送至社区端
   * 仅包含与社区管理直接相关的内容
   * 结构：{
   *   id, sourceId, type: 'complaint'|'suggestion', category, title, content, 
   *   community, communityId, submitter: { name, room, contact },
   *   status: 'pending'|'processing'|'resolved'|'closed',
   *   priority: 'high'|'medium'|'low',
   *   aiAnalysis: { summary, suggestedAction, relatedLaws, riskLevel },
   *   pushTime, receivedTime, updateTime, 
   *   attachments: [], handler: { name, role }, handleResult, 
   *   traceLogs: []
   * }
   */
  function getCommunityComplaints() {
    var list = get('community_complaints');
    if (list && Array.isArray(list)) return list;
    seedCommunityComplaints();
    return get('community_complaints');
  }
  function setCommunityComplaints(list) {
    set('community_complaints', Array.isArray(list) ? list : []);
  }
  function addCommunityComplaint(item) {
    var list = getCommunityComplaints().slice();
    if (!item.id) item.id = 'cc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.pushTime = item.pushTime || new Date().toISOString();
    item.receivedTime = item.receivedTime || new Date().toISOString();
    item.status = item.status || 'pending';
    list.unshift(item);
    setCommunityComplaints(list, { id: item.id, action: 'add' });
    return item;
  }
  function updateCommunityComplaint(id, patch) {
    var list = getCommunityComplaints().slice();
    var i = list.findIndex(function (c) { return c.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    list[i].updateTime = new Date().toISOString();
    setCommunityComplaints(list, { id: id, action: 'update' });
    return list[i];
  }
  function findCommunityComplaint(id) {
    return getCommunityComplaints().find(function (c) { return c.id === id; }) || null;
  }
  function seedCommunityComplaints() {
    var now = Date.now();
    var list = [
      {
        id: 'cc_demo_1',
        sourceId: 'ticket_001',
        type: 'complaint',
        category: '环境卫生',
        title: '小区垃圾分类点设置不合理',
        content: '小区垃圾分类点设置在居民楼正下方，夏季异味严重，影响低层住户生活。建议将分类点移至小区边缘空地。',
        community: '江上花园',
        communityId: 'js-garden',
        submitter: { name: '张先生', room: '1栋101', contact: '138****1234' },
        status: 'pending',
        priority: 'medium',
        aiAnalysis: { 
          summary: '涉及公共设施选址问题，需社区协调物业、业委会与业主代表共同协商解决', 
          suggestedAction: '组织现场勘查会议', 
          relatedLaws: ['《民法典》第274条', '《物业管理条例》第45条'], 
          riskLevel: 'medium' 
        },
        pushTime: new Date(now - 2 * 3600000).toISOString(),
        receivedTime: new Date(now - 2 * 3600000).toISOString(),
        attachments: [
          { name: '现场照片1.jpg', url: '#' },
          { name: '现场照片2.jpg', url: '#' }
        ],
        traceLogs: []
      },
      {
        id: 'cc_demo_2',
        sourceId: 'ticket_002',
        type: 'suggestion',
        category: '公共安全',
        title: '建议增设小区周边减速带与警示标识',
        content: '小区门口道路车速较快，存在安全隐患。建议在小区出入口增设减速带和警示标识，保障居民出行安全。',
        community: '阳光小区',
        communityId: 'sunshine',
        submitter: { name: '李女士', room: '2栋502', contact: '139****5678' },
        status: 'processing',
        priority: 'high',
        aiAnalysis: { 
          summary: '涉及道路交通安全，需社区协调交管部门处理', 
          suggestedAction: '联系交警部门现场评估', 
          relatedLaws: ['《道路交通安全法》第25条'], 
          riskLevel: 'high' 
        },
        pushTime: new Date(now - 24 * 3600000).toISOString(),
        receivedTime: new Date(now - 24 * 3600000).toISOString(),
        updateTime: new Date(now - 12 * 3600000).toISOString(),
        handler: { name: '王专员', role: '社区治理专员' },
        attachments: [],
        traceLogs: [
          { time: new Date(now - 12 * 3600000).toISOString(), action: '已联系交警部门', operator: '王专员' }
        ]
      },
      {
        id: 'cc_demo_3',
        sourceId: 'ticket_003',
        type: 'complaint',
        category: '物业服务',
        title: '物业保洁服务不到位',
        content: '小区公共区域清洁不及时，楼道、电梯间经常有垃圾堆积，物业保洁人员工作态度敷衍。',
        community: '幸福里',
        communityId: 'happiness',
        submitter: { name: '王先生', room: '3栋301', contact: '137****9012' },
        status: 'resolved',
        priority: 'low',
        aiAnalysis: { 
          summary: '物业服务履约问题，建议社区督促物业整改', 
          suggestedAction: '约谈物业负责人', 
          relatedLaws: ['《物业管理条例》第35条'], 
          riskLevel: 'low' 
        },
        pushTime: new Date(now - 72 * 3600000).toISOString(),
        receivedTime: new Date(now - 72 * 3600000).toISOString(),
        updateTime: new Date(now - 24 * 3600000).toISOString(),
        handler: { name: '张专员', role: '社区治理专员' },
        handleResult: '已约谈物业负责人，物业承诺加强保洁管理，增加清洁频次',
        attachments: [],
        traceLogs: [
          { time: new Date(now - 48 * 3600000).toISOString(), action: '约谈物业负责人', operator: '张专员' },
          { time: new Date(now - 24 * 3600000).toISOString(), action: '物业提交整改方案', operator: '物业经理' }
        ]
      },
      {
        id: 'cc_demo_4',
        sourceId: 'ticket_004',
        type: 'suggestion',
        category: '邻里纠纷',
        title: '建议协调解决邻里噪音纠纷',
        content: '楼上住户深夜制造噪音，多次沟通无效，严重影响正常生活。希望社区出面协调解决。',
        community: '江上花园',
        communityId: 'js-garden',
        submitter: { name: '陈女士', room: '5栋202', contact: '136****3456' },
        status: 'pending',
        priority: 'medium',
        aiAnalysis: { 
          summary: '邻里纠纷调解事项，需社区介入协调', 
          suggestedAction: '安排调解会议', 
          relatedLaws: ['《民法典》第288条', '《治安管理处罚法》第58条'], 
          riskLevel: 'medium' 
        },
        pushTime: new Date(now - 4 * 3600000).toISOString(),
        receivedTime: new Date(now - 4 * 3600000).toISOString(),
        attachments: [],
        traceLogs: []
      },
      {
        id: 'cc_demo_5',
        sourceId: 'ticket_005',
        type: 'complaint',
        category: '公共设施',
        title: '小区健身器材损坏长期未维修',
        content: '小区健身区域的器材多处损坏，存在安全隐患，已向物业反映多次但至今未修复。',
        community: '阳光小区',
        communityId: 'sunshine',
        submitter: { name: '刘大爷', room: '4栋102', contact: '135****7890' },
        status: 'processing',
        priority: 'medium',
        aiAnalysis: { 
          summary: '公共设施维护问题，涉及居民安全', 
          suggestedAction: '督促物业限期整改', 
          relatedLaws: ['《物业管理条例》第35条', '《民法典》第1198条'], 
          riskLevel: 'medium' 
        },
        pushTime: new Date(now - 48 * 3600000).toISOString(),
        receivedTime: new Date(now - 48 * 3600000).toISOString(),
        updateTime: new Date(now - 24 * 3600000).toISOString(),
        handler: { name: '王专员', role: '社区治理专员' },
        attachments: [
          { name: '器材损坏照片.jpg', url: '#' }
        ],
        traceLogs: [
          { time: new Date(now - 24 * 3600000).toISOString(), action: '已通知物业整改', operator: '王专员' }
        ]
      }
    ];
    setCommunityComplaints(list);
  }

  /**
   * 社区端跟踪记录持久化存储
   * 包括：风险处理记录、临时业主大会跟踪记录、通报跟踪记录、归档日志
   */
  function getCommunityTraceLogs(type) {
    var list = get('community_trace_logs_' + type);
    return list && Array.isArray(list) ? list : {};
  }
  function setCommunityTraceLogs(type, logs) {
    set('community_trace_logs_' + type, logs || {}, { action: 'update', type: type });
  }
  function addCommunityTraceLog(type, id, log) {
    var logs = getCommunityTraceLogs(type);
    if (!logs[id]) logs[id] = [];
    log.time = log.time || new Date().toISOString().slice(0, 19).replace('T', ' ');
    logs[id].push(log);
    setCommunityTraceLogs(type, logs);
    return log;
  }
  function getCommunityTraceLogsById(type, id) {
    var logs = getCommunityTraceLogs(type);
    return logs[id] || [];
  }

  /**
   * 社区端归档日志持久化存储
   */
  function getCommunityArchiveLogs() {
    var list = get('community_archive_logs');
    return list && Array.isArray(list) ? list : [];
  }
  function setCommunityArchiveLogs(list) {
    set('community_archive_logs', Array.isArray(list) ? list : [], { action: 'update' });
  }
  function addCommunityArchiveLog(log) {
    var list = getCommunityArchiveLogs().slice();
    log.time = log.time || new Date().toISOString().slice(0, 19).replace('T', ' ');
    list.unshift(log);
    if (list.length > 500) list = list.slice(0, 500);
    setCommunityArchiveLogs(list);
    return log;
  }

  /**
   * 履约提醒持久化存储
   */
  function getContractReminders() {
    var list = get('contract_reminders');
    return list && Array.isArray(list) ? list : [];
  }
  function setContractReminders(list) {
    set('contract_reminders', Array.isArray(list) ? list : [], { action: 'update' });
  }
  function addContractReminder(item) {
    var list = getContractReminders().slice();
    if (!item.id) item.id = 'cr_' + Date.now();
    item.createTime = item.createTime || new Date().toISOString();
    list.unshift(item);
    setContractReminders(list);
    return item;
  }
  function updateContractReminder(id, patch) {
    var list = getContractReminders().slice();
    var i = list.findIndex(function(r) { return r.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    setContractReminders(list);
    return list[i];
  }
  function deleteContractReminder(id) {
    var list = getContractReminders().slice();
    var i = list.findIndex(function(r) { return r.id === id; });
    if (i === -1) return false;
    list.splice(i, 1);
    setContractReminders(list);
    return true;
  }

  /**
   * 政策推送记录持久化存储
   */
  function getPolicyPushRecords() {
    var list = get('policy_push_records');
    return list && Array.isArray(list) ? list : [];
  }
  function setPolicyPushRecords(list) {
    set('policy_push_records', Array.isArray(list) ? list : [], { action: 'update' });
  }
  function addPolicyPushRecord(item) {
    var list = getPolicyPushRecords().slice();
    if (!item.id) item.id = 'ppr_' + Date.now();
    item.createTime = item.createTime || new Date().toISOString();
    list.unshift(item);
    setPolicyPushRecords(list);
    return item;
  }
  function updatePolicyPushRecord(id, patch) {
    var list = getPolicyPushRecords().slice();
    var i = list.findIndex(function(r) { return r.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    setPolicyPushRecords(list);
    return list[i];
  }
  function deletePolicyPushRecord(id) {
    var list = getPolicyPushRecords().slice();
    var i = list.findIndex(function(r) { return r.id === id; });
    if (i === -1) return false;
    list.splice(i, 1);
    setPolicyPushRecords(list);
    return true;
  }

  /**
   * 社区端研判结果推送记录
   */
  function getJudgmentPushRecords() {
    var list = get('judgment_push_records');
    return list && Array.isArray(list) ? list : [];
  }
  function addJudgmentPushRecord(item) {
    var list = getJudgmentPushRecords().slice();
    if (!item.id) item.id = 'jpr_' + Date.now();
    item.createTime = new Date().toISOString();
    list.unshift(item);
    set('judgment_push_records', list);
    return item;
  }

  /**
   * 辖区小区列表：社区下辖多个小区
   */
  function getCommunities() {
    var list = get('communities');
    if (list && Array.isArray(list)) return list;
    seedCommunities();
    return get('communities');
  }
  function setCommunities(list) {
    set('communities', Array.isArray(list) ? list : []);
  }

  /**
   * 业委会工作报表：业委会端创建、编辑、发布，业主端社区动态展示
   * 结构：{
   *   id, type: 'monthly'|'quarterly'|'annual', period, status: 'draft'|'submitted'|'published',
   *   autoData: { tickets, evaluations, performance, maintenanceFund, meetings, votes },
   *   manualData: { summary, achievements, plans, notes },
   *   publishConfig: { showInOwnerApp, displayDuration, publishTime, expireTime },
   *   createTime, updateTime, creator, version
   * }
   */
  function getWorkReports() {
    var list = get('work_reports');
    if (list && Array.isArray(list)) return list;
    set('work_reports', []);
    return [];
  }
  function setWorkReports(list) {
    set('work_reports', Array.isArray(list) ? list : []);
  }
  function addWorkReport(item) {
    var list = getWorkReports().slice();
    if (!item.id) item.id = 'report_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.createTime = item.createTime || new Date().toISOString();
    item.updateTime = item.createTime;
    item.version = 1;
    list.unshift(item);
    setWorkReports(list);
    return item;
  }
  function updateWorkReport(id, patch) {
    var list = getWorkReports().slice();
    var i = list.findIndex(function (r) { return r.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    list[i].updateTime = new Date().toISOString();
    list[i].version = (list[i].version || 1) + 1;
    setWorkReports(list);
    return list[i];
  }
  function findWorkReport(id) {
    return getWorkReports().find(function (r) { return r.id === id; }) || null;
  }
  function deleteWorkReport(id) {
    var list = getWorkReports().slice();
    var i = list.findIndex(function (r) { return r.id === id; });
    if (i === -1) return false;
    list.splice(i, 1);
    setWorkReports(list);
    return true;
  }
  function getPublishedWorkReports() {
    var list = getWorkReports();
    var now = Date.now();
    return list.filter(function (r) {
      if (r.status !== 'published' || !r.publishConfig || !r.publishConfig.showInOwnerApp) return false;
      if (r.publishConfig.displayDuration === 0) return true;
      if (r.publishConfig.expireTime && new Date(r.publishConfig.expireTime).getTime() < now) return false;
      return true;
    });
  }
  function setWorkReportDisplayConfig(config) {
    set('work_report_display_config', config || {});
  }

  /**
   * 众包任务管理：业委会端创建，业主端展示和认领
   * 结构：{
   *   id, name, type, description, requirements, 
   *   points (奖励积分), deadline, 
   *   status: 'pending'|'confirmed'|'dispatched'|'in_progress'|'completed'|'cancelled',
   *   createTime, publishTime, updateTime,
   *   creator: { id, name, role },
   *   subTasks: [{ id, name, description, status, assignee, points }],
   *   participants: [{ id, name, room, joinTime, status, pointsEarned }],
   *   maxParticipants, currentParticipants,
   *   category, tags, priority
   * }
   */
  function normalizeCrowdTaskStoreId(tOrRaw) {
    var v = typeof tOrRaw === 'object' && tOrRaw !== null && !Array.isArray(tOrRaw)
      ? (tOrRaw.id != null ? tOrRaw.id : tOrRaw.taskId)
      : tOrRaw;
    var s = String(v == null ? '' : v).trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
    try {
      if (typeof s.normalize === 'function') s = s.normalize('NFC');
    } catch (e) {}
    return s;
  }
  function getCrowdTasks() {
    var list = get('crowd_tasks');
    if (list && Array.isArray(list)) {
      // 空数组是合法状态：勿反复 seed + set + 广播，否则多端订阅会与 computed 形成更新风暴
      if (list.length === 0) {
        return list;
      }
      var seen = new Set();
      var out = [];
      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        if (!t || typeof t !== 'object') continue;
        var nid = normalizeCrowdTaskStoreId(t);
        if (!nid) continue;
        if (seen.has(nid)) continue;
        seen.add(nid);
        out.push(t);
      }
      if (out.length !== list.length) {
        setCrowdTasks(out, { action: 'dedupe_by_norm_id', before: list.length, after: out.length });
      }
      return out;
    }
    seedCrowdTasks();
    return get('crowd_tasks');
  }
  function setCrowdTasks(list, detail) {
    set('crowd_tasks', Array.isArray(list) ? list : [], detail);
  }
  function seedCrowdTasks() {
    var now = Date.now();
    var list = [];
    setCrowdTasks(list);
    addLog({ 
      type: 'data_cleanup', 
      action: 'clear_crowd_tasks', 
      message: '已清理所有虚拟众包任务数据', 
      clearedCount: 4,
      operator: 'system',
      time: new Date().toISOString() 
    });
  }
  function addCrowdTask(item) {
    var list = getCrowdTasks().slice();
    if (!item.id) item.id = 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    var newNorm = normalizeCrowdTaskStoreId(item);
    var existingIndex = list.findIndex(function(t) {
      if (t.id === item.id) return true;
      return newNorm && normalizeCrowdTaskStoreId(t) === newNorm;
    });
    if (existingIndex !== -1) {
      for (var k in item) if (item.hasOwnProperty(k)) list[existingIndex][k] = item[k];
      list[existingIndex].updateTime = new Date().toISOString();
      setCrowdTasks(list, { id: item.id, action: 'update' });
      addLog({ type: 'crowd_task_update', taskId: item.id, taskName: item.name, creator: item.creator, time: new Date().toISOString() });
      return list[existingIndex];
    }
    var alreadyExists = list.some(function(t) {
      if (t.id === item.id) return true;
      return newNorm && normalizeCrowdTaskStoreId(t) === newNorm;
    });
    if (alreadyExists) {
      console.log('[addCrowdTask] 任务已存在，跳过添加:', item.id);
      return list.find(function(t) {
        if (t.id === item.id) return true;
        return newNorm && normalizeCrowdTaskStoreId(t) === newNorm;
      });
    }
    item.createTime = item.createTime || new Date().toISOString();
    item.updateTime = item.createTime;
    item.status = item.status || 'pending';
    item.subTasks = item.subTasks || [];
    item.participants = item.participants || [];
    item.currentParticipants = 0;
    list.unshift(item);
    setCrowdTasks(list, { id: item.id, action: 'add' });
    addLog({ type: 'crowd_task_add', taskId: item.id, taskName: item.name, creator: item.creator, time: new Date().toISOString() });
    return item;
  }
  function updateCrowdTask(id, patch) {
    var list = getCrowdTasks().slice();
    var i = list.findIndex(function(t) { return t.id === id; });
    if (i === -1) {
      var key = normalizeCrowdTaskStoreId(id);
      if (key) i = list.findIndex(function(t) { return normalizeCrowdTaskStoreId(t) === key; });
    }
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    list[i].updateTime = new Date().toISOString();
    setCrowdTasks(list, { id: id, action: 'update' });
    return list[i];
  }
  function findCrowdTask(id) {
    var list = getCrowdTasks();
    var direct = list.find(function(t) { return t.id === id; });
    if (direct) return direct;
    var key = normalizeCrowdTaskStoreId(id);
    if (!key) return null;
    return list.find(function(t) { return normalizeCrowdTaskStoreId(t) === key; }) || null;
  }
  function deleteCrowdTask(id) {
    var list = getCrowdTasks().slice();
    var i = list.findIndex(function(t) { return t.id === id; });
    if (i === -1) {
      var key = normalizeCrowdTaskStoreId(id);
      if (key) i = list.findIndex(function(t) { return normalizeCrowdTaskStoreId(t) === key; });
    }
    if (i === -1) return false;
    list.splice(i, 1);
    setCrowdTasks(list);
    return true;
  }
  function getDispatchedCrowdTasks() {
    var now = new Date();
    var allTasks = getCrowdTasks();
    var seenIds = new Set();
    var needsUpdate = false;
    var result = allTasks.filter(function(t) {
      if (t.status === 'cancelled' || t.status === 'completed') return false;
      if (t.deadline && new Date(t.deadline) < now) {
        if (t.status !== 'overdue') {
          t.status = 'overdue';
          needsUpdate = true;
        }
        return false;
      }
      var isValid = t.status === 'dispatched' || t.status === 'in_progress';
      if (isValid) {
        var normId = normalizeCrowdTaskStoreId(t);
        if (!normId) return false;
        if (seenIds.has(normId)) return false;
        seenIds.add(normId);
        return true;
      }
      return false;
    });
    if (needsUpdate) {
      setCrowdTasks(allTasks);
    }
    return result;
  }
  function joinCrowdTask(taskId, userId, userInfo) {
    var task = findCrowdTask(taskId);
    if (!task) return { success: false, message: '任务不存在' };
    if (task.status !== 'dispatched' && task.status !== 'in_progress') return { success: false, message: '任务未开放认领' };
    if (task.deadline && new Date(task.deadline) < new Date()) return { success: false, message: '任务已截止' };
    if (task.recruitmentEnded) return { success: false, message: '任务招人已结束' };
    var alreadyJoined = task.participants.some(function(p) { return p.id === userId; });
    if (alreadyJoined) return { success: false, message: '您已参与此任务' };
    var newParticipant = {
      id: userId,
      name: userInfo.name,
      room: userInfo.room,
      joinTime: new Date().toISOString(),
      status: 'active',
      pointsEarned: 0
    };
    var newStatus = task.status === 'dispatched' ? 'in_progress' : task.status;
    var patch = {
      participants: task.participants.concat([newParticipant]),
      currentParticipants: task.participants.length + 1,
      status: newStatus,
      updateTime: new Date().toISOString()
    };
    updateCrowdTask(taskId, patch);
    addLog({ type: 'crowd_task_join', taskId: taskId, userId: userId, time: new Date().toISOString() });
    return { success: true, message: '成功参与任务', task: findCrowdTask(taskId) };
  }
  function claimSubTask(taskId, subTaskId, userId, userInfo) {
    var task = findCrowdTask(taskId);
    if (!task) return { success: false, message: '任务不存在' };
    var subTask = task.subTasks.find(function(s) { return s.id === subTaskId; });
    if (!subTask) return { success: false, message: '子任务不存在' };
    if (subTask.assignee) return { success: false, message: '子任务已被认领' };
    subTask.assignee = { id: userId, name: userInfo.name, room: userInfo.room };
    subTask.status = 'in_progress';
    var alreadyParticipant = task.participants.some(function(p) { return p.id === userId; });
    if (!alreadyParticipant) {
      task.participants.push({
        id: userId,
        name: userInfo.name,
        room: userInfo.room,
        joinTime: new Date().toISOString(),
        status: 'active',
        pointsEarned: 0
      });
      task.currentParticipants = task.participants.length;
    }
    if (task.status === 'dispatched') task.status = 'in_progress';
    updateCrowdTask(taskId, task);
    addLog({ type: 'crowd_subtask_claim', taskId: taskId, subTaskId: subTaskId, userId: userId, time: new Date().toISOString() });
    return { success: true, message: '成功认领子任务', subTask: subTask };
  }
  function completeSubTask(taskId, subTaskId, userId) {
    var task = findCrowdTask(taskId);
    if (!task) return { success: false, message: '任务不存在' };
    var subTask = task.subTasks.find(function(s) { return s.id === subTaskId; });
    if (!subTask) return { success: false, message: '子任务不存在' };
    if (!subTask.assignee || subTask.assignee.id !== userId) return { success: false, message: '您未认领此子任务' };
    subTask.status = 'completed';
    var participant = task.participants.find(function(p) { return p.id === userId; });
    if (participant) participant.pointsEarned = (participant.pointsEarned || 0) + (subTask.points || 0);
    var allCompleted = task.subTasks.every(function(s) { return s.status === 'completed'; });
    if (allCompleted) task.status = 'completed';
    updateCrowdTask(taskId, task);
    addLog({ type: 'crowd_subtask_complete', taskId: taskId, subTaskId: subTaskId, userId: userId, points: subTask.points, time: new Date().toISOString() });
    return { success: true, message: '子任务已完成', points: subTask.points };
  }

  function endCrowdTaskRecruitment(taskId, operatorInfo) {
    var task = findCrowdTask(taskId);
    if (!task) return { success: false, message: '任务不存在' };
    if (task.recruitmentEnded) return { success: false, message: '招人已结束' };
    task.recruitmentEnded = true;
    task.recruitmentEndTime = new Date().toISOString();
    task.recruitmentEndType = 'manual';
    if (operatorInfo) {
      task.recruitmentEndedBy = operatorInfo;
    }
    updateCrowdTask(taskId, task);
    addLog({ 
      type: 'crowd_task_recruitment_end', 
      taskId: taskId, 
      endType: 'manual',
      operator: operatorInfo,
      time: new Date().toISOString() 
    });
    return { success: true, message: '招人已结束', task: task };
  }

  function checkCrowdTaskRecruitmentDeadline() {
    var tasks = getCrowdTasks();
    var now = new Date();
    var updated = false;
    tasks.forEach(function(task) {
      if (!task.recruitmentEnded && task.recruitmentDeadline && new Date(task.recruitmentDeadline) <= now) {
        if (task.status === 'dispatched' || task.status === 'in_progress') {
          task.recruitmentEnded = true;
          task.recruitmentEndTime = new Date().toISOString();
          task.recruitmentEndType = 'auto';
          updated = true;
          addLog({ 
            type: 'crowd_task_recruitment_end', 
            taskId: task.id, 
            endType: 'auto',
            time: new Date().toISOString() 
          });
        }
      }
    });
    if (updated) {
      setCrowdTasks(tasks);
    }
    return updated;
  }

  function getRecruitmentEndedTasks() {
    return getCrowdTasks().filter(function(t) {
      return t.recruitmentEnded === true;
    });
  }

  /**
   * 众包任务论坛主题：业委会发布任务时自动创建论坛主题
   * 结构：{
   *   id, taskId, title, content, category: '众包任务',
   *   status: '进行中'|'已完成', deadline, points,
   *   subTasks: [], submissions: [],
   *   views, likes, replies, createTime, updateTime
   * }
   */
  function getCrowdTaskTopics() {
    var list = get('crowd_task_topics');
    if (list && Array.isArray(list)) return list;
    return [];
  }
  function getCrowdTaskTopicsForOwnerFeed() {
    var allTopics = getCrowdTaskTopics();
    var seenTaskIds = new Set();
    return allTopics.filter(function(topic) {
      if (topic.status === '已完成') return false;
      if (seenTaskIds.has(topic.taskId)) return false;
      seenTaskIds.add(topic.taskId);
      return true;
    });
  }
  function setCrowdTaskTopics(list, detail) {
    set('crowd_task_topics', Array.isArray(list) ? list : [], detail);
  }
  function addCrowdTaskTopic(item) {
    var list = getCrowdTaskTopics().slice();
    if (!item.id) item.id = 'ct_topic_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.createTime = item.createTime || new Date().toISOString();
    item.updateTime = item.createTime;
    item.views = item.views || 0;
    item.likes = item.likes || 0;
    item.replies = item.replies || 0;
    item.status = item.status || '进行中';
    item.category = '众包任务';
    item.submissions = item.submissions || [];
    list.unshift(item);
    setCrowdTaskTopics(list, { id: item.id, action: 'add' });
    addLog({ type: 'crowd_task_topic_add', topicId: item.id, taskId: item.taskId, title: item.title, time: new Date().toISOString() });
    return item;
  }
  function updateCrowdTaskTopic(id, patch) {
    var list = getCrowdTaskTopics().slice();
    var i = list.findIndex(function(t) { return t.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    list[i].updateTime = new Date().toISOString();
    setCrowdTaskTopics(list, { id: id, action: 'update' });
    return list[i];
  }
  function findCrowdTaskTopic(id) {
    return getCrowdTaskTopics().find(function(t) { return t.id === id; }) || null;
  }
  function findCrowdTaskTopicByTaskId(taskId) {
    return getCrowdTaskTopics().find(function(t) { return t.taskId === taskId; }) || null;
  }
  function addCrowdTaskSubmission(topicId, submission) {
    var topic = findCrowdTaskTopic(topicId);
    if (!topic) return null;
    if (!topic.submissions) topic.submissions = [];
    submission.id = submission.id || 'sub_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    submission.submitTime = submission.submitTime || new Date().toISOString();
    submission.status = submission.status || '待审核';
    topic.submissions.push(submission);
    topic.updateTime = new Date().toISOString();
    topic.replies = topic.submissions.length;
    updateCrowdTaskTopic(topicId, topic);
    addLog({ type: 'crowd_task_submission_add', topicId: topicId, submissionId: submission.id, submitter: submission.owner, time: new Date().toISOString() });
    return submission;
  }
  function updateCrowdTaskSubmission(topicId, submissionId, patch) {
    var topic = findCrowdTaskTopic(topicId);
    if (!topic || !topic.submissions) return null;
    var sub = topic.submissions.find(function(s) { return s.id === submissionId; });
    if (!sub) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) sub[k] = patch[k];
    topic.updateTime = new Date().toISOString();
    updateCrowdTaskTopic(topicId, topic);
    return sub;
  }
  function incrementCrowdTaskTopicViews(id) {
    var topic = findCrowdTaskTopic(id);
    if (!topic) return;
    topic.views = (topic.views || 0) + 1;
    updateCrowdTaskTopic(id, topic);
  }

  /**
   * 党建引领总群管理
   * 包含：群聊消息、群公告、党组织活动通知、党员认证、学习资料共享
   */
  
  /**
   * 党建群聊消息
   * 结构：{
   *   id, groupId, from: { id, name, avatar, role, isPartyMember },
   *   type: 'text'|'image'|'file'|'system',
   *   content, timestamp, isSelf, read: false,
   *   replyTo: { id, from, content } (可选)
   * }
   */
  function getPartyGroupMessages() {
    var list = get('party_group_messages');
    if (list && Array.isArray(list)) return list;
    seedPartyGroupMessages();
    return get('party_group_messages');
  }
  function setPartyGroupMessages(list, detail) {
    set('party_group_messages', Array.isArray(list) ? list : [], detail);
  }
  function addPartyGroupMessage(item) {
    var list = getPartyGroupMessages().slice();
    if (!item.id) item.id = 'pgm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.timestamp = item.timestamp || Date.now();
    item.read = item.read || false;
    list.unshift(item);
    setPartyGroupMessages(list, { id: item.id, action: 'add' });
    return item;
  }
  function markPartyGroupMessageRead(id) {
    var list = getPartyGroupMessages().slice();
    var msg = list.find(function(m) { return m.id === id; });
    if (msg) {
      msg.read = true;
      setPartyGroupMessages(list, { id: id, action: 'read' });
    }
    return msg;
  }
  function getUnreadPartyGroupMessages(userId) {
    return getPartyGroupMessages().filter(function(m) {
      return !m.read && (!m.from || m.from.id !== userId);
    });
  }
  function seedPartyGroupMessages() {
    var now = Date.now();
    var list = [
      {
        id: 'pgm_welcome',
        groupId: 'party_main',
        from: { id: 'system', name: '系统', avatar: '', role: 'system' },
        type: 'system',
        content: '欢迎加入党建引领总群，让我们共同学习、共同进步！',
        timestamp: now - 3600000,
        read: true
      },
      {
        id: 'pgm_demo_1',
        groupId: 'party_main',
        from: { id: 'party_secretary', name: '李书记', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=李书记', role: 'secretary', isPartyMember: true },
        type: 'text',
        content: '各位党员同志，本周六上午9点将在社区会议室召开党员学习会议，请大家准时参加。',
        timestamp: now - 1800000,
        read: true
      },
      {
        id: 'pgm_demo_2',
        groupId: 'party_main',
        from: { id: 'party_member_1', name: '张党员', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=张党员', role: 'member', isPartyMember: true },
        type: 'text',
        content: '收到，我会准时参加！',
        timestamp: now - 900000,
        read: false
      }
    ];
    setPartyGroupMessages(list);
  }

  /**
   * 党建群公告
   * 结构：{
   *   id, title, content, type: 'notice'|'activity'|'study',
   *   publisher: { id, name, role }, publishTime, expireTime,
   *   status: 'active'|'expired', priority: 'high'|'normal'|'low',
   *   readCount, pinned: false, attachments: []
   * }
   */
  function getPartyGroupAnnouncements() {
    var list = get('party_group_announcements');
    if (list && Array.isArray(list)) return list;
    seedPartyGroupAnnouncements();
    return get('party_group_announcements');
  }
  function setPartyGroupAnnouncements(list, detail) {
    set('party_group_announcements', Array.isArray(list) ? list : [], detail);
  }
  function addPartyGroupAnnouncement(item) {
    var list = getPartyGroupAnnouncements().slice();
    if (!item.id) item.id = 'pga_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.publishTime = item.publishTime || new Date().toISOString();
    item.readCount = item.readCount || 0;
    item.status = item.status || 'active';
    item.pinned = item.pinned || false;
    list.unshift(item);
    setPartyGroupAnnouncements(list, { id: item.id, action: 'add' });
    addLog({ type: 'party_announcement_add', announcementId: item.id, title: item.title, time: new Date().toISOString() });
    return item;
  }
  function updatePartyGroupAnnouncement(id, patch) {
    var list = getPartyGroupAnnouncements().slice();
    var i = list.findIndex(function(a) { return a.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    setPartyGroupAnnouncements(list, { id: id, action: 'update' });
    return list[i];
  }
  function deletePartyGroupAnnouncement(id) {
    var list = getPartyGroupAnnouncements().slice();
    var i = list.findIndex(function(a) { return a.id === id; });
    if (i === -1) return false;
    list.splice(i, 1);
    setPartyGroupAnnouncements(list, { id: id, action: 'delete' });
    return true;
  }
  function getActivePartyGroupAnnouncements() {
    var now = Date.now();
    return getPartyGroupAnnouncements().filter(function(a) {
      return a.status === 'active' && (!a.expireTime || new Date(a.expireTime).getTime() > now);
    });
  }
  function seedPartyGroupAnnouncements() {
    var now = Date.now();
    var list = [
      {
        id: 'pga_demo_1',
        title: '关于开展党员志愿服务活动的通知',
        content: '为深入推进"我为群众办实事"实践活动，社区党支部决定开展党员志愿服务活动。请各位党员同志积极报名参加，用实际行动践行初心使命。',
        type: 'activity',
        publisher: { id: 'party_secretary', name: '李书记', role: 'secretary' },
        publishTime: new Date(now - 86400000).toISOString(),
        expireTime: new Date(now + 7 * 86400000).toISOString(),
        status: 'active',
        priority: 'high',
        readCount: 45,
        pinned: true,
        attachments: []
      },
      {
        id: 'pga_demo_2',
        title: '本周学习材料：党的二十大精神学习要点',
        content: '本周学习主题为党的二十大精神，请各位党员认真学习以下材料，并在群内分享学习心得。',
        type: 'study',
        publisher: { id: 'party_org', name: '党支部', role: 'organization' },
        publishTime: new Date(now - 43200000).toISOString(),
        status: 'active',
        priority: 'normal',
        readCount: 32,
        pinned: false,
        attachments: [
          { name: '党的二十大精神学习要点.pdf', url: '#', size: '2.3MB' }
        ]
      }
    ];
    setPartyGroupAnnouncements(list);
  }

  /**
   * 党组织活动通知
   * 结构：{
   *   id, title, content, type: 'meeting'|'activity'|'training'|'volunteer',
   *   organizer: { id, name, role }, startTime, endTime, location,
   *   participants: [], maxParticipants, currentParticipants,
   *   status: 'upcoming'|'ongoing'|'completed'|'cancelled',
   *   createTime, signupDeadline, isSignedUp: false
   * }
   */
  function getPartyActivities() {
    var list = get('party_activities');
    if (list && Array.isArray(list)) return list;
    seedPartyActivities();
    return get('party_activities');
  }
  function setPartyActivities(list, detail) {
    set('party_activities', Array.isArray(list) ? list : [], detail);
  }
  function addPartyActivity(item) {
    var list = getPartyActivities().slice();
    if (!item.id) item.id = 'pa_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.createTime = item.createTime || new Date().toISOString();
    item.participants = item.participants || [];
    item.currentParticipants = item.participants.length;
    item.status = item.status || 'upcoming';
    list.unshift(item);
    setPartyActivities(list, { id: item.id, action: 'add' });
    addLog({ type: 'party_activity_add', activityId: item.id, title: item.title, time: new Date().toISOString() });
    return item;
  }
  function updatePartyActivity(id, patch) {
    var list = getPartyActivities().slice();
    var i = list.findIndex(function(a) { return a.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    setPartyActivities(list, { id: id, action: 'update' });
    return list[i];
  }
  function findPartyActivity(id) {
    return getPartyActivities().find(function(a) { return a.id === id; }) || null;
  }
  function signUpPartyActivity(activityId, userId, userInfo) {
    var activity = findPartyActivity(activityId);
    if (!activity) return { success: false, message: '活动不存在' };
    if (activity.status !== 'upcoming') return { success: false, message: '活动已开始或已结束' };
    if (activity.signupDeadline && new Date(activity.signupDeadline) < new Date()) {
      return { success: false, message: '报名已截止' };
    }
    var alreadySignedUp = activity.participants.some(function(p) { return p.id === userId; });
    if (alreadySignedUp) return { success: false, message: '您已报名此活动' };
    if (activity.maxParticipants && activity.currentParticipants >= activity.maxParticipants) {
      return { success: false, message: '报名人数已满' };
    }
    activity.participants.push({
      id: userId,
      name: userInfo.name,
      room: userInfo.room,
      signUpTime: new Date().toISOString()
    });
    activity.currentParticipants = activity.participants.length;
    updatePartyActivity(activityId, activity);
    addLog({ type: 'party_activity_signup', activityId: activityId, userId: userId, time: new Date().toISOString() });
    return { success: true, message: '报名成功', activity: activity };
  }
  function cancelPartyActivitySignUp(activityId, userId) {
    var activity = findPartyActivity(activityId);
    if (!activity) return { success: false, message: '活动不存在' };
    var idx = activity.participants.findIndex(function(p) { return p.id === userId; });
    if (idx === -1) return { success: false, message: '您未报名此活动' };
    activity.participants.splice(idx, 1);
    activity.currentParticipants = activity.participants.length;
    updatePartyActivity(activityId, activity);
    return { success: true, message: '取消报名成功' };
  }
  function getUpcomingPartyActivities() {
    var now = new Date();
    return getPartyActivities().filter(function(a) {
      return a.status === 'upcoming' && new Date(a.startTime) > now;
    });
  }
  function seedPartyActivities() {
    var now = Date.now();
    var day = 86400000;
    var list = [
      {
        id: 'pa_demo_1',
        title: '党员学习会议',
        content: '学习党的二十大精神，讨论社区党建工作计划。',
        type: 'meeting',
        organizer: { id: 'party_secretary', name: '李书记', role: 'secretary' },
        startTime: new Date(now + 2 * day).toISOString(),
        endTime: new Date(now + 2 * day + 7200000).toISOString(),
        location: '社区会议室',
        participants: [
          { id: 'party_member_1', name: '张党员', room: '1-101', signUpTime: new Date(now - 3600000).toISOString() }
        ],
        maxParticipants: 50,
        currentParticipants: 1,
        status: 'upcoming',
        createTime: new Date(now - day).toISOString(),
        signupDeadline: new Date(now + day).toISOString()
      },
      {
        id: 'pa_demo_2',
        title: '社区志愿服务活动',
        content: '组织党员志愿者开展社区环境整治活动，清理公共区域卫生。',
        type: 'volunteer',
        organizer: { id: 'party_org', name: '党支部', role: 'organization' },
        startTime: new Date(now + 5 * day).toISOString(),
        endTime: new Date(now + 5 * day + 14400000).toISOString(),
        location: '小区公共区域',
        participants: [],
        maxParticipants: 30,
        currentParticipants: 0,
        status: 'upcoming',
        createTime: new Date(now - 2 * day).toISOString(),
        signupDeadline: new Date(now + 4 * day).toISOString()
      }
    ];
    setPartyActivities(list);
  }

  /**
   * 党员身份认证申请
   * 结构：{
   *   id, userId, userName, room, phone,
   *   partyBranch: '所属党支部', joinDate: '入党日期',
   *   idCardImage: '身份证照片', partyCardImage: '党员证照片',
   *   status: 'pending'|'approved'|'rejected',
   *   createTime, reviewTime, reviewer, reviewComment,
   *   isPartyMember: false
   * }
   */
  function getPartyMemberApplications() {
    var list = get('party_member_applications');
    if (list && Array.isArray(list)) return list;
    set('party_member_applications', []);
    return [];
  }
  function setPartyMemberApplications(list, detail) {
    set('party_member_applications', Array.isArray(list) ? list : [], detail);
  }
  function addPartyMemberApplication(item) {
    var list = getPartyMemberApplications().slice();
    if (!item.id) item.id = 'pma_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.createTime = item.createTime || new Date().toISOString();
    item.status = item.status || 'pending';
    item.isPartyMember = item.isPartyMember || false;
    list.unshift(item);
    setPartyMemberApplications(list, { id: item.id, action: 'add' });
    addLog({ type: 'party_member_application_add', applicationId: item.id, userId: item.userId, time: new Date().toISOString() });
    return item;
  }
  function updatePartyMemberApplication(id, patch) {
    var list = getPartyMemberApplications().slice();
    var i = list.findIndex(function(a) { return a.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    setPartyMemberApplications(list, { id: id, action: 'update' });
    return list[i];
  }
  function findPartyMemberApplication(id) {
    return getPartyMemberApplications().find(function(a) { return a.id === id; }) || null;
  }
  function getPartyMemberApplicationByUserId(userId) {
    return getPartyMemberApplications().find(function(a) { return a.userId === userId; }) || null;
  }

  /**
   * 党员信息管理
   * 结构：{
   *   id, userId, userName, room, phone, avatar,
   *   partyBranch, joinDate, partyRole: 'member'|'secretary'|'committee',
   *   isPartyMember: true, verifiedAt, points: 0,
   *   activitiesJoined: 0, studyHours: 0
   * }
   */
  function getPartyMembers() {
    var list = get('party_members');
    if (list && Array.isArray(list)) return list;
    seedPartyMembers();
    return get('party_members');
  }
  function setPartyMembers(list, detail) {
    set('party_members', Array.isArray(list) ? list : [], detail);
  }
  function addPartyMember(item) {
    var list = getPartyMembers().slice();
    if (!item.id) item.id = 'pm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.isPartyMember = true;
    item.points = item.points || 0;
    item.activitiesJoined = item.activitiesJoined || 0;
    item.studyHours = item.studyHours || 0;
    list.unshift(item);
    setPartyMembers(list, { id: item.id, action: 'add' });
    return item;
  }
  function updatePartyMember(id, patch) {
    var list = getPartyMembers().slice();
    var i = list.findIndex(function(m) { return m.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    setPartyMembers(list, { id: id, action: 'update' });
    return list[i];
  }
  function findPartyMember(id) {
    return getPartyMembers().find(function(m) { return m.id === id; }) || null;
  }
  function findPartyMemberByUserId(userId) {
    return getPartyMembers().find(function(m) { return m.userId === userId; }) || null;
  }
  function isUserPartyMember(userId) {
    return getPartyMembers().some(function(m) { return m.userId === userId && m.isPartyMember; });
  }
  function seedPartyMembers() {
    var list = [
      {
        id: 'pm_demo_1',
        userId: 'party_secretary',
        userName: '李书记',
        room: '1-101',
        phone: '138****8888',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=李书记',
        partyBranch: '阳光社区党支部',
        joinDate: '2010-07-01',
        partyRole: 'secretary',
        isPartyMember: true,
        verifiedAt: '2020-01-01',
        points: 580,
        activitiesJoined: 45,
        studyHours: 120
      },
      {
        id: 'pm_demo_2',
        userId: 'party_member_1',
        userName: '张党员',
        room: '2-202',
        phone: '139****6666',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=张党员',
        partyBranch: '阳光社区党支部',
        joinDate: '2015-07-01',
        partyRole: 'member',
        isPartyMember: true,
        verifiedAt: '2020-01-01',
        points: 320,
        activitiesJoined: 28,
        studyHours: 85
      }
    ];
    setPartyMembers(list);
  }

  /**
   * 党建学习资料
   * 结构：{
   *   id, title, content, type: 'document'|'video'|'article',
   *   category: '理论'|'政策'|'实务'|'案例',
   *   author: { id, name }, publishTime, readCount, likeCount,
   *   attachments: [], tags: [], status: 'published'|'draft',
   *   isRequired: false, studyDuration: 0 (分钟)
   * }
   */
  function getPartyStudyMaterials() {
    var list = get('party_study_materials');
    if (list && Array.isArray(list)) return list;
    seedPartyStudyMaterials();
    return get('party_study_materials');
  }
  function setPartyStudyMaterials(list, detail) {
    set('party_study_materials', Array.isArray(list) ? list : [], detail);
  }
  function addPartyStudyMaterial(item) {
    var list = getPartyStudyMaterials().slice();
    if (!item.id) item.id = 'psm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.publishTime = item.publishTime || new Date().toISOString();
    item.readCount = item.readCount || 0;
    item.likeCount = item.likeCount || 0;
    item.status = item.status || 'published';
    list.unshift(item);
    setPartyStudyMaterials(list, { id: item.id, action: 'add' });
    addLog({ type: 'party_study_material_add', materialId: item.id, title: item.title, time: new Date().toISOString() });
    return item;
  }
  function updatePartyStudyMaterial(id, patch) {
    var list = getPartyStudyMaterials().slice();
    var i = list.findIndex(function(m) { return m.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    setPartyStudyMaterials(list, { id: id, action: 'update' });
    return list[i];
  }
  function findPartyStudyMaterial(id) {
    return getPartyStudyMaterials().find(function(m) { return m.id === id; }) || null;
  }
  function incrementPartyStudyMaterialRead(id) {
    var material = findPartyStudyMaterial(id);
    if (material) {
      material.readCount = (material.readCount || 0) + 1;
      updatePartyStudyMaterial(id, { readCount: material.readCount });
    }
  }
  function getRequiredPartyStudyMaterials() {
    return getPartyStudyMaterials().filter(function(m) {
      return m.isRequired && m.status === 'published';
    });
  }
  function seedPartyStudyMaterials() {
    var now = Date.now();
    var list = [
      {
        id: 'psm_demo_1',
        title: '党的二十大精神学习要点',
        content: '党的二十大是在全党全国各族人民迈上全面建设社会主义现代化国家新征程、向第二个百年奋斗目标进军的关键时刻召开的一次十分重要的大会。',
        type: 'document',
        category: '理论',
        author: { id: 'party_org', name: '党支部' },
        publishTime: new Date(now - 86400000).toISOString(),
        readCount: 156,
        likeCount: 45,
        attachments: [
          { name: '党的二十大精神学习要点.pdf', url: '#', size: '2.3MB' }
        ],
        tags: ['二十大', '精神学习', '必修'],
        status: 'published',
        isRequired: true,
        studyDuration: 60
      },
      {
        id: 'psm_demo_2',
        title: '如何发挥党员先锋模范作用',
        content: '党员要在工作、学习和生活中发挥先锋模范作用，带头贯彻执行党的路线方针政策，带头参加改革开放和社会主义现代化建设。',
        type: 'article',
        category: '实务',
        author: { id: 'party_secretary', name: '李书记' },
        publishTime: new Date(now - 43200000).toISOString(),
        readCount: 89,
        likeCount: 23,
        attachments: [],
        tags: ['先锋模范', '党员作用'],
        status: 'published',
        isRequired: false,
        studyDuration: 30
      },
      {
        id: 'psm_demo_3',
        title: '社区党建工作实务指南',
        content: '社区党建工作是党的基层组织建设的重要组成部分，要坚持以服务群众为中心，创新工作方式方法。',
        type: 'video',
        category: '案例',
        author: { id: 'party_org', name: '党支部' },
        publishTime: new Date(now - 172800000).toISOString(),
        readCount: 67,
        likeCount: 18,
        attachments: [],
        tags: ['社区党建', '实务指南'],
        status: 'published',
        isRequired: false,
        studyDuration: 45
      }
    ];
    setPartyStudyMaterials(list);
  }

  /**
   * 党员学习记录
   * 结构：{
   *   id, userId, materialId, materialTitle,
   *   startTime, endTime, duration, progress: 0-100,
   *   completed: false, notes: ''
   * }
   */
  function getPartyStudyRecords() {
    var list = get('party_study_records');
    if (list && Array.isArray(list)) return list;
    set('party_study_records', []);
    return [];
  }
  function setPartyStudyRecords(list, detail) {
    set('party_study_records', Array.isArray(list) ? list : [], detail);
  }
  function addPartyStudyRecord(item) {
    var list = getPartyStudyRecords().slice();
    if (!item.id) item.id = 'psr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.startTime = item.startTime || new Date().toISOString();
    item.progress = item.progress || 0;
    item.completed = item.completed || false;
    list.unshift(item);
    setPartyStudyRecords(list, { id: item.id, action: 'add' });
    return item;
  }
  function updatePartyStudyRecord(id, patch) {
    var list = getPartyStudyRecords().slice();
    var i = list.findIndex(function(r) { return r.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    setPartyStudyRecords(list, { id: id, action: 'update' });
    return list[i];
  }
  function getUserStudyRecords(userId) {
    return getPartyStudyRecords().filter(function(r) { return r.userId === userId; });
  }
  function getUserCompletedStudyCount(userId) {
    return getPartyStudyRecords().filter(function(r) {
      return r.userId === userId && r.completed;
    }).length;
  }

  /**
   * 跳蚤市场商品管理
   * 结构：{
   *   id, title, description, category, price, originalPrice, condition,
   *   images: [], seller: { id, name, room, avatar },
   *   status: 'available'|'reserved'|'sold',
   *   views, favorites, createTime, updateTime,
   *   isFeatured: false
   * }
   */
  function getMarketItems() {
    var items = get('market_items');
    if (items && Array.isArray(items)) return items;
    return [];
  }

  function setMarketItems(list, detail) {
    set('market_items', Array.isArray(list) ? list : [], detail);
  }

  function addMarketItem(item) {
    var list = getMarketItems().slice();
    if (!item.id) item.id = 'market_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.createTime = item.createTime || new Date().toISOString();
    item.updateTime = item.createTime;
    item.views = item.views || 0;
    item.favorites = item.favorites || 0;
    item.status = item.status || 'available';
    item.isFeatured = item.isFeatured || false;
    list.unshift(item);
    setMarketItems(list, { id: item.id, action: 'add' });
    addLog({ type: 'market_item_add', itemId: item.id, title: item.title, seller: item.seller, time: new Date().toISOString() });
    return item;
  }

  function updateMarketItem(id, patch) {
    var list = getMarketItems().slice();
    var idx = list.findIndex(function(item) { return item.id === id; });
    if (idx === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[idx][k] = patch[k];
    list[idx].updateTime = new Date().toISOString();
    setMarketItems(list, { id: id, action: 'update' });
    addLog({ type: 'market_item_update', itemId: id, time: new Date().toISOString() });
    return list[idx];
  }

  function findMarketItem(id) {
    return getMarketItems().find(function(item) { return item.id === id; });
  }

  function deleteMarketItem(id) {
    var list = getMarketItems().slice();
    var idx = list.findIndex(function(item) { return item.id === id; });
    if (idx === -1) return false;
    list.splice(idx, 1);
    setMarketItems(list, { id: id, action: 'delete' });
    addLog({ type: 'market_item_delete', itemId: id, time: new Date().toISOString() });
    return true;
  }

  /**
   * 跳蚤市场收藏管理
   */
  function getMarketFavorites() {
    var favs = get('market_favorites');
    if (favs && Array.isArray(favs)) return favs;
    return [];
  }

  function setMarketFavorites(list, detail) {
    set('market_favorites', Array.isArray(list) ? list : [], detail);
  }

  function toggleMarketFavorite(itemId, userId) {
    var favs = getMarketFavorites().slice();
    var idx = favs.findIndex(function(f) { return f.itemId === itemId && f.userId === userId; });
    var isFavorited = false;
    if (idx !== -1) {
      favs.splice(idx, 1);
      var item = findMarketItem(itemId);
      if (item) {
        item.favorites = Math.max(0, (item.favorites || 0) - 1);
        updateMarketItem(itemId, { favorites: item.favorites });
      }
    } else {
      favs.push({ itemId: itemId, userId: userId, createTime: new Date().toISOString() });
      var item = findMarketItem(itemId);
      if (item) {
        item.favorites = (item.favorites || 0) + 1;
        updateMarketItem(itemId, { favorites: item.favorites });
      }
      isFavorited = true;
    }
    set('market_favorites', favs, { itemId: itemId, userId: userId, action: isFavorited ? 'add' : 'remove' });
    return isFavorited;
  }

  function isMarketFavorited(itemId, userId) {
    return getMarketFavorites().some(function(f) { return f.itemId === itemId && f.userId === userId; });
  }

  function getUserMarketFavorites(userId) {
    var favs = getMarketFavorites().filter(function(f) { return f.userId === userId; });
    var items = [];
    favs.forEach(function(f) {
      var item = findMarketItem(f.itemId);
      if (item) items.push({ favorite: f, item: item });
    });
    return items;
  }

  /**
   * 跳蚤市场消息管理
   */
  function getMarketMessages() {
    var msgs = get('market_messages');
    if (msgs && Array.isArray(msgs)) return msgs;
    return [];
  }

  function addMarketMessage(msg) {
    var msgs = getMarketMessages().slice();
    if (!msg.id) msg.id = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    msg.createTime = msg.createTime || new Date().toISOString();
    msg.isRead = false;
    msgs.unshift(msg);
    set('market_messages', msgs, { id: msg.id, action: 'add' });
    return msg;
  }

  function markMarketMessageRead(id) {
    var msgs = getMarketMessages().slice();
    var msg = msgs.find(function(m) { return m.id === id; });
    if (msg) {
      msg.isRead = true;
      set('market_messages', msgs, { id: id, action: 'read' });
    }
    return msg;
  }

  function getUnreadMarketMessages(userId) {
    return getMarketMessages().filter(function(m) { return m.toUserId === userId && !m.isRead; });
  }

  function initMarketTestData() {
    var dice = function (name) {
      return 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(name || 'user');
    };
    var pic = function (seed, w, h) {
      return 'https://picsum.photos/seed/' + encodeURIComponent(seed) + '/' + (w || 800) + '/' + (h || 800);
    };

    var testItems = [
      {
        id: 'market_test_001',
        title: '九成新婴儿推车',
        description: '宝宝长大了用不上了，买来只用过几次，功能完好，可以折叠，非常方便出行。',
        price: 280,
        originalPrice: 899,
        category: 'kids',
        condition: 'like_new',
        images: [pic('flea stroller A', 800, 800), pic('flea stroller B', 800, 600)],
        seller: { id: 'user_test_001', name: '李女士', room: '3-201', avatar: dice('李女士-3-201') },
        status: 'available',
        views: 45,
        favorites: 3,
        createTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'market_test_002',
        title: '小米空气净化器3',
        description: '使用一年，滤芯刚换过两个月，效果很好，搬家出闲置。',
        price: 350,
        originalPrice: 699,
        category: 'electronics',
        condition: 'good',
        images: [pic('flea purifier 1', 800, 800), pic('flea purifier 2', 800, 800)],
        seller: { id: 'user_test_002', name: '王先生', room: '5-1502', avatar: dice('王先生-1502') },
        status: 'available',
        views: 78,
        favorites: 5,
        createTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'market_test_003',
        title: '实木书桌带书架',
        description: '北欧风格实木书桌，尺寸120*60cm，带三层书架，适合小户型。',
        price: 200,
        originalPrice: 600,
        category: 'furniture',
        condition: 'good',
        images: [pic('flea desk wood', 800, 800), pic('flea desk shelf', 800, 600), pic('flea desk room', 800, 600)],
        seller: { id: 'user_test_003', name: '张女士', room: '2-801', avatar: dice('张女士-801') },
        status: 'reserved',
        views: 32,
        favorites: 2,
        createTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'market_test_004',
        title: '全套雅思备考书籍',
        description: '剑桥雅思4-18全套，还有词汇书和写作指导，大部分都没怎么翻过。',
        price: 80,
        originalPrice: 300,
        category: 'books',
        condition: 'new',
        images: [pic('flea books ielts', 800, 800)],
        seller: { id: 'user_test_004', name: '陈同学', room: '6-602', avatar: dice('陈同学-602') },
        status: 'available',
        views: 56,
        favorites: 8,
        createTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'market_test_005',
        title: '跑步机家用折叠款',
        description: '买来减肥用的，结果没跑几次，九成新，可以折叠不占地方。',
        price: 500,
        originalPrice: 1599,
        category: 'sports',
        condition: 'like_new',
        images: [pic('flea treadmill 1', 800, 800), pic('flea treadmill 2', 800, 800)],
        seller: { id: 'user_test_005', name: '刘先生', room: '1-1201', avatar: dice('刘先生-1201') },
        status: 'available',
        views: 89,
        favorites: 12,
        createTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'market_test_006',
        title: '全新未拆封AirPods Pro',
        description: '公司年会奖品，自己有耳机了所以出掉，全新未拆封。',
        price: 1200,
        originalPrice: 1999,
        category: 'electronics',
        condition: 'new',
        images: [pic('flea airpods box', 800, 800), pic('flea airpods case', 800, 800)],
        seller: { id: 'user_test_006', name: '周女士', room: '4-302', avatar: dice('周女士-302') },
        status: 'available',
        views: 123,
        favorites: 15,
        createTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ];

    var templateById = {};
    testItems.forEach(function (t) {
      templateById[t.id] = t;
    });

    var existing = getMarketItems();
    if (existing && existing.length > 0) {
      var patched = false;
      var merged = existing.map(function (item) {
        var tmpl = templateById[item.id];
        if (!tmpl) return item;
        var needImg = !item.images || !item.images.length;
        var needAv = item.seller && tmpl.seller && tmpl.seller.avatar && !item.seller.avatar;
        if (!needImg && !needAv) return item;
        patched = true;
        var next = JSON.parse(JSON.stringify(item));
        if (needImg) next.images = tmpl.images.slice();
        if (needAv && next.seller) next.seller.avatar = tmpl.seller.avatar;
        return next;
      });
      if (patched) setMarketItems(merged);
      return merged;
    }

    setMarketItems(testItems);
    return testItems;
  }

  function getWorkReportDisplayConfig() {
    var config = get('work_report_display_config');
    return config || { autoDisplay: true };
  }

  /**
   * 业主群组管理
   * 结构：{
   *   id, name, type: 'GENERAL'|'BUILDING'|'INTEREST'|'PRIVATE',
   *   communityId, buildingId, desc, notice, noticeTime, noticePublisher,
   *   aiEnabled, aiFeatures: [], icon, color,
   *   members: [{ id, name, room, role: 'owner'|'admin'|'member', online, isAI, joinTime, lastActive }],
   *   settings: { mute: false, top: false, allowSearch: true },
   *   createTime, updateTime, creator, status: 'active'|'archived'
   * }
   */
  function getChatGroups() {
    var list = get('chat_groups');
    if (list && Array.isArray(list)) return list;
    seedChatGroups();
    return get('chat_groups');
  }
  function setChatGroups(list, detail) {
    set('chat_groups', Array.isArray(list) ? list : [], detail);
  }
  function seedChatGroups() {
    var now = Date.now();
    var list = [
      {
        id: 'general',
        name: '阳光花园总群',
        type: 'GENERAL',
        communityId: 'default',
        desc: '小区官方交流群',
        notice: '本群为小区官方交流群，禁止发布广告。如需报修或投诉，请直接@智能管家。',
        noticeTime: new Date(now - 24 * 3600000).toISOString(),
        noticePublisher: '业委会',
        aiEnabled: true,
        aiFeatures: ['work_order', 'emergency', 'announcement', 'legal'],
        icon: 'fa-house-chimney',
        color: '#1890FF',
        members: [
          { id: 'ai_assistant', name: 'AI智能管家', role: 'admin', online: true, isAI: true, joinTime: new Date(now - 30 * 24 * 3600000).toISOString() },
          { id: 'user_001', name: '6栋-李先生', room: '6-601', role: 'owner', online: true, joinTime: new Date(now - 20 * 24 * 3600000).toISOString() },
          { id: 'user_002', name: '8栋-王女士', room: '8-302', role: 'owner', online: true, joinTime: new Date(now - 15 * 24 * 3600000).toISOString() }
        ],
        settings: { mute: false, top: true, allowSearch: true },
        createTime: new Date(now - 30 * 24 * 3600000).toISOString(),
        status: 'active'
      },
      {
        id: 'building_6',
        name: '6栋业主群',
        type: 'BUILDING',
        communityId: 'default',
        buildingId: '6',
        desc: '6栋业主专属交流群',
        notice: '6栋业主专属群，请勿邀请非本栋业主。',
        aiEnabled: true,
        aiFeatures: ['work_order'],
        icon: 'fa-building',
        color: '#52C41A',
        members: [
          { id: 'ai_assistant', name: 'AI小助手', role: 'admin', online: true, isAI: true },
          { id: 'user_001', name: '6栋-李先生', room: '6-601', role: 'admin', online: true }
        ],
        settings: { mute: false, top: false, allowSearch: true },
        createTime: new Date(now - 25 * 24 * 3600000).toISOString(),
        status: 'active'
      }
    ];
    setChatGroups(list);
  }
  function addChatGroup(item) {
    var list = getChatGroups().slice();
    if (!item.id) item.id = 'group_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.createTime = item.createTime || new Date().toISOString();
    item.updateTime = item.createTime;
    item.members = item.members || [];
    item.settings = item.settings || { mute: false, top: false, allowSearch: true };
    item.status = item.status || 'active';
    list.unshift(item);
    setChatGroups(list, { id: item.id, action: 'add' });
    addLog({ type: 'chat_group_add', groupId: item.id, name: item.name, time: new Date().toISOString() });
    return item;
  }
  function updateChatGroup(id, patch) {
    var list = getChatGroups().slice();
    var i = list.findIndex(function(g) { return g.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    list[i].updateTime = new Date().toISOString();
    setChatGroups(list, { id: id, action: 'update' });
    return list[i];
  }
  function findChatGroup(id) {
    return getChatGroups().find(function(g) { return g.id === id; }) || null;
  }
  function deleteChatGroup(id) {
    var list = getChatGroups().slice();
    var i = list.findIndex(function(g) { return g.id === id; });
    if (i === -1) return false;
    list.splice(i, 1);
    setChatGroups(list, { id: id, action: 'delete' });
    addLog({ type: 'chat_group_delete', groupId: id, time: new Date().toISOString() });
    return true;
  }
  function getUserChatGroups(userId) {
    return getChatGroups().filter(function(g) {
      return g.members.some(function(m) { return m.id === userId; });
    });
  }
  function joinChatGroup(groupId, userId, userInfo) {
    var group = findChatGroup(groupId);
    if (!group) return { success: false, message: '群组不存在' };
    var alreadyMember = group.members.some(function(m) { return m.id === userId; });
    if (alreadyMember) return { success: false, message: '您已是群成员' };
    var newMember = {
      id: userId,
      name: userInfo.name,
      room: userInfo.room,
      role: 'member',
      online: true,
      joinTime: new Date().toISOString()
    };
    group.members.push(newMember);
    updateChatGroup(groupId, { members: group.members });
    addLog({ type: 'chat_group_join', groupId: groupId, userId: userId, time: new Date().toISOString() });
    return { success: true, message: '加入成功', group: group };
  }
  function leaveChatGroup(groupId, userId) {
    var group = findChatGroup(groupId);
    if (!group) return { success: false, message: '群组不存在' };
    var idx = group.members.findIndex(function(m) { return m.id === userId; });
    if (idx === -1) return { success: false, message: '您不是群成员' };
    group.members.splice(idx, 1);
    updateChatGroup(groupId, { members: group.members });
    addLog({ type: 'chat_group_leave', groupId: groupId, userId: userId, time: new Date().toISOString() });
    return { success: true, message: '已退出群聊' };
  }
  function setGroupAdmin(groupId, userId, isAdmin) {
    var group = findChatGroup(groupId);
    if (!group) return { success: false, message: '群组不存在' };
    var member = group.members.find(function(m) { return m.id === userId; });
    if (!member) return { success: false, message: '成员不存在' };
    member.role = isAdmin ? 'admin' : 'member';
    updateChatGroup(groupId, { members: group.members });
    addLog({ type: 'chat_group_admin', groupId: groupId, userId: userId, isAdmin: isAdmin, time: new Date().toISOString() });
    return { success: true, message: isAdmin ? '已设为管理员' : '已取消管理员' };
  }
  function removeGroupMember(groupId, userId, operatorId) {
    var group = findChatGroup(groupId);
    if (!group) return { success: false, message: '群组不存在' };
    var operator = group.members.find(function(m) { return m.id === operatorId; });
    if (!operator || (operator.role !== 'admin' && operator.role !== 'owner')) {
      return { success: false, message: '无权限操作' };
    }
    var idx = group.members.findIndex(function(m) { return m.id === userId; });
    if (idx === -1) return { success: false, message: '成员不存在' };
    group.members.splice(idx, 1);
    updateChatGroup(groupId, { members: group.members });
    addLog({ type: 'chat_group_remove', groupId: groupId, userId: userId, operatorId: operatorId, time: new Date().toISOString() });
    return { success: true, message: '已移除成员' };
  }
  function updateGroupNotice(groupId, notice, publisher) {
    var group = findChatGroup(groupId);
    if (!group) return { success: false, message: '群组不存在' };
    updateChatGroup(groupId, {
      notice: notice,
      noticeTime: new Date().toISOString(),
      noticePublisher: publisher
    });
    addLog({ type: 'chat_group_notice', groupId: groupId, publisher: publisher, time: new Date().toISOString() });
    return { success: true, message: '公告已更新' };
  }

  /**
   * 群聊消息管理
   * 结构：{
   *   id, groupId, type: 'text'|'image'|'system'|'work_order'|'notice'|'voice',
   *   content, from: { id, name, room, avatar, isAI },
   *   timestamp, isSelf, read: false,
   *   replyTo: { id, content, from },
   *   workOrderData: { id, type, desc, status }
   * }
   */
  function getChatMessages(groupId) {
    var key = 'chat_messages_' + groupId;
    var list = get(key);
    if (list && Array.isArray(list)) return list;
    return [];
  }
  function setChatMessages(groupId, list, detail) {
    var key = 'chat_messages_' + groupId;
    set(key, Array.isArray(list) ? list : [], detail);
  }
  function addChatMessage(groupId, msg) {
    var list = getChatMessages(groupId).slice();
    if (!msg.id) msg.id = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    msg.timestamp = msg.timestamp || Date.now();
    msg.read = msg.read !== undefined ? msg.read : false;
    list.push(msg);
    if (list.length > 500) list = list.slice(-500);
    setChatMessages(groupId, list, { id: msg.id, groupId: groupId, action: 'add' });
    return msg;
  }
  function searchChatMessages(groupId, keyword) {
    var list = getChatMessages(groupId);
    if (!keyword) return list;
    keyword = keyword.toLowerCase();
    return list.filter(function(m) {
      return m.content && m.content.toLowerCase().indexOf(keyword) !== -1;
    });
  }
  function getChatMessagesByTimeRange(groupId, startTime, endTime) {
    var list = getChatMessages(groupId);
    return list.filter(function(m) {
      return m.timestamp >= startTime && m.timestamp <= endTime;
    });
  }
  function markMessagesRead(groupId, userId) {
    var list = getChatMessages(groupId).slice();
    list.forEach(function(m) {
      if (!m.isSelf && m.from && m.from.id !== userId) {
        m.read = true;
      }
    });
    setChatMessages(groupId, list, { groupId: groupId, action: 'read' });
  }
  function getUnreadMessageCount(groupId, userId) {
    var list = getChatMessages(groupId);
    return list.filter(function(m) {
      return !m.read && !m.isSelf && m.from && m.from.id !== userId;
    }).length;
  }
  function clearChatMessages(groupId) {
    setChatMessages(groupId, []);
    addLog({ type: 'chat_messages_clear', groupId: groupId, time: new Date().toISOString() });
    return true;
  }

  /**
   * 群聊通知设置
   * 结构：{
   *   userId, groupId, mute: false, top: false,
   *   mentionNotify: true, workOrderNotify: true,
   *   updateTime
   * }
   */
  function getChatNotificationSettings(userId) {
    var list = get('chat_notification_settings');
    if (list && Array.isArray(list)) return list;
    return [];
  }
  function setChatNotificationSettings(list) {
    set('chat_notification_settings', Array.isArray(list) ? list : []);
  }
  function getUserNotificationSetting(userId, groupId) {
    var list = getChatNotificationSettings(userId);
    return list.find(function(s) { return s.userId === userId && s.groupId === groupId; }) || null;
  }
  function updateNotificationSetting(userId, groupId, patch) {
    var list = getChatNotificationSettings().slice();
    var idx = list.findIndex(function(s) { return s.userId === userId && s.groupId === groupId; });
    var setting = {
      userId: userId,
      groupId: groupId,
      mute: false,
      top: false,
      mentionNotify: true,
      workOrderNotify: true,
      updateTime: new Date().toISOString()
    };
    if (idx === -1) {
      for (var k in patch) if (patch.hasOwnProperty(k)) setting[k] = patch[k];
      list.push(setting);
    } else {
      for (var k in patch) if (patch.hasOwnProperty(k)) list[idx][k] = patch[k];
      list[idx].updateTime = new Date().toISOString();
    }
    setChatNotificationSettings(list);
    return idx === -1 ? setting : list[idx];
  }

  /**
   * 业主身份验证与权限
   * 结构：{
   *   userId, name, room, role: 'visitor'|'resident'|'owner'|'family'|'tenant',
   *   authStatus: 'pending'|'approved'|'rejected',
   *   authTime, authBy,
   *   permissions: { canVote: false, canApplyMeeting: false, canChat: true },
   *   updateTime
   * }
   */
  function getOwnerPermissions() {
    var data = get('owner_permissions');
    if (data && typeof data === 'object') return data;
    return seedOwnerPermissions();
  }
  function setOwnerPermissions(data) {
    set('owner_permissions', data && typeof data === 'object' ? data : {});
  }
  function seedOwnerPermissions() {
    var data = {
      userId: 'user_current',
      name: '当前用户',
      room: '6-602',
      role: 'owner',
      authStatus: 'approved',
      authTime: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
      permissions: {
        canVote: true,
        canApplyMeeting: true,
        canChat: true,
        canCreateGroup: true,
        canManageGroup: true
      }
    };
    setOwnerPermissions(data);
    return data;
  }
  function updateOwnerPermissions(userId, patch) {
    var data = getOwnerPermissions();
    if (!data || data.userId !== userId) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) data[k] = patch[k];
    data.updateTime = new Date().toISOString();
    setOwnerPermissions(data);
    return data;
  }
  function checkPermission(userId, permission) {
    var data = getOwnerPermissions();
    if (!data || data.userId !== userId) return false;
    if (data.role === 'owner') return true;
    if (data.permissions && data.permissions[permission] !== undefined) {
      return data.permissions[permission];
    }
    return false;
  }
  function canCreateGroup(userId) {
    return checkPermission(userId, 'canCreateGroup');
  }
  function canManageGroup(userId, groupId) {
    var group = findChatGroup(groupId);
    if (!group) return false;
    var member = group.members.find(function(m) { return m.id === userId; });
    if (!member) return false;
    return member.role === 'admin' || member.role === 'owner';
  }
  function canSendWorkOrder(userId) {
    return checkPermission(userId, 'canChat');
  }

  // ---------- 首次加载时初始化为空（已清除虚拟数据） ----------
  function seedTickets() {
    setTickets([]);
  }
  function seedBulletins() {
    setBulletins([]);
  }
  function seedConsult() {
    setConsult([]);
  }
  function seedMaintenanceFund() {
    setMaintenanceFund([]);
  }

  /** 业委会内部会议：专属于业委会用于线上内部会议的系统 */
  function getCommitteeInternalMeetings() {
    var list = get('committee_internal_meetings');
    if (list && Array.isArray(list)) return list;
    seedCommitteeInternalMeetings();
    return get('committee_internal_meetings');
  }
  function setCommitteeInternalMeetings(list) {
    set('committee_internal_meetings', Array.isArray(list) ? list : []);
  }
  function addCommitteeInternalMeeting(item) {
    var list = getCommitteeInternalMeetings().slice();
    if (!item.id) item.id = 'cim_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    item.createdAt = item.createdAt || new Date().toISOString();
    item.updatedAt = item.createdAt;
    list.unshift(item);
    setCommitteeInternalMeetings(list);
    return item;
  }
  function updateCommitteeInternalMeeting(id, patch) {
    var list = getCommitteeInternalMeetings().slice();
    var idx = list.findIndex(function(m) { return m.id === id; });
    if (idx === -1) return null;
    for (var k in patch) {
      if (patch.hasOwnProperty(k)) list[idx][k] = patch[k];
    }
    list[idx].updatedAt = new Date().toISOString();
    setCommitteeInternalMeetings(list);
    return list[idx];
  }
  function findCommitteeInternalMeeting(id) {
    return getCommitteeInternalMeetings().find(function(m) { return m.id === id; }) || null;
  }
  function deleteCommitteeInternalMeeting(id) {
    var list = getCommitteeInternalMeetings().slice();
    var idx = list.findIndex(function(m) { return m.id === id; });
    if (idx === -1) return false;
    list.splice(idx, 1);
    setCommitteeInternalMeetings(list);
    return true;
  }
  function seedCommitteeInternalMeetings() {
    var now = Date.now();
    var list = [
      {
        id: 'cim_demo_001',
        title: '2026年3月维修资金审批会议',
        type: 'approval',
        typeLabel: '专项审批会议',
        status: 'scheduled',
        scheduledTime: new Date(now + 2 * 86400000).toISOString().slice(0, 16).replace('T', ' '),
        duration: 120,
        organizer: '张明',
        participants: [
          { id: 'p1', name: '张明', role: '主任', status: 'confirmed' },
          { id: 'p2', name: '李华', role: '副主任', status: 'confirmed' },
          { id: 'p3', name: '王芳', role: '委员', status: 'pending' },
          { id: 'p4', name: '赵强', role: '委员', status: 'confirmed' }
        ],
        relatedMaintenanceFunds: [
          {
            mfId: 'MF_DEMO_001',
            project: '电梯大修工程',
            amount: 85000,
            voucherStatus: 'complete',
            attachmentsSummary: { invoiceCount: 2, contractCount: 1, aiMatchConfidence: 0.90 },
            reviewStatus: 'pending'
          }
        ],
        agenda: [
          { id: 'a1', title: '电梯大修工程审批', mfId: 'MF_DEMO_001', duration: 30, presenter: '李华', status: 'pending' },
          { id: 'a2', title: '其他事项讨论', duration: 20, presenter: '张明', status: 'pending' }
        ],
        minutes: { content: '', attachments: [] },
        resolutions: [],
        createdAt: new Date(now - 86400000).toISOString(),
        createdBy: '张明',
        updatedAt: new Date(now - 86400000).toISOString()
      },
      {
        id: 'cim_demo_002',
        title: '2026年3月工作例会',
        type: 'routine',
        typeLabel: '常规定期会议',
        status: 'completed',
        scheduledTime: new Date(now - 3 * 86400000).toISOString().slice(0, 16).replace('T', ' '),
        duration: 90,
        actualStartTime: new Date(now - 3 * 86400000).toISOString(),
        actualEndTime: new Date(now - 3 * 86400000 + 5400000).toISOString(),
        organizer: '张明',
        participants: [
          { id: 'p1', name: '张明', role: '主任', status: 'confirmed' },
          { id: 'p2', name: '李华', role: '副主任', status: 'confirmed' },
          { id: 'p3', name: '王芳', role: '委员', status: 'confirmed' },
          { id: 'p4', name: '赵强', role: '委员', status: 'confirmed' },
          { id: 'p5', name: '陈静', role: '委员', status: 'confirmed' }
        ],
        relatedMaintenanceFunds: [],
        agenda: [
          { id: 'a1', title: '上月工作总结', duration: 20, presenter: '张明', status: 'completed' },
          { id: 'a2', title: '本月工作计划', duration: 30, presenter: '李华', status: 'completed' }
        ],
        minutes: {
          content: '会议纪要：\n1. 上月工单完成率95%，业主满意度4.5分\n2. 本月重点推进电梯大修项目审批\n3. 加强物业服务质量监督',
          attachments: [],
          createdAt: new Date(now - 3 * 86400000).toISOString(),
          createdBy: '李华'
        },
        resolutions: [],
        createdAt: new Date(now - 5 * 86400000).toISOString(),
        createdBy: '张明',
        updatedAt: new Date(now - 3 * 86400000).toISOString()
      }
    ];
    setCommitteeInternalMeetings(list);
  }
  
  function addMeetingReferenceToMF(mfId, meetingRef) {
    var list = getMaintenanceFund();
    var mf = list.find(function(m) { return m.id === mfId; });
    if (!mf) return null;
    var refs = mf.meetingReferences || [];
    var exists = refs.find(function(r) { return r.meetingId === meetingRef.meetingId; });
    if (!exists) {
      refs.push(meetingRef);
      return updateMaintenanceFund(mfId, { meetingReferences: refs });
    }
    return mf;
  }
  
  function syncMfStatusFromResolution(mfId, resolutionType, meetingId, meetingTitle) {
    var newStatus = resolutionType === 'approve' ? 'approved' : 
                    (resolutionType === 'reject' ? 'rejected' : 'pending');
    var now = new Date().toISOString();
    var patch = {
      status: newStatus,
      resolutionAt: now,
      resolutionType: resolutionType,
      resolutionMeetingId: meetingId,
      resolutionMeetingTitle: meetingTitle
    };
    return updateMaintenanceFund(mfId, patch);
  }
  
  function getMFMeetings(mfId) {
    var meetings = getCommitteeInternalMeetings();
    return meetings.filter(function(m) {
      var related = m.relatedMaintenanceFunds || [];
      return related.some(function(r) { return r.mfId === mfId; });
    });
  }
  
  function seedAccessCodes() {
    setAccessCodes([]);
  }
  function seedAuthPending() {
    setAuthPending([]);
  }
  function seedTempMeetingSuggestions() {
    var list = [
      { id: 'tm_demo1', community: '阳光小区', meetingId: 'm1', meetingTitle: '电梯更新协商会', topic: '是否启动电梯更换程序', voteRate: '24%', receivedAt: '2026-02-28 10:05', status: '待研判', complianceScore: 85 },
      { id: 'tm_demo2', community: '翠湖小区', meetingId: 'm2', meetingTitle: '停车位分配讨论会', topic: '地下车位分配方案', voteRate: '22%', receivedAt: '2026-03-01 14:30', status: '待研判', complianceScore: 78 }
    ];
    setTempMeetingSuggestions(list);
  }
  function seedComplianceNotices() {
    var list = [
      { id: 'cn_demo1', community: '翠湖小区', source: '业委会', type: '不合规', level: '高', detail: '未经业主大会表决擅自更换物业合同条款', evidence: '合同变更记录、公示截图', related: '合同编号 CT-2025-001', status: '待研判', receivedAt: '2026-03-01 09:00', complianceScore: 65 },
      { id: 'cn_demo2', community: '锦绣小区', source: '物业', type: '不合规', level: '中', detail: '维修资金使用未公示即施工', evidence: '业主举报材料', related: '工单#WO-1002', status: '已阅', receivedAt: '2026-02-28 14:30', complianceScore: 72 },
      { id: 'cn_demo3', community: '阳光小区', source: '业委会', type: '违法', level: '高', detail: '业委会成员擅自代表全体业主签署合同', evidence: '合同签署记录、业主投诉', related: '合同编号 CT-2026-003', status: '待研判', receivedAt: '2026-03-02 10:15', complianceScore: 55 }
    ];
    setComplianceNotices(list);
  }
  function seedCommunities() {
    var list = [
      { id: 'c1', name: '阳光小区', address: '阳光路 88 号', ticketCount: 12, complaintRate: '92%', complianceScore: 85 },
      { id: 'c2', name: '翠湖小区', address: '翠湖大道 12 号', ticketCount: 8, complaintRate: '88%', complianceScore: 72 },
      { id: 'c3', name: '锦绣小区', address: '锦绣街 36 号', ticketCount: 5, complaintRate: '95%', complianceScore: 90 }
    ];
    setCommunities(list);
  }

  /** 监听其他标签页数据变更（同源下其他窗口修改了 localStorage 会触发）
   * callback(store, newValue, detail?)  detail 可选，如 updateTicket 时 { id, action: 'update' } */
  function subscribe(callback) {
    if (!callback || typeof callback !== 'function') return;
    var onStorage = function (e) {
      if (e.key && e.key.indexOf(PREFIX) === 0) {
        var store = e.key.slice(PREFIX.length);
        try { callback(store, e.newValue ? JSON.parse(e.newValue) : null, undefined); } catch (err) {}
      }
    };
    var onMessage = function (e) {
      var d = e.data;
      if (!d || d.type !== 'update' || !d.store) return;
      try { callback(d.store, get(d.store), d.detail); } catch (err) {}
    };
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('storage', onStorage);
      if (broadcast) broadcast.addEventListener('message', onMessage);
    }
    return function unsubscribe() {
      if (typeof window !== 'undefined' && window.removeEventListener) window.removeEventListener('storage', onStorage);
      if (broadcast) broadcast.removeEventListener('message', onMessage);
    };
  }

  /** 仅监听指定 store 变更，callback(store, newValue, detail?) */
  function subscribeByStore(storeName, callback) {
    if (!storeName || !callback || typeof callback !== 'function') return;
    return subscribe(function (store, value, detail) {
      if (store === storeName) callback(store, value, detail);
    });
  }

  /** 生态 schema 版本，供各端兼容判断 */
  function getMeta() {
    return { schemaVersion: '2.7', bridgeVersion: '2.0' };
  }

  /**
   * 清除五端（业主端、物业端、业委会端、社区端、AI端）所有已生成数据，使端口回归原始状态。
   * 供生态入口 index.html 使用，确保各端刷新后均为空列表。
   * 含生态桥 crowd_tasks 与社区端 localStorage（SQ_COMMUNITY_crowdTasksData）众包任务。
   */
  function clearWorkOrderData() {
    // ---------- 生态桥 sgzf_* 共享数据 ----------
    setTickets([]);
    setBulletins([]);
    setConsult([]);
    setMaintenanceFund([]);
    setObjections([]);
    setAccessCodes([]);
    setUncivil([]);
    setAuthPending([]);
    setOwnerAuthApplications([]);
    setMeetingApplications([]);
    setCouncilMeetings([]);
    setVotes([]);
    setTempMeetingSuggestions([]);
    setComplianceNotices([]);
    setCommunityComplaints([]);
    setCommunities([]);
    set('logs', []);
    setScore({ total: 0, avg: 0, rate: '0%', accept: 0, repair: 0, report: 0 });
    setAnnualWorkPlan(null);
    setDeviceInspectionData({ plans: [], tasks: [], records: [], abnormals: [] });
    setServiceInspectionData({ staff: [], tracks: [], heatmap: null });
    setContractExecutionStandards(null);
    setDelegationList([]);
    setDelegationAuthRule({ singleLimit: 0, yearLimit: 0, source: 'default' });
    setForumTopics([]);
    setForumNotifications([]);
    setCrowdTasks([]);
    setCrowdTaskTopics([]);

    setMarketItems([]);
    setMarketFavorites([]);
    set('market_messages', []);

    if (storage) {
      try {
        // 业主端专属
        storage.removeItem('SQ_OWNER_DB');
        storage.removeItem('SQ_OWNER_USER');
        storage.removeItem('SQ_OWNER_HOUSE');
        storage.removeItem('SQ_OWNER_AGREED_AND_ENTERED');
        storage.removeItem('SQ_OWNER_CREDIT_SCORE');
        storage.removeItem('owner_complaint_list');
        storage.removeItem('owner_suggestion_list');
        storage.removeItem('owner_suggest_list');
        storage.removeItem('owner_auth_agreed');
        storage.removeItem('owner_auth_items');
        storage.removeItem('owner_voice_auth_agreed');
        storage.removeItem('ownerAuthRecord');
        storage.removeItem('owner_token');
        storage.removeItem('owner_port_large_font');
        storage.removeItem('owner_port_high_contrast');
        storage.removeItem('hasShownGuide');
        storage.removeItem('hasSeenAIFirstGuide');
        storage.removeItem('council_guide_dismissed');
        storage.removeItem('currentHouseId');
        storage.removeItem('repair_draft');
        storage.removeItem('feed_read_ids');
        storage.removeItem('feed_history');

        // 收集需移除的键（避免边遍历边删除导致遗漏）
        var keysToRemove = [];
        for (var ji = 0; ji < storage.length; ji++) {
          var kk = storage.key(ji);
          if (kk && (kk.indexOf('work_plan_viewed_') === 0 || kk.indexOf('council_web_') === 0 || kk.indexOf('meeting_transition_') === 0 || kk.indexOf('prep_participants_') === 0)) keysToRemove.push(kk);
        }
        keysToRemove.forEach(function (k) { storage.removeItem(k); });

        // 业委会端财务公开与监督：写入空数组以确保刷新后显示空列表
        storage.setItem('council_web_financeRecords', '[]');

        // 物业端专属
        storage.removeItem('property_pending_filter');
        storage.removeItem('wy_uncivil_behavior_types');

        // 社区端 / AI端
        storage.removeItem('community_settings');
        storage.removeItem('community_data');
        storage.removeItem('SQ_COMMUNITY_crowdTasksData');
        storage.removeItem('ai_auto_assign');
        storage.removeItem('ai_complaint_sync');
        storage.removeItem('ai_repeated_alert');
        storage.removeItem('ai_auto_meeting_review');
        storage.removeItem('ai_weight_basic');
        storage.removeItem('ai_weight_time');
        storage.removeItem('ai_weight_duration');
        storage.removeItem('ai_weight_content');
        storage.removeItem('ai_weight_history');
        storage.removeItem('ai_system_notification');
        storage.removeItem('ai_assignment_fail_notification');
        storage.removeItem('ai_theme');
      } catch (e) {}
    }

    if (broadcast) {
      ['tickets', 'bulletins', 'consult', 'maintenance_fund', 'objections', 'access_codes', 'uncivil',
       'auth_pending', 'owner_auth_applications', 'meeting_applications', 'council_meetings', 'votes',
       'temp_meeting_suggestions', 'compliance_notices', 'community_complaints', 'communities', 'logs', 'score', 'annual_work_plan',
       'contract_execution_standards', 'delegation_list', 'delegation_auth_rule', 
       'forum_topics', 'forum_notifications', 'forum_discussions', 'forum_likes', 'forum_favorites',
       'forum_votes', 'hot_questions', 'forum_logs', 'crowd_tasks', 'crowd_task_topics',
       'committee_internal_meetings'].forEach(function (store) {
        broadcast.postMessage({ type: 'update', store: store });
      });
    }
  }

  var bridge = {
    getTickets: getTickets,
    setTickets: setTickets,
    addTicket: addTicket,
    updateTicket: updateTicket,
    findTicket: findTicket,
    getBulletins: getBulletins,
    setBulletins: setBulletins,
    addBulletin: addBulletin,
    getConsult: getConsult,
    setConsult: setConsult,
    addConsult: addConsult,
    updateConsultItem: updateConsultItem,
    getMaintenanceFund: getMaintenanceFund,
    setMaintenanceFund: setMaintenanceFund,
    addMaintenanceFund: addMaintenanceFund,
    updateMaintenanceFund: updateMaintenanceFund,
    getCommitteeInternalMeetings: getCommitteeInternalMeetings,
    setCommitteeInternalMeetings: setCommitteeInternalMeetings,
    addCommitteeInternalMeeting: addCommitteeInternalMeeting,
    updateCommitteeInternalMeeting: updateCommitteeInternalMeeting,
    findCommitteeInternalMeeting: findCommitteeInternalMeeting,
    deleteCommitteeInternalMeeting: deleteCommitteeInternalMeeting,
    seedCommitteeInternalMeetings: seedCommitteeInternalMeetings,
    addMeetingReferenceToMF: addMeetingReferenceToMF,
    syncMfStatusFromResolution: syncMfStatusFromResolution,
    getMFMeetings: getMFMeetings,
    getObjections: getObjections,
    setObjections: setObjections,
    addObjection: addObjection,
    updateObjection: updateObjection,
    getAccessCodes: getAccessCodes,
    setAccessCodes: setAccessCodes,
    getUncivil: getUncivil,
    setUncivil: setUncivil,
    addUncivil: addUncivil,
    getAuthPending: getAuthPending,
    setAuthPending: setAuthPending,
    addAuthPending: addAuthPending,
    updateAuthPending: updateAuthPending,
    getOwnerAuthApplications: getOwnerAuthApplications,
    setOwnerAuthApplications: setOwnerAuthApplications,
    addOwnerAuthApplication: addOwnerAuthApplication,
    updateOwnerAuthApplication: updateOwnerAuthApplication,
    findOwnerAuthApplication: findOwnerAuthApplication,
    getTempMeetingSuggestions: getTempMeetingSuggestions,
    setTempMeetingSuggestions: setTempMeetingSuggestions,
    addTempMeetingSuggestion: addTempMeetingSuggestion,
    updateTempMeetingSuggestion: updateTempMeetingSuggestion,
    findTempMeetingSuggestion: findTempMeetingSuggestion,
    getComplianceNotices: getComplianceNotices,
    setComplianceNotices: setComplianceNotices,
    addComplianceNotice: addComplianceNotice,
    updateComplianceNotice: updateComplianceNotice,
    getCommunityComplaints: getCommunityComplaints,
    setCommunityComplaints: setCommunityComplaints,
    addCommunityComplaint: addCommunityComplaint,
    updateCommunityComplaint: updateCommunityComplaint,
    findCommunityComplaint: findCommunityComplaint,
    getCommunityTraceLogs: getCommunityTraceLogs,
    setCommunityTraceLogs: setCommunityTraceLogs,
    addCommunityTraceLog: addCommunityTraceLog,
    getCommunityTraceLogsById: getCommunityTraceLogsById,
    getCommunityArchiveLogs: getCommunityArchiveLogs,
    setCommunityArchiveLogs: setCommunityArchiveLogs,
    addCommunityArchiveLog: addCommunityArchiveLog,
    getContractReminders: getContractReminders,
    setContractReminders: setContractReminders,
    addContractReminder: addContractReminder,
    updateContractReminder: updateContractReminder,
    deleteContractReminder: deleteContractReminder,
    getPolicyPushRecords: getPolicyPushRecords,
    setPolicyPushRecords: setPolicyPushRecords,
    addPolicyPushRecord: addPolicyPushRecord,
    updatePolicyPushRecord: updatePolicyPushRecord,
    deletePolicyPushRecord: deletePolicyPushRecord,
    getJudgmentPushRecords: getJudgmentPushRecords,
    addJudgmentPushRecord: addJudgmentPushRecord,
    getCommunities: getCommunities,
    setCommunities: setCommunities,
    getLogs: getLogs,
    addLog: addLog,
    getScore: getScore,
    setScore: setScore,
    getPropertyScoreRecords: getPropertyScoreRecords,
    setPropertyScoreRecords: setPropertyScoreRecords,
    addPropertyScoreRecord: addPropertyScoreRecord,
    getPropertyScoreSummary: getPropertyScoreSummary,
    updatePropertyScoreSummary: updatePropertyScoreSummary,
    setPropertyScoreSummary: setPropertyScoreSummary,
    getMeetingApplications: getMeetingApplications,
    setMeetingApplications: setMeetingApplications,
    addMeetingApplication: addMeetingApplication,
    updateMeetingApplication: updateMeetingApplication,
    findMeetingApplication: findMeetingApplication,
    getVotes: getVotes,
    setVotes: setVotes,
    addVote: addVote,
    updateVote: updateVote,
    getCouncilMeetings: getCouncilMeetings,
    setCouncilMeetings: setCouncilMeetings,
    addCouncilMeeting: addCouncilMeeting,
    updateCouncilMeeting: updateCouncilMeeting,
    seedCouncilMeetings: seedCouncilMeetings,
    getAnnualWorkPlan: getAnnualWorkPlan,
    setAnnualWorkPlan: setAnnualWorkPlan,
    getDeviceInspectionData: getDeviceInspectionData,
    setDeviceInspectionData: setDeviceInspectionData,
    getServiceInspectionData: getServiceInspectionData,
    setServiceInspectionData: setServiceInspectionData,
    getContractExecutionStandards: getContractExecutionStandards,
    setContractExecutionStandards: setContractExecutionStandards,
    getDelegationList: getDelegationList,
    addDelegation: addDelegation,
    updateDelegation: updateDelegation,
    getDelegationAuthRule: getDelegationAuthRule,
    setDelegationAuthRule: setDelegationAuthRule,
    getWorkReports: getWorkReports,
    setWorkReports: setWorkReports,
    addWorkReport: addWorkReport,
    updateWorkReport: updateWorkReport,
    findWorkReport: findWorkReport,
    deleteWorkReport: deleteWorkReport,
    getPublishedWorkReports: getPublishedWorkReports,
    setWorkReportDisplayConfig: setWorkReportDisplayConfig,
    getWorkReportDisplayConfig: getWorkReportDisplayConfig,
    getForumTopics: getForumTopics,
    setForumTopics: setForumTopics,
    addForumTopic: addForumTopic,
    updateForumTopic: updateForumTopic,
    deleteForumTopic: deleteForumTopic,
    findForumTopic: findForumTopic,
    getHotForumTopics: getHotForumTopics,
    calculateHotScore: calculateHotScore,
    seedForumTopics: seedForumTopics,
    getForumDiscussions: getForumDiscussions,
    setForumDiscussions: setForumDiscussions,
    addForumDiscussion: addForumDiscussion,
    updateForumDiscussion: updateForumDiscussion,
    deleteForumDiscussion: deleteForumDiscussion,
    getDiscussionsByTopic: getDiscussionsByTopic,
    getForumLikes: getForumLikes,
    toggleForumLike: toggleForumLike,
    isForumLiked: isForumLiked,
    getForumFavorites: getForumFavorites,
    toggleForumFavorite: toggleForumFavorite,
    isForumFavorited: isForumFavorited,
    getUserFavorites: getUserFavorites,
    getForumVotes: getForumVotes,
    addForumVote: addForumVote,
    updateForumVote: updateForumVote,
    findForumVote: findForumVote,
    getForumVoteByTopic: getForumVoteByTopic,
    castForumVote: castForumVote,
    checkAndEnableVoting: checkAndEnableVoting,
    getHotQuestions: getHotQuestions,
    addHotQuestion: addHotQuestion,
    updateHotQuestion: updateHotQuestion,
    findHotQuestion: findHotQuestion,
    convertQuestionToTopic: convertQuestionToTopic,
    getForumLogs: getForumLogs,
    addForumLog: addForumLog,
    getForumNotifications: getForumNotifications,
    setForumNotifications: setForumNotifications,
    addForumNotification: addForumNotification,
    markForumNotificationRead: markForumNotificationRead,
    getUnreadForumNotifications: getUnreadForumNotifications,
    // 众包任务管理
    getCrowdTasks: getCrowdTasks,
    setCrowdTasks: setCrowdTasks,
    addCrowdTask: addCrowdTask,
    updateCrowdTask: updateCrowdTask,
    findCrowdTask: findCrowdTask,
    deleteCrowdTask: deleteCrowdTask,
    getDispatchedCrowdTasks: getDispatchedCrowdTasks,
    joinCrowdTask: joinCrowdTask,
    claimSubTask: claimSubTask,
    completeSubTask: completeSubTask,
    endCrowdTaskRecruitment: endCrowdTaskRecruitment,
    checkCrowdTaskRecruitmentDeadline: checkCrowdTaskRecruitmentDeadline,
    getRecruitmentEndedTasks: getRecruitmentEndedTasks,
    // 众包任务论坛主题
    getCrowdTaskTopics: getCrowdTaskTopics,
    getCrowdTaskTopicsForOwnerFeed: getCrowdTaskTopicsForOwnerFeed,
    setCrowdTaskTopics: setCrowdTaskTopics,
    addCrowdTaskTopic: addCrowdTaskTopic,
    updateCrowdTaskTopic: updateCrowdTaskTopic,
    findCrowdTaskTopic: findCrowdTaskTopic,
    findCrowdTaskTopicByTaskId: findCrowdTaskTopicByTaskId,
    addCrowdTaskSubmission: addCrowdTaskSubmission,
    updateCrowdTaskSubmission: updateCrowdTaskSubmission,
    incrementCrowdTaskTopicViews: incrementCrowdTaskTopicViews,
    // 跳蚤市场管理
    getMarketItems: getMarketItems,
    setMarketItems: setMarketItems,
    addMarketItem: addMarketItem,
    updateMarketItem: updateMarketItem,
    findMarketItem: findMarketItem,
    deleteMarketItem: deleteMarketItem,
    getMarketFavorites: getMarketFavorites,
    toggleMarketFavorite: toggleMarketFavorite,
    isMarketFavorited: isMarketFavorited,
    getUserMarketFavorites: getUserMarketFavorites,
    getMarketMessages: getMarketMessages,
    addMarketMessage: addMarketMessage,
    markMarketMessageRead: markMarketMessageRead,
    getUnreadMarketMessages: getUnreadMarketMessages,
    setMarketFavorites: setMarketFavorites,
    initMarketTestData: initMarketTestData,
    // 党建引领总群管理
    getPartyGroupMessages: getPartyGroupMessages,
    setPartyGroupMessages: setPartyGroupMessages,
    addPartyGroupMessage: addPartyGroupMessage,
    markPartyGroupMessageRead: markPartyGroupMessageRead,
    getUnreadPartyGroupMessages: getUnreadPartyGroupMessages,
    getPartyGroupAnnouncements: getPartyGroupAnnouncements,
    setPartyGroupAnnouncements: setPartyGroupAnnouncements,
    addPartyGroupAnnouncement: addPartyGroupAnnouncement,
    updatePartyGroupAnnouncement: updatePartyGroupAnnouncement,
    deletePartyGroupAnnouncement: deletePartyGroupAnnouncement,
    getActivePartyGroupAnnouncements: getActivePartyGroupAnnouncements,
    getPartyActivities: getPartyActivities,
    setPartyActivities: setPartyActivities,
    addPartyActivity: addPartyActivity,
    updatePartyActivity: updatePartyActivity,
    findPartyActivity: findPartyActivity,
    signUpPartyActivity: signUpPartyActivity,
    cancelPartyActivitySignUp: cancelPartyActivitySignUp,
    getUpcomingPartyActivities: getUpcomingPartyActivities,
    getPartyMemberApplications: getPartyMemberApplications,
    setPartyMemberApplications: setPartyMemberApplications,
    addPartyMemberApplication: addPartyMemberApplication,
    updatePartyMemberApplication: updatePartyMemberApplication,
    findPartyMemberApplication: findPartyMemberApplication,
    getPartyMemberApplicationByUserId: getPartyMemberApplicationByUserId,
    getPartyMembers: getPartyMembers,
    setPartyMembers: setPartyMembers,
    addPartyMember: addPartyMember,
    updatePartyMember: updatePartyMember,
    findPartyMember: findPartyMember,
    findPartyMemberByUserId: findPartyMemberByUserId,
    isUserPartyMember: isUserPartyMember,
    getPartyStudyMaterials: getPartyStudyMaterials,
    setPartyStudyMaterials: setPartyStudyMaterials,
    addPartyStudyMaterial: addPartyStudyMaterial,
    updatePartyStudyMaterial: updatePartyStudyMaterial,
    findPartyStudyMaterial: findPartyStudyMaterial,
    incrementPartyStudyMaterialRead: incrementPartyStudyMaterialRead,
    getRequiredPartyStudyMaterials: getRequiredPartyStudyMaterials,
    getPartyStudyRecords: getPartyStudyRecords,
    setPartyStudyRecords: setPartyStudyRecords,
    addPartyStudyRecord: addPartyStudyRecord,
    updatePartyStudyRecord: updatePartyStudyRecord,
    getUserStudyRecords: getUserStudyRecords,
    getUserCompletedStudyCount: getUserCompletedStudyCount,
    // 业主群组管理
    getChatGroups: getChatGroups,
    setChatGroups: setChatGroups,
    seedChatGroups: seedChatGroups,
    addChatGroup: addChatGroup,
    updateChatGroup: updateChatGroup,
    findChatGroup: findChatGroup,
    deleteChatGroup: deleteChatGroup,
    getUserChatGroups: getUserChatGroups,
    joinChatGroup: joinChatGroup,
    leaveChatGroup: leaveChatGroup,
    setGroupAdmin: setGroupAdmin,
    removeGroupMember: removeGroupMember,
    updateGroupNotice: updateGroupNotice,
    // 群聊消息管理
    getChatMessages: getChatMessages,
    setChatMessages: setChatMessages,
    addChatMessage: addChatMessage,
    searchChatMessages: searchChatMessages,
    getChatMessagesByTimeRange: getChatMessagesByTimeRange,
    markMessagesRead: markMessagesRead,
    getUnreadMessageCount: getUnreadMessageCount,
    clearChatMessages: clearChatMessages,
    // 群聊通知设置
    getChatNotificationSettings: getChatNotificationSettings,
    setChatNotificationSettings: setChatNotificationSettings,
    getUserNotificationSetting: getUserNotificationSetting,
    updateNotificationSetting: updateNotificationSetting,
    // 业主身份验证与权限
    getOwnerPermissions: getOwnerPermissions,
    setOwnerPermissions: setOwnerPermissions,
    updateOwnerPermissions: updateOwnerPermissions,
    checkPermission: checkPermission,
    canCreateGroup: canCreateGroup,
    canManageGroup: canManageGroup,
    canSendWorkOrder: canSendWorkOrder,
    subscribe: subscribe,
    subscribeByStore: subscribeByStore,
    getMeta: getMeta,
    seedTickets: seedTickets,
    seedBulletins: seedBulletins,
    seedCouncilMeetings: seedCouncilMeetings,
    clearWorkOrderData: clearWorkOrderData,
    resetCouncilMeetings: function() {
      storage.removeItem(key('council_meetings'));
      seedCouncilMeetings();
      return getCouncilMeetings();
    }
  };

  if (storage && !storage.getItem(key('council_meetings_refreshed_v4'))) {
    storage.removeItem(key('council_meetings'));
    seedCouncilMeetings();
    storage.setItem(key('council_meetings_refreshed_v4'), '1');
    try { storage.removeItem(key('council_meetings_refreshed_v3')); } catch (e) {}
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = bridge;
  } else {
    global.EcosystemBridge = bridge;
  }
})(typeof window !== 'undefined' ? window : this);
