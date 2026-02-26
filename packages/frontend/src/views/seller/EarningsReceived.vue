<script setup lang="ts">
import { ref } from 'vue';

const totalEarnings = ref('16,200');
const payments = ref([
  { id: 1, invoiceTitle: 'Smart Contract Audit', amount: '8,000', from: '0x3456...7890', txHash: '0xccc333...ddd444', date: '2026-02-22' },
  { id: 2, invoiceTitle: 'Logo Design', amount: '1,050', from: '0xaaaa...bbbb', txHash: '0xeee555...fff666', date: '2026-02-18' },
  { id: 3, invoiceTitle: 'Content Strategy', amount: '3,150', from: '0x9876...5432', txHash: '0xggg777...hhh888', date: '2026-02-10' },
  { id: 4, invoiceTitle: 'SEO Optimization', amount: '4,000', from: '0x1111...2222', txHash: '0xiii999...jjj000', date: '2026-01-28' },
]);
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="mb-8">
      <h1 class="text-2xl font-bold">Earnings</h1>
      <p class="text-muted-foreground mt-1">Track your payment history and earnings</p>
    </div>

    <div class="rounded-lg border border-border bg-card p-6 mb-6">
      <p class="text-sm text-muted-foreground">Total Earnings</p>
      <p class="text-3xl font-bold mt-1">${{ totalEarnings }} mUSDT</p>
    </div>

    <div class="rounded-lg border border-border bg-card overflow-hidden">
      <div class="p-6 border-b border-border">
        <h2 class="text-lg font-semibold">Payment History</h2>
      </div>
      <table class="w-full">
        <thead>
          <tr class="border-b border-border bg-muted/50">
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Invoice</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">From</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tx Hash</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in payments" :key="p.id" class="border-b border-border last:border-0 hover:bg-muted/50">
            <td class="px-6 py-4 text-sm font-medium">{{ p.invoiceTitle }}</td>
            <td class="px-6 py-4 text-sm font-semibold text-green-600">+${{ p.amount }}</td>
            <td class="px-6 py-4 text-sm text-muted-foreground font-mono">{{ p.from }}</td>
            <td class="px-6 py-4 text-sm text-muted-foreground">{{ p.date }}</td>
            <td class="px-6 py-4"><a :href="`https://testnet.bscscan.com/tx/${p.txHash}`" target="_blank" class="text-xs text-primary font-mono hover:underline">{{ p.txHash }}</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
