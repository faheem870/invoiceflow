<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notifications';
import { useUiStore } from '@/stores/ui';
import { useWeb3 } from '@/composables/useWeb3';

const router = useRouter();
const authStore = useAuthStore();
const notifStore = useNotificationStore();
const uiStore = useUiStore();
const web3 = useWeb3();

function formatAddress(addr: string | null): string {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

async function handleDisconnect() {
  await web3.disconnect();
  authStore.disconnect();
  router.push('/');
}
</script>

<template>
  <header class="h-16 border-b border-border bg-card flex items-center justify-between px-6">
    <!-- Left: Toggle + Breadcrumb -->
    <div class="flex items-center gap-4">
      <button
        @click="uiStore.toggleSidebar()"
        class="p-2 rounded-md hover:bg-muted transition-colors"
      >
        <div class="w-5 h-5 flex flex-col justify-center gap-1">
          <div class="h-0.5 w-5 bg-foreground" />
          <div class="h-0.5 w-5 bg-foreground" />
          <div class="h-0.5 w-5 bg-foreground" />
        </div>
      </button>
    </div>

    <!-- Right: Notifications + Wallet -->
    <div class="flex items-center gap-3">
      <!-- Notifications -->
      <RouterLink
        to="/notifications"
        class="relative p-2 rounded-md hover:bg-muted transition-colors"
      >
        <div class="w-5 h-5 rounded-full border-2 border-current" />
        <span
          v-if="notifStore.unreadCount > 0"
          class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center"
        >
          {{ notifStore.unreadCount > 9 ? '9+' : notifStore.unreadCount }}
        </span>
      </RouterLink>

      <!-- Wallet connected state -->
      <div v-if="authStore.isAuthenticated" class="flex items-center gap-2">
        <!-- Role badge -->
        <span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
          {{ authStore.userRole }}
        </span>

        <div class="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
          <span class="text-xs font-medium text-primary">{{ authStore.address?.slice(2, 4) }}</span>
        </div>
        <span class="text-sm font-medium">{{ formatAddress(authStore.address) }}</span>

        <button
          @click="handleDisconnect"
          class="ml-1 p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          title="Disconnect wallet"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      <!-- Not connected -->
      <RouterLink
        v-else
        to="/connect"
        class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Connect Wallet
      </RouterLink>
    </div>
  </header>
</template>
