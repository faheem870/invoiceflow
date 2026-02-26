<script setup lang="ts">
import { ref } from 'vue';

const receipt = ref({
  invoiceTitle: 'Web Development - Phase 1',
  amount: '5,000',
  tokenSymbol: 'mUSDT',
  recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD05',
  txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  protocolFee: '15.00',
  researchFee: '2.50',
  paidAt: '2026-02-24 14:32:00 UTC',
  chainId: 97,
});
</script>

<template>
  <div class="p-6 max-w-lg mx-auto">
    <div class="text-center mb-8">
      <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
        <span class="text-emerald-600 text-3xl">&#10003;</span>
      </div>
      <h1 class="text-2xl font-bold">Payment Successful</h1>
      <p class="text-muted-foreground mt-1">Your payment has been processed via escrow</p>
    </div>

    <div class="rounded-lg border border-border bg-card p-6 space-y-4">
      <div class="text-sm space-y-3">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Invoice</span>
          <span class="font-medium">{{ receipt.invoiceTitle }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Amount Paid</span>
          <span class="font-semibold text-lg">{{ receipt.amount }} {{ receipt.tokenSymbol }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Protocol Fee</span>
          <span>{{ receipt.protocolFee }} {{ receipt.tokenSymbol }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Research Fee</span>
          <span>{{ receipt.researchFee }} {{ receipt.tokenSymbol }}</span>
        </div>
        <div class="h-px bg-border" />
        <div class="flex justify-between">
          <span class="text-muted-foreground">Recipient</span>
          <span class="font-mono text-xs">{{ receipt.recipient.slice(0, 10) }}...{{ receipt.recipient.slice(-8) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Date</span>
          <span>{{ receipt.paidAt }}</span>
        </div>
        <div>
          <p class="text-muted-foreground mb-1">Transaction Hash</p>
          <a :href="`https://testnet.bscscan.com/tx/${receipt.txHash}`" target="_blank" class="text-xs text-primary font-mono hover:underline break-all">{{ receipt.txHash }}</a>
        </div>
      </div>
    </div>

    <div class="flex gap-3 mt-6">
      <RouterLink to="/payer" class="flex-1 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted text-center">Back to Dashboard</RouterLink>
      <button class="flex-1 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Download Receipt</button>
    </div>
  </div>
</template>
