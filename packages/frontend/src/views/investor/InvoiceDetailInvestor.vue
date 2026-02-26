<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const listing = ref({
  invoiceId: 4,
  title: 'API Integration',
  description: 'RESTful API integration with third-party payment providers and CRM systems.',
  originalAmount: '2,500',
  salePrice: '2,375',
  discountPercent: '5.0',
  tokenSymbol: 'mUSDT',
  seller: '0x4567890123456789012345678901234567890123',
  payer: '0x1234567890abcdef1234567890abcdef12345678',
  dueDate: '2026-04-01',
  daysUntilDue: 36,
  riskLevel: 'LOW',
  riskScore: 82,
  listTxHash: '0xdef789...',
});

const riskColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-red-100 text-red-700',
};

function calcROI(): string {
  const o = parseFloat(listing.value.originalAmount.replace(/,/g, ''));
  const s = parseFloat(listing.value.salePrice.replace(/,/g, ''));
  return ((o - s) / s * 100).toFixed(2);
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">{{ listing.title }}</h1>
        <p class="text-muted-foreground text-sm mt-1">Invoice #{{ listing.invoiceId }} | Listed for sale</p>
      </div>
      <span :class="['text-xs px-2.5 py-0.5 rounded-full font-medium', riskColors[listing.riskLevel]]">{{ listing.riskLevel }} Risk</span>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
      <div class="md:col-span-2 space-y-6">
        <div class="rounded-lg border border-border bg-card p-6">
          <h3 class="font-semibold mb-4">Invoice Details</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-muted-foreground">Face Value</p>
              <p class="text-xl font-bold mt-0.5">{{ listing.originalAmount }} {{ listing.tokenSymbol }}</p>
            </div>
            <div>
              <p class="text-muted-foreground">Sale Price</p>
              <p class="text-xl font-bold text-primary mt-0.5">{{ listing.salePrice }} {{ listing.tokenSymbol }}</p>
            </div>
            <div>
              <p class="text-muted-foreground">Discount</p>
              <p class="font-semibold text-green-600 mt-0.5">{{ listing.discountPercent }}%</p>
            </div>
            <div>
              <p class="text-muted-foreground">Implied ROI</p>
              <p class="font-semibold text-green-600 mt-0.5">{{ calcROI() }}%</p>
            </div>
            <div>
              <p class="text-muted-foreground">Due Date</p>
              <p class="font-medium mt-0.5">{{ listing.dueDate }} ({{ listing.daysUntilDue }} days)</p>
            </div>
            <div>
              <p class="text-muted-foreground">Seller</p>
              <p class="font-mono text-xs mt-0.5">{{ listing.seller.slice(0, 10) }}...{{ listing.seller.slice(-8) }}</p>
            </div>
            <div>
              <p class="text-muted-foreground">Payer</p>
              <p class="font-mono text-xs mt-0.5">{{ listing.payer.slice(0, 10) }}...{{ listing.payer.slice(-8) }}</p>
            </div>
          </div>
          <div v-if="listing.description" class="pt-4 mt-4 border-t border-border">
            <p class="text-sm text-muted-foreground">Description</p>
            <p class="text-sm mt-1">{{ listing.description }}</p>
          </div>
        </div>

        <div class="rounded-lg border border-border bg-card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold">AI Risk Analysis</h3>
            <RouterLink :to="`/ai/report/${listing.invoiceId}`" class="text-sm text-primary hover:underline">Full Report</RouterLink>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center">
              <span class="text-lg font-bold">{{ listing.riskScore }}</span>
            </div>
            <div>
              <p class="font-medium">Low Risk Invoice</p>
              <p class="text-sm text-muted-foreground">Payer has strong on-time payment history. Suggested discount: 4-5%.</p>
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-4 italic">This is not financial advice. AI suggestions are for informational purposes only.</p>
        </div>
      </div>

      <div class="rounded-lg border border-border bg-card p-6 h-fit space-y-4">
        <h3 class="font-semibold">Purchase Summary</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-muted-foreground">Purchase Price</span>
            <span class="font-medium">{{ listing.salePrice }} {{ listing.tokenSymbol }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Face Value at Maturity</span>
            <span class="font-medium">{{ listing.originalAmount }} {{ listing.tokenSymbol }}</span>
          </div>
          <div class="h-px bg-border" />
          <div class="flex justify-between text-green-600">
            <span class="font-medium">Profit</span>
            <span class="font-semibold">125.00 {{ listing.tokenSymbol }}</span>
          </div>
        </div>

        <RouterLink :to="`/marketplace/${listing.invoiceId}/buy`" class="block w-full py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 text-center">
          Buy This Invoice
        </RouterLink>

        <p class="text-xs text-muted-foreground text-center">
          You will receive the NFT and the right to collect payment from the payer.
        </p>
      </div>
    </div>
  </div>
</template>
