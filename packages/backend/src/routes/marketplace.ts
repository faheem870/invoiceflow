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

const createListingSchema = z.object({
  invoiceId: z.number().int().positive('Invoice ID must be a positive integer'),
  tokenId: z.number().int().nonnegative('Token ID must be non-negative'),
  salePrice: z.string().min(1, 'Sale price is required'),
  originalAmount: z.string().min(1, 'Original amount is required'),
  discountPercent: z.string().optional(),
  paymentToken: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid payment token address'),
  expiry: z.string().datetime('Invalid expiry date'),
});

const updateListingSchema = z.object({
  isActive: z.boolean(),
  buyerAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid buyer address')
    .optional(),
  buyTxHash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash')
    .optional(),
});

const browseQuerySchema = z.object({
  isActive: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  minDiscount: z
    .string()
    .transform(Number)
    .pipe(z.number().nonnegative())
    .optional(),
  maxDiscount: z
    .string()
    .transform(Number)
    .pipe(z.number().nonnegative())
    .optional(),
  minAmount: z
    .string()
    .transform(Number)
    .pipe(z.number().nonnegative())
    .optional(),
  maxAmount: z
    .string()
    .transform(Number)
    .pipe(z.number().nonnegative())
    .optional(),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'discount']).optional(),
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
// POST / — Create a marketplace listing (auth required)
// ---------------------------------------------------------------------------

router.post(
  '/',
  authMiddleware,
  validate(createListingSchema),
  async (req: AuthRequest, res: Response) => {
    const walletAddress = req.walletAddress!;
    const data = req.body as z.infer<typeof createListingSchema>;

    // Verify the invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // Verify the caller owns the invoice
    if (
      invoice.sellerAddress.toLowerCase() !== walletAddress.toLowerCase() &&
      invoice.currentOwnerAddress?.toLowerCase() !== walletAddress.toLowerCase()
    ) {
      throw new AppError('You are not the owner of this invoice', 403);
    }

    // Check for duplicate active listing
    const existingListing = await prisma.listing.findFirst({
      where: { invoiceId: data.invoiceId, isActive: true },
    });

    if (existingListing) {
      throw new AppError('An active listing already exists for this invoice', 409);
    }

    const listing = await prisma.listing.create({
      data: {
        invoiceId: data.invoiceId,
        tokenId: data.tokenId,
        sellerAddress: walletAddress,
        salePrice: data.salePrice,
        originalAmount: data.originalAmount,
        discountPercent: data.discountPercent,
        paymentToken: data.paymentToken,
        expiry: new Date(data.expiry),
      },
      include: { invoice: true },
    });

    // Update invoice status to listed
    await prisma.invoice.update({
      where: { id: data.invoiceId },
      data: { status: 'listed' },
    });

    res.status(201).json(listing);
  },
);

// ---------------------------------------------------------------------------
// GET /stats — Marketplace aggregate stats
// ---------------------------------------------------------------------------

router.get('/stats', async (_req: AuthRequest, res: Response) => {
  const [totalListings, activeListings, allListings] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.count({ where: { isActive: true } }),
    prisma.listing.findMany({
      select: { salePrice: true, discountPercent: true },
    }),
  ]);

  const totalVolume = allListings.reduce(
    (sum: number, l: { salePrice: unknown }) => sum + Number(l.salePrice),
    0,
  );

  const avgDiscount =
    allListings.length > 0
      ? allListings.reduce(
          (sum: number, l: { discountPercent: string | null }) =>
            sum + (l.discountPercent ? parseFloat(l.discountPercent) : 0),
          0,
        ) / allListings.length
      : 0;

  res.json({
    totalListings,
    activeListings,
    totalVolume: totalVolume.toString(),
    avgDiscount: avgDiscount.toFixed(2),
  });
});

// ---------------------------------------------------------------------------
// GET / — Browse listings with filters
// ---------------------------------------------------------------------------

router.get('/', async (req: AuthRequest, res: Response) => {
  const query = browseQuerySchema.safeParse(req.query);

  if (!query.success) {
    throw new AppError('Invalid query parameters', 400);
  }

  const {
    isActive,
    minDiscount,
    maxDiscount,
    minAmount,
    maxAmount,
    sort,
    page = 1,
    limit = 20,
  } = query.data;

  // Build where clause
  const where: Record<string, unknown> = {};

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  // Discount filters — discountPercent is stored as a string
  if (minDiscount !== undefined || maxDiscount !== undefined) {
    // We need to filter in-app since discountPercent is a varchar
    // For now we use Prisma raw-ish approach via a post-filter
  }

  // Amount filters on salePrice (Decimal)
  if (minAmount !== undefined || maxAmount !== undefined) {
    where.salePrice = {};
    if (minAmount !== undefined) {
      (where.salePrice as Record<string, unknown>).gte = minAmount;
    }
    if (maxAmount !== undefined) {
      (where.salePrice as Record<string, unknown>).lte = maxAmount;
    }
  }

  // Build orderBy
  let orderBy: Record<string, string> = { createdAt: 'desc' };
  switch (sort) {
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
    case 'price_asc':
      orderBy = { salePrice: 'asc' };
      break;
    case 'price_desc':
      orderBy = { salePrice: 'desc' };
      break;
    case 'discount':
      orderBy = { discountPercent: 'desc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  const skip = (page - 1) * limit;

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        invoice: {
          select: {
            id: true,
            tokenId: true,
            amount: true,
            amountDisplay: true,
            tokenSymbol: true,
            sellerAddress: true,
            payerAddress: true,
            status: true,
            dueDate: true,
            title: true,
            description: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  // Post-filter by discount if needed
  type ListingItem = (typeof listings)[number];
  let filtered: ListingItem[] = listings;
  if (minDiscount !== undefined) {
    filtered = filtered.filter(
      (l: ListingItem) =>
        l.discountPercent !== null && parseFloat(l.discountPercent) >= minDiscount,
    );
  }
  if (maxDiscount !== undefined) {
    filtered = filtered.filter(
      (l: ListingItem) =>
        l.discountPercent !== null && parseFloat(l.discountPercent) <= maxDiscount,
    );
  }

  res.json({
    listings: filtered,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// ---------------------------------------------------------------------------
// GET /by-invoice/:invoiceId — Get listing by invoiceId
// ---------------------------------------------------------------------------

router.get('/by-invoice/:invoiceId', async (req: AuthRequest, res: Response) => {
  const invoiceId = parseInt(req.params.invoiceId as string, 10);

  if (isNaN(invoiceId)) {
    throw new AppError('Invalid invoice ID', 400);
  }

  const listing = await prisma.listing.findFirst({
    where: { invoiceId },
    include: { invoice: true },
    orderBy: { createdAt: 'desc' },
  });

  if (!listing) {
    throw new AppError('Listing not found for this invoice', 404);
  }

  res.json(listing);
});

// ---------------------------------------------------------------------------
// GET /:id — Get listing by ID
// ---------------------------------------------------------------------------

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id as string, 10);

  if (isNaN(id)) {
    throw new AppError('Invalid listing ID', 400);
  }

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { invoice: true },
  });

  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  res.json(listing);
});

// ---------------------------------------------------------------------------
// PUT /:id — Update listing (delist / mark sold)
// ---------------------------------------------------------------------------

router.put(
  '/:id',
  authMiddleware,
  validate(updateListingSchema),
  async (req: AuthRequest, res: Response) => {
    const walletAddress = req.walletAddress!;
    const id = parseInt(req.params.id as string, 10);

    if (isNaN(id)) {
      throw new AppError('Invalid listing ID', 400);
    }

    const data = req.body as z.infer<typeof updateListingSchema>;

    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    // Only the seller or buyer can update the listing
    if (listing.sellerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new AppError('You are not the seller of this listing', 403);
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        isActive: data.isActive,
        ...(data.buyerAddress && { buyerAddress: data.buyerAddress }),
        ...(data.buyTxHash && { buyTxHash: data.buyTxHash }),
      },
      include: { invoice: true },
    });

    // If delisted or sold, update the invoice status accordingly
    if (!data.isActive && data.buyerAddress) {
      await prisma.invoice.update({
        where: { id: listing.invoiceId },
        data: {
          status: 'sold',
          currentOwnerAddress: data.buyerAddress,
        },
      });
    }

    res.json(updated);
  },
);

export default router;
