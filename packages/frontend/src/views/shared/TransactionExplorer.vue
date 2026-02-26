<script setup lang="ts">
import { ref } from 'vue';

const transactions = ref([
  { type: 'Mint', invoiceTitle: 'Web Development - Phase 1', txHash: '0xabc123...def456', from: '0x742d...bD05', date: '2026-02-20', amount: '5,000' },
  { type: 'Approve', invoiceTitle: 'Web Development - Phase 1', txHash: '0xbbb222...ccc333', from: '0x1234...5678', date: '2026-02-21', amount: null },
  { type: 'Pay', invoiceTitle: 'Smart Contract Audit', txHash: '0xccc333...ddd444', from: '0x3456...7890', date: '2026-02-22', amount: '8,000' },
  { type: 'List', invoiceTitle: 'API Integration', txHash: '0xddd444...eee555', from: '0x4567...8901', date: '2026-02-23', amount: '2,375' },
  { type: 'Buy', invoiceTitle: 'API Integration', txHash: '0xeee555...fff666', from: '0xaaaa...bbbb', date: '2026-02-23', amount: '2,375' },
  { type: 'Donate', invoiceTitle: 'Research Pool', txHash: '0xfff666...000777', from: '0x1234...5678', date: '2026-02-23', amount: '500' },
]);

const typeColors: Record<string, string> = {
  Mint: 'bg-blue-100 text-blue-700',
  Approve: 'bg-green-100 text-green-700',
  Pay: 'bg-emerald-100 text-emerald-700',
  List: 'bg-purple-100 text-purple-700',
  Buy: 'bg-orange-100 text-orange-700',
  Donate: 'bg-teal-100 text-teal-700',
  Dispute: 'bg-red-100 text-red-700',
};
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Transaction Explorer</h1>
      <p class="text-muted-foreground mt-1">View all on-chain activity</p>
    </div>

    <div class="rounded-lg border border-border bg-card overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border bg-muted/50">
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Invoice</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">From</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tx Hash</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in transactions" :key="tx.txHash" class="border-b border-border last:border-0 hover:bg-muted/50">
            <td class="px-6 py-4"><span :class="['text-xs px-2.5 py-0.5 rounded-full font-medium', typeColors[tx.type]]">{{ tx.type }}</span></td>
            <td class="px-6 py-4 text-sm font-medium">{{ tx.invoiceTitle }}</td>
            <td class="px-6 py-4 text-sm text-muted-foreground font-mono">{{ tx.from }}</td>
            <td class="px-6 py-4 text-sm">{{ tx.amount ? `$${tx.amount}` : '-' }}</td>
            <td class="px-6 py-4 text-sm text-muted-foreground">{{ tx.date }}</td>
            <td class="px-6 py-4">
              <a :href="`https://testnet.bscscan.com/tx/${tx.txHash}`" target="_blank" class="text-xs text-primary font-mono hover:underline">{{ tx.txHash }}</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
