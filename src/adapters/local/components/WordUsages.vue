<script setup lang="ts">
import type { DictionaryEntry } from '@/types'
import { ref } from 'vue'
import MyText from '@/components/my/MyText.vue'

defineProps<{
  word: DictionaryEntry
}>()

const expandedUsages = ref<Set<number>>(new Set())

function toggleUsageExamples(index: number) {
  if (expandedUsages.value.has(index))
    expandedUsages.value.delete(index)
  else
    expandedUsages.value.add(index)
}
</script>

<template>
  <div v-if="word.usages?.length" class="mt-4 border-t border-gray-100 pt-3">
    <h3 class="mb-2 text-gray-500 font-medium">
      常用搭配
    </h3>
    <div class="space-y-3">
      <div v-for="(usage, index) in word.usages" :key="index" class="space-y-2">
        <div
          class="flex cursor-pointer items-start gap-2 rounded-md p-2 hover:bg-gray-50"
          @click="toggleUsageExamples(index)"
        >
          <span class="text-sm text-gray-700">{{ usage.form }}</span>
          <span class="text-sm text-gray-500">{{ usage.meaning }}</span>
        </div>
        <!-- 搭配例句 -->
        <transition name="slide-fade">
          <div
            v-if="expandedUsages.has(index) && usage.examples?.length"
            class="ml-4 space-y-2"
          >
            <div
              v-for="(example, exIndex) in usage.examples"
              :key="exIndex"
              class="text-sm"
            >
              <MyText :text="example.sentence" />
              <p class="text-gray-500">
                {{ example.sentence_zh }}
              </p>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
