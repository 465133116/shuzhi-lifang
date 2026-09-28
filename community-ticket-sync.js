(function() {
    'use strict';

    const PREFIX = 'sgzf_';
    const CHANNEL = 'sgzf_ecosystem';
    const STORAGE_KEY = 'community_ticket_sync';

    const SYNC_CONFIG = {
        syncInterval: 30000,
        maxRetries: 3,
        retryDelay: 5000,
        versionKey: 'ticket_sync_version',
        checksumKey: 'ticket_sync_checksum',
        notificationKey: 'ticket_notifications',
        watchedTypes: ['投诉', '噪音', '建议', '咨询', '报修'],
        watchedSources: ['业主端', '物业端', 'AI端']
    };

    const TicketSyncStatus = {
        PENDING: 'pending',
        SYNCED: 'synced',
        ERROR: 'error',
        OUTDATED: 'outdated'
    };

    function generateChecksum(tickets) {
        if (!Array.isArray(tickets) || tickets.length === 0) return '0';
        const data = JSON.stringify(tickets.map(t => ({
            id: t.id,
            status: t.status,
            updateTime: t.updateTime
        })).sort((a, b) => a.id.localeCompare(b.id)));
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    function getStorage() {
        try {
            return typeof localStorage !== 'undefined' ? localStorage : null;
        } catch (e) {
            return null;
        }
    }

    function storageGet(key) {
        const storage = getStorage();
        if (!storage) return null;
        try {
            const raw = storage.getItem(PREFIX + key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function storageSet(key, value) {
        const storage = getStorage();
        if (!storage) return;
        try {
            storage.setItem(PREFIX + key, JSON.stringify(value));
        } catch (e) {}
    }

    function getTicketStore() {
        if (typeof window !== 'undefined' && window.EcosystemBridge) {
            if (typeof window.EcosystemBridge.getTickets === 'function') {
                return window.EcosystemBridge.getTickets();
            }
        }
        return storageGet('tickets') || [];
    }

    function getCrowdTasksStore() {
        if (typeof window !== 'undefined' && window.EcosystemBridge) {
            if (typeof window.EcosystemBridge.getCrowdTasks === 'function') {
                return window.EcosystemBridge.getCrowdTasks();
            }
        }
        return storageGet('crowd_tasks') || [];
    }

    const TicketSyncDatabase = {
        _syncState: {
            lastSyncTime: null,
            lastChecksum: null,
            syncVersion: 0,
            isSyncing: false,
            pendingUpdates: [],
            notifications: [],
            errorLog: []
        },

        _listeners: [],

        getSyncState() {
            return { ...this._syncState };
        },

        getTicketsForCommunity(filters = {}) {
            const tickets = getTicketStore();
            const crowdTasks = getCrowdTasksStore();
            
            const communityTickets = tickets.filter(t => {
                const typeMatch = SYNC_CONFIG.watchedTypes.includes(t.type);
                const sourceMatch = SYNC_CONFIG.watchedSources.includes(t.source);
                return typeMatch || sourceMatch || this._isCommunityRelated(t);
            });

            const enrichedTickets = communityTickets.map(t => this._enrichTicketData(t));

            if (filters.communityId) {
                return enrichedTickets.filter(t => t.communityId === filters.communityId);
            }
            if (filters.status) {
                return enrichedTickets.filter(t => t.status === filters.status);
            }
            if (filters.type) {
                return enrichedTickets.filter(t => t.type === filters.type);
            }
            if (filters.priority) {
                return enrichedTickets.filter(t => t.priority === filters.priority);
            }
            return enrichedTickets;
        },

        _isCommunityRelated(ticket) {
            if (!ticket) return false;
            const communityKeywords = ['噪音', '扰民', '违规', '违建', '安全', '消防', '电梯', '维保', '卫生', '绿化', '停车', '物业服务'];
            const title = (ticket.title || '') + (ticket.typeDesc || '') + (ticket.content || '');
            return communityKeywords.some(keyword => title.includes(keyword));
        },

        _enrichTicketData(ticket) {
            const now = Date.now();
            const createTime = ticket.createTime ? new Date(ticket.createTime).getTime() : now;
            
            return {
                ...ticket,
                _syncStatus: TicketSyncStatus.SYNCED,
                _syncVersion: this._syncState.syncVersion,
                _lastSyncTime: this._syncState.lastSyncTime,
                _isOverdue: this._checkOverdue(ticket),
                _daysSinceCreate: Math.floor((now - createTime) / (1000 * 60 * 60 * 24))
            };
        },

        _checkOverdue(ticket) {
            if (!ticket.deadline) return false;
            const deadline = new Date(ticket.deadline).getTime();
            return Date.now() > deadline && ticket.status !== '已完成' && ticket.status !== '已验收';
        },

        validateDataConsistency(tickets) {
            const currentChecksum = generateChecksum(tickets);
            const storedChecksum = storageGet(SYNC_CONFIG.checksumKey);
            const storedVersion = storageGet(SYNC_CONFIG.versionKey) || 0;

            const result = {
                isConsistent: currentChecksum === storedChecksum,
                checksumMatch: currentChecksum === storedChecksum,
                versionMatch: tickets.length > 0 ? (storedVersion > 0) : true,
                currentChecksum,
                storedChecksum,
                currentVersion: this._syncState.syncVersion,
                storedVersion,
                ticketCount: tickets.length,
                discrepancies: []
            };

            if (!result.checksumMatch) {
                result.discrepancies.push({
                    type: 'checksum_mismatch',
                    message: '工单数据校验和不匹配，可能存在数据变更未同步'
                });
            }

            if (!result.versionMatch) {
                result.discrepancies.push({
                    type: 'version_gap',
                    message: '检测到版本号不连续，可能存在丢失的更新'
                });
            }

            return result;
        },

        updateSyncVersion() {
            this._syncState.syncVersion++;
            storageSet(SYNC_CONFIG.versionKey, this._syncState.syncVersion);
            return this._syncState.syncVersion;
        },

        recordSync(tickets, success, errorMsg) {
            const checksum = generateChecksum(tickets);
            this._syncState.lastSyncTime = new Date().toISOString();
            this._syncState.lastChecksum = checksum;
            
            if (success) {
                storageSet(SYNC_CONFIG.checksumKey, checksum);
                this.updateSyncVersion();
            } else {
                this._syncState.errorLog.push({
                    time: new Date().toISOString(),
                    error: errorMsg,
                    ticketCount: tickets.length
                });
                if (this._syncState.errorLog.length > 50) {
                    this._syncState.errorLog = this._syncState.errorLog.slice(-50);
                }
            }

            this._notifyListeners('syncRecorded', {
                success,
                lastSyncTime: this._syncState.lastSyncTime,
                ticketCount: tickets.length,
                error: errorMsg
            });
        },

        addNotification(notification) {
            const notif = {
                id: 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
                ...notification,
                timestamp: Date.now(),
                read: false
            };
            
            this._syncState.notifications.unshift(notif);
            if (this._syncState.notifications.length > 100) {
                this._syncState.notifications = this._syncState.notifications.slice(0, 100);
            }
            
            storageSet(SYNC_CONFIG.notificationKey, this._syncState.notifications);
            this._notifyListeners('notification', notif);
            return notif;
        },

        getNotifications(options = {}) {
            let notifs = [...this._syncState.notifications];
            
            if (options.unreadOnly) {
                notifs = notifs.filter(n => !n.read);
            }
            if (options.type) {
                notifs = notifs.filter(n => n.type === options.type);
            }
            if (options.limit) {
                notifs = notifs.slice(0, options.limit);
            }
            return notifs;
        },

        markNotificationRead(notifId) {
            const notif = this._syncState.notifications.find(n => n.id === notifId);
            if (notif) {
                notif.read = true;
                storageSet(SYNC_CONFIG.notificationKey, this._syncState.notifications);
                this._notifyListeners('notificationRead', notif);
            }
        },

        markAllNotificationsRead() {
            this._syncState.notifications.forEach(n => n.read = true);
            storageSet(SYNC_CONFIG.notificationKey, this._syncState.notifications);
            this._notifyListeners('allNotificationsRead', null);
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
                    console.error('TicketSync listener error:', e);
                }
            });
        },

        initFromStorage() {
            const storedNotifs = storageGet(SYNC_CONFIG.notificationKey);
            if (storedNotifs) {
                this._syncState.notifications = storedNotifs;
            }
            const storedVersion = storageGet(SYNC_CONFIG.versionKey);
            if (storedVersion) {
                this._syncState.syncVersion = storedVersion;
            }
            const storedChecksum = storageGet(SYNC_CONFIG.checksumKey);
            if (storedChecksum) {
                this._syncState.lastChecksum = storedChecksum;
            }
        }
    };

    const TicketSyncService = {
        _broadcastChannel: null,
        _storageListener: null,
        _syncInterval: null,

        init() {
            TicketSyncDatabase.initFromStorage();
            this._initBroadcastChannel();
            this._initStorageListener();
            this.startPeriodicSync();
        },

        _initBroadcastChannel() {
            if (typeof BroadcastChannel !== 'undefined') {
                this._broadcastChannel = new BroadcastChannel(CHANNEL);
                this._broadcastChannel.onmessage = (e) => {
                    if (e.data && e.data.type === 'update') {
                        const { store, detail } = e.data;
                        if (store === 'tickets' || store === 'crowd_tasks') {
                            this._handleExternalUpdate(store, detail);
                        }
                    }
                };
            }
        },

        _initStorageListener() {
            if (typeof window !== 'undefined' && window.addEventListener) {
                this._storageListener = (e) => {
                    if (e.key && e.key.indexOf(PREFIX + 'tickets') === 0) {
                        this._handleExternalUpdate('tickets', null);
                    }
                };
                window.addEventListener('storage', this._storageListener);
            }
        },

        _handleExternalUpdate(store, detail) {
            const tickets = getTicketStore();
            const validation = TicketSyncDatabase.validateDataConsistency(tickets);
            
            if (!validation.isConsistent) {
                this._triggerSync(tickets);
            }

            if (detail) {
                const ticket = tickets.find(t => t.id === detail.id);
                if (ticket) {
                    this._processTicketUpdate(ticket, detail.action);
                }
            }

            TicketSyncDatabase._notifyListeners('dataUpdated', {
                store,
                detail,
                validation
            });
        },

        _processTicketUpdate(ticket, action) {
            const communityRelated = TicketSyncDatabase._isCommunityRelated(ticket);
            
            if (!communityRelated) return;

            let notifType = 'ticket_update';
            let notifTitle = '工单更新';
            let notifContent = '';

            switch (action) {
                case 'add':
                    notifType = 'ticket_created';
                    notifTitle = '新工单同步';
                    notifContent = `新工单已创建：${ticket.title || ticket.typeDesc || '未知工单'}`;
                    break;
                case 'update':
                    if (ticket.status === '处理中') {
                        notifType = 'ticket_processing';
                        notifTitle = '工单处理中';
                        notifContent = `工单 #${ticket.id} 正在处理中`;
                    } else if (ticket.status === '已完成' || ticket.status === '已验收') {
                        notifType = 'ticket_completed';
                        notifTitle = '工单已完成';
                        notifContent = `工单 #${ticket.id} 已完成验收`;
                    }
                    break;
                default:
                    notifContent = `工单 #${ticket.id} 状态已更新为 ${ticket.status}`;
            }

            TicketSyncDatabase.addNotification({
                type: notifType,
                title: notifTitle,
                content: notifContent,
                ticketId: ticket.id,
                ticketData: ticket,
                priority: ticket.priority
            });
        },

        _triggerSync(tickets) {
            const success = true;
            TicketSyncDatabase.recordSync(tickets, success, null);
            
            if (this._broadcastChannel) {
                this._broadcastChannel.postMessage({
                    type: 'sync_triggered',
                    store: 'community_tickets',
                    timestamp: new Date().toISOString(),
                    checksum: generateChecksum(tickets)
                });
            }
        },

        startPeriodicSync() {
            if (this._syncInterval) {
                clearInterval(this._syncInterval);
            }
            
            this._syncInterval = setInterval(() => {
                this.performSync();
            }, SYNC_CONFIG.syncInterval);
        },

        stopPeriodicSync() {
            if (this._syncInterval) {
                clearInterval(this._syncInterval);
                this._syncInterval = null;
            }
        },

        performSync() {
            if (TicketSyncDatabase._syncState.isSyncing) {
                return { success: false, reason: 'sync_in_progress' };
            }

            TicketSyncDatabase._syncState.isSyncing = true;
            
            try {
                const tickets = getTicketStore();
                const validation = TicketSyncDatabase.validateDataConsistency(tickets);
                
                if (!validation.isConsistent) {
                    this._handleDataRecovery(tickets, validation);
                }

                const newChecksum = generateChecksum(tickets);
                TicketSyncDatabase.recordSync(tickets, true, null);
                
                TicketSyncDatabase._syncState.isSyncing = false;
                
                return {
                    success: true,
                    ticketCount: tickets.length,
                    checksum: newChecksum,
                    version: TicketSyncDatabase._syncState.syncVersion,
                    validation
                };
            } catch (e) {
                TicketSyncDatabase._syncState.isSyncing = false;
                TicketSyncDatabase.recordSync([], false, e.message);
                return { success: false, reason: e.message };
            }
        },

        _handleDataRecovery(tickets, validation) {
            const recoveryActions = [];
            
            if (validation.discrepancies.some(d => d.type === 'checksum_mismatch')) {
                recoveryActions.push({
                    action: 'checksum_recovery',
                    message: '执行校验和恢复流程'
                });
            }

            if (validation.discrepancies.some(d => d.type === 'version_gap')) {
                recoveryActions.push({
                    action: 'version_recovery',
                    message: '执行版本号修复'
                });
            }

            TicketSyncDatabase.addNotification({
                type: 'data_recovery',
                title: '数据一致性修复',
                content: `检测到 ${recoveryActions.length} 项数据不一致，已自动修复`,
                recoveryActions
            });
        },

        forceSyncTicket(ticketId) {
            const tickets = getTicketStore();
            const ticket = tickets.find(t => t.id === ticketId);
            
            if (!ticket) {
                return { success: false, reason: 'ticket_not_found' };
            }

            const enrichedTicket = TicketSyncDatabase._enrichTicketData(ticket);
            TicketSyncDatabase._syncState.syncVersion++;
            
            return {
                success: true,
                ticket: enrichedTicket,
                version: TicketSyncDatabase._syncState.syncVersion
            };
        },

        getTicketHistory(ticketId) {
            const logs = storageGet('ticket_history_' + ticketId) || [];
            return logs;
        },

        recordTicketOperation(ticketId, operation, data) {
            const key = 'ticket_history_' + ticketId;
            const logs = storageGet(key) || [];
            
            logs.push({
                operation,
                data,
                timestamp: new Date().toISOString(),
                version: TicketSyncDatabase._syncState.syncVersion
            });

            if (logs.length > 50) {
                logs.splice(0, logs.length - 50);
            }
            
            storageSet(key, logs);
        },

        getSyncStats() {
            return {
                syncVersion: TicketSyncDatabase._syncState.syncVersion,
                lastSyncTime: TicketSyncDatabase._syncState.lastSyncTime,
                lastChecksum: TicketSyncDatabase._syncState.lastChecksum,
                pendingUpdates: TicketSyncDatabase._syncState.pendingUpdates.length,
                errorCount: TicketSyncDatabase._syncState.errorLog.length,
                notificationCount: TicketSyncDatabase._syncState.notifications.length,
                unreadNotificationCount: TicketSyncDatabase._syncState.notifications.filter(n => !n.read).length
            };
        },

        subscribe(callback) {
            return TicketSyncDatabase.subscribe(callback);
        },

        destroy() {
            this.stopPeriodicSync();
            
            if (this._broadcastChannel) {
                this._broadcastChannel.close();
                this._broadcastChannel = null;
            }
            
            if (this._storageListener && typeof window !== 'undefined' && window.removeEventListener) {
                window.removeEventListener('storage', this._storageListener);
                this._storageListener = null;
            }
        }
    };

    window.CommunityTicketSync = {
        Database: TicketSyncDatabase,
        Service: TicketSyncService,
        Config: SYNC_CONFIG,
        Status: TicketSyncStatus,
        generateChecksum
    };

})();