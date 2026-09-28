/**
 * 议事厅线上会议系统
 * 严格遵循《议事厅规则文档》开发
 * 
 * 功能模块：
 * 1. 会议创建与预约模块
 * 2. 参会人员身份验证系统
 * 3. 实时议程展示与切换功能
 * 4. 在线投票与表决系统
 * 5. 会议记录生成与保存功能
 * 6. 会前准备室功能
 * 7. 会议状态流转与通知功能
 * 8. AI阶段性小结功能
 */

(function(global) {
    'use strict';

    // ==================== 常量定义 ====================
    
    var MEETING_TYPES = {
        ASSEMBLY: 'assembly',
        SLOW: 'slow'
    };

    var MEETING_STATUS = {
        PENDING: 'pending',
        APPROVED: 'approved',
        ONGOING: 'ongoing',
        COMPLETED: 'completed',
        ESCALATED: 'escalated',
        REJECTED: 'rejected'
    };

    var USER_ROLES = {
        GUEST: 'guest',
        RESIDENT: 'resident',
        OWNER: 'owner',
        FAMILY: 'family',
        TENANT: 'tenant'
    };

    var VOTE_RULES = {
        DOUBLE_HALF: '双过半',
        DOUBLE_TWO_THIRDS: '双三分之二'
    };

    var MAX_ASSEMBLY_DURATION = 30;
    var MIN_SLOW_DURATION_DAYS = 3;
    var MAX_SLOW_DURATION_DAYS = 7;
    var TEMP_MEETING_THRESHOLD = 0.2;
    // 体验版开关：议事申请统一自动通过
    var FORCE_APPROVE_MEETING_APPLICATION = true;

    // ==================== 会议数据管理 ====================
    
    var CouncilMeetingSystem = {
        meetings: [],
        currentMeeting: null,
        currentUser: null,
        subscribers: [],
        aiSummaryState: {
            firstDone: false,
            secondDone: false,
            thirdDone: false
        },
        chatMessages: [],
        voteRecords: [],
        meetingStartTime: null,
        meetingTimer: null,

        init: function() {
            this.loadMeetings();
            this.loadCurrentUser();
            this.subscribeToBridge();
            console.log('[CouncilMeetingSystem] 初始化完成');
        },

        loadMeetings: function() {
            if (window.EcosystemBridge && typeof window.EcosystemBridge.getCouncilMeetings === 'function') {
                var data = window.EcosystemBridge.getCouncilMeetings();
                this.meetings = data || [];
            } else {
                var stored = localStorage.getItem('council_meetings');
                this.meetings = stored ? JSON.parse(stored) : [];
            }
        },

        saveMeetings: function() {
            if (window.EcosystemBridge && typeof window.EcosystemBridge.setCouncilMeetings === 'function') {
                // 与生态桥保持单一数据源，确保业主端列表可立即看到新会议
                window.EcosystemBridge.setCouncilMeetings(this.meetings.slice());
            } else {
                localStorage.setItem('council_meetings', JSON.stringify(this.meetings));
            }
            this.notifySubscribers();
        },

        loadCurrentUser: function() {
            var userStr = localStorage.getItem('SQ_OWNER_USER');
            if (userStr) {
                try {
                    this.currentUser = JSON.parse(userStr);
                } catch(e) {
                    this.currentUser = { id: 'guest', name: '游客', role: USER_ROLES.GUEST };
                }
            } else {
                this.currentUser = { id: 'guest', name: '游客', role: USER_ROLES.GUEST };
            }
        },

        subscribeToBridge: function() {
            if (window.EcosystemBridge && typeof window.EcosystemBridge.subscribeByStore === 'function') {
                var self = this;
                window.EcosystemBridge.subscribeByStore('council_meetings', function(store, newValue, detail) {
                    self.loadMeetings();
                    self.notifySubscribers();
                });
            }
        },

        subscribe: function(callback) {
            this.subscribers.push(callback);
        },

        notifySubscribers: function() {
            var self = this;
            this.subscribers.forEach(function(cb) {
                try { cb(self.meetings); } catch(e) {}
            });
        },

        getUserRole: function() {
            return this.currentUser ? this.currentUser.role : USER_ROLES.GUEST;
        },

        canApplyMeeting: function() {
            var role = this.getUserRole();
            return role === USER_ROLES.OWNER;
        },

        canVote: function() {
            var role = this.getUserRole();
            return role === USER_ROLES.OWNER;
        },

        canJoinMeeting: function() {
            var role = this.getUserRole();
            return role !== USER_ROLES.GUEST || this.currentUser.tempAccess;
        }
    };

    // ==================== 会议创建与预约模块 ====================

    var MeetingCreator = {
        validateApplication: function(data) {
            var errors = [];

            if (!data.title || !data.title.trim()) {
                errors.push('会议标题不能为空');
            }

            if (!data.type) {
                errors.push('请选择会议类型');
            }

            if (data.type === MEETING_TYPES.ASSEMBLY) {
                if (!data.meetingDate) {
                    errors.push('请选择会议日期');
                }
                if (!data.meetingTime) {
                    errors.push('请选择会议时间');
                }
                if (data.duration && data.duration > MAX_ASSEMBLY_DURATION) {
                    errors.push('决策会议时长不能超过' + MAX_ASSEMBLY_DURATION + '分钟');
                }
            } else if (data.type === MEETING_TYPES.SLOW) {
                if (!data.startDate) {
                    errors.push('请选择议事开始日期');
                }
                if (!data.endDate) {
                    errors.push('请选择议事结束日期');
                }
                var start = new Date(data.startDate);
                var end = new Date(data.endDate);
                var days = (end - start) / (1000 * 60 * 60 * 24);
                if (days < MIN_SLOW_DURATION_DAYS) {
                    errors.push('协商会议周期至少' + MIN_SLOW_DURATION_DAYS + '天');
                }
                if (days > MAX_SLOW_DURATION_DAYS) {
                    errors.push('协商会议周期最多' + MAX_SLOW_DURATION_DAYS + '天');
                }
            }

            if (!data.description || !data.description.trim()) {
                errors.push('会议描述不能为空');
            }

            return {
                valid: errors.length === 0,
                errors: errors
            };
        },

        calculateAIScore: function(data) {
            var score = 0;

            if (data.title && data.title.trim()) score += 5;
            if (data.description && data.description.trim()) score += 5;
            if (data.meetingDate || data.startDate) score += 5;
            if (data.meetingTime || data.endDate) score += 5;

            if (data.type === MEETING_TYPES.ASSEMBLY) {
                if (data.meetingDate) {
                    var meetingDate = new Date(data.meetingDate + 'T' + (data.meetingTime || '00:00'));
                    var now = new Date();
                    var hoursDiff = (meetingDate - now) / (1000 * 60 * 60);
                    if (hoursDiff >= 24) {
                        score += 30;
                    } else if (hoursDiff >= 1) {
                        score += 15;
                    }
                }
                if (data.duration && data.duration <= MAX_ASSEMBLY_DURATION) {
                    score += 15;
                }
            } else {
                var start = new Date(data.startDate);
                var end = new Date(data.endDate);
                var days = (end - start) / (1000 * 60 * 60 * 24);
                if (days >= MIN_SLOW_DURATION_DAYS && days <= MAX_SLOW_DURATION_DAYS) {
                    score += 30;
                } else if (days > 0) {
                    score += 15;
                }
                score += 15;
            }

            var keywords = ['电梯', '物业', '维修', '资金', '公共', '设施', '业主', '议事'];
            var content = (data.title || '') + ' ' + (data.description || '');
            keywords.forEach(function(kw) {
                if (content.indexOf(kw) >= 0) score += 3;
            });
            score = Math.min(score, 20);

            var userHistory = localStorage.getItem('meeting_history_' + (CouncilMeetingSystem.currentUser ? CouncilMeetingSystem.currentUser.id : ''));
            if (userHistory) {
                try {
                    var history = JSON.parse(userHistory);
                    if (history.length > 0) score += 10;
                    if (history.length > 3) score += 5;
                } catch(e) {}
            }

            return Math.min(score, 100);
        },

        createApplication: function(data) {
            if (!CouncilMeetingSystem.canApplyMeeting()) {
                return {
                    success: false,
                    message: '该功能仅限业主使用'
                };
            }

            var validation = this.validateApplication(data);
            if (!validation.valid) {
                return {
                    success: false,
                    errors: validation.errors
                };
            }

            var score = this.calculateAIScore(data);
            var reviewResult = '';
            var reviewStatus = '';
            if (FORCE_APPROVE_MEETING_APPLICATION) {
                reviewResult = '自动通过';
                reviewStatus = 'approved';
            } else {
                if (score >= 70) {
                    reviewResult = '自动通过';
                    reviewStatus = 'approved';
                } else if (score < 50) {
                    reviewResult = '自动拒绝';
                    reviewStatus = 'rejected';
                } else {
                    reviewResult = '转人工复核';
                    reviewStatus = 'pending';
                }
            }

            var onlinePlace = '线上会议';
            var descTrim = (data.description || '').trim();
            var timeTextSlow = (data.startDate || '') + ' 至 ' + (data.endDate || '');
            var nextSlowIso = '';
            if (data.type === MEETING_TYPES.SLOW && data.nextMeetingTime && String(data.nextMeetingTime).trim()) {
                nextSlowIso = String(data.nextMeetingTime).trim();
            }
            var discussionTopics = Array.isArray(data.discussionTopics) ? data.discussionTopics.map(function (t) { return String(t).trim(); }).filter(Boolean) : [];

            var application = {
                id: 'apply_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                title: data.title,
                type: data.type,
                typeLabel: data.type === MEETING_TYPES.ASSEMBLY ? '决策会议' : '协商会议',
                description: data.description,
                desc: descTrim,
                discussionTopics: discussionTopics,
                meetingTime: data.type === MEETING_TYPES.ASSEMBLY
                    ? data.meetingDate + 'T' + data.meetingTime + ':00'
                    : (nextSlowIso || null),
                nextMeetingTime: nextSlowIso,
                endTime: data.type === MEETING_TYPES.SLOW 
                    ? data.endDate + 'T23:59:59' 
                    : null,
                timeText: data.type === MEETING_TYPES.SLOW ? timeTextSlow : (data.meetingDate && data.meetingTime ? (data.meetingDate + ' ' + data.meetingTime) : ''),
                duration: data.duration || 30,
                place: onlinePlace,
                location: onlinePlace,
                proposer: CouncilMeetingSystem.currentUser.name,
                proposerRoom: CouncilMeetingSystem.currentUser.room || '',
                proposerId: CouncilMeetingSystem.currentUser.id,
                createTime: new Date().toISOString(),
                reviewScore: score,
                reviewResult: reviewResult,
                reviewStatus: reviewStatus,
                attachments: data.attachments || [],
                scope: data.scope,
                scopeLabel: data.scopeLabel,
                buildings: data.buildings || [],
                source: 'owner',
                status: reviewStatus === 'approved' ? MEETING_STATUS.APPROVED : MEETING_STATUS.PENDING
            };

            if (window.EcosystemBridge && typeof window.EcosystemBridge.addMeetingApplication === 'function') {
                window.EcosystemBridge.addMeetingApplication(application);
            }

            // 发起申请后即生成会议卡：审核中/已拒绝/已通过都可在议事列表中追踪状态
            this.createMeetingFromApplication(application, reviewStatus);

            this.recordMeetingHistory();

            return {
                success: true,
                application: application,
                message: reviewResult === '自动拒绝'
                    ? '申请未通过审核，原因：' + this.getRejectReason(score, data)
                    : '申请已提交'
            };
        },

        getRejectReason: function(score, data) {
            if (!data.title || !data.title.trim()) return '会议标题不完整';
            if (!data.description || !data.description.trim()) return '会议描述不完整';
            if (score < 30) return '会议内容不符合议事规则';
            if (score < 50) return '会议时间安排不合理或内容需要完善';
            return '综合评分未达到通过标准';
        },

        createMeetingFromApplication: function(application, reviewStatus) {
            var descTrim = (application.description || '').trim();
            CouncilMeetingSystem.loadMeetings();
            var statusMap = {
                approved: MEETING_STATUS.APPROVED,
                pending: MEETING_STATUS.PENDING,
                rejected: MEETING_STATUS.REJECTED
            };
            var targetStatus = statusMap[reviewStatus] || MEETING_STATUS.PENDING;
            var exists = CouncilMeetingSystem.meetings.find(function(m) { return m.applicationId === application.id; });
            if (exists) return exists;
            var agendaFromApply = [];
            if (descTrim) agendaFromApply.push({ time: '', title: '议题描述与背景', desc: descTrim });
            (application.discussionTopics || []).forEach(function (t) {
                var s = String(t).trim();
                if (s) agendaFromApply.push({ time: '', title: s, desc: '' });
            });

            var meeting = {
                id: 'meeting_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                applicationId: application.id,
                title: application.title,
                type: application.type,
                typeLabel: application.typeLabel,
                description: application.description,
                discussionTopics: application.discussionTopics || [],
                meetingTime: application.meetingTime,
                nextMeetingTime: application.nextMeetingTime || application.meetingTime || '',
                negotiationPeriodText: application.timeText || '',
                startTime: (function() {
                    var raw = application.meetingTime || application.nextMeetingTime;
                    if (!raw) return '待定';
                    var d = new Date(raw);
                    if (isNaN(d.getTime())) return '待定';
                    var y = d.getFullYear();
                    var M = String(d.getMonth() + 1).padStart(2, '0');
                    var D = String(d.getDate()).padStart(2, '0');
                    var h = String(d.getHours()).padStart(2, '0');
                    var m = String(d.getMinutes()).padStart(2, '0');
                    return y + '年' + M + '月' + D + '日 ' + h + ':' + m;
                })(),
                endTime: application.endTime,
                duration: application.duration,
                host: application.proposer,
                hostRoom: application.proposerRoom,
                hostId: application.proposerId,
                status: targetStatus,
                createTime: new Date().toISOString(),
                participants: 0,
                agenda: agendaFromApply,
                materials: [],
                aiSummary: {
                    topic: application.title,
                    focus: (descTrim && descTrim.slice(0, 80)) || '待讨论',
                    consensus: 0
                },
                consensus: 0,
                voteRecords: [],
                chatMessages: [],
                minutes: null,
                tempMeetingSuggested: false
            };

            CouncilMeetingSystem.meetings.push(meeting);
            CouncilMeetingSystem.saveMeetings();

            return meeting;
        },

        recordMeetingHistory: function() {
            var userId = CouncilMeetingSystem.currentUser ? CouncilMeetingSystem.currentUser.id : '';
            if (!userId) return;

            var key = 'meeting_history_' + userId;
            var history = [];
            try {
                history = JSON.parse(localStorage.getItem(key) || '[]');
            } catch(e) {}

            history.push({
                time: new Date().toISOString(),
                type: 'apply'
            });

            localStorage.setItem(key, JSON.stringify(history));
        }
    };

    // ==================== 参会人员身份验证系统 ====================

    var ParticipantAuth = {
        verifyParticipant: function(meetingId, userId) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) {
                return { success: false, message: '会议不存在' };
            }

            var userRole = CouncilMeetingSystem.getUserRole();
            var user = CouncilMeetingSystem.currentUser;

            if (userRole === USER_ROLES.GUEST && !user.tempAccess) {
                return { success: false, message: '访客无权参加会议，请先完成身份认证' };
            }

            var participant = {
                id: user.id || 'user_' + Date.now(),
                name: user.name || '参会者',
                room: user.room || '',
                role: userRole,
                joinTime: new Date().toISOString(),
                signedIn: false,
                isHost: meeting.hostId === user.id
            };

            var existingIndex = meeting.participants.findIndex(function(p) { return p.id === participant.id; });
            if (existingIndex >= 0) {
                meeting.participants[existingIndex].joinTime = participant.joinTime;
            } else {
                meeting.participants.push(participant);
            }

            CouncilMeetingSystem.saveMeetings();

            return {
                success: true,
                participant: participant,
                meeting: meeting,
                permissions: this.getPermissions(userRole, participant.isHost)
            };
        },

        getPermissions: function(role, isHost) {
            var permissions = {
                canSpeak: true,
                canVote: false,
                canPropose: false,
                canManage: false,
                canViewAgenda: true,
                canViewMaterials: true
            };

            if (role === USER_ROLES.OWNER) {
                permissions.canVote = true;
                permissions.canPropose = true;
            }

            if (isHost) {
                permissions.canManage = true;
            }

            return permissions;
        },

        signIn: function(meetingId, userId) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return { success: false };

            var participant = meeting.participants.find(function(p) { return p.id === userId; });
            if (!participant) return { success: false };

            participant.signedIn = true;
            participant.signInTime = new Date().toISOString();

            CouncilMeetingSystem.saveMeetings();

            return { success: true, signInTime: participant.signInTime };
        },

        authorizeProxy: function(meetingId, principalId, proxyId, scope) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return { success: false, message: '会议不存在' };

            var principal = meeting.participants.find(function(p) { return p.id === principalId; });
            if (!principal) return { success: false, message: '委托人不存在' };

            principal.proxy = {
                proxyId: proxyId,
                scope: scope || 'all',
                authorizeTime: new Date().toISOString()
            };

            CouncilMeetingSystem.saveMeetings();

            return { success: true };
        },

        getParticipantStats: function(meetingId) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return null;

            var total = meeting.participants.length;
            var signedIn = meeting.participants.filter(function(p) { return p.signedIn; }).length;
            var owners = meeting.participants.filter(function(p) { return p.role === USER_ROLES.OWNER; }).length;

            return {
                total: total,
                signedIn: signedIn,
                owners: owners,
                signInRate: total > 0 ? (signedIn / total * 100).toFixed(1) + '%' : '0%'
            };
        }
    };

    // ==================== 实时议程展示与切换功能 ====================

    var AgendaManager = {
        getAgenda: function(meetingId) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return [];

            return meeting.agenda || [];
        },

        setAgenda: function(meetingId, agendaItems) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return false;

            meeting.agenda = agendaItems.map(function(item, index) {
                return {
                    id: item.id || 'agenda_' + index,
                    time: item.time || '',
                    title: item.title || '',
                    description: item.description || '',
                    duration: item.duration || 5,
                    status: item.status || 'pending',
                    startTime: null,
                    endTime: null
                };
            });

            CouncilMeetingSystem.saveMeetings();
            return true;
        },

        addAgendaItem: function(meetingId, item) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return false;

            if (!meeting.agenda) meeting.agenda = [];

            meeting.agenda.push({
                id: 'agenda_' + Date.now(),
                time: item.time || '',
                title: item.title || '',
                description: item.description || '',
                duration: item.duration || 5,
                status: 'pending',
                startTime: null,
                endTime: null
            });

            CouncilMeetingSystem.saveMeetings();
            return true;
        },

        updateAgendaItem: function(meetingId, itemId, updates) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting || !meeting.agenda) return false;

            var item = meeting.agenda.find(function(a) { return a.id === itemId; });
            if (!item) return false;

            Object.assign(item, updates);
            CouncilMeetingSystem.saveMeetings();
            return true;
        },

        startAgendaItem: function(meetingId, itemId) {
            return this.updateAgendaItem(meetingId, itemId, {
                status: 'ongoing',
                startTime: new Date().toISOString()
            });
        },

        completeAgendaItem: function(meetingId, itemId) {
            return this.updateAgendaItem(meetingId, itemId, {
                status: 'completed',
                endTime: new Date().toISOString()
            });
        },

        getCurrentAgendaItem: function(meetingId) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting || !meeting.agenda) return null;

            return meeting.agenda.find(function(item) { return item.status === 'ongoing'; });
        },

        getNextAgendaItem: function(meetingId) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting || !meeting.agenda) return null;

            return meeting.agenda.find(function(item) { return item.status === 'pending'; });
        },

        getAgendaProgress: function(meetingId) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting || !meeting.agenda) return { total: 0, completed: 0, progress: 0 };

            var total = meeting.agenda.length;
            var completed = meeting.agenda.filter(function(a) { return a.status === 'completed'; }).length;

            return {
                total: total,
                completed: completed,
                progress: total > 0 ? Math.round((completed / total) * 100) : 0
            };
        }
    };

    // ==================== 在线投票与表决系统 ====================

    var VotingSystem = {
        createVote: function(meetingId, voteData) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return { success: false, message: '会议不存在' };

            var vote = {
                id: 'vote_' + Date.now(),
                meetingId: meetingId,
                title: voteData.title,
                description: voteData.description || '',
                type: voteData.type || 'ordinary',
                passCondition: voteData.passCondition || VOTE_RULES.DOUBLE_HALF,
                options: [
                    { id: 'agree', label: '同意', count: 0, area: 0 },
                    { id: 'disagree', label: '反对', count: 0, area: 0 },
                    { id: 'abstain', label: '弃权', count: 0, area: 0 }
                ],
                voters: [],
                status: 'voting',
                createTime: new Date().toISOString(),
                endTime: voteData.endTime || null,
                result: null,
                totalOwners: voteData.totalOwners || 100,
                totalArea: voteData.totalArea || 10000
            };

            if (!meeting.votes) meeting.votes = [];
            meeting.votes.push(vote);

            CouncilMeetingSystem.saveMeetings();

            return { success: true, vote: vote };
        },

        castVote: function(meetingId, voteId, optionId, voterInfo) {
            if (!CouncilMeetingSystem.canVote()) {
                return { success: false, message: '仅业主可参与投票' };
            }

            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return { success: false, message: '会议不存在' };

            var vote = meeting.votes ? meeting.votes.find(function(v) { return v.id === voteId; }) : null;
            if (!vote) return { success: false, message: '投票不存在' };

            if (vote.status !== 'voting') {
                return { success: false, message: '投票已结束' };
            }

            var voterId = CouncilMeetingSystem.currentUser.id;
            var existingVote = vote.voters.find(function(v) { return v.voterId === voterId; });
            if (existingVote) {
                return { success: false, message: '您已投过票' };
            }

            var option = vote.options.find(function(o) { return o.id === optionId; });
            if (!option) {
                return { success: false, message: '无效的投票选项' };
            }

            option.count += 1;
            option.area += voterInfo.area || 0;

            vote.voters.push({
                voterId: voterId,
                voterName: CouncilMeetingSystem.currentUser.name,
                voterRoom: CouncilMeetingSystem.currentUser.room,
                optionId: optionId,
                area: voterInfo.area || 0,
                voteTime: new Date().toISOString(),
                hash: this.generateVoteHash(voterId, optionId, voteId)
            });

            CouncilMeetingSystem.saveMeetings();

            this.checkAndNotifyTempMeeting(meeting, vote);

            return {
                success: true,
                hash: vote.voters[vote.voters.length - 1].hash,
                currentStats: this.getVoteStats(vote)
            };
        },

        generateVoteHash: function(voterId, optionId, voteId) {
            var data = voterId + '_' + optionId + '_' + voteId + '_' + Date.now();
            var hash = 0;
            for (var i = 0; i < data.length; i++) {
                var char = data.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return 'hash_' + Math.abs(hash).toString(16);
        },

        getVoteStats: function(vote) {
            var totalVotes = vote.voters.length;
            var totalArea = vote.voters.reduce(function(sum, v) { return sum + (v.area || 0); }, 0);

            var participationRate = {
                count: (totalVotes / vote.totalOwners * 100).toFixed(1) + '%',
                area: (totalArea / vote.totalArea * 100).toFixed(1) + '%'
            };

            var optionStats = vote.options.map(function(opt) {
                return {
                    id: opt.id,
                    label: opt.label,
                    count: opt.count,
                    area: opt.area,
                    countPercent: totalVotes > 0 ? (opt.count / totalVotes * 100).toFixed(1) + '%' : '0%',
                    areaPercent: totalArea > 0 ? (opt.area / vote.totalArea * 100).toFixed(1) + '%' : '0%'
                };
            });

            return {
                totalVotes: totalVotes,
                totalArea: totalArea,
                participationRate: participationRate,
                options: optionStats
            };
        },

        endVote: function(meetingId, voteId) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return { success: false };

            var vote = meeting.votes ? meeting.votes.find(function(v) { return v.id === voteId; }) : null;
            if (!vote) return { success: false };

            vote.status = 'ended';
            vote.result = this.calculateResult(vote);
            vote.endTime = new Date().toISOString();

            CouncilMeetingSystem.saveMeetings();

            return { success: true, result: vote.result };
        },

        calculateResult: function(vote) {
            var stats = this.getVoteStats(vote);
            var agreeOption = vote.options.find(function(o) { return o.id === 'agree'; });
            
            var countRate = vote.totalOwners > 0 ? agreeOption.count / vote.totalOwners : 0;
            var areaRate = vote.totalArea > 0 ? agreeOption.area / vote.totalArea : 0;

            var threshold = vote.passCondition === VOTE_RULES.DOUBLE_TWO_THIRDS ? 2/3 : 0.5;
            var passed = countRate >= threshold && areaRate >= threshold;

            return {
                passed: passed,
                agreeCount: agreeOption.count,
                agreeArea: agreeOption.area,
                countRate: (countRate * 100).toFixed(1) + '%',
                areaRate: (areaRate * 100).toFixed(1) + '%',
                threshold: (threshold * 100).toFixed(0) + '%',
                passCondition: vote.passCondition
            };
        },

        checkAndNotifyTempMeeting: function(meeting, vote) {
            var participationRate = vote.voters.length / vote.totalOwners;

            if (participationRate >= TEMP_MEETING_THRESHOLD && !meeting.tempMeetingSuggested) {
                meeting.tempMeetingSuggested = true;
                meeting.consensus = participationRate;

                var suggestion = {
                    id: 'temp_suggest_' + Date.now(),
                    meetingId: meeting.id,
                    meetingTitle: meeting.title,
                    voteId: vote.id,
                    voteTitle: vote.title,
                    participationRate: (participationRate * 100).toFixed(1) + '%',
                    createTime: new Date().toISOString(),
                    status: 'pending'
                };

                if (window.EcosystemBridge && typeof window.EcosystemBridge.addTempMeetingSuggestion === 'function') {
                    window.EcosystemBridge.addTempMeetingSuggestion(suggestion);
                }

                CouncilMeetingSystem.saveMeetings();

                console.log('[VotingSystem] 投票参与率达到' + (participationRate * 100).toFixed(1) + '%，已推送临时业主大会建议');
            }
        }
    };

    // ==================== 会议记录生成与保存功能 ====================

    var MeetingRecorder = {
        startRecording: function(meetingId) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return false;

            CouncilMeetingSystem.meetingStartTime = new Date();
            CouncilMeetingSystem.chatMessages = [];
            CouncilMeetingSystem.voteRecords = [];

            meeting.status = MEETING_STATUS.ONGOING;
            CouncilMeetingSystem.saveMeetings();

            return true;
        },

        recordMessage: function(meetingId, message) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return false;

            var msg = {
                id: 'msg_' + Date.now(),
                userId: message.userId || CouncilMeetingSystem.currentUser.id,
                userName: message.userName || CouncilMeetingSystem.currentUser.name,
                userRoom: message.userRoom || CouncilMeetingSystem.currentUser.room,
                content: message.content,
                time: new Date().toISOString(),
                type: message.type || 'text'
            };

            if (!meeting.chatMessages) meeting.chatMessages = [];
            meeting.chatMessages.push(msg);

            CouncilMeetingSystem.chatMessages.push(msg);
            CouncilMeetingSystem.saveMeetings();

            return msg;
        },

        getMessages: function(meetingId, options) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting || !meeting.chatMessages) return [];

            var messages = meeting.chatMessages;
            
            if (options && options.since) {
                messages = messages.filter(function(m) { return m.time > options.since; });
            }

            return messages;
        },

        generateMinutes: function(meetingId) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return null;

            var duration = 0;
            if (CouncilMeetingSystem.meetingStartTime) {
                duration = Math.round((new Date() - CouncilMeetingSystem.meetingStartTime) / 60000);
            }

            var keyPoints = this.extractKeyPoints(meeting.chatMessages || []);
            var decisions = this.extractDecisions(meeting.votes || []);
            var participants = meeting.participants || [];

            var minutes = {
                id: 'minutes_' + Date.now(),
                meetingId: meetingId,
                title: meeting.title,
                type: meeting.typeLabel,
                host: meeting.host,
                hostRoom: meeting.hostRoom,
                startTime: CouncilMeetingSystem.meetingStartTime ? CouncilMeetingSystem.meetingStartTime.toISOString() : meeting.meetingTime,
                endTime: new Date().toISOString(),
                duration: duration,
                participantCount: participants.length,
                participants: participants.map(function(p) {
                    return {
                        name: p.name,
                        room: p.room,
                        role: p.role,
                        signedIn: p.signedIn
                    };
                }),
                agenda: meeting.agenda || [],
                keyPoints: keyPoints,
                decisions: decisions,
                chatSummary: this.summarizeChat(meeting.chatMessages || []),
                consensus: meeting.consensus || 0,
                nextSteps: this.generateNextSteps(meeting),
                generatedTime: new Date().toISOString(),
                hash: this.generateMinutesHash(meeting)
            };

            meeting.minutes = minutes;
            meeting.status = MEETING_STATUS.COMPLETED;
            CouncilMeetingSystem.saveMeetings();

            return minutes;
        },

        extractKeyPoints: function(messages) {
            var points = [];
            var seen = {};

            messages.forEach(function(msg) {
                if (msg.content && msg.content.length > 20 && !seen[msg.content]) {
                    seen[msg.content] = true;
                    points.push({
                        content: msg.content.substring(0, 100),
                        speaker: msg.userName,
                        time: msg.time
                    });
                }
            });

            return points.slice(0, 5);
        },

        extractDecisions: function(votes) {
            return votes.map(function(vote) {
                return {
                    title: vote.title,
                    result: vote.result,
                    passCondition: vote.passCondition
                };
            });
        },

        summarizeChat: function(messages) {
            var total = messages.length;
            var byUser = {};

            messages.forEach(function(msg) {
                if (!byUser[msg.userName]) {
                    byUser[msg.userName] = 0;
                }
                byUser[msg.userName]++;
            });

            return {
                totalMessages: total,
                topSpeakers: Object.entries(byUser)
                    .sort(function(a, b) { return b[1] - a[1]; })
                    .slice(0, 3)
                    .map(function(entry) { return { name: entry[0], count: entry[1] }; })
            };
        },

        generateNextSteps: function(meeting) {
            var steps = [];

            if (meeting.consensus >= TEMP_MEETING_THRESHOLD) {
                steps.push('认同度已达到' + (meeting.consensus * 100).toFixed(0) + '%，建议推进临时业主大会');
            }

            if (meeting.votes && meeting.votes.length > 0) {
                var pendingVotes = meeting.votes.filter(function(v) { return v.status === 'voting'; });
                if (pendingVotes.length > 0) {
                    steps.push('尚有' + pendingVotes.length + '项投票待完成');
                }
            }

            return steps;
        },

        generateMinutesHash: function(meeting) {
            var data = meeting.id + '_' + meeting.title + '_' + Date.now();
            var hash = 0;
            for (var i = 0; i < data.length; i++) {
                var char = data.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return 'minutes_hash_' + Math.abs(hash).toString(16);
        },

        downloadMinutes: function(meetingId) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting || !meeting.minutes) return false;

            var minutes = meeting.minutes;
            var content = this.formatMinutesAsText(minutes);
            var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            var url = URL.createObjectURL(blob);

            var a = document.createElement('a');
            a.href = url;
            a.download = '会议纪要_' + meeting.title + '_' + new Date().toISOString().split('T')[0] + '.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        },

        formatMinutesAsText: function(minutes) {
            var lines = [];
            lines.push('========================================');
            lines.push('          会议纪要');
            lines.push('========================================');
            lines.push('');
            lines.push('会议主题：' + minutes.title);
            lines.push('会议类型：' + minutes.type);
            lines.push('主持人：' + minutes.host + ' (' + minutes.hostRoom + ')');
            lines.push('会议时间：' + new Date(minutes.startTime).toLocaleString('zh-CN'));
            lines.push('会议时长：' + minutes.duration + '分钟');
            lines.push('参会人数：' + minutes.participantCount + '人');
            lines.push('');
            lines.push('----------------------------------------');
            lines.push('参会人员：');
            lines.push('----------------------------------------');
            minutes.participants.forEach(function(p) {
                lines.push('  - ' + p.name + ' (' + p.room + ') - ' + (p.signedIn ? '已签到' : '未签到'));
            });
            lines.push('');
            lines.push('----------------------------------------');
            lines.push('会议议程：');
            lines.push('----------------------------------------');
            minutes.agenda.forEach(function(item, idx) {
                lines.push((idx + 1) + '. ' + item.title + (item.time ? ' (' + item.time + ')' : ''));
                if (item.description) {
                    lines.push('   ' + item.description);
                }
            });
            lines.push('');
            lines.push('----------------------------------------');
            lines.push('讨论要点：');
            lines.push('----------------------------------------');
            minutes.keyPoints.forEach(function(point, idx) {
                lines.push((idx + 1) + '. [' + point.speaker + '] ' + point.content);
            });
            lines.push('');
            if (minutes.decisions.length > 0) {
                lines.push('----------------------------------------');
                lines.push('表决结果：');
                lines.push('----------------------------------------');
                minutes.decisions.forEach(function(decision, idx) {
                    lines.push((idx + 1) + '. ' + decision.title);
                    if (decision.result) {
                        lines.push('   结果：' + (decision.result.passed ? '通过' : '未通过'));
                        lines.push('   同意：' + decision.result.agreeCount + '票 (' + decision.result.countRate + ')');
                    }
                });
                lines.push('');
            }
            lines.push('----------------------------------------');
            lines.push('后续行动：');
            lines.push('----------------------------------------');
            minutes.nextSteps.forEach(function(step, idx) {
                lines.push((idx + 1) + '. ' + step);
            });
            lines.push('');
            lines.push('========================================');
            lines.push('存证哈希：' + minutes.hash);
            lines.push('生成时间：' + new Date(minutes.generatedTime).toLocaleString('zh-CN'));
            lines.push('========================================');

            return lines.join('\n');
        }
    };

    // ==================== AI阶段性小结功能 ====================

    var AIAssistant = {
        generateFirstSummary: function(meetingId) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return null;

            var summary = {
                type: 'first',
                title: '会议主题确认',
                content: '本次会议的主题是：【' + meeting.title + '】',
                meetingGoal: meeting.description || '请各位与会者围绕主题展开讨论',
                time: new Date().toISOString()
            };

            if (!meeting.aiSummaries) meeting.aiSummaries = [];
            meeting.aiSummaries.push(summary);
            CouncilMeetingSystem.aiSummaryState.firstDone = true;

            return summary;
        },

        generateSecondSummary: function(meetingId) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return null;

            var messages = meeting.chatMessages || [];
            var focusPoints = this.analyzeFocusPoints(messages);
            var consensus = this.calculateConsensus(messages);

            var summary = {
                type: 'second',
                title: '讨论进展小结',
                focusPoints: focusPoints,
                consensus: consensus,
                content: '上一阶段讨论形成了' + focusPoints.length + '个焦点，当前认同度为' + (consensus * 100).toFixed(0) + '%',
                time: new Date().toISOString()
            };

            meeting.consensus = consensus;
            if (!meeting.aiSummaries) meeting.aiSummaries = [];
            meeting.aiSummaries.push(summary);
            CouncilMeetingSystem.aiSummaryState.secondDone = true;

            return summary;
        },

        generateThirdSummary: function(meetingId) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return null;

            var messages = meeting.chatMessages || [];
            var focusPoints = this.analyzeFocusPoints(messages);
            var consensus = this.calculateConsensus(messages);

            var summary = {
                type: 'third',
                title: '会议总结',
                focusPoints: focusPoints,
                consensus: consensus,
                content: '会议即将结束，最终讨论焦点为' + focusPoints.length + '个，认同度为' + (consensus * 100).toFixed(0) + '%',
                time: new Date().toISOString()
            };

            meeting.consensus = consensus;
            if (!meeting.aiSummaries) meeting.aiSummaries = [];
            meeting.aiSummaries.push(summary);
            CouncilMeetingSystem.aiSummaryState.thirdDone = true;

            return summary;
        },

        analyzeFocusPoints: function(messages) {
            var keywords = {};
            var stopWords = ['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'];

            messages.forEach(function(msg) {
                if (!msg.content) return;
                var words = msg.content.split(/\s+|[,，。！？、；：""''（）【】]/);
                words.forEach(function(word) {
                    word = word.trim();
                    if (word.length >= 2 && stopWords.indexOf(word) < 0) {
                        keywords[word] = (keywords[word] || 0) + 1;
                    }
                });
            });

            var sorted = Object.entries(keywords)
                .sort(function(a, b) { return b[1] - a[1]; })
                .slice(0, 3);

            return sorted.map(function(entry) {
                return { keyword: entry[0], count: entry[1] };
            });
        },

        calculateConsensus: function(messages) {
            if (messages.length === 0) return 0;

            var positiveWords = ['同意', '支持', '赞成', '好的', '可以', '没问题', '认同'];
            var negativeWords = ['反对', '不同意', '不行', '拒绝', '否决'];

            var positive = 0;
            var negative = 0;

            messages.forEach(function(msg) {
                var content = msg.content || '';
                positiveWords.forEach(function(w) {
                    if (content.indexOf(w) >= 0) positive++;
                });
                negativeWords.forEach(function(w) {
                    if (content.indexOf(w) >= 0) negative++;
                });
            });

            var total = positive + negative;
            if (total === 0) return 0.5;

            return positive / total;
        },

        generateLegalInterpretation: function(topic) {
            var interpretations = {
                '电梯': '根据《民法典》第二百七十八条，改建、重建建筑物及其附属设施，应当经专有部分占建筑物总面积三分之二以上的业主且占总人数三分之二以上的业主参与表决，并经参与表决专有部分面积四分之三以上的业主且参与表决人数四分之三以上的业主同意。',
                '物业': '根据《物业管理条例》，业主大会有权决定选聘、解聘物业服务企业。选聘物业服务企业应当经专有部分占建筑物总面积过半数的业主且占总人数过半数的业主同意。',
                '维修资金': '根据《住宅专项维修资金管理办法》，使用维修资金应当经专有部分占建筑物总面积三分之二以上的业主且占总人数三分之二以上的业主讨论通过。',
                '停车': '根据《民法典》和《物业管理条例》，占用业主共有的道路或者其他场地用于停放汽车的车位，属于业主共有。'
            };

            for (var key in interpretations) {
                if (topic.indexOf(key) >= 0) {
                    return {
                        topic: topic,
                        interpretation: interpretations[key],
                        relatedLaw: '《民法典》《物业管理条例》'
                    };
                }
            }

            return {
                topic: topic,
                interpretation: '请咨询专业法律人士获取准确的法律解读。',
                relatedLaw: '相关法律法规'
            };
        },

        generateFeelingEvaluation: function(meetingId) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return null;

            return {
                meetingId: meetingId,
                question: '如果有超过20%以上的本小区业主明确表态认同您刚才的观点，您是否同意继续为了支持这个观点，继续推动召开本小区的业主大会临时会议？',
                options: ['同意', '不同意', '需要考虑'],
                consensus: meeting.consensus || 0
            };
        }
    };

    // ==================== 会议状态流转与通知功能 ====================

    var MeetingStateManager = {
        updateStatus: function(meetingId, newStatus) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return false;

            var validTransitions = {
                'pending': ['approved', 'rejected'],
                'approved': ['ongoing', 'cancelled'],
                'ongoing': ['completed', 'escalated'],
                'completed': ['escalated'],
                'escalated': [],
                'rejected': []
            };

            var currentStatus = meeting.status;
            if (!validTransitions[currentStatus] || validTransitions[currentStatus].indexOf(newStatus) < 0) {
                console.warn('[MeetingStateManager] 无效的状态转换: ' + currentStatus + ' -> ' + newStatus);
                return false;
            }

            meeting.status = newStatus;
            meeting.statusUpdateTime = new Date().toISOString();

            CouncilMeetingSystem.saveMeetings();

            this.notifyStatusChange(meeting, newStatus);

            return true;
        },

        notifyStatusChange: function(meeting, newStatus) {
            var notifications = {
                'approved': {
                    title: '会议审核通过',
                    content: '您申请的会议【' + meeting.title + '】已通过审核，请按时参加。'
                },
                'rejected': {
                    title: '会议审核未通过',
                    content: '您申请的会议【' + meeting.title + '】未通过审核，请查看原因后重新申请。'
                },
                'ongoing': {
                    title: '会议已开始',
                    content: '会议【' + meeting.title + '】已开始，请尽快进入会议室。'
                },
                'completed': {
                    title: '会议已结束',
                    content: '会议【' + meeting.title + '】已结束，请查看会议纪要。'
                },
                'escalated': {
                    title: '议案已升级',
                    content: '会议【' + meeting.title + '】认同度已达标，已升级为临时业主大会议案。'
                }
            };

            var notification = notifications[newStatus];
            if (notification && window.EcosystemBridge && typeof window.EcosystemBridge.addNotification === 'function') {
                window.EcosystemBridge.addNotification({
                    id: 'notify_' + Date.now(),
                    type: 'meeting',
                    title: notification.title,
                    content: notification.content,
                    meetingId: meeting.id,
                    time: new Date().toISOString(),
                    read: false
                });
            }
        },

        scheduleReminder: function(meetingId, minutesBefore) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting || !meeting.meetingTime) return false;

            var meetingTime = new Date(meeting.meetingTime);
            var reminderTime = new Date(meetingTime.getTime() - minutesBefore * 60000);
            var now = new Date();

            var delay = reminderTime.getTime() - now.getTime();
            if (delay <= 0) return false;

            setTimeout(function() {
                if (window.EcosystemBridge && typeof window.EcosystemBridge.addNotification === 'function') {
                    window.EcosystemBridge.addNotification({
                        id: 'reminder_' + meetingId + '_' + minutesBefore,
                        type: 'meeting_reminder',
                        title: '会议提醒',
                        content: '会议【' + meeting.title + '】将在' + minutesBefore + '分钟后开始，请做好准备。',
                        meetingId: meetingId,
                        time: new Date().toISOString(),
                        read: false
                    });
                }
            }, delay);

            return true;
        },

        checkAndAutoStart: function() {
            var now = new Date();

            CouncilMeetingSystem.meetings.forEach(function(meeting) {
                if (meeting.status === MEETING_STATUS.APPROVED && meeting.meetingTime) {
                    var meetingTime = new Date(meeting.meetingTime);
                    if (meetingTime <= now) {
                        meeting.status = MEETING_STATUS.ONGOING;
                        meeting.autoStartTime = now.toISOString();
                    }
                }
            });

            CouncilMeetingSystem.saveMeetings();
        }
    };

    // ==================== 会前准备室功能 ====================

    var PrepRoomManager = {
        getPrepRoomData: function(meetingId) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return null;

            return {
                meeting: meeting,
                agenda: AgendaManager.getAgenda(meetingId),
                materials: meeting.materials || [],
                complianceItems: this.getComplianceItems(meeting),
                participants: meeting.participants || [],
                isHost: meeting.hostId === CouncilMeetingSystem.currentUser.id
            };
        },

        getComplianceItems: function(meeting) {
            var isFormalMeeting = meeting.typeLabel && (
                meeting.typeLabel.indexOf('业主大会') >= 0 || 
                meeting.typeLabel.indexOf('临时会议') >= 0
            );

            if (!isFormalMeeting) {
                return [];
            }

            return [
                { key: 'notice', label: '会议通知已发送（提前15日）', done: false },
                { key: 'filing', label: '会议材料已备案（提前3个工作日）', done: false },
                { key: 'preparation', label: '筹备组业主代表占比≥50%', done: false },
                { key: 'signature', label: '临时会议提议达到双20%签名', done: false },
                { key: 'vote_ticket', label: '表决票为记名式设计', done: false },
                { key: 'proxy', label: '授权委托书模板已准备', done: false },
                { key: 'delivery', label: '通知送达凭证完整', done: false }
            ];
        },

        updateComplianceItem: function(meetingId, itemKey, done) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return false;

            if (!meeting.complianceItems) {
                meeting.complianceItems = this.getComplianceItems(meeting);
            }

            var item = meeting.complianceItems.find(function(i) { return i.key === itemKey; });
            if (item) {
                item.done = done;
                CouncilMeetingSystem.saveMeetings();
            }

            return true;
        },

        getComplianceProgress: function(meetingId) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting || !meeting.complianceItems) return 0;

            var total = meeting.complianceItems.length;
            var done = meeting.complianceItems.filter(function(i) { return i.done; }).length;

            return total > 0 ? Math.round((done / total) * 100) : 0;
        },

        addMaterial: function(meetingId, material) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return false;

            if (!meeting.materials) meeting.materials = [];

            meeting.materials.push({
                id: 'mat_' + Date.now(),
                name: material.name,
                type: material.type || 'doc',
                size: material.size || '—',
                url: material.url || '#',
                uploadTime: new Date().toISOString(),
                readBy: []
            });

            CouncilMeetingSystem.saveMeetings();
            return true;
        },

        markMaterialRead: function(meetingId, materialId) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting || !meeting.materials) return false;

            var material = meeting.materials.find(function(m) { return m.id === materialId; });
            if (!material) return false;

            var userId = CouncilMeetingSystem.currentUser.id;
            if (!material.readBy) material.readBy = [];
            if (material.readBy.indexOf(userId) < 0) {
                material.readBy.push(userId);
            }

            CouncilMeetingSystem.saveMeetings();
            return true;
        },

        getPrepProgress: function(meetingId) {
            var meeting = CouncilMeetingSystem.meetings.find(function(m) { return m.id === meetingId; });
            if (!meeting) return { total: 4, done: 0, percent: 0 };

            var agendaDone = meeting.agenda && meeting.agenda.length > 0;
            var materialsDone = meeting.materials && meeting.materials.length > 0;
            var signedIn = meeting.participants && meeting.participants.some(function(p) { 
                return p.id === CouncilMeetingSystem.currentUser.id && p.signedIn; 
            });
            var complianceDone = this.getComplianceProgress(meetingId) >= 100;

            var done = (agendaDone ? 1 : 0) + (materialsDone ? 1 : 0) + (signedIn ? 1 : 0) + (complianceDone ? 1 : 0);

            return {
                total: 4,
                done: done,
                percent: Math.round((done / 4) * 100),
                details: {
                    agenda: agendaDone,
                    materials: materialsDone,
                    signedIn: signedIn,
                    compliance: complianceDone
                }
            };
        }
    };

    // ==================== 导出全局接口 ====================

    global.CouncilMeetingSystem = CouncilMeetingSystem;
    global.MeetingCreator = MeetingCreator;
    global.ParticipantAuth = ParticipantAuth;
    global.AgendaManager = AgendaManager;
    global.VotingSystem = VotingSystem;
    global.MeetingRecorder = MeetingRecorder;
    global.AIAssistant = AIAssistant;
    global.MeetingStateManager = MeetingStateManager;
    global.PrepRoomManager = PrepRoomManager;

    global.MEETING_TYPES = MEETING_TYPES;
    global.MEETING_STATUS = MEETING_STATUS;
    global.USER_ROLES = USER_ROLES;
    global.VOTE_RULES = VOTE_RULES;

    // 初始化
    if (document.readyState === 'complete') {
        CouncilMeetingSystem.init();
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            CouncilMeetingSystem.init();
        });
    }

})(typeof window !== 'undefined' ? window : this);
