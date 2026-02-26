<script setup lang="ts">
import { ref } from 'vue';

const stats = ref([
  { label: 'Portfolio Value', value: '$14,655' },
  { label: 'Pending Settlement', value: '$2,375' },
  { label: 'Total Yield Earned', value: '$487.50' },
  { label: 'Active Investments', value: '3' },
]);

const investments = ref([
  { id: 4, title: 'API Integration', purchasePrice: '2,375', faceValue: '2,500', status: 'sold', dueDate: '2026-04-01', expectedProfit: '125.00' },
  { id: 8, title: 'Mobile App Dev', purchasePrice: '11,280', faceValue: '12,000', status: 'sold', dueDate: '2026-05-15', expectedProfit: '720.00' },
  { id: 11, title: 'Logo Design', purchasePrice: '1,000', faceValue: '1,050', status: 'paid', dueDate: '2026-02-15', expectedProfit: '50.00' },
]);

const statusColors: Record<string, string> = {
  sold: 'bg-purple-100 text-purple-700',
  paid: 'bg-emerald-100 text-emerald-700',
};
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold">Investor Dashboard</h1>
        <p class="text-muted-foreground mt-1">Track your portfolio and yield</p>
      </div>
      <RouterLink to="/marketplace" class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        Browse Marketplace
      </RouterLink>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="stat in stats" :key="stat.label" class="rounded-lg border border-border bg-card p-6">
        <p class="text-sm text-muted-foreground">{{ stat.label }}</p>
        <p class="text-2xl font-bold mt-1">{{ stat.value }}</p>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-card">
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 class="text-lg font-semibold">My Investments</h2>
        <RouterLink to="/investor/portfolio" class="text-sm text-primary hover:underline">View All</RouterLink>
      </div>
      <table class="w-full">
        <thead>
          <tr class="border-b border-border">
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Invoice</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Purchase Price</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Face Value</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Due Date</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Expected Profit</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inv in investments" :key="inv.id" class="border-b border-border last:border-0 hover:bg-muted/50">
            <td class="px-6 py-4 text-sm font-medium">{{ inv.title }}</td>
            <td class="px-6 py-4 text-sm">${{ inv.purchasePrice }}</td>
            <td class="px-6 py-4 text-sm">${{ inv.faceValue }}</td>
            <td class="px-6 py-4"><span :class="['text-xs px-2.5 py-0.5 rounded-full font-medium', statusColors[inv.status]]">{{ inv.status }}</span></td>
            <td class="px-6 py-4 text-sm text-muted-foreground">{{ inv.dueDate }}</td>
            <td class="px-6 py-4 text-sm text-right font-medium text-green-600">+${{ inv.expectedProfit }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
