<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const currentStep = ref(1);
const totalSteps = 3;

// Form data
const form = ref({
  title: '',
  description: '',
  amount: '',
  tokenAddress: '',
  tokenSymbol: 'mUSDT',
  payerAddress: '',
  dueDate: '',
  isMilestone: false,
  milestoneDescription: '',
});

const pdfFile = ref<File | null>(null);
const isSubmitting = ref(false);
const uploadProgress = ref(0);

const canProceedStep1 = computed(() => {
  return form.value.title && form.value.amount && form.value.payerAddress && form.value.dueDate;
});

const canProceedStep2 = computed(() => {
  return true; // PDF is optional
});

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    pdfFile.value = target.files[0];
  }
}

function nextStep() {
  if (currentStep.value < totalSteps) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

async function handleMint() {
  isSubmitting.value = true;
  try {
    // TODO: Upload PDF to IPFS, then call InvoiceNFT.mintDraft()
    console.log('Minting invoice:', form.value);
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    router.push('/seller/invoices/1');
  } catch (error) {
    console.error('Mint failed:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold">Create Invoice</h1>
      <p class="text-muted-foreground mt-1">Create and mint a new invoice NFT on BNB Chain</p>
    </div>

    <!-- Stepper -->
    <div class="flex items-center mb-8">
      <template v-for="step in totalSteps" :key="step">
        <div class="flex items-center">
          <div :class="[
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
            currentStep >= step
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          ]">
            {{ step }}
          </div>
          <span :class="[
            'ml-2 text-sm font-medium',
            currentStep >= step ? 'text-foreground' : 'text-muted-foreground'
          ]">
            {{ step === 1 ? 'Details' : step === 2 ? 'Upload PDF' : 'Review & Mint' }}
          </span>
        </div>
        <div v-if="step < totalSteps" :class="[
          'flex-1 h-px mx-4',
          currentStep > step ? 'bg-primary' : 'bg-border'
        ]" />
      </template>
    </div>

    <!-- Step 1: Invoice Details -->
    <div v-if="currentStep === 1" class="space-y-6">
      <div class="rounded-lg border border-border bg-card p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1.5">Invoice Title *</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="e.g., Web Development - Phase 1"
            class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Describe the work or service..."
            class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1.5">Amount (mUSDT) *</label>
            <input
              v-model="form.amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="5000"
              class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5">Stablecoin</label>
            <select
              v-model="form.tokenSymbol"
              class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="mUSDT">mUSDT (Mock USDT)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1.5">Payer Wallet Address *</label>
          <input
            v-model="form.payerAddress"
            type="text"
            placeholder="0x..."
            class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1.5">Due Date *</label>
          <input
            v-model="form.dueDate"
            type="date"
            class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div class="flex items-center gap-2">
          <input
            v-model="form.isMilestone"
            type="checkbox"
            id="milestone"
            class="rounded border-input"
          />
          <label for="milestone" class="text-sm">This is a milestone invoice</label>
        </div>

        <div v-if="form.isMilestone">
          <label class="block text-sm font-medium mb-1.5">Milestone Description</label>
          <input
            v-model="form.milestoneDescription"
            type="text"
            placeholder="e.g., Deliverable 1 of 3"
            class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div class="flex justify-end">
        <button
          @click="nextStep"
          :disabled="!canProceedStep1"
          :class="[
            'px-6 py-2 rounded-md text-sm font-medium transition-colors',
            canProceedStep1
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          ]"
        >
          Next: Upload PDF
        </button>
      </div>
    </div>

    <!-- Step 2: Upload PDF -->
    <div v-if="currentStep === 2" class="space-y-6">
      <div class="rounded-lg border border-border bg-card p-6">
        <label class="block text-sm font-medium mb-3">Upload Invoice PDF (optional)</label>
        <div
          class="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
        >
          <div v-if="pdfFile" class="space-y-2">
            <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <span class="text-primary text-lg">PDF</span>
            </div>
            <p class="text-sm font-medium">{{ pdfFile.name }}</p>
            <p class="text-xs text-muted-foreground">{{ (pdfFile.size / 1024).toFixed(1) }} KB</p>
            <button @click="pdfFile = null" class="text-sm text-destructive hover:underline">Remove</button>
          </div>
          <div v-else class="space-y-2">
            <div class="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto">
              <span class="text-muted-foreground text-lg">+</span>
            </div>
            <p class="text-sm text-muted-foreground">Drop your PDF here or click to browse</p>
            <input
              type="file"
              accept=".pdf"
              @change="handleFileChange"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
        <p class="text-xs text-muted-foreground mt-2">
          The PDF hash will be stored on-chain as proof. Max 10MB.
        </p>
      </div>

      <div class="flex justify-between">
        <button
          @click="prevStep"
          class="px-6 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          Back
        </button>
        <button
          @click="nextStep"
          class="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Next: Review
        </button>
      </div>
    </div>

    <!-- Step 3: Review & Mint -->
    <div v-if="currentStep === 3" class="space-y-6">
      <div class="rounded-lg border border-border bg-card p-6 space-y-4">
        <h3 class="font-semibold text-lg">Review Invoice</h3>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-muted-foreground">Title</p>
            <p class="font-medium">{{ form.title }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Amount</p>
            <p class="font-medium">{{ form.amount }} {{ form.tokenSymbol }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Payer</p>
            <p class="font-medium font-mono text-xs">{{ form.payerAddress }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Due Date</p>
            <p class="font-medium">{{ form.dueDate }}</p>
          </div>
          <div v-if="form.description" class="col-span-2">
            <p class="text-muted-foreground">Description</p>
            <p class="font-medium">{{ form.description }}</p>
          </div>
          <div v-if="pdfFile">
            <p class="text-muted-foreground">PDF</p>
            <p class="font-medium">{{ pdfFile.name }}</p>
          </div>
          <div v-if="form.isMilestone">
            <p class="text-muted-foreground">Milestone</p>
            <p class="font-medium">{{ form.milestoneDescription }}</p>
          </div>
        </div>

        <div class="bg-muted/50 rounded-md p-4 text-sm">
          <p class="font-medium mb-1">What happens next:</p>
          <ol class="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Invoice will be minted as an NFT on BNB Chain (status: DRAFT)</li>
            <li>You can then request approval from the payer</li>
            <li>Once approved, you can list it for sale or share a payment link</li>
          </ol>
        </div>
      </div>

      <div class="flex justify-between">
        <button
          @click="prevStep"
          class="px-6 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          Back
        </button>
        <button
          @click="handleMint"
          :disabled="isSubmitting"
          :class="[
            'px-6 py-2 rounded-md text-sm font-medium transition-colors',
            !isSubmitting
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          ]"
        >
          {{ isSubmitting ? 'Minting...' : 'Mint Draft Invoice' }}
        </button>
      </div>
    </div>
  </div>
</template>
