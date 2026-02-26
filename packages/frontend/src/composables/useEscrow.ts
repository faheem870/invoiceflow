import { ref } from 'vue';

export function useEscrow() {
  const isPending = ref(false);
  const txHash = ref<string | null>(null);

  async function payInvoice(invoiceId: number) {
    isPending.value = true;
    try {
      // TODO: Approve stablecoin + call InvoiceEscrow.pay()
      console.log('Paying invoice:', invoiceId);
    } finally {
      isPending.value = false;
    }
  }

  return { isPending, txHash, payInvoice };
}
