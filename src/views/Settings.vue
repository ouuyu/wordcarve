<script setup lang="ts">
import DictionaryManager from '@/components/settings/DictionaryManager.vue'
import ThemeSwitcher from '@/components/settings/ThemeSwitcher.vue'
</script>

<template>
  <div class="settings-page">
    <div class="grid gap-8">
      <div class="section">
        <h2 class="mb-4 text-xl font-semibold">字典管理</h2>
        <div class="card bg-grey-100 border border-gray-100 rounded-lg p-6 shadow-sm">
          <DictionaryManager />
        </div>
      </div>

      <div class="section">
        <h2 class="mb-4 text-xl font-semibold">其他设置</h2>
        <div class="card bg-grey-100 border border-gray-100 rounded-lg p-6 shadow-sm">
          <div class="mb-4">
            <span class="text-gray-600 text-sm mr-2">主题:</span>
            <ThemeSwitcher />
          </div>
          <p class="text-gray-500">更多设置功能即将推出...</p>
        </div>
      </div>
    </div>
  </div>
</template>
