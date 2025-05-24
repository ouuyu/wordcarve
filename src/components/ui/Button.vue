<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value: string) => ['default', 'primary', 'outline', 'text', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['xs', 'sm', 'md', 'lg'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

// 计算按钮类名
const buttonClass = computed(() => {
  const classes = ['custom-button']; // Base class for new styles

  // Add type-specific class. props.type is guaranteed by validator and default.
  classes.push(`custom-button--${props.type}`);

  // Add size-specific class. props.size is guaranteed by validator and default.
  classes.push(`custom-button--${props.size}`);

  if (props.disabled || props.loading) {
    classes.push('custom-button--disabled');
  }

  // Add w-full for block buttons (UnoCSS utility class)
  if (props.block) {
    classes.push('w-full');
  }
  
  return classes.join(' ');
});

// 计算图标类
const iconClass = computed(() => {
  if (props.size === 'xs' || props.size === 'sm') {
    return 'w-4 h-4 mr-1'
  } else if (props.size === 'lg') {
    return 'w-6 h-6 mr-1'
  }
  return 'w-5 h-5 mr-1'
})
</script>

<template>
  <button 
    :class="buttonClass" 
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="i-svg-spinners:270-ring-with-bg" :class="iconClass"></span>
    <span v-else-if="icon" :class="['i-' + icon, iconClass]"></span>
    <slot></slot>
  </button>
</template> 

<style scoped>
.custom-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--border-radius-base);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-all);
  white-space: nowrap;
  user-select: none;
  position: relative;
  line-height: 1.4;
  overflow: hidden;
  box-shadow: var(--shadow-light);
}

.custom-button:focus {
  outline: none;
  ring: 2px var(--color-primary);
}

.custom-button:after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent;
  transition: background-color 0.2s;
  pointer-events: none;
}

.custom-button:hover:after {
  background-color: rgba(255, 255, 255, 0.1);
}

.custom-button:active:after {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Default Type */
.custom-button--default {
  color: var(--color-text-primary);
  background-color: var(--color-bg-light);
}

.custom-button--default:hover {
  background-color: var(--color-bg-lighter);
  transform: translateY(-1px);
}

.custom-button--default:active {
  transform: translateY(0);
}

/* Primary Type */
.custom-button--primary {
  color: #fff;
  background-color: var(--color-primary);
}

.custom-button--primary:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-hover);
}

.custom-button--primary:active {
  background-color: var(--color-primary-active);
  transform: translateY(0);
  box-shadow: var(--shadow-light);
}

/* Outline Type */
.custom-button--outline {
  color: var(--color-primary);
  background-color: transparent;
  box-shadow: inset 0 0 0 1.5px var(--color-primary);
}

.custom-button--outline:hover {
  background-color: var(--color-primary-lighter);
  transform: translateY(-1px);
  box-shadow: inset 0 0 0 1.5px var(--color-primary-hover), var(--shadow-light);
}

.custom-button--outline:active {
  background-color: var(--color-primary-light);
  transform: translateY(0);
  box-shadow: inset 0 0 0 1.5px var(--color-primary-active);
}

/* Text Type */
.custom-button--text {
  color: var(--color-primary);
  background-color: transparent;
  box-shadow: none;
}

.custom-button--text:hover {
  color: var(--color-primary-hover);
  background-color: var(--color-primary-lighter);
}

.custom-button--text:active {
  color: var(--color-primary-active);
  background-color: var(--color-primary-light);
}

/* Danger Type */
.custom-button--danger {
  color: #fff;
  background-color: var(--color-danger);
}

.custom-button--danger:hover {
  background-color: var(--color-danger-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-hover);
}

.custom-button--danger:active {
  background-color: var(--color-danger-active);
  transform: translateY(0);
  box-shadow: var(--shadow-light);
}

/* Sizes */
.custom-button--xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: var(--border-radius-small);
}

.custom-button--sm {
  padding: 0.45rem 0.75rem;
  font-size: 0.8125rem;
  border-radius: var(--border-radius-small);
}

.custom-button--md {
  padding: 0.58rem 1rem;
  font-size: 0.875rem;
  border-radius: var(--border-radius-medium);
}

.custom-button--lg {
  padding: 0.7rem 1.4rem;
  font-size: 1rem;
  border-radius: var(--border-radius-large);
}

/* Disabled State */
.custom-button--disabled,
.custom-button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
  box-shadow: none;
  filter: grayscale(20%);
}

/* Ensure icons align well vertically with text */
.custom-button .i-svg-spinners\:270-ring-with-bg,
.custom-button span[class*="i-"] {
  vertical-align: -0.125em;
}
</style> 