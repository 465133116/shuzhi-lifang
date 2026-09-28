import { defineStore } from 'pinia'

export const useSimulationStore = defineStore('simulation', {
  state: () => ({
    // 支持多级权限：'owner' (普通业主), 'committee' (业委会成员/主持人), 'admin' (系统管理员)
    currentRole: 'owner',
    userInfo: {
      owner: { id: 2, name: '李四', label: '普通业主', permissions: ['vote', 'raise_hand', 'view_agenda'] },
      committee: { id: 1, name: '张三', label: '业委会成员(主持人)', permissions: ['vote', 'raise_hand', 'view_agenda', 'manage_meeting', 'initiate_vote', 'edit_agenda'] },
      admin: { id: 0, name: '王管家', label: '系统管理员', permissions: ['vote', 'raise_hand', 'view_agenda', 'manage_meeting', 'initiate_vote', 'edit_agenda', 'system_config', 'audit_logs'] }
    }
  }),
  getters: {
    hasPermission: (state) => (permission) => {
      const user = state.userInfo[state.currentRole]
      return user ? user.permissions.includes(permission) : false
    },
    currentUserInfo: (state) => state.userInfo[state.currentRole]
  },
  actions: {
    setRole(role) {
      if (['owner', 'committee', 'admin'].includes(role)) {
        this.currentRole = role
      }
    }
  }
})
