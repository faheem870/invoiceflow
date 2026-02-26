import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const authSchema = z.object({
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  signature: z.string().min(1, 'Signature is required'),
  message: z.string().min(1, 'Message is required'),
});

const updateProfileSchema = z.object({
  displayName: z
    .string()
    .max(100, 'Display name must be 100 characters or less')
    .optional(),
  email: z
    .string()
    .email('Invalid email address')
    .max(320)
    .optional()
    .nullable(),
  role: z.enum(['seller', 'payer', 'investor', 'arbitrator']).optional(),
  desciOptIn: z.boolean().optional(),
});

const addressParamSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

// ---------------------------------------------------------------------------
// POST /auth — Wallet signature authentication
// ---------------------------------------------------------------------------

router.post('/auth', validate(authSchema), async (req: AuthRequest, res: Response) => {
  const { address, signature, message } = req.body as z.infer<typeof authSchema>;

  // Verify the signature matches the claimed address
  let recoveredAddress: string;
  try {
    recoveredAddress = ethers.verifyMessage(message, signature);
  } catch {
    throw new AppError('Invalid signature', 401);
  }

  if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
    throw new AppError('Signature does not match the provided address', 401);
  }

  // Normalise to checksum address for consistent DB storage
  const checksumAddress = ethers.getAddress(address);

  // Upsert user — create if first time, otherwise just fetch
  const user = await prisma.user.upsert({
    where: { walletAddress: checksumAddress },
    update: { updatedAt: new Date() },
    create: { walletAddress: checksumAddress },
  });

  // Sign JWT (subject = wallet address, expires in 7 days)
  const token = jwt.sign(
    { sub: user.walletAddress },
    env.JWT_SECRET,
    { expiresIn: '7d' },
  );

  res.json({
    token,
    user: {
      id: user.id,
      walletAddress: user.walletAddress,
      displayName: user.displayName,
      role: user.role,
      email: user.email,
      avatarUrl: user.avatarUrl,
      desciOptIn: user.desciOptIn,
      createdAt: user.createdAt,
    },
  });
});

// ---------------------------------------------------------------------------
// GET /me — Get current user profile (auth required)
// ---------------------------------------------------------------------------

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const walletAddress = req.walletAddress!;

  const user = await prisma.user.findUnique({
    where: { walletAddress },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    id: user.id,
    walletAddress: user.walletAddress,
    displayName: user.displayName,
    role: user.role,
    email: user.email,
    avatarUrl: user.avatarUrl,
    desciOptIn: user.desciOptIn,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});

// ---------------------------------------------------------------------------
// PUT /me — Update current user profile (auth required)
// ---------------------------------------------------------------------------

router.put(
  '/me',
  authMiddleware,
  validate(updateProfileSchema),
  async (req: AuthRequest, res: Response) => {
    const walletAddress = req.walletAddress!;
    const data = req.body as z.infer<typeof updateProfileSchema>;

    // Ensure the user exists before attempting update
    const existing = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!existing) {
      throw new AppError('User not found', 404);
    }

    const user = await prisma.user.update({
      where: { walletAddress },
      data: {
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.desciOptIn !== undefined && { desciOptIn: data.desciOptIn }),
      },
    });

    res.json({
      id: user.id,
      walletAddress: user.walletAddress,
      displayName: user.displayName,
      role: user.role,
      email: user.email,
      avatarUrl: user.avatarUrl,
      desciOptIn: user.desciOptIn,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  },
);

// ---------------------------------------------------------------------------
// GET /:address — Get user by wallet address (public)
// ---------------------------------------------------------------------------

router.get('/:address', async (req: AuthRequest, res: Response) => {
  const parseResult = addressParamSchema.safeParse(req.params.address);

  if (!parseResult.success) {
    throw new AppError('Invalid wallet address format', 400);
  }

  const checksumAddress = ethers.getAddress(parseResult.data);

  const user = await prisma.user.findUnique({
    where: { walletAddress: checksumAddress },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Return a limited public profile — no email
  res.json({
    id: user.id,
    walletAddress: user.walletAddress,
    displayName: user.displayName,
    role: user.role,
    avatarUrl: user.avatarUrl,
    desciOptIn: user.desciOptIn,
    createdAt: user.createdAt,
  });
});

export default router;
