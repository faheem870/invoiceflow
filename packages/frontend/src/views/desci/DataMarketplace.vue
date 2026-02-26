<script setup lang="ts">
import { ref } from 'vue';

const datasets = ref([
  { id: 1, title: 'Invoice Payment Timing Dataset Q1 2026', records: 1250, price: '50', description: 'Anonymized payment timing data including days-to-settlement and on-time ratios.', hasAccess: false },
  { id: 2, title: 'Payer Reliability Scores', records: 320, price: '100', description: 'Aggregated payer reliability metrics across multiple invoice interactions.', hasAccess: true },
  { id: 3, title: 'Industry Sector Payment Trends', records: 800, price: '75', description: 'Payment behavior patterns segmented by industry sector tags.', hasAccess: false },
]);
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Data Marketplace</h1>
      <p class="text-muted-foreground mt-1">Browse and purchase anonymized research datasets</p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="ds in datasets" :key="ds.id" class="rounded-lg border border-border bg-card p-6 flex flex-col">
        <h3 class="font-semibold mb-2">{{ ds.title }}</h3>
        <p class="text-sm text-muted-foreground mb-4 flex-1">{{ ds.description }}</p>
        <div class="flex items-center justify-between text-sm mb-4">
          <span class="text-muted-foreground">{{ ds.records.toLocaleString() }} records</span>
          <span class="font-semibold">{{ ds.price }} mUSDT</span>
        </div>
        <button v-if="ds.hasAccess" disabled class="w-full py-2 rounded-md bg-emerald-100 text-emerald-700 text-sm font-medium">Access Granted</button>
        <button v-else class="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Purchase Access NFT</button>
      </div>
    </div>
  </div>
</template>
