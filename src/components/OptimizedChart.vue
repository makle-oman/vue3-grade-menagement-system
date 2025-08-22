<template>
  <div class="optimized-chart">
    <div class="chart-header" v-if="title">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="chart-actions">
        <el-button
          size="small"
          :icon="Refresh"
          @click="refreshChart"
          :loading="loading"
        >
          刷新
        </el-button>
        <el-button
          size="small"
          :icon="Download"
          @click="downloadChart"
        >
          下载
        </el-button>
      </div>
    </div>
    
    <div
      ref="chartRef"
      :style="{ width: width, height: height }"
      class="chart-container"
      v-loading="loading"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElButton } from 'element-plus'
import { Refresh, Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

interface Props {
  options: any
  title?: string
  width?: string
  height?: string
  loading?: boolean
  autoResize?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '400px',
  loading: false,
  autoResize: true
})

const emit = defineEmits<{
  refresh: []
}>()

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

// 初始化图表
const initChart = async () => {
  if (!chartRef.value) return
  
  await nextTick()
  
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(chartRef.value, 'light', {
    renderer: 'canvas',
    useDirtyRect: true // 启用脏矩形优化
  })
  
  updateChart()
  
  // 设置自动调整大小
  if (props.autoResize) {
    setupResize()
  }
}

// 更新图表
const updateChart = () => {
  if (!chartInstance || !props.options) return
  
  chartInstance.setOption(props.options, true)
}

// 设置自动调整大小
const setupResize = () => {
  if (!chartRef.value || !chartInstance) return
  
  // 使用 ResizeObserver 监听容器大小变化
  resizeObserver = new ResizeObserver(() => {
    chartInstance?.resize()
  })
  
  resizeObserver.observe(chartRef.value)
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

// 处理窗口大小变化
const handleResize = () => {
  chartInstance?.resize()
}

// 刷新图表
const refreshChart = () => {
  emit('refresh')
}

// 下载图表
const downloadChart = () => {
  if (!chartInstance) return
  
  const url = chartInstance.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#fff'
  })
  
  const link = document.createElement('a')
  link.download = `${props.title || 'chart'}_${new Date().toISOString().split('T')[0]}.png`
  link.href = url
  link.click()
}

// 监听配置变化
watch(() => props.options, updateChart, { deep: true })

// 监听加载状态
watch(() => props.loading, (loading) => {
  if (loading) {
    chartInstance?.showLoading('default', {
      text: '加载中...',
      color: '#3b82f6',
      textColor: '#374151',
      maskColor: 'rgba(255, 255, 255, 0.8)'
    })
  } else {
    chartInstance?.hideLoading()
  }
})

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  
  window.removeEventListener('resize', handleResize)
  
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

// 暴露图表实例
defineExpose({
  chartInstance,
  refresh: refreshChart
})
</script>

<style scoped>
.optimized-chart {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.chart-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.chart-container {
  position: relative;
}
</style>