<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Landing Header -->
    <header class="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div class="container flex h-16 items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span class="text-primary-foreground font-bold text-sm">IF</span>
          </div>
          <span class="font-bold text-xl">InvoiceFlow</span>
        </div>
        <nav class="hidden md:flex items-center gap-6">
          <a href="#features" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" class="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#themes" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Themes</a>
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
