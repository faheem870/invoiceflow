<script setup lang="ts">
import { ref } from 'vue';

const investments = ref([
  { id: 4, title: 'API Integration', purchasePrice: '2,375', faceValue: '2,500', status: 'sold', dueDate: '2026-04-01', profit: '125.00', roi: '5.26', buyTxHash: '0xaaa...' },
  { id: 8, title: 'Mobile App Dev', purchasePrice: '11,280', faceValue: '12,000', status: 'sold', dueDate: '2026-05-15', profit: '720.00', roi: '6.38', buyTxHash: '0xbbb...' },
  { id: 11, title: 'Logo Design', purchasePrice: '1,000', faceValue: '1,050', status: 'paid', dueDate: '2026-02-15', profit: '50.00', roi: '5.00', buyTxHash: '0xccc...' },
]);

const statusColors: Record<string, string> = {
  sold: 'bg-purple-100 text-purple-700',
  paid: 'bg-emerald-100 text-emerald-700',
};
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Portfolio</h1>
      <p class="text-muted-foreground mt-1">Your owned invoices and settlement history</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="rounded-lg border border-border bg-card p-6">
        <p class="text-sm text-muted-foreground">Total Invested</p>
        <p class="text-2xl font-bold mt-1">$14,655</p>
      </div>
      <div class="rounded-lg border border-border bg-card p-6">
        <p class="text-sm text-muted-foreground">Total Profit</p>
        <p class="text-2xl font-bold mt-1 text-green-600">+$895.00</p>
      </div>
      <div class="rounded-lg border border-border bg-card p-6">
        <p class="text-sm text-muted-foreground">Avg ROI</p>
        <p class="text-2xl font-bold mt-1 text-green-600">5.55%</p>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-card overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border bg-muted/50">
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Invoice</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Purchased At</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Face Value</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Due Date</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Profit / ROI</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inv in investments" :key="inv.id" class="border-b border-border last:border-0 hover:bg-muted/50">
            <td class="px-6 py-4 text-sm font-medium">{{ inv.title }}</td>
            <td class="px-6 py-4 text-sm">${{ inv.purchasePrice }}</td>
            <td class="px-6 py-4 text-sm">${{ inv.faceValue }}</td>
            <td class="px-6 py-4"><span :class="['text-xs px-2.5 py-0.5 rounded-full font-medium', statusColors[inv.status]]">{{ inv.status }}</span></td>
            <td class="px-6 py-4 text-sm text-muted-foreground">{{ inv.dueDate }}</td>
            <td class="px-6 py-4 text-right">
              <p class="text-sm font-medium text-green-600">+${{ inv.profit }}</p>
              <p class="text-xs text-muted-foreground">{{ inv.roi }}% ROI</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
