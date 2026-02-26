import { ref } from 'vue';
import { useApi } from './useApi';

export interface RiskReport {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  suggestedDiscountPercent: number;
  confidenceScore: number;
  explanation: string;
  factors: Array<{
    name: string;
    value: string;
    impact: string;
    description: string;
  }>;
}

export function useAiRisk() {
  const report = ref<RiskReport | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchRiskScore(invoiceId: number) {
    isLoading.value = true;
    error.value = null;
    try {
      const api = useApi();
      const { data } = await api.getRiskScore({ invoiceId });
      report.value = data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch risk score';
    } finally {
      isLoading.value = false;
    }
  }

  return { report, isLoading, error, fetchRiskScore };
}
