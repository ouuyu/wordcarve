<script setup lang="ts">
import { ref, computed } from 'vue'
import { CambridgeDictionaryEntry } from '@/types/dictionary'
import { NCollapse, NCollapseItem, NText, NTag, NDivider } from 'naive-ui'

const props = defineProps<{
  entry: CambridgeDictionaryEntry
}>()

// 按词性分组定义
const definitionsByPos = computed(() => {
  const grouped: Record<string, typeof props.entry.definition> = {}

  props.entry.definition?.forEach(def => {
    if (!grouped[def.pos]) {
      grouped[def.pos] = []
    }
    grouped[def.pos].push(def)
  })

  return grouped
})
</script>

<template>
  <div class="min-h-100px">
    <div class="dictionary-content">
      <div
        v-for="(definitions, pos) in definitionsByPos"
        :key="pos"
        class="mb-6"
      >
        <NTag
          size="medium"
          :bordered="false"
          type="info"
          class="mb-4"
        >
          {{ pos }}
        </NTag>

        <div class="space-y-4">
          <div
            v-for="(definition, index) in definitions"
            :key="definition.id"
            class="pl-4 border-l-2 border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-baseline gap-2 mb-2">
              <NText
                type="primary"
                class="font-mono text-sm"
              >
                {{ index + 1 }}.
              </NText>
              <div class="flex-1">
                <NText class="text-base leading-relaxed">
                  {{ definition.text }}
                </NText>

                <NTag
                  v-if="definition.source"
                  size="tiny"
                  :bordered="false"
                  type="default"
                  class="ml-2"
                >
                  {{ definition.source }}
                </NTag>
              </div>
            </div>

            <div
              v-if="definition.example?.length"
              class="mt-3"
            >
              <NCollapse
                :default-expanded-names="[]"
                class="cambridge-examples"
              >
                <NCollapseItem
                  :title="`${definition.example.length} 个例句`"
                  :name="definition.id"
                >
                  <div class="space-y-2 pt-2">
                    <div
                      v-for="example in definition.example"
                      :key="example.id"
                      class="pl-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                    >
                      <NText class="text-sm leading-relaxed">
                        {{ example.text }}
                      </NText>
                      <NText
                        v-if="example.translation"
                        depth="3"
                        class="block mt-1 text-xs"
                      >
                        {{ example.translation }}
                      </NText>
                    </div>
                  </div>
                </NCollapseItem>
              </NCollapse>
            </div>
          </div>
        </div>

        <NDivider
          v-if="
            Object.keys(definitionsByPos).length > 1 &&
            pos !== Object.keys(definitionsByPos)[Object.keys(definitionsByPos).length - 1]
          "
          class="!my-6"
        />
      </div>

      <div
        v-if="!entry.definition?.length"
        class="text-center py-8 text-gray-500 dark:text-gray-400"
      >
        <NText depth="3"> 暂无释义数据 </NText>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cambridge-examples :deep(.n-collapse-item__header) {
  font-size: 0.875rem; /* text-sm */
  color: var(--text-color-2);
}
</style>
