import transformerDirectives from '@unocss/transformer-directives'
import { defineConfig, presetUno } from 'unocss'
import presetIcons from '@unocss/preset-icons'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
        'svg-spinners': () => import('@iconify-json/svg-spinners/icons.json').then(i => i.default),
      },
      scale: 1.2,
      warn: true,
    }),
  ],
  shortcuts: [
    {
      'link': 'text-arcoblue-9 hover:text-arcoblue-6 transition-colors no-underline',
      
      'btn': 'px-4 py-2 rounded-sm inline-flex items-center justify-center gap-1 transition-colors focus:outline-none cursor-pointer',
      
      'btn-xs': 'px-2 py-0.5 text-xs rounded-sm',
      'btn-sm': 'px-3 py-1 text-sm rounded-sm', 
      'btn-md': 'px-4 py-2 text-base rounded-sm',
      'btn-lg': 'px-5 py-2.5 text-lg rounded-md',
      
      'btn-primary': 'bg-arcoblue-6 text-white hover:bg-arcoblue-5 active:bg-arcoblue-7',
      'btn-outline': 'border border-arcoblue-6 text-arcoblue-6 hover:bg-arcoblue-1 active:bg-arcoblue-2',
      'btn-text': 'text-arcoblue-6 hover:text-arcoblue-5 active:text-arcoblue-7 hover:bg-arcoblue-1',
      
      'btn-disabled': 'opacity-60 cursor-not-allowed pointer-events-none',
      'btn-danger': 'bg-red-500 text-white hover:bg-red-400 active:bg-red-600',
      'btn-danger-outline': 'border border-red-500 text-red-500 hover:bg-red-50 active:bg-red-100',
      
      'icon': 'inline-flex items-center justify-center',
      'icon-sm': 'w-4 h-4',
      'icon-md': 'w-5 h-5',
      'icon-lg': 'w-6 h-6',
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
