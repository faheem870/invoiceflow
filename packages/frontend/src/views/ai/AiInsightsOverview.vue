<script setup lang="ts">
import { ref } from 'vue';

const insights = ref({
  avgRisk: 'LOW',
  avgDiscount: '4.8%',
  totalInvoicesScored: 12,
  highRiskCount: 1,
  mediumRiskCount: 3,
  lowRiskCount: 8,
});

const topPayers = ref([
  { address: '0x1234...5678', onTimeRatio: '95%', invoiceCount: 8, riskLevel: 'LOW' },
  { address: '0x2345...6789', onTimeRatio: '82%', invoiceCount: 5, riskLevel: 'MEDIUM' },
  { address: '0x3456...7890', onTimeRatio: '60%', invoiceCount: 3, riskLevel: 'HIGH' },
]);

const riskColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-red-100 text-red-700',
};
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">AI Insights</h1>
      <p class="text-muted-foreground mt-1">Aggregated risk insights across your portfolio</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="rounded-lg border border-border bg-card p-6">
        <p class="text-sm text-muted-foreground">Average Risk</p>
        <span :class="['mt-2 inline-block text-sm px-3 py-1 rounded-full font-medium', riskColors[insights.avgRisk]]">{{ insights.avgRisk }}</span>
      </div>
      <div class="rounded-lg border border-border bg-card p-6">
        <p class="text-sm text-muted-foreground">Avg Discount</p>
        <p class="text-2xl font-bold mt-1">{{ insights.avgDiscount }}</p>
      </div>
      <div class="rounded-lg border border-border bg-card p-6">
        <p class="text-sm text-muted-foreground">Invoices Scored</p>
        <p class="text-2xl font-bold mt-1">{{ insights.totalInvoicesScored }}</p>
      </div>
      <div class="rounded-lg border border-border bg-card p-6">
        <p class="text-sm text-muted-foreground">Risk Distribution</p>
        <div class="flex gap-2 mt-2">
          <span class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{{ insights.lowRiskCount }} Low</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">{{ insights.mediumRiskCount }} Med</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">{{ insights.highRiskCount }} High</span>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-card">
      <div class="p-6 border-b border-border">
        <h2 class="text-lg font-semibold">Payer Reliability Scores</h2>
      </div>
      <table class="w-full">
        <thead>
          <tr class="border-b border-border">
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Payer</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">On-Time Ratio</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Invoices</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Risk</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payer in topPayers" :key="payer.address" class="border-b border-border last:border-0 hover:bg-muted/50">
            <td class="px-6 py-4 text-sm font-mono">{{ payer.address }}</td>
            <td class="px-6 py-4 text-sm font-medium">{{ payer.onTimeRatio }}</td>
            <td class="px-6 py-4 text-sm">{{ payer.invoiceCount }}</td>
            <td class="px-6 py-4"><span :class="['text-xs px-2.5 py-0.5 rounded-full font-medium', riskColors[payer.riskLevel]]">{{ payer.riskLevel }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
