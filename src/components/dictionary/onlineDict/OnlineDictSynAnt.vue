<script setup lang="ts">
import MyText from '@/components/my/MyText.vue'
const props = defineProps<{ synonyms: any[]; antonyms: any[] }>()
</script>

<template>
  <div class="space-y-6">
    <!-- Synonyms -->
    <div
      v-if="synonyms?.length"
      class="space-y-4"
    >
      <div class="flex items-center gap-2 text-base font-medium">
        <div i-carbon-arrow-right />
        同义词
      </div>
      <div
        v-for="syn in synonyms"
        :key="syn.part_of_speech"
        class="p-4 rounded-lg bg-gray-50 dark:bg-dark-700/50 space-y-2"
      >
        <div class="text-sm italic op-50">
          <MyText :text="syn.part_of_speech" />
        </div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="item in syn.items"
            :key="item"
            class="px-3 py-1.5 rounded-full text-sm cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100 dark:(bg-blue-500/10 text-blue-300 hover:bg-blue-500/20) transition-colors"
          >
            <MyText :text="item" />
          </span>
        </div>
      </div>
    </div>

    <!-- Antonyms -->
    <div
      v-if="antonyms?.length"
      class="space-y-4"
    >
      <div class="flex items-center gap-2 text-base font-medium">
        <div i-carbon-arrow-left />
        反义词
      </div>
      <div
        v-for="ant in antonyms"
        :key="ant.part_of_speech"
        class="p-4 rounded-lg bg-gray-50 dark:bg-dark-700/50 space-y-2"
      >
        <div class="text-sm italic op-50">
          <MyText :text="ant.part_of_speech" />
        </div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="item in ant.items"
            :key="item"
            class="px-3 py-1.5 rounded-full text-sm cursor-pointer bg-red-50 text-red-700 hover:bg-red-100 dark:(bg-red-500/10 text-red-300 hover:bg-red-500/20) transition-colors"
          >
            <MyText :text="item" />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 移除所有样式，全部使用 UnoCSS */
</style>
