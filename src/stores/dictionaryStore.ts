import type { DictionaryEntry } from '../types'
import { defineStore } from 'pinia'
import { IndexedDB } from '../utils/indexedDB'

interface DictionaryState {
  dictionary: DictionaryEntry[]
  currentWord: DictionaryEntry | null
  isLoaded: boolean
}

// 创建数据库实例，使用 'word' 字段作为键路径
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
        // 创建一个新的数据库实例
        const newDb = new IndexedDB('wordcarve', 'dictionary', {
          keyPath: 'word',
          useInlineKeys: true,
        })

        // 更新全局数据库引用
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

        // 首先重置数据库，确保从头开始
        await this.resetDatabase()
        console.log('数据库已重置，准备导入新数据')

        if (Array.isArray(parsedDictionary)) {
          // 确保所有词条都有 word 字段
          const validEntries = parsedDictionary.filter(entry =>
            entry && typeof entry === 'object' && 'word' in entry
            && typeof entry.word === 'string',
          ) as DictionaryEntry[]

          if (validEntries.length === 0) {
            console.error('没有有效的词条，所有词条都必须有 word 字段')
            return false
          }

          console.log(`过滤后有 ${validEntries.length} 个有效词条，开始批量导入`)

          // 分批导入，以避免一次处理过多数据
          const batchSize = 1000
          for (let i = 0; i < validEntries.length; i += batchSize) {
            const batch = validEntries.slice(i, i + batchSize)
            console.log(`导入批次 ${i / batchSize + 1}/${Math.ceil(validEntries.length / batchSize)}, 大小: ${batch.length}`)
            await db.bulkPut(batch)
          }

          // 重新加载字典
          console.log('批量导入完成，加载字典数据')
          await this.loadDictionary()
          return true
        }
        else if (typeof parsedDictionary === 'object' && parsedDictionary !== null) {
          // 处理单个词条或词条对象的情况
          if ('word' in parsedDictionary && typeof parsedDictionary.word === 'string') {
            // 单个词条
            console.log('导入单个词条')
            await db.put(parsedDictionary as DictionaryEntry)
          }
          else {
            // 词条对象，转换为数组并过滤有效条目
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

            // 分批导入，以避免一次处理过多数据
            const batchSize = 1000
            for (let i = 0; i < validEntries.length; i += batchSize) {
              const batch = validEntries.slice(i, i + batchSize)
              console.log(`导入批次 ${i / batchSize + 1}/${Math.ceil(validEntries.length / batchSize)}, 大小: ${batch.length}`)
              await db.bulkPut(batch)
            }
          }

          // 重新加载字典
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

    // 从 IndexedDB 加载所有字典条目
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

    // 添加单个词条
    async addWord(word: DictionaryEntry): Promise<void> {
      try {
        if (!word.word || typeof word.word !== 'string') {
          console.error('词条必须有 word 字段')
          return
        }

        // 直接添加或更新词条
        await db.put(word)

        // 更新本地状态
        const existingIndex = this.dictionary.findIndex(entry => entry.word === word.word)
        if (existingIndex >= 0) {
          this.dictionary[existingIndex] = word
        }
        else {
          this.dictionary.push(word)
        }
      }
      catch (error) {
        console.error('添加词条失败:', error)
      }
    },

    // 删除词条
    async removeWord(word: string): Promise<void> {
      try {
        // 从数据库中删除
        await db.delete(word)

        // 更新本地状态
        this.dictionary = this.dictionary.filter(entry => entry.word !== word)
      }
      catch (error) {
        console.error('删除词条失败:', error)
      }
    },

    // 清空字典
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
