<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@/utils/message'
import OnlineDictionary from '@/components/dictionary/OnlineDictionary.vue'

const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const route = useRoute()
const router = useRouter()

watch(
  () => route.query.q,
  newQuery => {
    if (newQuery && typeof newQuery === 'string' && newQuery !== searchQuery.value) {
      searchQuery.value = newQuery
    }
  },
  { immediate: true },
)

function updateUrlQuery(query: string) {
  router.replace({ query: { q: query } }).catch(() => {})
}

function handleSearch() {
  const trimmedQuery = searchQuery.value.trim()
  if (!trimmedQuery) {
    Message.warning('请输入要查询的单词')
    return
  }
  updateUrlQuery(trimmedQuery)
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">
    <div class="space-y-6">
      <div class="flex gap-3 items-center">
        <div class="flex-1 relative">
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="w-full h-14 px-12 text-lg rounded-3xl bg-white/95 dark:bg-zinc-800/95 border border-gray-200 dark:border-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            placeholder="输入英文单词，按回车查询..."
            @keyup.enter="handleSearch"
            autocomplete="off"
            spellcheck="false"
          />
          <div
            class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl i-carbon-search pointer-events-none"
          />
        </div>
        <button
          class="flex items-center h-14 px-8 text-lg font-medium rounded-3xl bg-blue-500 hover:bg-blue-600 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200"
          @click="handleSearch"
        >
          <div
            i-carbon-search
            class="mr-2"
          />
          查询
        </button>
      </div>
    </div>

    <div class="pt-4">
      <OnlineDictionary
        v-if="searchQuery"
        :query="searchQuery"
        class="p-6 rounded-2xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm shadow-lg border border-gray-100/80 dark:border-zinc-700/80"
      />
    </div>
  </div>
</template>
