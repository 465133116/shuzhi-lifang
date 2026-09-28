<template>
  <div class="role-toggle">
    <div 
      class="toggle-btn" 
      :class="{ active: modelValue === 'owner' }"
      @click="$emit('update:modelValue', 'owner')"
    >
      普通业主
    </div>
    <div 
      class="toggle-btn" 
      :class="{ active: modelValue === 'committee' }"
      @click="$emit('update:modelValue', 'committee')"
    >
      业委会成员
    </div>
    <div 
      class="toggle-btn" 
      :class="{ active: modelValue === 'admin' }"
      @click="$emit('update:modelValue', 'admin')"
    >
      管理员
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true
  }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.role-toggle {
  display: flex;
  background: #f0f2f5;
  border-radius: 6px;
  padding: 2px;
  width: fit-content;
  flex-wrap: wrap; /* 适配窄屏 */
}

.toggle-btn {
  padding: 6px 16px;
  font-size: 13px; /* 微调字体大小 */
  color: #666;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap; /* 避免文字换行 */
}

.toggle-btn.active {
  background: #fff;
  color: var(--brand-main, #1890ff);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
</style>
