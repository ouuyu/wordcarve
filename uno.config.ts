import transformerDirectives from '@unocss/transformer-directives'
import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
  ],
  shortcuts: [
    {
      link: 'text-arcoblue-9 hover:text-arcoblue-6 transition-colors no-underline',
    },
  ],
  transformers: [
    transformerDirectives(),
  ],
  theme: {
    colors: {
      arcoblue: {
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
    },
    borderRadius: {
      none: '2px',
      sm: '4px',
      md: '8px',
      lg: '16px',
      full: '9999px',
    },
  },
})
