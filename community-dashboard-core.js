(function() {
    'use strict';

    const DashboardDatabase = {
        _data: {
            lastUpdate: new Date().toISOString(),
            refreshInterval: 30000,

            communities: [
                { id: 'js-garden', name: '江上花园', totalOwners: 1256, totalResidents: 3200 },
                { id: 'sunshine', name: '阳光小区', totalOwners: 890, totalResidents: 2100 },
                { id: 'happiness', name: '幸福里', totalOwners: 650, totalResidents: 1580 }
            ],

            keyIndicators: {
                reports: { value: 12, trend: 14, trendType: 'up', unit: '件', label: '本月新增通报' },
                satisfaction: { value: 92, trend: 2, trendType: 'up', unit: '%', label: '工单满意度' },
                complianceScore: { value: 88.5, trend: 0, trendType: 'stable', unit: '分', label: '平均合规分' },
                activeAdvices: { value: 5, trend: 1, trendType: 'up', unit: '件', label: '活跃建议数' }
            },

            governanceRadar: {
                indicators: [
                    { name: '工单响应率', max: 100 },
                    { name: '业主满意度', max: 100 },
                    { name: '业委会合规分', max: 100 },
                    { name: '议事活跃度', max: 100 },
                    { name: '自主结案率', max: 100 }
                ],
                data: {
                    'js-garden': { name: '江上花园', value: [95, 88, 92, 75, 85] },
                    'sunshine': { name: '阳光小区', value: [80, 75, 85, 60, 70] },
                    'happiness': { name: '幸福里', value: [88, 82, 90, 68, 78] }
                }
            },

            trendData: {
                daily: {
                    labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                    reports: [3, 5, 2, 4, 6, 8, 12],
                    tickets: [15, 18, 12, 20, 25, 30, 28],
                    satisfaction: [90, 91, 89, 92, 93, 94, 92]
                },
                weekly: {
                    labels: ['第1周', '第2周', '第3周', '第4周'],
                    reports: [18, 22, 15, 12],
                    tickets: [85, 92, 78, 88],
                    satisfaction: [89, 91, 90, 92]
                },
                monthly: {
                    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                    reports: [45, 38, 52, 48, 35, 12],
                    tickets: [320, 280, 350, 310, 290, 88],
                    satisfaction: [85, 87, 88, 89, 91, 92]
                }
            },

            alerts: [
                {
                    id: 'alert-001',
                    type: 'illegal',
                    level: 'high',
                    levelText: '严重违规',
                    title: '江上花园业委会未经公示动用维修资金',
                    description: '江上花园业委会动用5万元维修资金用于电梯维修，未在小区公示栏及业主端公示满7天，违反《民法典》第278条规定。',
                    community: '江上花园',
                    communityId: 'js-garden',
                    time: '10分钟前',
                    timestamp: Date.now() - 600000,
                    status: 'pending',
                    relatedLaws: ['民法典第278条', '物业管理条例第54条'],
                    evidence: [
                        { type: 'document', name: '维修资金使用申请单', url: '#' },
                        { type: 'photo', name: '现场施工照片', url: '#' }
                    ],
                    suggestedActions: ['下发整改通知书', '要求补充公示程序', '启动合规审查']
                },
                {
                    id: 'alert-002',
                    type: 'advice',
                    level: 'medium',
                    levelText: '临时大会建议',
                    title: '阳光小区议事厅投票超20%，建议改聘物业',
                    description: '阳光小区业主端议事厅就"是否同意启动物业选聘程序"进行投票，参与人数达到业主总人数的23.5%，赞成率78%。根据《业主大会议事规则》，建议召开临时业主大会。',
                    community: '阳光小区',
                    communityId: 'sunshine',
                    time: '2小时前',
                    timestamp: Date.now() - 7200000,
                    status: 'pending',
                    voteStats: { total: 890, participated: 209, agree: 163, disagree: 46 },
                    participationRate: 23.5,
                    agreeRate: 78,
                    suggestedActions: ['审核投票程序合规性', '向业委会发出建议通知', '跟踪业委会响应']
                },
                {
                    id: 'alert-003',
                    type: 'audit',
                    level: 'low',
                    levelText: '合规审计',
                    title: '待审核《第三季度履职合规评估报告》',
                    description: '幸福里业委会已提交第三季度履职合规评估报告，请社区进行审核。',
                    community: '幸福里',
                    communityId: 'happiness',
                    time: '昨天',
                    timestamp: Date.now() - 86400000,
                    status: 'pending',
                    reportId: 'report-2024-q3',
                    suggestedActions: ['查看报告详情', '进行合规审查', '出具审计意见']
                },
                {
                    id: 'alert-004',
                    type: 'illegal',
                    level: 'medium',
                    levelText: '合同违约',
                    title: '保安人数不达标',
                    description: '经AI比对物业服务合同，夜间值班保安人数少于合同约定的4人，实际仅有2人值班。',
                    community: '阳光小区',
                    communityId: 'sunshine',
                    time: '1小时前',
                    timestamp: Date.now() - 3600000,
                    status: 'monitoring',
                    relatedContract: '物业服务合同-2024版',
                    violationDetails: '合同约定夜间值班保安4人，实际2人',
                    suggestedActions: ['通知物业整改', '记录违约行为', '扣减履约评分']
                },
                {
                    id: 'alert-005',
                    type: 'safety',
                    level: 'medium',
                    levelText: '合规异常',
                    title: '电梯维保超期预警',
                    description: '幸福里3栋电梯距离上次维保已超过15天，存在安全隐患。',
                    community: '幸福里',
                    communityId: 'happiness',
                    time: '昨天',
                    timestamp: Date.now() - 86400000,
                    status: 'monitoring',
                    equipmentId: 'elevator-happiness-3',
                    lastMaintenance: '2024-03-02',
                    daysOverdue: 3,
                    suggestedActions: ['通知物业立即维保', '上报特种设备监管部门', '跟踪整改情况']
                },
                {
                    id: 'alert-006',
                    type: 'illegal',
                    level: 'high',
                    levelText: '程序瑕疵',
                    title: '江上花园垃圾桶房移位未备案',
                    description: '小区垃圾分类投放点移位改造已完成施工，但未向街道城管科备案，涉嫌违反市容管理规定。',
                    community: '江上花园',
                    communityId: 'js-garden',
                    time: '3小时前',
                    timestamp: Date.now() - 10800000,
                    status: 'action',
                    suggestedActions: ['责令补报备案手续', '现场复核与拍照存档']
                },
                {
                    id: 'alert-007',
                    type: 'audit',
                    level: 'low',
                    levelText: '已整改',
                    title: '阳光小区消防通道堆物（已清理）',
                    description: '接业主举报后物业已联合业委会完成清理，通道恢复畅通，留存整改照片。',
                    community: '阳光小区',
                    communityId: 'sunshine',
                    time: '上周',
                    timestamp: Date.now() - 86400000 * 5,
                    status: 'done',
                    suggestedActions: ['归档备查', '纳入季度巡查']
                },
                {
                    id: 'alert-008',
                    type: 'illegal',
                    level: 'medium',
                    levelText: '公示逾期',
                    title: '幸福里电梯广告收益未按季公示',
                    description: '公共区域电梯广告收益应按季度在业主端与公示栏同步公示，本季度已逾期12天。',
                    community: '幸福里',
                    communityId: 'happiness',
                    time: '2天前',
                    timestamp: Date.now() - 172800000,
                    status: 'done',
                    suggestedActions: ['督促业委会限期公示', '逾期记录已闭环']
                }
            ],

            kanbanData: {
                pending: {
                    id: 'pending',
                    name: '待研判',
                    color: 'bg-red-500',
                    items: []
                },
                monitoring: {
                    id: 'monitoring',
                    name: '监控中',
                    color: 'bg-orange-500',
                    items: []
                },
                action: {
                    id: 'action',
                    name: '需依法介入',
                    color: 'bg-blue-500',
                    items: []
                },
                done: {
                    id: 'done',
                    name: '已归档',
                    color: 'bg-gray-400',
                    items: []
                }
            },

            tickets: [
                { id: 'T2024031801', community: '江上花园', district: '江上花园', communityId: 'js-garden', type: '投诉', title: '小区门口垃圾堆积无人清理', status: '处理中', priority: 'high', time: '2024-03-18 09:30', assignee: '物业服务中心' },
                { id: 'T2024031802', community: '阳光小区', district: '阳光小区', communityId: 'sunshine', type: '咨询', title: '关于维修资金使用流程的咨询', status: '待分派', priority: 'medium', time: '2024-03-18 10:15', assignee: null },
                { id: 'T2024031803', community: '幸福里', district: '幸福里', communityId: 'happiness', type: '报修', title: '地下车库照明损坏', status: '已完成', priority: 'low', time: '2024-03-17 14:20', assignee: '物业工程部' },
                { id: 'T2024031804', community: '江上花园', district: '江上花园', communityId: 'js-garden', type: '投诉', title: '电梯经常故障，业主出行困难', status: '处理中', priority: 'high', time: '2024-03-18 11:00', assignee: '物业工程部' },
                { id: 'T2024031805', community: '阳光小区', district: '阳光小区', communityId: 'sunshine', type: '建议', title: '建议增加小学周边减速带与警示标识', status: '待分派', priority: 'low', time: '2024-03-18 08:45', assignee: null },
                { id: 'T2024031806', community: '幸福里', district: '幸福里', communityId: 'happiness', type: '投诉', title: '楼顶晾晒绳私拉乱接影响逃生通道', status: '处理中', priority: 'medium', time: '2024-03-19 08:20', assignee: '安保部' },
                { id: 'T2024031807', community: '江上花园', district: '江上花园', communityId: 'js-garden', type: '咨询', title: '业主大会线上表决身份核验说明', status: '待分派', priority: 'low', time: '2024-03-19 09:00', assignee: null },
                { id: 'T2024031808', community: '阳光小区', district: '阳光小区', communityId: 'sunshine', type: '报修', title: '景观水系泵站异响', status: '已完成', priority: 'medium', time: '2024-03-16 16:40', assignee: '物业工程部' },
                { id: 'T2024031809', community: '幸福里', district: '幸福里', communityId: 'happiness', type: '建议', title: '建议增设新能源车共享充电桩试点', status: '处理中', priority: 'low', time: '2024-03-19 10:05', assignee: '业委会秘书处' }
            ],

            propertyScores: {
                'js-garden': {
                    overall: 85,
                    trend: 'up',
                    details: {
                        responseTime: 92,
                        maintenanceQuality: 88,
                        serviceAttitude: 82,
                        safetyManagement: 78
                    },
                    overdueCount: 2,
                    contractCompliance: 94
                },
                'sunshine': {
                    overall: 72,
                    trend: 'down',
                    details: {
                        responseTime: 75,
                        maintenanceQuality: 70,
                        serviceAttitude: 68,
                        safetyManagement: 75
                    },
                    overdueCount: 5,
                    contractCompliance: 82
                },
                'happiness': {
                    overall: 78,
                    trend: 'stable',
                    details: {
                        responseTime: 85,
                        maintenanceQuality: 80,
                        serviceAttitude: 75,
                        safetyManagement: 72
                    },
                    overdueCount: 3,
                    contractCompliance: 88
                }
            },

            complianceReports: [
                {
                    id: 'report-2024-q3',
                    community: '幸福里',
                    communityId: 'happiness',
                    period: '2024年第三季度',
                    status: 'pending',
                    score: 88,
                    issues: 3,
                    submitTime: '2024-03-17'
                }
            ],

            updateLogs: [
                { time: new Date().toISOString(), type: 'sync', message: '数据同步完成' }
            ]
        },

        _listeners: [],

        getCommunities() {
            return this._data.communities;
        },

        getKeyIndicators() {
            return this._data.keyIndicators;
        },

        getGovernanceRadar() {
            return this._data.governanceRadar;
        },

        getTrendData(period = 'daily') {
            return this._data.trendData[period] || this._data.trendData.daily;
        },

        getAlerts(filters = {}) {
            let alerts = [...this._data.alerts];
            
            if (filters.type) {
                alerts = alerts.filter(a => a.type === filters.type);
            }
            if (filters.level) {
                alerts = alerts.filter(a => a.level === filters.level);
            }
            if (filters.status) {
                alerts = alerts.filter(a => a.status === filters.status);
            }
            if (filters.communityId) {
                alerts = alerts.filter(a => a.communityId === filters.communityId);
            }
            
            return alerts.sort((a, b) => b.timestamp - a.timestamp);
        },

        getKanbanData() {
            const kanban = { ...this._data.kanbanData };
            const alerts = this._data.alerts;
            
            kanban.pending.items = alerts.filter(a => a.status === 'pending').map(this._formatKanbanItem);
            kanban.monitoring.items = alerts.filter(a => a.status === 'monitoring').map(this._formatKanbanItem);
            kanban.action.items = alerts.filter(a => a.status === 'action').map(this._formatKanbanItem);
            kanban.done.items = alerts.filter(a => a.status === 'done').map(this._formatKanbanItem);
            
            return Object.values(kanban);
        },

        _formatKanbanItem(alert) {
            return {
                id: alert.id,
                title: alert.title,
                desc: alert.description,
                level: alert.level,
                levelText: alert.levelText,
                time: alert.time,
                district: alert.community
            };
        },

        getTickets(filters = {}) {
            let tickets = [...this._data.tickets];
            
            if (filters.status) {
                tickets = tickets.filter(t => t.status === filters.status);
            }
            if (filters.type) {
                tickets = tickets.filter(t => t.type === filters.type);
            }
            if (filters.communityId) {
                tickets = tickets.filter(t => t.communityId === filters.communityId);
            }
            
            return tickets;
        },

        getPropertyScores(communityId = null) {
            if (communityId) {
                return this._data.propertyScores[communityId] || null;
            }
            return this._data.propertyScores;
        },

        updateAlertStatus(alertId, newStatus) {
            const alert = this._data.alerts.find(a => a.id === alertId);
            if (alert) {
                alert.status = newStatus;
                this._notifyListeners('alertUpdated', { alertId, newStatus });
                return true;
            }
            return false;
        },

        subscribe(callback) {
            this._listeners.push(callback);
            return () => {
                this._listeners = this._listeners.filter(l => l !== callback);
            };
        },

        _notifyListeners(eventType, data) {
            this._listeners.forEach(callback => {
                try {
                    callback(eventType, data);
                } catch (e) {
                    console.error('Listener error:', e);
                }
            });
        },

        simulateRealTimeUpdate() {
            const indicators = this._data.keyIndicators;
            
            if (Math.random() > 0.7) {
                indicators.reports.value += Math.floor(Math.random() * 2);
                indicators.reports.trend = Math.floor(Math.random() * 20) - 5;
            }
            
            if (Math.random() > 0.8) {
                indicators.satisfaction.value = Math.min(100, Math.max(80, 
                    indicators.satisfaction.value + (Math.random() > 0.5 ? 1 : -1)));
            }
            
            this._data.lastUpdate = new Date().toISOString();
            this._notifyListeners('dataUpdated', { indicators });
        },

        getLastUpdateTime() {
            return this._data.lastUpdate;
        },

        getRefreshInterval() {
            return this._data.refreshInterval;
        }
    };

    const DashboardService = {
        getDashboardSummary(communityId = null) {
            const indicators = DashboardDatabase.getKeyIndicators();
            const radar = DashboardDatabase.getGovernanceRadar();
            const alerts = DashboardDatabase.getAlerts({ communityId }).slice(0, 5);
            const propertyScores = DashboardDatabase.getPropertyScores(communityId);
            
            return {
                indicators,
                radar,
                alerts,
                propertyScores,
                lastUpdate: DashboardDatabase.getLastUpdateTime()
            };
        },

        getAlertsForKanban() {
            return DashboardDatabase.getKanbanData();
        },

        getTicketsList(filters = {}) {
            return DashboardDatabase.getTickets(filters);
        },

        getCommunityList() {
            return DashboardDatabase.getCommunities();
        },

        getTrendChartData(period = 'daily') {
            const data = DashboardDatabase.getTrendData(period);
            return {
                labels: data.labels,
                series: [
                    { name: '通报数', data: data.reports },
                    { name: '工单数', data: data.tickets },
                    { name: '满意度', data: data.satisfaction }
                ]
            };
        },

        getRadarChartConfig(selectedCommunities = ['js-garden', 'sunshine']) {
            const radar = DashboardDatabase.getGovernanceRadar();
            const seriesData = selectedCommunities
                .map(id => radar.data[id])
                .filter(Boolean)
                .map(item => ({
                    name: item.name,
                    value: item.value,
                    areaStyle: { color: `rgba(${Math.floor(Math.random() * 100 + 59)}, ${Math.floor(Math.random() * 100 + 130)}, ${Math.floor(Math.random() * 100 + 246)}, 0.2)` },
                    lineStyle: { color: `rgb(${Math.floor(Math.random() * 100 + 59)}, ${Math.floor(Math.random() * 100 + 130)}, ${Math.floor(Math.random() * 100 + 246)})` }
                }));
            
            return {
                tooltip: {},
                legend: {
                    data: seriesData.map(d => d.name),
                    bottom: 0
                },
                radar: {
                    indicator: radar.indicators,
                    radius: '65%'
                },
                series: [{
                    name: '治理态势对比',
                    type: 'radar',
                    data: seriesData
                }]
            };
        },

        getTrendChartConfig(period = 'daily') {
            const data = this.getTrendChartData(period);
            return {
                tooltip: { trigger: 'axis' },
                legend: { data: data.series.map(s => s.name), bottom: 0 },
                grid: { left: '3%', right: '4%', top: '12%', bottom: '15%', containLabel: true },
                // boundaryGap: false + smooth 会在折线两端画出网格外；保留左右留白并弱化平滑强度
                xAxis: { type: 'category', boundaryGap: true, data: data.labels },
                yAxis: {
                    type: 'value',
                    min: (v) => {
                        const span = v.max - v.min || 1;
                        const pad = span * 0.06;
                        return Math.max(0, v.min - pad);
                    },
                    max: (v) => {
                        const span = v.max - v.min || 1;
                        return v.max + span * 0.06;
                    }
                },
                series: data.series.map(s => ({
                    name: s.name,
                    type: 'line',
                    smooth: 0.35,
                    clip: true,
                    data: s.data,
                    itemStyle: { color: s.name === '满意度' ? '#10b981' : s.name === '通报数' ? '#ef4444' : '#3b82f6' }
                }))
            };
        },

        getBarChartConfig(period = 'monthly') {
            const data = this.getTrendChartData(period);
            return {
                tooltip: { trigger: 'axis' },
                legend: { data: ['通报数', '工单数'], bottom: 0 },
                grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
                xAxis: { type: 'category', data: data.labels },
                yAxis: { type: 'value' },
                series: [
                    { name: '通报数', type: 'bar', data: data.series[0].data, itemStyle: { color: '#ef4444' } },
                    { name: '工单数', type: 'bar', data: data.series[1].data, itemStyle: { color: '#3b82f6' } }
                ]
            };
        },

        getGaugeChartConfig(communityId) {
            const score = DashboardDatabase.getPropertyScores(communityId);
            if (!score) return null;
            
            return {
                series: [{
                    type: 'gauge',
                    startAngle: 180,
                    endAngle: 0,
                    min: 0,
                    max: 100,
                    splitNumber: 10,
                    axisLine: {
                        lineStyle: {
                            width: 20,
                            color: [
                                [0.6, '#ef4444'],
                                [0.8, '#f59e0b'],
                                [1, '#10b981']
                            ]
                        }
                    },
                    pointer: { width: 5 },
                    axisTick: { show: false },
                    splitLine: { length: 15, lineStyle: { width: 2, color: '#999' } },
                    axisLabel: { distance: 25, fontSize: 10 },
                    detail: {
                        valueAnimation: true,
                        formatter: '{value}分',
                        fontSize: 20,
                        offsetCenter: [0, '70%']
                    },
                    data: [{ value: score.overall, name: '物业综合评分' }]
                }]
            };
        },

        updateAlertStatus(alertId, newStatus) {
            return DashboardDatabase.updateAlertStatus(alertId, newStatus);
        },

        subscribeToUpdates(callback) {
            return DashboardDatabase.subscribe(callback);
        },

        triggerDataRefresh() {
            DashboardDatabase.simulateRealTimeUpdate();
        },

        formatIndicatorValue(indicator) {
            const { value, trend, trendType, unit } = indicator;
            let trendHtml = '';
            
            if (trendType === 'up') {
                trendHtml = `<span class="text-xs text-green-500 font-normal"><i class="fas fa-arrow-up"></i> ${Math.abs(trend)}%</span>`;
            } else if (trendType === 'down') {
                trendHtml = `<span class="text-xs text-red-500 font-normal"><i class="fas fa-arrow-down"></i> ${Math.abs(trend)}%</span>`;
            } else {
                trendHtml = `<span class="text-xs text-gray-400 font-normal">- 持平</span>`;
            }
            
            return { value: `${value}${unit}`, trendHtml };
        },

        generateReport(communityId, period = 'monthly') {
            const summary = this.getDashboardSummary(communityId);
            const trend = this.getTrendChartData(period);
            
            return {
                title: `${summary.indicators ? communityId ? DashboardDatabase.getCommunities().find(c => c.id === communityId)?.name : '辖区' : ''}治理态势研判报告`,
                period: period === 'daily' ? '本日' : period === 'weekly' ? '本周' : '本月',
                generatedAt: new Date().toLocaleString('zh-CN'),
                summary: {
                    totalReports: summary.indicators.reports.value,
                    satisfaction: summary.indicators.satisfaction.value,
                    complianceScore: summary.indicators.complianceScore.value,
                    activeAdvices: summary.indicators.activeAdvices.value
                },
                trend,
                alerts: summary.alerts,
                recommendations: [
                    '建议加强对维修资金使用程序的合规监督',
                    '建议定期召开社区治理联席会议',
                    '建议完善物业履约评分机制'
                ]
            };
        },

        getAlertStats() {
            const alerts = DashboardDatabase.getAlerts();
            return {
                total: alerts.length,
                pending: alerts.filter(a => a.status === 'pending').length,
                monitoring: alerts.filter(a => a.status === 'monitoring').length,
                action: alerts.filter(a => a.status === 'action').length,
                done: alerts.filter(a => a.status === 'done').length,
                byLevel: {
                    high: alerts.filter(a => a.level === 'high').length,
                    medium: alerts.filter(a => a.level === 'medium').length,
                    low: alerts.filter(a => a.level === 'low').length
                },
                byType: {
                    illegal: alerts.filter(a => a.type === 'illegal').length,
                    advice: alerts.filter(a => a.type === 'advice').length,
                    audit: alerts.filter(a => a.type === 'audit').length,
                    safety: alerts.filter(a => a.type === 'safety').length
                }
            };
        },

        getTicketStats() {
            const tickets = DashboardDatabase.getTickets();
            return {
                total: tickets.length,
                pending: tickets.filter(t => t.status === '待分派').length,
                processing: tickets.filter(t => t.status === '处理中').length,
                completed: tickets.filter(t => t.status === '已完成').length,
                byPriority: {
                    high: tickets.filter(t => t.priority === 'high').length,
                    medium: tickets.filter(t => t.priority === 'medium').length,
                    low: tickets.filter(t => t.priority === 'low').length
                }
            };
        }
    };

    window.DashboardModule = {
        Database: DashboardDatabase,
        Service: DashboardService
    };

})();
