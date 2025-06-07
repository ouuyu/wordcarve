<script setup lang="ts">
import { CollocationGroup } from '@/types/dictionary'
import { NCard, NTag, NSpace, NText } from 'naive-ui'

const props = defineProps<{ collocations?: CollocationGroup[] }>()
</script>

<template>
  <div
    v-if="collocations?.length"
    class="collocations-container"
  >
    <NSpace
      vertical
      :size="16"
    >
      <NCard
        v-for="coll in collocations"
        :key="coll.type"
        size="small"
        class="collocation-card"
      >
        <template #header>
          <NText strong>{{ coll.type }}</NText>
        </template>
        <NSpace
          :size="8"
          wrap
        >
          <NTag
            v-for="item in coll.items"
            :key="item"
            round
            size="medium"
            class="collocation-tag"
          >
            {{ item }}
          </NTag>
        </NSpace>
      </NCard>
    </NSpace>
  </div>
</template>

<style scoped>
.collocation-card {
  background: var(--theme-1);
  opacity: 0.7;
}

.collocation-tag {
  cursor: pointer;
  transition: all 0.2s ease;
}

.collocation-tag:hover {
  background-color: var(--theme-3);
}

:deep(.dark) .collocation-card {
  background: var(--theme-8);
  opacity: 0.8;
}

:deep(.dark) .collocation-tag:hover {
  background-color: var(--theme-7);
}
</style>
