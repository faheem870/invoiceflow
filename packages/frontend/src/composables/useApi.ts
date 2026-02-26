import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.jwt) {
    config.headers.Authorization = `Bearer ${authStore.jwt}`;
  }
  return config;
});

export function useApi() {
  // Invoices
  const getInvoices = (params?: Record<string, string>) =>
    api.get('/api/v1/invoices', { params });
  const getInvoice = (id: number) =>
    api.get(`/api/v1/invoices/${id}`);
  const createInvoice = (data: any) =>
    api.post('/api/v1/invoices', data);
  const getSellerInvoices = (address: string) =>
    api.get(`/api/v1/invoices/seller/${address}`);
  const getPayerInvoices = (address: string) =>
    api.get(`/api/v1/invoices/payer/${address}`);

  // Users
  const authenticate = (data: { address: string; signature: string; message: string }) =>
    api.post('/api/v1/users/auth', data);
  const getUser = (address: string) =>
    api.get(`/api/v1/users/${address}`);
  const updateUser = (address: string, data: any) =>
    api.patch(`/api/v1/users/${address}`, data);

  // Marketplace
  const getListings = (params?: Record<string, string>) =>
    api.get('/api/v1/marketplace', { params });
  const getListing = (id: number) =>
    api.get(`/api/v1/marketplace/${id}`);
  const getMarketplaceStats = () =>
    api.get('/api/v1/marketplace/stats');

  // Payments
  const getPayment = (invoiceId: number) =>
    api.get(`/api/v1/payments/invoice/${invoiceId}`);
  const getUserPayments = (address: string) =>
    api.get(`/api/v1/payments/user/${address}`);

  // AI
  const getRiskScore = (data: any) =>
    api.post('/api/v1/ai/risk-score', data);
  const getAiInsights = (address: string) =>
    api.get(`/api/v1/ai/insights/${address}`);

  // Research
  const getPoolStats = () =>
    api.get('/api/v1/research/pool');
  const getDonations = () =>
    api.get('/api/v1/research/donations');

  // Upload
  const uploadPdf = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/v1/upload/invoice-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  // Notifications
  const getNotifications = (address: string) =>
    api.get(`/api/v1/notifications/${address}`);
  const markNotificationRead = (id: number) =>
    api.patch(`/api/v1/notifications/${id}/read`);

  return {
    getInvoices, getInvoice, createInvoice, getSellerInvoices, getPayerInvoices,
    authenticate, getUser, updateUser,
    getListings, getListing, getMarketplaceStats,
    getPayment, getUserPayments,
    getRiskScore, getAiInsights,
    getPoolStats, getDonations,
    uploadPdf,
    getNotifications, markNotificationRead,
  };
}
