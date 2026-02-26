<script setup lang="ts">
import { ref } from 'vue';

const pendingApprovals = ref([
  { id: 2, title: 'UI Design Services', amount: '3,200', seller: '0x742d...bD05', dueDate: '2026-03-20', createdAt: '2026-02-18' },
  { id: 7, title: 'DevOps Setup', amount: '6,000', seller: '0xaaaa...bbbb', dueDate: '2026-03-25', createdAt: '2026-02-21' },
]);

const invoicesToPay = ref([
  { id: 1, title: 'Web Development - Phase 1', amount: '5,000', seller: '0x742d...bD05', dueDate: '2026-03-15', status: 'approved' },
]);

const stats = ref([
  { label: 'Pending Approvals', value: '2' },
  { label: 'Invoices to Pay', value: '1' },
  { label: 'Total Paid', value: '$16,200' },
  { label: 'Active Disputes', value: '0' },
]);
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="mb-8">
      <h1 class="text-2xl font-bold">Payer Dashboard</h1>
      <p class="text-muted-foreground mt-1">Review pending invoices and payment history</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="stat in stats" :key="stat.label" class="rounded-lg border border-border bg-card p-6">
        <p class="text-sm text-muted-foreground">{{ stat.label }}</p>
        <p class="text-2xl font-bold mt-1">{{ stat.value }}</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <div class="rounded-lg border border-border bg-card">
        <div class="p-6 border-b border-border">
          <h2 class="text-lg font-semibold">Pending Approvals</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="inv in pendingApprovals" :key="inv.id" class="p-4 flex items-center justify-between hover:bg-muted/50">
            <div>
              <p class="text-sm font-medium">{{ inv.title }}</p>
              <p class="text-xs text-muted-foreground mt-0.5">From: {{ inv.seller }} | Due: {{ inv.dueDate }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold">${{ inv.amount }}</span>
              <RouterLink :to="`/payer/invoices/${inv.id}/review`" class="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90">Review</RouterLink>
            </div>
          </div>
          <div v-if="pendingApprovals.length === 0" class="p-8 text-center text-muted-foreground text-sm">No pending approvals</div>
        </div>
      </div>

      <div class="rounded-lg border border-border bg-card">
        <div class="p-6 border-b border-border">
          <h2 class="text-lg font-semibold">Invoices to Pay</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="inv in invoicesToPay" :key="inv.id" class="p-4 flex items-center justify-between hover:bg-muted/50">
            <div>
              <p class="text-sm font-medium">{{ inv.title }}</p>
              <p class="text-xs text-muted-foreground mt-0.5">From: {{ inv.seller }} | Due: {{ inv.dueDate }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold">${{ inv.amount }}</span>
              <RouterLink :to="`/payer/invoices/${inv.id}/pay`" class="px-3 py-1 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700">Pay Now</RouterLink>
            </div>
          </div>
          <div v-if="invoicesToPay.length === 0" class="p-8 text-center text-muted-foreground text-sm">No invoices to pay</div>
        </div>
      </div>
    </div>
  </div>
</template>
