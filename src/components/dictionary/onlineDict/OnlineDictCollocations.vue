<script setup lang="ts">
import MyText from '@/components/my/MyText.vue'
const props = defineProps<{ collocations: any[] }>()
</script>

<template>
  <div
    v-if="collocations?.length"
    class="collocations-container"
  >
    <div
      v-for="coll in collocations"
      :key="coll.type"
      class="collocation-group"
    >
      <div class="collocation-type">
        <MyText :text="coll.type" />
      </div>
      <div class="collocation-items">
        <span
          v-for="item in coll.items"
          :key="item"
          class="collocation-item"
        >
          <MyText :text="item" />
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.collocations-container {
  @apply space-y-6;
}

.collocation-group {
  @apply space-y-3 p-4 rounded-lg
    bg-gray-50 dark:bg-gray-800/50;
}

.collocation-type {
  @apply text-sm font-medium
    text-gray-700 dark:text-gray-300;
}

.collocation-items {
  @apply flex flex-wrap gap-2;
}

.collocation-item {
  @apply px-3 py-1.5 rounded-full text-sm
    bg-gray-100 dark:bg-gray-700
    text-gray-700 dark:text-gray-300
    hover:bg-gray-200 dark:hover:bg-gray-600
    transition-colors cursor-pointer;
}
</style>
