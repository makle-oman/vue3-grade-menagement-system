<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">
        <el-icon size="48"><Warning /></el-icon>
      </div>
      <h3 class="error-title">页面出现错误</h3>
      <p class="error-message">{{ errorMessage }}</p>
      <div class="error-actions">
        <el-button type="primary" @click="retry">重试</el-button>
        <el-button @click="goHome">返回首页</el-button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { ElButton, ElIcon } from 'element-plus'
import { Warning } from '@element-plus/icons-vue'

const hasError = ref(false)
const errorMessage = ref('')
const router = useRouter()

onErrorCaptured((error: Error) => {
  hasError.value = true
  errorMessage.value = error.message || '未知错误'
  console.error('ErrorBoundary captured error:', error)
  return false
})

const retry = () => {
  hasError.value = false
  errorMessage.value = ''
  window.location.reload()
}

const goHome = () => {
  hasError.value = false
  errorMessage.value = ''
  router.push('/')
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 32px;
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  color: #f56565;
  margin-bottom: 16px;
}

.error-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.error-message {
  color: #6b7280;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>