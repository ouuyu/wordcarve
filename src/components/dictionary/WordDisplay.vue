<script setup lang="ts">
import type { DictionaryEntry } from '../../types'

defineProps<{
  word: DictionaryEntry
}>()
</script>

<template>
  <div class="w-full flex flex-col items-start">
    <a-card bordered class="word-display-card max-w-2xl w-full p-4" style="margin-left:0;">
      <template #title>
        <div class="flex items-center gap-3">
          <span class="text-xl font-bold">{{ word.word }}</span>
          <span v-if="word.phonetic" class="text-gray-500">/{{ word.phonetic }}/</span>
        </div>
      </template>
      <a-tabs type="line" class="mt-2">
        <a-tab-pane key="definition" title="释义">
          <ul class="list-disc pl-6">
            <li v-for="(def, index) in word.definition" :key="index" class="mb-1">
              {{ def }}
            </li>
          </ul>
        </a-tab-pane>
        <a-tab-pane v-if="Object.keys(word.pos || {}).length" key="pos" title="词性">
          <div class="flex flex-wrap gap-2">
            <a-tag v-for="(count, pos) in word.pos" :key="pos">
              {{ pos }} ({{ count }})
            </a-tag>
          </div>
        </a-tab-pane>
        <a-tab-pane v-if="word.translation && word.translation.length" key="translation" title="翻译">
          <div>
            <p v-for="(trans, index) in word.translation" :key="index" class="mb-1">
              {{ trans }}
            </p>
          </div>
        </a-tab-pane>
        <a-tab-pane v-if="word.exchange || word.tag || word.bnc || word.frq" key="more" title="更多信息">
          <div v-if="word.exchange" class="mb-2">
            <h3 class="text-md mb-1 font-bold">
              词形变化:
            </h3>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="(form, type) in word.exchange" :key="type" class="flex items-center">
                <span class="w-20 text-gray-500">{{ type }}:</span>
                <span>{{ form }}</span>
              </div>
            </div>
          </div>
          <div v-if="word.tag && word.tag.length" class="mb-2">
            <h3 class="text-md mb-1 font-bold">
              标签:
            </h3>
            <div class="flex flex-wrap gap-2">
              <a-tag v-for="tag in word.tag" :key="tag">
                {{ tag }}
              </a-tag>
            </div>
          </div>
          <div v-if="word.bnc || word.frq">
            <h3 class="text-md mb-1 font-bold">
              频率信息:
            </h3>
            <div class="flex gap-4">
              <div v-if="word.bnc" class="text-sm">
                BNC排名: <span class="font-semibold">{{ word.bnc }}</span>
              </div>
              <div v-if="word.frq" class="text-sm">
                FRQ排名: <span class="font-semibold">{{ word.frq }}</span>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>
