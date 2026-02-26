import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Invoice {
  id: number;
  tokenId: number | null;
  invoiceHash: string;
  amount: string;
  amountDisplay: string;
  tokenSymbol: string;
  sellerAddress: string;
  payerAddress: string;
  currentOwnerAddress: string | null;
  status: string;
  dueDate: string;
  title: string | null;
  description: string | null;
  pdfUrl: string | null;
  isMilestone: boolean;
  createdAt: string;
}

export const useInvoiceStore = defineStore('invoice', () => {
  const invoices = ref<Invoice[]>([]);
  const currentInvoice = ref<Invoice | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  function setInvoices(list: Invoice[]) {
    invoices.value = list;
  }

  function setCurrentInvoice(invoice: Invoice | null) {
    currentInvoice.value = invoice;
  }

  function updateInvoiceStatus(id: number, status: string) {
    const idx = invoices.value.findIndex(inv => inv.id === id);
    if (idx !== -1) {
      invoices.value[idx].status = status;
    }
    if (currentInvoice.value?.id === id) {
      currentInvoice.value.status = status;
    }
  }

  function reset() {
    invoices.value = [];
    currentInvoice.value = null;
    error.value = null;
  }

  return {
    invoices,
    currentInvoice,
    isLoading,
    error,
    setInvoices,
    setCurrentInvoice,
    updateInvoiceStatus,
    reset,
  };
});
