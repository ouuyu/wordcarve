<script setup lang="ts">
import { computed } from 'vue'
import { NConfigProvider } from 'naive-ui'
import { useTheme } from '@/composables/useTheme'

const { naiveTheme, themeOverrides, initTheme } = useTheme()

// 初始化主题
initTheme()
</script>

<template>
  <NConfigProvider
    :theme="naiveTheme"
    :theme-overrides="themeOverrides"
  >
    <slot></slot>
  </NConfigProvider>
</template>
