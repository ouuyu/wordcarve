import { BaseDictionaryAdapter } from '../base'
import type { DictionarySearchResult, OnlineDictionaryEntry } from '@/types/dictionary'
import { queryWord } from '@/services/dictionary'

/**
 * Online dictionary adapter using the current API
 */
export class OnlineDictionaryAdapter extends BaseDictionaryAdapter<OnlineDictionaryEntry> {
  name = 'online'
  displayName = '词刻综合'
  icon = 'i-carbon-cloud'
  resultType = 'online' as const

  async search(query: string): Promise<DictionarySearchResult<OnlineDictionaryEntry>> {
    if (!this.validateQuery(query)) {
      throw new Error('Invalid search query')
    }

    // Check cache first
    const cached = this.getCachedResult(query)
    if (cached) {
      return cached
    }

    try {
      const entries = await queryWord(query.trim())
      const result: DictionarySearchResult<OnlineDictionaryEntry> = {
        entries,
        source: this.name,
        timestamp: Date.now(),
        cached: false,
        resultType: this.resultType,
      }

      // Cache the result
      this.setCachedResult(query, result)

      // Clean up expired cache entries periodically
      if (Math.random() < 0.1) {
        this.clearExpiredCache()
      }

      return result
    } catch (error) {
      console.error('Online dictionary search failed:', error)
      throw error
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      return true
    } catch {
      return false
    }
  }
}
