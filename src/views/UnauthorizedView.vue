<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <div class="text-6xl text-red-500 mb-4">🚫</div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">访问被拒绝</h1>
        <p class="text-gray-600">
          抱歉，您没有权限访问此页面。
        </p>
      </div>
      
      <div class="space-y-4">
        <el-button type="primary" @click="goBack">
          返回上一页
        </el-button>
        <el-button @click="goHome">
          回到首页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.go(-1);
};

const goHome = () => {
  router.push('/dashboard');
};
</script>