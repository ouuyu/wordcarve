import type { Word } from '../types'
import { defineStore } from 'pinia'

interface WordState {
  words: Word[]
}

export const useWordStore = defineStore('word', {
  state: (): WordState => ({
    words: [],
  }),

  getters: {
    getWord: state => (word: string): Word | undefined => {
      return state.words.find(w => w.text === word)
    },
  },

  actions: {
    async loadWordsForBook(bookId: string): Promise<void> {
      let loadedWords: Word[] = []

      if (bookId === 'book-1') {
        loadedWords = [
          { text: 'apple', meaning: '苹果' },
          { text: 'banana', meaning: '香蕉' },
        ]
      }
      else if (bookId === 'book-2') {
        loadedWords = [
          { text: 'ubiquitous', meaning: '无处不在的' },
          { text: 'ephemeral', meaning: '短暂的' },
        ]
      }

      this.words = loadedWords
    },

    clearWords(): void {
      this.words = []
    },
  },
})
