import { createDiscreteApi } from 'naive-ui'

const { message, notification, dialog, loadingBar } = createDiscreteApi(
  ['message', 'dialog', 'notification', 'loadingBar'],
  {
    configProviderProps: {
      themeOverrides: {
        common: {
          borderRadius: '16px',
        },
      },
    },
  },
)

export { message, notification, dialog, loadingBar }
