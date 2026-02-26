export interface ContractAddresses {
  invoiceNFT: string;
  invoiceEscrow: string;
  invoiceMarketplace: string;
  researchPool: string;
  mockStablecoin: string;
}

export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  // BSC Testnet (chainId: 97)
  97: {
    invoiceNFT: '',
    invoiceEscrow: '',
    invoiceMarketplace: '',
    researchPool: '',
    mockStablecoin: '',
  },
  // opBNB Testnet (chainId: 5611)
  5611: {
    invoiceNFT: '',
    invoiceEscrow: '',
    invoiceMarketplace: '',
    researchPool: '',
    mockStablecoin: '',
  },
  // Hardhat local (chainId: 31337)
  31337: {
    invoiceNFT: '',
    invoiceEscrow: '',
    invoiceMarketplace: '',
    researchPool: '',
    mockStablecoin: '',
  },
};
