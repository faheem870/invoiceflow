import { ref } from 'vue';

export function useMarketplaceContract() {
  const isPending = ref(false);
  const txHash = ref<string | null>(null);

  async function listInvoice(invoiceId: number, salePrice: bigint, expiry: number) {
    isPending.value = true;
    try {
      console.log('Listing invoice:', invoiceId, salePrice, expiry);
    } finally {
      isPending.value = false;
    }
  }

  async function buyInvoice(invoiceId: number) {
    isPending.value = true;
    try {
      console.log('Buying invoice:', invoiceId);
    } finally {
      isPending.value = false;
    }
  }

  async function cancelListing(invoiceId: number) {
    isPending.value = true;
    try {
      console.log('Cancelling listing:', invoiceId);
    } finally {
      isPending.value = false;
    }
  }

  return { isPending, txHash, listInvoice, buyInvoice, cancelListing };
}
