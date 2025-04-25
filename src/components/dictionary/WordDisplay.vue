<script setup lang="ts">
import type { DictionaryEntry } from '../../types'

defineProps<{
  word: DictionaryEntry
}>()
</script>

<template>
  <a-card bordered class="word-display-card">
    <template #title>
      <div class="flex items-center gap-3">
        <span class="text-xl font-bold">{{ word.word }}</span>
        <span v-if="word.phonetic" class="text-gray-500">/{{ word.phonetic }}/</span>
      </div>
    </template>

    <a-divider class="my-3" />

    <!-- Word definitions -->
    <div class="mb-4">
      <h3 class="text-md mb-2 font-bold">
        释义:
      </h3>
      <ul class="list-disc pl-6">
        <li v-for="(def, index) in word.definition" :key="index" class="mb-1">
          {{ def }}
        </li>
      </ul>
    </div>

    <!-- Part of speech -->
    <div v-if="Object.keys(word.pos || {}).length" class="mb-4">
      <h3 class="text-md mb-2 font-bold">
        词性:
      </h3>
      <div class="flex flex-wrap gap-2">
        <a-tag v-for="(count, pos) in word.pos" :key="pos">
          {{ pos }} ({{ count }})
        </a-tag>
      </div>
    </div>

    <!-- Translations -->
    <div v-if="word.translation && word.translation.length" class="mb-4">
      <h3 class="text-md mb-2 font-bold">
        翻译:
      </h3>
      <div>
        <p v-for="(trans, index) in word.translation" :key="index" class="mb-1">
          {{ trans }}
        </p>
      </div>
    </div>

    <!-- Extended info -->
    <a-collapse v-if="word.exchange || word.tag">
      <a-collapse-item header="更多信息">
        <!-- Word forms -->
        <div v-if="word.exchange" class="mb-4">
          <h3 class="text-md mb-2 font-bold">
            词形变化:
          </h3>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="(form, type) in word.exchange" :key="type" class="flex items-center">
              <span class="w-20 text-gray-500">{{ type }}:</span>
              <span>{{ form }}</span>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="word.tag && word.tag.length" class="mb-4">
          <h3 class="text-md mb-2 font-bold">
            标签:
          </h3>
          <div class="flex flex-wrap gap-2">
            <a-tag v-for="tag in word.tag" :key="tag">
              {{ tag }}
            </a-tag>
          </div>
        </div>

        <!-- Frequency info -->
        <div v-if="word.bnc || word.frq" class="mb-4">
          <h3 class="text-md mb-2 font-bold">
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
      </a-collapse-item>
    </a-collapse>
  </a-card>
</template>
