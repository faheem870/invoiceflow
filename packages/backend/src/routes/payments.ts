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

const createPaymentSchema = z.object({
  invoiceId: z.number().int(),
  payerAddress: z.string().length(42),
  recipientAddress: z.string().length(42),
  amount: z.string().refine((v) => {
    try {
      const d = new Decimal(v);
      return d.gt(0);
    } catch {
      return false;
    }
  }, { message: 'amount must be a positive numeric string' }),
  fee: z
    .string()
    .refine((v) => {
      try {
        const d = new Decimal(v);
        return d.gte(0);
      } catch {
        return false;
      }
    }, { message: 'fee must be a non-negative numeric string' })
    .optional(),
  txHash: z.string().max(66),
});

// ---------------------------------------------------------------------------
// POST / — Record payment (requires auth)
// ---------------------------------------------------------------------------

router.post(
  '/',
  authMiddleware,
  validate(createPaymentSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { invoiceId, payerAddress, recipientAddress, amount, fee, txHash } =
        req.body;

      // Verify the invoice exists
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
      });
      if (!invoice) {
        throw new AppError('Invoice not found', 404);
      }

      // Check for duplicate txHash
      const existingPayment = await prisma.payment.findFirst({
        where: { txHash },
      });
      if (existingPayment) {
        throw new AppError('Payment with this txHash already recorded', 409);
      }

      const payment = await prisma.payment.create({
        data: {
          invoiceId,
          tokenId: invoice.tokenId ?? undefined,
          payerAddress,
          recipientAddress,
          amount: new Decimal(amount),
          fee: fee ? new Decimal(fee) : undefined,
          txHash,
          chainId: invoice.chainId,
        },
      });

      // Update invoice status to paid
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'paid' },
      });

      res.status(201).json(payment);
    } catch (err) {
      next(err);
    }
  },
);

// ---------------------------------------------------------------------------
// GET / — List payments with filters (public)
// ---------------------------------------------------------------------------

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      invoiceId,
      payer,
      recipient,
      page = '1',
      limit = '20',
    } = req.query as Record<string, string | undefined>;

    const pageNum = Math.max(1, parseInt(page ?? '1', 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? '20', 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (invoiceId) where.invoiceId = parseInt(invoiceId, 10);
    if (payer) where.payerAddress = payer;
    if (recipient) where.recipientAddress = recipient;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { paidAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          invoice: {
            select: {
              id: true,
              tokenId: true,
              title: true,
              status: true,
              sellerAddress: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({
      data: payments,
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
// GET /:id — Get single payment by ID
// ---------------------------------------------------------------------------

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      throw new AppError('id must be a valid integer', 400);
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          select: {
            id: true,
            tokenId: true,
            title: true,
            status: true,
            sellerAddress: true,
            payerAddress: true,
            amount: true,
          },
        },
      },
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    res.json(payment);
  } catch (err) {
    next(err);
  }
});

export default router;
