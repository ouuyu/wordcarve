/* eslint-disable no-console */
import type { DictionaryEntry } from '../types'
import { defineStore } from 'pinia'
import { IndexedDB } from '../utils/indexedDB'

interface DictionaryState {
  dictionary: DictionaryEntry[]
  currentWord: DictionaryEntry | null
  isLoaded: boolean
}

const db = new IndexedDB('wordcarve', 'dictionary', {
  keyPath: 'word',
  useInlineKeys: true,
})

export const useDictionaryStore = defineStore('dictionary', {
  state: (): DictionaryState => ({
    dictionary: [],
    currentWord: null,
    isLoaded: false,
  }),

  getters: {
    getWordByName: state => (word: string): DictionaryEntry | undefined => {
      return state.dictionary.find(entry => entry.word.toLowerCase() === word.toLowerCase())
    },
  },

  actions: {
    searchWord(word: string): DictionaryEntry | null {
      const foundWord = this.getWordByName(word)
      this.currentWord = foundWord || null
      return this.currentWord
    },

    async resetDatabase(): Promise<void> {
      console.log('正在重置数据库...')
      try {
        await db.deleteDatabase()
        console.log('数据库已删除，创建新的数据库实例')
        const newDb = new IndexedDB('wordcarve', 'dictionary', {
          keyPath: 'word',
          useInlineKeys: true,
        })

        Object.assign(db, newDb)

        this.dictionary = []
        this.currentWord = null
        this.isLoaded = false
        console.log('数据库重置完成')
      }
      catch (error) {
        console.error('重置数据库失败:', error)
        throw error
      }
    },

    async importDictionary(dictionaryJson: string): Promise<boolean> {
      try {
        console.log('开始导入字典...')
        const parsedDictionary = JSON.parse(dictionaryJson)

        await this.resetDatabase()
        console.log('数据库已重置，准备导入新数据')

        if (Array.isArray(parsedDictionary)) {
          const validEntries = parsedDictionary.filter(entry =>
            entry && typeof entry === 'object' && 'word' in entry
            && typeof entry.word === 'string',
          ) as DictionaryEntry[]

          if (validEntries.length === 0) {
            console.error('没有有效的词条，所有词条都必须有 word 字段')
            return false
          }

          console.log(`过滤后有 ${validEntries.length} 个有效词条，开始批量导入`)

          const batchSize = 1000
          for (let i = 0; i < validEntries.length; i += batchSize) {
            const batch = validEntries.slice(i, i + batchSize)
            console.log(`导入批次 ${i / batchSize + 1}/${Math.ceil(validEntries.length / batchSize)}, 大小: ${batch.length}`)
            await db.bulkPut(batch)
          }

          console.log('批量导入完成，加载字典数据')
          await this.loadDictionary()
          return true
        }
        else if (typeof parsedDictionary === 'object' && parsedDictionary !== null) {
          if ('word' in parsedDictionary && typeof parsedDictionary.word === 'string') {
            console.log('导入单个词条')
            await db.put(parsedDictionary as DictionaryEntry)
          }
          else {
            const entriesArray = Object.values(parsedDictionary)
            const validEntries = entriesArray.filter(entry =>
              entry && typeof entry === 'object' && 'word' in entry
              && typeof (entry as any).word === 'string',
            ) as DictionaryEntry[]

            if (validEntries.length === 0) {
              console.error('没有有效的词条，所有词条都必须有 word 字段')
              return false
            }

            console.log(`从对象中提取了 ${validEntries.length} 个有效词条，开始批量导入`)

            const batchSize = 1000
            for (let i = 0; i < validEntries.length; i += batchSize) {
              const batch = validEntries.slice(i, i + batchSize)
              console.log(`导入批次 ${i / batchSize + 1}/${Math.ceil(validEntries.length / batchSize)}, 大小: ${batch.length}`)
              await db.bulkPut(batch)
            }
          }

          console.log('导入完成，加载字典数据')
          await this.loadDictionary()
          return true
        }

        return false
      }
      catch (error) {
        console.error('导入字典失败:', error)
        return false
      }
    },

    async loadDictionary(): Promise<boolean> {
      try {
        console.log('从 IndexedDB 加载字典数据')
        this.dictionary = await db.getAll() as DictionaryEntry[]
        this.isLoaded = true
        console.log(`加载了 ${this.dictionary.length} 个词条`)
        return this.dictionary.length > 0
      }
      catch (error) {
        console.error('从 IndexedDB 加载字典失败:', error)
        this.isLoaded = false
        return false
      }
    },

    async clearDictionary(): Promise<void> {
      try {
        await this.resetDatabase()
        this.dictionary = []
        this.currentWord = null
      }
      catch (error) {
        console.error('清空字典失败:', error)
      }
    },
  },
})
