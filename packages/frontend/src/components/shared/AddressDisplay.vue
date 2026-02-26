<script setup lang="ts">
import { ref, computed } from 'vue';
import { cn } from '@/lib/utils';

const props = withDefaults(
  defineProps<{
    address: string;
    truncate?: boolean;
    copyable?: boolean;
  }>(),
  {
    truncate: true,
    copyable: true,
  },
);

const copied = ref(false);

const displayAddress = computed(() => {
  if (props.truncate && props.address.length > 10) {
    return `${props.address.slice(0, 6)}...${props.address.slice(-4)}`;
  }
  return props.address;
});

async function copyAddress() {
  if (!props.copyable) return;
  try {
    await navigator.clipboard.writeText(props.address);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    // Clipboard API not available
  }
}
</script>

<template>
  <span
    :class="cn(
      'inline-flex items-center gap-1.5 font-mono text-sm',
      copyable && 'cursor-pointer hover:text-primary transition-colors',
    )"
    :title="address"
    @click="copyAddress"
  >
    <span>{{ displayAddress }}</span>
    <svg
      v-if="copyable"
      xmlns="http://www.w3.org/2000/svg"
      :class="cn('h-3.5 w-3.5 flex-shrink-0', copied ? 'text-green-500' : 'text-muted-foreground')"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <template v-if="copied">
        <polyline points="20 6 9 17 4 12" />
      </template>
      <template v-else>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </template>
    </svg>
  </span>
</template>
