<script setup lang="ts">
import { computed } from 'vue'
import { NConfigProvider } from 'naive-ui'
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()

// 初始化主题
themeStore.initTheme()

// 计算主题覆盖
const themeOverrides = computed(() => {
  const currentThemeColors = themeStore.getCurrentThemeColors()

  return {
    common: {
      primaryColor: currentThemeColors[6],
      primaryColorHover: currentThemeColors[5],
      primaryColorPressed: currentThemeColors[7],
      primaryColorSuppl: currentThemeColors[4],

      infoColor: currentThemeColors[6],
      infoColorHover: currentThemeColors[5],
      infoColorPressed: currentThemeColors[7],
      infoColorSuppl: currentThemeColors[4],

      successColor: '#18a058',
      successColorHover: '#36ad6a',
      successColorPressed: '#0c7a43',
      successColorSuppl: '#36ad6a',

      warningColor: '#f0a020',
      warningColorHover: '#fcb040',
      warningColorPressed: '#c97c10',
      warningColorSuppl: '#fcb040',

      errorColor: '#d03050',
      errorColorHover: '#de576d',
      errorColorPressed: '#ab1f3f',
      errorColorSuppl: '#de576d',
    },
  }
})
</script>

<template>
  <NConfigProvider :theme-overrides="themeOverrides">
    <slot></slot>
  </NConfigProvider>
</template>
