import { computed, ref, watch } from 'vue'
import { darkTheme, lightTheme } from 'naive-ui'
import { useThemeStore } from '../stores/themeStore'
import type { GlobalThemeOverrides } from 'naive-ui'

// 主题模式类型
export type ThemeMode = 'light' | 'dark' | 'system'

export function useTheme() {
  // 获取主题存储
  const themeStore = useThemeStore()

  // 当前主题模式
  const themeMode = ref<ThemeMode>(getInitialThemeMode())

  // 计算当前是否为暗色模式
  const isDarkMode = computed(() => {
    if (themeMode.value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return themeMode.value === 'dark'
  })

  // 计算naive-ui主题
  const naiveTheme = computed(() => {
    return isDarkMode.value ? darkTheme : lightTheme
  })

  // 计算主题覆盖
  const themeOverrides = computed<GlobalThemeOverrides>(() => {
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

  // 监听主题模式变化
  watch(themeMode, mode => {
    applyThemeMode(mode)
    localStorage.setItem('theme-mode', mode)
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
    } else {
      applyDarkMode(mode === 'dark')
    }
  }

  // 应用深色模式
  function applyDarkMode(isDark: boolean) {
    if (isDark) {
      document.documentElement.classList.add('dark-theme')
    } else {
      document.documentElement.classList.remove('dark-theme')
    }
  }

  // 切换主题模式
  function toggleThemeMode() {
    if (themeMode.value === 'light') {
      themeMode.value = 'dark'
    } else if (themeMode.value === 'dark') {
      themeMode.value = 'system'
    } else {
      themeMode.value = 'light'
    }
  }

  // 初始化主题
  function initTheme() {
    applyThemeMode(themeMode.value)

    // 如果是系统主题，添加媒体查询监听
    if (themeMode.value === 'system') {
      const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      const handleChange = (e: MediaQueryListEvent) => {
        applyDarkMode(e.matches)
      }

      darkMediaQuery.addEventListener('change', handleChange)
    }
  }

  return {
    themeMode,
    isDarkMode,
    naiveTheme,
    themeOverrides,
    toggleThemeMode,
    initTheme,
  }
}
