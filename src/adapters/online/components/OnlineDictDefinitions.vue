<script setup lang="ts">
import { ref } from 'vue'
import { OnlineDictionaryEntry } from '@/types/dictionary'
import { NTag, NText, NCollapse, NCollapseItem, NSpace } from 'naive-ui'

const props = defineProps<{
  entry: OnlineDictionaryEntry
}>()

const expanded = ref<Record<string, boolean>>({})

// 切换例句的展开/收起状态
const toggleExamples = (partOfSpeech: string, senseNumber: string) => {
  const key = `${partOfSpeech}-${senseNumber}`
  expanded.value[key] = !expanded.value[key]
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
        <NTag
          size="small"
          :bordered="false"
          type="info"
          class="mb-4"
        >
          {{ def.part_of_speech }}
        </NTag>
        <NCollapse
          v-for="sense in def.senses || []"
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
</style>
