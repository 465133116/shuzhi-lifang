/**
 * 物业端 - 生态系统适配器
 * 工单列表与 EcosystemBridge 双向同步
 */
(function () {
  'use strict';
  var bridge = window.EcosystemBridge;
  if (!bridge) return;

  function badgeClass(urgency) {
    var u = { urgent: '紧急', normal: '一般', high: '紧急', low: '低' }[urgency] || urgency;
    if (u === '紧急') return 'urgent';
    if (u === '低') return 'low';
    return 'normal';
  }
  function statusBadge(status) {
    var statusMap = { pending: '待接单', dispatched: '待接单', processing: '处理中', review: '待验收', completed: '已验收', done: '已验收', 'pending_review': '待验收', 'pending_accept': '待验收' };
    var disp = statusMap[status] || status || '待接单';
    if (disp === '已完成') disp = '已验收';
    var c = 'info';
    if (disp === '处理中') c = 'warning';
    if (disp === '已验收') c = 'success';
    return '<span class="badge ' + c + ' col-status">' + disp + '</span>';
  }
  /** 标记列仅显示标签类数据：业委会已关注/督促、二次提交预警、超时、维修金申报、第2次派单预警。不显示问题描述等非标签内容。 */
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
  function actionCell(t) {
    var s = t.status || '';
    if (s === '待接单' || s === '已分派' || s === 'dispatched') return '<button type="button" class="btn small primary btn-accept"><i class="fas fa-hand-paper"></i> 接单</button> <button type="button" class="btn small outline btn-view">查看</button>';
    if (s === '处理中' || s === 'processing') return '<button type="button" class="btn small primary btn-submit-result">提交结果</button> <button type="button" class="btn small outline btn-view">查看</button>';
    if (s === '待验收' || s === 'pending_accept' || s === 'pending_review') return '<span class="text-muted">待业主验收</span> <button type="button" class="btn small outline btn-view">查看</button>';
    if (s === '维修金申报中') return '<button type="button" class="btn small btn-mf-status">查看工单状态</button> <button type="button" class="btn small outline btn-view">查看</button>';
    if (s === '已验收' || s === '已完成' || s === 'completed') return '<button type="button" class="btn small outline btn-view">查看</button> <button type="button" class="btn small btn-ticket-score">查看评分与评价</button>';
    return '<button type="button" class="btn small outline btn-view">查看</button>';
  }
  function typeDesc(t) {
    var typeMap = { repair: '报修', complaint: '投诉', suggestion: '建议', consult: '咨询' };
    var typeZh = typeMap[t.type] || t.type || '报修';
    var desc = (typeZh === '报修' || typeZh === '投诉' || typeZh === '建议') ? (typeZh + '-') : '';
    if (typeZh === '报修') desc += (t.room ? '报修' : '水电');
    else if (typeZh === '投诉') desc += (t.room ? '投诉' : '噪音');
    else if (typeZh === '建议') desc += '改进';
    else desc += '咨询';
    return desc;
  }

  function ticketToRow(t) {
    var Utils = window.EcosystemTicketUtils;
    if (Utils && typeof Utils.ticketToRowHtml === 'function') return Utils.ticketToRowHtml(t, 'property');
    var typeDescStr = t.typeDesc || (t.type + '-');
    if (t.type === '报修' && !t.typeDesc) typeDescStr = t.type + '-水电';
    if (t.type === '投诉' && !t.typeDesc) typeDescStr = t.type + '-噪音';
    if (t.type === '建议' && !t.typeDesc) typeDescStr = t.type + '-改进';
    var dateVal = t.date || (t.createTime ? t.createTime.slice(0, 10) : '');
    var statusMap = { pending: '待接单', dispatched: '待接单', '已分派': '待接单', processing: '处理中', review: '待验收', 'pending_review': '待验收', completed: '已验收', done: '已验收', mf: '维修金申报中' };
    var rowStatus = statusMap[t.status] || t.status || '待接单';
    var deadlineVal = (t.deadline || '').toString();
    if (deadlineVal && deadlineVal.length > 10) deadlineVal = deadlineVal.slice(0, 10);
    var typeMap = { repair: '报修', complaint: '投诉', suggestion: '建议', consult: '咨询' };
    var rowType = typeMap[t.type] || t.type || '报修';
    var urgencyMap = { urgent: '紧急', normal: '一般', high: '紧急', low: '低' };
    var rowUrgency = urgencyMap[t.urgency] || t.urgency || '一般';
    var tr = '<tr data-ticket-id="' + (t.id || '') + '" data-type="' + (rowType || '报修') + '" data-urgency="' + (rowUrgency || '一般') + '" data-room="' + (t.room || '') + '" data-date="' + dateVal + '" data-status="' + rowStatus + '" data-owner="' + (t.owner || '') + '" data-owner-name="' + (t.ownerName || '').replace(/"/g, '&quot;') + '" data-phone-mask="' + (t.phoneMask || '') + '" data-phone="' + (t.phone || '').replace(/"/g, '&quot;') + '" data-source="' + (t.source || '业主端') + '" data-create-time="' + (t.createTime || '') + '" data-deadline="' + (deadlineVal || '') + '" data-assignee="' + (t.assignee || '') + '"';
    if (t.mark) tr += ' data-mark="' + (t.mark || '').replace(/"/g, '&quot;') + '"';
    if (t.dispatchCount != null) tr += ' data-dispatch-count="' + t.dispatchCount + '"';
    if (t.committee) tr += ' data-committee="1" class="row-committee"';
    if (t.mfId) tr += ' data-mf-id="' + t.mfId + '" data-mf-submit-time="' + (t.mfSubmitTime || '') + '" data-mf-amount="' + (t.mfAmount || '') + '" data-mf-reason="' + (t.mfReason || '') + '"';
    if (t.score != null) tr += ' data-score="' + t.score + '" data-comment="' + (t.comment || '').replace(/"/g, '&quot;') + '"';
    tr += '><td><input type="checkbox" class="row-check"></td>';
    tr += '<td>' + (t.id || '') + '</td><td>' + (t.room || '') + '</td><td>' + typeDesc(t) + '</td><td>' + (t.source || '业主端') + '</td><td>' + (t.createTime || '') + '</td>';
    tr += '<td><span class="badge ' + badgeClass(t.urgency) + '">' + (rowUrgency || '一般') + '</span></td>';
    tr += '<td>' + markCell(t) + '</td><td>' + statusBadge(t.status) + '</td><td>' + actionCell(t) + '</td></tr>';
    return tr;
  }

  function syncFromBridge() {
    var tbody = document.getElementById('pendingTbody');
    if (!tbody) return;
    var list = bridge.getTickets();
    var html = '';
    if (list.length === 0) {
      html = '<tr id="pendingEmpty" class="empty-row"><td colspan="10" class="empty">暂无工单<br><small class="text-muted" style="font-size:12px;">业主提交的报修将在此展示，或点击右上角「新建工单」录入</small></td></tr>';
    } else {
      html = '<tr id="pendingEmpty" class="empty-row" style="display:none"><td colspan="10" class="empty">暂无工单</td></tr>';
      list.forEach(function (t) {
        html += ticketToRow(t);
      });
    }
    tbody.innerHTML = html;
    if (typeof window.updateCounts === 'function') window.updateCounts();
    if (typeof window.autoAcceptPendingTickets === 'function') window.autoAcceptPendingTickets();
    if (typeof window.applyPendingFilter === 'function') window.applyPendingFilter();
  }

  function rowToTicket(tr) {
    if (!tr || tr.classList.contains('empty-row')) return null;
    var id = tr.getAttribute('data-ticket-id');
    if (!id) return null;
    var cells = tr.querySelectorAll('td');
    var typeCell = cells[3];
    var typeStr = typeCell ? typeCell.textContent.trim() : '';
    return {
      id: id,
      type: tr.getAttribute('data-type') || '报修',
      urgency: tr.getAttribute('data-urgency') || '一般',
      room: tr.getAttribute('data-room') || '',
      date: tr.getAttribute('data-date') || '',
      status: tr.getAttribute('data-status') || '待接单',
      owner: tr.getAttribute('data-owner') || '',
      ownerName: tr.getAttribute('data-owner-name') || '',
      phoneMask: tr.getAttribute('data-phone-mask') || '',
      phone: tr.getAttribute('data-phone') || '',
      source: tr.getAttribute('data-source') || '业主端',
      createTime: tr.getAttribute('data-create-time') || '',
      deadline: tr.getAttribute('data-deadline') || '',
      assignee: tr.getAttribute('data-assignee') || '',
      committee: tr.getAttribute('data-committee') ? 1 : 0,
      mark: tr.getAttribute('data-mark') || (tr.querySelector('td:nth-child(8)') ? (tr.querySelector('td:nth-child(8)').innerHTML.trim() === '—' ? '' : tr.querySelector('td:nth-child(8)').textContent.trim()) : ''),
      mfId: tr.getAttribute('data-mf-id') || '',
      mfSubmitTime: tr.getAttribute('data-mf-submit-time') || '',
      mfAmount: tr.getAttribute('data-mf-amount') || '',
      mfReason: tr.getAttribute('data-mf-reason') || '',
      score: tr.getAttribute('data-score') || '',
      comment: tr.getAttribute('data-comment') || '',
      typeDesc: typeStr
    };
  }

  var debounceTimer;
  function syncToBridge() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      var tbody = document.getElementById('pendingTbody');
      if (!tbody) return;
      var rows = tbody.querySelectorAll('tr:not(.empty-row)');
      var list = [];
      rows.forEach(function (tr) {
        var t = rowToTicket(tr);
        if (!t) return;
        var existing = bridge.findTicket(t.id);
        if (existing && existing.supervisionOpinions && Array.isArray(existing.supervisionOpinions)) {
          t.supervisionOpinions = existing.supervisionOpinions;
        }
        if (existing && existing.committee) t.committee = existing.committee;
        if (existing && existing.mark) t.mark = existing.mark;
        if (existing && existing.extendReason) t.extendReason = existing.extendReason;
        if (existing && existing.extendedAt) t.extendedAt = existing.extendedAt;
        if (existing && (existing.handleResult != null || (existing.resultImages && existing.resultImages.length))) {
          t.handleResult = existing.handleResult;
          t.resultImages = existing.resultImages && Array.isArray(existing.resultImages) ? existing.resultImages : [];
        }
        if (existing && existing.images && Array.isArray(existing.images)) t.images = existing.images;
        if (existing && existing.typeDesc && (t.typeDesc === t.room || /^\d+-\d+(-\d+)?$/.test(String(t.typeDesc || '')))) t.typeDesc = existing.typeDesc;
        if (existing && existing.status === '待复核') t.status = '待复核';
        if (existing && existing.dispatchCount != null) t.dispatchCount = existing.dispatchCount;
        if (existing && existing.ownerName && !t.ownerName) t.ownerName = existing.ownerName;
        if (existing && existing.phone && !t.phone) t.phone = existing.phone;
        if (existing && existing.appealRecords && Array.isArray(existing.appealRecords)) {
          t.appealRecords = existing.appealRecords;
        }
        if (existing && existing.processingHistory && Array.isArray(existing.processingHistory)) {
          t.processingHistory = existing.processingHistory;
        }
        if (existing && existing.appealSubmitted) t.appealSubmitted = existing.appealSubmitted;
        if (existing && existing.appealReason) t.appealReason = existing.appealReason;
        if (existing && existing.appealImages && Array.isArray(existing.appealImages)) {
          t.appealImages = existing.appealImages;
        }
        if (existing && existing.appealTime) t.appealTime = existing.appealTime;
        if (existing && existing.appealSubmittedTime) t.appealSubmittedTime = existing.appealSubmittedTime;
        if (existing && existing.reprocessReason) t.reprocessReason = existing.reprocessReason;
        if (existing && existing.processRecords && Array.isArray(existing.processRecords)) {
          t.processRecords = existing.processRecords;
        }
        list.push(t);
      });
      bridge.setTickets(list);
    }, 100);
  }

  function init() {
    syncFromBridge();
    var tbody = document.getElementById('pendingTbody');
    if (tbody) {
      var mo = new MutationObserver(function () { syncToBridge(); });
      mo.observe(tbody, { childList: true, subtree: true });
    }
    bridge.subscribe(function (store) {
      if (store === 'tickets') syncFromBridge();
    });
    window.ecosystemSyncFromBridge = syncFromBridge;
    window.ecosystemSyncToBridge = syncToBridge;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
