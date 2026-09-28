<template>
  <div class="prepare-room">
    <div class="grid-container">
      <!-- 左侧：设备与身份 -->
      <div class="left-panel">
        <div class="card">
          <h3 class="card-title">身份与设备检测</h3>
          <div class="device-check">
            <div class="video-preview">
              <div class="placeholder-avatar">
                <i class="fa-solid fa-user"></i>
              </div>
              <div class="device-controls">
                <button class="control-btn" :class="{ active: micOn }" @click="micOn = !micOn">
                  <i class="fa-solid" :class="micOn ? 'fa-microphone' : 'fa-microphone-slash'"></i>
                </button>
                <button class="control-btn" :class="{ active: camOn }" @click="camOn = !camOn">
                  <i class="fa-solid" :class="camOn ? 'fa-video' : 'fa-video-slash'"></i>
                </button>
              </div>
            </div>
            <div class="identity-info">
              <p><strong>当前身份：</strong>{{ role === 'host' ? '张三 (主持人)' : '李四 (业主)' }}</p>
              <p class="status success"><i class="fa-solid fa-check-circle"></i> 身份核验已通过</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：议程与资料 -->
      <div class="right-panel">
        <div class="card">
          <AgendaManager v-model="agenda" />
        </div>
        
        <div class="card" style="margin-top: 16px;">
          <h3 class="card-title">会议资料下载</h3>
          <div class="doc-list">
            <div class="doc-item">
              <i class="fa-solid fa-file-pdf" style="color: #ff4d4f;"></i>
              <span>2026年小区绿化升级方案草案.pdf</span>
              <button class="text-btn">下载</button>
            </div>
            <div class="doc-item">
              <i class="fa-solid fa-file-word" style="color: #1890ff;"></i>
              <span>物业选聘表决规则说明.docx</span>
              <button class="text-btn">下载</button>
            </div>
          </div>
        </div>

        <div class="card" style="margin-top: 16px;" v-if="role === 'committee' || role === 'admin'">
          <NotificationMock />
        </div>
      </div>
    </div>

    <!-- 底部操作区 -->
    <div class="action-bar">
      <template v-if="role === 'host'">
        <button class="btn primary-btn" @click="$emit('enter-meeting')">开始会议 (进入会议室)</button>
      </template>
      <template v-else>
        <button class="btn primary-btn" @click="$emit('enter-meeting')">进入会议室</button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AgendaManager from './AgendaManager.vue'
import NotificationMock from './NotificationMock.vue'

const props = defineProps({
  role: { type: String, required: true }
})
defineEmits(['enter-meeting'])

const micOn = ref(true)
const camOn = ref(true)
const agenda = ref([])

onMounted(async () => {
  // Mock fetch
  try {
    const res = await fetch('./会议模拟仓_Vue版/mock/simulateAgenda.json')
    if (res.ok) {
      agenda.value = await res.json()
    } else {
      // 降级使用本地静态数据
      agenda.value = [
        { id: 1, title: "宣读本次会议规则及注意事项", duration: "5分钟" },
        { id: 2, title: "讨论2026年小区绿化升级方案", duration: "30分钟" }
      ]
    }
  } catch(e) {
    agenda.value = [
      { id: 1, title: "宣读本次会议规则及注意事项", duration: "5分钟" },
      { id: 2, title: "讨论2026年小区绿化升级方案", duration: "30分钟" }
    ]
  }
})
</script>

<style scoped>
.prepare-room {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start; /* 防止子元素被拉伸变形 */
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
}

.card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  box-sizing: border-box;
  width: 100%; /* 确保卡片不会超出父容器 */
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  line-height: 1.4;
}

.video-preview {
  width: 100%;
  aspect-ratio: 16 / 9; /* 使用固定比例替代固定高度，增强响应式 */
  max-height: 240px;
  background: #1f1f1f;
  border-radius: 8px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  overflow: hidden; /* 防止子元素溢出 */
}

.placeholder-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.device-controls {
  position: absolute;
  bottom: 12px;
  display: flex;
  gap: 12px;
}

.control-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.2);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}
.control-btn.active {
  background: var(--brand-main, #1890ff);
}
.control-btn:hover {
  background: rgba(255,255,255,0.3);
}
.control-btn.active:hover {
  background: var(--brand-main-hover, #40a9ff);
}

.identity-info p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}
.status.success {
  color: #52c41a;
  display: flex;
  align-items: center;
  gap: 4px;
}

.agenda-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.agenda-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed #f0f0f0;
  font-size: 14px;
}
.agenda-id {
  width: 24px;
  height: 24px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 12px;
}
.agenda-title {
  flex: 1;
  color: #333;
}
.agenda-duration {
  color: #999;
  font-size: 12px;
}

.doc-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.doc-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  font-size: 14px;
  transition: background-color 0.2s;
}
.doc-item:hover {
  background: #f0f0f0;
}
.doc-item span {
  flex: 1;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; /* 防止文件名过长换行 */
}
.text-btn {
  background: none;
  border: none;
  color: var(--brand-main, #1890ff);
  cursor: pointer;
  padding: 4px 8px;
  font-size: 13px;
}
.text-btn:hover {
  color: var(--brand-main-hover, #40a9ff);
}

.action-bar {
  margin-top: 24px;
  padding-top: 16px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f0f0f0; /* 添加分隔线 */
}

.btn {
  padding: 10px 32px; /* 增加点击区域 */
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  font-weight: 500;
  transition: all 0.2s;
}
.primary-btn {
  background: var(--brand-main, #1890ff);
  color: #fff;
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
}
.primary-btn:hover {
  background: var(--brand-main-hover, #40a9ff);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
  transform: translateY(-1px);
}
.primary-btn:active {
  background: var(--brand-main-active, #096dd9);
  transform: translateY(0);
}
</style>
