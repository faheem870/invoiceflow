export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl: string;
}

export const SUPPORTED_TOKENS: Record<number, TokenInfo[]> = {
  // BSC Testnet
  97: [
    {
      address: '', // Will be filled with MockStablecoin address
      symbol: 'mUSDT',
      name: 'Mock USDT',
      decimals: 18,
      logoUrl: '/tokens/usdt.svg',
    },
  ],
  // Hardhat local
  31337: [
    {
      address: '',
      symbol: 'mUSDT',
      name: 'Mock USDT',
      decimals: 18,
      logoUrl: '/tokens/usdt.svg',
    },
  ],
};
