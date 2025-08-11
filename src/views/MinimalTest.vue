<template>
  <div>
    <h1>最简单的测试页面</h1>
    <p>当前时间: {{ currentTime }}</p>
    <button @click="updateTime">更新时间</button>
    <p>点击次数: {{ clickCount }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentTime = ref(new Date().toLocaleString())
const clickCount = ref(0)

const updateTime = () => {
  currentTime.value = new Date().toLocaleString()
  clickCount.value++
}
</script>