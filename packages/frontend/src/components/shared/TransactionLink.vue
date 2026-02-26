<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    txHash: string;
    chainId?: number;
  }>(),
  {
    chainId: 97,
  },
);

const explorerBaseUrls: Record<number, string> = {
  97: 'https://testnet.bscscan.com/tx/',
  5611: 'https://opbnb-testnet.bscscan.com/tx/',
};

const explorerUrl = computed(() => {
  const base = explorerBaseUrls[props.chainId] ?? explorerBaseUrls[97];
  return `${base}${props.txHash}`;
});

const truncatedHash = computed(() => {
  if (props.txHash.length > 10) {
    return `${props.txHash.slice(0, 6)}...${props.txHash.slice(-4)}`;
  }
  return props.txHash;
});
</script>

<template>
  <a
    :href="explorerUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="inline-flex items-center gap-1 font-mono text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
    :title="txHash"
  >
    <span>{{ truncatedHash }}</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-3.5 w-3.5 flex-shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  </a>
</template>
