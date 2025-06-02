// 导出Naive UI组件的封装
export { default as NaiveProvider } from './NaiveProvider.vue'
export { default as NThemeConfig } from './NThemeConfig.vue'

// 重新导出常用的Naive UI组件
export {
  // 布局组件
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutSider,
  NLayoutFooter,
  NSpace,
  NGrid,
  NGridItem,

  // 基础组件
  NButton,
  NInput,
  NInputGroup,
  NInputNumber,
  NSelect,
  NRadio,
  NRadioGroup,
  NCheckbox,
  NCheckboxGroup,
  NSwitch,

  // 数据展示
  NCard,
  NList,
  NListItem,
  NTable,
  NPagination,
  NEmpty,
  NSpin,
  NTag,
  NBadge,

  // 反馈组件
  NModal,
  NDrawer,
  NPopover,
  NTooltip,
  NAlert,
  NDialog,
  NProgress,
  NSkeleton,

  // 导航组件
  NMenu,
  NTabs,
  NTabPane,
  NBreadcrumb,
  NBreadcrumbItem,
  NDropdown,

  // 其他
  NIcon,
  NDivider,
  NAvatar,
  NConfigProvider,
  NScrollbar,
  NForm,
  NFormItem,
} from 'naive-ui'

// 导出消息和通知API
export { useMessage, useNotification, useDialog, useLoadingBar } from 'naive-ui'
