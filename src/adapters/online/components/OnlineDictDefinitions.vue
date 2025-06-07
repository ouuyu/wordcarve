<script setup lang="ts">
import { ref } from 'vue'
import { OnlineDictionaryEntry } from '@/types/dictionary'
import { NTag, NText, NCollapse, NCollapseItem } from 'naive-ui'

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
          class="mb-3"
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
          class="mb-1 overflow-hidden transition-all duration-300 ease-in-out"
        >
          <NCollapseItem :name="sense.sense_number">
            <template #header>
              <div class="flex items-center space-x-3">
                <NText
                  type="primary"
                  class="font-mono w-8 text-base"
                  >{{ sense.sense_number }}.</NText
                >
                <div class="flex-1 min-w-0">
                  <NText class="text-base">{{ sense.definition.Chinese }}</NText>
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
              class="pl-10 pr-4 py-1 transition-all duration-200"
            >
              <div
                v-for="(example, index) in sense.examples"
                :key="index"
              >
                <span>
                  {{ example.English }}
                </span>
                <span class="text-gray ml-2">
                  {{ example.Chinese }}
                </span>
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
  line-height: 1.7;
}

/* 折叠面板优化 */
.n-collapse {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
}

.n-collapse-item__header {
  @apply py-2.5 px-4 bg-gray-50 hover:bg-gray-100;
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
</style>
