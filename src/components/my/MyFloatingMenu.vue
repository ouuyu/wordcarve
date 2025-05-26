<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const isHovered = ref(false)
const isMobile = ref(false)

const navItems = [
  { path: '/', label: '首页', icon: 'i-carbon:home' },
  { path: '/search', label: '搜索', icon: 'i-carbon:search' },
  { path: '/settings', label: '设置', icon: 'i-carbon:settings' },
]

function toggleMenu() {
  if (isMobile.value) {
    isHovered.value = !isHovered.value
  }
}

function closeMenu(e: MouseEvent) {
  if (isMobile.value && isHovered.value) {
    const target = e.target as HTMLElement
    if (!target.closest('.fixed.bottom-4.left-4')) {
      isHovered.value = false
    }
  }
}

onMounted(() => {
  isMobile.value = window.innerWidth <= 768
  window.addEventListener('click', closeMenu)
})
</script>

<template>
  <div
    class="fixed bottom-4 left-4 z-50"
    @mouseenter="!isMobile && (isHovered = true)"
    @mouseleave="!isMobile && (isHovered = false)"
    @click="toggleMenu"
  >
    <div
      class="flex overflow-hidden bg-white shadow-lg transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      :class="isHovered ? 'w-36 h-36 p-2 rounded-lg' : 'w-14 h-14 rounded-lg'"
    >
      <transition
        name="fade-swap"
        mode="out-in"
        :duration="{ enter: 300, leave: 200 }"
      >
        <template v-if="!isHovered">
          <img
            key="logo"
            src="/vite.svg"
            alt="Logo"
            class="h-14 w-14 justify-center"
          />
        </template>
        <template v-else>
          <div
            key="menu"
            class="h-full w-full flex flex-col justify-center transition-opacity duration-200"
            :class="{ 'opacity-0': !isHovered }"
          >
            <ul class="w-full flex flex-col list-none justify-center">
              <li
                v-for="item in navItems"
                :key="item.path"
                class="mb-1"
              >
                <RouterLink
                  :to="item.path"
                  class="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 no-underline hover:bg-gray-100"
                >
                  <span
                    class="h-5 w-5"
                    :class="[item.icon]"
                  />
                  <span class="text-sm">{{ item.label }}</span>
                </RouterLink>
              </li>
            </ul>

            <div class="mt-2 border-t border-gray-100 pt-2"></div>
          </div>
        </template>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.fade-swap-enter-active,
.fade-swap-leave-active {
  transition:
    opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-swap-enter-from,
.fade-swap-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.fade-swap-enter-to,
.fade-swap-leave-from {
  opacity: 1;
  transform: scale(1);
}

.no-underline {
  text-decoration: none;
}
</style>
