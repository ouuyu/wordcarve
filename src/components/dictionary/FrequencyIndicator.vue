<script setup lang="ts">
defineProps<{
  level: number
}>()
</script>

<template>
  <span
    class="frequency-indicator"
    :title="`词频等级: ${level}`"
  >
    <div class="signal-bars">
      <div
        v-for="i in 5"
        :key="i"
        class="bar"
        :class="{ active: i <= level }"
      />
    </div>
  </span>
</template>

<style scoped>
.frequency-indicator {
  display: inline-flex;
  align-items: flex-end;
  height: 0.75em;
  width: 0.75em;
  position: relative;
}

.signal-bars {
  display: flex;
  align-items: flex-end;
  height: 100%;
  width: 100%;
  gap: 1px;
}

.bar {
  flex: 1;
  background-color: #e0e0e0;
  border-radius: 1px;
}

.bar:nth-child(1) {
  height: 20%;
}
.bar:nth-child(2) {
  height: 40%;
}
.bar:nth-child(3) {
  height: 60%;
}
.bar:nth-child(4) {
  height: 80%;
}
.bar:nth-child(5) {
  height: 100%;
}

.bar.active {
  background-color: var(--theme-8);
}
</style>
