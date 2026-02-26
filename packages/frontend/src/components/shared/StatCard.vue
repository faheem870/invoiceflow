<script setup lang="ts">
import { cn } from '@/lib/utils';

defineProps<{
  label: string;
  value: string | number;
  change?: string;
  icon?: string;
}>();
</script>

<template>
  <div class="rounded-lg border border-border bg-card p-6">
    <div class="flex items-center justify-between">
      <p class="text-sm font-medium text-muted-foreground">{{ label }}</p>
      <div
        v-if="icon"
        class="h-8 w-8 rounded-md bg-muted flex items-center justify-center"
      >
        <span class="text-sm text-muted-foreground">{{ icon }}</span>
      </div>
    </div>
    <div class="mt-2">
      <p class="text-2xl font-bold text-card-foreground">{{ value }}</p>
      <p
        v-if="change"
        :class="cn(
          'mt-1 text-xs font-medium',
          change.startsWith('+') ? 'text-green-600' : change.startsWith('-') ? 'text-red-600' : 'text-muted-foreground',
        )"
      >
        {{ change }}
      </p>
    </div>
  </div>
</template>
