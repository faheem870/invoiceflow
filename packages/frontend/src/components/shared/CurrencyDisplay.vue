<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';

const props = withDefaults(
  defineProps<{
    amount: string | number;
    symbol?: string;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  {
    symbol: 'mUSDT',
    size: 'md',
  },
);

const formattedAmount = computed(() => {
  const num = typeof props.amount === 'string' ? parseFloat(props.amount) : props.amount;
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-sm';
    case 'lg':
      return 'text-2xl font-bold';
    case 'md':
    default:
      return 'text-base font-semibold';
  }
});
</script>

<template>
  <span :class="cn('inline-flex items-baseline gap-1 tabular-nums', sizeClasses)">
    <span>{{ formattedAmount }}</span>
    <span :class="cn('text-muted-foreground', size === 'lg' ? 'text-base font-normal' : 'text-xs font-normal')">
      {{ symbol }}
    </span>
  </span>
</template>
