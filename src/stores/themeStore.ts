import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export type ThemeType = 'default' | 'blue' | 'green' | 'purple'

// 颜色配置
const themeColors = {
  default: {
    1: '#f8f5e6', // 浅色/白底悬浮
    2: '#f0ead6', // 文字禁用
    3: '#e1d5c1', // 一般禁用
    4: '#d1c0a5', // 特殊场景
    5: '#c9ad8a', // 悬浮（hover）
    6: '#a87c4f', // 常规（主色）
    7: '#876239', // 点击（click）
    8: '#664b2c',
    9: '#543a3a', // 文本主色
    10: '#42332d',
  },
  blue: {
    1: '#f0f7ff',
    2: '#e0f0ff',
    3: '#c6e2ff',
    4: '#a3d0ff',
    5: '#79bbff',
    6: '#4098ff',
    7: '#2a7cd8',
    8: '#1c5eb3',
    9: '#164c8c',
    10: '#0d3b6d',
  },
  green: {
    1: '#f0fff7',
    2: '#dffcee',
    3: '#c3f8de',
    4: '#a0f0c9',
    5: '#7de8b3',
    6: '#4cd98c',
    7: '#36b971',
    8: '#259a59',
    9: '#1a7a45',
    10: '#0f5c32',
  },
  purple: {
    1: '#f7f0ff',
    2: '#efe0ff',
    3: '#e2c6ff',
    4: '#d0a3ff',
    5: '#bb79ff',
    6: '#9840ff',
    7: '#7c2ad8',
    8: '#5e1cb3',
    9: '#4c168c',
    10: '#3b0d6d',
  },
}

export const useThemeStore = defineStore('theme', () => {
  // 主题名称映射
  const themeNames: Record<ThemeType, string> = {
    default: '暖阳棕',
    blue: '海天蓝',
    green: '原野绿',
    purple: '幻梦紫',
  }

  // 当前主题
  const currentTheme = ref<ThemeType>('default')

  // 获取所有可用主题
  const availableThemes = computed(() => {
    return Object.keys(themeNames).map(key => ({
      value: key as ThemeType,
      label: themeNames[key as ThemeType],
      color: themeColors[key as ThemeType][6], // 使用主色作为示例色
    }))
  })

  // 应用主题到 CSS 变量
  function applyTheme(theme: ThemeType) {
    const colors = themeColors[theme]
    const root = document.documentElement

    for (let i = 1; i <= 10; i++) {
      root.style.setProperty(`--theme-${i}`, colors[i as keyof typeof colors])
    }
  }

  // 切换主题
  function setTheme(theme: ThemeType) {
    currentTheme.value = theme
    localStorage.setItem('wordcarve-theme', theme)
    applyTheme(theme)
  }

  // 初始化主题
  function initTheme() {
    const savedTheme = localStorage.getItem('wordcarve-theme') as ThemeType | null
    if (savedTheme && themeColors[savedTheme]) {
      currentTheme.value = savedTheme
    }
    applyTheme(currentTheme.value)
  }

  // 监听主题变化
  watch(
    currentTheme,
    newTheme => {
      applyTheme(newTheme)
    },
    { immediate: true },
  )

  return {
    currentTheme,
    availableThemes,
    setTheme,
    initTheme,
  }
})
