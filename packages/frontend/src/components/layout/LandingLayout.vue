<script setup lang="ts">
import { useUiStore } from '@/stores/ui';

const uiStore = useUiStore();
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Landing Header -->
    <header class="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div class="container flex h-16 items-center justify-between">
        <div class="flex items-center gap-2">
          <img src="@/assets/logo.png" alt="InvoiceFlow" class="h-8 w-8 rounded-lg object-contain" />
          <span class="font-bold text-xl">InvoiceFlow</span>
        </div>
        <nav class="hidden md:flex items-center gap-6">
          <a href="#features" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" class="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#security" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Security</a>
          <a href="#faq" class="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          <!-- Dark/Light mode toggle -->
          <button
            @click="uiStore.toggleDarkMode()"
            class="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            :title="uiStore.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <!-- Sun icon (shown in dark mode) -->
            <svg v-if="uiStore.isDarkMode" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <!-- Moon icon (shown in light mode) -->
            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          <RouterLink to="/connect" class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Launch App
          </RouterLink>
        </nav>
      </div>
    </header>

    <!-- Page Content -->
    <slot />

    <!-- Footer -->
    <footer class="border-t border-border py-8 mt-16">
      <div class="container text-center text-sm text-muted-foreground">
        <p>InvoiceFlow — Built for the BNB Smart Builders Challenge</p>
        <p class="mt-1">Open Source | Non-Custodial | Deployed on BNB Chain</p>
      </div>
    </footer>
  </div>
</template>
