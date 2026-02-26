import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const notificationQuerySchema = z.object({
  unreadOnly: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
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
// GET /unread-count — Get unread notification count
// ---------------------------------------------------------------------------

router.get(
  '/unread-count',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const walletAddress = req.walletAddress!;

    const count = await prisma.notification.count({
      where: {
        recipientAddress: walletAddress,
        isRead: false,
      },
    });

    res.json({ unreadCount: count });
  },
);

// ---------------------------------------------------------------------------
// PUT /read-all — Mark all notifications as read
// ---------------------------------------------------------------------------

router.put(
  '/read-all',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const walletAddress = req.walletAddress!;

    const result = await prisma.notification.updateMany({
      where: {
        recipientAddress: walletAddress,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({
      message: 'All notifications marked as read',
      updatedCount: result.count,
    });
  },
);

// ---------------------------------------------------------------------------
// GET / — Get notifications for authenticated user
// ---------------------------------------------------------------------------

router.get(
  '/',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const walletAddress = req.walletAddress!;

    const query = notificationQuerySchema.safeParse(req.query);
    if (!query.success) {
      throw new AppError('Invalid query parameters', 400);
    }

    const { unreadOnly, page = 1, limit = 20 } = query.data;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      recipientAddress: walletAddress,
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  },
);

// ---------------------------------------------------------------------------
// PUT /:id/read — Mark a single notification as read
// ---------------------------------------------------------------------------

router.put(
  '/:id/read',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const walletAddress = req.walletAddress!;
    const id = parseInt(req.params.id as string, 10);

    if (isNaN(id)) {
      throw new AppError('Invalid notification ID', 400);
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.recipientAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new AppError('You do not have access to this notification', 403);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json(updated);
  },
);

export default router;
