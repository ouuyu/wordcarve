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
  background-color: #f9f9fb;
}

.collocation-tag {
  cursor: pointer;
  transition: all 0.2s ease;
}

.collocation-tag:hover {
  background-color: #eaecf3;
}

:deep(.dark) .collocation-card {
  background-color: rgba(30, 30, 46, 0.6);
}

:deep(.dark) .collocation-tag:hover {
  background-color: rgba(50, 50, 70, 0.6);
}
</style>
