<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NBackTop } from 'naive-ui'
import { Message } from '@/utils/message'
import { useSearchStore } from '@/stores/searchStore'
import SearchTabs from '@/components/search/SearchTabs.vue'
import SearchResults from '@/components/search/SearchResults.vue'

const route = useRoute()
const router = useRouter()
const searchStore = useSearchStore()
const searchTabsRef = ref<InstanceType<typeof SearchTabs>>()

// Reactive state
const searchQuery = ref('')

// Methods - Define functions before using them in watchers
const updateUrlQuery = (query: string) => {
  router.replace({ query: { q: query } }).catch(() => {})
}

const handleSearch = async (query?: string) => {
  const searchTerm = query || searchQuery.value.trim()

  if (!searchTerm) {
    Message.warning('请输入要查询的单词')
    return
  }

  // Update URL
  updateUrlQuery(searchTerm)

  // Perform progressive search in all dictionaries
  try {
    await searchStore.searchProgressive(searchTerm)
  } catch (error) {
    console.error('Search failed:', error)
    Message.error('搜索失败，请稍后重试')
  }
}

// Watch route changes - 监听URL参数变化
watch(
  () => route.query.q,
  newQuery => {
    const queryString = newQuery && typeof newQuery === 'string' ? newQuery : ''
    if (queryString !== searchQuery.value) {
      searchQuery.value = queryString
      searchStore.setCurrentQuery(queryString)
      // 如果有查询参数但没有结果，触发搜索
      if (queryString && !searchStore.hasResults) {
        handleSearch(queryString)
      }
    }
  },
  { immediate: true },
)

// Watch search input changes - 监听搜索框输入变化，实时更新URL
watch(searchQuery, newQuery => {
  // 实时更新URL参数，实现真正的双向绑定
  const currentUrlQuery = (route.query.q as string) || ''
  if (newQuery !== currentUrlQuery) {
    updateUrlQuery(newQuery)
  }
  // 同步到store
  if (newQuery !== searchStore.currentQuery) {
    searchStore.setCurrentQuery(newQuery)
  }
})

// Watch search store current query
watch(
  () => searchStore.currentQuery,
  newQuery => {
    if (newQuery !== searchQuery.value) {
      searchQuery.value = newQuery
    }
  },
)

const handleClear = () => {
  searchQuery.value = ''
  searchStore.clearResults()
  router.replace({ query: {} }).catch(() => {})
}

const focusSearchInput = () => {
  searchTabsRef.value?.focus()
}

// Lifecycle
onMounted(() => {
  nextTick(() => {
    focusSearchInput()
  })

  // If we have a query from URL, trigger search
  if (searchQuery.value && !searchStore.hasResults) {
    handleSearch(searchQuery.value)
  }
})
</script>

<template>
  <div class="relative z-5 p-4 sm:p-6 min-h-screen">
    <div class="max-w-1200px mx-auto flex flex-col gap-1">
      <div class="animate-slideInDown">
        <SearchTabs
          ref="searchTabsRef"
          :search-query="searchQuery"
          :loading="searchStore.isSearching"
          @update:search-query="searchQuery = $event"
          @search="handleSearch"
          @clear="handleClear"
        />
      </div>

      <div
        v-if="searchStore.currentQuery"
        class="animate-slideInUp animate-delay-100 animate-both"
      >
        <SearchResults />
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4"
      >
        <div class="w-16 h-16 sm:w-24 sm:h-24 mb-4 sm:mb-6 text-gray-300">
          <div class="i-carbon-search w-full h-full"></div>
        </div>
        <h3 class="text-lg sm:text-xl font-semibold text-gray-600 mb-2">开始搜索单词</h3>
        <p class="text-sm sm:text-base text-gray-500 max-w-md">
          在上方搜索框中输入英文单词，将在所有可用词典中进行搜索
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 动画效果 */
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-subtle {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.005);
    opacity: 0.98;
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle 1.5s infinite ease-in-out;
}

@keyframes search-progress {
  0% {
    transform: scaleX(0);
  }
  50% {
    transform: scaleX(0.7);
  }
  100% {
    transform: scaleX(1);
  }
}

.animate-search-progress {
  animation: search-progress 1.5s infinite linear;
}
</style>
