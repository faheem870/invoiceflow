<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// Mock data for dashboard
const stats = ref([
  { label: 'Total Invoices', value: '12', change: '+3 this month' },
  { label: 'Pending Approval', value: '4', change: '2 due soon' },
  { label: 'Total Earnings', value: '$24,500', change: '+$3,200 this month' },
  { label: 'Active Listings', value: '2', change: '1 new buyer' },
]);

const recentInvoices = ref([
  { id: 1, tokenId: 1, title: 'Web Development - Phase 1', amount: '5,000', status: 'approved', payer: '0x1234...5678', dueDate: '2026-03-15' },
  { id: 2, tokenId: 2, title: 'UI Design Services', amount: '3,200', status: 'awaiting_approval', payer: '0x2345...6789', dueDate: '2026-03-20' },
  { id: 3, tokenId: 3, title: 'Smart Contract Audit', amount: '8,000', status: 'paid', payer: '0x3456...7890', dueDate: '2026-02-28' },
  { id: 4, tokenId: 4, title: 'API Integration', amount: '2,500', status: 'listed', payer: '0x4567...8901', dueDate: '2026-04-01' },
  { id: 5, tokenId: null, title: 'Consulting Hours - Feb', amount: '1,800', status: 'draft', payer: '0x5678...9012', dueDate: '2026-03-30' },
]);

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  awaiting_approval: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  listed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  sold: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  disputed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  awaiting_approval: 'Awaiting Approval',
  approved: 'Approved',
  listed: 'Listed',
  sold: 'Sold',
  disputed: 'Disputed',
  paid: 'Paid',
  cancelled: 'Cancelled',
};
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold">Seller Dashboard</h1>
        <p class="text-muted-foreground mt-1">Overview of your invoices and earnings</p>
      </div>
      <RouterLink
        to="/seller/invoices/create"
        class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        + Create Invoice
      </RouterLink>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-lg border border-border bg-card p-6"
      >
        <p class="text-sm text-muted-foreground">{{ stat.label }}</p>
        <p class="text-2xl font-bold mt-1">{{ stat.value }}</p>
        <p class="text-xs text-muted-foreground mt-1">{{ stat.change }}</p>
      </div>
    </div>

    <!-- Recent Invoices -->
    <div class="rounded-lg border border-border bg-card">
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 class="text-lg font-semibold">Recent Invoices</h2>
        <RouterLink to="/seller/invoices" class="text-sm text-primary hover:underline">
          View All
        </RouterLink>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border">
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Title</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Payer</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Due Date</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="invoice in recentInvoices"
              :key="invoice.id"
              class="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
            >
              <td class="px-6 py-4 text-sm font-medium">{{ invoice.title }}</td>
              <td class="px-6 py-4 text-sm">${{ invoice.amount }} mUSDT</td>
              <td class="px-6 py-4">
                <span :class="['text-xs px-2.5 py-0.5 rounded-full font-medium', statusColors[invoice.status]]">
                  {{ statusLabels[invoice.status] }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-muted-foreground font-mono">{{ invoice.payer }}</td>
              <td class="px-6 py-4 text-sm text-muted-foreground">{{ invoice.dueDate }}</td>
              <td class="px-6 py-4 text-right">
                <RouterLink
                  :to="`/seller/invoices/${invoice.id}`"
                  class="text-sm text-primary hover:underline"
                >
                  View
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
