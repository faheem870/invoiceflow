<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const isPending = ref(false);
const showDisputeDialog = ref(false);
const disputeReason = ref('');

const invoice = ref({
  id: 2,
  tokenId: 2,
  title: 'UI Design Services',
  description: 'Complete redesign of the dashboard UI including wireframes, mockups, and final implementation files.',
  amount: '3,200',
  tokenSymbol: 'mUSDT',
  sellerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD05',
  payerAddress: '0x1234567890abcdef1234567890abcdef12345678',
  status: 'awaiting_approval',
  dueDate: '2026-03-20',
  pdfUrl: null as string | null,
  isMilestone: false,
  createdAt: '2026-02-18',
});

async function handleApprove() {
  isPending.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    invoice.value.status = 'approved';
    router.push(`/payer/invoices/${invoice.value.id}/pay`);
  } finally {
    isPending.value = false;
  }
}

async function handleDispute() {
  isPending.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    invoice.value.status = 'disputed';
    showDisputeDialog.value = false;
  } finally {
    isPending.value = false;
  }
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Review & Approve Invoice</h1>
      <p class="text-muted-foreground mt-1">Review the invoice details before approving</p>
    </div>

    <div class="rounded-lg border border-border bg-card p-6 mb-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">{{ invoice.title }}</h2>
        <span class="text-xs px-2.5 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">Awaiting Approval</span>
      </div>

      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-muted-foreground">Amount</p>
          <p class="text-xl font-bold mt-0.5">{{ invoice.amount }} {{ invoice.tokenSymbol }}</p>
        </div>
        <div>
          <p class="text-muted-foreground">Due Date</p>
          <p class="font-medium mt-0.5">{{ invoice.dueDate }}</p>
        </div>
        <div>
          <p class="text-muted-foreground">Seller</p>
          <p class="font-mono text-xs mt-0.5">{{ invoice.sellerAddress }}</p>
        </div>
        <div>
          <p class="text-muted-foreground">Created</p>
          <p class="font-medium mt-0.5">{{ invoice.createdAt }}</p>
        </div>
      </div>

      <div v-if="invoice.description" class="pt-4 border-t border-border">
        <p class="text-sm text-muted-foreground">Description</p>
        <p class="text-sm mt-1">{{ invoice.description }}</p>
      </div>

      <div v-if="invoice.pdfUrl" class="pt-4 border-t border-border">
        <a :href="invoice.pdfUrl" target="_blank" class="text-sm text-primary hover:underline">View Invoice PDF</a>
      </div>
    </div>

    <div v-if="invoice.status === 'awaiting_approval'" class="flex gap-3">
      <button @click="handleApprove" :disabled="isPending" class="flex-1 py-3 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50">
        {{ isPending ? 'Processing...' : 'Approve Invoice' }}
      </button>
      <button @click="showDisputeDialog = true" :disabled="isPending" class="flex-1 py-3 rounded-md border border-destructive text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors disabled:opacity-50">
        Dispute
      </button>
    </div>

    <div v-if="invoice.status === 'approved'" class="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
      <p class="text-green-700 font-medium">Invoice Approved</p>
      <RouterLink :to="`/payer/invoices/${invoice.id}/pay`" class="text-sm text-primary hover:underline mt-1 inline-block">Proceed to Pay</RouterLink>
    </div>

    <div v-if="invoice.status === 'disputed'" class="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
      <p class="text-red-700 font-medium">Invoice Disputed</p>
      <p class="text-sm text-red-600 mt-1">An arbitrator will review this dispute.</p>
    </div>

    <!-- Dispute Dialog -->
    <div v-if="showDisputeDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-card rounded-lg border border-border p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">Dispute Invoice</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1.5">Reason for dispute</label>
          <textarea v-model="disputeReason" rows="3" placeholder="Explain why you are disputing this invoice..." class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
        </div>
        <div class="flex gap-3">
          <button @click="showDisputeDialog = false" class="flex-1 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted">Cancel</button>
          <button @click="handleDispute" :disabled="!disputeReason || isPending" class="flex-1 py-2 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 disabled:opacity-50">Submit Dispute</button>
        </div>
      </div>
    </div>
  </div>
</template>
