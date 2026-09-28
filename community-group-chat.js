(function(window) {
    'use strict';

    var STORAGE_KEY = 'sgzf_community_chat';
    var CURRENT_USER_KEY = 'sgzf_community_user';

    function getStorage() {
        try {
            var data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    }

    function setStorage(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    function getCurrentUser() {
        try {
            var user = localStorage.getItem(CURRENT_USER_KEY);
            return user ? JSON.parse(user) : getDefaultUser();
        } catch (e) {
            return getDefaultUser();
        }
    }

    function getDefaultUser() {
        return {
            id: 'community_officer',
            name: '张专员',
            role: 'community_officer',
            department: '和平社区居委会',
            permissions: {
                canManageGroups: true,
                canPublishNotice: true,
                canViewOwnerInfo: true,
                canSendActivity: true,
                canModerate: true
            }
        };
    }

    var CommunityGroupChat = {
        groups: [],
        messages: {},
        currentGroupId: null,
        currentGroup: null,
        searchKeyword: '',
        searchResults: [],
        container: null,

        init: function(containerId) {
            this.container = document.getElementById(containerId);
            if (!this.container) return;
            
            this.loadCurrentUser();
            this.loadGroups();
            this.renderGroupList();
            this.bindGlobalEvents();
        },

        loadCurrentUser: function() {
            if (typeof EcosystemBridge !== 'undefined') {
                var userData = EcosystemBridge.getCommunityOfficer();
                if (userData) {
                    this.currentUser = userData;
                } else {
                    this.currentUser = getDefaultUser();
                }
            } else {
                this.currentUser = getDefaultUser();
            }
        },

        loadGroups: function() {
            if (typeof EcosystemBridge !== 'undefined') {
                this.groups = EcosystemBridge.getChatGroups() || [];
            } else {
                this.groups = this.getDefaultGroups();
            }
        },

        getDefaultGroups: function() {
            return [
                {
                    id: 'private_1',
                    name: '阳光花园业主群',
                    type: 'PRIVATE',
                    community: '阳光花园',
                    desc: '阳光花园业主交流天地',
                    notice: '欢迎来到阳光花园业主群！请文明交流，共建和谐社区。',
                    noticeTime: new Date().toISOString(),
                    noticePublisher: '张专员',
                    aiEnabled: true,
                    icon: 'fa-users',
                    color: '#597EF7',
                    members: [
                        { id: 'community_officer', name: '张专员', role: 'admin', department: '和平社区居委会', online: true },
                        { id: 'owner_1', name: '王先生', room: '1-101', role: 'member', online: true },
                        { id: 'owner_2', name: '李女士', room: '1-102', role: 'member', online: false },
                        { id: 'owner_3', name: '张先生', room: '2-201', role: 'member', online: true },
                        { id: 'ai_assistant', name: 'AI智能管家', isAI: true, role: 'member', online: true }
                    ],
                    createTime: new Date().toISOString()
                },
                {
                    id: 'general',
                    name: '阳光花园总群',
                    type: 'GENERAL',
                    community: '阳光花园',
                    desc: '小区官方交流群',
                    notice: '小区公告将在此发布',
                    aiEnabled: true,
                    icon: 'fa-house-chimney',
                    color: '#1890FF',
                    members: [
                        { id: 'community_officer', name: '张专员', role: 'admin', department: '和平社区居委会', online: true },
                        { id: 'ai_assistant', name: 'AI智能管家', isAI: true, role: 'member', online: true }
                    ],
                    createTime: new Date().toISOString()
                }
            ];
        },

        bindGlobalEvents: function() {
            var self = this;
            if (typeof EcosystemBridge !== 'undefined') {
                EcosystemBridge.subscribe(function(store, value, detail) {
                    if (store === 'chat_groups') {
                        self.groups = value || [];
                        self.renderGroupList();
                    }
                    if (store && store.indexOf('chat_messages_') === 0) {
                        var groupId = store.replace('chat_messages_', '');
                        if (groupId === self.currentGroupId) {
                            self.messages = EcosystemBridge.getChatMessages(groupId) || [];
                            self.renderMessageList();
                            self.scrollToBottom();
                        }
                    }
                });
            }
        },

        renderGroupList: function() {
            var user = this.currentUser;
            
            var officialGroups = this.groups.filter(function(g) { return g.type === 'GENERAL' || g.type === 'OFFICIAL'; });
            var privateGroups = this.groups.filter(function(g) { return g.type === 'PRIVATE'; });
            var interestGroups = this.groups.filter(function(g) { return g.type === 'INTEREST'; });

            var html = '<div class="community-group-list">' +
                '<div class="group-list-header">' +
                    '<div class="header-left">' +
                        '<i class="fa-solid fa-angle-left back-btn" onclick="CommunityGroupChat.close()"></i>' +
                        '<span class="header-title">社区群聊管理</span>' +
                    '</div>' +
                    '<div class="header-right">' +
                        '<i class="fa-solid fa-plus create-btn" onclick="CommunityGroupChat.showCreateGroupModal()" title="创建群组"></i>' +
                    '</div>' +
                '</div>' +
                '<div class="group-list-body">';

            if (officialGroups.length > 0) {
                html += '<div class="section-title">' +
                    '<span><i class="fa-solid fa-building-columns"></i> 官方群</span>' +
                '</div>' +
                '<div class="official-group-list">';
                officialGroups.forEach(function(g) {
                    var unread = CommunityGroupChat.getUnreadCount(g.id);
                    html += CommunityGroupChat.renderGroupCard(g, unread, true);
                });
                html += '</div>';
            }

            if (privateGroups.length > 0) {
                html += '<div class="section-title">' +
                    '<span><i class="fa-solid fa-users"></i> 业主群</span>' +
                '</div>' +
                '<div class="private-group-list">';
                privateGroups.forEach(function(g) {
                    var unread = CommunityGroupChat.getUnreadCount(g.id);
                    html += CommunityGroupChat.renderGroupCard(g, unread, false);
                });
                html += '</div>';
            }

            if (interestGroups.length > 0) {
                html += '<div class="section-title">' +
                    '<span><i class="fa-solid fa-star"></i> 兴趣群</span>' +
                '</div>' +
                '<div class="interest-group-grid">';
                interestGroups.forEach(function(g) {
                    html += CommunityGroupChat.renderInterestCard(g);
                });
                html += '</div>';
            }

            if (this.groups.length === 0) {
                html += '<div class="empty-state">' +
                    '<i class="fa-solid fa-comments"></i>' +
                    '<p>暂无群组</p>' +
                '</div>';
            }

            html += '</div>' +
            '</div>';

            this.container.innerHTML = html;
        },

        renderGroupCard: function(group, unreadCount, isOfficial) {
            var count = unreadCount || 0;
            var lastMsg = this.getLastMessage(group.id);
            var membersCount = group.members ? group.members.length : 0;
            
            var tagHtml = '';
            if (group.type === 'GENERAL') {
                tagHtml = '<span class="group-tag tag-general">总群</span>';
            } else if (group.type === 'OFFICIAL') {
                tagHtml = '<span class="group-tag tag-official">官方</span>';
            } else if (group.type === 'PRIVATE') {
                tagHtml = '<span class="group-tag tag-private">业主</span>';
            }

            return '<div class="group-card" onclick="CommunityGroupChat.enterChat(\'' + group.id + '\')" role="button" tabindex="0" aria-label="进入群组：' + group.name + '" onkeydown="if(event.key===\'Enter\'||event.code===\'Space\'){ event.preventDefault(); CommunityGroupChat.enterChat(\'' + group.id + '\'); }">' +
                '<div class="group-avatar" style="background: ' + (group.color || '#597EF7') + '">' +
                    '<i class="fa-solid ' + (group.icon || 'fa-users') + '"></i>' +
                '</div>' +
                '<div class="group-info">' +
                    '<div class="group-name">' + group.name + ' ' + tagHtml + '</div>' +
                    '<div class="group-desc">' + (group.desc || '暂无描述') + '</div>' +
                    '<div class="group-meta">' +
                        '<span><i class="fa-solid fa-users"></i> ' + membersCount + '人</span>' +
                        (group.aiEnabled ? '<span class="ai-badge"><i class="fa-solid fa-robot"></i> AI</span>' : '') +
                    '</div>' +
                '</div>' +
                (count > 0 ? '<span class="unread-badge">' + count + '</span>' : '') +
                '<i class="fa-solid fa-chevron-right enter-icon"></i>' +
            '</div>';
        },

        renderInterestCard: function(group) {
            return '<div class="interest-card" onclick="CommunityGroupChat.enterChat(\'' + group.id + '\')">' +
                '<div class="interest-icon" style="background: ' + (group.color || '#13C2C2') + '">' +
                    '<i class="fa-solid ' + (group.icon || 'fa-star') + '"></i>' +
                '</div>' +
                '<div class="interest-name">' + group.name + '</div>' +
                '<div class="interest-meta">' + (group.members ? group.members.length : 0) + ' 人</div>' +
            '</div>';
        },

        enterChat: function(groupId) {
            var group = this.groups.find(function(g) { return g.id === groupId; });
            if (!group) {
                alert('群组不存在');
                return;
            }

            this.currentGroupId = groupId;
            this.currentGroup = group;
            
            if (typeof EcosystemBridge !== 'undefined') {
                this.messages = EcosystemBridge.getChatMessages(groupId) || [];
            } else {
                this.messages = this.getLocalMessages(groupId);
            }

            this.renderChatRoom();
            this.bindChatEvents();
        },

        getLocalMessages: function(groupId) {
            var storage = getStorage();
            var key = 'messages_' + groupId;
            return storage[key] || this.getDefaultMessages(groupId);
        },

        getDefaultMessages: function(groupId) {
            if (groupId === 'private_1') {
                return [
                    {
                        id: 'msg_1',
                        groupId: groupId,
                        type: 'notice',
                        content: '欢迎来到阳光花园业主群！请文明交流，共建和谐社区。',
                        from: { id: 'community_officer', name: '张专员', department: '和平社区居委会' },
                        timestamp: Date.now() - 3600000
                    },
                    {
                        id: 'msg_2',
                        groupId: groupId,
                        type: 'text',
                        content: '大家好，我是社区专员张专员，有问题可以@我',
                        from: { id: 'community_officer', name: '张专员', department: '和平社区居委会' },
                        timestamp: Date.now() - 3000000
                    },
                    {
                        id: 'msg_3',
                        groupId: groupId,
                        type: 'text',
                        content: '张专员您好，请问小区门口的路灯什么时候能修好？',
                        from: { id: 'owner_1', name: '王先生', room: '1-101' },
                        timestamp: Date.now() - 1800000
                    },
                    {
                        id: 'msg_4',
                        groupId: groupId,
                        type: 'activity',
                        activityData: {
                            title: '周末社区清洁活动',
                            time: '本周六 上午9:00',
                            location: '小区中心广场',
                            desc: '欢迎大家参与社区环境美化活动'
                        },
                        from: { id: 'community_officer', name: '张专员', department: '和平社区居委会' },
                        timestamp: Date.now() - 600000
                    }
                ];
            }
            return [];
        },

        renderChatRoom: function() {
            var group = this.currentGroup;
            var user = this.currentUser;

            var html = '<div class="chat-room-container">' +
                '<div class="chat-room-header">' +
                    '<div class="header-left">' +
                        '<i class="fa-solid fa-angle-left back-btn" onclick="CommunityGroupChat.backToList()"></i>' +
                        '<span class="chat-title">' + group.name + '</span>' +
                        (group.type === 'GENERAL' ? '<span class="ai-tag">AI管理</span>' : '') +
                    '</div>' +
                    '<div class="header-right">' +
                        '<i class="fa-solid fa-magnifying-glass search-btn" onclick="CommunityGroupChat.toggleSearch()" title="搜索"></i>' +
                        '<i class="fa-solid fa-users members-btn" onclick="CommunityGroupChat.toggleMembers()" title="成员"></i>' +
                        '<i class="fa-solid fa-gear settings-btn" onclick="CommunityGroupChat.toggleSettings()" title="设置"></i>' +
                    '</div>' +
                '</div>' +

                '<div class="chat-search-bar" id="chatSearchBar" style="display:none;">' +
                    '<input type="text" id="searchInput" placeholder="搜索聊天记录..." class="search-input">' +
                    '<button class="search-close-btn" onclick="CommunityGroupChat.closeSearch()">取消</button>' +
                '</div>' +

                '<div class="chat-announcement-bar" id="chatAnnouncementBar" style="display:' + (group.notice ? 'flex' : 'none') + ';">' +
                    '<i class="fa-solid fa-bullhorn"></i>' +
                    '<span class="announcement-text">' + (group.notice || '暂无公告') + '</span>' +
                    '<i class="fa-solid fa-times" onclick="CommunityGroupChat.hideAnnouncementBar()"></i>' +
                '</div>' +

                '<div class="chat-messages" id="chatMessages"></div>' +

                '<div class="chat-input-area">' +
                    '<div class="input-tools">' +
                        '<span class="tool-btn notice-btn" onclick="CommunityGroupChat.showPublishNoticeModal()" title="发布群公告">' +
                            '<i class="fa-solid fa-bullhorn"></i> 公告' +
                        '</span>' +
                        '<span class="tool-btn activity-btn" onclick="CommunityGroupChat.showPublishActivityModal()" title="发布活动">' +
                            '<i class="fa-solid fa-calendar-check"></i> 活动' +
                        '</span>' +
                        (group.aiEnabled ? '<span class="tool-btn at-ai-btn" onclick="CommunityGroupChat.insertAtAI()">@AI</span>' : '') +
                    '</div>' +
                    '<div class="input-wrapper">' +
                        '<textarea id="messageInput" placeholder="输入消息..." rows="1"></textarea>' +
                        '<button class="send-btn" id="sendBtn" style="display:none;">发送</button>' +
                    '</div>' +
                '</div>' +

                '<div class="chat-sidebar" id="memberSidebar">' +
                    '<div class="sidebar-header">' +
                        '<span>群成员 (' + (group.members ? group.members.length : 0) + ')</span>' +
                        '<i class="fa-solid fa-times close-sidebar-btn" onclick="CommunityGroupChat.toggleMembers()"></i>' +
                    '</div>' +
                    '<div class="member-list" id="memberList"></div>' +
                    '<div class="member-actions">' +
                        '<button class="action-btn" onclick="CommunityGroupChat.showOwnerInfoModal()">' +
                            '<i class="fa-solid fa-user-shield"></i> 业主信息' +
                        '</button>' +
                    '</div>' +
                '</div>' +

                '<div class="chat-settings" id="settingsPanel">' +
                    '<div class="settings-header">' +
                        '<span>群设置</span>' +
                        '<i class="fa-solid fa-times close-settings-btn" onclick="CommunityGroupChat.toggleSettings()"></i>' +
                    '</div>' +
                    '<div class="settings-content" id="settingsContent"></div>' +
                '</div>' +
            '</div>';

            this.container.innerHTML = html;
            this.renderMessages();
            this.renderMembers();
            this.renderSettings();
        },

        renderMessages: function() {
            var container = document.getElementById('chatMessages');
            var user = this.currentUser;
            container.innerHTML = '';

            if (this.messages.length === 0) {
                container.innerHTML = '<div class="empty-messages">' +
                    '<i class="fa-solid fa-comments"></i>' +
                    '<p>暂无消息记录</p>' +
                '</div>';
                return;
            }

            this.messages.forEach(function(msg) {
                var isSelf = msg.from && msg.from.id === user.id;
                var msgHtml = '<div class="message ' + (isSelf ? 'self' : '') + '" data-id="' + msg.id + '">' +
                    '<div class="message-avatar">' +
                        '<img src="' + CommunityGroupChat.getAvatarUrl(msg.from) + '" alt="' + (msg.from.name || '用户') + '">' +
                    '</div>' +
                    '<div class="message-content">' +
                        '<div class="message-name">' + CommunityGroupChat.formatSenderName(msg.from) + '</div>' +
                        '<div class="message-bubble">';

                if (msg.type === 'text') {
                    msgHtml += CommunityGroupChat.formatTextMessage(msg.content);
                } else if (msg.type === 'image') {
                    msgHtml += '<img src="' + msg.content + '" class="message-image" onclick="CommunityGroupChat.previewImage(this.src)">';
                } else if (msg.type === 'notice') {
                    msgHtml += CommunityGroupChat.renderNoticeCard(msg);
                } else if (msg.type === 'activity') {
                    msgHtml += CommunityGroupChat.renderActivityCard(msg);
                } else if (msg.type === 'system') {
                    msgHtml += '<div class="system-message">' + msg.content + '</div>';
                } else if (msg.type === 'work_order') {
                    msgHtml += CommunityGroupChat.renderWorkOrderCard(msg.workOrderData);
                }

                msgHtml += '</div>' +
                        '<div class="message-time">' + CommunityGroupChat.formatTime(msg.timestamp) + '</div>' +
                    '</div>' +
                '</div>';
                container.innerHTML += msgHtml;
            });

            this.scrollToBottom();
        },

        getAvatarUrl: function(from) {
            if (!from) return 'https://api.dicebear.com/7.x/initials/svg?seed=User';
            if (from.isAI) return 'https://api.dicebear.com/7.x/bottts/svg?seed=AI&backgroundColor=b6e3f4';
            if (from.id === 'community_officer') return 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(from.name);
            return 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(from.name);
        },

        formatSenderName: function(from) {
            if (!from) return '未知用户';
            var name = from.name || '用户';
            if (from.isAI) return name + ' (AI)';
            if (from.department) return name + ' · ' + from.department;
            if (from.room) return name + ' · ' + from.room;
            return name;
        },

        formatTextMessage: function(text) {
            var formatted = text;
            formatted = formatted.replace(/@智能管家/g, '<span class="ai-mention">@智能管家</span>');
            formatted = formatted.replace(/@AI/g, '<span class="ai-mention">@AI</span>');
            formatted = formatted.replace(/@张专员/g, '<span class="mention">@张专员</span>');
            return formatted;
        },

        renderNoticeCard: function(msg) {
            return '<div class="notice-card">' +
                '<div class="notice-header">' +
                    '<i class="fa-solid fa-bullhorn"></i>' +
                    '<span>群公告</span>' +
                '</div>' +
                '<div class="notice-content">' + msg.content + '</div>' +
                '<div class="notice-footer">' +
                    '<span class="notice-time">' + this.formatTime(msg.timestamp) + '</span>' +
                    '<span class="notice-publisher">' + (msg.from ? msg.from.name : '管理员') + ' 发布</span>' +
                '</div>' +
            '</div>';
        },

        renderActivityCard: function(msg) {
            var data = msg.activityData || {};
            return '<div class="activity-card">' +
                '<div class="activity-header">' +
                    '<i class="fa-solid fa-calendar-check"></i>' +
                    '<span>社区活动</span>' +
                '</div>' +
                '<div class="activity-body">' +
                    '<div class="activity-title">' + (data.title || '活动通知') + '</div>' +
                    '<div class="activity-row">' +
                        '<i class="fa-solid fa-clock"></i>' +
                        '<span>' + (data.time || '待定') + '</span>' +
                    '</div>' +
                    '<div class="activity-row">' +
                        '<i class="fa-solid fa-location-dot"></i>' +
                        '<span>' + (data.location || '待定') + '</span>' +
                    '</div>' +
                    '<div class="activity-desc">' + (data.desc || '') + '</div>' +
                '</div>' +
                '<div class="activity-footer">' +
                    '<button class="activity-btn" onclick="CommunityGroupChat.joinActivity(\'' + msg.id + '\')">立即参与</button>' +
                '</div>' +
            '</div>';
        },

        renderWorkOrderCard: function(data) {
            return '<div class="work-order-card">' +
                '<div class="wo-header">' +
                    '<i class="fa-solid fa-clipboard-check"></i>' +
                    '<span>工单已生成</span>' +
                '</div>' +
                '<div class="wo-body">' +
                    '<div class="wo-row">' +
                        '<span class="wo-label">工单类型</span>' +
                        '<span class="wo-value">' + data.type + '</span>' +
                    '</div>' +
                    '<div class="wo-row">' +
                        '<span class="wo-label">问题描述</span>' +
                        '<span class="wo-value">' + data.description + '</span>' +
                    '</div>' +
                    '<div class="wo-row">' +
                        '<span class="wo-label">当前状态</span>' +
                        '<span class="wo-status">' + data.status + '</span>' +
                    '</div>' +
                '</div>' +
                '<div class="wo-footer">' +
                    '<button class="wo-btn" onclick="CommunityGroupChat.viewWorkOrder(\'' + data.id + '\')">查看详情</button>' +
                '</div>' +
            '</div>';
        },

        renderMembers: function() {
            var container = document.getElementById('memberList');
            var group = this.currentGroup;
            var user = this.currentUser;

            if (!group.members || group.members.length === 0) {
                container.innerHTML = '<div class="empty-members">暂无成员</div>';
                return;
            }

            var html = '';
            group.members.forEach(function(member) {
                var isSelf = member.id === user.id;
                var isAI = member.isAI;
                var roleText = member.role === 'admin' ? '管理员' : (member.role === 'owner' ? '群主' : '成员');
                var roleClass = member.role === 'admin' ? 'role-admin' : (member.role === 'owner' ? 'role-owner' : 'role-member');

                html += '<div class="member-item" onclick="CommunityGroupChat.showMemberDetail(\'' + member.id + '\')">' +
                    '<div class="member-avatar">' +
                        '<img src="' + CommunityGroupChat.getAvatarUrl(member) + '" alt="' + member.name + '">' +
                        (isAI ? '<span class="ai-badge">AI</span>' : '') +
                        (member.online ? '<span class="online-dot"></span>' : '') +
                    '</div>' +
                    '<div class="member-info">' +
                        '<div class="member-name">' + member.name + '</div>' +
                        '<div class="member-meta">' +
                            (member.department ? member.department + ' · ' : '') +
                            (member.room ? member.room + ' · ' : '') +
                            '<span class="member-role ' + roleClass + '">' + roleText + '</span>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            });

            container.innerHTML = html;
        },

        renderSettings: function() {
            var container = document.getElementById('settingsContent');
            var group = this.currentGroup;

            var html = '';

            if (group.notice) {
                html += '<div class="settings-section">' +
                    '<div class="section-header">' +
                        '<i class="fa-solid fa-bullhorn"></i>' +
                        '<span>群公告</span>' +
                        '<button class="edit-btn" onclick="CommunityGroupChat.showPublishNoticeModal()">编辑</button>' +
                    '</div>' +
                    '<div class="notice-content-box">' + group.notice + '</div>' +
                    (group.noticeTime ? '<div class="notice-meta">发布于 ' + this.formatTime(new Date(group.noticeTime).getTime()) + '</div>' : '') +
                '</div>';
            }

            html += '<div class="settings-section">' +
                '<div class="section-header">' +
                    '<i class="fa-solid fa-bell"></i>' +
                    '<span>消息通知</span>' +
                '</div>' +
                '<div class="settings-item">' +
                    '<span>消息免打扰</span>' +
                    '<div class="toggle-switch ' + (group.settings && group.settings.mute ? 'active' : '') + '" onclick="CommunityGroupChat.toggleMute()"></div>' +
                '</div>' +
                '<div class="settings-item">' +
                    '<span>置顶聊天</span>' +
                    '<div class="toggle-switch ' + (group.settings && group.settings.top ? 'active' : '') + '" onclick="CommunityGroupChat.toggleTop()"></div>' +
                '</div>' +
            '</div>';

            html += '<div class="settings-section">' +
                '<div class="section-header">' +
                    '<i class="fa-solid fa-cog"></i>' +
                    '<span>群管理</span>' +
                '</div>' +
                '<div class="settings-item clickable" onclick="CommunityGroupChat.showGroupInfo()">' +
                    '<span>群信息</span>' +
                    '<i class="fa-solid fa-chevron-right"></i>' +
                '</div>' +
                '<div class="settings-item clickable" onclick="CommunityGroupChat.showOwnerInfoModal()">' +
                    '<span>业主信息</span>' +
                    '<i class="fa-solid fa-chevron-right"></i>' +
                '</div>' +
            '</div>';

            html += '<div class="settings-section danger">' +
                '<div class="settings-item clickable" onclick="CommunityGroupChat.clearHistory()">' +
                    '<span>清空聊天记录</span>' +
                    '<i class="fa-solid fa-chevron-right"></i>' +
                '</div>' +
            '</div>';

            container.innerHTML = html;
        },

        bindChatEvents: function() {
            var self = this;
            var input = document.getElementById('messageInput');
            var sendBtn = document.getElementById('sendBtn');
            var searchInput = document.getElementById('searchInput');

            if (input) {
                input.addEventListener('input', function() {
                    sendBtn.style.display = input.value.trim() ? 'block' : 'none';
                    input.style.height = 'auto';
                    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
                });

                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        self.sendMessage();
                    }
                });
            }

            if (sendBtn) {
                sendBtn.addEventListener('click', function() {
                    self.sendMessage();
                });
            }

            if (searchInput) {
                searchInput.addEventListener('input', function() {
                    self.performSearch(searchInput.value);
                });
            }
        },

        sendMessage: function() {
            var input = document.getElementById('messageInput');
            var text = input.value.trim();
            if (!text) return;

            var user = this.currentUser;
            var msg = {
                id: 'msg_' + Date.now(),
                groupId: this.currentGroupId,
                type: 'text',
                content: text,
                from: {
                    id: user.id,
                    name: user.name,
                    department: user.department
                },
                timestamp: Date.now()
            };

            this.saveMessage(msg);
            this.messages.push(msg);

            input.value = '';
            input.style.height = 'auto';
            document.getElementById('sendBtn').style.display = 'none';

            this.renderMessages();
            this.scrollToBottom();

            if (this.currentGroup.aiEnabled && text.includes('@智能管家')) {
                this.handleAIResponse(text);
            }
        },

        saveMessage: function(msg) {
            var storage = getStorage();
            var key = 'messages_' + this.currentGroupId;
            if (!storage[key]) storage[key] = [];
            storage[key].push(msg);
            setStorage(storage);

            if (typeof EcosystemBridge !== 'undefined') {
                EcosystemBridge.addChatMessage(this.currentGroupId, msg);
            }
        },

        handleAIResponse: function(text) {
            var self = this;
            setTimeout(function() {
                var isWorkOrder = text.includes('报修') || text.includes('投诉') || text.includes('维修') || text.includes('漏水');

                var aiMsg = {
                    id: 'msg_ai_' + Date.now(),
                    groupId: self.currentGroupId,
                    type: isWorkOrder ? 'work_order' : 'text',
                    content: isWorkOrder ? '' : '收到您的消息，正在为您处理...',
                    from: {
                        id: 'ai_assistant',
                        name: 'AI智能管家',
                        isAI: true
                    },
                    timestamp: Date.now()
                };

                if (isWorkOrder) {
                    aiMsg.workOrderData = {
                        id: 'WO_' + Date.now(),
                        type: text.includes('投诉') ? '投诉' : '报修',
                        description: text.replace('@智能管家', '').replace('@AI', '').trim(),
                        status: '待处理',
                        createTime: new Date().toISOString()
                    };
                    aiMsg.content = '已为您生成工单，请查看详情';
                }

                self.saveMessage(aiMsg);
                self.messages.push(aiMsg);
                self.renderMessages();
                self.scrollToBottom();
            }, 1000);
        },

        showPublishNoticeModal: function() {
            var existingModal = document.querySelector('.publish-notice-modal');
            if (existingModal) existingModal.remove();

            var currentNotice = this.currentGroup.notice || '';

            var modal = document.createElement('div');
            modal.className = 'publish-notice-modal';
            modal.innerHTML = '<div class="modal-overlay" onclick="CommunityGroupChat.closePublishNoticeModal()">' +
                '<div class="modal-content" onclick="event.stopPropagation()">' +
                    '<div class="modal-header">' +
                        '<span class="modal-title"><i class="fa-solid fa-bullhorn"></i> 发布群公告</span>' +
                        '<i class="fa-solid fa-times close-modal-btn" onclick="CommunityGroupChat.closePublishNoticeModal()"></i>' +
                    '</div>' +
                    '<div class="modal-body">' +
                        '<div class="form-group">' +
                            '<label>公告内容 <span class="required">*</span></label>' +
                            '<textarea id="noticeContent" class="form-textarea" placeholder="请输入公告内容..." rows="5">' + currentNotice + '</textarea>' +
                        '</div>' +
                        '<div class="form-tips">' +
                            '<i class="fa-solid fa-info-circle"></i>' +
                            '<span>公告将通知所有群成员</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="modal-footer">' +
                        '<button class="btn-cancel" onclick="CommunityGroupChat.closePublishNoticeModal()">取消</button>' +
                        '<button class="btn-primary" onclick="CommunityGroupChat.publishNotice()">发布公告</button>' +
                    '</div>' +
                '</div>' +
            '</div>';

            this.container.appendChild(modal);
        },

        closePublishNoticeModal: function() {
            var modal = document.querySelector('.publish-notice-modal');
            if (modal) modal.remove();
        },

        publishNotice: function() {
            var content = document.getElementById('noticeContent').value.trim();
            if (!content) {
                alert('请输入公告内容');
                return;
            }

            var user = this.currentUser;
            var msg = {
                id: 'msg_notice_' + Date.now(),
                groupId: this.currentGroupId,
                type: 'notice',
                content: content,
                from: {
                    id: user.id,
                    name: user.name,
                    department: user.department
                },
                timestamp: Date.now()
            };

            this.saveMessage(msg);
            this.messages.push(msg);

            this.currentGroup.notice = content;
            this.currentGroup.noticeTime = new Date().toISOString();
            this.currentGroup.noticePublisher = user.name;

            if (typeof EcosystemBridge !== 'undefined') {
                EcosystemBridge.updateGroupNotice(this.currentGroupId, content, user.name);
            }

            this.closePublishNoticeModal();
            this.renderMessages();
            this.renderSettings();

            var bar = document.getElementById('chatAnnouncementBar');
            if (bar) {
                bar.style.display = 'flex';
                bar.querySelector('.announcement-text').textContent = content;
            }

            alert('公告发布成功！');
        },

        showPublishActivityModal: function() {
            var existingModal = document.querySelector('.publish-activity-modal');
            if (existingModal) existingModal.remove();

            var modal = document.createElement('div');
            modal.className = 'publish-activity-modal';
            modal.innerHTML = '<div class="modal-overlay" onclick="CommunityGroupChat.closePublishActivityModal()">' +
                '<div class="modal-content" onclick="event.stopPropagation()">' +
                    '<div class="modal-header">' +
                        '<span class="modal-title"><i class="fa-solid fa-calendar-check"></i> 发布社区活动</span>' +
                        '<i class="fa-solid fa-times close-modal-btn" onclick="CommunityGroupChat.closePublishActivityModal()"></i>' +
                    '</div>' +
                    '<div class="modal-body">' +
                        '<div class="form-group">' +
                            '<label>活动名称 <span class="required">*</span></label>' +
                            '<input type="text" id="activityTitle" class="form-input" placeholder="请输入活动名称">' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label>活动时间 <span class="required">*</span></label>' +
                            '<input type="text" id="activityTime" class="form-input" placeholder="如：本周六 上午9:00">' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label>活动地点 <span class="required">*</span></label>' +
                            '<input type="text" id="activityLocation" class="form-input" placeholder="请输入活动地点">' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label>活动描述</label>' +
                            '<textarea id="activityDesc" class="form-textarea" placeholder="请输入活动描述..." rows="3"></textarea>' +
                        '</div>' +
                    '</div>' +
                    '<div class="modal-footer">' +
                        '<button class="btn-cancel" onclick="CommunityGroupChat.closePublishActivityModal()">取消</button>' +
                        '<button class="btn-primary" onclick="CommunityGroupChat.publishActivity()">发布活动</button>' +
                    '</div>' +
                '</div>' +
            '</div>';

            this.container.appendChild(modal);
        },

        closePublishActivityModal: function() {
            var modal = document.querySelector('.publish-activity-modal');
            if (modal) modal.remove();
        },

        publishActivity: function() {
            var title = document.getElementById('activityTitle').value.trim();
            var time = document.getElementById('activityTime').value.trim();
            var location = document.getElementById('activityLocation').value.trim();
            var desc = document.getElementById('activityDesc').value.trim();

            if (!title || !time || !location) {
                alert('请填写活动名称、时间和地点');
                return;
            }

            var user = this.currentUser;
            var msg = {
                id: 'msg_activity_' + Date.now(),
                groupId: this.currentGroupId,
                type: 'activity',
                activityData: {
                    title: title,
                    time: time,
                    location: location,
                    desc: desc
                },
                from: {
                    id: user.id,
                    name: user.name,
                    department: user.department
                },
                timestamp: Date.now()
            };

            this.saveMessage(msg);
            this.messages.push(msg);

            this.closePublishActivityModal();
            this.renderMessages();
            this.scrollToBottom();

            alert('活动发布成功！');
        },

        showOwnerInfoModal: function() {
            var existingModal = document.querySelector('.owner-info-modal');
            if (existingModal) existingModal.remove();

            var members = this.currentGroup.members || [];
            var owners = members.filter(function(m) { return !m.isAI && m.id !== 'community_officer'; });

            var modal = document.createElement('div');
            modal.className = 'owner-info-modal';
            modal.innerHTML = '<div class="modal-overlay" onclick="CommunityGroupChat.closeOwnerInfoModal()">' +
                '<div class="modal-content large" onclick="event.stopPropagation()">' +
                    '<div class="modal-header">' +
                        '<span class="modal-title"><i class="fa-solid fa-user-shield"></i> 业主信息</span>' +
                        '<i class="fa-solid fa-times close-modal-btn" onclick="CommunityGroupChat.closeOwnerInfoModal()"></i>' +
                    '</div>' +
                    '<div class="modal-body">' +
                        '<div class="owner-stats">' +
                            '<div class="stat-item">' +
                                '<div class="stat-value">' + owners.length + '</div>' +
                                '<div class="stat-label">业主人数</div>' +
                            '</div>' +
                            '<div class="stat-item">' +
                                '<div class="stat-value">' + owners.filter(function(m) { return m.online; }).length + '</div>' +
                                '<div class="stat-label">在线人数</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="owner-list">' +
                            (owners.length === 0 ? '<div class="empty-state">暂无业主信息</div>' : 
                                owners.map(function(o) {
                                    return '<div class="owner-item">' +
                                        '<div class="owner-avatar">' +
                                            '<img src="https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(o.name) + '" alt="' + o.name + '">' +
                                            (o.online ? '<span class="online-dot"></span>' : '') +
                                        '</div>' +
                                        '<div class="owner-info">' +
                                            '<div class="owner-name">' + o.name + '</div>' +
                                            '<div class="owner-meta">' +
                                                (o.room ? '<span><i class="fa-solid fa-door-open"></i> ' + o.room + '</span>' : '') +
                                                (o.online ? '<span class="online-tag">在线</span>' : '<span class="offline-tag">离线</span>') +
                                            '</div>' +
                                        '</div>' +
                                    '</div>';
                                }).join('')
                            ) +
                        '</div>' +
                    '</div>' +
                    '<div class="modal-footer">' +
                        '<button class="btn-primary" onclick="CommunityGroupChat.closeOwnerInfoModal()">关闭</button>' +
                    '</div>' +
                '</div>' +
            '</div>';

            this.container.appendChild(modal);
        },

        closeOwnerInfoModal: function() {
            var modal = document.querySelector('.owner-info-modal');
            if (modal) modal.remove();
        },

        showMemberDetail: function(memberId) {
            var member = this.currentGroup.members.find(function(m) { return m.id === memberId; });
            if (!member) return;

            alert('成员信息\n\n姓名：' + member.name + '\n' +
                (member.room ? '房号：' + member.room + '\n' : '') +
                (member.department ? '部门：' + member.department + '\n' : '') +
                '角色：' + (member.role === 'admin' ? '管理员' : '成员') + '\n' +
                '状态：' + (member.online ? '在线' : '离线'));
        },

        showCreateGroupModal: function() {
            var existingModal = document.querySelector('.create-group-modal');
            if (existingModal) existingModal.remove();

            var modal = document.createElement('div');
            modal.className = 'create-group-modal';
            modal.innerHTML = '<div class="modal-overlay" onclick="CommunityGroupChat.closeCreateGroupModal()">' +
                '<div class="modal-content" onclick="event.stopPropagation()">' +
                    '<div class="modal-header">' +
                        '<span class="modal-title"><i class="fa-solid fa-plus"></i> 创建群组</span>' +
                        '<i class="fa-solid fa-times close-modal-btn" onclick="CommunityGroupChat.closeCreateGroupModal()"></i>' +
                    '</div>' +
                    '<div class="modal-body">' +
                        '<div class="form-group">' +
                            '<label>群组名称 <span class="required">*</span></label>' +
                            '<input type="text" id="newGroupName" class="form-input" placeholder="请输入群组名称" maxlength="20">' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label>群组类型</label>' +
                            '<select id="newGroupType" class="form-select">' +
                                '<option value="PRIVATE">业主群</option>' +
                                '<option value="INTEREST">兴趣群</option>' +
                                '<option value="OFFICIAL">官方群</option>' +
                            '</select>' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label>所属小区</label>' +
                            '<input type="text" id="newGroupCommunity" class="form-input" placeholder="请输入所属小区">' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label>群组描述</label>' +
                            '<textarea id="newGroupDesc" class="form-textarea" placeholder="请输入群组描述（选填）" rows="3"></textarea>' +
                        '</div>' +
                    '</div>' +
                    '<div class="modal-footer">' +
                        '<button class="btn-cancel" onclick="CommunityGroupChat.closeCreateGroupModal()">取消</button>' +
                        '<button class="btn-primary" onclick="CommunityGroupChat.createGroup()">创建</button>' +
                    '</div>' +
                '</div>' +
            '</div>';

            this.container.appendChild(modal);
        },

        closeCreateGroupModal: function() {
            var modal = document.querySelector('.create-group-modal');
            if (modal) modal.remove();
        },

        createGroup: function() {
            var name = document.getElementById('newGroupName').value.trim();
            var type = document.getElementById('newGroupType').value;
            var community = document.getElementById('newGroupCommunity').value.trim();
            var desc = document.getElementById('newGroupDesc').value.trim();

            if (!name) {
                alert('请输入群组名称');
                return;
            }

            var user = this.currentUser;
            var colors = ['#1890FF', '#52C41A', '#FAAD14', '#722ED1', '#EB2F96', '#13C2C2'];
            var icons = ['fa-users', 'fa-comments', 'fa-star', 'fa-heart', 'fa-lightbulb', 'fa-flag'];

            var newGroup = {
                id: 'group_' + Date.now(),
                name: name,
                type: type,
                community: community || '未指定',
                desc: desc || '暂无描述',
                notice: '欢迎加入' + name,
                aiEnabled: true,
                icon: icons[Math.floor(Math.random() * icons.length)],
                color: colors[Math.floor(Math.random() * colors.length)],
                members: [{
                    id: user.id,
                    name: user.name,
                    department: user.department,
                    role: 'admin',
                    online: true,
                    joinTime: new Date().toISOString()
                }],
                createTime: new Date().toISOString()
            };

            this.groups.push(newGroup);

            if (typeof EcosystemBridge !== 'undefined') {
                EcosystemBridge.addChatGroup(newGroup);
            }

            this.closeCreateGroupModal();
            this.renderGroupList();
            alert('群组创建成功！');
        },

        toggleSearch: function() {
            var searchBar = document.getElementById('chatSearchBar');
            searchBar.style.display = searchBar.style.display === 'none' ? 'block' : 'none';
            if (searchBar.style.display === 'block') {
                document.getElementById('searchInput').focus();
            }
        },

        closeSearch: function() {
            var searchBar = document.getElementById('chatSearchBar');
            searchBar.style.display = 'none';
            document.getElementById('searchInput').value = '';
            this.searchResults = [];
            this.renderMessages();
        },

        performSearch: function(keyword) {
            if (!keyword.trim()) {
                this.searchResults = [];
                this.renderMessages();
                return;
            }

            this.searchResults = this.messages.filter(function(msg) {
                return msg.content && msg.content.toLowerCase().indexOf(keyword.toLowerCase()) >= 0;
            });

            this.renderSearchResults();
        },

        renderSearchResults: function() {
            var container = document.getElementById('chatMessages');
            container.innerHTML = '';

            if (this.searchResults.length === 0) {
                container.innerHTML = '<div class="empty-messages">' +
                    '<i class="fa-solid fa-search"></i>' +
                    '<p>未找到相关消息</p>' +
                '</div>';
                return;
            }

            var user = this.currentUser;
            this.searchResults.forEach(function(msg) {
                var isSelf = msg.from && msg.from.id === user.id;
                var msgHtml = '<div class="message search-result ' + (isSelf ? 'self' : '') + '">' +
                    '<div class="search-highlight">搜索结果</div>' +
                    '<div class="message-avatar">' +
                        '<img src="' + CommunityGroupChat.getAvatarUrl(msg.from) + '" alt="">' +
                    '</div>' +
                    '<div class="message-content">' +
                        '<div class="message-name">' + CommunityGroupChat.formatSenderName(msg.from) + '</div>' +
                        '<div class="message-bubble">' + (msg.content || '') + '</div>' +
                        '<div class="message-time">' + CommunityGroupChat.formatTime(msg.timestamp) + '</div>' +
                    '</div>' +
                '</div>';
                container.innerHTML += msgHtml;
            });
        },

        toggleMembers: function() {
            var sidebar = document.getElementById('memberSidebar');
            sidebar.classList.toggle('open');
        },

        toggleSettings: function() {
            var panel = document.getElementById('settingsPanel');
            panel.classList.toggle('open');
        },

        toggleMute: function() {
            var group = this.currentGroup;
            group.settings = group.settings || {};
            group.settings.mute = !group.settings.mute;
            this.renderSettings();
        },

        toggleTop: function() {
            var group = this.currentGroup;
            group.settings = group.settings || {};
            group.settings.top = !group.settings.top;
            this.renderSettings();
        },

        hideAnnouncementBar: function() {
            var bar = document.getElementById('chatAnnouncementBar');
            if (bar) bar.style.display = 'none';
        },

        showGroupInfo: function() {
            var group = this.currentGroup;
            var info = '群组名称：' + group.name + '\n' +
                '群组类型：' + (group.type === 'GENERAL' ? '总群' : group.type === 'PRIVATE' ? '业主群' : '官方群') + '\n' +
                '所属小区：' + (group.community || '未指定') + '\n' +
                '创建时间：' + this.formatTime(new Date(group.createTime).getTime()) + '\n' +
                '成员数量：' + (group.members ? group.members.length : 0) + ' 人';
            alert(info);
        },

        clearHistory: function() {
            if (!confirm('确定要清空所有聊天记录吗？此操作不可恢复。')) return;

            var storage = getStorage();
            var key = 'messages_' + this.currentGroupId;
            delete storage[key];
            setStorage(storage);

            if (typeof EcosystemBridge !== 'undefined') {
                EcosystemBridge.clearChatMessages(this.currentGroupId);
            }

            this.messages = [];
            this.renderMessages();
            alert('聊天记录已清空');
        },

        insertAtAI: function() {
            var input = document.getElementById('messageInput');
            input.value += '@智能管家 ';
            input.focus();
            input.dispatchEvent(new Event('input'));
        },

        joinActivity: function(msgId) {
            alert('您已成功报名参加该活动！');
        },

        viewWorkOrder: function(workOrderId) {
            alert('正在跳转到工单详情：' + workOrderId);
        },

        previewImage: function(src) {
            var modal = document.createElement('div');
            modal.className = 'image-preview-modal';
            modal.innerHTML = '<div class="preview-overlay" onclick="this.parentElement.remove()"></div>' +
                '<img src="' + src + '" class="preview-image">';
            document.body.appendChild(modal);
        },

        getUnreadCount: function(groupId) {
            return 0;
        },

        getLastMessage: function(groupId) {
            var messages = this.getLocalMessages(groupId);
            if (messages && messages.length > 0) {
                var lastMsg = messages[messages.length - 1];
                if (lastMsg.type === 'text') return lastMsg.content;
                if (lastMsg.type === 'notice') return '[群公告]';
                if (lastMsg.type === 'activity') return '[社区活动]';
                return '[消息]';
            }
            return '';
        },

        scrollToBottom: function() {
            var container = document.getElementById('chatMessages');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        },

        backToList: function() {
            this.currentGroupId = null;
            this.currentGroup = null;
            this.messages = [];
            this.renderGroupList();
        },

        close: function() {
            var overlay = document.getElementById('communityModuleOverlay');
            if (overlay) {
                overlay.classList.remove('active');
                overlay.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        },

        formatTime: function(timestamp) {
            var date = new Date(timestamp);
            var now = new Date();
            var diff = now - date;

            if (diff < 60000) return '刚刚';
            if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
            if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
            if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';

            return date.getFullYear() + '/' + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + '/' +
                   date.getDate().toString().padStart(2, '0') + ' ' +
                   date.getHours().toString().padStart(2, '0') + ':' +
                   date.getMinutes().toString().padStart(2, '0');
        }
    };

    window.CommunityGroupChat = CommunityGroupChat;

})(window);
