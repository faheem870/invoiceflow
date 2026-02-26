import { ethers } from 'ethers';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { NotificationService } from './notificationService';

// ---- Minimal ABIs (event-only) for the three contracts ----

const INVOICE_NFT_EVENTS_ABI = [
  'event InvoiceMinted(uint256 indexed tokenId, address indexed seller, address indexed payer, uint256 amount, address token, uint64 dueDate, bytes32 invoiceHash)',
  'event ApprovalRequested(uint256 indexed tokenId, address indexed payer)',
  'event InvoiceApproved(uint256 indexed tokenId, address indexed payer)',
  'event InvoiceDisputed(uint256 indexed tokenId, address indexed payer)',
  'event DisputeResolved(uint256 indexed tokenId, bool approved)',
  'event StatusChanged(uint256 indexed tokenId, uint8 oldStatus, uint8 newStatus)',
];

const INVOICE_ESCROW_EVENTS_ABI = [
  'event InvoicePaid(uint256 indexed invoiceId, address indexed payer, address indexed recipient, uint256 amount, uint256 protocolFee, uint256 researchFee)',
];

const INVOICE_MARKETPLACE_EVENTS_ABI = [
  'event InvoiceListed(uint256 indexed invoiceId, address indexed seller, uint256 salePrice, address paymentToken, uint64 expiry)',
  'event InvoiceSold(uint256 indexed invoiceId, address indexed seller, address indexed buyer, uint256 salePrice, uint256 fee)',
  'event ListingCancelled(uint256 indexed invoiceId, address indexed seller)',
];

// Map on-chain status enum index to Prisma InvoiceStatus string
const CHAIN_STATUS_MAP: Record<number, string> = {
  0: 'draft',
  1: 'awaiting_approval',
  2: 'approved',
  3: 'listed',
  4: 'sold',
  5: 'disputed',
  6: 'paid',
  7: 'cancelled',
};

// ---- Service class ----

export class EventListener {
  private provider: ethers.JsonRpcProvider | null = null;
  private nftContract: ethers.Contract | null = null;
  private escrowContract: ethers.Contract | null = null;
  private marketplaceContract: ethers.Contract | null = null;
  private notificationService: NotificationService;
  private isRunning = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly RECONNECT_DELAY_MS = 5000;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Start listening to on-chain events for all configured contracts.
   * Safe to call multiple times -- will no-op if already running.
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[EventListener] Already running, skipping start()');
      return;
    }

    console.log('[EventListener] Starting event listeners...');

    try {
      this.provider = new ethers.JsonRpcProvider(env.BSC_TESTNET_RPC);

      // Validate connection
      await this.provider.getBlockNumber();
      console.log('[EventListener] Connected to RPC');

      // Set up contracts
      this.setupContracts();

      // Attach event handlers
      this.attachNftListeners();
      this.attachEscrowListeners();
      this.attachMarketplaceListeners();

      // Monitor for disconnection
      this.provider.on('error', (error: Error) => {
        console.error('[EventListener] Provider error:', error.message);
        this.handleDisconnect();
      });

      this.isRunning = true;
      console.log('[EventListener] All listeners attached successfully');
    } catch (error) {
      console.error('[EventListener] Failed to start:', error);
      this.handleDisconnect();
    }
  }

  /**
   * Stop all event listeners and clean up resources.
   */
  async stop(): Promise<void> {
    console.log('[EventListener] Stopping event listeners...');

    this.isRunning = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    try {
      if (this.nftContract) {
        await this.nftContract.removeAllListeners();
      }
      if (this.escrowContract) {
        await this.escrowContract.removeAllListeners();
      }
      if (this.marketplaceContract) {
        await this.marketplaceContract.removeAllListeners();
      }
    } catch (error) {
      console.error('[EventListener] Error removing listeners:', error);
    }

    if (this.provider) {
      this.provider.removeAllListeners();
      this.provider.destroy();
      this.provider = null;
    }

    this.nftContract = null;
    this.escrowContract = null;
    this.marketplaceContract = null;

    console.log('[EventListener] Stopped');
  }

  // ── Private helpers ────────────────────────────────────────────────

  private setupContracts(): void {
    if (!this.provider) return;

    if (env.INVOICE_NFT_ADDRESS) {
      this.nftContract = new ethers.Contract(
        env.INVOICE_NFT_ADDRESS,
        INVOICE_NFT_EVENTS_ABI,
        this.provider,
      );
      console.log(`[EventListener] InvoiceNFT contract: ${env.INVOICE_NFT_ADDRESS}`);
    } else {
      console.warn('[EventListener] INVOICE_NFT_ADDRESS not set, skipping NFT events');
    }

    if (env.INVOICE_ESCROW_ADDRESS) {
      this.escrowContract = new ethers.Contract(
        env.INVOICE_ESCROW_ADDRESS,
        INVOICE_ESCROW_EVENTS_ABI,
        this.provider,
      );
      console.log(`[EventListener] InvoiceEscrow contract: ${env.INVOICE_ESCROW_ADDRESS}`);
    } else {
      console.warn('[EventListener] INVOICE_ESCROW_ADDRESS not set, skipping Escrow events');
    }

    if (env.INVOICE_MARKETPLACE_ADDRESS) {
      this.marketplaceContract = new ethers.Contract(
        env.INVOICE_MARKETPLACE_ADDRESS,
        INVOICE_MARKETPLACE_EVENTS_ABI,
        this.provider,
      );
      console.log(`[EventListener] InvoiceMarketplace contract: ${env.INVOICE_MARKETPLACE_ADDRESS}`);
    } else {
      console.warn('[EventListener] INVOICE_MARKETPLACE_ADDRESS not set, skipping Marketplace events');
    }
  }

  // ── NFT event handlers ─────────────────────────────────────────────

  private attachNftListeners(): void {
    if (!this.nftContract) return;

    this.nftContract.on(
      'InvoiceMinted',
      async (
        tokenId: bigint,
        seller: string,
        payer: string,
        amount: bigint,
        token: string,
        dueDate: bigint,
        invoiceHash: string,
        event: ethers.EventLog,
      ) => {
        try {
          console.log(`[EventListener] InvoiceMinted tokenId=${tokenId}`);

          await prisma.invoice.upsert({
            where: { tokenId: Number(tokenId) },
            update: {
              invoiceHash,
              amount: new Prisma.Decimal(amount.toString()),
              amountDisplay: ethers.formatUnits(amount, 18),
              tokenAddress: token.toLowerCase(),
              sellerAddress: seller.toLowerCase(),
              payerAddress: payer.toLowerCase(),
              currentOwnerAddress: seller.toLowerCase(),
              status: 'draft',
              dueDate: new Date(Number(dueDate) * 1000),
              mintTxHash: event.transactionHash,
              chainId: Number(env.CHAIN_ID),
            },
            create: {
              tokenId: Number(tokenId),
              invoiceHash,
              amount: new Prisma.Decimal(amount.toString()),
              amountDisplay: ethers.formatUnits(amount, 18),
              tokenAddress: token.toLowerCase(),
              sellerAddress: seller.toLowerCase(),
              payerAddress: payer.toLowerCase(),
              currentOwnerAddress: seller.toLowerCase(),
              status: 'draft',
              dueDate: new Date(Number(dueDate) * 1000),
              mintTxHash: event.transactionHash,
              chainId: Number(env.CHAIN_ID),
            },
          });

          await this.notificationService.createNotification(
            payer.toLowerCase(),
            'invoice_created',
            'New Invoice Received',
            `A new invoice #${tokenId} has been created by ${seller.slice(0, 8)}...`,
          );
        } catch (error) {
          console.error('[EventListener] Error handling InvoiceMinted:', error);
        }
      },
    );

    this.nftContract.on(
      'ApprovalRequested',
      async (tokenId: bigint, payer: string) => {
        try {
          console.log(`[EventListener] ApprovalRequested tokenId=${tokenId}`);

          await prisma.invoice.updateMany({
            where: { tokenId: Number(tokenId) },
            data: { status: 'awaiting_approval' },
          });

          const invoice = await prisma.invoice.findUnique({
            where: { tokenId: Number(tokenId) },
          });

          await this.notificationService.createNotification(
            payer.toLowerCase(),
            'approval_requested',
            'Approval Requested',
            `Invoice #${tokenId} requires your approval.`,
            invoice?.id,
          );
        } catch (error) {
          console.error('[EventListener] Error handling ApprovalRequested:', error);
        }
      },
    );

    this.nftContract.on(
      'InvoiceApproved',
      async (tokenId: bigint, payer: string) => {
        try {
          console.log(`[EventListener] InvoiceApproved tokenId=${tokenId}`);

          await prisma.invoice.updateMany({
            where: { tokenId: Number(tokenId) },
            data: { status: 'approved' },
          });

          const invoice = await prisma.invoice.findUnique({
            where: { tokenId: Number(tokenId) },
          });

          // Notify the seller
          if (invoice) {
            await this.notificationService.createNotification(
              invoice.sellerAddress,
              'invoice_approved',
              'Invoice Approved',
              `Invoice #${tokenId} has been approved by the payer.`,
              invoice.id,
            );
          }
        } catch (error) {
          console.error('[EventListener] Error handling InvoiceApproved:', error);
        }
      },
    );

    this.nftContract.on(
      'InvoiceDisputed',
      async (tokenId: bigint, payer: string) => {
        try {
          console.log(`[EventListener] InvoiceDisputed tokenId=${tokenId}`);

          await prisma.invoice.updateMany({
            where: { tokenId: Number(tokenId) },
            data: { status: 'disputed' },
          });

          const invoice = await prisma.invoice.findUnique({
            where: { tokenId: Number(tokenId) },
          });

          if (invoice) {
            // Create dispute record
            await prisma.dispute.create({
              data: {
                invoiceId: invoice.id,
                tokenId: Number(tokenId),
                disputedBy: payer.toLowerCase(),
              },
            });

            await this.notificationService.createNotification(
              invoice.sellerAddress,
              'invoice_disputed',
              'Invoice Disputed',
              `Invoice #${tokenId} has been disputed by the payer.`,
              invoice.id,
            );
          }
        } catch (error) {
          console.error('[EventListener] Error handling InvoiceDisputed:', error);
        }
      },
    );

    this.nftContract.on(
      'DisputeResolved',
      async (tokenId: bigint, approved: boolean) => {
        try {
          console.log(`[EventListener] DisputeResolved tokenId=${tokenId} approved=${approved}`);

          const newStatus = approved ? 'approved' : 'cancelled';
          await prisma.invoice.updateMany({
            where: { tokenId: Number(tokenId) },
            data: { status: newStatus as 'approved' | 'cancelled' },
          });

          const invoice = await prisma.invoice.findUnique({
            where: { tokenId: Number(tokenId) },
          });

          if (invoice) {
            // Mark latest open dispute as resolved
            const openDispute = await prisma.dispute.findFirst({
              where: { invoiceId: invoice.id, isResolved: false },
              orderBy: { createdAt: 'desc' },
            });

            if (openDispute) {
              await prisma.dispute.update({
                where: { id: openDispute.id },
                data: {
                  isResolved: true,
                  resolution: approved ? 'Resolved in favour of seller' : 'Resolved in favour of payer',
                  resolvedAt: new Date(),
                },
              });
            }

            // Notify both parties
            const message = approved
              ? `Dispute for invoice #${tokenId} has been resolved -- invoice approved.`
              : `Dispute for invoice #${tokenId} has been resolved -- invoice cancelled.`;

            await Promise.all([
              this.notificationService.createNotification(
                invoice.sellerAddress,
                'dispute_resolved',
                'Dispute Resolved',
                message,
                invoice.id,
              ),
              this.notificationService.createNotification(
                invoice.payerAddress,
                'dispute_resolved',
                'Dispute Resolved',
                message,
                invoice.id,
              ),
            ]);
          }
        } catch (error) {
          console.error('[EventListener] Error handling DisputeResolved:', error);
        }
      },
    );
  }

  // ── Escrow event handlers ──────────────────────────────────────────

  private attachEscrowListeners(): void {
    if (!this.escrowContract) return;

    this.escrowContract.on(
      'InvoicePaid',
      async (
        invoiceId: bigint,
        payer: string,
        recipient: string,
        amount: bigint,
        protocolFee: bigint,
        researchFee: bigint,
        event: ethers.EventLog,
      ) => {
        try {
          console.log(`[EventListener] InvoicePaid invoiceId=${invoiceId}`);

          // Update invoice status
          await prisma.invoice.updateMany({
            where: { tokenId: Number(invoiceId) },
            data: { status: 'paid' },
          });

          const invoice = await prisma.invoice.findUnique({
            where: { tokenId: Number(invoiceId) },
          });

          if (invoice) {
            // Create payment record
            await prisma.payment.create({
              data: {
                invoiceId: invoice.id,
                tokenId: Number(invoiceId),
                payerAddress: payer.toLowerCase(),
                recipientAddress: recipient.toLowerCase(),
                amount: new Prisma.Decimal(amount.toString()),
                fee: new Prisma.Decimal(protocolFee.toString()),
                txHash: event.transactionHash,
                chainId: Number(env.CHAIN_ID),
                paidAt: new Date(),
              },
            });

            // Track research donation if applicable
            if (researchFee > 0n) {
              await prisma.researchDonation.create({
                data: {
                  donorAddress: payer.toLowerCase(),
                  amount: new Prisma.Decimal(researchFee.toString()),
                  txHash: event.transactionHash,
                  source: 'escrow_fee',
                },
              });
            }

            // Notify both parties
            await Promise.all([
              this.notificationService.createNotification(
                recipient.toLowerCase(),
                'invoice_paid',
                'Invoice Paid',
                `Invoice #${invoiceId} has been paid by ${payer.slice(0, 8)}...`,
                invoice.id,
              ),
              this.notificationService.createNotification(
                payer.toLowerCase(),
                'payment_confirmed',
                'Payment Confirmed',
                `Your payment for invoice #${invoiceId} has been confirmed.`,
                invoice.id,
              ),
            ]);
          }
        } catch (error) {
          console.error('[EventListener] Error handling InvoicePaid:', error);
        }
      },
    );
  }

  // ── Marketplace event handlers ─────────────────────────────────────

  private attachMarketplaceListeners(): void {
    if (!this.marketplaceContract) return;

    this.marketplaceContract.on(
      'InvoiceListed',
      async (
        invoiceId: bigint,
        seller: string,
        salePrice: bigint,
        paymentToken: string,
        expiry: bigint,
        event: ethers.EventLog,
      ) => {
        try {
          console.log(`[EventListener] InvoiceListed invoiceId=${invoiceId}`);

          // Update invoice status
          await prisma.invoice.updateMany({
            where: { tokenId: Number(invoiceId) },
            data: { status: 'listed' },
          });

          const invoice = await prisma.invoice.findUnique({
            where: { tokenId: Number(invoiceId) },
          });

          if (invoice) {
            // Calculate discount percent
            const originalAmount = Number(invoice.amount);
            const salePriceNum = Number(ethers.formatUnits(salePrice, 18));
            const originalAmountNum = Number(ethers.formatUnits(BigInt(invoice.amount.toString()), 18));
            const discountPercent =
              originalAmountNum > 0
                ? ((originalAmountNum - salePriceNum) / originalAmountNum * 100).toFixed(2)
                : '0';

            await prisma.listing.create({
              data: {
                invoiceId: invoice.id,
                tokenId: Number(invoiceId),
                sellerAddress: seller.toLowerCase(),
                salePrice: new Prisma.Decimal(salePrice.toString()),
                originalAmount: invoice.amount,
                discountPercent,
                paymentToken: paymentToken.toLowerCase(),
                expiry: new Date(Number(expiry) * 1000),
                isActive: true,
                listTxHash: event.transactionHash,
              },
            });

            await this.notificationService.createNotification(
              invoice.payerAddress,
              'invoice_listed',
              'Invoice Listed on Marketplace',
              `Invoice #${invoiceId} has been listed for sale at a ${discountPercent}% discount.`,
              invoice.id,
            );
          }
        } catch (error) {
          console.error('[EventListener] Error handling InvoiceListed:', error);
        }
      },
    );

    this.marketplaceContract.on(
      'InvoiceSold',
      async (
        invoiceId: bigint,
        seller: string,
        buyer: string,
        salePrice: bigint,
        fee: bigint,
        event: ethers.EventLog,
      ) => {
        try {
          console.log(`[EventListener] InvoiceSold invoiceId=${invoiceId}`);

          // Update invoice status and owner
          await prisma.invoice.updateMany({
            where: { tokenId: Number(invoiceId) },
            data: {
              status: 'sold',
              currentOwnerAddress: buyer.toLowerCase(),
            },
          });

          const invoice = await prisma.invoice.findUnique({
            where: { tokenId: Number(invoiceId) },
          });

          if (invoice) {
            // Mark the active listing as sold
            await prisma.listing.updateMany({
              where: {
                invoiceId: invoice.id,
                isActive: true,
              },
              data: {
                isActive: false,
                buyerAddress: buyer.toLowerCase(),
                buyTxHash: event.transactionHash,
              },
            });

            // Notify all three parties
            await Promise.all([
              this.notificationService.createNotification(
                seller.toLowerCase(),
                'invoice_sold',
                'Invoice Sold',
                `Your listed invoice #${invoiceId} has been purchased by ${buyer.slice(0, 8)}...`,
                invoice.id,
              ),
              this.notificationService.createNotification(
                buyer.toLowerCase(),
                'invoice_purchased',
                'Invoice Purchased',
                `You have purchased invoice #${invoiceId}.`,
                invoice.id,
              ),
              this.notificationService.createNotification(
                invoice.payerAddress,
                'invoice_ownership_changed',
                'Invoice Ownership Changed',
                `Invoice #${invoiceId} has a new owner. Payments should now go to ${buyer.slice(0, 8)}...`,
                invoice.id,
              ),
            ]);
          }
        } catch (error) {
          console.error('[EventListener] Error handling InvoiceSold:', error);
        }
      },
    );

    this.marketplaceContract.on(
      'ListingCancelled',
      async (invoiceId: bigint, seller: string) => {
        try {
          console.log(`[EventListener] ListingCancelled invoiceId=${invoiceId}`);

          // Revert invoice status to approved
          await prisma.invoice.updateMany({
            where: { tokenId: Number(invoiceId) },
            data: { status: 'approved' },
          });

          const invoice = await prisma.invoice.findUnique({
            where: { tokenId: Number(invoiceId) },
          });

          if (invoice) {
            // Deactivate the listing
            await prisma.listing.updateMany({
              where: {
                invoiceId: invoice.id,
                isActive: true,
              },
              data: { isActive: false },
            });

            await this.notificationService.createNotification(
              seller.toLowerCase(),
              'listing_cancelled',
              'Listing Cancelled',
              `Your listing for invoice #${invoiceId} has been cancelled.`,
              invoice.id,
            );
          }
        } catch (error) {
          console.error('[EventListener] Error handling ListingCancelled:', error);
        }
      },
    );
  }

  // ── Reconnection logic ─────────────────────────────────────────────

  private handleDisconnect(): void {
    if (!this.isRunning) return;

    console.warn('[EventListener] Disconnected, scheduling reconnect...');

    // Clean up current connections without changing isRunning flag
    try {
      this.nftContract?.removeAllListeners();
      this.escrowContract?.removeAllListeners();
      this.marketplaceContract?.removeAllListeners();
      this.provider?.removeAllListeners();
      this.provider?.destroy();
    } catch {
      // Ignore cleanup errors
    }

    this.provider = null;
    this.nftContract = null;
    this.escrowContract = null;
    this.marketplaceContract = null;

    // Schedule reconnect
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(async () => {
      console.log('[EventListener] Attempting reconnect...');
      this.isRunning = false; // Allow start() to proceed
      try {
        await this.start();
      } catch (error) {
        console.error('[EventListener] Reconnect failed:', error);
        this.handleDisconnect(); // Retry
      }
    }, this.RECONNECT_DELAY_MS);
  }
}
