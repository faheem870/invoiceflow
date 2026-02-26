import { ref } from 'vue';

export function useInvoiceContract() {
  const isPending = ref(false);
  const txHash = ref<string | null>(null);

  async function mintDraft(params: {
    invoiceHash: string;
    amount: bigint;
    token: string;
    payer: string;
    dueDate: number;
  }) {
    isPending.value = true;
    try {
      // TODO: Call InvoiceNFT.mintDraft() via wagmi
      console.log('Minting draft invoice...', params);
    } finally {
      isPending.value = false;
    }
  }

  async function requestApproval(tokenId: number) {
    isPending.value = true;
    try {
      console.log('Requesting approval for token:', tokenId);
    } finally {
      isPending.value = false;
    }
  }

  async function approveInvoice(tokenId: number) {
    isPending.value = true;
    try {
      console.log('Approving invoice:', tokenId);
    } finally {
      isPending.value = false;
    }
  }

  async function disputeInvoice(tokenId: number) {
    isPending.value = true;
    try {
      console.log('Disputing invoice:', tokenId);
    } finally {
      isPending.value = false;
    }
  }

  async function cancelInvoice(tokenId: number) {
    isPending.value = true;
    try {
      console.log('Cancelling invoice:', tokenId);
    } finally {
      isPending.value = false;
    }
  }

  return {
    isPending,
    txHash,
    mintDraft,
    requestApproval,
    approveInvoice,
    disputeInvoice,
    cancelInvoice,
  };
}
