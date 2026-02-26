<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const isPending = ref(false);

const invoice = ref({
  id: route.params.id,
  title: 'Web Development - Phase 1',
  amount: '5,000',
  tokenSymbol: 'mUSDT',
  dueDate: '2026-03-15',
});

const salePrice = ref('');
const expiryDays = ref('7');
const aiSuggestedDiscount = ref(4.5);
const aiSuggestedPrice = ref('4,775');

function applySuggestion() {
  salePrice.value = '4775';
}

async function handleList() {
  isPending.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    router.push(`/seller/invoices/${route.params.id}`);
  } finally {
    isPending.value = false;
  }
}
</script>

<template>
  <div class="p-6 max-w-lg mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">List Invoice for Sale</h1>
      <p class="text-muted-foreground mt-1">Set your price and list on the marketplace</p>
    </div>

    <div class="rounded-lg border border-border bg-card p-6 mb-6 space-y-4">
      <div class="flex justify-between text-sm">
        <span class="text-muted-foreground">Invoice</span>
        <span class="font-medium">{{ invoice.title }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-muted-foreground">Face Value</span>
        <span class="font-semibold">{{ invoice.amount }} {{ invoice.tokenSymbol }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-muted-foreground">Due Date</span>
        <span>{{ invoice.dueDate }}</span>
      </div>
    </div>

    <div class="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-6">
      <p class="text-sm font-medium text-blue-700 mb-1">AI Suggested Price</p>
      <p class="text-xs text-blue-600">Based on risk analysis, a {{ aiSuggestedDiscount }}% discount is recommended.</p>
      <div class="flex items-center justify-between mt-2">
        <span class="text-lg font-bold text-blue-700">${{ aiSuggestedPrice }} {{ invoice.tokenSymbol }}</span>
        <button @click="applySuggestion" class="px-3 py-1 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700">Apply</button>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-card p-6 mb-6 space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1.5">Sale Price ({{ invoice.tokenSymbol }}) *</label>
        <input v-model="salePrice" type="number" min="0" placeholder="4775" class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1.5">Listing Expiry</label>
        <select v-model="expiryDays" class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
          <option value="3">3 days</option>
          <option value="7">7 days</option>
          <option value="14">14 days</option>
          <option value="30">30 days</option>
        </select>
      </div>
    </div>

    <button @click="handleList" :disabled="!salePrice || isPending" class="w-full py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
      {{ isPending ? 'Listing...' : 'List on Marketplace' }}
    </button>
  </div>
</template>
