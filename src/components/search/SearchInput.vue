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
    class="group relative flex items-center w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-theme-1/60 backdrop-blur-xl shadow-lg shadow-theme-3/10 border-0 transition-all duration-300 ease-out focus-within:bg-theme-1/70 focus-within:shadow-xl focus-within:shadow-theme-6/15 hover:shadow-xl hover:bg-theme-1/65"
  >
    <!-- 搜索图标/加载动画 -->
    <div class="flex-shrink-0 ml-3 sm:ml-5 w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200">
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
          class="i-carbon-search w-full h-full text-theme-6/70 group-focus-within:text-theme-6 group-hover:text-theme-7/80 transition-all duration-200 group-focus-within:scale-110"
        ></div>
        <div
          v-else
          key="loading"
          class="w-full h-full border-2 border-theme-3/50 border-t-theme-6 rounded-full animate-spin"
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
      class="flex-1 border-none bg-transparent outline-none px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-theme-9 placeholder-theme-6/60 disabled:text-theme-6/50 font-medium"
    />

    <!-- 清除按钮 (移动端显示) -->
    <button
      v-if="inputValue && !loading"
      @click="handleClear"
      class="flex-shrink-0 mr-3 sm:mr-4 w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center rounded-full bg-theme-3/60 hover:bg-theme-4/70 transition-all duration-200 active:scale-95 sm:hidden"
    >
      <div class="i-carbon-close w-3 h-3 text-theme-7"></div>
    </button>
  </div>
</template>
