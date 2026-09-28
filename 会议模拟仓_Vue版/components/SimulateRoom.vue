<template>
  <div class="simulate-room-container">
    <!-- 初始阶段选择弹窗 -->
    <transition name="fade">
      <div v-if="showModal" class="phase-modal-overlay" @click="closeModal">
        <div class="phase-modal-content" @click.stop>
          <div class="phase-modal-close" @click="closeModal">
            <i class="fa-solid fa-times"></i>
          </div>
          <h3 class="phase-modal-title">请选择进入模拟仓的阶段</h3>
          <div class="phase-cards">
            <div class="phase-card" @click="selectPhase('prepare')">
              <i class="fa-solid fa-clipboard-check"></i>
              <h4>会前（准备室）</h4>
              <p>进入会议前的设备检测、资料预览与角色配置</p>
            </div>
            <div class="phase-card" @click="selectPhase('meeting')">
              <i class="fa-solid fa-video"></i>
              <h4>会中（线上会议）</h4>
              <p>直接进入实时音视频会议，自动加载会议议程与互动工具</p>
            </div>
            <div class="phase-card" @click="selectPhase('post')">
              <i class="fa-solid fa-file-signature"></i>
              <h4>会后（后续操作）</h4>
              <p>会议结束后的纪要整理、文件归档及反馈收集</p>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div class="simulate-header">
      <div class="header-left">
        <h2>业主会议模拟仓</h2>
        <RoleToggle v-model="currentRole" @change="handleRoleChange" />
      </div>
      <div class="header-right">
        <!-- 步骤条 -->
        <div class="step-indicator">
          <div 
            class="step" 
            :class="{ active: currentStep === 'prepare', completed: currentStep !== 'prepare' }"
            @click="goToStep('prepare')"
          >
            <span class="step-num">1</span> 准备室
          </div>
          <div class="step-line"></div>
          <div class="step" 
            :class="{ active: currentStep === 'meeting', completed: currentStep === 'post' }"
            @click="goToStep('meeting')"
          >
            <span class="step-num">2</span> 正式会议
          </div>
          <div class="step-line"></div>
          <div class="step" :class="{ active: currentStep === 'post' }">
            <span class="step-num">3</span> 会后处理
          </div>
        </div>
      </div>
    </div>

    <!-- 离线提示 -->
    <div v-if="!isOnline" class="toast-offline">
      网络已断开，正在尝试重连...
    </div>

    <div class="simulate-content">
      <!-- 动态加载组件，控制分包和懒加载 -->
      <KeepAlive>
        <component 
          :is="currentComponent" 
          :role="currentRole" 
          @enter-meeting="goToStep('meeting')"
          @finish-meeting="goToStep('post')"
        />
      </KeepAlive>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSimulationStore } from '../store'
import RoleToggle from './RoleToggle.vue'
import PrepareRoom from './PrepareRoom.vue'
import MeetingRoom from './MeetingRoom.vue'
import PostRoom from './PostRoom.vue'

const store = useSimulationStore()

const currentStep = ref('prepare') // 'prepare' | 'meeting' | 'post'
const showModal = ref(true) // 控制弹窗显示
const isOnline = ref(navigator.onLine)

// 同步路由状态
const currentRole = computed({
  get: () => store.currentRole,
  set: (val) => {
    store.setRole(val)
    const url = new URL(window.location)
    url.searchParams.set('role', val)
    window.history.replaceState({}, '', url)
  }
})

const currentComponent = computed(() => {
  if (currentStep.value === 'prepare') return PrepareRoom
  if (currentStep.value === 'meeting') return MeetingRoom
  return PostRoom
})

const selectPhase = (phase) => {
  // 埋点记录
  console.log(`[Tracking] User selected phase: ${phase}, Timestamp: ${Date.now()}`)
  // 300ms 弹窗淡出并在300ms内完成跳转
  showModal.value = false
  setTimeout(() => {
    currentStep.value = phase
  }, 300)
}

const closeModal = () => {
  showModal.value = false
}

const handleRoleChange = (role) => {
  // 角色切换在 300ms 内完成，无需刷新整页
  currentRole.value = role
}

const goToStep = (step) => {
  if (step === 'prepare' && currentStep.value === 'meeting') {
    // 允许回退到准备室，数据由 KeepAlive 保持
    currentStep.value = 'prepare'
  } else if (step === 'meeting') {
    currentStep.value = 'meeting'
  }
}

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

onMounted(() => {
  // 初始化从路由获取 role
  const params = new URLSearchParams(window.location.search)
  const role = params.get('role')
  if (role && ['owner', 'committee', 'admin'].includes(role)) {
    store.setRole(role)
  } else {
    const url = new URL(window.location)
    url.searchParams.set('role', store.currentRole)
    window.history.replaceState({}, '', url)
  }

  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<style scoped>
.simulate-room-container {
  /* 修复与外部的盒模型冲突 */
  box-sizing: border-box;
  background: var(--bg-card, #fff);
  border-radius: 12px;
  overflow: hidden;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  display: flex;
  flex-direction: column;
  height: 100%; /* 确保在容器中能够撑开 */
  min-height: 500px;
}

.simulate-room-container * {
  box-sizing: inherit;
}

.simulate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; /* 允许在极小屏幕下换行 */
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  gap: 16px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-left h2 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.4;
}

/* 步骤条 */
.step-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #999;
  cursor: default;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.step.completed {
  color: var(--brand-main, #1890ff);
  cursor: pointer;
}

.step.active {
  color: #333;
  font-weight: 600;
}

.step-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.step.active .step-num, .step.completed .step-num {
  background: var(--brand-main, #1890ff);
  color: #fff;
}

.step-line {
  width: 32px;
  height: 1px;
  background: #e8e8e8;
}

.toast-offline {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff4d4f;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.2);
  font-size: 14px;
}

.simulate-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 允许内部滚动，防止撑爆父容器 */
}

/* 模态弹窗样式 */
.phase-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2147483647 !important; /* 保证在最顶层，超越所有原生组件 */
}
.phase-modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 800px;
  position: relative;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.phase-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  width: 44px; /* 热区>=44px */
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}
.phase-modal-close:hover {
  color: #333;
}
.phase-modal-title {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin: 0 0 24px 0;
  color: #333;
}
.phase-cards {
  display: flex;
  gap: 16px;
  flex-wrap: nowrap;
}
.phase-card {
  flex: 1;
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 160px;
}
.phase-card:hover {
  background: #e6f7ff;
  border-color: #91d5ff;
  transform: translateY(-2px);
}
.phase-card i {
  font-size: 32px;
  color: var(--brand-main, #1890ff);
  margin-bottom: 12px;
}
.phase-card h4 {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #333;
}
.phase-card p {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

/* 弹窗淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式断点 */
@media (max-width: 768px) {
  .simulate-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .step-indicator {
    width: 100%;
    justify-content: flex-start;
  }
  .simulate-content {
    padding: 12px;
  }
  .phase-cards {
    flex-direction: column;
  }
  .phase-card {
    min-height: auto;
  }
}
</style>
