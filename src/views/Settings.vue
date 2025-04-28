<script setup lang="ts">
import DictionaryManager from '../components/dictionary/DictionaryManager.vue'
</script>

<template>
  <div class="settings-page">
    <div class="grid gap-8">
      <div class="section">
        <h2 class="mb-4 text-xl font-semibold">
          字典管理
        </h2>
        <div class="card rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <DictionaryManager />
        </div>
      </div>

      <div class="section">
        <h2 class="mb-4 text-xl font-semibold">
          其他设置
        </h2>
        <div class="card rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <p class="text-gray-500">
            更多设置功能即将推出...
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style> 