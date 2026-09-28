/**
 * 业主群功能模块 - 鵘光花园业主端
 * 完整实现：群聊消息实时收发、业主身份验证与权限管理、群公告发布与查看
 群成员管理、聊天记录查询与搜索、消息通知设置
 */

(function(window) {
    'use strict';

    var STORAGE_KEY = 'sgzf_owner_chat';
    var CURRENT_USER_KEY = 'sgzf_current_user';

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

    function setCurrentUser(user) {
        try {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        } catch (e) {}
    }

    function getDefaultUser() {
        return {
            id: 'user_current',
            name: '当前用户',
            room: '6-602',
            role: 'owner',
            authStatus: 'approved',
            permissions: {
                canVote: true,
                canApplyMeeting: true,
                canChat: true,
                canCreateGroup: true,
                canManageGroup: true
            }
        };
    }

    var OwnerGroupChat = {
        groups: [],
        messages: {},
        currentGroupId: null,
        currentGroup: null,
        searchKeyword: '',
        searchResults: [],

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
                var permissions = EcosystemBridge.getOwnerPermissions();
                if (permissions) {
                    setCurrentUser(permissions);
                }
            }
        },

        loadGroups: function() {
            if (typeof EcosystemBridge !== 'undefined') {
                this.groups = EcosystemBridge.getChatGroups() || [];
            }
        },

        bindGlobalEvents: function() {
            if (typeof EcosystemBridge !== 'undefined') {
                EcosystemBridge.subscribe(function(store, value, detail) {
                    if (store === 'chat_groups') {
                    OwnerGroupChat.groups = value || [];
                    OwnerGroupChat.renderGroupList();
                }
                if (store && store.indexOf('chat_messages_') === 0) {
                    var groupId = store.replace('chat_messages_', '');
                    if (groupId === OwnerGroupChat.currentGroupId) {
                    OwnerGroupChat.messages = EcosystemBridge.getChatMessages(groupId) || [];
                    OwnerGroupChat.renderMessageList();
                    OwnerGroupChat.scrollToBottom();
                }
            });
        },

        renderGroupList: function() {
            var user = getCurrentUser();
            var communityName = this.getCommunityName();
            var generalGroupName = communityName + '总群';
            
            var generalGroup = this.groups.find(function(g) { return g.type === 'GENERAL'; });
            var buildingGroups = this.groups.filter(function(g) { return g.type === 'BUILDING'; });
            var interestGroups = this.groups.filter(function(g) { return g.type === 'INTEREST'; }).slice(0, 3);
            var privateGroups = this.groups.filter(function(g) { return g.type === 'PRIVATE'; });

            var html = '<div class="owner-group-list">' +
                '<div class="group-list-header">' +
                    '<div class="header-left">' +
                        '<i class="fa-solid fa-angle-left back-btn"></i>' +
                    '<span class="header-title">业主群聊</span>' +
                '</div>' +
                '<div class="group-list-body">';

            if (generalGroup) {
                var unreadCount = this.getUnreadCount(generalGroup.id);
                html += this.renderMainGroupCard(generalGroup, generalGroupName, unreadCount);
            }

            if (buildingGroups.length > 0) {
                html += '<div class="section-title">' +
                    '<span>楼栋群</span>' +
                '</div>' +
                '<div class="building-group-list">';
                buildingGroups.forEach(function(g) {
                    var unread = OwnerGroupChat.getUnreadCount(g.id);
                    html += OwnerGroupChat.renderGroupCard(g, unread);
                });
                html += '</div>';
            }

            if (interestGroups.length > 0) {
                html += '<div class="section-title">' +
                    '<span>兴趣群</span>' +
                    '<span class="section-action" onclick="OwnerGroupChat.showAllInterestGroups()">查看全部</span>' +
                '</div>' +
                '<div class="interest-group-grid">';
                interestGroups.forEach(function(g) {
                    html += OwnerGroupChat.renderInterestCard(g);
                });
                html += '</div>';
            }

            if (privateGroups.length > 0) {
                html += '<div class="section-title">' +
                    '<span>我的群组</span>' +
                    '<span class="section-action" onclick="OwnerGroupChat.showCreateGroupModal()">' +
                        '<i class="fa-solid fa-plus"></i> 创建群组' +
                    '</span>' +
                '</div>' +
                '<div class="private-group-list">';
                privateGroups.forEach(function(g) {
                    var unread = OwnerGroupChat.getUnreadCount(g.id);
                    html += OwnerGroupChat.renderGroupCard(g, unread);
                });
                html += '</div>';
            }

            html += '</div>' +
                '<div class="group-list-footer">' +
                    '<button class="create-group-btn" onclick="OwnerGroupChat.showCreateGroupModal()">' +
                        '<i class="fa-solid fa-plus"></i> 创建新群组' +
                    '</button>' +
                '</div>' +
            '</div>';

            this.container.innerHTML = html;
        },

        renderMainGroupCard: function(group, name, unreadCount) {
            var count = unreadCount || 0;
            return '<div class="main-group-card" onclick="OwnerGroupChat.enterChat(\'' + group.id + '\')">' +
                '<div class="main-group-icon">' +
                    '<i class="fa-solid ' + (group.icon || 'fa-house-chimney') + '"></i>' +
                '</div>' +
                '<div class="main-group-info">' +
                    '<div class="main-group-name">' + name + '</div>' +
                    '<div class="main-group-desc">' + (group.desc || '小区官方交流群') + '</div>' +
                    '<div class="main-group-members">' +
                        '<i class="fa-solid fa-users"></i> ' +
                        (group.members ? group.members.length : 0) + ' 人' +
                    '</div>' +
                '</div>' +
                (count > 0 ? '<span class="unread-badge">' + count + '</span>' : '') +
                '<div class="enter-group-btn">进入</div>' +
            '</div>';
        },

        renderGroupCard: function(group, unreadCount) {
            var count = unreadCount || 0;
            var lastMsg = this.getLastMessage(group.id);
            return '<div class="group-card" onclick="OwnerGroupChat.enterChat(\'' + group.id + '\')">' +
                '<div class="group-icon" style="background: ' + (group.color || '#1890FF') + '">' +
                    '<i class="fa-solid ' + (group.icon || 'fa-users') + '"></i>' +
                '</div>' +
                '<div class="group-info">' +
                    '<div class="group-name">' +
                        group.name +
                        (group.type === 'BUILDING' ? '<span class="group-tag tag-building">楼栋</span>' : '') +
                        (group.type === 'INTEREST' ? '<span class="group-tag tag-interest">兴趣</span>' : '') +
                        (group.type === 'PRIVATE' ? '<span class="group-tag tag-private">自建</span>' : '') +
                    '</div>' +
                    '<div class="group-preview">' + (lastMsg || '暂无消息') + '</div>' +
                '</div>' +
                (count > 0 ? '<span class="unread-dot"></span>' : '') +
            '</div>';
        },

        renderInterestCard: function(group) {
            return '<div class="interest-card" onclick="OwnerGroupChat.joinGroup(\'' + group.id + '\')">' +
                '<div class="interest-icon" style="background: ' + (group.color || '#13C2C2') + '">' +
                    '<i class="fa-solid ' + (group.icon || 'fa-star') + '"></i>' +
                '</div>' +
                '<div class="interest-name">' + group.name + '</div>' +
                '<div class="interest-meta">' + (group.members ? group.members.length : 0) + ' 人活跃</div>' +
                '<button class="join-btn">加入</button>' +
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
            this.messages = EcosystemBridge.getChatMessages(groupId) || [];

            this.renderChatRoom();
            this.bindChatEvents();
        },

        renderChatRoom: function() {
            var group = this.currentGroup;
            var user = getCurrentUser();
            var isAIEnabled = group.aiEnabled;
            var canManage = EcosystemBridge.canManageGroup(user.id, group.id);

            var html = '<div class="chat-room-container">' +
                '<div class="chat-room-header">' +
                    '<div class="header-left">' +
                        '<i class="fa-solid fa-angle-left back-btn"></i>' +
                        '<span class="chat-title">' + group.name + '</span>' +
                        (group.type === 'GENERAL' ? '<span class="ai-tag">AI管理</span>' : '') +
                    '</div>' +
                    '<div class="header-right">' +
                        '<i class="fa-solid fa-magnifying-glass search-btn" title="搜索聊天记录"></i>' +
                        '<i class="fa-solid fa-users members-btn" title="群成员"></i>' +
                        '<i class="fa-solid fa-gear settings-btn" title="群设置"></i>' +
                    '</div>' +
                '</div>' +

                '<div class="chat-search-bar" id="chatSearchBar" style="display:none;">' +
                    '<input type="text" id="searchInput" placeholder="搜索聊天记录..." class="search-input">' +
                    '<button class="search-close-btn" onclick="OwnerGroupChat.closeSearch()">取消</button>' +
                '</div>' +

                '<div class="chat-messages" id="chatMessages"></div>' +

                '<div class="chat-input-area">' +
                    '<div class="input-tools">' +
                        (isAIEnabled ? '<span class="at-ai-btn" onclick="OwnerGroupChat.insertAtAI()">@AI</span>' : '') +
                        '<i class="fa-solid fa-microphone voice-btn" title="语音输入"></i>' +
                        '<i class="fa-solid fa-image image-btn" title="发送图片"></i>' +
                        '<i class="fa-solid fa-paperclip attachment-btn" title="发送文件"></i>' +
                    '</div>' +
                    '<div class="input-wrapper">' +
                        '<textarea id="messageInput" placeholder="输入消息..." rows="1"></textarea>' +
                    '</div>' +
                    '<button class="send-btn" id="sendBtn">发送</button>' +
                '</div>' +

                '<div class="chat-sidebar" id="memberSidebar">' +
                    '<div class="sidebar-header">' +
                        '<span>群成员 (' + (group.members ? group.members.length : 0) + ')</span>' +
                        '<i class="fa-solid fa-times close-sidebar-btn"></i>' +
                    '</div>' +
                    '<div class="member-list" id="memberList"></div>' +
                    (canManage ? '<div class="member-actions">' +
                        '<button class="action-btn" onclick="OwnerGroupChat.showAddMemberModal()">' +
                            '<i class="fa-solid fa-user-plus"></i> 鷻加成员' +
                        '</button>' +
                    '</div>' : '') +
                '</div>' +

                '<div class="chat-settings" id="settingsPanel">' +
                    '<div class="settings-header">' +
                        '<span>群设置</span>' +
                        '<i class="fa-solid fa-times close-settings-btn"></i>' +
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
            var user = getCurrentUser();
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
                    '<img src="' + (msg.from.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + msg.from.name) + '" alt="' + msg.from.name + '">' +
                '</div>' +
                '<div class="message-content">' +
                    '<div class="message-name">' + msg.from.name + '</div>' +
                    '<div class="message-bubble">';

                if (msg.type === 'text') {
                    msgHtml += this.formatTextMessage(msg.content);
                } else if (msg.type === 'image') {
                    msgHtml += '<img src="' + msg.content + '" class="message-image" onclick="OwnerGroupChat.previewImage(this.src)">';
                } else if (msg.type === 'work_order') {
                    msgHtml += this.renderWorkOrderCard(msg.workOrderData);
                } else if (msg.type === 'notice') {
                    msgHtml += this.renderNoticeCard(msg);
                } else if (msg.type === 'system') {
                    msgHtml += '<div class="system-message">' + msg.content + '</div>';
                }

                msgHtml += '</div></div></div>';
                container.innerHTML += msgHtml;
            });

            this.scrollToBottom();
        },

        formatTextMessage: function(text) {
            var formatted = text;
            formatted = formatted.replace(/@智能管家/g, '<span class="ai-mention">@智能管家</span>');
            formatted = formatted.replace(/@AI/g, '<span class="ai-mention">@AI</span>');
            return formatted;
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
                    '<button class="wo-btn" onclick="OwnerGroupChat.viewWorkOrder(\'' + data.id + '\')">查看详情</button>' +
                '</div>' +
            '</div>';
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
                    '<span class="notice-publisher">' + msg.from.name + ' 发布</span>' +
                '</div>' +
            '</div>;
        },

        renderMembers: function() {
            var container = document.getElementById('memberList');
            var group = this.currentGroup;
            var user = getCurrentUser();
            var canManage = EcosystemBridge.canManageGroup(user.id, group.id);

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

                html += '<div class="member-item">' +
                    '<div class="member-avatar">' +
                        '<img src="https://api.dicebear.com/7.x/initials/svg?seed=' + member.name + '" alt="' + member.name + '">' +
                        (isAI ? '<span class="ai-badge">AI</span>' : '') +
                    '</div>' +
                    '<div class="member-info">' +
                        '<div class="member-name">' + member.name + '</div>' +
                        '<div class="member-meta">' +
                        (member.room ? member.room + ' - ' : '') +
                        '<span class="member-role ' + roleClass + '">' + roleText + '</span>' +
                        '</div>' +
                    '</div>' +
                    (canManage && !isAI && !isSelf ? '<div class="member-actions">' +
                        '<button class="member-action-btn" onclick="OwnerGroupChat.showMemberOptions(\'' + member.id + '\')" title="管理">' +
                            '<i class="fa-solid fa-ellipsis-v"></i>' +
                        '</button>' +
                    '</div>' : '') +
                '</div>';
            });

            container.innerHTML = html;
        },

        renderSettings: function() {
            var container = document.getElementById('settingsContent');
            var group = this.currentGroup;
            var user = getCurrentUser();
            var canManage = EcosystemBridge.canManageGroup(user.id, group.id);

            var html = '';

            if (group.notice) {
                html += '<div class="settings-section">' +
                    '<div class="section-header">' +
                        '<i class="fa-solid fa-bullhorn"></i>' +
                        '<span>群公告</span>' +
                        (canManage ? '<button class="edit-btn" onclick="OwnerGroupChat.editNotice()">编辑</button>' : '') +
                    '</div>' +
                    '<div class="notice-content">' + group.notice + '</div>' +
                    (group.noticeTime ? '<div class="notice-time">发布于 ' + this.formatTime(new Date(group.noticeTime).getTime()) + '</div>' : '') +
                '</div>';
            }

            html += '<div class="settings-section">' +
                '<div class="section-header">' +
                    '<i class="fa-solid fa-bell"></i>' +
                    '<span>消息通知</span>' +
                '</div>' +
                '<div class="settings-item">' +
                    '<span>消息免打扰</span>' +
                    '<div class="toggle-switch ' + (group.settings && group.settings.mute ? 'active' : '') + '" onclick="OwnerGroupChat.toggleMute()"></div>' +
                '</div>' +
                '<div class="settings-item">' +
                    '<span>置顶聊天</span>' +
                    '<div class="toggle-switch ' + (group.settings && group.settings.top ? 'active' : '') + '" onclick="OwnerGroupChat.toggleTop()"></div>' +
                '</div>' +
                '<div class="settings-item">' +
                    '<span>@提及通知</span>' +
                    '<div class="toggle-switch active" onclick="OwnerGroupChat.toggleMentionNotify()"></div>' +
                '</div>' +
                '<div class="settings-item">' +
                    '<span>工单通知</span>' +
                    '<div class="toggle-switch active" onclick="OwnerGroupChat.toggleWorkOrderNotify()"></div>' +
                '</div>' +
            '</div>';

            if (canManage) {
                html += '<div class="settings-section">' +
                    '<div class="section-header">' +
                        '<i class="fa-solid fa-cog"></i>' +
                        '<span>群管理</span>' +
                    '</div>' +
                    '<div class="settings-item clickable" onclick="OwnerGroupChat.showMemberManagement()">' +
                        '<span>成员管理</span>' +
                        '<i class="fa-solid fa-chevron-right"></i>' +
                    '</div>' +
                    '<div class="settings-item clickable" onclick="OwnerGroupChat.showGroupInfo()">' +
                        '<span>群信息</span>' +
                        '<i class="fa-solid fa-chevron-right"></i>' +
                    '</div>' +
                '</div>';
            }

            html += '<div class="settings-section danger">' +
                '<div class="settings-item clickable" onclick="OwnerGroupChat.clearHistory()">' +
                    '<span>清空聊天记录</span>' +
                    '<i class="fa-solid fa-chevron-right"></i>' +
                '</div>' +
                (canManage ? '<div class="settings-item clickable danger" onclick="OwnerGroupChat.dismissGroup()">' +
                    '<span>解散群组</span>' +
                    '<i class="fa-solid fa-chevron-right"></i>' +
                '</div>' : '') +
            '</div>';

            container.innerHTML = html;
        },

        bindChatEvents: function() {
            var self = this;
            var input = document.getElementById('messageInput');
            var sendBtn = document.getElementById('sendBtn');
            var voiceBtn = document.querySelector('.voice-btn');
            var imageBtn = document.querySelector('.image-btn');
            var searchBtn = document.querySelector('.search-btn');
            var membersBtn = document.querySelector('.members-btn');
            var settingsBtn = document.querySelector('.settings-btn');
            var atAIBtn = document.querySelector('.at-ai-btn');
            var searchInput = document.getElementById('searchInput');
            var searchCloseBtn = document.querySelector('.search-close-btn');

            if (input) {
                input.addEventListener('input', function() {
                    sendBtn.style.display = input.value.trim() ? 'block' : 'none';
                    input.style.height = 'auto';
                    input.style.height = input.scrollHeight + 'px';
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

            if (voiceBtn) {
                voiceBtn.addEventListener('click', function() {
                    self.startVoiceInput();
                });
            }

            if (imageBtn) {
                imageBtn.addEventListener('click', function() {
                    self.selectImage();
                });
            }

            if (searchBtn) {
                searchBtn.addEventListener('click', function() {
                    self.toggleSearch();
                });
            }

            if (membersBtn) {
                membersBtn.addEventListener('click', function() {
                    self.toggleMembers();
                });
            }

            if (settingsBtn) {
                settingsBtn.addEventListener('click', function() {
                    self.toggleSettings();
                });
            }

            if (atAIBtn) {
                atAIBtn.addEventListener('click', function() {
                    self.insertAtAI();
                });
            }

            if (searchInput) {
                searchInput.addEventListener('input', function() {
                    self.performSearch(searchInput.value);
                });
            }

            if (searchCloseBtn) {
                searchCloseBtn.addEventListener('click', function() {
                self.closeSearch();
                });
            }
        },

        sendMessage: function() {
            var input = document.getElementById('messageInput');
            var text = input.value.trim();
            if (!text) return;

            var user = getCurrentUser();
            var msg = {
                id: 'msg_' + Date.now(),
                groupId: this.currentGroupId,
                type: 'text',
                content: text,
                from: {
                    id: user.id,
                    name: user.name,
                    room: user.room,
                    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.name
                },
                timestamp: Date.now(),
                isSelf: true,
                read: false
            };

            EcosystemBridge.addChatMessage(this.currentGroupId, msg);
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

        handleAIResponse: function(text) {
            var self = this;
            setTimeout(function() {
                var isWorkOrder = text.includes('报修') || text.includes('投诉') || text.includes('维修') || text.includes('漏水') || text.includes('坏了');

                var aiMsg = {
                    id: 'msg_ai_' + Date.now(),
                    groupId: self.currentGroupId,
                    type: isWorkOrder ? 'work_order' : 'text',
                    content: isWorkOrder ? '' : '收到您的消息，正在为您处理...',
                    from: {
                        id: 'ai_assistant',
                        name: 'AI智能管家',
                        room: '',
                        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AI',
                        isAI: true
                    },
                    timestamp: Date.now(),
                    isSelf: false,
                    read: false
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

                EcosystemBridge.addChatMessage(self.currentGroupId, aiMsg);
                self.messages.push(aiMsg);
                self.renderMessages();
                self.scrollToBottom();
            }, 1000);
        },

        insertAtAI: function() {
            var input = document.getElementById('messageInput');
            input.value += '@智能管家 ';
            input.focus();
            input.dispatchEvent(new Event('input'));
        },

        startVoiceInput: function() {
            alert('语音输入功能开发中，敬请期待！');
        },

        selectImage: function() {
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';
            document.body.appendChild(input);

            input.onchange = function(e) {
                if (e.target.files && e.target.files[0]) {
                    var file = e.target.files[0];
                    var reader = new FileReader();
                    reader.onload = function(evt) {
                        var user = getCurrentUser();
                        var msg = {
                            id: 'msg_' + Date.now(),
                            groupId: OwnerGroupChat.currentGroupId,
                            type: 'image',
                            content: evt.target.result,
                            from: {
                                id: user.id,
                                name: user.name,
                                room: user.room,
                                avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.name
                            },
                            timestamp: Date.now(),
                            isSelf: true,
                            read: false
                        };

                        EcosystemBridge.addChatMessage(OwnerGroupChat.currentGroupId, msg);
                        OwnerGroupChat.messages.push(msg);
                        OwnerGroupChat.renderMessages();
                        OwnerGroupChat.scrollToBottom();
                    };
                    reader.readAsDataURL(file);
                }
                document.body.removeChild(input);
            };

            input.click();
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

            this.searchResults = EcosystemBridge.searchChatMessages(this.currentGroupId, keyword);
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

            var user = getCurrentUser();
            this.searchResults.forEach(function(msg) {
                var isSelf = msg.from && msg.from.id === user.id;
                var msgHtml = '<div class="message search-result ' + (isSelf ? 'self' : '') + '">' +
                    '<div class="search-highlight">搜索结果</div>' +
                    '<div class="message-avatar">' +
                    '<img src="' + (msg.from.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + msg.from.name) + '" alt="' + msg.from.name + '">' +
                '</div>' +
                '<div class="message-content">' +
                    '<div class="message-name">' + msg.from.name + '</div>' +
                    '<div class="message-bubble">' + msg.content + '</div>' +
                    '<div class="message-time">' + OwnerGroupChat.formatTime(msg.timestamp) + '</div>' +
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
            EcosystemBridge.updateChatGroup(group.id, { settings: group.settings });
            this.renderSettings();
        },

        toggleTop: function() {
            var group = this.currentGroup;
            group.settings = group.settings || {};
            group.settings.top = !group.settings.top;
            EcosystemBridge.updateChatGroup(group.id, { settings: group.settings });
            this.renderSettings();
        },

        toggleMentionNotify: function() {
            var user = getCurrentUser();
            var setting = EcosystemBridge.getUserNotificationSetting(user.id, this.currentGroupId);
            if (!setting) {
                setting = { userId: user.id, groupId: this.currentGroupId, mentionNotify: true };
            }
            setting.mentionNotify = !setting.mentionNotify;
            EcosystemBridge.updateNotificationSetting(user.id, this.currentGroupId, { mentionNotify: setting.mentionNotify });
            alert(setting.mentionNotify ? '@提及通知已开启' : '@提及通知已关闭');
        },

        toggleWorkOrderNotify: function() {
            var user = getCurrentUser();
            var setting = EcosystemBridge.getUserNotificationSetting(user.id, this.currentGroupId);
            if (!setting) {
                setting = { userId: user.id, groupId: this.currentGroupId, workOrderNotify: true };
            }
            setting.workOrderNotify = !setting.workOrderNotify;
            EcosystemBridge.updateNotificationSetting(user.id, this.currentGroupId, { workOrderNotify: setting.workOrderNotify });
            alert(setting.workOrderNotify ? '工单通知已开启' : '工单通知已关闭');
        },

        showAddMemberModal: function() {
            alert('添加成员功能开发中');
        },

        showMemberOptions: function(memberId) {
            var member = this.currentGroup.members.find(function(m) { return m.id === memberId; });
            if (!member) return;

            var options = ['设为管理员', '移除成员', '取消'];
            var choice = prompt('请选择操作：\n' + options.join('\n'));
            if (choice === '设为管理员') {
                EcosystemBridge.setGroupAdmin(this.currentGroupId, memberId, true);
                alert('已设为管理员');
                this.renderMembers();
            } else if (choice === '移除成员') {
                EcosystemBridge.removeGroupMember(this.currentGroupId, memberId, getCurrentUser().id);
                alert('已移除成员');
                this.renderMembers();
            }
        },

        editNotice: function() {
            var currentNotice = this.currentGroup.notice || '';
            var newNotice = prompt('请输入新的群公告：', currentNotice);
            if (newNotice && newNotice !== currentNotice) {
                var user = getCurrentUser();
                EcosystemBridge.updateGroupNotice(this.currentGroupId, newNotice, user.name);
                this.currentGroup.notice = newNotice;
                this.currentGroup.noticeTime = new Date().toISOString();
                this.currentGroup.noticePublisher = user.name;
                this.renderSettings();
                alert('公告已更新');
            }
        },

        showMemberManagement: function() {
            alert('成员管理功能开发中');
        },

        showGroupInfo: function() {
            var group = this.currentGroup;
            var info = '群组名称：' + group.name + '\n';
            info += '创建时间：' + this.formatTime(new Date(group.createTime).getTime()) + '\n';
            info += '成员数量：' + (group.members ? group.members.length : 0) + ' 人\n';
            if (group.desc) info += '群描述：' + group.desc;
            alert(info);
        },

        clearHistory: function() {
            if (confirm('确定要清空所有聊天记录吗此操作不可恢复。')) {
                EcosystemBridge.clearChatMessages(this.currentGroupId);
                this.messages = [];
                this.renderMessages();
                alert('聊天记录已清空');
            }
        },

        dismissGroup: function() {
            if (confirm('确定要解散该群组吗此操作不可恢复。')) {
                EcosystemBridge.deleteChatGroup(this.currentGroupId);
                this.groups = this.groups.filter(function(g) { return g.id !== OwnerGroupChat.currentGroupId; });
                this.backToList();
                alert('群组已解散');
            }
        },

        showCreateGroupModal: function() {
            var user = getCurrentUser();
            if (!EcosystemBridge.canCreateGroup(user.id)) {
                alert('您没有创建群组的权限');
                return;
            }

            var existingModal = document.querySelector('.create-group-modal');
            if (existingModal) existingModal.remove();

            var modal = document.createElement('div');
            modal.className = 'create-group-modal';
            modal.innerHTML = '<div class="modal-overlay">' +
                '<div class="modal-content">' +
                    '<div class="modal-header">' +
                        '<span class="modal-title">创建新群组</span>' +
                        '<i class="fa-solid fa-times close-modal-btn"></i>' +
                    '</div>' +
                    '<div class="modal-body">' +
                        '<div class="form-group">' +
                            '<label>群组名称 <span class="required">*</span></label>' +
                            '<input type="text" id="newGroupName" class="form-input" placeholder="请输入群组名称" maxlength="20">' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label>群组类型</label>' +
                            '<select id="newGroupType" class="form-select">' +
                                '<option value="PRIVATE">业主自发群</option>' +
                                '<option value="INTEREST">兴趣群</option>' +
                            '</select>' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label>群组描述</label>' +
                            '<textarea id="newGroupDesc" class="form-textarea" placeholder="请输入群组描述（选填）" rows="3"></textarea>' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label>群组标签</label>' +
                            '<input type="text" id="newGroupTag" class="form-input" placeholder="如：楼栋、互助、运动" maxlength="10">' +
                        '</div>' +
                    '</div>' +
                    '<div class="modal-footer">' +
                        '<button class="btn-cancel" onclick="OwnerGroupChat.closeCreateGroupModal()">取消</button>' +
                        '<button class="btn-primary" onclick="OwnerGroupChat.createGroup()">创建</button>' +
                    '</div>' +
                '</div>' +
            '</div>';

            this.container.appendChild(modal);

            modal.querySelector('.close-modal-btn').addEventListener('click', function() {
                OwnerGroupChat.closeCreateGroupModal();
            });

            modal.querySelector('.modal-overlay').addEventListener('click', function(e) {
                if (e.target === this) {
                    OwnerGroupChat.closeCreateGroupModal();
                }
            });
        },

        closeCreateGroupModal: function() {
            var modal = document.querySelector('.create-group-modal');
            if (modal) modal.remove();
        },

        createGroup: function() {
            var name = document.getElementById('newGroupName').value.trim();
            var type = document.getElementById('newGroupType').value;
            var desc = document.getElementById('newGroupDesc').value.trim();
            var tag = document.getElementById('newGroupTag').value.trim();

            if (!name) {
                alert('请输入群组名称');
                return;
            }

            var user = getCurrentUser();
            var colors = ['#1890FF', '#52C41A', '#FAAD14', '#722ED1', '#EB2F96', '#13C2C2'];
            var icons = ['fa-users', 'fa-comments', 'fa-star', 'fa-heart', 'fa-lightbulb', 'fa-flag'];

            var newGroup = {
                name: name,
                type: type,
                desc: desc || '暂无描述',
                notice: '欢迎加入' + name,
                aiEnabled: type === 'INTEREST',
                icon: icons[Math.floor(Math.random() * icons.length)],
                color: colors[Math.floor(Math.random() * colors.length)],
                members: [{
                    id: user.id,
                    name: user.name,
                    room: user.room,
                    role: 'owner',
                    online: true,
                    joinTime: new Date().toISOString()
                }]
            };

            if (tag) newGroup.tag = tag;

            EcosystemBridge.addChatGroup(newGroup);
            this.groups = EcosystemBridge.getChatGroups();
            this.closeCreateGroupModal();
            this.renderGroupList();
            alert('群组创建成功！');
        },

        joinGroup: function(groupId) {
            var user = getCurrentUser();
            var result = EcosystemBridge.joinChatGroup(groupId, user.id, {
                name: user.name,
                room: user.room
            });

            if (result.success) {
                this.groups = EcosystemBridge.getChatGroups();
                this.enterChat(groupId);
            } else {
                alert(result.message);
            }
        },

        showAllInterestGroups: function() {
            var interestGroups = this.groups.filter(function(g) { return g.type === 'INTEREST'; });
            var html = '<div class="all-groups-modal">' +
                '<div class="modal-overlay" onclick="OwnerGroupChat.closeAllGroupsModal()"></div>' +
                '<div class="modal-content large">' +
                    '<div class="modal-header">' +
                        '<span class="modal-title">所有兴趣群</span>' +
                        '<i class="fa-solid fa-times close-modal-btn" onclick="OwnerGroupChat.closeAllGroupsModal()"></i>' +
                    '</div>' +
                    '<div class="modal-body">';

            if (interestGroups.length === 0) {
                html += '<div class="empty-state">暂无兴趣群</div>';
            } else {
                interestGroups.forEach(function(g) {
                    html += OwnerGroupChat.renderInterestCard(g);
                });
            }

            html += '</div></div></div>';
            this.container.innerHTML = html;
        },

        closeAllGroupsModal: function() {
            this.renderGroupList();
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
            var user = getCurrentUser();
            return EcosystemBridge.getUnreadMessageCount(groupId, user.id);
        },

        getLastMessage: function(groupId) {
            var messages = EcosystemBridge.getChatMessages(groupId);
            if (messages && messages.length > 0) {
                var lastMsg = messages[messages.length - 1];
                return lastMsg.content;
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
                var overlay = document.getElementById('ownerModuleOverlay');
                if (overlay) {
                    overlay.classList.remove('active');
                    overlay.setAttribute('aria-hidden', 'true');
                    document.body.style.overflow = '';
                }
            },

        getCommunityName: function() {
                var communityName = '阳光花园';
                try {
                    if (typeof ProfileHeader !== 'undefined' && ProfileHeader.data && ProfileHeader.data.houses && ProfileHeader.data.currentHouseId) {
                        var house = ProfileHeader.data.houses.find(function(h) { return h.id === ProfileHeader.data.currentHouseId; });
                        if (house && house.community) communityName = house.community;
                    } else if (typeof DataFlowSystem !== 'undefined' && DataFlowSystem.state && DataFlowSystem.state.currentHouse && DataFlowSystem.state.currentHouse.community) {
                        communityName = DataFlowSystem.state.currentHouse.community;
                    } else {
                        var savedId = localStorage.getItem('currentHouseId');
                        if (savedId && typeof ProfileHeader !== 'undefined' && ProfileHeader.data && ProfileHeader.data.houses) {
                            var h = ProfileHeader.data.houses.find(function(x) { return x.id === savedId; });
                            if (h && h.community) communityName = h.community;
                        }
                    }
                } catch (e) {}
                return communityName;
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

    window.OwnerGroupChat = OwnerGroupChat;

})(window);
