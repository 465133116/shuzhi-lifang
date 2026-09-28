<template>
  <div class="meeting-minutes">
    <div class="header-action">
      <h3 class="card-title">会议纪要 (AI 辅助)</h3>
      <div class="actions" v-if="canManage">
        <button class="action-btn" @click="generateAI"><i class="fa-solid fa-wand-magic-sparkles"></i> AI提取决议</button>
        <button class="action-btn primary" @click="exportDoc"><i class="fa-solid fa-download"></i> 导出</button>
      </div>
    </div>

    <div class="transcript-section">
      <div class="section-title">实时语音转文字记录</div>
      <div class="transcript-box">
        <div class="message" v-for="(msg, index) in transcripts" :key="index">
          <span class="msg-time">{{ msg.time }}</span>
          <span class="msg-speaker">{{ msg.speaker }}:</span>
          <span class="msg-text">{{ msg.text }}</span>
        </div>
      </div>
    </div>

    <div class="summary-section">
      <div class="section-title">关键决议与总结</div>
      <div class="summary-box" v-if="summary">
        <div class="summary-item">
          <strong>会议主题：</strong> {{ summary.title }}
        </div>
        <div class="summary-item">
          <strong>会议决议：</strong>
          <ul>
            <li v-for="(item, idx) in summary.resolutions" :key="idx">{{ item }}</li>
          </ul>
        </div>
      </div>
      <div class="empty-summary" v-else>
        点击上方“AI提取决议”生成总结
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

const transcripts = ref([
  { time: '14:02', speaker: '张三(主持人)', text: '大家好，现在开始讨论3号楼外墙修缮的问题。' },
  { time: '14:05', speaker: '李四(业主)', text: '我同意修缮，外墙脱落很危险。' },
  { time: '14:08', speaker: '王五(业主)', text: '费用大概需要多少？是否从维修资金走？' },
  { time: '14:10', speaker: '张三(主持人)', text: '预计费用5万元，计划申请维修资金，等下我们会发起投票。' }
])

const summary = ref(null)

const generateAI = () => {
  // 模拟AI提取过程
  setTimeout(() => {
    summary.value = {
      title: '关于3号楼外墙修缮的讨论',
      resolutions: [
        '确认3号楼外墙存在安全隐患，需要进行修缮。',
        '修缮预计费用约5万元。',
        '资金来源拟申请使用住宅专项维修资金。',
        '将通过业主大会投票表决最终方案。'
      ]
    }
  }, 800)
}

const exportDoc = () => {
  alert('会议纪要已导出为 PDF 模板文件')
}
</script>

<style scoped>
.meeting-minutes {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.header-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}
.card-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
  color: #333;
}
.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.action-btn {
  background: #fff;
  border: 1px solid #d9d9d9;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  white-space: nowrap;
}
.action-btn:hover { background: #fafafa; border-color: #1890ff; color: #1890ff; }
.action-btn.primary {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}
.action-btn.primary:hover { background: #40a9ff; border-color: #40a9ff; color: white; }

.section-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.transcript-box {
  background: #f9f9f9;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 12px;
  height: 240px; /* 增加高度 */
  overflow-y: auto;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.message {
  line-height: 1.6;
  display: flex;
  align-items: flex-start;
}
.msg-time { 
  color: #999; 
  margin-right: 8px; 
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 2px;
}
.msg-speaker { 
  color: #1890ff; 
  font-weight: 500; 
  margin-right: 8px;
  flex-shrink: 0;
}
.msg-text { 
  color: #333;
  word-break: break-word;
}

.summary-box {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 6px;
  padding: 16px;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}
.summary-item { margin-bottom: 12px; }
.summary-item:last-child { margin-bottom: 0; }
.summary-item ul { 
  margin: 8px 0 0 24px; 
  padding: 0; 
}
.summary-item li { 
  margin-bottom: 6px; 
}

.empty-summary {
  background: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  padding: 32px 20px;
  text-align: center;
  color: #999;
  font-size: 13px;
}
</style>
