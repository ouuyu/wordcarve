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
  if (status.isSearching) return '#3b82f6' // blue-500，搜索中仍用蓝色表示活跃
  if (status.hasResults) return '#22c55e' // green-500
  return '#6b7280' // gray-500 默认颜色
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
      class="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg ring-1 ring-gray-200/50 overflow-hidden"
    >
      <div class="p-6 border-b border-gray-100/80">
        <div class="flex items-center gap-4">
          <SearchInput
            ref="searchInputRef"
            :model-value="searchQuery"
            :loading="loading"
            placeholder="输入英文单词，自动搜索所有词典..."
            class="flex-1 text-lg"
            @update:model-value="handleSearchInput"
            @search="handleSearch"
            @clear="handleClear"
          />

          <div
            v-if="loading"
            class="flex items-center gap-2 text-theme-9 text-sm font-medium"
          >
            <NSpin size="small" />
            <span>搜索中...</span>
          </div>
        </div>
      </div>

      <!-- 标签页区域 -->
      <div class="p-4">
        <div class="flex gap-1 bg-gray-50/80 p-1 rounded-xl">
          <div
            v-for="adapter in tabsWithStatus"
            :key="adapter.name"
            class="flex-1 flex items-center justify-center py-3 px-4 rounded-lg cursor-pointer relative transition-all duration-300 ease-out text-gray-600 hover:text-gray-800 hover:bg-white/60"
            :class="{
              'bg-white text-gray-900 shadow-md ring-1 ring-white/50 font-medium':
                searchStore.activeAdapter === adapter.name,
              'bg-transparent': searchStore.activeAdapter !== adapter.name,
            }"
            @click="handleTabChange(adapter.name)"
          >
            <NTooltip>
              <template #trigger>
                <div class="flex items-center gap-3 relative">
                  <div class="w-5 h-5 flex items-center justify-center">
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
                      class="text-lg transition-colors duration-300 ease-out"
                    />
                  </div>

                  <span class="font-medium text-sm whitespace-nowrap">{{
                    adapter.displayName
                  }}</span>

                  <div
                    v-if="adapter.status !== 'idle'"
                    class="w-2.5 h-2.5 rounded-full transition-all duration-300 ease-out shadow-sm"
                    :style="{ backgroundColor: getStatusIndicatorColor(adapter) }"
                  />

                  <div
                    v-if="!adapter.available"
                    class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"
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

    <!-- 结果显示区域 -->
    <div class="mt-6">
      <slot :name="searchStore.activeAdapter"></slot>
    </div>
  </div>
</template>
