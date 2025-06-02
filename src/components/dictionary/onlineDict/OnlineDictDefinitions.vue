<script setup lang="ts">
import { ref, computed } from 'vue'
import { OnlineDictionaryEntry, DictionarySource } from '@/types/dictionary'
import {
  NTabs,
  NTabPane,
  NCollapse,
  NCollapseItem,
  NIcon,
  NText,
  NTag,
  NList,
  NListItem,
  NDivider,
} from 'naive-ui'

const props = defineProps<{
  entry: OnlineDictionaryEntry
}>()

const expanded = ref<Record<string, boolean>>({})
const activeSource = ref<DictionarySource>('权威英汉双解')

const availableSources = computed(() => {
  const sources: DictionarySource[] = []
  if (props.entry?.definitions?.['权威英汉双解']?.length) sources.push('权威英汉双解')
  if (props.entry?.definitions?.['英汉']?.length) sources.push('英汉')
  if (props.entry?.definitions?.['英英']?.length) sources.push('英英')
  return sources
})

function toggleExample(key: string) {
  expanded.value[key] = !expanded.value[key]
}
</script>

<template>
  <div>
    <!-- Dictionary Source Tabs -->
    <NTabs
      v-model:value="activeSource"
      type="segment"
      size="small"
      animated
    >
      <NTabPane
        v-for="source in availableSources"
        :key="source"
        :name="source"
      >
        <template>
          <div class="flex items-center gap-2">
            <NIcon>
              <div
                :class="{
                  'i-carbon-translate': source !== '英英',
                  'i-carbon-text-font': source === '英英',
                }"
              />
            </NIcon>
            {{ source }}
          </div>
        </template>
      </NTabPane>
    </NTabs>

    <!-- Content -->
    <div class="dictionary-content mt-4">
      <!-- 权威英汉双解 -->
      <div v-if="activeSource === '权威英汉双解' && entry?.definitions?.['权威英汉双解']">
        <div
          v-for="def in entry.definitions['权威英汉双解']"
          :key="def.part_of_speech"
          class="mb-4"
        >
          <NTag
            size="small"
            :bordered="false"
            type="info"
            class="mb-2"
            >{{ def.part_of_speech }}</NTag
          >

          <div
            v-for="sense in def.senses || []"
            :key="sense.sense_number"
            class="pl-4 mb-3"
          >
            <div class="flex items-baseline gap-2 mb-2">
              <NText
                type="primary"
                class="font-mono"
                >{{ sense.sense_number }}.</NText
              >
              <NText strong>{{ sense.sense_label }}</NText>
            </div>

            <div class="pl-4">
              <p class="mb-2">
                <NText>{{ sense.definition.Chinese }}</NText>
                <NText
                  depth="3"
                  class="ml-2 text-sm"
                  >{{ sense.definition.English }}</NText
                >
              </p>

              <NCollapse
                v-if="sense.examples?.length"
                :default-expanded-names="[]"
              >
                <NCollapseItem
                  :title="`${sense.examples.length} 个例句`"
                  :name="sense.sense_number"
                >
                  <div class="space-y-3">
                    <div
                      v-for="(example, index) in sense.examples"
                      :key="index"
                      class="pl-3 py-1 border-l-2 border-gray-200 dark:border-gray-700"
                    >
                      <NText>{{ example.English }}</NText>
                      <NText
                        depth="3"
                        class="block mt-1 text-sm"
                        >{{ example.Chinese }}</NText
                      >
                    </div>
                  </div>
                </NCollapseItem>
              </NCollapse>
            </div>
          </div>
          <NDivider
            v-if="
              def !==
              entry.definitions['权威英汉双解'][entry.definitions['权威英汉双解'].length - 1]
            "
          />
        </div>
      </div>

      <!-- 英汉 -->
      <div v-if="activeSource === '英汉' && entry?.definitions?.['英汉']">
        <div
          v-for="def in entry.definitions['英汉']"
          :key="def.part_of_speech"
          class="mb-4"
        >
          <NTag
            size="small"
            :bordered="false"
            type="info"
            class="mb-2"
            >{{ def.part_of_speech }}</NTag
          >

          <NList bordered>
            <NListItem
              v-for="(definition, index) in def.definitions || []"
              :key="index"
            >
              {{ definition }}
            </NListItem>
          </NList>
        </div>
      </div>

      <!-- 英英 -->
      <div v-if="activeSource === '英英' && entry?.definitions?.['英英']">
        <div
          v-for="def in entry.definitions['英英']"
          :key="def.part_of_speech"
          class="mb-4"
        >
          <NTag
            size="small"
            :bordered="false"
            type="info"
            class="mb-2"
            >{{ def.part_of_speech }}</NTag
          >

          <NList bordered>
            <NListItem
              v-for="(definition, index) in def.definitions || []"
              :key="index"
            >
              {{ definition }}
            </NListItem>
          </NList>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dictionary-content {
  min-height: 100px;
}
</style>
