<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
  status: string;
}>();

const statusConfig: Record<string, { label: string; classes: string }> = {
  draft: { label: 'Draft', classes: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  awaiting_approval: { label: 'Awaiting Approval', classes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  approved: { label: 'Approved', classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  listed: { label: 'Listed', classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  sold: { label: 'Sold', classes: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  disputed: { label: 'Disputed', classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  paid: { label: 'Paid', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  cancelled: { label: 'Cancelled', classes: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
};

const config = computed(() => {
  return statusConfig[props.status] ?? { label: props.status, classes: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' };
});
</script>

<template>
  <span
    :class="cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      config.classes,
    )"
  >
    {{ config.label }}
  </span>
</template>
