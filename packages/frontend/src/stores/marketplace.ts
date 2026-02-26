import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ListingItem {
  id: number;
  invoiceId: number;
  tokenId: number;
  sellerAddress: string;
  salePrice: string;
  originalAmount: string;
  discountPercent: string;
  paymentToken: string;
  expiry: string;
  isActive: boolean;
  buyerAddress: string | null;
  createdAt: string;
  invoice?: {
    title: string | null;
    payerAddress: string;
    dueDate: string;
    status: string;
  };
}

export interface MarketplaceFilters {
  sortBy: 'newest' | 'discount' | 'dueDate' | 'amount';
  status: 'active' | 'sold' | 'all';
  search: string;
}

export const useMarketplaceStore = defineStore('marketplace', () => {
  const listings = ref<ListingItem[]>([]);
  const isLoading = ref(false);
  const filters = ref<MarketplaceFilters>({
    sortBy: 'newest',
    status: 'active',
    search: '',
  });
  const stats = ref({
    totalListings: 0,
    activeListings: 0,
    totalVolume: '0',
    averageDiscount: '0',
  });

  function setListings(list: ListingItem[]) {
    listings.value = list;
  }

  function setFilters(newFilters: Partial<MarketplaceFilters>) {
    filters.value = { ...filters.value, ...newFilters };
  }

  return {
    listings,
    isLoading,
    filters,
    stats,
    setListings,
    setFilters,
  };
});
