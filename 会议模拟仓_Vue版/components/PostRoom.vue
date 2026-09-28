<template>
  <div class="post-room">
    <div class="grid-container">
      <div class="card">
        <h3 class="card-title">会后处理</h3>
        <div class="card-content">
          <div class="task-item">
            <i class="fa-solid fa-file-signature"></i>
            <div class="task-info">
              <h4>纪要整理</h4>
              <p>整理本次会议记录并生成纪要文档</p>
            </div>
            <button class="action-btn">去整理</button>
          </div>
          
          <div class="task-item">
            <i class="fa-solid fa-box-archive"></i>
            <div class="task-info">
              <h4>文件归档</h4>
              <p>将会议录音、表决结果及纪要归档至档案库</p>
            </div>
            <button class="action-btn">去归档</button>
          </div>
          
          <div class="task-item">
            <i class="fa-solid fa-comment-dots"></i>
            <div class="task-info">
              <h4>反馈收集</h4>
              <p>向参会业主发送会议满意度调查</p>
            </div>
            <button class="action-btn">去收集</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
</script>

<style scoped>
.post-room {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.grid-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  box-sizing: border-box;
  width: 100%;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  transition: background 0.2s;
}

.task-item:hover {
  background: #f0f7ff;
}

.task-item i {
  font-size: 24px;
  color: var(--brand-main, #1890ff);
  width: 40px;
  text-align: center;
}

.task-info {
  flex: 1;
}

.task-info h4 {
  margin: 0 0 4px 0;
  font-size: 15px;
  color: #333;
}

.task-info p {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  background: var(--brand-main, #1890ff);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: opacity 0.2s;
}

.action-btn:hover {
  opacity: 0.8;
}
</style>
