<script setup lang="ts">
import AppSidebar from './AppSidebar.vue';
import AppHeader from './AppHeader.vue';
import { useUiStore } from '@/stores/ui';

const uiStore = useUiStore();
</script>

<template>
  <div class="min-h-screen flex bg-background">
    <!-- Sidebar -->
    <AppSidebar :collapsed="!uiStore.sidebarOpen" />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-h-screen">
      <AppHeader />
      <main class="flex-1 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
