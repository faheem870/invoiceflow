<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useWeb3 } from '@/composables/useWeb3';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const web3 = useWeb3();

const selectedRole = ref<string | null>(null);
const step = ref<'role' | 'connecting' | 'signing'>('role');
const errorMessage = ref<string | null>(null);

const roles = [
  {
    id: 'seller',
    title: 'Seller',
    description: 'Create invoices, mint NFTs, and get paid in stablecoins.',
    path: '/seller',
  },
  {
    id: 'payer',
    title: 'Payer',
    description: 'Review, approve, and pay invoices via escrow.',
    path: '/payer',
  },
  {
    id: 'investor',
    title: 'Investor',
    description: 'Browse the marketplace and buy invoices at a discount for yield.',
    path: '/marketplace',
  },
];

async function handleConnect() {
  if (!selectedRole.value) return;
  errorMessage.value = null;

  // Step 1: Connect wallet
  step.value = 'connecting';

  try {
    const walletAddress = await web3.connect();

    if (!walletAddress) {
      errorMessage.value = web3.error.value || 'Failed to connect wallet.';
      step.value = 'role';
      return;
    }

    // Step 2: Set up local session (no backend required)
    authStore.setAddress(walletAddress);
    authStore.setUser({
      id: 0,
      walletAddress,
      displayName: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
      role: selectedRole.value!,
      desciOptIn: false,
    });

    // Step 3: Navigate to dashboard
    const redirect = route.query.redirect as string | undefined;
    if (redirect) {
      router.push(redirect);
    } else {
      const role = roles.find(r => r.id === selectedRole.value);
      router.push(role?.path || '/seller');
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to connect wallet.';
  } finally {
    step.value = 'role';
  }
}

const stepLabel = {
  role: 'Connect Wallet',
  connecting: 'Connecting Wallet...',
  signing: 'Sign Message...',
};
</script>

<template>
  <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12">
    <div class="w-full max-w-lg mx-auto px-4">
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
          <span class="text-primary-foreground font-bold text-2xl">IF</span>
        </div>
        <h1 class="text-3xl font-bold mb-2">Connect Your Wallet</h1>
        <p class="text-muted-foreground">
          Choose your role and connect to start using InvoiceFlow
        </p>
      </div>

      <!-- Error message -->
      <div
        v-if="errorMessage"
        class="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
      >
        {{ errorMessage }}
      </div>

      <!-- No wallet warning -->
      <div
        v-if="!web3.hasWallet.value"
        class="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-sm"
      >
        No wallet detected. Please install
        <a href="https://metamask.io" target="_blank" class="underline font-medium">MetaMask</a>
        to continue.
      </div>

      <div class="mb-6">
        <p class="text-sm font-medium mb-3">Select your primary role:</p>
        <div class="grid gap-3">
          <button
            v-for="role in roles"
            :key="role.id"
            @click="selectedRole = role.id"
            :class="[
              'flex items-start gap-4 p-4 rounded-lg border text-left transition-all',
              selectedRole === role.id
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            ]"
          >
            <div :class="[
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              selectedRole === role.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
            ]">
              <span class="text-sm font-bold">{{ role.title[0] }}</span>
            </div>
            <div>
              <p class="font-semibold">{{ role.title }}</p>
              <p class="text-sm text-muted-foreground mt-0.5">{{ role.description }}</p>
            </div>
          </button>
        </div>
      </div>

      <button
        @click="handleConnect"
        :disabled="!selectedRole || step !== 'role' || !web3.hasWallet.value"
        :class="[
          'w-full py-3 rounded-md text-base font-medium transition-colors',
          selectedRole && step === 'role' && web3.hasWallet.value
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        ]"
      >
        <span v-if="step !== 'role'" class="inline-flex items-center gap-2">
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ stepLabel[step] }}
        </span>
        <span v-else>Connect Wallet</span>
      </button>

      <p class="text-xs text-muted-foreground text-center mt-4">
        By connecting, you agree to interact with smart contracts on BNB Chain.
        <br />No email or password needed — your wallet is your identity.
      </p>
    </div>
  </div>
</template>
