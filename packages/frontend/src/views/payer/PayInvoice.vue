<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const step = ref(1);
const isPending = ref(false);

const invoice = ref({
  id: 1,
  title: 'Web Development - Phase 1',
  amount: '5,000',
  tokenSymbol: 'mUSDT',
  currentOwner: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD05',
  protocolFee: '15.00',
  researchFee: '2.50',
  totalPayout: '4,982.50',
});

async function handleApproveToken() {
  isPending.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    step.value = 2;
  } finally {
    isPending.value = false;
  }
}

async function handlePay() {
  isPending.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    router.push(`/payer/invoices/${invoice.value.id}/receipt`);
  } finally {
    isPending.value = false;
  }
}
</script>

<template>
  <div class="p-6 max-w-lg mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Pay Invoice</h1>
      <p class="text-muted-foreground mt-1">Pay via stablecoin escrow</p>
    </div>

    <div class="rounded-lg border border-border bg-card p-6 mb-6">
      <h2 class="font-semibold mb-4">{{ invoice.title }}</h2>

      <div class="space-y-3 text-sm">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Invoice Amount</span>
          <span class="font-medium">{{ invoice.amount }} {{ invoice.tokenSymbol }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Protocol Fee (0.3%)</span>
          <span>-{{ invoice.protocolFee }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Research Fee (0.05%)</span>
          <span>-{{ invoice.researchFee }}</span>
        </div>
        <div class="h-px bg-border" />
        <div class="flex justify-between">
          <span class="text-muted-foreground">Recipient receives</span>
          <span class="font-semibold">{{ invoice.totalPayout }} {{ invoice.tokenSymbol }}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-muted-foreground">Recipient</span>
          <span class="font-mono">{{ invoice.currentOwner }}</span>
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex items-center gap-3 mb-4">
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium', step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground']">1</div>
        <span :class="['text-sm', step >= 1 ? 'font-medium' : 'text-muted-foreground']">Approve {{ invoice.tokenSymbol }}</span>
        <div class="flex-1 h-px bg-border" />
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium', step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground']">2</div>
        <span :class="['text-sm', step >= 2 ? 'font-medium' : 'text-muted-foreground']">Pay via Escrow</span>
      </div>

      <button v-if="step === 1" @click="handleApproveToken" :disabled="isPending" class="w-full py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
        {{ isPending ? 'Approving...' : `Approve ${invoice.amount} ${invoice.tokenSymbol}` }}
      </button>
      <button v-if="step === 2" @click="handlePay" :disabled="isPending" class="w-full py-3 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
        {{ isPending ? 'Processing Payment...' : `Pay ${invoice.amount} ${invoice.tokenSymbol}` }}
      </button>
    </div>

    <p class="text-xs text-muted-foreground text-center mt-4">
      Payment is routed through a smart contract escrow on BSC Testnet.
    </p>
  </div>
</template>
