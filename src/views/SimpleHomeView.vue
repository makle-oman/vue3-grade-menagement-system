<template>
  <div class="home-container">
    <h1>简单测试页面</h1>
    <p>如果您能看到这个页面，说明路由和组件渲染是正常的</p>
    
    <div class="test-section">
      <h2>基本信息</h2>
      <p>当前时间: {{ currentTime }}</p>
      <p>测试计数: {{ count }}</p>
      <button @click="increment">点击增加</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const currentTime = ref('');
const count = ref(0);

const increment = () => {
  count.value++;
};

onMounted(() => {
  currentTime.value = new Date().toLocaleString();
});
</script>

<style scoped>
.home-container {
  padding: 20px;
  background: white;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.test-section {
  margin-top: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
}

button {
  background: #409EFF;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #337ecc;
}
</style>