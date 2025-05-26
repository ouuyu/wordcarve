import presetIcons from '@unocss/preset-icons'
import transformerDirectives from '@unocss/transformer-directives'
import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      collections: {
        'carbon': () => import('@iconify-json/carbon/icons.json').then(i => i.default),
        'svg-spinners': () => import('@iconify-json/svg-spinners/icons.json').then(i => i.default),
      },
      scale: 1.2,
      warn: true,
    }),
  ],
  shortcuts: [
    {
      'link': 'text-theme-9 hover:text-theme-6 transition-colors no-underline',

      'btn': 'px-4 py-2 rounded-sm inline-flex items-center justify-center gap-1 transition-colors focus:outline-none cursor-pointer',

      'btn-xs': 'px-2 py-0.5 text-xs rounded-sm',
      'btn-sm': 'px-3 py-1 text-sm rounded-sm',
      'btn-md': 'px-4 py-2 text-base rounded-sm',
      'btn-lg': 'px-5 py-2.5 text-lg rounded-md',

      'btn-primary': 'bg-theme-6 text-white hover:bg-theme-5 active:bg-theme-7',
      'btn-outline': 'border border-theme-6 text-theme-6 hover:bg-theme-1 active:bg-theme-2',
      'btn-text': 'text-theme-6 hover:text-theme-5 active:text-theme-7 hover:bg-theme-1',

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
    borderRadius: {
      none: '2px',
      sm: '4px',
      md: '8px',
      lg: '16px',
      full: '9999px',
    },
  },
})
