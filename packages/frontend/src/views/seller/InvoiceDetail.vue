<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const invoiceId = computed(() => route.params.id);

// Mock invoice data
const invoice = ref({
  id: 1,
  tokenId: 1,
  title: 'Web Development - Phase 1',
  description: 'Full-stack development for the e-commerce platform including frontend, backend, and database setup.',
  amount: '5,000',
  amountRaw: '5000000000000000000000',
  tokenSymbol: 'mUSDT',
  sellerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD05',
  payerAddress: '0x1234567890abcdef1234567890abcdef12345678',
  currentOwnerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD05',
  status: 'approved',
  dueDate: '2026-03-15',
  pdfUrl: null as string | null,
  isMilestone: false,
  mintTxHash: '0xabc123...def456',
  chainId: 97,
  createdAt: '2026-02-20',
});

const isPending = ref(false);

const statusSteps = [
  { key: 'draft', label: 'Draft' },
  { key: 'awaiting_approval', label: 'Awaiting Approval' },
  { key: 'approved', label: 'Approved' },
  { key: 'paid', label: 'Paid' },
];

const statusIndex = computed(() => {
  const idx = statusSteps.findIndex(s => s.key === invoice.value.status);
  return idx >= 0 ? idx : 0;
});

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  awaiting_approval: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  listed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  sold: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  disputed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  awaiting_approval: 'Awaiting Approval',
  approved: 'Approved',
  listed: 'Listed',
  sold: 'Sold',
  disputed: 'Disputed',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

async function requestApproval() {
  isPending.value = true;
  try {
    // TODO: Call InvoiceNFT.requestApproval(tokenId)
    await new Promise(resolve => setTimeout(resolve, 1500));
    invoice.value.status = 'awaiting_approval';
  } finally {
    isPending.value = false;
  }
}

async function cancelInvoice() {
  isPending.value = true;
  try {
    // TODO: Call InvoiceNFT.cancel(tokenId)
    await new Promise(resolve => setTimeout(resolve, 1500));
    invoice.value.status = 'cancelled';
  } finally {
    isPending.value = false;
  }
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <h1 class="text-2xl font-bold">{{ invoice.title }}</h1>
          <span :class="['text-xs px-2.5 py-0.5 rounded-full font-medium', statusColors[invoice.status]]">
            {{ statusLabels[invoice.status] }}
          </span>
        </div>
        <p class="text-muted-foreground text-sm">Invoice #{{ invoice.tokenId }} on BSC Testnet</p>
      </div>
      <div class="text-right">
        <p class="text-2xl font-bold">{{ invoice.amount }}</p>
        <p class="text-sm text-muted-foreground">{{ invoice.tokenSymbol }}</p>
      </div>
    </div>

    <!-- Status Timeline -->
    <div class="rounded-lg border border-border bg-card p-6 mb-6">
      <h3 class="text-sm font-semibold mb-4">Invoice Progress</h3>
      <div class="flex items-center">
        <template v-for="(step, index) in statusSteps" :key="step.key">
          <div class="flex flex-col items-center">
            <div :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
              index <= statusIndex
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            ]">
              {{ index < statusIndex ? '\u2713' : index + 1 }}
            </div>
            <span :class="[
              'text-xs mt-1',
              index <= statusIndex ? 'text-foreground font-medium' : 'text-muted-foreground'
            ]">
              {{ step.label }}
            </span>
          </div>
          <div v-if="index < statusSteps.length - 1" :class="[
            'flex-1 h-px mx-2',
            index < statusIndex ? 'bg-primary' : 'bg-border'
          ]" />
        </template>
      </div>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
      <!-- Details Card -->
      <div class="md:col-span-2 rounded-lg border border-border bg-card p-6 space-y-4">
        <h3 class="font-semibold">Invoice Details</h3>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-muted-foreground">Seller</p>
            <p class="font-mono text-xs mt-0.5">{{ invoice.sellerAddress }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Payer</p>
            <p class="font-mono text-xs mt-0.5">{{ invoice.payerAddress }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Due Date</p>
            <p class="font-medium mt-0.5">{{ invoice.dueDate }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Created</p>
            <p class="font-medium mt-0.5">{{ invoice.createdAt }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Current Owner</p>
            <p class="font-mono text-xs mt-0.5">{{ invoice.currentOwnerAddress }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Mint Transaction</p>
            <a
              :href="`https://testnet.bscscan.com/tx/${invoice.mintTxHash}`"
              target="_blank"
              class="text-primary text-xs hover:underline mt-0.5 block"
            >
              {{ invoice.mintTxHash }}
            </a>
          </div>
        </div>

        <div v-if="invoice.description" class="pt-4 border-t border-border">
          <p class="text-sm text-muted-foreground">Description</p>
          <p class="text-sm mt-1">{{ invoice.description }}</p>
        </div>
      </div>

      <!-- Actions Card -->
      <div class="rounded-lg border border-border bg-card p-6 space-y-3">
        <h3 class="font-semibold mb-2">Actions</h3>

        <!-- DRAFT actions -->
        <template v-if="invoice.status === 'draft'">
          <button
            @click="requestApproval"
            :disabled="isPending"
            class="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {{ isPending ? 'Submitting...' : 'Request Approval' }}
          </button>
          <button
            @click="cancelInvoice"
            :disabled="isPending"
            class="w-full py-2 rounded-md border border-destructive text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            Cancel Invoice
          </button>
        </template>

        <!-- APPROVED actions -->
        <template v-if="invoice.status === 'approved'">
          <RouterLink
            :to="`/seller/invoices/${invoice.id}/list`"
            class="block w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors text-center"
          >
            List for Sale
          </RouterLink>
          <RouterLink
            :to="`/seller/invoices/${invoice.id}/share`"
            class="block w-full py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors text-center"
          >
            Share Payment Link
          </RouterLink>
          <button
            @click="cancelInvoice"
            :disabled="isPending"
            class="w-full py-2 rounded-md border border-destructive text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            Cancel Invoice
          </button>
        </template>

        <!-- AWAITING_APPROVAL -->
        <template v-if="invoice.status === 'awaiting_approval'">
          <div class="text-center py-4">
            <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-3">
              <span class="text-yellow-600 text-lg">&#9203;</span>
            </div>
            <p class="text-sm text-muted-foreground">Waiting for payer to approve this invoice</p>
          </div>
          <button
            @click="cancelInvoice"
            :disabled="isPending"
            class="w-full py-2 rounded-md border border-destructive text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            Cancel Invoice
          </button>
        </template>

        <!-- LISTED -->
        <template v-if="invoice.status === 'listed'">
          <div class="text-center py-4">
            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <span class="text-blue-600 text-lg">&#128200;</span>
            </div>
            <p class="text-sm text-muted-foreground">Listed on marketplace. Waiting for buyer.</p>
          </div>
        </template>

        <!-- PAID -->
        <template v-if="invoice.status === 'paid'">
          <div class="text-center py-4">
            <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <span class="text-emerald-600 text-lg">&#10003;</span>
            </div>
            <p class="text-sm font-medium text-emerald-600">Payment Received</p>
            <p class="text-sm text-muted-foreground mt-1">This invoice has been settled.</p>
          </div>
        </template>

        <!-- DISPUTED -->
        <template v-if="invoice.status === 'disputed'">
          <div class="text-center py-4">
            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <span class="text-red-600 text-lg">&#9888;</span>
            </div>
            <p class="text-sm font-medium text-red-600">Disputed</p>
            <p class="text-sm text-muted-foreground mt-1">This invoice is under dispute.</p>
          </div>
          <RouterLink
            :to="`/disputes/${invoice.id}`"
            class="block w-full py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors text-center"
          >
            View Dispute
          </RouterLink>
        </template>

        <!-- AI Risk -->
        <div class="pt-3 border-t border-border">
          <RouterLink
            :to="`/ai/report/${invoice.id}`"
            class="block w-full py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors text-center"
          >
            View AI Risk Report
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
