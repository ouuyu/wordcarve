import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
  ],
  rules: [
    ['text-base-color', { color: 'var(--text-color)' }],
  ],
  preflights: [
    {
      getCSS: () => `
        :root {
          --text-color: #213547;
        }
        :root.dark {
          --text-color: rgba(255, 255, 255, 0.87);
        }
        body {
          color: var(--text-color);
        }
        .transition-theme {
          transition: all 0.3s ease-in-out;
          transition-property: color, background-color;
        }
      `,
    },
  ],
})
