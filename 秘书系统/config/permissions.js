/**
 * 数治理方 · 秘书版 · 权限配置
 * 
 * 使用方式：各端口引入本文件后调用 checkPermission(role, module, action, mode)
 * 设计依据：沪房物业〔2026〕36号 + 沪住建建议复〔2018〕23号
 * 
 * 权限级别：NONE(0) < VIEW(1) < CREATE(2) < EDIT(3) < APPROVE(4) < MANAGE(5)
 * 权限继承：上级权限自动拥有下级权限（如 MANAGE → 拥有 V+C+E+A+M）
 */

(function (global) {
  'use strict';

  // ===== 权限级别定义 =====
  var LEVEL = {
    NONE: 0,
    VIEW: 1,
    CREATE: 2,
    EDIT: 3,
    APPROVE: 4,
    MANAGE: 5
  };

  // ===== 角色定义 =====
  var ROLES = {
    SECRETARY:    'secretary',      // 秘书 — 第6条"配备"
    DIRECTOR:     'director',       // 业委会主任 — 第1/7条
    COMMITTEE:    'committee',      // 业委会委员 — 第4条"业主担任"
    PROPERTY:     'property',       // 物业人员 — 第6条被监督方
    NEIGHBORHOOD: 'neighborhood',   // 居委 — 第15条指导监督
    STREET:       'street',         // 街镇 — 第3/15/17/18条
    OWNER:        'owner'           // 业主 — 第8/16条
  };

  // ===== 模块定义 =====
  var MODULES = {
    RECEPTION:     'reception',      // 业主接待
    WORKORDER:     'workorder',      // 工单协同
    COLLECTION:    'collection',     // 催缴辅助
    SMS:           'sms',            // 短信发送
    MEETING:       'meeting',        // 会议管理
    INFOPUB:       'infopub',        // 信息公开
    ARCHIVE:       'archive',        // 档案管理
    SEAL:          'seal',           // 印章管理
    ELECTION:      'election',       // 选举辅助
    FINANCE:       'finance',        // 财务辅助
    TRAINING:      'training',       // 培训管理
    COMPLIANCE:    'compliance'      // 合规引擎
  };

  // ===== 部署模式 =====
  var MODES = {
    FULL:    'in_charge',    // 在管模式 — 12模块
    DUAL:    'dual_track',   // 双轨模式 — 9模块（冻结印章/财务/培训）
    P1:      'p1'            // P1模式 — 4模块（接待/工单/催缴/短信）
  };

  // ===== 各模式下启用的模块 =====
  var MODE_MODULES = {};
  MODE_MODULES[MODES.FULL] = [
    MODULES.RECEPTION, MODULES.WORKORDER, MODULES.COLLECTION, MODULES.SMS,
    MODULES.MEETING, MODULES.INFOPUB, MODULES.ARCHIVE, MODULES.SEAL,
    MODULES.ELECTION, MODULES.FINANCE, MODULES.TRAINING, MODULES.COMPLIANCE
  ];
  MODE_MODULES[MODES.DUAL] = [
    MODULES.RECEPTION, MODULES.WORKORDER, MODULES.COLLECTION, MODULES.SMS,
    MODULES.MEETING, MODULES.INFOPUB, MODULES.ARCHIVE,
    MODULES.ELECTION, MODULES.COMPLIANCE
  ];
  MODE_MODULES[MODES.P1] = [
    MODULES.RECEPTION, MODULES.WORKORDER, MODULES.COLLECTION, MODULES.SMS,
    MODULES.COMPLIANCE
  ];

  // ===== 权限矩阵 =====
  // 格式：PERMISSIONS[role][module][action] = LEVEL
  // 未定义 = NONE(0)

  // --- 动作键常量 ---
  var ACT = {
    // 通用
    VIEW_ALL:         'view_all',          // 查看全部
    VIEW_OWN:         'view_own',          // 查看自己相关的
    // 业主接待
    REC_CREATE:       'rec_create',        // 创建接待记录
    REC_CALL_RESULT:  'rec_call_result',   // 标注通话结果
    REC_FOLLOWUP:     'rec_followup',      // 管理回访队列
    // 工单协同
    WO_CREATE:        'wo_create',         // 创建工单
    WO_PROCESS:       'wo_process',        // 接单/处理/回单（物业专用）
    WO_CLOSE:         'wo_close',          // 闭环确认
    WO_CONFIG_SLA:    'wo_config_sla',     // 配置SLA/升级链
    // 催缴辅助
    COL_RECORD:       'col_record',        // 记录催缴行为
    // 短信
    SMS_SEND:         'sms_send',          // 手动发送
    SMS_CONFIG_AUTO:  'sms_config_auto',   // 配置自动触发
    // 会议管理
    MTG_INITIATE:     'mtg_initiate',      // 发起会议/发通知
    MTG_MINUTES:      'mtg_minutes',       // 记录纪要
    MTG_VOTE:         'mtg_vote',          // 投票
    MTG_PUBLISH:      'mtg_publish',       // 决议发布
    // 信息公开
    INF_PUBLISH:      'inf_publish',       // 发布/更新公示
    INF_QUERY_SELF:   'inf_query_self',    // 业主查询本人数据
    // 档案
    ARC_ARCHIVE:      'arc_archive',       // 归档/更新
    ARC_BORROW:       'arc_borrow',        // 借阅登记
    // 印章
    SEAL_APPLY:       'seal_apply',        // 提交用印申请
    SEAL_APPROVE:     'seal_approve',      // 审批（保管人）
    SEAL_FINAL:       'seal_final',        // 最终审批（主任）
    // 选举
    ELEC_MANAGE:      'elec_manage',       // 管理候选人库/资格审查
    ELEC_VOTE_COUNT:  'elec_vote_count',   // 投票/计票
    // 财务
    FIN_RECORD:       'fin_record',        // 录入台账
    FIN_APPROVE:      'fin_approve',       // 审批预算/支出
    // 培训
    TRN_MANAGE:       'trn_manage',        // 管理排期/报名
    // 合规
    CMP_CONFIG:       'cmp_config',        // 配置规则参数
    CMP_DISCIPLINE:   'cmp_discipline',    // 约谈/发函（监管方）
  };

  // ===== 完整权限矩阵 =====
  var PERMISSIONS = {};

  // --- 秘书 ---
  PERMISSIONS[ROLES.SECRETARY] = {};
  PERMISSIONS[ROLES.SECRETARY][MODULES.RECEPTION]  = { _default: LEVEL.MANAGE };
  PERMISSIONS[ROLES.SECRETARY][MODULES.WORKORDER]   = { _default: LEVEL.VIEW, wo_create: LEVEL.CREATE, wo_close: LEVEL.EDIT };
  PERMISSIONS[ROLES.SECRETARY][MODULES.COLLECTION]  = { _default: LEVEL.VIEW, col_record: LEVEL.CREATE };
  PERMISSIONS[ROLES.SECRETARY][MODULES.SMS]         = { _default: LEVEL.VIEW, sms_send: LEVEL.MANAGE };
  PERMISSIONS[ROLES.SECRETARY][MODULES.MEETING]     = { _default: LEVEL.VIEW, mtg_initiate: LEVEL.CREATE, mtg_minutes: LEVEL.CREATE, mtg_publish: LEVEL.CREATE };
  PERMISSIONS[ROLES.SECRETARY][MODULES.INFOPUB]     = { _default: LEVEL.VIEW, inf_publish: LEVEL.CREATE };
  PERMISSIONS[ROLES.SECRETARY][MODULES.ARCHIVE]     = { _default: LEVEL.EDIT, arc_archive: LEVEL.CREATE, arc_borrow: LEVEL.CREATE };
  PERMISSIONS[ROLES.SECRETARY][MODULES.SEAL]        = { _default: LEVEL.VIEW, seal_apply: LEVEL.CREATE };
  PERMISSIONS[ROLES.SECRETARY][MODULES.ELECTION]    = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.SECRETARY][MODULES.FINANCE]     = { _default: LEVEL.VIEW, fin_record: LEVEL.CREATE };
  PERMISSIONS[ROLES.SECRETARY][MODULES.TRAINING]    = { _default: LEVEL.VIEW, trn_manage: LEVEL.CREATE };
  PERMISSIONS[ROLES.SECRETARY][MODULES.COMPLIANCE]  = { _default: LEVEL.VIEW };

  // --- 业委会主任 ---
  PERMISSIONS[ROLES.DIRECTOR] = {};
  PERMISSIONS[ROLES.DIRECTOR][MODULES.RECEPTION]    = { _default: LEVEL.VIEW, rec_create: LEVEL.CREATE };
  PERMISSIONS[ROLES.DIRECTOR][MODULES.WORKORDER]    = { _default: LEVEL.VIEW, wo_create: LEVEL.CREATE, wo_close: LEVEL.APPROVE, wo_config_sla: LEVEL.MANAGE };
  PERMISSIONS[ROLES.DIRECTOR][MODULES.COLLECTION]   = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.DIRECTOR][MODULES.SMS]          = { _default: LEVEL.VIEW, sms_config_auto: LEVEL.MANAGE };
  PERMISSIONS[ROLES.DIRECTOR][MODULES.MEETING]      = { _default: LEVEL.VIEW, mtg_initiate: LEVEL.MANAGE, mtg_minutes: LEVEL.EDIT, mtg_vote: LEVEL.CREATE, mtg_publish: LEVEL.APPROVE };
  PERMISSIONS[ROLES.DIRECTOR][MODULES.INFOPUB]      = { _default: LEVEL.VIEW, inf_publish: LEVEL.APPROVE };
  PERMISSIONS[ROLES.DIRECTOR][MODULES.ARCHIVE]      = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.DIRECTOR][MODULES.SEAL]         = { _default: LEVEL.VIEW, seal_apply: LEVEL.CREATE, seal_approve: LEVEL.APPROVE, seal_final: LEVEL.APPROVE };
  PERMISSIONS[ROLES.DIRECTOR][MODULES.ELECTION]     = { _default: LEVEL.VIEW, elec_manage: LEVEL.MANAGE };
  PERMISSIONS[ROLES.DIRECTOR][MODULES.FINANCE]      = { _default: LEVEL.VIEW, fin_record: LEVEL.EDIT, fin_approve: LEVEL.APPROVE };
  PERMISSIONS[ROLES.DIRECTOR][MODULES.TRAINING]     = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.DIRECTOR][MODULES.COMPLIANCE]   = { _default: LEVEL.VIEW, cmp_config: LEVEL.MANAGE };

  // --- 业委会委员 ---
  PERMISSIONS[ROLES.COMMITTEE] = {};
  PERMISSIONS[ROLES.COMMITTEE][MODULES.RECEPTION]   = { _default: LEVEL.VIEW, rec_create: LEVEL.CREATE };
  PERMISSIONS[ROLES.COMMITTEE][MODULES.WORKORDER]   = { _default: LEVEL.VIEW, wo_create: LEVEL.CREATE };
  PERMISSIONS[ROLES.COMMITTEE][MODULES.COLLECTION]  = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.COMMITTEE][MODULES.SMS]         = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.COMMITTEE][MODULES.MEETING]     = { _default: LEVEL.VIEW, mtg_initiate: LEVEL.CREATE, mtg_minutes: LEVEL.CREATE, mtg_vote: LEVEL.CREATE };
  PERMISSIONS[ROLES.COMMITTEE][MODULES.INFOPUB]     = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.COMMITTEE][MODULES.ARCHIVE]     = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.COMMITTEE][MODULES.SEAL]        = { _default: LEVEL.VIEW, seal_apply: LEVEL.CREATE, seal_approve: LEVEL.APPROVE };
  PERMISSIONS[ROLES.COMMITTEE][MODULES.ELECTION]    = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.COMMITTEE][MODULES.FINANCE]     = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.COMMITTEE][MODULES.TRAINING]    = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.COMMITTEE][MODULES.COMPLIANCE]  = { _default: LEVEL.VIEW };

  // --- 物业人员 ---
  PERMISSIONS[ROLES.PROPERTY] = {};
  PERMISSIONS[ROLES.PROPERTY][MODULES.RECEPTION]    = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.PROPERTY][MODULES.WORKORDER]    = { _default: LEVEL.VIEW, wo_process: LEVEL.EDIT };
  PERMISSIONS[ROLES.PROPERTY][MODULES.COLLECTION]   = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.PROPERTY][MODULES.SMS]          = { _default: LEVEL.NONE };
  PERMISSIONS[ROLES.PROPERTY][MODULES.MEETING]      = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.PROPERTY][MODULES.INFOPUB]      = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.PROPERTY][MODULES.ARCHIVE]      = { _default: LEVEL.NONE };
  PERMISSIONS[ROLES.PROPERTY][MODULES.SEAL]         = { _default: LEVEL.NONE };
  PERMISSIONS[ROLES.PROPERTY][MODULES.ELECTION]     = { _default: LEVEL.NONE };
  PERMISSIONS[ROLES.PROPERTY][MODULES.FINANCE]      = { _default: LEVEL.NONE };
  PERMISSIONS[ROLES.PROPERTY][MODULES.TRAINING]     = { _default: LEVEL.NONE };
  PERMISSIONS[ROLES.PROPERTY][MODULES.COMPLIANCE]   = { _default: LEVEL.VIEW };

  // --- 居委人员 ---
  PERMISSIONS[ROLES.NEIGHBORHOOD] = {};
  PERMISSIONS[ROLES.NEIGHBORHOOD][MODULES.RECEPTION]    = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.NEIGHBORHOOD][MODULES.WORKORDER]    = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.NEIGHBORHOOD][MODULES.COLLECTION]   = { _default: LEVEL.NONE };
  PERMISSIONS[ROLES.NEIGHBORHOOD][MODULES.SMS]          = { _default: LEVEL.NONE };
  PERMISSIONS[ROLES.NEIGHBORHOOD][MODULES.MEETING]      = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.NEIGHBORHOOD][MODULES.INFOPUB]      = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.NEIGHBORHOOD][MODULES.ARCHIVE]      = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.NEIGHBORHOOD][MODULES.SEAL]         = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.NEIGHBORHOOD][MODULES.ELECTION]     = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.NEIGHBORHOOD][MODULES.FINANCE]      = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.NEIGHBORHOOD][MODULES.TRAINING]     = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.NEIGHBORHOOD][MODULES.COMPLIANCE]   = { _default: LEVEL.VIEW };

  // --- 街镇人员 ---
  PERMISSIONS[ROLES.STREET] = {};
  PERMISSIONS[ROLES.STREET][MODULES.RECEPTION]      = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.STREET][MODULES.WORKORDER]      = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.STREET][MODULES.COLLECTION]     = { _default: LEVEL.NONE };
  PERMISSIONS[ROLES.STREET][MODULES.SMS]            = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.STREET][MODULES.MEETING]        = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.STREET][MODULES.INFOPUB]        = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.STREET][MODULES.ARCHIVE]        = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.STREET][MODULES.SEAL]           = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.STREET][MODULES.ELECTION]       = { _default: LEVEL.VIEW, elec_vote_count: LEVEL.MANAGE };
  PERMISSIONS[ROLES.STREET][MODULES.FINANCE]        = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.STREET][MODULES.TRAINING]       = { _default: LEVEL.VIEW, trn_manage: LEVEL.MANAGE };
  PERMISSIONS[ROLES.STREET][MODULES.COMPLIANCE]     = { _default: LEVEL.VIEW, cmp_discipline: LEVEL.MANAGE };

  // --- 业主 ---
  PERMISSIONS[ROLES.OWNER] = {};
  PERMISSIONS[ROLES.OWNER][MODULES.RECEPTION]       = { _default: LEVEL.NONE, rec_create: LEVEL.CREATE };
  PERMISSIONS[ROLES.OWNER][MODULES.WORKORDER]       = { _default: LEVEL.NONE, view_own: LEVEL.VIEW, wo_create: LEVEL.CREATE, wo_close: LEVEL.EDIT };
  PERMISSIONS[ROLES.OWNER][MODULES.COLLECTION]      = { _default: LEVEL.NONE, view_own: LEVEL.VIEW };
  PERMISSIONS[ROLES.OWNER][MODULES.SMS]             = { _default: LEVEL.NONE };
  PERMISSIONS[ROLES.OWNER][MODULES.MEETING]         = { _default: LEVEL.VIEW, mtg_vote: LEVEL.CREATE };
  PERMISSIONS[ROLES.OWNER][MODULES.INFOPUB]         = { _default: LEVEL.VIEW, inf_query_self: LEVEL.VIEW };
  PERMISSIONS[ROLES.OWNER][MODULES.ARCHIVE]         = { _default: LEVEL.NONE };
  PERMISSIONS[ROLES.OWNER][MODULES.SEAL]            = { _default: LEVEL.NONE };
  PERMISSIONS[ROLES.OWNER][MODULES.ELECTION]        = { _default: LEVEL.VIEW, elec_vote_count: LEVEL.CREATE };
  PERMISSIONS[ROLES.OWNER][MODULES.FINANCE]         = { _default: LEVEL.VIEW };
  PERMISSIONS[ROLES.OWNER][MODULES.TRAINING]        = { _default: LEVEL.NONE };
  PERMISSIONS[ROLES.OWNER][MODULES.COMPLIANCE]      = { _default: LEVEL.VIEW };

  // ===== 核心API =====

  /**
   * 检查模块在当前模式下是否启用
   * @param {string} module - 模块名
   * @param {string} mode - 部署模式
   * @returns {boolean}
   */
  function isModuleEnabled(module, mode) {
    var enabled = MODE_MODULES[mode] || MODE_MODULES[MODES.P1];
    return enabled.indexOf(module) !== -1;
  }

  /**
   * 获取角色在指定模块和动作上的权限级别
   * @param {string} role - 角色
   * @param {string} module - 模块
   * @param {string} action - 动作（可选，默认查询模块级默认权限）
   * @returns {number} 权限级别
   */
  function getPermissionLevel(role, module, action) {
    var rolePerms = PERMISSIONS[role];
    if (!rolePerms) return LEVEL.NONE;

    var modPerms = rolePerms[module];
    if (!modPerms) return LEVEL.NONE;

    if (action && modPerms.hasOwnProperty(action)) {
      return modPerms[action];
    }

    // 返回模块默认权限
    return modPerms._default !== undefined ? modPerms._default : LEVEL.NONE;
  }

  /**
   * 检查权限
   * @param {string} role - 角色
   * @param {string} module - 模块
   * @param {string} action - 动作
   * @param {string} mode - 部署模式
   * @param {number} requiredLevel - 要求的权限级别
   * @returns {boolean}
   */
  function checkPermission(role, module, action, mode, requiredLevel) {
    // 1. 模块未启用 → false
    if (!isModuleEnabled(module, mode || MODES.P1)) return false;

    // 2. 获取权限级别
    var userLevel = getPermissionLevel(role, module, action);

    // 3. 权限继承：高级别自动满足低级别
    // MANAGE(5) > APPROVE(4) > EDIT(3) > CREATE(2) > VIEW(1) > NONE(0)
    var req = requiredLevel !== undefined ? requiredLevel : LEVEL.VIEW;
    return userLevel >= req;
  }

  /**
   * 获取角色可访问的模块列表
   * @param {string} role - 角色
   * @param {string} mode - 部署模式
   * @returns {string[]}
   */
  function getAccessibleModules(role, mode) {
    var enabled = MODE_MODULES[mode] || MODE_MODULES[MODES.P1];
    return enabled.filter(function(mod) {
      return getPermissionLevel(role, mod) > LEVEL.NONE;
    });
  }

  // ===== 导出 =====
  var Permissions = {
    LEVEL: LEVEL,
    ROLES: ROLES,
    MODULES: MODULES,
    MODES: MODES,
    ACT: ACT,
    isModuleEnabled: isModuleEnabled,
    getPermissionLevel: getPermissionLevel,
    checkPermission: checkPermission,
    getAccessibleModules: getAccessibleModules,
    MODE_MODULES: MODE_MODULES,
    PERMISSIONS: PERMISSIONS
  };

  // CommonJS / AMD / Global
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Permissions;
  } else if (typeof define === 'function' && define.amd) {
    define(function () { return Permissions; });
  } else {
    global.SGZF_Permissions = Permissions;
  }

})(typeof window !== 'undefined' ? window : this);
