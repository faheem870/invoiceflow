<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
  status: string;
}>();

const statusConfig: Record<string, { label: string; classes: string }> = {
  draft: { label: 'Draft', classes: 'bg-gray-100 text-gray-700' },
  awaiting_approval: { label: 'Awaiting Approval', classes: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Approved', classes: 'bg-green-100 text-green-700' },
  listed: { label: 'Listed', classes: 'bg-blue-100 text-blue-700' },
  sold: { label: 'Sold', classes: 'bg-purple-100 text-purple-700' },
  disputed: { label: 'Disputed', classes: 'bg-red-100 text-red-700' },
  paid: { label: 'Paid', classes: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelled', classes: 'bg-slate-100 text-slate-700' },
};

const config = computed(() => {
  return statusConfig[props.status] ?? { label: props.status, classes: 'bg-gray-100 text-gray-700' };
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
