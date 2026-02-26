<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const step = ref(1);
const isPending = ref(false);

const purchase = ref({
  invoiceTitle: 'API Integration',
  invoiceId: 4,
  salePrice: '2,375',
  originalAmount: '2,500',
  tokenSymbol: 'mUSDT',
  marketplaceFee: '11.88',
  totalCost: '2,386.88',
  profit: '113.12',
  roi: '4.74',
  seller: '0x4567...8901',
  dueDate: '2026-04-01',
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

async function handleBuy() {
  isPending.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    router.push('/investor/portfolio');
  } finally {
    isPending.value = false;
  }
}
</script>

<template>
  <div class="p-6 max-w-lg mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Confirm Purchase</h1>
      <p class="text-muted-foreground mt-1">Review and confirm your invoice purchase</p>
    </div>

    <div class="rounded-lg border border-border bg-card p-6 mb-6 space-y-4">
      <h2 class="font-semibold">{{ purchase.invoiceTitle }}</h2>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Sale Price</span>
          <span class="font-medium">{{ purchase.salePrice }} {{ purchase.tokenSymbol }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Marketplace Fee (0.5%)</span>
          <span>{{ purchase.marketplaceFee }}</span>
        </div>
        <div class="h-px bg-border" />
        <div class="flex justify-between font-semibold">
          <span>Total Cost</span>
          <span>{{ purchase.totalCost }} {{ purchase.tokenSymbol }}</span>
        </div>
        <div class="h-px bg-border" />
        <div class="flex justify-between text-green-600">
          <span>Expected Profit</span>
          <span class="font-semibold">{{ purchase.profit }} {{ purchase.tokenSymbol }}</span>
        </div>
        <div class="flex justify-between text-green-600">
          <span>Expected ROI</span>
          <span class="font-semibold">{{ purchase.roi }}%</span>
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex items-center gap-3 mb-4">
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium', step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted']">1</div>
        <span :class="['text-sm', step >= 1 ? 'font-medium' : 'text-muted-foreground']">Approve {{ purchase.tokenSymbol }}</span>
        <div class="flex-1 h-px bg-border" />
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium', step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted']">2</div>
        <span :class="['text-sm', step >= 2 ? 'font-medium' : 'text-muted-foreground']">Buy Invoice NFT</span>
      </div>

      <button v-if="step === 1" @click="handleApproveToken" :disabled="isPending" class="w-full py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
        {{ isPending ? 'Approving...' : `Approve ${purchase.totalCost} ${purchase.tokenSymbol}` }}
      </button>
      <button v-if="step === 2" @click="handleBuy" :disabled="isPending" class="w-full py-3 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
        {{ isPending ? 'Processing...' : 'Confirm Purchase' }}
      </button>
    </div>
  </div>
</template>
