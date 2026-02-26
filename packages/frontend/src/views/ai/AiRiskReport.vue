<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const report = ref({
  invoiceId: route.params.id,
  riskLevel: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH',
  suggestedDiscountPercent: 4.5,
  confidenceScore: 82,
  explanation: 'This invoice has a low risk profile. The payer has a strong on-time payment history with 92% of invoices paid before the due date. The invoice amount is within the typical range for this payer. Suggested discount of 4.5% reflects the 36-day maturity and strong payer reliability.',
  factors: [
    { name: 'Days to Due Date', value: '36 days', impact: '-0.5%', description: 'Moderate maturity window reduces risk' },
    { name: 'Payer On-Time Ratio', value: '92%', impact: '-1.0%', description: 'Strong payment track record' },
    { name: 'Payer Dispute Ratio', value: '4%', impact: '-0.2%', description: 'Very few disputes in history' },
    { name: 'Payer History Depth', value: '15 invoices', impact: '-0.3%', description: 'Sufficient history for reliable scoring' },
    { name: 'Invoice Amount', value: '$2,500', impact: '+0.0%', description: 'Within normal range' },
    { name: 'Invoice Age', value: '4 days', impact: '+0.0%', description: 'Recently created' },
  ],
});

const riskColors = {
  LOW: { bg: 'bg-green-100', text: 'text-green-700', ring: 'ring-green-500', border: 'border-green-500' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-700', ring: 'ring-yellow-500', border: 'border-yellow-500' },
  HIGH: { bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-500', border: 'border-red-500' },
};

const colors = riskColors[report.value.riskLevel];
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">AI Risk Report</h1>
      <p class="text-muted-foreground mt-1">Invoice #{{ report.invoiceId }} - Risk analysis and discount suggestion</p>
    </div>

    <div class="grid md:grid-cols-3 gap-4 mb-6">
      <div class="rounded-lg border border-border bg-card p-6 text-center">
        <p class="text-sm text-muted-foreground mb-2">Risk Level</p>
        <span :class="['text-lg px-4 py-1.5 rounded-full font-bold', colors.bg, colors.text]">{{ report.riskLevel }}</span>
      </div>
      <div class="rounded-lg border border-border bg-card p-6 text-center">
        <p class="text-sm text-muted-foreground mb-2">Suggested Discount</p>
        <p class="text-3xl font-bold text-primary">{{ report.suggestedDiscountPercent }}%</p>
      </div>
      <div class="rounded-lg border border-border bg-card p-6 text-center">
        <p class="text-sm text-muted-foreground mb-2">Confidence</p>
        <div class="flex items-center justify-center gap-2">
          <div class="w-16 h-16 rounded-full flex items-center justify-center" :class="[`border-4`, colors.border]">
            <span class="text-lg font-bold">{{ report.confidenceScore }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-card p-6 mb-6">
      <h3 class="font-semibold mb-3">Analysis</h3>
      <p class="text-sm text-muted-foreground leading-relaxed">{{ report.explanation }}</p>
    </div>

    <div class="rounded-lg border border-border bg-card p-6 mb-6">
      <h3 class="font-semibold mb-4">Risk Factors</h3>
      <div class="space-y-3">
        <div v-for="factor in report.factors" :key="factor.name" class="flex items-center justify-between py-3 border-b border-border last:border-0">
          <div class="flex-1">
            <p class="text-sm font-medium">{{ factor.name }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">{{ factor.description }}</p>
          </div>
          <div class="text-right ml-4">
            <p class="text-sm font-semibold">{{ factor.value }}</p>
            <p :class="['text-xs font-medium', factor.impact.startsWith('-') ? 'text-green-600' : factor.impact.startsWith('+') && factor.impact !== '+0.0%' ? 'text-red-600' : 'text-muted-foreground']">{{ factor.impact }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <p class="text-sm text-yellow-800 font-medium">Disclaimer</p>
      <p class="text-xs text-yellow-700 mt-1">This is not financial advice. AI suggestions are for informational purposes only. Users are responsible for their own investment decisions.</p>
    </div>
  </div>
</template>
