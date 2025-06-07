import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DictionarySearchResult, SearchHistory, SearchSuggestion } from '@/types/dictionary'
import { dictionaryManager } from '@/adapters/manager'

export const useSearchStore = defineStore('search', () => {
  // State
  const currentQuery = ref('')
  const searchResults = ref<Map<string, DictionarySearchResult<any>>>(new Map())
  const searchHistory = ref<SearchHistory[]>([])
  const searchSuggestions = ref<SearchSuggestion[]>([])
  const isSearching = ref(false)
  const activeAdapter = ref('online')
  const searchErrors = ref<Map<string, string>>(new Map())
  const searchingAdapters = ref<Set<string>>(new Set()) // 正在搜索的适配器
  const hasFirstResult = ref(false) // 是否已有第一个结果

  // Computed
  const hasResults = computed(() => searchResults.value.size > 0)
  const currentResults = computed(() => searchResults.value.get(activeAdapter.value))
  const recentSearches = computed(() =>
    searchHistory.value
      .slice(-10)
      .reverse()
      .map(h => h.query),
  )

  // 获取适配器的搜索状态
  const getAdapterStatus = computed(() => (adapterName: string) => {
    if (searchingAdapters.value.has(adapterName)) {
      return 'searching'
    }
    if (searchErrors.value.has(adapterName)) {
      return 'error'
    }
    if (searchResults.value.has(adapterName)) {
      return 'success'
    }
    return 'idle'
  })

  // Actions
  const setCurrentQuery = (query: string) => {
    currentQuery.value = query
  }

  const setActiveAdapter = (adapter: string) => {
    activeAdapter.value = adapter
  }

  const addToHistory = (query: string, resultsCount: number) => {
    const existingIndex = searchHistory.value.findIndex(h => h.query === query)
    if (existingIndex !== -1) {
      searchHistory.value.splice(existingIndex, 1)
    }

    searchHistory.value.push({
      query,
      timestamp: Date.now(),
      results: resultsCount,
    })

    // Keep only last 50 searches
    if (searchHistory.value.length > 50) {
      searchHistory.value = searchHistory.value.slice(-50)
    }

    // Save to localStorage
    localStorage.setItem('wordcarve-search-history', JSON.stringify(searchHistory.value))
  }

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('wordcarve-search-history')
      if (saved) {
        searchHistory.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load search history:', error)
    }
  }

  const clearHistory = () => {
    searchHistory.value = []
    localStorage.removeItem('wordcarve-search-history')
  }

  const search = async (query: string, adapter?: string) => {
    if (!query.trim()) return

    const trimmedQuery = query.trim()
    const targetAdapter = adapter || activeAdapter.value

    isSearching.value = true
    searchErrors.value.delete(targetAdapter)

    try {
      const result = await dictionaryManager.search(trimmedQuery, targetAdapter)
      searchResults.value.set(targetAdapter, result)

      // Add to history
      addToHistory(trimmedQuery, result.entries.length)

      // Update current query
      setCurrentQuery(trimmedQuery)
    } catch (error) {
      console.error(`Search failed for adapter ${targetAdapter}:`, error)
      searchErrors.value.set(
        targetAdapter,
        error instanceof Error ? error.message : 'Search failed',
      )
    } finally {
      isSearching.value = false
    }
  }

  const searchMultiple = async (query: string, adapters?: string[]) => {
    if (!query.trim()) return

    const trimmedQuery = query.trim()
    isSearching.value = true
    searchErrors.value.clear()

    try {
      const results = await dictionaryManager.searchMultiple(trimmedQuery, adapters)

      let totalResults = 0
      for (const [adapterName, result] of results.entries()) {
        if (result instanceof Error) {
          searchErrors.value.set(adapterName, result.message)
        } else {
          searchResults.value.set(adapterName, result)
          totalResults += result.entries.length
        }
      }

      // Add to history
      addToHistory(trimmedQuery, totalResults)

      // Update current query
      setCurrentQuery(trimmedQuery)
    } catch (error) {
      console.error('Multiple search failed:', error)
    } finally {
      isSearching.value = false
    }
  }

  const clearResults = () => {
    searchResults.value.clear()
    searchErrors.value.clear()
    searchingAdapters.value.clear()
    hasFirstResult.value = false
    currentQuery.value = ''
  }

  // 新的渐进式搜索方法
  const searchProgressive = async (query: string, adapters?: string[]) => {
    if (!query.trim()) return

    const trimmedQuery = query.trim()

    // 清理之前的状态
    searchResults.value.clear()
    searchErrors.value.clear()
    searchingAdapters.value.clear()
    hasFirstResult.value = false

    // 设置搜索状态
    isSearching.value = true
    setCurrentQuery(trimmedQuery)

    // 获取要搜索的适配器
    const adaptersToSearch = adapters || dictionaryManager.getAvailableAdapters().map(a => a.name)

    // 标记所有适配器为搜索中
    adaptersToSearch.forEach(name => searchingAdapters.value.add(name))

    try {
      await dictionaryManager.searchMultipleProgressive(
        trimmedQuery,
        (adapterName: string, result: DictionarySearchResult<any> | Error) => {
          // 移除搜索中状态
          searchingAdapters.value.delete(adapterName)

          if (result instanceof Error) {
            searchErrors.value.set(adapterName, result.message)
          } else {
            searchResults.value.set(adapterName, result)

            // 如果这是第一个成功的结果，切换到该适配器
            if (!hasFirstResult.value) {
              hasFirstResult.value = true
              setActiveAdapter(adapterName)
            }
          }
        },
        adaptersToSearch,
      )

      // 计算总结果数用于历史记录
      let totalResults = 0
      for (const result of searchResults.value.values()) {
        totalResults += result.entries.length
      }

      // 添加到历史记录
      addToHistory(trimmedQuery, totalResults)
    } catch (error) {
      console.error('Progressive search failed:', error)
    } finally {
      isSearching.value = false
      searchingAdapters.value.clear()
    }
  }

  const generateSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      searchSuggestions.value = []
      return
    }

    // Simple suggestion logic - can be enhanced with more sophisticated algorithms
    const suggestions: SearchSuggestion[] = []

    // Add from search history
    const historySuggestions = searchHistory.value
      .filter(h => h.query.toLowerCase().includes(query.toLowerCase()))
      .slice(-5)
      .map(h => ({
        word: h.query,
        source: 'history',
      }))

    suggestions.push(...historySuggestions)
    searchSuggestions.value = suggestions
  }

  // Initialize
  loadHistory()

  return {
    // State
    currentQuery,
    searchResults,
    searchHistory,
    searchSuggestions,
    isSearching,
    activeAdapter,
    searchErrors,
    searchingAdapters,
    hasFirstResult,

    // Computed
    hasResults,
    currentResults,
    recentSearches,
    getAdapterStatus,

    // Actions
    setCurrentQuery,
    setActiveAdapter,
    addToHistory,
    loadHistory,
    clearHistory,
    search,
    searchMultiple,
    searchProgressive,
    clearResults,
    generateSuggestions,
  }
})
