import type { DictionaryEntry } from '../types'
import { defineStore } from 'pinia'

interface DictionaryState {
  dictionary: DictionaryEntry[]
  currentWord: DictionaryEntry | null
}

export const useDictionaryStore = defineStore('dictionary', {
  state: (): DictionaryState => ({
    dictionary: [],
    currentWord: null,
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

    importDictionary(dictionaryJson: string): boolean {
      try {
        const parsedDictionary = JSON.parse(dictionaryJson) as DictionaryEntry[]

        if (Array.isArray(parsedDictionary)) {
          this.dictionary = parsedDictionary
          return true
        }
        else if (typeof parsedDictionary === 'object' && parsedDictionary !== null) {
          // Handle case where the JSON might be a single dictionary entry or an object of entries
          if ('word' in parsedDictionary) {
            // Single entry
            this.dictionary = [parsedDictionary as any]
            return true
          }
          else {
            // Object of entries
            this.dictionary = Object.values(parsedDictionary)
            return true
          }
        }

        return false
      }
      catch (error) {
        console.error('Failed to import dictionary:', error)
        return false
      }
    },

    // Save the current dictionary to localStorage
    saveDictionary(): void {
      try {
        localStorage.setItem('wordcarve-dictionary', JSON.stringify(this.dictionary))
      }
      catch (error) {
        console.error('Failed to save dictionary to localStorage:', error)
      }
    },

    // Load dictionary from localStorage
    loadDictionary(): boolean {
      try {
        const savedDictionary = localStorage.getItem('wordcarve-dictionary')
        if (savedDictionary) {
          this.dictionary = JSON.parse(savedDictionary)
          return true
        }
        return false
      }
      catch (error) {
        console.error('Failed to load dictionary from localStorage:', error)
        return false
      }
    },

    // Add a single word to the dictionary
    addWord(word: DictionaryEntry): void {
      const existingIndex = this.dictionary.findIndex(entry => entry.word === word.word)
      if (existingIndex >= 0) {
        this.dictionary[existingIndex] = word
      }
      else {
        this.dictionary.push(word)
      }
      this.saveDictionary()
    },

    // Remove a word from the dictionary
    removeWord(word: string): void {
      this.dictionary = this.dictionary.filter(entry => entry.word !== word)
      this.saveDictionary()
    },

    // Clear the whole dictionary
    clearDictionary(): void {
      this.dictionary = []
      this.currentWord = null
      localStorage.removeItem('wordcarve-dictionary')
    },
  },
})
