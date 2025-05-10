<script setup lang="ts">
import type { DictionaryEntry } from '@/types'
import { useDictionaryEntry } from '@/composables/useDictionaryEntry'
import { PronunciationType } from '@/utils/audio'

const props = defineProps<{
  word: DictionaryEntry
  mode?: 'normal' | 'mini'
  clickable?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', word: DictionaryEntry): void
  (e: 'example-click', example: any): void
}>()

const {
  isMiniMode,
  shortTranslation,
  mergedMeanings,
  selectedMeaning,
  selectMeaning,
  isMeaningSelected,
  getTagDisplay,
  playPronunciation,
  handleClick,
  handleExampleClick,
} = useDictionaryEntry(props, emit)
</script>

<template>
  <div class="relative">
    <!-- Mini Mode -->
    <div
      v-if="isMiniMode"
      class="flex items-center gap-3 rounded-md px-4 py-3 transition-all active:bg-gray-200 hover:bg-gray-100"
      :class="{ 'cursor-pointer': clickable }"
      @click="handleClick"
    >
      <div class="min-w-[100px] text-gray-800 font-medium">
        {{ word.word }}
      </div>
      <div class="text-sm text-gray-500">
        /{{ word.phonetic }}/
      </div>
      <div class="flex-1 truncate text-sm text-gray-600">
        {{ shortTranslation }}
      </div>
    </div>

    <!-- Normal Mode -->
    <div
      v-else
      class="w-full flex flex-col items-start rounded-lg p-4 transition-all"
      :class="{ 'cursor-pointer hover:bg-gray-50 active:bg-gray-100': clickable }"
      @click="clickable ? handleClick() : undefined"
    >
      <div class="w-full overflow-x-hidden">
        <div class="mb-4 flex items-center justify-between">
          <div class="flex flex-wrap items-center gap-4">
            <h1 class="break-all text-3xl text-gray-800 font-bold">
              {{ word.word }}
            </h1>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-gray-600">/{{ word.phonetic }}/</span>
              <div class="flex gap-2">
                <a-button
                  type="text"
                  size="mini"
                  @click="(e) => playPronunciation(PronunciationType.US, e)"
                >
                  美
                </a-button>
                <a-button
                  type="text"
                  size="mini"
                  @click="(e) => playPronunciation(PronunciationType.UK, e)"
                >
                  英
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-6 flex flex-wrap gap-2">
          <span
            v-for="tag in word.tag || []"
            :key="tag"
            class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
          >
            {{ getTagDisplay(tag) }}
          </span>
          <span
            v-if="word.collins"
            class="rounded-full bg-arcoblue-2 px-3 py-1 text-sm text-arcoblue-7"
          >
            柯林斯 {{ word.collins }}星
          </span>
        </div>

        <!-- Dictionary Meanings -->
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
          <div v-if="mergedMeanings.length" class="space-y-4">
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
                  class="ml-10 mt-3 border-l-2 border-gray-200 pl-4"
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
                      class="mb-2 cursor-pointer border border-transparent rounded-md transition-all"
                      @click.stop="handleExampleClick(example, $event)"
                    >
                      <p class="mb-1 text-gray-700">
                        {{ example.sentence }}
                      </p>
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
      </div>
    </div>
  </div>
</template>

<style scoped>
.break-all {
  word-break: break-all;
}

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
