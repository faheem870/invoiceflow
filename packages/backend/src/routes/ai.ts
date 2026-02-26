import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const riskScoreSchema = z.object({
  invoiceId: z.number().int().positive().optional(),
  payerAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid payer address'),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string().datetime('Invalid due date'),
  payerHistory: z
    .object({
      totalInvoices: z.number().int().nonnegative().default(0),
      onTimePayments: z.number().int().nonnegative().default(0),
      latePayments: z.number().int().nonnegative().default(0),
      disputes: z.number().int().nonnegative().default(0),
    })
    .optional(),
});

// ---------------------------------------------------------------------------
// Risk scoring engine (rule-based)
// ---------------------------------------------------------------------------

interface RiskFactor {
  name: string;
  impact: number;
  description: string;
}

function calculateRiskScore(params: {
  amount: number;
  dueDate: Date;
  payerHistory: {
    totalInvoices: number;
    onTimePayments: number;
    latePayments: number;
    disputes: number;
  };
}): {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  suggestedDiscount: number;
  confidence: number;
  factors: RiskFactor[];
  explanation: string;
} {
  const { amount, dueDate, payerHistory } = params;
  const factors: RiskFactor[] = [];

  // Base discount: 2%
  let discount = 2;
  factors.push({
    name: 'Base Rate',
    impact: 2,
    description: 'Standard base discount rate',
  });

  // Days to due date calculation
  const now = new Date();
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntilDue < 7) {
    discount += 2;
    factors.push({
      name: 'Near-Term Due Date',
      impact: 2,
      description: `Due in ${daysUntilDue} days - higher urgency premium`,
    });
  } else if (daysUntilDue <= 30) {
    discount += 1;
    factors.push({
      name: 'Short-Term Due Date',
      impact: 1,
      description: `Due in ${daysUntilDue} days - moderate urgency`,
    });
  } else if (daysUntilDue <= 60) {
    discount += 0;
    factors.push({
      name: 'Medium-Term Due Date',
      impact: 0,
      description: `Due in ${daysUntilDue} days - standard timeline`,
    });
  } else {
    discount -= 0.5;
    factors.push({
      name: 'Long-Term Due Date',
      impact: -0.5,
      description: `Due in ${daysUntilDue} days - reduced urgency`,
    });
  }

  // Payer on-time ratio
  const totalInvoices = payerHistory.totalInvoices;
  if (totalInvoices > 0) {
    const onTimeRatio = (payerHistory.onTimePayments / totalInvoices) * 100;

    if (onTimeRatio > 90) {
      discount -= 0.5;
      factors.push({
        name: 'Excellent Payer History',
        impact: -0.5,
        description: `${onTimeRatio.toFixed(0)}% on-time payment rate - reliable payer`,
      });
    } else if (onTimeRatio >= 70) {
      discount += 0;
      factors.push({
        name: 'Average Payer History',
        impact: 0,
        description: `${onTimeRatio.toFixed(0)}% on-time payment rate - standard risk`,
      });
    } else {
      discount += 1.5;
      factors.push({
        name: 'Poor Payer History',
        impact: 1.5,
        description: `${onTimeRatio.toFixed(0)}% on-time payment rate - elevated risk`,
      });
    }
  } else {
    factors.push({
      name: 'No Payer History',
      impact: 0,
      description: 'No prior payment data available - using defaults',
    });
  }

  // Dispute ratio
  const disputes = payerHistory.disputes;
  if (disputes === 0) {
    discount -= 0.5;
    factors.push({
      name: 'No Disputes',
      impact: -0.5,
      description: 'Clean dispute record - lower risk',
    });
  } else if (disputes <= 2) {
    discount += 0.5;
    factors.push({
      name: 'Minor Dispute History',
      impact: 0.5,
      description: `${disputes} dispute(s) on record - slight risk increase`,
    });
  } else {
    discount += 2;
    factors.push({
      name: 'Significant Dispute History',
      impact: 2,
      description: `${disputes} disputes on record - substantial risk increase`,
    });
  }

  // Amount bracket
  if (amount < 1000) {
    discount -= 0.3;
    factors.push({
      name: 'Small Invoice Amount',
      impact: -0.3,
      description: `$${amount.toLocaleString()} - low exposure bracket`,
    });
  } else if (amount <= 10000) {
    discount += 0;
    factors.push({
      name: 'Standard Invoice Amount',
      impact: 0,
      description: `$${amount.toLocaleString()} - standard exposure bracket`,
    });
  } else {
    discount += 0.5;
    factors.push({
      name: 'Large Invoice Amount',
      impact: 0.5,
      description: `$${amount.toLocaleString()} - high exposure bracket`,
    });
  }

  // Clamp between 1% and 8%
  const suggestedDiscount = Math.max(1, Math.min(8, discount));

  // Determine risk level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  if (suggestedDiscount < 3) {
    riskLevel = 'LOW';
  } else if (suggestedDiscount <= 5) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'HIGH';
  }

  // Confidence based on available data
  const confidence =
    totalInvoices > 10 ? 0.9 : totalInvoices > 3 ? 0.7 : totalInvoices > 0 ? 0.5 : 0.3;

  // Build explanation
  const explanation =
    `Risk assessment: ${riskLevel}. Suggested discount of ${suggestedDiscount.toFixed(1)}% ` +
    `based on ${factors.length} factors. ` +
    `Payer has ${totalInvoices} historical invoices with ${disputes} dispute(s). ` +
    `Invoice of $${amount.toLocaleString()} is due in ${daysUntilDue} days.`;

  return {
    riskLevel,
    suggestedDiscount: parseFloat(suggestedDiscount.toFixed(2)),
    confidence,
    factors,
    explanation,
  };
}

// ---------------------------------------------------------------------------
// POST /risk-score — Calculate risk score (auth required)
// ---------------------------------------------------------------------------

router.post(
  '/risk-score',
  authMiddleware,
  validate(riskScoreSchema),
  async (req: AuthRequest, res: Response) => {
    const data = req.body as z.infer<typeof riskScoreSchema>;

    // If payerHistory is not provided, attempt to build it from the database
    let payerHistory = data.payerHistory ?? {
      totalInvoices: 0,
      onTimePayments: 0,
      latePayments: 0,
      disputes: 0,
    };

    if (!data.payerHistory) {
      // Attempt to build history from database
      const [invoiceCount, paidCount, disputeCount] = await Promise.all([
        prisma.invoice.count({
          where: { payerAddress: data.payerAddress },
        }),
        prisma.invoice.count({
          where: { payerAddress: data.payerAddress, status: 'paid' },
        }),
        prisma.dispute.count({
          where: {
            invoice: { payerAddress: data.payerAddress },
          },
        }),
      ]);

      payerHistory = {
        totalInvoices: invoiceCount,
        onTimePayments: paidCount,
        latePayments: Math.max(0, invoiceCount - paidCount),
        disputes: disputeCount,
      };
    }

    const result = calculateRiskScore({
      amount: data.amount,
      dueDate: new Date(data.dueDate),
      payerHistory,
    });

    res.json(result);
  },
);

// ---------------------------------------------------------------------------
// GET /insights — Aggregate AI insights (auth required)
// ---------------------------------------------------------------------------

router.get('/insights', authMiddleware, async (_req: AuthRequest, res: Response) => {
  // Gather aggregate data from the database
  const [
    totalInvoices,
    paidInvoices,
    disputedInvoices,
    listings,
    totalDisputes,
    resolvedDisputes,
  ] = await Promise.all([
    prisma.invoice.count(),
    prisma.invoice.count({ where: { status: 'paid' } }),
    prisma.invoice.count({ where: { status: 'disputed' } }),
    prisma.listing.findMany({
      select: { discountPercent: true, salePrice: true, originalAmount: true },
    }),
    prisma.dispute.count(),
    prisma.dispute.count({ where: { isResolved: true } }),
  ]);

  // Calculate average discount from listings
  const discountValues = listings
    .filter((l: { discountPercent: string | null }) => l.discountPercent !== null)
    .map((l: { discountPercent: string | null }) => parseFloat(l.discountPercent!));

  const avgDiscount =
    discountValues.length > 0
      ? discountValues.reduce((a: number, b: number) => a + b, 0) / discountValues.length
      : 0;

  // Risk distribution estimate
  const lowRiskCount = Math.round(totalInvoices * 0.6);
  const mediumRiskCount = Math.round(totalInvoices * 0.3);
  const highRiskCount = totalInvoices - lowRiskCount - mediumRiskCount;

  // Payer reliability
  const paymentRate =
    totalInvoices > 0 ? ((paidInvoices / totalInvoices) * 100).toFixed(1) : '0.0';
  const disputeRate =
    totalInvoices > 0
      ? ((disputedInvoices / totalInvoices) * 100).toFixed(1)
      : '0.0';
  const resolutionRate =
    totalDisputes > 0
      ? ((resolvedDisputes / totalDisputes) * 100).toFixed(1)
      : '0.0';

  res.json({
    riskDistribution: {
      low: lowRiskCount,
      medium: mediumRiskCount,
      high: highRiskCount,
    },
    averageDiscount: parseFloat(avgDiscount.toFixed(2)),
    payerReliability: {
      totalInvoicesTracked: totalInvoices,
      onTimePaymentRate: `${paymentRate}%`,
      disputeRate: `${disputeRate}%`,
      disputeResolutionRate: `${resolutionRate}%`,
    },
    marketplaceHealth: {
      totalListings: listings.length,
      avgListingDiscount: parseFloat(avgDiscount.toFixed(2)),
      totalVolumeTraded: listings
        .reduce((sum: number, l: { salePrice: unknown }) => sum + Number(l.salePrice), 0)
        .toString(),
    },
  });
});

export default router;
