<script setup lang="ts">
import type { DictionaryEntry } from '@/types'
import MyText from '@/components/MyText.vue'

interface MeaningGroup {
  part_of_speech: string
  meanings: string[]
  allExamples: Array<{
    meaning: string
    examples: Array<{
      sentence: string
      sentence_zh: string
    }>
  }>
}

defineProps<{
  word: DictionaryEntry
  mergedMeanings: MeaningGroup[]
  selectedMeaning: { groupIdx: number, meaningIdx: number } | null
  isMeaningSelected: (groupIdx: number, meaningIdx: number) => boolean
}>()

const emit = defineEmits<{
  (e: 'selectMeaning', groupIdx: number, meaningIdx: number): void
  (e: 'exampleClick', example: any, event: MouseEvent): void
}>()

function selectMeaning(groupIdx: number, meaningIdx: number) {
  emit('selectMeaning', groupIdx, meaningIdx)
}

function handleExampleClick(example: any, event: MouseEvent) {
  emit('exampleClick', example, event)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Traditional Translation -->
    <div v-if="!word.meanings?.length && word.translation?.length" class="mb-4">
      <h3 class="mb-2 text-gray-500 font-medium">
        传统释义
      </h3>
      <div class="space-y-1">
        <p v-for="(trans, index) in word.translation" :key="index" class="text-gray-700">
          {{ trans }}
        </p>
      </div>
    </div>

    <!-- Detailed Meanings -->
    <div v-if="mergedMeanings.length" class="space-y-1">
      <div v-for="(group, groupIdx) in mergedMeanings" :key="group.part_of_speech">
        <div class="flex items-start">
          <span class="w-[2.5rem] flex py-1 text-gray-500">{{ group.part_of_speech }}</span>
          <div class="flex flex-wrap">
            <span
              v-for="(meaning, mIdx) in group.meanings"
              :key="mIdx"
              class="cursor-pointer gap-2 rounded-full px-3 py-1 text-gray-700 transition-all"
              :class="{
                'bg-gray-100 border border-gray-300 font-bold': isMeaningSelected(groupIdx, mIdx),
                'hover:bg-gray-50': !isMeaningSelected(groupIdx, mIdx),
              }"
              @click.stop="selectMeaning(groupIdx, mIdx)"
            >
              {{ meaning }}
            </span>
          </div>
        </div>
        <!-- Examples (only for selected meaning) -->
        <transition name="slide-fade">
          <div
            v-if="
              isMeaningSelected(groupIdx, selectedMeaning?.meaningIdx ?? -1)
                && group.allExamples.length
            "
            class="mb-2 ml-9 mt-1 border-l-2 border-gray-200 pl-4 transition-all"
          >
            <div
              v-for="(exGroup, exIdx) in group.allExamples.filter(
                (eg) => group.meanings[selectedMeaning?.meaningIdx ?? 0] === eg.meaning,
              )"
              :key="exIdx"
              class="mb-3"
            >
              <div
                v-for="(example, eIdx) in exGroup.examples"
                :key="eIdx"
                class="transition-all"
                @click.stop="handleExampleClick(example, $event)"
              >
                <MyText :text="example.sentence" />
                <p class="text-sm text-gray-500">
                  {{ example.sentence_zh }}
                </p>
              </div>
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
