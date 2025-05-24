<script setup lang="ts">
defineProps({
  icon: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="flex flex-col items-center border border-gray-100 rounded-lg bg-gray-50/50 p-4 transition-all">
    <div class="mb-2 text-lg text-gray-700">
      <span :class="[icon, 'w-6 h-6']"></span>
    </div>
    <h3 class="mb-2 text-center font-medium">
      {{ title }}
    </h3>
    <p class="mb-4 text-center text-sm text-gray-500">
      {{ description }}
    </p>
    <slot />
  </div>
</template>
