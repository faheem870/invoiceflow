<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '@/components/layout/AppLayout.vue';
import LandingLayout from '@/components/layout/LandingLayout.vue';

const route = useRoute();
const layout = computed(() => route.meta.layout as string || 'app');
</script>

<template>
  <LandingLayout v-if="layout === 'landing'">
    <RouterView />
  </LandingLayout>
  <AppLayout v-else>
    <RouterView />
  </AppLayout>
</template>
