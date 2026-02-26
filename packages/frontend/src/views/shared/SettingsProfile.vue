<script setup lang="ts">
import { ref } from 'vue';

const profile = ref({
  walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD05',
  displayName: '',
  email: '',
  role: 'seller',
  desciOptIn: false,
});

const isSaving = ref(false);

async function saveProfile() {
  isSaving.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Settings & Profile</h1>
      <p class="text-muted-foreground mt-1">Manage your account preferences</p>
    </div>

    <div class="rounded-lg border border-border bg-card p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1.5">Wallet Address</label>
        <input type="text" :value="profile.walletAddress" readonly class="w-full px-3 py-2 rounded-md border border-input bg-muted text-sm font-mono" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1.5">Display Name</label>
        <input v-model="profile.displayName" type="text" placeholder="Your name" class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1.5">Email (optional, for notifications)</label>
        <input v-model="profile.email" type="email" placeholder="you@example.com" class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1.5">Primary Role</label>
        <select v-model="profile.role" class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="seller">Seller</option>
          <option value="payer">Payer</option>
          <option value="investor">Investor</option>
        </select>
      </div>
      <div class="flex items-center gap-2 pt-2">
        <input v-model="profile.desciOptIn" type="checkbox" id="desci" class="rounded border-input" />
        <label for="desci" class="text-sm">Opt-in to DeSci anonymized data sharing</label>
      </div>
      <div class="pt-2">
        <button @click="saveProfile" :disabled="isSaving" class="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>
