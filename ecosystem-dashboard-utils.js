/**
 * 数治理方 - 五端生态仪表盘统计工具
 * 提供工单指标、风险预警等通用计算，供物业端、业委会端复用
 */
(function (global) {
  'use strict';

  /** 从工单列表计算通用指标 */
  function computeTicketMetrics(tickets) {
    var list = Array.isArray(tickets) ? tickets : [];
    var today = new Date().toISOString().slice(0, 10);
    return {
      pending: list.filter(function(t) { var s = t.status || ''; return s === '待接单' || s === '已分派'; }).length,
      processing: list.filter(function(t) { return (t.status || '') === '处理中'; }).length,
      review: list.filter(function(t) { var s = t.status || ''; return s === '待验收'; }).length,
      completed: list.filter(function(t) { var s = t.status || ''; return s === '已验收' || s === '已完成'; }).length,
      todayCompleted: list.filter(function(t) {
        var s = t.status || '';
        if (s !== '已验收' && s !== '已完成') return false;
        var dt = (t.resolvedAt || t.acceptedAt || t.createTime || '').toString().slice(0, 10);
        return dt === today;
      }).length,
      overtime: list.filter(function(t) {
        var s = t.status || '';
        if (s === '已验收' || s === '已完成') return false;
        return (t.mark || '').indexOf('超时') !== -1 || (t.mark || '').indexOf('AI判定超时') !== -1;
      }).length,
      dispatch2: list.filter(function(t) {
        return (t.dispatchCount || 0) >= 2 || ((t.mark || '').indexOf('第2次派单预警') !== -1);
      }).length,
      committeeUrged: list.filter(function(t) {
        if (t.status === '已验收' || t.status === '已完成') return false;
        return !!(t.committee || (t.mark || '').indexOf('业委会') !== -1);
      }).length,
      dispute: list.filter(function(t) { return (t.status || '') === '待复核'; }).length
    };
  }

  /** 从工单生成风险预警列表 [{ level, text, id }] */
  function computeRiskAlerts(tickets, options) {
    options = options || {};
    var list = Array.isArray(tickets) ? tickets : [];
    var alerts = [];
    var overtime = list.filter(function(t) {
      var s = t.status || '';
      if (s === '已验收' || s === '已完成') return false;
      return (t.mark || '').indexOf('超时') !== -1 || (t.mark || '').indexOf('AI判定超时') !== -1;
    });
    var dispatch2 = list.filter(function(t) {
      return (t.dispatchCount || 0) >= 2 || ((t.mark || '').indexOf('第2次派单预警') !== -1);
    });
    var committeeUrged = list.filter(function(t) {
      if (t.status === '已验收' || t.status === '已完成') return false;
      return !!(t.committee || (t.mark || '').indexOf('业委会') !== -1);
    });
    overtime.forEach(function(t) {
      alerts.push({ level: 'danger', text: '工单 ' + (t.id || '') + ' 超时未处理', id: t.id });
    });
    dispatch2.forEach(function(t) {
      if (!alerts.some(function(a) { return a.id === t.id && a.text.indexOf('第2次派单') !== -1; })) {
        alerts.push({ level: 'danger', text: '工单 ' + (t.id || '') + ' 第2次派单预警', id: t.id });
      }
    });
    committeeUrged.forEach(function(t) {
      if (!alerts.some(function(a) { return a.id === t.id; })) {
        alerts.push({ level: 'warning', text: '工单 ' + (t.id || '') + ' 业委会已督促', id: t.id });
      }
    });
    if (options.maxCount && alerts.length > options.maxCount) alerts = alerts.slice(0, options.maxCount);
    return alerts;
  }

  /** 计算合规得分（0-100），扣除项：待复核会议、超时、第2次派单、草稿公告、争议工单 */
  function computeComplianceScore(params) {
    params = params || {};
    var overdueCount = params.overdueCount || 0;
    var dispatch2Count = params.dispatch2Count || 0;
    var disputeCount = params.disputeCount || 0;
    var pendingReview = params.pendingReview || 0;
    var draftAnn = params.draftAnn || 0;
    return Math.max(0, 100 - pendingReview * 5 - overdueCount * 8 - dispatch2Count * 10 - draftAnn * 3 - disputeCount * 5);
  }

  var DashboardUtils = {
    computeTicketMetrics: computeTicketMetrics,
    computeRiskAlerts: computeRiskAlerts,
    computeComplianceScore: computeComplianceScore
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardUtils;
  } else {
    global.EcosystemDashboardUtils = DashboardUtils;
  }
})(typeof window !== 'undefined' ? window : this);
