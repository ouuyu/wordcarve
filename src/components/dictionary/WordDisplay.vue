<script setup lang="ts">
import type { DictionaryEntry } from '@/types'
import FrequencyIndicator from '@/components/dictionary/FrequencyIndicator.vue'
import MyText from '@/components/MyText.vue'
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
  wordForms,
  frequencyLevel,
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
      <div class="min-w-[100px] flex items-center gap-1 text-gray-800 font-medium">
        {{ word.word }}
        <FrequencyIndicator v-if="frequencyLevel > 0" :level="frequencyLevel" />
      </div>
      <div class="text-sm text-gray-500">
        {{ word.phonetic ? `/${word.phonetic}/` : '' }}
      </div>
      <div class="flex-1 truncate text-sm text-gray-600">
        {{ shortTranslation }}
      </div>
    </div>

    <!-- Normal Mode -->
    <div
      v-else
      class="w-full flex flex-col items-start rounded-lg p-2 transition-all"
      :class="{ 'cursor-pointer hover:bg-gray-50 active:bg-gray-100': clickable }"
      @click="clickable ? handleClick() : undefined"
    >
      <div class="w-full overflow-x-hidden">
        <div class="flex items-center justify-between">
          <div class="mb-2 flex flex-wrap items-center">
            <span class="flex items-center break-all text-3xl font-bold">
              {{ word.word }}
              <FrequencyIndicator v-if="frequencyLevel > 0" :level="frequencyLevel" class="ml-2" />
            </span>
            <div class="flex flex-wrap items-center px-2">
              <span class="text-gray-600">
                {{ word.phonetic ? `/${word.phonetic}/` : '' }}
              </span>
              <div class="flex px-2">
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

        <div class="mb-4 flex flex-wrap gap-2">
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

        <!-- 词形变化 (放在最后) -->
        <div v-if="wordForms.length > 0" class="mt-4 border-t border-gray-100 pt-3">
          <div class="flex flex-wrap gap-2">
            <span v-for="(form, index) in wordForms" :key="index" class="text-sm text-gray-600">
              <span class="font-medium">{{ form.type }}:</span> {{ form.word }}
            </span>
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
