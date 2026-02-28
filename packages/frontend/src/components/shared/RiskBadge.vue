<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';

const props = withDefaults(
  defineProps<{
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    discount?: number;
  }>(),
  {
    discount: undefined,
  },
);

const levelConfig = computed(() => {
  switch (props.level) {
    case 'LOW':
      return { label: 'Low Risk', classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
    case 'MEDIUM':
      return { label: 'Medium Risk', classes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
    case 'HIGH':
      return { label: 'High Risk', classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    default:
      return { label: props.level, classes: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' };
  }
});
</script>

<template>
  <span
    :class="cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
      levelConfig.classes,
    )"
  >
    <span>{{ levelConfig.label }}</span>
    <span
      v-if="discount !== undefined"
      class="opacity-75"
    >
      ({{ discount.toFixed(1) }}%)
    </span>
  </span>
</template>
