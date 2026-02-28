<script setup lang="ts">
import { ref } from 'vue';

const disputes = ref([
  { id: 1, invoiceId: 6, title: 'Database Migration', amount: '4,200', disputedBy: '0x6789...0123', reason: 'Work not completed as specified', status: 'open', createdAt: '2026-02-20' },
  { id: 2, invoiceId: 12, title: 'Content Writing', amount: '800', disputedBy: '0xaaaa...bbbb', reason: 'Quality below expectations', status: 'open', createdAt: '2026-02-22' },
]);

const isPending = ref(false);

async function resolve(disputeId: number, approved: boolean) {
  isPending.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const d = disputes.value.find(d => d.id === disputeId);
    if (d) d.status = approved ? 'approved' : 'rejected';
  } finally {
    isPending.value = false;
  }
}
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Admin / Arbitrator Panel</h1>
      <p class="text-muted-foreground mt-1">Manage and resolve open disputes</p>
    </div>

    <div class="space-y-4">
      <div v-for="d in disputes" :key="d.id" class="rounded-lg border border-border bg-card p-6">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="font-semibold">{{ d.title }}</h3>
            <p class="text-xs text-muted-foreground mt-0.5">Invoice #{{ d.invoiceId }} | ${{ d.amount }} mUSDT | Filed: {{ d.createdAt }}</p>
          </div>
          <span :class="['text-xs px-2.5 py-0.5 rounded-full font-medium', d.status === 'open' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : d.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300']">
            {{ d.status }}
          </span>
        </div>
        <p class="text-sm text-muted-foreground mb-1">Reason: {{ d.reason }}</p>
        <p class="text-xs text-muted-foreground mb-4">Disputed by: <span class="font-mono">{{ d.disputedBy }}</span></p>

        <div v-if="d.status === 'open'" class="flex gap-3">
          <button @click="resolve(d.id, true)" :disabled="isPending" class="flex-1 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">Approve (Resolve in Seller's Favor)</button>
          <button @click="resolve(d.id, false)" :disabled="isPending" class="flex-1 py-2 rounded-md border border-destructive text-destructive text-sm font-medium hover:bg-destructive/10 disabled:opacity-50">Reject (Cancel Invoice)</button>
        </div>
      </div>
    </div>
  </div>
</template>
