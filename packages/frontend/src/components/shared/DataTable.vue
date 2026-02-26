<script setup lang="ts">
import { cn } from '@/lib/utils';
import LoadingSkeleton from './LoadingSkeleton.vue';

interface Column {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}

withDefaults(
  defineProps<{
    columns: Column[];
    data: Record<string, any>[];
    loading?: boolean;
  }>(),
  {
    loading: false,
  },
);

function getAlignClass(align?: 'left' | 'center' | 'right'): string {
  switch (align) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    case 'left':
    default:
      return 'text-left';
  }
}
</script>

<template>
  <div class="w-full overflow-x-auto rounded-lg border border-border">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-border bg-muted/50">
          <th
            v-for="col in columns"
            :key="col.key"
            :class="cn(
              'px-4 py-3 font-medium text-muted-foreground',
              getAlignClass(col.align),
            )"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody v-if="loading">
        <tr>
          <td :colspan="columns.length" class="p-4">
            <LoadingSkeleton type="table" :lines="5" />
          </td>
        </tr>
      </tbody>
      <tbody v-else-if="data.length === 0">
        <tr>
          <td
            :colspan="columns.length"
            class="px-4 py-8 text-center text-muted-foreground"
          >
            No data available
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr
          v-for="(row, rowIndex) in data"
          :key="rowIndex"
          class="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            :class="cn(
              'px-4 py-3 text-card-foreground',
              getAlignClass(col.align),
            )"
          >
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]" :index="rowIndex">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
