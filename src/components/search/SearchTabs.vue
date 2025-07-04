<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { NBadge, NIcon, NTooltip, NSpin } from 'naive-ui'
import { useSearchStore } from '@/stores/searchStore'
import { dictionaryManager } from '@/adapters/manager'
import SearchInput from './SearchInput.vue'

// Props
const props = defineProps<{
  searchQuery: string
  loading?: boolean
}>()

// Emits
const emit = defineEmits<{
  'update:searchQuery': [value: string]
  search: [query: string]
  clear: []
}>()

const searchStore = useSearchStore()
const availabilityStatus = ref<Map<string, boolean>>(new Map())
const checkingAvailability = ref(false)
const searchInputRef = ref<InstanceType<typeof SearchInput>>()

// Search methods
const handleSearch = (query?: string) => {
  const searchTerm = query || props.searchQuery.trim()
  if (searchTerm) {
    emit('search', searchTerm)
  }
}

const handleClear = () => {
  emit('clear')
}

const handleSearchInput = (value: string) => {
  emit('update:searchQuery', value)
}

const focusSearchInput = () => {
  searchInputRef.value?.focus()
}

// Computed
const adapters = computed(() => dictionaryManager.getAvailableAdapters())

const tabsWithStatus = computed(() =>
  adapters.value.map(adapter => ({
    ...adapter,
    available: availabilityStatus.value.get(adapter.name) ?? false,
    hasResults: searchStore.searchResults.has(adapter.name),
    hasError: searchStore.searchErrors.has(adapter.name),
    isSearching: searchStore.searchingAdapters.has(adapter.name),
    resultCount: searchStore.searchResults.get(adapter.name)?.entries.length ?? 0,
    status: searchStore.getAdapterStatus(adapter.name),
  })),
)

// Methods
const checkAvailability = async () => {
  checkingAvailability.value = true
  try {
    const status = await dictionaryManager.checkAvailability()
    availabilityStatus.value = status
  } catch (error) {
    console.error('Failed to check adapter availability:', error)
  } finally {
    checkingAvailability.value = false
  }
}

const handleTabChange = (value: string) => {
  searchStore.setActiveAdapter(value)

  if (searchStore.currentQuery && !searchStore.searchResults.has(value)) {
    searchStore.search(searchStore.currentQuery, value)
  }
}

const getTabIcon = (
  adapter: (typeof adapters.value)[0],
  status: (typeof tabsWithStatus.value)[0],
) => {
  if (status.hasError) return 'i-carbon-warning'
  if (!status.available) return 'i-carbon-offline'
  if (status.isSearching) return 'i-carbon-loading'
  return adapter.icon
}

const getTabIconColor = (status: (typeof tabsWithStatus.value)[0]) => {
  if (status.hasError) return '#ef4444' // red-500
  if (!status.available) return '#9ca3af' // gray-400
  if (status.isSearching) return '#3b82f6' // blue-500
  if (status.hasResults) return '#22c55e' // green-500
  return '#6b7280' // gray-500
}

const getStatusIndicatorColor = (status: (typeof tabsWithStatus.value)[0]) => {
  switch (status.status) {
    case 'searching':
      return '#3b82f6' // blue-500
    case 'success':
      return '#22c55e' // green-500
    case 'error':
      return '#ef4444' // red-500
    default:
      return '#d1d5db' // gray-300
  }
}

defineExpose({
  focus: focusSearchInput,
})

onMounted(() => {
  checkAvailability()
})
</script>

<template>
  <div class="w-full">
    <div
      class="bg-theme-1/70 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border-0 overflow-hidden"
    >
      <div class="p-4 sm:p-6 border-b border-theme-3/20">
        <div class="flex items-center gap-3 sm:gap-4">
          <SearchInput
            ref="searchInputRef"
            :model-value="searchQuery"
            :loading="loading"
            placeholder="输入英文单词，自动搜索所有词典..."
            class="flex-1"
            @update:model-value="handleSearchInput"
            @search="handleSearch"
            @clear="handleClear"
          />

          <div
            v-if="loading"
            class="flex items-center gap-2 text-theme-9 text-sm font-medium"
          >
            <NSpin size="small" />
            <span class="hidden sm:inline">搜索中...</span>
          </div>
        </div>
      </div>

      <div class="p-3 sm:p-4">
        <div
          class="flex gap-0.5 sm:gap-1 bg-theme-2/60 p-0.5 sm:p-1 rounded-lg sm:rounded-xl overflow-x-auto scrollbar-hide"
        >
          <div
            v-for="adapter in tabsWithStatus"
            :key="adapter.name"
            class="flex-1 flex items-center justify-center py-3 px-4 rounded-lg cursor-pointer relative transition-all duration-300 ease-out text-theme-7 hover:text-theme-9 hover:bg-theme-1/70 min-w-0"
            :class="{
              'bg-theme-1/80 text-theme-9 shadow-md border-0 font-medium':
                searchStore.activeAdapter === adapter.name,
              'bg-transparent': searchStore.activeAdapter !== adapter.name,
              // 统一 padding，不再单独为小屏幕设置更大的垂直 padding
              'py-3 px-4': true,
              // 移除 min-h-16，让内容自然撑开高度
              'sm:min-h-auto': true,
            }"
            @click="handleTabChange(adapter.name)"
          >
            <NTooltip>
              <template #trigger>
                <div class="flex items-center gap-2 sm:gap-3 relative w-full justify-center">
                  <div class="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <NSpin
                      v-if="checkingAvailability || adapter.isSearching"
                      size="small"
                    />
                    <NIcon
                      v-else
                      :class="getTabIcon(adapter, adapter)"
                      :style="{
                        color:
                          searchStore.activeAdapter === adapter.name
                            ? '#1f2937'
                            : getTabIconColor(adapter),
                      }"
                      class="text-lg sm:text-lg transition-colors duration-300 ease-out"
                    />
                  </div>

                  <span
                    class="font-medium text-sm whitespace-nowrap truncate flex-shrink min-w-0 sm:text-sm text-xs"
                    >{{ adapter.displayName }}</span
                  >

                  <div
                    v-if="adapter.status !== 'idle'"
                    class="w-2 h-2 rounded-full transition-all duration-300 ease-out shadow-sm flex-shrink-0"
                    :style="{ backgroundColor: getStatusIndicatorColor(adapter) }"
                  />
                </div>
              </template>

              <div class="max-w-60 text-sm">
                <div class="font-semibold mb-2 text-base">
                  {{ adapter.displayName }}
                </div>
                <div class="mb-1.5">
                  <span>连接状态:</span>
                  <span
                    :class="adapter.available ? 'text-green-600' : 'text-red-500'"
                    class="font-medium ml-1"
                  >
                    {{ adapter.available ? '在线' : '离线' }}
                  </span>
                </div>
                <div class="mb-1.5">
                  <span>搜索状态:</span>
                  <span
                    :class="{
                      'text-blue-600': adapter.status === 'searching',
                      'text-green-600': adapter.status === 'success',
                      'text-red-500': adapter.status === 'error',
                      'text-gray-400': adapter.status === 'idle',
                    }"
                    class="font-medium ml-1"
                  >
                    {{
                      adapter.status === 'searching'
                        ? '搜索中...'
                        : adapter.status === 'success'
                          ? '搜索成功'
                          : adapter.status === 'error'
                            ? '搜索失败'
                            : '待搜索'
                    }}
                  </span>
                </div>
                <div
                  v-if="adapter.hasError"
                  class="text-red-500 text-xs"
                >
                  {{ searchStore.searchErrors.get(adapter.name) }}
                </div>
              </div>
            </NTooltip>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <slot :name="searchStore.activeAdapter"></slot>
    </div>
  </div>
</template>

<style scoped>
/* 隐藏滚动条但保持滚动功能 */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

@media (max-width: 640px) {
  /* 在小屏幕上，tab 选项的最小宽度调整为 70px，flex 属性改为 0 0 auto */
  .flex-1 {
    min-width: 70px; /* 调整为更小的最小宽度 */
    flex: 0 0 auto;
  }

  .overflow-x-auto {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }

  .cursor-pointer {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  .cursor-pointer:active {
    transform: scale(0.98);
  }

  /* 在小屏幕上，文本最大宽度调整为 50px */
  .truncate {
    max-width: 50px; /* 调整为更小的最大宽度 */
  }

  .w-2.h-2 {
    margin-left: 2px;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .flex-1 {
    min-width: 100px;
  }
}
</style>
