<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [query: string]
  clear: []
}>()

const inputValue = ref(props.modelValue)
const inputRef = ref<HTMLInputElement | null>(null)

watch(
  () => props.modelValue,
  newValue => {
    inputValue.value = newValue
  },
)

watch(inputValue, newValue => {
  emit('update:modelValue', newValue)
})

const handleSearch = () => {
  const query = inputValue.value.trim()
  if (query) emit('search', query)
}

const handleClear = () => {
  inputValue.value = ''
  emit('update:modelValue', '')
  emit('clear')
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const focusInput = () => {
  inputRef.value?.focus()
}

defineExpose({ focus: focusInput })
</script>

<template>
  <div
    class="group relative flex items-center w-full h-14 rounded-2xl bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-md shadow-lg shadow-gray-200/50 ring-1 ring-gray-200/60 transition-all duration-300 ease-out focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:shadow-xl focus-within:shadow-blue-200/30 hover:shadow-xl hover:shadow-gray-300/40 hover:ring-gray-300/70 hover:from-white/98 hover:to-white/95"
  >
    <!-- 搜索图标/加载动画 -->
    <div class="flex-shrink-0 ml-5 w-5 h-5 transition-all duration-200">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-75 rotate-45"
        enter-to-class="opacity-100 scale-100 rotate-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 scale-100 rotate-0"
        leave-to-class="opacity-0 scale-75 rotate-45"
        mode="out-in"
      >
        <div
          v-if="!loading"
          key="search"
          class="i-carbon-search w-full h-full text-gray-400 group-focus-within:text-blue-500 group-hover:text-gray-500 transition-all duration-200 group-focus-within:scale-110"
        ></div>
        <div
          v-else
          key="loading"
          class="w-full h-full border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"
        ></div>
      </Transition>
    </div>

    <!-- 输入框 -->
    <input
      ref="inputRef"
      v-model="inputValue"
      :placeholder="placeholder"
      :disabled="loading"
      @keydown.enter="handleSearch"
      class="flex-1 border-none bg-transparent outline-none px-4 py-3 text-base text-gray-700 placeholder-gray-400 disabled:text-gray-500 font-medium"
    />
  </div>
</template>
