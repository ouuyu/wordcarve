import type { DictionaryAdapter, DictionarySearchResult } from '@/types/dictionary'

/**
 * Base dictionary adapter class
 */
export abstract class BaseDictionaryAdapter<T = any> implements DictionaryAdapter<T> {
  abstract name: string
  abstract displayName: string
  abstract icon: string
  abstract resultType: 'online' | 'local'

  protected cache = new Map<string, DictionarySearchResult<T>>()
  protected cacheTimeout = 5 * 60 * 1000 // 5 minutes

  abstract search(query: string): Promise<DictionarySearchResult<T>>
  abstract isAvailable(): Promise<boolean>

  /**
   * Get cached result if available and not expired
   */
  protected getCachedResult(query: string): DictionarySearchResult<T> | null {
    const cached = this.cache.get(query.toLowerCase())
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return { ...cached, cached: true }
    }
    return null
  }

  /**
   * Cache search result
   */
  protected setCachedResult(query: string, result: DictionarySearchResult<T>): void {
    this.cache.set(query.toLowerCase(), result)
  }

  /**
   * Clear expired cache entries
   */
  protected clearExpiredCache(): void {
    const now = Date.now()
    for (const [key, result] of this.cache.entries()) {
      if (now - result.timestamp >= this.cacheTimeout) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Validate search query
   */
  protected validateQuery(query: string): boolean {
    return query.trim().length > 0 && /^[a-zA-Z\s-']+$/.test(query.trim())
  }
}
