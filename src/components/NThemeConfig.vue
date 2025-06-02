<script setup lang="ts">
import { computed, ref, h } from 'vue'
import { NButton, NDropdown, NIcon, NSpace, NTooltip } from 'naive-ui'
import { useTheme } from '@/composables/useTheme'
import { useThemeStore } from '@/stores/themeStore'

// 引入主题相关功能
const { themeMode, toggleThemeMode } = useTheme()
const themeStore = useThemeStore()

// 主题选择下拉菜单选项
const themeOptions = ref(
  themeStore.availableThemes.map(theme => ({
    key: theme.value,
    label: theme.label,
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      },
    },
    icon() {
      return h('div', {
        style: {
          width: '16px',
          height: '16px',
          borderRadius: '4px',
          backgroundColor: theme.color,
        },
      })
    },
  })),
)

// 处理主题选择
function handleThemeSelect(key: string) {
  themeStore.setTheme(key as any)
}

// 主题模式图标
const themeModeIcon = computed(() => {
  switch (themeMode.value) {
    case 'light':
      return 'i-carbon:sun'
    case 'dark':
      return 'i-carbon:moon'
    default:
      return 'i-carbon:screen'
  }
})
</script>

<template>
  <div class="theme-config">
    <NSpace>
      <!-- 主题模式切换 -->
      <NTooltip placement="bottom">
        <template #trigger>
          <NButton
            quaternary
            circle
            @click="toggleThemeMode"
          >
            <div :class="[themeModeIcon, 'text-20px']"></div>
          </NButton>
        </template>
        {{ themeMode === 'light' ? '明亮模式' : themeMode === 'dark' ? '暗黑模式' : '跟随系统' }}
      </NTooltip>

      <!-- 主题色彩选择 -->
      <NDropdown
        trigger="click"
        :options="themeOptions"
        @select="handleThemeSelect"
      >
        <NTooltip placement="bottom">
          <template #trigger>
            <NButton
              quaternary
              circle
            >
              <div
                class="color-circle"
                :style="{ backgroundColor: themeStore.getCurrentThemeColors()[6] }"
              ></div>
            </NButton>
          </template>
          主题色彩
        </NTooltip>
      </NDropdown>
    </NSpace>
  </div>
</template>

<style scoped>
.theme-config {
  display: flex;
  align-items: center;
}

.color-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}
</style>
