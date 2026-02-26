import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const createInvoiceSchema = z.object({
  tokenId: z.number().int().optional(),
  invoiceHash: z.string().max(66).optional(),
  amount: z.string().refine((v) => {
    try {
      const d = new Decimal(v);
      return d.gte(0);
    } catch {
      return false;
    }
  }, { message: 'amount must be a non-negative numeric string' }),
  tokenAddress: z.string().length(42),
  payerAddress: z.string().length(42),
  title: z.string().max(200).optional(),
  description: z.string().optional(),
  dueDate: z.string().refine((v) => !isNaN(Date.parse(v)), {
    message: 'dueDate must be a valid ISO date string',
  }),
  isMilestone: z.boolean().optional().default(false),
  pdfIpfsHash: z.string().max(100).optional(),
  mintTxHash: z.string().max(66).optional(),
  chainId: z.number().int().optional().default(97),
});

const updateInvoiceSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().optional(),
  status: z
    .enum([
      'draft',
      'awaiting_approval',
      'approved',
      'listed',
      'sold',
      'disputed',
      'paid',
      'cancelled',
    ])
    .optional(),
  currentOwnerAddress: z.string().length(42).optional(),
});

// ---------------------------------------------------------------------------
// POST / — Create invoice (requires auth)
// ---------------------------------------------------------------------------

router.post(
  '/',
  authMiddleware,
  validate(createInvoiceSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const walletAddress = req.walletAddress;
      if (!walletAddress) {
        throw new AppError('Wallet address not found in token', 401);
      }

      const {
        tokenId,
        invoiceHash,
        amount,
        tokenAddress,
        payerAddress,
        title,
        description,
        dueDate,
        isMilestone,
        pdfIpfsHash,
        mintTxHash,
        chainId,
      } = req.body;

      const invoice = await prisma.invoice.create({
        data: {
          tokenId: tokenId ?? undefined,
          invoiceHash: invoiceHash ?? undefined,
          amount: new Decimal(amount),
          tokenAddress,
          sellerAddress: walletAddress,
          payerAddress,
          currentOwnerAddress: walletAddress,
          title: title ?? undefined,
          description: description ?? undefined,
          dueDate: new Date(dueDate),
          isMilestone,
          pdfIpfsHash: pdfIpfsHash ?? undefined,
          mintTxHash: mintTxHash ?? undefined,
          chainId,
        },
      });

      res.status(201).json(invoice);
    } catch (err) {
      next(err);
    }
  },
);

// ---------------------------------------------------------------------------
// GET / — List invoices with query filters (public)
// ---------------------------------------------------------------------------

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      seller,
      payer,
      owner,
      status,
      page = '1',
      limit = '20',
    } = req.query as Record<string, string | undefined>;

    const pageNum = Math.max(1, parseInt(page ?? '1', 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? '20', 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (seller) where.sellerAddress = seller;
    if (payer) where.payerAddress = payer;
    if (owner) where.currentOwnerAddress = owner;
    if (status) where.status = status;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.invoice.count({ where }),
    ]);

    res.json({
      data: invoices,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /by-token/:tokenId — Get invoice by on-chain tokenId
// ---------------------------------------------------------------------------

router.get(
  '/by-token/:tokenId',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const tokenId = parseInt(String(req.params.tokenId), 10);
      if (isNaN(tokenId)) {
        throw new AppError('tokenId must be a valid integer', 400);
      }

      const invoice = await prisma.invoice.findUnique({
        where: { tokenId },
        include: {
          payments: true,
          listings: true,
          disputes: true,
        },
      });

      if (!invoice) {
        throw new AppError('Invoice not found', 404);
      }

      res.json(invoice);
    } catch (err) {
      next(err);
    }
  },
);

// ---------------------------------------------------------------------------
// GET /:id — Get single invoice with relations
// ---------------------------------------------------------------------------

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      throw new AppError('id must be a valid integer', 400);
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        payments: true,
        listings: true,
        disputes: true,
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    res.json(invoice);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update invoice (requires auth, limited fields)
// ---------------------------------------------------------------------------

router.put(
  '/:id',
  authMiddleware,
  validate(updateInvoiceSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        throw new AppError('id must be a valid integer', 400);
      }

      const walletAddress = req.walletAddress;
      if (!walletAddress) {
        throw new AppError('Wallet address not found in token', 401);
      }

      const existing = await prisma.invoice.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError('Invoice not found', 404);
      }

      // Only the current owner or the original seller can update
      const isOwner =
        existing.currentOwnerAddress?.toLowerCase() === walletAddress.toLowerCase();
      const isSeller =
        existing.sellerAddress.toLowerCase() === walletAddress.toLowerCase();

      if (!isOwner && !isSeller) {
        throw new AppError('Not authorized to update this invoice', 403);
      }

      const { title, description, status, currentOwnerAddress } = req.body;

      const data: Record<string, unknown> = {};
      if (title !== undefined) data.title = title;
      if (description !== undefined) data.description = description;
      if (status !== undefined) data.status = status;
      if (currentOwnerAddress !== undefined) data.currentOwnerAddress = currentOwnerAddress;

      const updated = await prisma.invoice.update({
        where: { id },
        data,
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// ---------------------------------------------------------------------------
// GET /:id/payments — Get payments for an invoice
// ---------------------------------------------------------------------------

router.get(
  '/:id/payments',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const invoiceId = parseInt(String(req.params.id), 10);
      if (isNaN(invoiceId)) {
        throw new AppError('id must be a valid integer', 400);
      }

      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
      });
      if (!invoice) {
        throw new AppError('Invoice not found', 404);
      }

      const payments = await prisma.payment.findMany({
        where: { invoiceId },
        orderBy: { paidAt: 'desc' },
      });

      res.json(payments);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
