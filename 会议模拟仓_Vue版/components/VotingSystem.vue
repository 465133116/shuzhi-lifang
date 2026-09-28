<template>
  <div class="voting-system">
    <div class="header-action">
      <h3 class="card-title">实时投票表决</h3>
      <button v-if="canInitiate" class="add-btn" @click="createVote"><i class="fa-solid fa-plus"></i> 发起投票</button>
    </div>

    <div v-if="votes.length === 0" class="empty-state">
      暂无进行中的投票
    </div>

    <div v-for="vote in votes" :key="vote.id" class="vote-card">
      <div class="vote-header">
        <span class="vote-status" :class="vote.status">{{ vote.status === 'active' ? '进行中' : '已结束' }}</span>
        <h4 class="vote-title">{{ vote.title }}</h4>
      </div>
      
      <div class="vote-meta">
        <span class="rule-badge">规则: {{ vote.rule }}</span>
        <span class="type-badge">{{ vote.isAnonymous ? '匿名投票' : '实名投票' }}</span>
      </div>

      <!-- 投票选项 (进行中且未投) -->
      <div v-if="vote.status === 'active' && !vote.hasVoted" class="vote-options">
        <label v-for="opt in vote.options" :key="opt.id" class="option-label">
          <input type="radio" :name="'vote_' + vote.id" :value="opt.id" v-model="selectedOptions[vote.id]" />
          <span>{{ opt.text }}</span>
        </label>
        <button class="submit-btn" :disabled="!selectedOptions[vote.id]" @click="submitVote(vote)">提交表决</button>
      </div>

      <!-- 投票结果 (已投或已结束) -->
      <div v-else class="vote-results">
        <div v-for="opt in vote.options" :key="opt.id" class="result-bar-container">
          <div class="result-info">
            <span>{{ opt.text }}</span>
            <span>{{ opt.count }} 票 ({{ getPercentage(opt.count, vote.totalVotes) }}%)</span>
          </div>
          <div class="progress-bg">
            <div class="progress-fill" :style="{ width: getPercentage(opt.count, vote.totalVotes) + '%' }"></div>
          </div>
        </div>
        <div class="total-info">总票数: {{ vote.totalVotes }} 票</div>
        <button v-if="canInitiate && vote.status === 'active'" class="end-btn" @click="endVote(vote)">结束投票</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useSimulationStore } from '../store'

const store = useSimulationStore()
const canInitiate = ref(store.hasPermission('initiate_vote'))

const votes = ref([])
const selectedOptions = ref({})

// 监听权限变化
watch(() => store.currentRole, () => {
  canInitiate.value = store.hasPermission('initiate_vote')
})

onMounted(async () => {
  try {
    const res = await fetch('./会议模拟仓_Vue版/mock/simulateVotes.json')
    if (res.ok) {
      const data = await res.json()
      processVotes(data)
    } else {
      loadFallbackData()
    }
  } catch (e) {
    loadFallbackData()
  }
})

const loadFallbackData = () => {
  const data = [
    {
      id: 101,
      title: "是否同意动用维修资金修缮3号楼外墙？",
      status: "active",
      options: [
        { id: "A", text: "同意", count: 45 },
        { id: "B", text: "反对", count: 12 },
        { id: "C", text: "弃权", count: 3 }
      ],
      rule: "双过半",
      isAnonymous: false
    }
  ]
  processVotes(data)
}

const processVotes = (data) => {
  votes.value = data.map(v => ({
    ...v,
    totalVotes: v.options.reduce((sum, opt) => sum + opt.count, 0),
    hasVoted: false
  }))
}

const getPercentage = (count, total) => {
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}

const submitVote = (vote) => {
  const selectedId = selectedOptions.value[vote.id]
  if (!selectedId) return

  const option = vote.options.find(o => o.id === selectedId)
  if (option) {
    option.count += 1
    vote.totalVotes += 1
    vote.hasVoted = true
  }
}

const endVote = (vote) => {
  vote.status = 'ended'
}

const createVote = () => {
  const newVote = {
    id: Date.now(),
    title: "新发起的议题表决",
    status: "active",
    options: [
      { id: "A", text: "同意", count: 0 },
      { id: "B", text: "反对", count: 0 },
      { id: "C", text: "弃权", count: 0 }
    ],
    rule: "双过半",
    isAnonymous: true,
    totalVotes: 0,
    hasVoted: false
  }
  votes.value.unshift(newVote)
}
</script>

<style scoped>
.voting-system {
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
  flex-wrap: wrap; /* 适配窄屏 */
  gap: 8px;
}
.card-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
  color: #333;
}
.add-btn {
  background: #1890ff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
  white-space: nowrap;
}
.add-btn:hover { background: #40a9ff; }

.empty-state {
  text-align: center;
  padding: 32px 20px;
  color: #999;
  font-size: 13px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #d9d9d9;
}

.vote-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  transition: box-shadow 0.2s;
}
.vote-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.vote-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}
.vote-status {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  margin-top: 2px;
}
.vote-status.active { background: #e6f7ff; color: #1890ff; }
.vote-status.ended { background: #f5f5f5; color: #999; }
.vote-title { 
  margin: 0; 
  font-size: 14px; 
  font-weight: 500; 
  color: #333;
  line-height: 1.5;
  word-break: break-word;
}

.vote-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.rule-badge, .type-badge {
  font-size: 12px;
  color: #666;
  background: #f9f9f9;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.vote-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.option-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}
.option-label:hover {
  background: #fafafa;
}
.option-label input[type="radio"] {
  margin: 0; /* 修复某些浏览器默认边距导致不对齐 */
}
.submit-btn {
  margin-top: 8px;
  background: #1890ff;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.submit-btn:hover:not(:disabled) { background: #40a9ff; }
.submit-btn:disabled { background: #d9d9d9; cursor: not-allowed; }

.vote-results {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.result-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 6px;
  color: #333;
}
.progress-bg {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #1890ff;
  transition: width 0.5s ease-out;
}
.total-info {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}
.end-btn {
  background: #fff;
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  margin-top: 8px;
  transition: all 0.2s;
}
.end-btn:hover {
  background: #fff1f0;
}
</style>
