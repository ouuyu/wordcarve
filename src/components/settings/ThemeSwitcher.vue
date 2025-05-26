<script setup lang="ts">
import type { ThemeType } from '@/stores/themeStore'
import { onMounted, ref } from 'vue'
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()
const hoveredTheme = ref<ThemeType | null>(null)

onMounted(() => {
  themeStore.initTheme()
})

function changeTheme(themeValue: string) {
  themeStore.setTheme(themeValue as ThemeType)
}
</script>

<template>
  <div class="theme-switcher-container">
    <div class="w-full flex flex-wrap justify-center gap-8 p-6">
      <div
        v-for="theme in themeStore.availableThemes"
        :key="theme.value"
        class="relative flex flex-col items-center gap-3 cursor-pointer transform transition-all duration-300 ease-in-out group"
        :class="{
          'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800 scale-110':
            themeStore.currentTheme === theme.value,
        }"
        @click="changeTheme(theme.value)"
        @mouseenter="hoveredTheme = theme.value"
        @mouseleave="hoveredTheme = null"
      >
        <div
          class="relative w-12 h-12 rounded-full transition-all duration-300 ease-in-out shadow-lg group-hover:scale-110 group-active:scale-95"
          :style="{ backgroundColor: theme.color }"
        >
          <div
            v-if="themeStore.currentTheme === theme.value"
            class="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full"
          >
            <div class="text-lg text-white i-carbon-checkmark"></div>
          </div>
        </div>
        <div class="flex flex-col items-center">
          <div
            class="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-300"
            :class="{ 'text-blue-600 dark:text-blue-400': themeStore.currentTheme === theme.value }"
          >
            {{ theme.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
