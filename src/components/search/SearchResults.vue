<script setup lang="ts">
import { computed } from 'vue'
import { useSearchStore } from '@/stores/searchStore'
import { dictionaryManager } from '@/adapters/manager'
import { OnlineDictionaryRenderer } from '@/adapters/online/components'
import { LocalDictionaryRenderer } from '@/adapters/local/components'
import { CambridgeDictionaryRenderer } from '@/adapters/cambridge/components'
import type { DictionaryEntry } from '@/types'

const searchStore = useSearchStore()

// Computed
const currentResult = computed(() => {
  const result = searchStore.searchResults.get(searchStore.activeAdapter)
  console.log('SearchResults - currentResult:', {
    activeAdapter: searchStore.activeAdapter,
    result,
    hasResult: !!result,
    entriesCount: result?.entries?.length,
  })
  return result
})

const currentError = computed(() => searchStore.searchErrors.get(searchStore.activeAdapter))

const currentAdapter = computed(() => dictionaryManager.getAdapter(searchStore.activeAdapter))

const isLoading = computed(() => {
  const adapterName = searchStore.activeAdapter
  return (
    searchStore.searchingAdapters.has(adapterName) ||
    (searchStore.isSearching && !currentResult.value && !currentError.value)
  )
})

// Methods
const handleRetry = () => {
  if (searchStore.currentQuery) {
    searchStore.searchProgressive(searchStore.currentQuery)
  }
}

const handleWordClick = (word: DictionaryEntry) => {
  // Handle word click for local dictionary
  console.log('Word clicked:', word)
}

const handleExampleClick = (example: any) => {
  // Handle example click for local dictionary
  console.log('Example clicked:', example)
}
</script>

<template>
  <div class="search-results">
    <!-- Online Dictionary Renderer -->
    <OnlineDictionaryRenderer
      v-if="currentAdapter?.resultType === 'online' && currentAdapter?.name === 'online'"
      :result="currentResult"
      :error="currentError"
      :loading="isLoading"
      :query="searchStore.currentQuery"
      @retry="handleRetry"
    />

    <!-- Cambridge Dictionary Renderer -->
    <CambridgeDictionaryRenderer
      v-else-if="currentAdapter?.name === 'cambridge'"
      :result="currentResult"
      :error="currentError"
      :loading="isLoading"
      :query="searchStore.currentQuery"
      @retry="handleRetry"
    />

    <!-- Local Dictionary Renderer -->
    <LocalDictionaryRenderer
      v-else-if="currentAdapter?.resultType === 'local'"
      :result="currentResult"
      :error="currentError"
      :loading="isLoading"
      :query="searchStore.currentQuery"
      @retry="handleRetry"
      @word-click="handleWordClick"
      @example-click="handleExampleClick"
    />

    <!-- Fallback for unknown adapter types -->
    <div
      v-else
      class="fallback-container"
    >
      <div
        class="fallback-card rounded-xl border-0 shadow-lg bg-theme-1/60 backdrop-blur-xl p-8 text-center"
      >
        <div class="fallback-icon mb-4">
          <div class="i-carbon-unknown w-12 h-12 mx-auto text-theme-5" />
        </div>
        <h3 class="text-lg font-semibold text-theme-9 mb-2">未知的词典类型</h3>
        <p class="text-sm text-theme-7">当前选择的词典适配器类型不受支持</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-results {
  width: 100%;
  min-height: 400px;
}

.fallback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 20px;
}

.fallback-card {
  max-width: 400px;
  transition: all 0.3s ease;
}

.fallback-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
}

/* Dark mode support */
.dark .fallback-card {
  background: var(--theme-9) !important;
  opacity: 0.8 !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
}

.dark .fallback-card h3 {
  color: var(--theme-3) !important;
}

.dark .fallback-card p {
  color: var(--theme-4) !important;
}

/* Responsive design */
@media (max-width: 768px) {
  .fallback-container {
    padding: 16px;
    min-height: 300px;
  }

  .fallback-card {
    margin: 0 -8px;
    border-radius: 12px !important;
  }
}
</style>
