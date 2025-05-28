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
  <div class="p-4 sm:p-4">
    <div class="w-full flex flex-wrap justify-center gap-x-4 gap-y-4">
      <div
        v-for="theme in themeStore.availableThemes"
        :key="theme.value"
        class="relative flex flex-col items-center gap-2 cursor-pointer transform transition-all duration-300 ease-in-out group p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 ring-offset-2 dark:ring-offset-gray-900 sm:ring-offset-4"
        :class="{
          'ring-2 ring-blue-500 scale-105 shadow-lg': themeStore.currentTheme === theme.value,
          'hover:scale-105': themeStore.currentTheme !== theme.value,
        }"
        @click="changeTheme(theme.value)"
        @mouseenter="hoveredTheme = theme.value"
        @mouseleave="hoveredTheme = null"
      >
        <div
          class="relative w-12 h-12 rounded-full transition-all duration-300 ease-in-out shadow-md group-hover:shadow-lg group-active:scale-95 flex items-center justify-center sm:w-16 sm:h-16"
          :style="{ backgroundColor: theme.color }"
        >
          <div
            v-if="themeStore.currentTheme === theme.value"
            class="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full animate-fade-in"
          >
            <svg
              class="w-6 h-6 text-white sm:w-8 sm:h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
        </div>
        <div class="flex flex-col items-center">
          <div
            class="text-sm font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-300 sm:text-base"
            :class="{ 'text-blue-600 dark:text-blue-400': themeStore.currentTheme === theme.value }"
          >
            {{ theme.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
</style>
