<script setup lang="ts">
import type { ThemeType } from '@/stores/themeStore'
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()

// 初始化主题
onMounted(() => {
  themeStore.initTheme()
})

// 切换主题
function changeTheme(themeValue: string) {
  themeStore.setTheme(themeValue as ThemeType)
}
</script>

<template>
  <div class="theme-switcher">
    <div class="flex items-center gap-2">
      <div class="text-sm text-gray-600">
        主题:
      </div>
      <div class="flex gap-1">
        <button
          v-for="theme in themeStore.availableThemes"
          :key="theme.value"
          class="theme-button h-6 w-6 border-2 rounded-full transition-all"
          :class="themeStore.currentTheme === theme.value ? 'border-gray-600' : 'border-transparent'"
          :style="{ backgroundColor: theme.color }"
          :title="theme.label"
          @click="changeTheme(theme.value)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-button {
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.theme-button:hover {
    transform: scale(1.1);
}
</style>
