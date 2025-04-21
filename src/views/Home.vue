<script setup lang="ts">
import { useBookStore } from '@/stores/bookStore'
import { onMounted } from 'vue'

const bookStore = useBookStore()

onMounted(async () => {
  await bookStore.loadBooks()
})
</script>

<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold mb-6">
      词书列表
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <a-card
        v-for="book in bookStore.books"
        :key="book.id"
        class="hover:shadow-lg transition-shadow duration-300"
        :class="bookStore.currentBookId === book.id ? 'border-2 border-primary' : ''"
        hoverable
        @click="bookStore.selectBook(book.id)"
      >
        <template #title>
          {{ book.name }}
        </template>
        <div class="text-sm text-gray-500">
          包含 {{ book.word_count }} 个单词
        </div>
      </a-card>
    </div>
  </div>
</template>
