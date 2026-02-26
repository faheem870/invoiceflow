export enum InvoiceStatus {
  DRAFT = 'draft',
  AWAITING_APPROVAL = 'awaiting_approval',
  APPROVED = 'approved',
  LISTED = 'listed',
  SOLD = 'sold',
  DISPUTED = 'disputed',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export interface InvoiceData {
  id: number;
  tokenId: number | null;
  invoiceHash: string;
  amount: string;
  amountDisplay: string;
  tokenAddress: string;
  tokenSymbol: string;
  sellerAddress: string;
  payerAddress: string;
  currentOwnerAddress: string | null;
  status: InvoiceStatus;
  dueDate: string;
  title: string | null;
  description: string | null;
  pdfIpfsHash: string | null;
  pdfUrl: string | null;
  isMilestone: boolean;
  milestoneDescription: string | null;
  mintTxHash: string | null;
  chainId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceInput {
  title: string;
  description?: string;
  amount: string;
  tokenAddress: string;
  tokenSymbol: string;
  payerAddress: string;
  dueDate: string;
  isMilestone?: boolean;
  milestoneDescription?: string;
}
