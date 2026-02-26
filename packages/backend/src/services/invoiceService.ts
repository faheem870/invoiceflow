import { ethers } from 'ethers';
import { Prisma, InvoiceStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { CHAINS } from '../config/chains';
import { env } from '../config/env';

// ---- Minimal ABI for reading on-chain invoice data ----
const INVOICE_NFT_READ_ABI = [
  'function getInvoice(uint256 tokenId) view returns (tuple(bytes32 invoiceHash, uint256 amount, address token, address payer, address seller, uint64 dueDate, uint8 status, uint64 createdAt))',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
];

// Map on-chain status enum index to Prisma InvoiceStatus
const CHAIN_STATUS_MAP: Record<number, InvoiceStatus> = {
  0: 'draft',
  1: 'awaiting_approval',
  2: 'approved',
  3: 'listed',
  4: 'sold',
  5: 'disputed',
  6: 'paid',
  7: 'cancelled',
};

// ---- Types ----

export interface InvoiceFilter {
  sellerAddress?: string;
  payerAddress?: string;
  currentOwnerAddress?: string;
  status?: InvoiceStatus;
  chainId?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---- Service class ----

export class InvoiceService {
  /**
   * Read invoice data from the on-chain InvoiceNFT contract and upsert it
   * into the local database.  This is typically called after an on-chain event
   * is detected so the DB stays in sync with the blockchain.
   */
  async syncInvoiceFromChain(tokenId: number, chainId: number): Promise<void> {
    const chain = CHAINS[chainId];
    if (!chain) {
      throw new Error(`Unsupported chainId: ${chainId}`);
    }

    const rpcUrl = chainId === Number(env.CHAIN_ID) ? env.BSC_TESTNET_RPC : chain.rpcUrl;
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const contractAddress = env.INVOICE_NFT_ADDRESS;
    if (!contractAddress) {
      throw new Error('INVOICE_NFT_ADDRESS not configured');
    }

    const contract = new ethers.Contract(contractAddress, INVOICE_NFT_READ_ABI, provider);

    try {
      const invoiceData = await contract.getInvoice(tokenId);
      const currentOwner: string = await contract.ownerOf(tokenId);

      const invoiceHash: string = invoiceData.invoiceHash;
      const amount: bigint = invoiceData.amount;
      const tokenAddress: string = invoiceData.token;
      const payerAddress: string = invoiceData.payer;
      const sellerAddress: string = invoiceData.seller;
      const dueDate: bigint = invoiceData.dueDate;
      const statusIndex: number = Number(invoiceData.status);
      const createdAtTimestamp: bigint = invoiceData.createdAt;

      const status = CHAIN_STATUS_MAP[statusIndex] ?? 'draft';

      // Format amount for display (assumes 18-decimal token – adjust if needed)
      const amountDisplay = ethers.formatUnits(amount, 18);

      await prisma.invoice.upsert({
        where: { tokenId },
        update: {
          invoiceHash,
          amount: amount.toString(),
          amountDisplay,
          tokenAddress: tokenAddress.toLowerCase(),
          payerAddress: payerAddress.toLowerCase(),
          sellerAddress: sellerAddress.toLowerCase(),
          currentOwnerAddress: currentOwner.toLowerCase(),
          status,
          dueDate: new Date(Number(dueDate) * 1000),
          chainId,
        },
        create: {
          tokenId,
          invoiceHash,
          amount: amount.toString(),
          amountDisplay,
          tokenAddress: tokenAddress.toLowerCase(),
          payerAddress: payerAddress.toLowerCase(),
          sellerAddress: sellerAddress.toLowerCase(),
          currentOwnerAddress: currentOwner.toLowerCase(),
          status,
          dueDate: new Date(Number(dueDate) * 1000),
          createdAt: new Date(Number(createdAtTimestamp) * 1000),
          chainId,
        },
      });
    } catch (error) {
      console.error(`[InvoiceService] Failed to sync tokenId=${tokenId} on chain ${chainId}:`, error);
      throw error;
    }
  }

  /**
   * Query invoices from the database with optional filters and pagination.
   */
  async getInvoicesByFilter(filter: InvoiceFilter): Promise<PaginatedResult<any>> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(100, Math.max(1, filter.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filter.sellerAddress) where.sellerAddress = filter.sellerAddress.toLowerCase();
    if (filter.payerAddress) where.payerAddress = filter.payerAddress.toLowerCase();
    if (filter.currentOwnerAddress) where.currentOwnerAddress = filter.currentOwnerAddress.toLowerCase();
    if (filter.status) where.status = filter.status;
    if (filter.chainId) where.chainId = filter.chainId;

    const [data, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          listings: true,
          payments: true,
          disputes: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update the status of an invoice in the local database.
   */
  async updateInvoiceStatus(id: number, status: InvoiceStatus): Promise<any> {
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      throw new Error(`Invoice with id=${id} not found`);
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: { status },
    });

    return updated;
  }
}
