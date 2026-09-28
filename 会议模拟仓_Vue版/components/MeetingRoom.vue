<template>
  <div class="meeting-room">
    <!-- 顶部操作栏 -->
    <div class="meeting-toolbar" v-if="role === 'committee' || role === 'admin'">
      <div class="host-actions">
        <button class="action-btn success"><i class="fa-solid fa-play"></i> 开始会议</button>
        <button class="action-btn danger" @click="$emit('finish-meeting')"><i class="fa-solid fa-stop"></i> 结束会议</button>
        <button class="action-btn primary" @click="activeTab = 'voting'"><i class="fa-solid fa-check-to-slot"></i> 发起投票</button>
      </div>
    </div>

    <div class="meeting-main">
      <!-- 主视图区 (参与者和主持人都可见) -->
      <div class="main-view">
        <div class="video-grid">
          <div v-for="member in displayMembers" :key="member.id" class="video-cell">
            <div class="avatar-placeholder">
              <i class="fa-solid fa-user"></i>
            </div>
            <div class="member-name">
              {{ member.name }}
              <i v-if="!member.mic" class="fa-solid fa-microphone-slash mic-off"></i>
            </div>
          </div>
        </div>
        
        <!-- 底部个人控制台 -->
        <div class="personal-controls">
          <button class="control-icon"><i class="fa-solid fa-microphone"></i><br><span>静音</span></button>
          <button class="control-icon"><i class="fa-solid fa-video"></i><br><span>视频</span></button>
          <button class="control-icon"><i class="fa-solid fa-desktop"></i><br><span>共享</span></button>
          <button class="control-icon" v-if="role === 'participant'"><i class="fa-solid fa-hand"></i><br><span>举手</span></button>
          <button class="control-icon vote-btn" v-if="role === 'participant'"><i class="fa-solid fa-check-to-slot"></i><br><span>参与投票</span></button>
        </div>
      </div>

      <!-- 侧边栏 -->
      <div class="sidebar">
        <div class="sidebar-tabs">
          <div class="tab" :class="{ active: activeTab === 'members' }" @click="activeTab = 'members'">成员 ({{ members.length }})</div>
          <div class="tab" :class="{ active: activeTab === 'voting' }" @click="activeTab = 'voting'">投票</div>
          <div class="tab" :class="{ active: activeTab === 'minutes' }" @click="activeTab = 'minutes'">纪要</div>
        </div>
        
        <div class="sidebar-content">
          <!-- 成员列表 -->
          <ul class="member-list" v-if="activeTab === 'members'">
            <li v-for="m in members" :key="m.id" class="member-item">
              <div class="member-info">
                <div class="m-avatar"><i class="fa-solid fa-user"></i></div>
                <div class="m-name">{{ m.name }}</div>
              </div>
              <div class="m-actions" v-if="role === 'committee' || role === 'admin'">
                <button class="m-btn" title="静音/解除"><i class="fa-solid" :class="m.mic ? 'fa-microphone' : 'fa-microphone-slash'"></i></button>
                <button class="m-btn" title="移出"><i class="fa-solid fa-sign-out-alt"></i></button>
              </div>
              <div class="m-status" v-else>
                <i class="fa-solid" :class="m.mic ? 'fa-microphone' : 'fa-microphone-slash'" :style="{ color: m.mic ? '#666' : '#ff4d4f' }"></i>
              </div>
            </li>
          </ul>

          <!-- 投票系统 -->
          <div v-if="activeTab === 'voting'">
            <VotingSystem />
          </div>

          <!-- 会议纪要 -->
          <div v-if="activeTab === 'minutes'">
            <MeetingMinutes />
          </div>
        </div>
        
        <div class="host-batch-actions" v-if="(role === 'committee' || role === 'admin') && activeTab === 'members'">
          <button class="btn block-btn">全体静音</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import VotingSystem from './VotingSystem.vue'
import MeetingMinutes from './MeetingMinutes.vue'

const props = defineProps({
  role: { type: String, required: true }
})

defineEmits(['finish-meeting'])

const activeTab = ref('members')
const members = ref([])

onMounted(async () => {
  try {
    const res = await fetch('./会议模拟仓_Vue版/mock/simulateMembers.json')
    if (res.ok) {
      members.value = await res.json()
    } else {
      // 降级数据
      members.value = [
        { id: 1, name: "张三(主持人)", role: "host", mic: true, camera: true },
        { id: 2, name: "李四(业主)", role: "participant", mic: false, camera: true }
      ]
    }
  } catch(e) {
    members.value = [
      { id: 1, name: "张三(主持人)", role: "host", mic: true, camera: true },
      { id: 2, name: "李四(业主)", role: "participant", mic: false, camera: true }
    ]
  }
})

const displayMembers = computed(() => {
  return members.value.slice(0, 6) // 最多展示6个视频格
})
</script>

<style scoped>
.meeting-room {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px; /* 确保在不同屏幕下有足够高度 */
  background: #f0f2f5;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.meeting-toolbar {
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap; /* 适配窄屏 */
  gap: 8px;
}

.host-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  white-space: nowrap;
}
.action-btn:hover { background: #fafafa; }
.action-btn.success { border-color: #52c41a; color: #52c41a; }
.action-btn.success:hover { background: #f6ffed; }
.action-btn.danger { border-color: #ff4d4f; color: #ff4d4f; }
.action-btn.danger:hover { background: #fff1f0; }
.action-btn.primary { background: #1890ff; color: #fff; border-color: #1890ff; }
.action-btn.primary:hover { background: #40a9ff; border-color: #40a9ff; }

.meeting-main {
  flex: 1;
  display: flex;
  overflow: hidden; /* 防止内部撑开导致外部滚动 */
}

.main-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1f1f1f;
  position: relative;
  min-width: 0; /* 修复 flex 子项被内容撑开的问题 */
}

.video-grid {
  flex: 1;
  display: grid;
  /* 响应式 grid */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-auto-rows: minmax(120px, 1fr);
  gap: 8px;
  padding: 16px;
  overflow-y: auto; /* 成员过多时可滚动 */
}

.video-cell {
  background: #333;
  border-radius: 8px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #555;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.member-name {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  max-width: calc(100% - 16px); /* 防止名字过长超出 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mic-off { color: #ff4d4f; flex-shrink: 0; }

.personal-controls {
  height: 64px;
  background: #141414;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 0 16px;
  flex-wrap: wrap; /* 适配极窄屏幕 */
}

.control-icon {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  text-align: center;
  opacity: 0.8;
  transition: opacity 0.2s;
  padding: 4px 8px;
}
.control-icon:hover { opacity: 1; }
.control-icon i { font-size: 20px; margin-bottom: 4px; display: block; }
.control-icon span { font-size: 12px; }
.vote-btn { color: #1890ff; }

.sidebar {
  width: 320px; /* 稍微加宽以容纳更复杂的内容 */
  background: #fff;
  border-left: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  flex-shrink: 0; /* 防止被挤压 */
}

.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 12px 8px;
  font-size: 14px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
  white-space: nowrap;
}
.tab:hover { color: #1890ff; }
.tab.active {
  color: #1890ff;
  border-bottom: 2px solid #1890ff;
  font-weight: 600;
  background: #fff;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.member-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.member-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #f0f0f0;
}
.member-item:last-child { border-bottom: none; }

.member-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}
.m-avatar {
  width: 32px;
  height: 32px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #999;
  flex-shrink: 0;
}
.m-name { 
  font-size: 14px; 
  color: #333; 
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.m-actions { display: flex; gap: 8px; flex-shrink: 0; }
.m-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  font-size: 14px;
  transition: color 0.2s;
}
.m-btn:hover { color: #1890ff; }

.host-batch-actions {
  padding: 12px 16px;
  border-top: 1px solid #e8e8e8;
  background: #fafafa;
}
.block-btn {
  width: 100%;
  padding: 8px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}
.block-btn:hover {
  color: #1890ff;
  border-color: #1890ff;
}

@media (max-width: 900px) {
  .sidebar { width: 280px; }
}

@media (max-width: 768px) {
  .meeting-room { height: auto; min-height: 800px; }
  .meeting-main { flex-direction: column; overflow: visible; }
  .main-view { min-height: 400px; flex: none; }
  .sidebar { 
    width: 100%; 
    height: 400px; 
    border-left: none; 
    border-top: 1px solid #e8e8e8; 
    flex: none;
  }
  .video-grid { 
    grid-template-columns: repeat(2, 1fr); 
    grid-auto-rows: 150px;
  }
}
</style>
