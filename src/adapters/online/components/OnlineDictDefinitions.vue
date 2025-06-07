<script setup lang="ts">
import { ref } from 'vue'
import { OnlineDictionaryEntry } from '@/types/dictionary'
import { NTag, NText, NCollapse, NCollapseItem, NSpace } from 'naive-ui'

const props = defineProps<{
  entry: OnlineDictionaryEntry
}>()

const expanded = ref<Record<string, boolean>>({})

const toggleExamples = (partOfSpeech: string, senseNumber: string) => {
  const key = `${partOfSpeech}-${senseNumber}`
  expanded.value[key] = !expanded.value[key]
}
const toggleIdiomExamples = (partOfSpeech: string, idiomIndex: number) => {
  const key = `${partOfSpeech}-idiom-${idiomIndex}`
  expanded.value[key] = !expanded.value[key]
}

// 检查 sense 是否有有效内容
const hasValidSenseContent = (sense: any) => {
  if (!sense) return false

  // 检查定义是否有效（不是空字符串或只有标点符号）
  const chineseDef = sense.definition?.Chinese?.trim() || ''
  const englishDef = sense.definition?.English?.trim() || ''

  // 如果中英文定义都是空的，或者只包含标点符号，则认为无效
  const isValidChinese =
    chineseDef && chineseDef !== '.' && chineseDef !== '。' && chineseDef.length > 1
  const isValidEnglish = englishDef && englishDef !== '.' && englishDef.length > 1

  return isValidChinese || isValidEnglish || (sense.examples && sense.examples.length > 0)
}

// 检查词性定义是否有有效的 sense 内容
const hasValidSenses = (def: any) => {
  if (!def.senses || def.senses.length === 0) return false
  return def.senses.some((sense: any) => hasValidSenseContent(sense))
}
</script>

<template>
  <div class="dictionary-content mt-4">
    <div v-if="entry?.definitions">
      <div
        v-for="def in entry.definitions"
        :key="def.part_of_speech"
        class="mb-6"
      >
        <template v-if="hasValidSenses(def) || def.idioms?.length">
          <NTag
            size="small"
            :bordered="false"
            type="info"
            class="mb-4"
          >
            {{ def.part_of_speech }}
          </NTag>
          <NCollapse
            v-for="sense in (def.senses || []).filter(hasValidSenseContent)"
            :key="sense.sense_number"
            :expanded-names="
              expanded[`${def.part_of_speech}-${sense.sense_number}`] ? [sense.sense_number] : []
            "
            arrow-placement="left"
            class="mb-3"
            :disabled="!sense.examples?.length"
            @update:expanded-names="
              sense.examples?.length
                ? toggleExamples(def.part_of_speech, sense.sense_number)
                : undefined
            "
          >
            <NCollapseItem :name="sense.sense_number">
              <template #header>
                <div class="flex items-center space-x-3 py-1">
                  <NText
                    type="primary"
                    class="font-mono w-8 text-base ml-4"
                    >{{ sense.sense_number }}.</NText
                  >
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <NSpace
                        v-if="sense.grammar_tags?.length"
                        :size="4"
                      >
                        <NTag
                          v-for="tag in sense.grammar_tags"
                          :key="tag"
                          size="tiny"
                          type="warning"
                          :bordered="false"
                          class="px-1.5 py-0.5 text-xs font-medium"
                        >
                          {{ tag }}
                        </NTag>
                      </NSpace>
                      <NText
                        v-if="sense.pattern"
                        depth="3"
                        class="text-xs italic text-blue-600"
                      >
                        {{ sense.pattern }}
                      </NText>
                    </div>
                    <NText class="text-base leading-relaxed">{{ sense.definition.Chinese }}</NText>
                    <NText
                      v-if="sense.definition?.English !== sense.pattern"
                      depth="3"
                      class="ml-2 text-sm italic"
                      >{{ sense.definition.English }}</NText
                    >
                  </div>
                </div>
              </template>
              <div
                v-if="sense.examples?.length"
                class="pl-10 pr-4 py-3"
              >
                <div
                  v-for="(example, index) in sense.examples"
                  :key="index"
                  class="last:mb-0 mb-2"
                >
                  <div class="text-sm leading-relaxed">
                    <span class="text-gray-700 dark:text-gray-300">
                      {{ example.English }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ example.Chinese }}
                  </div>
                </div>
              </div>
            </NCollapseItem>
          </NCollapse>

          <!-- 习语部分 -->
          <div
            v-if="def.idioms?.length"
            class="mt-8"
          >
            <div class="flex items-center gap-2 mb-5">
              <div class="i-carbon-quotes w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              <NText
                depth="2"
                class="text-xs font-medium uppercase tracking-wide"
              >
                习语
              </NText>
            </div>
            <div class="space-y-4">
              <NCollapse
                v-for="(idiom, idiomIndex) in def.idioms"
                :key="idiomIndex"
                :expanded-names="
                  expanded[`${def.part_of_speech}-idiom-${idiomIndex}`] ? [idiomIndex] : []
                "
                arrow-placement="left"
                class="idiom-collapse"
                :disabled="!idiom.examples?.length"
                @update:expanded-names="
                  idiom.examples?.length
                    ? toggleIdiomExamples(def.part_of_speech, idiomIndex)
                    : undefined
                "
              >
                <NCollapseItem :name="idiomIndex">
                  <template #header>
                    <div class="flex items-start space-x-3 py-2">
                      <div class="flex-1 min-w-0">
                        <div class="mb-3">
                          <NText class="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {{ idiom.idiom }}
                          </NText>
                        </div>
                        <div class="space-y-1">
                          <NText class="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                            {{ idiom.definition.Chinese }}
                          </NText>
                          <NText
                            depth="3"
                            class="text-xs italic"
                          >
                            {{ idiom.definition.English }}
                          </NText>
                        </div>
                      </div>
                    </div>
                  </template>
                  <div
                    v-if="idiom.examples?.length"
                    class="pl-6 pr-4 py-4 bg-gray-50/50 dark:bg-gray-800/30"
                  >
                    <div
                      v-for="(example, index) in idiom.examples"
                      :key="index"
                      class="last:mb-0 mb-3"
                    >
                      <div class="text-xs leading-relaxed">
                        <span class="text-gray-600 dark:text-gray-400">
                          {{ example.English }}
                        </span>
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {{ example.Chinese }}
                      </div>
                    </div>
                  </div>
                </NCollapseItem>
              </NCollapse>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dictionary-content {
  min-height: 100px;
  line-height: 1.8;
}

.n-collapse {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
}

.n-collapse-item__header {
  @apply px-4 py-3 bg-white hover:bg-gray-50;
  transition: background-color 0.2s ease;
}

.n-collapse-item__content-wrapper {
  overflow: hidden;
}

.n-collapse-item__content-inner {
  @apply p-0;
}

.n-collapse-item__arrow {
  @apply transition-transform duration-200;
}

.n-collapse-item__arrow--active {
  transform: rotate(90deg);
}

.n-tag--warning {
  background-color: #fef3c7 !important;
  color: #92400e !important;
  border: 1px solid #fbbf24 !important;
}

.idiom-collapse {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.idiom-collapse .n-collapse-item__header {
  @apply px-4 py-2 bg-transparent hover:bg-gray-100/50;
  transition: background-color 0.2s ease;
}

.idiom-collapse .n-collapse-item__content-wrapper {
  background: transparent;
}

.idiom-collapse .n-collapse-item__content-inner {
  @apply p-0;
}
</style>
