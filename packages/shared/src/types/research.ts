export interface ResearchDonation {
  id: number;
  donorAddress: string;
  amount: string;
  txHash: string;
  source: 'direct' | 'protocol_fee';
  createdAt: string;
}

export interface ResearchGrant {
  id: number;
  recipientAddress: string;
  amount: string;
  purpose: string | null;
  isExecuted: boolean;
  txHash: string | null;
  createdAt: string;
  executedAt: string | null;
}

export interface PoolStats {
  totalDonations: string;
  totalGrantsAllocated: string;
  totalGrantsExecuted: string;
  donorCount: number;
}
