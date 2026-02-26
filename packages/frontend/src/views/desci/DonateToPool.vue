<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const amount = ref('');
const desciOptIn = ref(false);
const isPending = ref(false);
const step = ref(1);

async function handleApprove() {
  isPending.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    step.value = 2;
  } finally {
    isPending.value = false;
  }
}

async function handleDonate() {
  isPending.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    router.push('/research');
  } finally {
    isPending.value = false;
  }
}
</script>

<template>
  <div class="p-6 max-w-lg mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Donate to Research Pool</h1>
      <p class="text-muted-foreground mt-1">Contribute to the DeSci research funding pool</p>
    </div>

    <div class="rounded-lg border border-border bg-card p-6 mb-6 space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1.5">Donation Amount (mUSDT)</label>
        <input v-model="amount" type="number" min="0" step="1" placeholder="100" class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div class="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
        <input v-model="desciOptIn" type="checkbox" id="desci-optin" class="mt-0.5 rounded border-input" />
        <label for="desci-optin" class="text-sm">
          <span class="font-medium">Opt-in to anonymized data sharing</span>
          <p class="text-muted-foreground mt-0.5">Share anonymized payment performance data (timing, amount brackets, industry tags) to help researchers. No names, addresses, or PDFs are shared.</p>
        </label>
      </div>

      <div class="bg-muted/50 rounded-md p-3 text-sm">
        <p class="font-medium mb-1">How donations are used:</p>
        <ul class="list-disc list-inside space-y-0.5 text-muted-foreground text-xs">
          <li>Fund research grants for invoice payment analysis</li>
          <li>Support anonymized dataset creation</li>
          <li>DAO-governed allocation (admin multisig for MVP)</li>
        </ul>
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex items-center gap-3 mb-4">
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium', step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted']">1</div>
        <span :class="['text-sm', step >= 1 ? 'font-medium' : 'text-muted-foreground']">Approve mUSDT</span>
        <div class="flex-1 h-px bg-border" />
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium', step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted']">2</div>
        <span :class="['text-sm', step >= 2 ? 'font-medium' : 'text-muted-foreground']">Donate</span>
      </div>

      <button v-if="step === 1" @click="handleApprove" :disabled="!amount || isPending" class="w-full py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
        {{ isPending ? 'Approving...' : `Approve ${amount || '0'} mUSDT` }}
      </button>
      <button v-if="step === 2" @click="handleDonate" :disabled="isPending" class="w-full py-3 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
        {{ isPending ? 'Donating...' : `Donate ${amount} mUSDT` }}
      </button>
    </div>
  </div>
</template>
