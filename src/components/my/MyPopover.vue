<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  target: {
    type: Object as () => HTMLElement | null,
    default: null,
  },
  offset: {
    type: Number,
    default: 8,
  },
})

const italy = ref(false)
const popoverRef = ref<HTMLElement | null>(null)
const lastKnownStyle = ref<CSSProperties>({})

watch(
  () => props.target,
  (newTarget) => {
    if (newTarget) {
      const rect = newTarget.getBoundingClientRect()
      lastKnownStyle.value = {
        position: 'absolute',
        left: `${rect.left}px`,
        top: `${rect.bottom + props.offset}px`,
      }
      if (rect.left === 0) { // shitty hack
        italy.value = false
        return
      }
      italy.value = true
    }
  },
  { immediate: true },
)

const computedStyle = computed<CSSProperties>(() => {
  return props.target ? lastKnownStyle.value : lastKnownStyle.value || {}
})

function handleClick(event: MouseEvent) {
  if (popoverRef.value && popoverRef.value.contains(event.target as Node) && props.target && !props.target.contains(event.target as Node)) {
    italy.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClick)
})
</script>

<template>
  <Transition name="popover-slide">
    <Teleport v-if="visible && italy" to="body">
      <div ref="popoverRef" :style="computedStyle" class="my-popover">
        <div class="my-popover-content">
          <slot name="content" />
        </div>
      </div>
    </Teleport>
  </Transition>
</template>

<style scoped>
.my-popover {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 12px 16px;
  z-index: 999;
  opacity: 1;
}

/* Transition styles for popover appearance */
.popover-slide-enter-from,
.popover-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.popover-slide-enter-active,
.popover-slide-leave-active {
  transition: all 0.2s ease;
}
</style>
