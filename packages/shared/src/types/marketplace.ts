export interface Listing {
  id: number;
  invoiceId: number;
  tokenId: number;
  sellerAddress: string;
  salePrice: string;
  originalAmount: string;
  discountPercent: string | null;
  paymentToken: string;
  expiry: string;
  isActive: boolean;
  buyerAddress: string | null;
  buyTxHash: string | null;
  listTxHash: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceStats {
  totalListings: number;
  activeListings: number;
  totalVolume: string;
  averageDiscount: string;
}
