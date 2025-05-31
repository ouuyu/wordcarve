<script setup lang="ts">
import { ref, computed } from 'vue'
import MyText from '@/components/my/MyText.vue'

interface Definition {
  part_of_speech: string
  senses?: {
    sense_number: string
    sense_label: string
    definition: {
      Chinese: string
      English: string
    }
    examples?: {
      English: string
      Chinese: string
    }[]
  }[]
  definitions?: string[]
}

interface DictionaryEntry {
  headword: string
  definitions: {
    权威英汉双解?: Definition[]
    英汉?: Definition[]
    英英?: Definition[]
  }
}

const props = defineProps<{
  entry: DictionaryEntry
}>()

const expanded = ref<{ [key: string]: boolean }>({})
const activeSource = ref<'权威英汉双解' | '英汉' | '英英'>('权威英汉双解')

const availableSources = computed(() => {
  const sources = []
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
  <div class="space-y-4">
    <!-- Dictionary Source Tabs -->
    <div class="flex gap-2 border-b border-gray-100 dark:border-dark-700 -mx-2">
      <button
        v-for="source in availableSources"
        :key="source"
        class="px-4 py-2 text-sm transition-colors relative"
        :class="[
          activeSource === source
            ? 'text-primary font-medium'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
        ]"
        @click="activeSource = source"
      >
        <span class="flex items-center gap-2">
          <div
            :class="{
              'i-carbon-translate': source !== '英英',
              'i-carbon-text-font': source === '英英',
            }"
          />
          {{ source }}
        </span>
        <div
          class="absolute bottom-0 left-0 right-0 h-0.5 rounded-t transition-colors"
          :class="activeSource === source ? 'bg-primary' : 'bg-transparent'"
        />
      </button>
    </div>

    <!-- Content -->
    <div class="min-h-30">
      <!-- 权威英汉双解 -->
      <div v-if="activeSource === '权威英汉双解' && entry?.definitions?.['权威英汉双解']">
        <div
          v-for="def in entry.definitions['权威英汉双解']"
          :key="def.part_of_speech"
          class="group"
        >
          <div class="text-xs font-medium op-50 mb-1">{{ def.part_of_speech }}</div>
          <div
            v-for="sense in def.senses || []"
            :key="sense.sense_number"
            class="pl-4 mb-3 last:mb-0"
          >
            <div class="flex items-baseline gap-2 mb-1">
              <span class="text-primary font-mono text-sm">{{ sense.sense_number }}.</span>
              <span class="font-medium">{{ sense.sense_label }}</span>
            </div>
            <div class="pl-4">
              <p class="mb-1">
                <span class="mr-2">{{ sense.definition.Chinese }}</span>
                <MyText
                  :text="sense.definition.English"
                  class="text-sm op-60"
                />
              </p>
              <div
                v-if="sense.examples?.length"
                class="relative"
              >
                <button
                  class="text-xs text-primary hover:text-primary-600 transition-colors flex items-center gap-1"
                  @click="toggleExample(sense.sense_number)"
                >
                  <div
                    i-carbon-chevron-right
                    class="transition-transform"
                    :class="expanded[sense.sense_number] ? 'rotate-90' : ''"
                  />
                  {{
                    expanded[sense.sense_number] ? '收起例句' : `${sense.examples.length} 个例句`
                  }}
                </button>
                <div
                  v-show="expanded[sense.sense_number]"
                  class="mt-2 space-y-2"
                >
                  <div
                    v-for="(example, index) in sense.examples"
                    :key="index"
                    class="pl-4 py-1 border-l-2 border-gray-100 dark:border-dark-700 group/example"
                  >
                    <MyText
                      :text="example.English"
                      class="block group-hover/example:text-primary transition-colors"
                    />
                    <div class="text-sm op-50 mt-0.5">{{ example.Chinese }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 英汉 -->
      <div v-if="activeSource === '英汉' && entry?.definitions?.['英汉']">
        <div
          v-for="def in entry.definitions['英汉']"
          :key="def.part_of_speech"
        >
          <div class="text-xs font-medium op-50 mb-2">{{ def.part_of_speech }}</div>
          <ul class="pl-4 space-y-1.5">
            <li
              v-for="(definition, index) in def.definitions || []"
              :key="index"
              class="flex items-baseline gap-2 group hover:text-primary transition-colors"
            >
              <span class="w-1 h-1 rounded-full bg-current op-50 mt-1.5" />
              <MyText :text="definition" />
            </li>
          </ul>
        </div>
      </div>

      <!-- 英英 -->
      <div v-if="activeSource === '英英' && entry?.definitions?.['英英']">
        <div
          v-for="def in entry.definitions['英英']"
          :key="def.part_of_speech"
        >
          <div class="text-xs font-medium op-50 mb-2">{{ def.part_of_speech }}</div>
          <ul class="pl-4 space-y-1.5">
            <li
              v-for="(definition, index) in def.definitions || []"
              :key="index"
              class="flex items-baseline gap-2 group hover:text-primary transition-colors"
            >
              <span class="w-1 h-1 rounded-full bg-current op-50 mt-1.5" />
              <MyText :text="definition" />
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 移除所有样式，全部使用 UnoCSS */
</style>
