import { BaseDictionaryAdapter } from '../base'
import type { DictionarySearchResult, CambridgeDictionaryEntry } from '@/types/dictionary'
import { http } from '@/utils/http'

/**
 * Cambridge English-English dictionary adapter
 */
export class CambridgeDictionaryAdapter extends BaseDictionaryAdapter<CambridgeDictionaryEntry> {
  name = 'cambridge'
  displayName = '剑桥'
  icon = 'i-carbon-book'
  resultType = 'online' as const

  private readonly apiUrl = 'https://dictionary-api.eliaschen.dev/api/dictionary/en'

  async search(query: string): Promise<DictionarySearchResult<CambridgeDictionaryEntry>> {
    if (!this.validateQuery(query)) {
      throw new Error('Invalid search query')
    }

    // Check cache first
    const cached = this.getCachedResult(query)
    if (cached) {
      return cached
    }

    try {
      const data = await http
        .get(`${this.apiUrl}/${encodeURIComponent(query.trim())}`)
        .json<CambridgeDictionaryEntry>()
      const entries = data ? [data] : []

      const result: DictionarySearchResult<CambridgeDictionaryEntry> = {
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
      console.error('Cambridge dictionary search failed:', error)

      // Handle 404 errors (word not found)
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as any).response
        if (response?.status === 404) {
          // Word not found, return empty result
          const result: DictionarySearchResult<CambridgeDictionaryEntry> = {
            entries: [],
            source: this.name,
            timestamp: Date.now(),
            cached: false,
            resultType: this.resultType,
          }
          this.setCachedResult(query, result)
          return result
        }
      }

      // Handle timeout errors
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new Error('查询超时，请稍后重试')
      }

      throw error
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await http.get(`${this.apiUrl}/test`, { timeout: 5000 })
      return true
    } catch {
      return false
    }
  }
}
