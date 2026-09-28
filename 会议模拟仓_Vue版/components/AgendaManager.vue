<template>
  <div class="agenda-manager">
    <div class="header-action">
      <h3 class="card-title">会议议程管理</h3>
      <button class="add-btn" @click="addAgenda" v-if="canEdit"><i class="fa-solid fa-plus"></i> 新增</button>
    </div>
    
    <ul class="agenda-list">
      <li v-for="(item, index) in localAgenda" :key="item.id" class="agenda-item">
        <div class="agenda-id">{{ index + 1 }}</div>
        
        <div class="agenda-content" v-if="editingId !== item.id">
          <span class="agenda-title">{{ item.title }}</span>
          <span class="agenda-duration"><i class="fa-regular fa-clock"></i> {{ item.duration }}分钟</span>
        </div>
        
        <div class="agenda-edit" v-else>
          <input v-model="editForm.title" placeholder="议程标题" class="edit-input" />
          <input v-model.number="editForm.duration" type="number" placeholder="时长(分)" class="edit-duration" />
          <button class="save-btn" @click="saveEdit(item.id)">保存</button>
        </div>

        <div class="agenda-actions" v-if="canEdit && editingId !== item.id">
          <button class="icon-btn" @click="startEdit(item)" title="编辑"><i class="fa-solid fa-pen"></i></button>
          <button class="icon-btn" @click="moveUp(index)" :disabled="index === 0" title="上移"><i class="fa-solid fa-arrow-up"></i></button>
          <button class="icon-btn" @click="moveDown(index)" :disabled="index === localAgenda.length - 1" title="下移"><i class="fa-solid fa-arrow-down"></i></button>
          <button class="icon-btn danger" @click="removeAgenda(item.id)" title="删除"><i class="fa-solid fa-trash"></i></button>
        </div>
      </li>
    </ul>
    
    <div v-if="localAgenda.length === 0" class="empty-state">
      暂无议程，请添加
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useSimulationStore } from '../store'

const props = defineProps({
  modelValue: { type: Array, required: true }
})
const emit = defineEmits(['update:modelValue'])

const store = useSimulationStore()
const canEdit = ref(store.hasPermission('edit_agenda'))

const localAgenda = ref([...props.modelValue])
const editingId = ref(null)
const editForm = ref({ title: '', duration: 0 })

// 监听权限变化
watch(() => store.currentRole, () => {
  canEdit.value = store.hasPermission('edit_agenda')
})

const addAgenda = () => {
  const newId = Date.now()
  localAgenda.value.push({
    id: newId,
    title: '新议程项目',
    duration: 10,
    status: 'pending'
  })
  emit('update:modelValue', localAgenda.value)
  startEdit(localAgenda.value[localAgenda.value.length - 1])
}

const startEdit = (item) => {
  editingId.value = item.id
  editForm.value = { title: item.title, duration: parseInt(item.duration) || 10 }
}

const saveEdit = (id) => {
  const index = localAgenda.value.findIndex(a => a.id === id)
  if (index > -1) {
    localAgenda.value[index].title = editForm.value.title
    localAgenda.value[index].duration = `${editForm.value.duration}`
  }
  editingId.value = null
  emit('update:modelValue', localAgenda.value)
}

const removeAgenda = (id) => {
  localAgenda.value = localAgenda.value.filter(a => a.id !== id)
  emit('update:modelValue', localAgenda.value)
}

const moveUp = (index) => {
  if (index > 0) {
    const temp = localAgenda.value[index]
    localAgenda.value[index] = localAgenda.value[index - 1]
    localAgenda.value[index - 1] = temp
    emit('update:modelValue', localAgenda.value)
  }
}

const moveDown = (index) => {
  if (index < localAgenda.value.length - 1) {
    const temp = localAgenda.value[index]
    localAgenda.value[index] = localAgenda.value[index + 1]
    localAgenda.value[index + 1] = temp
    emit('update:modelValue', localAgenda.value)
  }
}
</script>

<style scoped>
.agenda-manager {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap; /* 适配窄屏 */
  gap: 8px;
}
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.4;
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

.agenda-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.agenda-item {
  display: flex;
  align-items: flex-start; /* 适应内容多行 */
  padding: 12px 0;
  border-bottom: 1px dashed #f0f0f0;
  font-size: 14px;
  gap: 12px;
}
.agenda-item:last-child {
  border-bottom: none;
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
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 2px; /* 与文字对齐 */
}
.agenda-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* 防止子元素撑破容器 */
}
.agenda-title { 
  color: #333; 
  font-weight: 500; 
  line-height: 1.5;
  word-break: break-word; /* 允许长单词换行 */
}
.agenda-duration { 
  color: #999; 
  font-size: 12px; 
  margin-top: 4px; 
  display: flex;
  align-items: center;
  gap: 4px;
}

.agenda-edit {
  flex: 1;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  flex-wrap: wrap; /* 小屏幕允许输入框换行 */
}
.edit-input { 
  flex: 1; 
  min-width: 120px;
  padding: 6px 8px; 
  border: 1px solid #d9d9d9; 
  border-radius: 4px; 
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.2s;
}
.edit-input:focus { border-color: #1890ff; outline: none; }

.edit-duration { 
  width: 70px; 
  padding: 6px 8px; 
  border: 1px solid #d9d9d9; 
  border-radius: 4px; 
  font-size: 13px;
  font-family: inherit;
}
.edit-duration:focus { border-color: #1890ff; outline: none; }

.save-btn { 
  background: #52c41a; 
  color: white; 
  border: none; 
  padding: 6px 12px; 
  border-radius: 4px; 
  cursor: pointer; 
  font-size: 13px;
  transition: background-color 0.2s;
  white-space: nowrap;
}
.save-btn:hover { background: #73d13d; }

.agenda-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  margin-top: 2px;
}
.icon-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-btn:hover:not(:disabled) { 
  color: #1890ff; 
  background: #f0f2f5;
}
.icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.icon-btn.danger:hover:not(:disabled) { 
  color: #ff4d4f; 
  background: #fff1f0;
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
