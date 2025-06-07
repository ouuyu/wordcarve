import { BaseDictionaryAdapter } from './base'
import type { DictionarySearchResult } from '@/types/dictionary'
import type { DictionaryEntry } from '@/types'
import { useDictionaryStore } from '@/stores/dictionaryStore'

/**
 * Local dictionary adapter using IndexedDB
 */
export class LocalDictionaryAdapter extends BaseDictionaryAdapter<DictionaryEntry> {
  name = 'local'
  displayName = '本地词典'
  icon = 'i-carbon-data-base'
  resultType = 'local' as const

  private dictionaryStore = useDictionaryStore()

  async search(query: string): Promise<DictionarySearchResult<DictionaryEntry>> {
    console.log('LocalDictionaryAdapter - search called with query:', query)

    if (!this.validateQuery(query)) {
      throw new Error('Invalid search query')
    }

    // Check cache first
    const cached = this.getCachedResult(query)
    if (cached) {
      console.log('LocalDictionaryAdapter - returning cached result:', cached)
      return cached
    }

    try {
      // Ensure dictionary is loaded
      if (!this.dictionaryStore.isLoaded) {
        console.log('LocalDictionaryAdapter - dictionary not loaded, loading...')
        await this.dictionaryStore.loadDictionary()
      }

      console.log(
        'LocalDictionaryAdapter - dictionary loaded, entries count:',
        this.dictionaryStore.dictionary.length,
      )

      const localEntry = this.dictionaryStore.getWordByName(query.trim())
      console.log('LocalDictionaryAdapter - found entry:', localEntry)

      const entries: DictionaryEntry[] = []

      if (localEntry) {
        entries.push(localEntry)
      }

      const result: DictionarySearchResult<DictionaryEntry> = {
        entries,
        source: this.name,
        timestamp: Date.now(),
        cached: false,
        resultType: this.resultType,
      }

      console.log('LocalDictionaryAdapter - search result:', result)

      // Cache the result
      this.setCachedResult(query, result)

      return result
    } catch (error) {
      console.error('Local dictionary search failed:', error)
      throw error
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      if (!this.dictionaryStore.isLoaded) {
        await this.dictionaryStore.loadDictionary()
      }
      return this.dictionaryStore.dictionary.length > 0
    } catch {
      return false
    }
  }
}
