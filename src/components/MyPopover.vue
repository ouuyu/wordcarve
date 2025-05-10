<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, ref, watch } from 'vue'

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
</script>

<template>
  <Transition name="popover-slide">
    <Teleport v-if="visible && italy" to="body">
      <div :style="computedStyle" class="my-popover">
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
