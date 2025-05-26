<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

// 定义主题类型
type ThemeMode = 'light' | 'dark' | 'system'

// 主题变量
interface ThemeColors {
  primary: string
  danger: string
}

const props = defineProps({
  // 是否显示主题切换按钮
  showThemeToggle: {
    type: Boolean,
    default: true,
  },
  // 是否显示颜色配置
  showColorConfig: {
    type: Boolean,
    default: false,
  },
})

// 当前主题模式
const themeMode = ref<ThemeMode>(getInitialThemeMode())
// 主题颜色
const themeColors = ref<ThemeColors>({
  primary: getCssVariable('--color-primary') || '#4c8bf5',
  danger: getCssVariable('--color-danger') || '#f56c6c',
})

// 监听主题切换
watch(themeMode, (mode) => {
  applyThemeMode(mode)
  localStorage.setItem('theme-mode', mode)
})

// 监听颜色变化
watch(themeColors, (colors) => {
  applyThemeColors(colors)
  localStorage.setItem('theme-colors', JSON.stringify(colors))
}, { deep: true })

// 初始化主题
onMounted(() => {
  // 应用保存的主题颜色（如果有）
  const savedColors = localStorage.getItem('theme-colors')
  if (savedColors) {
    try {
      const colors = JSON.parse(savedColors)
      themeColors.value = {
        ...themeColors.value,
        ...colors,
      }
      applyThemeColors(themeColors.value)
    }
    catch (e) {
      console.error('无法解析保存的主题颜色', e)
    }
  }

  // 应用主题模式
  applyThemeMode(themeMode.value)

  // 如果是系统主题，添加媒体查询监听
  if (themeMode.value === 'system') {
    const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      applyDarkMode(e.matches)
    }

    darkMediaQuery.addEventListener('change', handleChange)
  }
})

// 获取初始主题模式
function getInitialThemeMode(): ThemeMode {
  const savedMode = localStorage.getItem('theme-mode') as ThemeMode
  if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
    return savedMode
  }
  return 'system'
}

// 应用主题模式
function applyThemeMode(mode: ThemeMode) {
  if (mode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    applyDarkMode(prefersDark)
  }
  else {
    applyDarkMode(mode === 'dark')
  }
}

// 应用深色模式
function applyDarkMode(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add('dark-theme')
  }
  else {
    document.documentElement.classList.remove('dark-theme')
  }
}

// 应用主题颜色
function applyThemeColors(colors: ThemeColors) {
  // 设置主色调及其变体
  setCssVariable('--color-primary', colors.primary)
  setCssVariable('--color-primary-hover', adjustColor(colors.primary, 10))
  setCssVariable('--color-primary-active', adjustColor(colors.primary, -10))
  setCssVariable('--color-primary-light', `${colors.primary}18`) // 0.08 透明度
  setCssVariable('--color-primary-lighter', `${colors.primary}0D`) // 0.05 透明度

  // 设置危险色及其变体
  setCssVariable('--color-danger', colors.danger)
  setCssVariable('--color-danger-hover', adjustColor(colors.danger, 10))
  setCssVariable('--color-danger-active', adjustColor(colors.danger, -10))
  setCssVariable('--color-danger-light', `${colors.danger}18`) // 0.08 透明度
}

// 切换主题模式
function toggleTheme() {
  if (themeMode.value === 'light') {
    themeMode.value = 'dark'
  }
  else if (themeMode.value === 'dark') {
    themeMode.value = 'system'
  }
  else {
    themeMode.value = 'light'
  }
}

// 获取CSS变量值
function getCssVariable(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

// 设置CSS变量
function setCssVariable(name: string, value: string) {
  document.documentElement.style.setProperty(name, value)
}

// 调整颜色亮度
function adjustColor(hex: string, amount: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result)
    return hex

  let r = Number.parseInt(result[1], 16)
  let g = Number.parseInt(result[2], 16)
  let b = Number.parseInt(result[3], 16)

  r = Math.max(0, Math.min(255, r + amount))
  g = Math.max(0, Math.min(255, g + amount))
  b = Math.max(0, Math.min(255, b + amount))

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
</script>

<template>
  <div class="theme-config">
    <!-- 主题切换按钮 -->
    <div v-if="props.showThemeToggle" class="theme-toggle" @click="toggleTheme">
      <span v-if="themeMode === 'light'" class="i-carbon:sun h-5 w-5" />
      <span v-else-if="themeMode === 'dark'" class="i-carbon:moon h-5 w-5" />
      <span v-else class="i-carbon:screen h-5 w-5" />
    </div>

    <!-- 颜色配置 -->
    <div v-if="props.showColorConfig" class="color-config">
      <div class="color-item">
        <label>主色调</label>
        <input v-model="themeColors.primary" type="color">
      </div>
      <div class="color-item">
        <label>危险色</label>
        <input v-model="themeColors.danger" type="color">
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-config {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.theme-toggle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--color-bg-light);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--transition-all);
    box-shadow: var(--shadow-light);
    color: var(--color-text-regular);
}

.theme-toggle:hover {
    background-color: var(--color-bg-lighter);
    transform: translateY(-2px);
    box-shadow: var(--shadow-base);
    color: var(--color-text-primary);
}

.color-config {
    background-color: var(--color-bg-light);
    border-radius: var(--border-radius-base);
    padding: 12px;
    box-shadow: var(--shadow-light);
}

.color-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.color-item label {
    color: var(--color-text-regular);
    font-size: 0.875rem;
}

.color-item input[type="color"] {
    width: 32px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: 4px;
    overflow: hidden;
    background-color: transparent;
    cursor: pointer;
}
</style>
