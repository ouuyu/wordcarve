import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS({}),
  ],
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'arcoblue-1': '#f8f5e6', // 浅色/白底悬浮
          'arcoblue-2': '#f0ead6', // 文字禁用
          'arcoblue-3': '#e1d5c1', // 一般禁用
          'arcoblue-4': '#d1c0a5', // 特殊场景
          'arcoblue-5': '#c9ad8a', // 悬浮（hover）
          'arcoblue-6': '#a87c4f', // 常规（主色）
          'arcoblue-7': '#876239', // 点击（click）
          'arcoblue-8': '#664b2c',
          'arcoblue-9': '#543a3a', // 文本主色
          'arcoblue-10': '#42332d',
          '--border-radius-none': '2px',
          '--border-radius-small': '4px',
          '--border-radius-medium': '8px',
          '--border-radius-large': '16px',
          '--border-radius-full': '9999px',
        },
        javascriptEnabled: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
