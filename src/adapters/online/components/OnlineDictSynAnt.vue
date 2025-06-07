<script setup lang="ts">
import { NCard, NTag, NSpace, NText, NDivider, NIcon } from 'naive-ui'
import MyText from '@/components/my/MyText.vue'

const props = defineProps<{ synonyms: any[]; antonyms: any[] }>()
</script>

<template>
  <div class="synonym-container">
    <!-- Synonyms -->
    <div
      v-if="synonyms?.length"
      class="mb-5"
    >
      <div class="section-header flex items-center gap-2 mb-3">
        <NIcon
          size="20"
          color="#0e7a0d"
        >
          <div i-carbon-arrow-right />
        </NIcon>
        <NText
          type="success"
          strong
          >同义词</NText
        >
      </div>

      <NSpace
        vertical
        :size="12"
      >
        <NCard
          v-for="syn in synonyms"
          :key="syn.part_of_speech"
          size="small"
          class="synonym-card"
        >
          <template #header>
            <NText
              italic
              depth="3"
              class="text-sm"
            >
              <MyText :text="syn.part_of_speech" />
            </NText>
          </template>

          <NSpace
            :size="8"
            wrap
          >
            <NTag
              v-for="item in syn.items"
              :key="item"
              type="success"
              round
              class="word-tag"
            >
              <MyText :text="item" />
            </NTag>
          </NSpace>
        </NCard>
      </NSpace>
    </div>

    <NDivider v-if="synonyms?.length && antonyms?.length" />

    <!-- Antonyms -->
    <div
      v-if="antonyms?.length"
      class="mt-5"
    >
      <div class="section-header flex items-center gap-2 mb-3">
        <NIcon
          size="20"
          color="#d03050"
        >
          <div i-carbon-arrow-left />
        </NIcon>
        <NText
          type="error"
          strong
          >反义词</NText
        >
      </div>

      <NSpace
        vertical
        :size="12"
      >
        <NCard
          v-for="ant in antonyms"
          :key="ant.part_of_speech"
          size="small"
          class="antonym-card"
        >
          <template #header>
            <NText
              italic
              depth="3"
              class="text-sm"
            >
              <MyText :text="ant.part_of_speech" />
            </NText>
          </template>

          <NSpace
            :size="8"
            wrap
          >
            <NTag
              v-for="item in ant.items"
              :key="item"
              type="error"
              round
              class="word-tag"
            >
              <MyText :text="item" />
            </NTag>
          </NSpace>
        </NCard>
      </NSpace>
    </div>
  </div>
</template>

<style scoped>
.synonym-card,
.antonym-card {
  background: var(--theme-1);
  opacity: 0.7;
  transition: all 0.2s ease;
}

.word-tag {
  cursor: pointer;
  transition: all 0.2s ease;
}

.section-header {
  margin-bottom: 12px;
}

:deep(.dark) .synonym-card,
:deep(.dark) .antonym-card {
  background: var(--theme-8);
  opacity: 0.8;
}
</style>
