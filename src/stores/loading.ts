import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false)
  const loadingText = ref('加载中...')
  const requestCount = ref(0)

  const startLoading = (text = '加载中...') => {
    requestCount.value++
    loadingText.value = text
    isLoading.value = true
  }

  const stopLoading = () => {
    requestCount.value = Math.max(0, requestCount.value - 1)
    if (requestCount.value === 0) {
      isLoading.value = false
    }
  }

  const forceStopLoading = () => {
    requestCount.value = 0
    isLoading.value = false
  }

  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading,
    forceStopLoading
  }
})