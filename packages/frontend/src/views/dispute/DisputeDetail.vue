<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const dispute = ref({
  id: 1,
  invoiceId: 6,
  invoiceTitle: 'Database Migration',
  amount: '4,200',
  disputedBy: '0x6789012345678901234567890123456789012345',
  reason: 'The database migration was not completed as specified. Several tables are missing and the data integrity checks are failing.',
  resolution: null as string | null,
  isResolved: false,
  createdAt: '2026-02-20',
  resolvedAt: null as string | null,
});

const timeline = ref([
  { event: 'Invoice Created', date: '2026-02-08', by: 'Seller' },
  { event: 'Approval Requested', date: '2026-02-09', by: 'Seller' },
  { event: 'Dispute Filed', date: '2026-02-20', by: 'Payer' },
]);
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-1">
        <h1 class="text-2xl font-bold">Dispute #{{ dispute.id }}</h1>
        <span :class="['text-xs px-2.5 py-0.5 rounded-full font-medium', dispute.isResolved ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700']">
          {{ dispute.isResolved ? 'Resolved' : 'Open' }}
        </span>
      </div>
      <p class="text-muted-foreground text-sm">{{ dispute.invoiceTitle }} | ${{ dispute.amount }} mUSDT</p>
    </div>

    <div class="rounded-lg border border-border bg-card p-6 mb-6">
      <h3 class="font-semibold mb-3">Dispute Reason</h3>
      <p class="text-sm text-muted-foreground">{{ dispute.reason }}</p>
      <div class="mt-4 text-xs text-muted-foreground">
        <p>Filed by: <span class="font-mono">{{ dispute.disputedBy.slice(0, 10) }}...{{ dispute.disputedBy.slice(-8) }}</span></p>
        <p class="mt-1">Date: {{ dispute.createdAt }}</p>
      </div>
    </div>

    <div v-if="dispute.resolution" class="rounded-lg border border-emerald-200 bg-emerald-50 p-6 mb-6">
      <h3 class="font-semibold text-emerald-700 mb-2">Resolution</h3>
      <p class="text-sm text-emerald-600">{{ dispute.resolution }}</p>
      <p class="text-xs text-emerald-500 mt-2">Resolved: {{ dispute.resolvedAt }}</p>
    </div>

    <div class="rounded-lg border border-border bg-card p-6">
      <h3 class="font-semibold mb-4">Timeline</h3>
      <div class="space-y-4">
        <div v-for="(event, idx) in timeline" :key="idx" class="flex gap-4">
          <div class="flex flex-col items-center">
            <div class="w-3 h-3 rounded-full bg-primary" />
            <div v-if="idx < timeline.length - 1" class="w-px flex-1 bg-border mt-1" />
          </div>
          <div class="pb-4">
            <p class="text-sm font-medium">{{ event.event }}</p>
            <p class="text-xs text-muted-foreground">{{ event.date }} by {{ event.by }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
