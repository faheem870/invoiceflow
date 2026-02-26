import { prisma } from '../lib/prisma';

// ---- Types ----

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskScoreInput {
  payerAddress: string;
  amount: number | string;
  dueDate: string | Date;
  invoiceId?: number;
}

export interface RiskFactor {
  name: string;
  value: string;
  adjustment: number;
  description: string;
}

export interface RiskScoreResult {
  riskLevel: RiskLevel;
  suggestedDiscount: number;
  confidence: number;
  factors: RiskFactor[];
  explanation: string;
}

export interface InsightsSummary {
  totalAssessed: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  averageDiscount: number;
  averageConfidence: number;
  topRiskyPayers: { address: string; disputeCount: number; onTimeRatio: number }[];
}

// ---- Service class ----

export class AiService {
  /**
   * Rule-based AI risk scoring engine.
   *
   * Scoring algorithm:
   *  1. Start with a base discount of 2%.
   *  2. Apply adjustments for:
   *     - Days until due date
   *     - Payer on-time payment ratio
   *     - Payer dispute history
   *     - Invoice amount
   *  3. Clamp the result between 1% and 8%.
   *  4. Determine risk level from the clamped discount.
   *  5. Calculate confidence based on the number of historical data points.
   */
  async calculateRiskScore(input: RiskScoreInput): Promise<RiskScoreResult> {
    const { payerAddress, amount, dueDate } = input;
    const payerLower = payerAddress.toLowerCase();
    const invoiceAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;

    // ── Fetch payer history from DB ──────────────────────────────────
    const [payerInvoices, payerPayments, payerDisputes] = await Promise.all([
      prisma.invoice.findMany({
        where: { payerAddress: payerLower },
        select: { id: true, status: true, dueDate: true },
      }),
      prisma.payment.findMany({
        where: { payerAddress: payerLower },
        select: { invoiceId: true, paidAt: true },
      }),
      prisma.dispute.findMany({
        where: { disputedBy: payerLower },
        select: { id: true, isResolved: true },
      }),
    ]);

    // ── Compute payer metrics ────────────────────────────────────────
    const totalInvoices = payerInvoices.length;
    const totalPayments = payerPayments.length;
    const disputeCount = payerDisputes.length;

    // On-time ratio: count payments made on or before the invoice due date
    let onTimeCount = 0;
    if (totalPayments > 0) {
      for (const payment of payerPayments) {
        const relatedInvoice = payerInvoices.find((inv) => inv.id === payment.invoiceId);
        if (relatedInvoice && payment.paidAt <= relatedInvoice.dueDate) {
          onTimeCount++;
        }
      }
    }
    const onTimeRatio = totalPayments > 0 ? onTimeCount / totalPayments : 1; // default to 100% for new payers
    const disputeRatio = totalInvoices > 0 ? disputeCount / totalInvoices : 0;

    // ── Apply rule-based scoring ─────────────────────────────────────
    const factors: RiskFactor[] = [];
    let discount = 2; // Base discount

    factors.push({
      name: 'Base discount',
      value: '2%',
      adjustment: 2,
      description: 'Starting base discount rate',
    });

    // 1. Days to due date adjustment
    const now = new Date();
    const daysToDue = Math.ceil((dueDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let dueDateAdjustment: number;
    let dueDateDescription: string;

    if (daysToDue < 7) {
      dueDateAdjustment = 2;
      dueDateDescription = `Due in ${daysToDue} days (< 7) -- high urgency increases discount`;
    } else if (daysToDue <= 30) {
      dueDateAdjustment = 1;
      dueDateDescription = `Due in ${daysToDue} days (7-30) -- moderate urgency`;
    } else if (daysToDue <= 60) {
      dueDateAdjustment = 0;
      dueDateDescription = `Due in ${daysToDue} days (30-60) -- neutral timeframe`;
    } else {
      dueDateAdjustment = -0.5;
      dueDateDescription = `Due in ${daysToDue} days (> 60) -- long timeframe reduces discount`;
    }
    discount += dueDateAdjustment;
    factors.push({
      name: 'Due date proximity',
      value: `${daysToDue} days`,
      adjustment: dueDateAdjustment,
      description: dueDateDescription,
    });

    // 2. Payer on-time ratio adjustment
    let onTimeAdjustment: number;
    let onTimeDescription: string;
    const onTimePercent = Math.round(onTimeRatio * 100);

    if (onTimeRatio > 0.9) {
      onTimeAdjustment = -0.5;
      onTimeDescription = `Payer on-time ratio ${onTimePercent}% (> 90%) -- excellent track record reduces discount`;
    } else if (onTimeRatio >= 0.7) {
      onTimeAdjustment = 0;
      onTimeDescription = `Payer on-time ratio ${onTimePercent}% (70-90%) -- acceptable track record`;
    } else {
      onTimeAdjustment = 1.5;
      onTimeDescription = `Payer on-time ratio ${onTimePercent}% (< 70%) -- poor track record increases discount`;
    }
    discount += onTimeAdjustment;
    factors.push({
      name: 'Payer on-time ratio',
      value: `${onTimePercent}%`,
      adjustment: onTimeAdjustment,
      description: onTimeDescription,
    });

    // 3. Dispute count adjustment
    let disputeAdjustment: number;
    let disputeDescription: string;

    if (disputeCount === 0) {
      disputeAdjustment = -0.5;
      disputeDescription = 'No disputes -- clean history reduces discount';
    } else if (disputeCount <= 2) {
      disputeAdjustment = 0.5;
      disputeDescription = `${disputeCount} dispute(s) -- minor concern`;
    } else {
      disputeAdjustment = 2;
      disputeDescription = `${disputeCount} disputes -- significant concern increases discount`;
    }
    discount += disputeAdjustment;
    factors.push({
      name: 'Dispute history',
      value: `${disputeCount} disputes`,
      adjustment: disputeAdjustment,
      description: disputeDescription,
    });

    // 4. Amount adjustment
    let amountAdjustment: number;
    let amountDescription: string;

    if (invoiceAmount < 1000) {
      amountAdjustment = -0.3;
      amountDescription = `Amount ${invoiceAmount} (< 1,000) -- small invoice reduces discount`;
    } else if (invoiceAmount <= 10000) {
      amountAdjustment = 0;
      amountDescription = `Amount ${invoiceAmount} (1,000-10,000) -- standard size`;
    } else {
      amountAdjustment = 0.5;
      amountDescription = `Amount ${invoiceAmount} (> 10,000) -- large invoice increases discount`;
    }
    discount += amountAdjustment;
    factors.push({
      name: 'Invoice amount',
      value: `${invoiceAmount}`,
      adjustment: amountAdjustment,
      description: amountDescription,
    });

    // ── Clamp discount between 1% and 8% ────────────────────────────
    const clampedDiscount = Math.round(Math.min(8, Math.max(1, discount)) * 100) / 100;

    // ── Determine risk level ─────────────────────────────────────────
    let riskLevel: RiskLevel;
    if (clampedDiscount < 3) {
      riskLevel = 'LOW';
    } else if (clampedDiscount <= 5) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'HIGH';
    }

    // ── Calculate confidence ─────────────────────────────────────────
    // More historical data points = higher confidence (max 95%)
    const dataPoints = totalInvoices + totalPayments + disputeCount;
    let confidence: number;
    if (dataPoints === 0) {
      confidence = 30; // Low confidence -- no historical data
    } else if (dataPoints < 5) {
      confidence = 50;
    } else if (dataPoints < 15) {
      confidence = 70;
    } else if (dataPoints < 30) {
      confidence = 85;
    } else {
      confidence = 95;
    }

    // ── Build explanation ────────────────────────────────────────────
    const explanation = [
      `Risk assessment for payer ${payerAddress}:`,
      `Suggested discount: ${clampedDiscount}% (${riskLevel} risk).`,
      `Based on ${totalInvoices} historical invoice(s), ${totalPayments} payment(s), and ${disputeCount} dispute(s).`,
      `On-time payment ratio: ${onTimePercent}%.`,
      `Days until due: ${daysToDue}.`,
      `Confidence: ${confidence}% (${dataPoints} data points).`,
    ].join(' ');

    return {
      riskLevel,
      suggestedDiscount: clampedDiscount,
      confidence,
      factors,
      explanation,
    };
  }

  /**
   * Aggregate risk insights across all invoices in the system.
   * Returns a summary with risk distribution, average discount, and top risky payers.
   */
  async getInsights(): Promise<InsightsSummary> {
    // Get all invoices that have a payer and are not drafts/cancelled
    const invoices = await prisma.invoice.findMany({
      where: {
        status: {
          notIn: ['draft', 'cancelled'],
        },
      },
      select: {
        id: true,
        payerAddress: true,
        amount: true,
        dueDate: true,
      },
    });

    if (invoices.length === 0) {
      return {
        totalAssessed: 0,
        riskDistribution: { low: 0, medium: 0, high: 0 },
        averageDiscount: 0,
        averageConfidence: 0,
        topRiskyPayers: [],
      };
    }

    // Assess risk for each unique payer (use a representative invoice per payer)
    const payerMap = new Map<string, { payerAddress: string; amount: string; dueDate: Date }>();
    for (const inv of invoices) {
      if (!payerMap.has(inv.payerAddress)) {
        payerMap.set(inv.payerAddress, {
          payerAddress: inv.payerAddress,
          amount: inv.amount.toString(),
          dueDate: inv.dueDate,
        });
      }
    }

    let lowCount = 0;
    let mediumCount = 0;
    let highCount = 0;
    let totalDiscount = 0;
    let totalConfidence = 0;
    const payerRiskData: { address: string; discount: number; disputeCount: number; onTimeRatio: number }[] = [];

    for (const [address, representative] of payerMap) {
      const score = await this.calculateRiskScore({
        payerAddress: representative.payerAddress,
        amount: representative.amount,
        dueDate: representative.dueDate,
      });

      if (score.riskLevel === 'LOW') lowCount++;
      else if (score.riskLevel === 'MEDIUM') mediumCount++;
      else highCount++;

      totalDiscount += score.suggestedDiscount;
      totalConfidence += score.confidence;

      // Extract payer-specific data from factors
      const disputeFactor = score.factors.find((f) => f.name === 'Dispute history');
      const onTimeFactor = score.factors.find((f) => f.name === 'Payer on-time ratio');
      const disputes = disputeFactor ? parseInt(disputeFactor.value) || 0 : 0;
      const onTime = onTimeFactor ? parseInt(onTimeFactor.value) / 100 : 1;

      payerRiskData.push({
        address,
        discount: score.suggestedDiscount,
        disputeCount: disputes,
        onTimeRatio: onTime,
      });
    }

    const totalPayers = payerMap.size;

    // Top 5 riskiest payers (highest discount = most risky)
    const topRiskyPayers = payerRiskData
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 5)
      .map((p) => ({
        address: p.address,
        disputeCount: p.disputeCount,
        onTimeRatio: p.onTimeRatio,
      }));

    return {
      totalAssessed: totalPayers,
      riskDistribution: {
        low: lowCount,
        medium: mediumCount,
        high: highCount,
      },
      averageDiscount: parseFloat((totalDiscount / totalPayers).toFixed(2)),
      averageConfidence: parseFloat((totalConfidence / totalPayers).toFixed(1)),
      topRiskyPayers,
    };
  }
}
