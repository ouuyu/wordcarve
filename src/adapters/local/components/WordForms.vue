<script setup lang="ts">
interface WordForm {
  type: string
  word: string
}

defineProps<{
  wordForms: WordForm[]
}>()
</script>

<template>
  <div v-if="wordForms.length > 0" class="mt-4 border-t border-gray-100 pt-3">
    <div class="flex flex-wrap gap-2">
      <span v-for="(form, index) in wordForms" :key="index" class="text-sm text-gray-600">
        <span class="font-medium">{{ form.type }}:</span> {{ form.word }}
      </span>
    </div>
  </div>
</template>
