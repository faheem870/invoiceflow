<script setup lang="ts">
import { ref } from 'vue';

const notifications = ref([
  { id: 1, type: 'approval_requested', title: 'Approval Requested', message: 'Invoice "UI Design Services" is awaiting your approval.', invoiceId: 2, isRead: false, createdAt: '2 hours ago' },
  { id: 2, type: 'invoice_paid', title: 'Payment Received', message: 'Invoice "Smart Contract Audit" has been paid. $8,000 mUSDT received.', invoiceId: 3, isRead: false, createdAt: '5 hours ago' },
  { id: 3, type: 'invoice_listed', title: 'Invoice Listed', message: 'Your invoice "API Integration" has been listed on the marketplace.', invoiceId: 4, isRead: true, createdAt: '1 day ago' },
  { id: 4, type: 'invoice_sold', title: 'Invoice Sold', message: 'Your listed invoice was purchased by an investor for $2,375 mUSDT.', invoiceId: 4, isRead: true, createdAt: '2 days ago' },
  { id: 5, type: 'dispute_filed', title: 'Dispute Filed', message: 'A dispute has been filed on invoice "Database Migration".', invoiceId: 6, isRead: true, createdAt: '4 days ago' },
]);

function markAllRead() {
  notifications.value.forEach(n => n.isRead = true);
}

const typeIcons: Record<string, string> = {
  approval_requested: 'bg-yellow-100 text-yellow-600',
  invoice_paid: 'bg-emerald-100 text-emerald-600',
  invoice_listed: 'bg-blue-100 text-blue-600',
  invoice_sold: 'bg-purple-100 text-purple-600',
  dispute_filed: 'bg-red-100 text-red-600',
};
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Notifications</h1>
        <p class="text-muted-foreground mt-1">Stay updated on your invoices and payments</p>
      </div>
      <button @click="markAllRead" class="text-sm text-primary hover:underline">Mark all as read</button>
    </div>

    <div class="space-y-2">
      <div v-for="n in notifications" :key="n.id" :class="['rounded-lg border p-4 flex items-start gap-4 transition-colors', n.isRead ? 'border-border bg-card' : 'border-primary/20 bg-primary/5']">
        <div :class="['w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', typeIcons[n.type]]">
          <span class="text-sm font-bold">!</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">{{ n.title }}</p>
            <span class="text-xs text-muted-foreground ml-2">{{ n.createdAt }}</span>
          </div>
          <p class="text-sm text-muted-foreground mt-0.5">{{ n.message }}</p>
        </div>
        <div v-if="!n.isRead" class="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
      </div>
    </div>
  </div>
</template>
