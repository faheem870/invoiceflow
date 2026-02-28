<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const copied = ref(false);

const invoice = ref({
  id: 1,
  title: 'Web Development - Phase 1',
  amount: '5,000',
  tokenSymbol: 'mUSDT',
  payerAddress: '0x1234...5678',
});

const paymentUrl = computed(() => {
  return `${window.location.origin}/payer/invoices/${route.params.id}/pay`;
});

function copyLink() {
  navigator.clipboard.writeText(paymentUrl.value);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}
</script>

<template>
  <div class="p-6 max-w-lg mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Payment Link</h1>
      <p class="text-muted-foreground mt-1">Share this link with your payer</p>
    </div>

    <div class="rounded-lg border border-border bg-card p-6 space-y-6">
      <div class="text-center">
        <p class="text-sm text-muted-foreground">Invoice</p>
        <p class="font-semibold text-lg">{{ invoice.title }}</p>
        <p class="text-2xl font-bold mt-2">{{ invoice.amount }} {{ invoice.tokenSymbol }}</p>
      </div>

      <div class="bg-muted rounded-lg p-8 flex items-center justify-center">
        <div class="w-48 h-48 bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center border">
          <span class="text-muted-foreground text-sm">QR Code</span>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1.5">Payment URL</label>
        <div class="flex gap-2">
          <input type="text" :value="paymentUrl" readonly class="flex-1 px-3 py-2 rounded-md border border-input bg-muted text-sm font-mono" />
          <button @click="copyLink" class="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <RouterLink :to="`/seller/invoices/${route.params.id}`" class="text-sm text-primary hover:underline">Back to Invoice</RouterLink>
    </div>
  </div>
</template>
