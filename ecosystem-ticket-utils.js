/**
 * 数治理方 - 五端生态工单展示工具
 * 提供工单行的 badge、status、mark 等格式化函数，供物业端、业委会端、社区端复用
 * 依赖：EcosystemBridge（各端页面自行引入 ecosystem-bridge.js）
 */
(function (global) {
  'use strict';

  function urgencyToZh(u) {
    var map = { urgent: '紧急', normal: '一般', high: '紧急', low: '低', medium: '一般' };
    return map[u] || u;
  }
  function badgeClass(urgency) {
    var u = urgencyToZh(urgency) || urgency;
    if (u === '紧急') return 'urgent';
    if (u === '低') return 'low';
    return 'normal';
  }

  /** 英文状态映射为中文 */
  function statusToZh(s) {
    var map = { pending: '待接单', dispatched: '待接单', processing: '处理中', review: '待验收', completed: '已验收', done: '已验收', 'pending_review': '待验收', 'pending_accept': '待接单', mf: '维修金申报中' };
    return map[s] || s;
  }
  function statusBadge(status) {
    var disp = statusToZh(status) || '待接单';
    if (disp === '已完成') disp = '已验收';
    var c = 'info';
    if (disp === '处理中') c = 'warning';
    if (disp === '已验收') c = 'success';
    return '<span class="badge ' + c + ' col-status">' + disp + '</span>';
  }

  /** 标记列：业委会督促、超时、第2次派单等 */
  function markCell(t) {
    var parts = [];
    if (t.mark === '业委会已督促' || (t.committee && t.mark === '业委会已督促')) parts.push('<span class="badge committee">业委会已督促</span>');
    else if (t.committee || t.mark === '业委会已关注') parts.push('<span class="badge committee">业委会已关注</span>');
    if (t.mark === '二次提交预警') parts.push('<span class="badge warning-repeat">二次提交预警</span>');
    if (t.mark === 'AI判定超时' || (t.mark && t.mark.indexOf('超时') !== -1)) parts.push('<span class="badge timeout">AI判定超时</span>');
    if (t.mark === '已关联维修金申报') parts.push('<span class="badge">已关联维修金申报</span>');
    if ((t.dispatchCount >= 2) || (t.mark && t.mark.indexOf('第2次派单预警') !== -1)) parts.push('<span class="badge badge-second-dispatch">第2次派单预警</span>');
    if (parts.length) return parts.join(' ');
    return '—';
  }

  /** 英文类型映射为中文 */
  function typeToZh(tp) {
    var map = { repair: '报修', complaint: '投诉', suggestion: '建议', consult: '咨询' };
    return map[tp] || tp;
  }
  function typeDesc(t) {
    var typeZh = typeToZh(t.type) || t.type || '报修';
    var d = t.typeDesc || '';
    if (d) return d;
    if (typeZh === '报修') return (t.room ? '报修-' : '报修-') + (t.room ? '报修' : '水电');
    if (typeZh === '投诉') return '投诉-' + (t.room ? '投诉' : '噪音');
    if (typeZh === '建议') return '建议-改进';
    return (typeZh || '报修') + '-';
  }

  function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /** mode: property(物业) | community(社区) | council(业委会监督) */
  function ticketToRowHtml(ticket, mode) {
    mode = mode || 'property';
    var t = ticket || {};
    var id = t.id || '';
    var room = t.room || '';
    var typeStr = typeDesc(t);
    var source = t.source || '业主端';
    var createTime = (t.createTime || '').slice(0, 16);
    var urgency = urgencyToZh(t.urgency) || t.urgency || '一般';
    var status = (t.status === '已分派' || t.status === 'pending' || t.status === 'dispatched') ? '待接单' : (statusToZh(t.status) || t.status || '待接单');
    var assignee = t.assignee || (status === '待验收' || status === '已验收' ? '物业' : '物业');

    if (mode === 'community') {
      var statusTag = status === '待接单' ? 'status-pending' : status === '处理中' ? 'status-processing' : (status === '待验收' || status === '维修金申报中') ? 'status-processing' : status === '已验收' ? 'status-done' : '';
      var op = (status === '待接单' || status === '处理中') ? '<button type="button" class="btn btn-ghost btn-ticket-judge">研判</button>' : '<button type="button" class="btn btn-ghost btn-ticket-view">查看</button>';
      return '<tr class="ticket-row" data-id="' + esc(id) + '" data-community="' + esc(room) + '" data-type="' + esc(t.type || '报修') + '" data-severity="' + esc(urgency) + '" data-source="' + esc(source) + '" data-assignee="' + esc(assignee) + '" data-status="' + esc(status) + '" data-title="' + esc(t.typeDesc || t.type || '') + '">' +
        '<td>' + esc(room) + '</td><td>#' + esc(id) + '</td><td>' + esc(t.type || '报修') + '</td><td>' + esc(urgency) + '</td><td>' + esc(source) + '</td><td>' + esc(assignee) + '</td>' +
        '<td><span class="status-tag ' + statusTag + '">' + esc(status) + '</span></td><td>' + esc(createTime) + '</td><td>' + op + '</td></tr>';
    }

    if (mode === 'property') {
      var dateVal = (t.date || (t.createTime || '').slice(0, 10));
      var deadlineVal = (t.deadline || '').toString();
      if (deadlineVal && deadlineVal.length > 10) deadlineVal = deadlineVal.slice(0, 10);
      var rowType = typeToZh(t.type) || t.type || '报修';
      var tr = '<tr data-ticket-id="' + esc(id) + '" data-type="' + esc(rowType) + '" data-urgency="' + esc(urgency) + '" data-room="' + esc(room) + '" data-date="' + esc(dateVal) + '" data-status="' + esc(status) + '" data-owner="' + esc(t.owner || '') + '" data-owner-name="' + esc(t.ownerName || '') + '" data-phone-mask="' + esc(t.phoneMask || '') + '" data-phone="' + esc(t.phone || '') + '" data-source="' + esc(source) + '" data-create-time="' + esc(t.createTime || '') + '" data-deadline="' + esc(deadlineVal) + '" data-assignee="' + esc(t.assignee || '') + '"';
      if (t.mark) tr += ' data-mark="' + esc(t.mark) + '"';
      if (t.dispatchCount != null) tr += ' data-dispatch-count="' + t.dispatchCount + '"';
      if (t.committee) tr += ' data-committee="1" class="row-committee"';
      if (t.mfId) tr += ' data-mf-id="' + esc(t.mfId) + '" data-mf-submit-time="' + esc(t.mfSubmitTime || '') + '" data-mf-amount="' + esc(t.mfAmount || '') + '" data-mf-reason="' + esc(t.mfReason || '') + '"';
      if (t.score != null) tr += ' data-score="' + t.score + '" data-comment="' + esc(t.comment || '') + '"';
      var actionCell = (status === '待接单' || status === '已分派') ? '<button type="button" class="btn small primary btn-accept"><i class="fas fa-hand-paper"></i> 接单</button> <button type="button" class="btn small outline btn-view">查看</button>' :
        status === '处理中' ? '<button type="button" class="btn small primary btn-submit-result">提交结果</button> <button type="button" class="btn small outline btn-view">查看</button>' :
        status === '待验收' ? '<span class="text-muted">待业主验收</span> <button type="button" class="btn small outline btn-view">查看</button>' :
        status === '维修金申报中' ? '<button type="button" class="btn small btn-mf-status">查看工单状态</button> <button type="button" class="btn small outline btn-view">查看</button>' :
        (status === '已验收' || status === '已完成') ? '<button type="button" class="btn small outline btn-view">查看</button> <button type="button" class="btn small btn-ticket-score">查看评分与评价</button>' :
        '<button type="button" class="btn small outline btn-view">查看</button>';
      tr += '><td><input type="checkbox" class="row-check"></td>';
      tr += '<td>' + esc(id) + '</td><td>' + esc(room) + '</td><td>' + esc(typeStr) + '</td><td>' + esc(source) + '</td><td>' + esc(createTime) + '</td>';
      tr += '<td><span class="badge ' + badgeClass(urgency) + '">' + esc(urgencyToZh(urgency) || urgency) + '</span></td>';
      tr += '<td>' + markCell(t) + '</td><td>' + statusBadge(status) + '</td><td>' + actionCell + '</td></tr>';
      return tr;
    }

    return '<tr data-ticket-id="' + esc(id) + '"><td>' + esc(id) + '</td><td>' + esc(room) + '</td><td>' + esc(typeStr) + '</td><td>' + esc(status) + '</td></tr>';
  }

  var TicketUtils = {
    badgeClass: badgeClass,
    statusBadge: statusBadge,
    markCell: markCell,
    typeDesc: typeDesc,
    ticketToRowHtml: ticketToRowHtml,
    esc: esc
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TicketUtils;
  } else {
    global.EcosystemTicketUtils = TicketUtils;
  }
})(typeof window !== 'undefined' ? window : this);
