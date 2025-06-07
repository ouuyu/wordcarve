import type { DictionaryAdapter, DictionarySearchResult } from '@/types/dictionary'
import { OnlineDictionaryAdapter } from './online'
import { LocalDictionaryAdapter } from './local'
import { CambridgeDictionaryAdapter } from './cambridge'

/**
 * Dictionary adapter manager
 */
export class DictionaryAdapterManager {
  private adapters: Map<string, DictionaryAdapter> = new Map()
  private defaultAdapter = 'online'

  constructor() {
    this.registerAdapter(new OnlineDictionaryAdapter())
    this.registerAdapter(new LocalDictionaryAdapter())
    this.registerAdapter(new CambridgeDictionaryAdapter())
  }

  /**
   * Register a dictionary adapter
   */
  registerAdapter(adapter: DictionaryAdapter): void {
    this.adapters.set(adapter.name, adapter)
  }

  /**
   * Get all available adapters
   */
  getAvailableAdapters(): DictionaryAdapter[] {
    return Array.from(this.adapters.values())
  }

  /**
   * Get adapter by name
   */
  getAdapter(name: string): DictionaryAdapter | undefined {
    return this.adapters.get(name)
  }

  /**
   * Search using specific adapter
   */
  async search(query: string, adapterName?: string): Promise<DictionarySearchResult<any>> {
    const adapter = this.getAdapter(adapterName || this.defaultAdapter)
    if (!adapter) {
      throw new Error(`Adapter '${adapterName || this.defaultAdapter}' not found`)
    }

    const isAvailable = await adapter.isAvailable()
    if (!isAvailable) {
      throw new Error(`Adapter '${adapter.name}' is not available`)
    }

    return adapter.search(query)
  }

  /**
   * Search using multiple adapters with progressive results
   * Returns a promise that resolves when the first successful result is found
   * and provides a callback for subsequent results
   */
  async searchMultipleProgressive(
    query: string,
    onResult: (adapterName: string, result: DictionarySearchResult<any> | Error) => void,
    adapterNames?: string[],
  ): Promise<void> {
    const adaptersToUse = adapterNames
      ? (adapterNames.map(name => this.getAdapter(name)).filter(Boolean) as DictionaryAdapter[])
      : this.getAvailableAdapters()

    const searchPromises = adaptersToUse.map(async adapter => {
      try {
        const isAvailable = await adapter.isAvailable()
        if (isAvailable) {
          const result = await adapter.search(query)
          onResult(adapter.name, result)
        } else {
          onResult(adapter.name, new Error(`Adapter '${adapter.name}' is not available`))
        }
      } catch (error) {
        onResult(adapter.name, error instanceof Error ? error : new Error('Unknown error'))
      }
    })

    await Promise.allSettled(searchPromises)
  }

  /**
   * Search using multiple adapters in parallel (legacy method)
   */
  async searchMultiple(
    query: string,
    adapterNames?: string[],
  ): Promise<Map<string, DictionarySearchResult<any> | Error>> {
    const adaptersToUse = adapterNames
      ? (adapterNames.map(name => this.getAdapter(name)).filter(Boolean) as DictionaryAdapter[])
      : this.getAvailableAdapters()

    const results = new Map<string, DictionarySearchResult<any> | Error>()

    const searchPromises = adaptersToUse.map(async adapter => {
      try {
        const isAvailable = await adapter.isAvailable()
        if (isAvailable) {
          const result = await adapter.search(query)
          results.set(adapter.name, result)
        } else {
          results.set(adapter.name, new Error(`Adapter '${adapter.name}' is not available`))
        }
      } catch (error) {
        results.set(adapter.name, error instanceof Error ? error : new Error('Unknown error'))
      }
    })

    await Promise.allSettled(searchPromises)
    return results
  }

  /**
   * Set default adapter
   */
  setDefaultAdapter(name: string): void {
    if (this.adapters.has(name)) {
      this.defaultAdapter = name
    } else {
      throw new Error(`Adapter '${name}' not found`)
    }
  }

  /**
   * Get default adapter name
   */
  getDefaultAdapter(): string {
    return this.defaultAdapter
  }

  /**
   * Check which adapters are currently available
   */
  async checkAvailability(): Promise<Map<string, boolean>> {
    const availability = new Map<string, boolean>()

    const checkPromises = Array.from(this.adapters.entries()).map(async ([name, adapter]) => {
      try {
        const isAvailable = await adapter.isAvailable()
        availability.set(name, isAvailable)
      } catch {
        availability.set(name, false)
      }
    })

    await Promise.allSettled(checkPromises)
    return availability
  }
}

// Global instance
export const dictionaryManager = new DictionaryAdapterManager()
