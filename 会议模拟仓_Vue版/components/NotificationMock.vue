<template>
  <div class="notification-manager">
    <div class="header-action">
      <h3 class="card-title">会议通知推送</h3>
    </div>

    <div class="push-form" v-if="canManage">
      <div class="form-item">
        <label>通知内容:</label>
        <textarea v-model="form.content" rows="3" placeholder="请输入要推送的会议通知内容..."></textarea>
      </div>
      <div class="form-item">
        <label>推送渠道 (多选):</label>
        <div class="channel-options">
          <label><input type="checkbox" v-model="form.channels" value="sms"> 短信</label>
          <label><input type="checkbox" v-model="form.channels" value="email"> 邮件</label>
          <label><input type="checkbox" v-model="form.channels" value="app"> App内</label>
        </div>
      </div>
      <button class="primary-btn" @click="sendPush" :disabled="!form.content || form.channels.length === 0">
        <i class="fa-solid fa-paper-plane"></i> 发送通知
      </button>
    </div>
    
    <div v-else class="empty-state">
      您没有发送通知的权限
    </div>

    <div class="push-history" v-if="history.length > 0">
      <h4 class="history-title">发送记录与回执</h4>
      <div class="history-list">
        <div class="history-item" v-for="item in history" :key="item.id">
          <div class="item-header">
            <span class="time">{{ item.time }}</span>
            <div class="channels">
              <span v-for="c in item.channels" :key="c" class="channel-tag">{{ getChannelName(c) }}</span>
            </div>
          </div>
          <div class="item-content">{{ item.content }}</div>
          <div class="item-receipt">
            <span>送达: {{ item.delivered }}/{{ item.total }}</span>
            <span class="read-status">已读: {{ item.read }}/{{ item.total }} ({{ getReadRate(item.read, item.total) }}%)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useSimulationStore } from '../store'

const store = useSimulationStore()
const canManage = ref(store.hasPermission('manage_meeting'))

watch(() => store.currentRole, () => {
  canManage.value = store.hasPermission('manage_meeting')
})

const form = ref({
  content: '【会议通知】关于3号楼外墙修缮的讨论会将于今日14:00在线上举行，请准时参加。',
  channels: ['app', 'sms']
})

const history = ref([
  {
    id: 1,
    time: '2026-03-19 10:00',
    content: '【会议预告】3号楼外墙修缮会议筹备中。',
    channels: ['app'],
    total: 120,
    delivered: 120,
    read: 98
  }
])

const getChannelName = (c) => {
  const map = { sms: '短信', email: '邮件', app: 'App内' }
  return map[c] || c
}

const getReadRate = (read, total) => {
  return total === 0 ? 0 : Math.round((read / total) * 100)
}

const sendPush = () => {
  const newItem = {
    id: Date.now(),
    time: new Date().toLocaleString(),
    content: form.value.content,
    channels: [...form.value.channels],
    total: 120,
    delivered: 120,
    read: 0
  }
  history.value.unshift(newItem)
  
  // 模拟已读回执增加
  let count = 0
  const timer = setInterval(() => {
    count++
    newItem.read += Math.floor(Math.random() * 5)
    if (newItem.read >= 115 || count > 10) {
      clearInterval(timer)
    }
  }, 1000)
  
  form.value.content = ''
}
</script>

<style scoped>
.notification-manager {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.header-action {
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 8px;
}
.card-title { 
  margin: 0; 
  font-size: 15px; 
  font-weight: 600; 
  color: #333;
  line-height: 1.4;
}

.push-form {
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-item label { 
  font-size: 13px; 
  color: #333; 
  font-weight: 500; 
}
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  transition: border-color 0.2s;
  box-sizing: border-box; /* 防止 padding 撑破 */
}
textarea:focus {
  border-color: #1890ff;
  outline: none;
}

.channel-options {
  display: flex;
  gap: 20px;
  font-size: 14px;
  flex-wrap: wrap;
}
.channel-options label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: normal;
}
.channel-options input[type="checkbox"] {
  margin: 0;
}

.primary-btn {
  align-self: flex-start;
  background: #1890ff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.primary-btn:hover:not(:disabled) { 
  background: #40a9ff; 
  transform: translateY(-1px);
}
.primary-btn:disabled { 
  background: #d9d9d9; 
  cursor: not-allowed; 
  color: #fff;
}

.history-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #333;
  font-weight: 600;
}
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.history-item {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 16px;
  background: #fff;
  transition: box-shadow 0.2s;
}
.history-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.time { 
  font-size: 12px; 
  color: #999; 
}
.channels { 
  display: flex; 
  gap: 6px; 
  flex-wrap: wrap;
}
.channel-tag {
  font-size: 11px;
  background: #e6f7ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #91d5ff;
}

.item-content {
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.5;
  word-break: break-word;
}
.item-receipt {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
  background: #f9f9f9;
  padding: 8px 12px;
  border-radius: 4px;
  flex-wrap: wrap;
  gap: 8px;
}
.read-status { 
  color: #52c41a; 
  font-weight: 500; 
}

.empty-state { 
  text-align: center; 
  padding: 32px 20px; 
  color: #999; 
  font-size: 13px; 
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #d9d9d9;
}
</style>
