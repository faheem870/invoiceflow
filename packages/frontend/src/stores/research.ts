import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useResearchStore = defineStore('research', () => {
  const poolStats = ref({
    totalDonations: '0',
    totalGrantsAllocated: '0',
    totalGrantsExecuted: '0',
    donorCount: 0,
  });
  const donations = ref<any[]>([]);
  const grants = ref<any[]>([]);
  const isLoading = ref(false);

  return {
    poolStats,
    donations,
    grants,
    isLoading,
  };
});
