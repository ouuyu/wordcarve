<script setup lang="ts">
import { useBookStore } from '@/stores/bookStore'
import { IconBook, IconRight, IconUser } from '@arco-design/web-vue/es/icon'
import { inject, onMounted, ref } from 'vue'

const bookStore = useBookStore()
const isDark = inject('isDark', ref(false))

onMounted(async () => {
  await bookStore.loadBooks()
})
</script>

<template>
  <div class="p-4">
    <h2 class="mb-6 flex items-center text-2xl font-bold">
      <IconBook class="text-primary mr-2" />
      词书列表
    </h2>
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3 md:grid-cols-2">
      <div
        v-for="book in bookStore.books"
        :key="book.id"
        class="transform cursor-pointer rounded-lg transition-all duration-300 hover:-translate-y-1"
        :class="[
          isDark ? 'bg-dark-700 hover:bg-dark-600' : 'bg-white hover:shadow-xl',
          bookStore.currentBookId === book.id
            ? 'ring-2 ring-primary shadow-primary/20 shadow-lg'
            : 'shadow-md',
        ]"
        @click="bookStore.selectBook(book.id)"
      >
        <div class="p-5">
          <div class="flex items-start">
            <div class="bg-primary-100 text-primary-500 h-12 w-12 flex items-center justify-center rounded-lg">
              <IconBook />
            </div>
            <div class="ml-3 flex-1">
              <h3 class="text-lg font-medium">
                {{ book.name }}
              </h3>
              <p class="text-sm text-gray-500">
                掌握核心词汇，提升语言能力
              </p>
              <div class="text-primary-400 mt-2 text-right text-2xl font-medium">
                {{ book.word_count }}
              </div>
              <div class="text-right text-xs text-gray-500">
                词汇量
              </div>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="mt-4">
            <div class="mb-1 flex justify-between text-xs">
              <span>学习进度</span>
              <span>{{ Math.floor(Math.random() * 100) }}%</span>
            </div>
            <div class="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                class="bg-primary h-2 rounded-full"
                :style="`width: ${Math.floor(Math.random() * 100)}%`"
              />
            </div>
          </div>

          <div class="mt-4 flex items-center justify-between text-sm">
            <div class="flex items-center text-gray-500">
              <IconUser class="mr-1" />
              <span>{{ Math.floor(Math.random() * 10000) }}+ 人在学</span>
            </div>
            <div class="text-primary flex items-center">
              <span>开始学习</span>
              <IconRight class="ml-1" />
            </div>
          </div>
        </div>

        <!-- 选中标记 -->
        <div
          v-if="bookStore.currentBookId === book.id"
          class="bg-primary absolute rounded-full p-1 text-white shadow-lg -right-2 -top-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-primary-100 {
  background-color: rgba(var(--primary-6), 0.1);
}

.text-primary-500 {
  color: rgb(var(--primary-6));
}

.text-primary-400 {
  color: rgb(var(--primary-5));
}

.bg-primary {
  background-color: rgb(var(--primary-6));
}

.text-primary {
  color: rgb(var(--primary-6));
}

.ring-primary {
  --tw-ring-color: rgb(var(--primary-6));
}
</style>
