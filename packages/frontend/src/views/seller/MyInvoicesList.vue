<script setup lang="ts">
import { ref, computed } from 'vue';

const searchQuery = ref('');
const statusFilter = ref('all');

const invoices = ref([
  { id: 1, tokenId: 1, title: 'Web Development - Phase 1', amount: '5,000', status: 'approved', payer: '0x1234...5678', dueDate: '2026-03-15', createdAt: '2026-02-20' },
  { id: 2, tokenId: 2, title: 'UI Design Services', amount: '3,200', status: 'awaiting_approval', payer: '0x2345...6789', dueDate: '2026-03-20', createdAt: '2026-02-18' },
  { id: 3, tokenId: 3, title: 'Smart Contract Audit', amount: '8,000', status: 'paid', payer: '0x3456...7890', dueDate: '2026-02-28', createdAt: '2026-02-10' },
  { id: 4, tokenId: 4, title: 'API Integration', amount: '2,500', status: 'listed', payer: '0x4567...8901', dueDate: '2026-04-01', createdAt: '2026-02-15' },
  { id: 5, tokenId: null, title: 'Consulting Hours - Feb', amount: '1,800', status: 'draft', payer: '0x5678...9012', dueDate: '2026-03-30', createdAt: '2026-02-22' },
  { id: 6, tokenId: 5, title: 'Database Migration', amount: '4,200', status: 'disputed', payer: '0x6789...0123', dueDate: '2026-03-10', createdAt: '2026-02-08' },
]);

const statusOptions = ['all', 'draft', 'awaiting_approval', 'approved', 'listed', 'sold', 'disputed', 'paid', 'cancelled'];

const filteredInvoices = computed(() => {
  return invoices.value.filter(inv => {
    const matchesSearch = !searchQuery.value || inv.title.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesStatus = statusFilter.value === 'all' || inv.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

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
  all: 'All Statuses',
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
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">My Invoices</h1>
        <p class="text-muted-foreground mt-1">Manage all your invoices</p>
      </div>
      <RouterLink to="/seller/invoices/create" class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        + Create Invoice
      </RouterLink>
    </div>

    <div class="flex gap-4 mb-6">
      <input v-model="searchQuery" type="text" placeholder="Search invoices..." class="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      <select v-model="statusFilter" class="px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
        <option v-for="opt in statusOptions" :key="opt" :value="opt">{{ statusLabels[opt] }}</option>
      </select>
    </div>

    <div class="rounded-lg border border-border bg-card overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border bg-muted/50">
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Title</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Payer</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Due Date</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invoice in filteredInvoices" :key="invoice.id" class="border-b border-border last:border-0 hover:bg-muted/50">
            <td class="px-6 py-4 text-sm font-medium">{{ invoice.title }}</td>
            <td class="px-6 py-4 text-sm">${{ invoice.amount }}</td>
            <td class="px-6 py-4">
              <span :class="['text-xs px-2.5 py-0.5 rounded-full font-medium', statusColors[invoice.status]]">{{ statusLabels[invoice.status] }}</span>
            </td>
            <td class="px-6 py-4 text-sm text-muted-foreground font-mono">{{ invoice.payer }}</td>
            <td class="px-6 py-4 text-sm text-muted-foreground">{{ invoice.dueDate }}</td>
            <td class="px-6 py-4 text-right">
              <RouterLink :to="`/seller/invoices/${invoice.id}`" class="text-sm text-primary hover:underline">View</RouterLink>
            </td>
          </tr>
          <tr v-if="filteredInvoices.length === 0">
            <td colspan="6" class="px-6 py-12 text-center text-muted-foreground">No invoices found</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
