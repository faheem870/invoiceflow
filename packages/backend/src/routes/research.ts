import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const donationSchema = z.object({
  donorAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid donor address'),
  amount: z.string().min(1, 'Amount is required'),
  txHash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
  source: z
    .enum(['direct', 'fee', 'marketplace'])
    .default('direct'),
});

const grantSchema = z.object({
  recipientAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid recipient address'),
  amount: z.string().min(1, 'Amount is required'),
  purpose: z.string().min(1, 'Purpose is required').max(2000),
});

const paginationQuerySchema = z.object({
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive().max(100))
    .optional(),
});

// ---------------------------------------------------------------------------
// GET /pool — Pool stats
// ---------------------------------------------------------------------------

router.get('/pool', async (_req: AuthRequest, res: Response) => {
  const [donations, grants, activeGrantsCount] = await Promise.all([
    prisma.researchDonation.findMany({
      select: { amount: true },
    }),
    prisma.researchGrant.findMany({
      select: { amount: true },
    }),
    prisma.researchGrant.count({
      where: { isExecuted: false },
    }),
  ]);

  const totalDonated = donations.reduce(
    (sum: number, d: { amount: unknown }) => sum + Number(d.amount),
    0,
  );

  const totalGranted = grants.reduce(
    (sum: number, g: { amount: unknown }) => sum + Number(g.amount),
    0,
  );

  res.json({
    totalDonated: totalDonated.toString(),
    totalGranted: totalGranted.toString(),
    poolBalance: (totalDonated - totalGranted).toString(),
    activeGrants: activeGrantsCount,
    totalDonations: donations.length,
    totalGrants: grants.length,
  });
});

// ---------------------------------------------------------------------------
// POST /donations — Record a donation (auth required)
// ---------------------------------------------------------------------------

router.post(
  '/donations',
  authMiddleware,
  validate(donationSchema),
  async (req: AuthRequest, res: Response) => {
    const data = req.body as z.infer<typeof donationSchema>;

    // Check for duplicate txHash
    const existing = await prisma.researchDonation.findFirst({
      where: { txHash: data.txHash },
    });

    if (existing) {
      throw new AppError('Donation with this transaction hash already recorded', 409);
    }

    const donation = await prisma.researchDonation.create({
      data: {
        donorAddress: data.donorAddress,
        amount: data.amount,
        txHash: data.txHash,
        source: data.source,
      },
    });

    res.status(201).json(donation);
  },
);

// ---------------------------------------------------------------------------
// GET /donations — List donations with pagination
// ---------------------------------------------------------------------------

router.get('/donations', async (req: AuthRequest, res: Response) => {
  const query = paginationQuerySchema.safeParse(req.query);

  if (!query.success) {
    throw new AppError('Invalid query parameters', 400);
  }

  const { page = 1, limit = 20 } = query.data;
  const skip = (page - 1) * limit;

  const [donations, total] = await Promise.all([
    prisma.researchDonation.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.researchDonation.count(),
  ]);

  res.json({
    donations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// ---------------------------------------------------------------------------
// POST /grants — Allocate a grant (auth required)
// ---------------------------------------------------------------------------

router.post(
  '/grants',
  authMiddleware,
  validate(grantSchema),
  async (req: AuthRequest, res: Response) => {
    const data = req.body as z.infer<typeof grantSchema>;

    // Verify the pool has enough balance
    const [donations, grants] = await Promise.all([
      prisma.researchDonation.findMany({ select: { amount: true } }),
      prisma.researchGrant.findMany({ select: { amount: true } }),
    ]);

    const totalDonated = donations.reduce(
      (sum: number, d: { amount: unknown }) => sum + Number(d.amount),
      0,
    );
    const totalGranted = grants.reduce(
      (sum: number, g: { amount: unknown }) => sum + Number(g.amount),
      0,
    );
    const poolBalance = totalDonated - totalGranted;
    const grantAmount = Number(data.amount);

    if (grantAmount > poolBalance) {
      throw new AppError(
        `Insufficient pool balance. Available: ${poolBalance}, Requested: ${grantAmount}`,
        400,
      );
    }

    const grant = await prisma.researchGrant.create({
      data: {
        recipientAddress: data.recipientAddress,
        amount: data.amount,
        purpose: data.purpose,
      },
    });

    res.status(201).json(grant);
  },
);

// ---------------------------------------------------------------------------
// GET /grants — List grants with pagination
// ---------------------------------------------------------------------------

router.get('/grants', async (req: AuthRequest, res: Response) => {
  const query = paginationQuerySchema.safeParse(req.query);

  if (!query.success) {
    throw new AppError('Invalid query parameters', 400);
  }

  const { page = 1, limit = 20 } = query.data;
  const skip = (page - 1) * limit;

  const [grants, total] = await Promise.all([
    prisma.researchGrant.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.researchGrant.count(),
  ]);

  res.json({
    grants,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export default router;
