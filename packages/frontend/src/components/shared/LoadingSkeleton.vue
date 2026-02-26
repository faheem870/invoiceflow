<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    lines?: number;
    type?: 'text' | 'card' | 'table';
  }>(),
  {
    lines: 3,
    type: 'text',
  },
);

const lineWidths = computed(() => {
  return Array.from({ length: props.lines }, (_, i) => {
    // Vary widths for a more natural look
    const widths = ['w-full', 'w-3/4', 'w-5/6', 'w-2/3', 'w-4/5'];
    return widths[i % widths.length];
  });
});
</script>

<template>
  <!-- Text skeleton -->
  <div v-if="type === 'text'" class="space-y-3">
    <div
      v-for="(width, i) in lineWidths"
      :key="i"
      :class="['h-4 rounded bg-muted animate-pulse', width]"
    />
  </div>

  <!-- Card skeleton -->
  <div v-else-if="type === 'card'" class="space-y-4">
    <div
      v-for="i in lines"
      :key="i"
      class="rounded-lg border border-border bg-card p-6"
    >
      <div class="flex items-center justify-between mb-4">
        <div class="h-4 w-24 rounded bg-muted animate-pulse" />
        <div class="h-8 w-8 rounded-md bg-muted animate-pulse" />
      </div>
      <div class="h-7 w-32 rounded bg-muted animate-pulse mb-2" />
      <div class="h-3 w-20 rounded bg-muted animate-pulse" />
    </div>
  </div>

  <!-- Table skeleton -->
  <div v-else-if="type === 'table'" class="w-full">
    <!-- Header -->
    <div class="flex gap-4 border-b border-border pb-3 mb-3">
      <div class="h-4 w-1/4 rounded bg-muted animate-pulse" />
      <div class="h-4 w-1/4 rounded bg-muted animate-pulse" />
      <div class="h-4 w-1/4 rounded bg-muted animate-pulse" />
      <div class="h-4 w-1/4 rounded bg-muted animate-pulse" />
    </div>
    <!-- Rows -->
    <div
      v-for="i in lines"
      :key="i"
      class="flex gap-4 py-3 border-b border-border last:border-0"
    >
      <div class="h-4 w-1/4 rounded bg-muted animate-pulse" />
      <div class="h-4 w-1/4 rounded bg-muted animate-pulse" />
      <div class="h-4 w-1/4 rounded bg-muted animate-pulse" />
      <div class="h-4 w-1/4 rounded bg-muted animate-pulse" />
    </div>
  </div>
</template>
