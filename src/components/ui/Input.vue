<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  },
  maxLength: {
    type: Number,
    default: undefined
  },
  showWordLimit: {
    type: Boolean,
    default: false
  },
  allowClear: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur', 'clear'])

const focused = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

// 输入框类名
const inputClass = computed(() => {
  const classes = [
    'custom-input',
  ]
  
  // 尺寸
  if (props.size === 'sm') {
    classes.push('custom-input--sm')
  } else if (props.size === 'lg') {
    classes.push('custom-input--lg')
  } else {
    classes.push('custom-input--md')
  }
  
  // 状态
  if (props.disabled) {
    classes.push('custom-input--disabled')
  }
  
  if (props.error) {
    classes.push('custom-input--error')
  }
  
  if (focused.value) {
    classes.push('custom-input--focused')
  }
  
  return classes.join(' ')
})

// 包装器类名
const wrapperClass = computed(() => {
  return 'custom-input-wrapper'
})

// 处理输入
function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

// 处理变化
function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  emit('change', target.value)
}

// 处理聚焦
function handleFocus(e: FocusEvent) {
  focused.value = true
  emit('focus', e)
}

// 处理失焦
function handleBlur(e: FocusEvent) {
  focused.value = false
  emit('blur', e)
}

// 清除输入
function clearInput() {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

// 计算字数限制
const charCount = computed(() => {
  if (typeof props.modelValue === 'string') {
    return props.modelValue.length
  }
  if (typeof props.modelValue === 'number') {
    return String(props.modelValue).length
  }
  return 0
})
</script>

<template>
  <div :class="wrapperClass">
    <input
      ref="inputRef"
      :class="inputClass"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxLength"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    
    <!-- 清除按钮 -->
    <div
      v-if="allowClear && modelValue && !disabled && !readonly"
      class="absolute right-2 top-1/2 flex -translate-y-1/2 cursor-pointer items-center"
      @click="clearInput"
    >
      <span class="i-carbon:close-filled w-4 h-4 text-gray-400 hover:text-gray-600"></span>
    </div>
    
    <!-- 字数限制 -->
    <div
      v-if="showWordLimit && maxLength"
      class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400"
    >
      {{ charCount }}/{{ maxLength }}
    </div>
  </div>
</template>

<style scoped>
.custom-input-wrapper {
  position: relative;
  display: inline-flex;
  width: 100%;
}

.custom-input {
  width: 100%;
  border-radius: var(--border-radius-base);
  border: 1px solid var(--color-border);
  background-color: var(--color-bg);
  padding: 0 12px;
  transition: var(--transition-all);
  color: var(--color-text-primary);
  outline: none;
  font-size: 0.875rem;
}

.custom-input::placeholder {
  color: var(--color-text-placeholder);
}

.custom-input:hover:not(.custom-input--disabled) {
  border-color: var(--color-border-light);
}

.custom-input--focused:not(.custom-input--disabled) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-lighter);
}

.custom-input--error {
  border-color: var(--color-danger) !important;
}

.custom-input--error.custom-input--focused {
  box-shadow: 0 0 0 2px var(--color-danger-light) !important;
}

.custom-input--disabled {
  background-color: var(--color-bg-lighter);
  cursor: not-allowed;
  opacity: 0.7;
}

/* Sizes */
.custom-input--sm {
  height: 32px;
  font-size: 0.8125rem;
}

.custom-input--md {
  height: 40px;
}

.custom-input--lg {
  height: 48px;
  font-size: 1rem;
}

/* 清除按钮 */
.custom-input-wrapper .i-carbon\:close-filled {
  color: var(--color-text-secondary);
  transition: var(--transition-all);
}

.custom-input-wrapper .i-carbon\:close-filled:hover {
  color: var(--color-text-regular);
}

/* 字数限制 */
.custom-input-wrapper div[class*="absolute right-2"] {
  color: var(--color-text-secondary);
}
</style> 