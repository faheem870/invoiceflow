export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskFactor {
  name: string;
  value: string;
  impact: string;
  description: string;
}

export interface RiskInput {
  invoiceAmount: number;
  daysUntilDue: number;
  payerOnTimeRatio: number;
  payerDisputeRatio: number;
  payerTotalInvoices: number;
  invoiceAge: number;
}

export interface RiskOutput {
  riskLevel: RiskLevel;
  suggestedDiscountPercent: number;
  confidenceScore: number;
  explanation: string;
  factors: RiskFactor[];
}
