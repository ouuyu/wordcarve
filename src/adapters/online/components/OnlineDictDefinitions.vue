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
          @update:expanded-names="toggleExamples(def.part_of_speech, sense.sense_number)"
          arrow-placement="left"
          class="mb-3 overflow-hidden transition-all duration-300 ease-in-out"
        >
          <NCollapseItem :name="sense.sense_number">
            <template #header>
              <div class="flex items-center space-x-3 py-1">
                <NText
                  type="primary"
                  class="font-mono w-8 text-base"
                  >{{ sense.sense_number }}.</NText
                >
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <!-- 语法标签 -->
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
                    <!-- 模式 -->
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
              class="pl-10 pr-4 py-3 transition-all duration-200"
            >
              <div
                v-for="(example, index) in sense.examples"
                :key="index"
                class="mb-2 last:mb-0"
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

/* 折叠面板优化 */
.n-collapse {
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.n-collapse-item__header {
  @apply py-3 px-5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700;
  transition: background-color 0.2s ease;
}

.n-collapse-item__content-wrapper {
  transition:
    height 0.3s ease-in-out,
    opacity 0.2s ease-in-out;
  overflow: hidden;
}

.n-collapse-item__content-inner {
  @apply p-0;
}

.n-collapse-item__content-wrapper--inactive {
  opacity: 0;
  height: 0 !important;
}

/* 折叠指示器优化 */
.n-collapse-item__arrow {
  @apply transition-transform duration-300;
}

.n-collapse-item__arrow--active {
  @apply rotate-90;
}

/* 语法标签样式优化 */
.n-tag--warning {
  background-color: #fef3c7 !important;
  color: #92400e !important;
  border: 1px solid #fbbf24 !important;
}

/* 暗色模式下的语法标签 */
.dark .n-tag--warning {
  background-color: #451a03 !important;
  color: #fbbf24 !important;
  border: 1px solid #92400e !important;
}

/* 增加整体间距 */
.mb-6 {
  margin-bottom: 2rem;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.mb-3 {
  margin-bottom: 1rem;
}
</style>
