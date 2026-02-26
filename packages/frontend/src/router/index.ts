import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

let sessionLoaded = false;

const routes = [
  // Public
  {
    path: '/',
    name: 'landing',
    component: () => import('@/views/landing/LandingPage.vue'),
    meta: { layout: 'landing' },
  },
  {
    path: '/connect',
    name: 'connect-wallet',
    component: () => import('@/views/auth/ConnectWallet.vue'),
    meta: { layout: 'landing' },
  },

  // Seller Flow
  {
    path: '/seller',
    name: 'seller-dashboard',
    component: () => import('@/views/seller/SellerDashboard.vue'),
    meta: { requiresWallet: true },
  },
  {
    path: '/seller/invoices',
    name: 'my-invoices',
    component: () => import('@/views/seller/MyInvoicesList.vue'),
    meta: { requiresWallet: true },
  },
  {
    path: '/seller/invoices/create',
    name: 'create-invoice',
    component: () => import('@/views/seller/CreateInvoice.vue'),
    meta: { requiresWallet: true },
  },
  {
    path: '/seller/invoices/:id',
    name: 'invoice-detail',
    component: () => import('@/views/seller/InvoiceDetail.vue'),
    meta: { requiresWallet: true },
  },
  {
    path: '/seller/invoices/:id/list',
    name: 'list-for-sale',
    component: () => import('@/views/seller/ListInvoiceForSale.vue'),
    meta: { requiresWallet: true },
  },
  {
    path: '/seller/invoices/:id/share',
    name: 'payment-link',
    component: () => import('@/views/seller/PaymentLinkShare.vue'),
    meta: { requiresWallet: true },
  },
  {
    path: '/seller/earnings',
    name: 'earnings',
    component: () => import('@/views/seller/EarningsReceived.vue'),
    meta: { requiresWallet: true },
  },

  // Payer Flow
  {
    path: '/payer',
    name: 'payer-dashboard',
    component: () => import('@/views/payer/PayerDashboard.vue'),
    meta: { requiresWallet: true },
  },
  {
    path: '/payer/invoices/:id/review',
    name: 'review-approve',
    component: () => import('@/views/payer/InvoiceReviewApprove.vue'),
    meta: { requiresWallet: true },
  },
  {
    path: '/payer/invoices/:id/pay',
    name: 'pay-invoice',
    component: () => import('@/views/payer/PayInvoice.vue'),
    meta: { requiresWallet: true },
  },
  {
    path: '/payer/invoices/:id/receipt',
    name: 'payment-receipt',
    component: () => import('@/views/payer/PaymentReceipt.vue'),
    meta: { requiresWallet: true },
  },

  // Investor Flow
  {
    path: '/investor',
    name: 'investor-dashboard',
    component: () => import('@/views/investor/InvestorDashboard.vue'),
    meta: { requiresWallet: true },
  },
  {
    path: '/marketplace',
    name: 'marketplace',
    component: () => import('@/views/investor/MarketplaceBrowse.vue'),
    meta: { requiresWallet: true },
  },
  {
    path: '/marketplace/:id',
    name: 'marketplace-detail',
    component: () => import('@/views/investor/InvoiceDetailInvestor.vue'),
    meta: { requiresWallet: true },
  },
  {
    path: '/marketplace/:id/buy',
    name: 'buy-confirmation',
    component: () => import('@/views/investor/BuyConfirmation.vue'),
    meta: { requiresWallet: true },
  },
  {
    path: '/investor/portfolio',
    name: 'portfolio',
    component: () => import('@/views/investor/Portfolio.vue'),
    meta: { requiresWallet: true },
  },

  // AI Module
  {
    path: '/ai/report/:id',
    name: 'ai-risk-report',
    component: () => import('@/views/ai/AiRiskReport.vue'),
    meta: { requiresWallet: true },
  },
  {
    path: '/ai/insights',
    name: 'ai-insights',
    component: () => import('@/views/ai/AiInsightsOverview.vue'),
    meta: { requiresWallet: true },
  },

  // DeSci Module
  {
    path: '/research',
    name: 'research-pool',
    component: () => import('@/views/desci/ResearchPoolDashboard.vue'),
    meta: { requiresWallet: true },
  },
  {
    path: '/research/donate',
    name: 'donate-pool',
    component: () => import('@/views/desci/DonateToPool.vue'),
    meta: { requiresWallet: true },
  },
  {
    path: '/research/data',
    name: 'data-marketplace',
    component: () => import('@/views/desci/DataMarketplace.vue'),
    meta: { requiresWallet: true },
  },

  // Dispute
  {
    path: '/disputes/:id',
    name: 'dispute-detail',
    component: () => import('@/views/dispute/DisputeDetail.vue'),
    meta: { requiresWallet: true },
  },
  {
    path: '/admin/disputes',
    name: 'admin-disputes',
    component: () => import('@/views/dispute/AdminArbitratorPanel.vue'),
    meta: { requiresWallet: true },
  },

  // Shared
  {
    path: '/notifications',
    name: 'notifications',
    component: () => import('@/views/shared/NotificationsCenter.vue'),
    meta: { requiresWallet: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/shared/SettingsProfile.vue'),
    meta: { requiresWallet: true },
  },
  {
    path: '/explorer',
    name: 'tx-explorer',
    component: () => import('@/views/shared/TransactionExplorer.vue'),
    meta: { requiresWallet: true },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard — redirect to /connect if wallet not authenticated
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // Try to restore session from localStorage (once per app load)
  if (!sessionLoaded) {
    sessionLoaded = true;
    await authStore.loadSession();
  }

  if (to.meta.requiresWallet && !authStore.isAuthenticated) {
    next({ name: 'connect-wallet', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});
