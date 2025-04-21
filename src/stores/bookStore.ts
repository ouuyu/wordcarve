import type { Book } from '../types'
import { defineStore } from 'pinia'

interface BookState {
  books: Book[]
  currentBookId: string | null
}

export const useBookStore = defineStore('book', {
  state: (): BookState => ({
    books: [],
    currentBookId: null,
  }),

  getters: {
    currentBook: (state): Book | undefined => {
      return state.books.find(book => book.id === state.currentBookId)
    },
  },

  actions: {
    async loadBooks(): Promise<void> {
      const loadedBooks: Book[] = [
        { id: 'book-1', name: 'CET-4 Core Vocabulary', word_count: 2000 },
        { id: 'book-2', name: 'GRE Essential Words', word_count: 3000 },
      ]
      this.books = loadedBooks

      if (this.books.length > 0) {
        this.currentBookId = this.books[0].id
      }
    },

    selectBook(bookId: string): void {
      this.currentBookId = bookId
    },
  },
})
