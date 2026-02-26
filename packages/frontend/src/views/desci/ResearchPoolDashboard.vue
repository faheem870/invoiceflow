<script setup lang="ts">
import { ref } from 'vue';

const poolStats = ref({
  totalFunds: '12,450',
  totalDonations: '10,200',
  protocolFees: '2,250',
  grantsAllocated: '3,500',
  grantsExecuted: '2,000',
  donorCount: 28,
});

const recentDonations = ref([
  { donor: '0x1234...5678', amount: '500', source: 'direct', date: '2026-02-23' },
  { donor: '0x2345...6789', amount: '1,000', source: 'direct', date: '2026-02-22' },
  { donor: 'Protocol', amount: '15.00', source: 'protocol_fee', date: '2026-02-22' },
  { donor: '0x3456...7890', amount: '250', source: 'direct', date: '2026-02-20' },
]);

const grants = ref([
  { id: 1, recipient: '0xaaaa...bbbb', amount: '2,000', purpose: 'Invoice payment patterns research', status: 'executed' },
  { id: 2, recipient: '0xcccc...dddd', amount: '1,500', purpose: 'Cross-chain payment data analysis', status: 'allocated' },
]);
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold">Research Pool</h1>
        <p class="text-muted-foreground mt-1">DeSci research funding pool</p>
      </div>
      <RouterLink to="/research/donate" class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        Donate to Pool
      </RouterLink>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <div class="rounded-lg border border-border bg-card p-6">
        <p class="text-sm text-muted-foreground">Pool Balance</p>
        <p class="text-2xl font-bold mt-1">${{ poolStats.totalFunds }} mUSDT</p>
      </div>
      <div class="rounded-lg border border-border bg-card p-6">
        <p class="text-sm text-muted-foreground">Total Donations</p>
        <p class="text-2xl font-bold mt-1">${{ poolStats.totalDonations }}</p>
        <p class="text-xs text-muted-foreground mt-1">{{ poolStats.donorCount }} donors</p>
      </div>
      <div class="rounded-lg border border-border bg-card p-6">
        <p class="text-sm text-muted-foreground">Grants Allocated</p>
        <p class="text-2xl font-bold mt-1">${{ poolStats.grantsAllocated }}</p>
        <p class="text-xs text-muted-foreground mt-1">${{ poolStats.grantsExecuted }} executed</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <div class="rounded-lg border border-border bg-card">
        <div class="p-6 border-b border-border">
          <h2 class="text-lg font-semibold">Recent Donations</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="d in recentDonations" :key="d.date + d.donor" class="p-4 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium font-mono">{{ d.donor }}</p>
              <p class="text-xs text-muted-foreground mt-0.5">{{ d.date }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold">${{ d.amount }}</p>
              <span :class="['text-xs px-2 py-0.5 rounded-full', d.source === 'protocol_fee' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700']">{{ d.source === 'protocol_fee' ? 'Protocol Fee' : 'Direct' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-border bg-card">
        <div class="p-6 border-b border-border">
          <h2 class="text-lg font-semibold">Research Grants</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="g in grants" :key="g.id" class="p-4">
            <div class="flex items-center justify-between mb-1">
              <p class="text-sm font-medium">{{ g.purpose }}</p>
              <span :class="['text-xs px-2 py-0.5 rounded-full', g.status === 'executed' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700']">{{ g.status }}</span>
            </div>
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <span class="font-mono">{{ g.recipient }}</span>
              <span class="font-semibold">${{ g.amount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
