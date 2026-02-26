import { ref } from 'vue';

export function useResearchPool() {
  const isPending = ref(false);
  const txHash = ref<string | null>(null);

  async function donate(amount: bigint) {
    isPending.value = true;
    try {
      console.log('Donating to research pool:', amount);
    } finally {
      isPending.value = false;
    }
  }

  return { isPending, txHash, donate };
}
