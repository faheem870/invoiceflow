import { useNotificationStore } from '@/stores/notifications';
import { useApi } from './useApi';
import { useAuthStore } from '@/stores/auth';

export function useNotifications() {
  const store = useNotificationStore();
  const api = useApi();
  const authStore = useAuthStore();

  async function fetchNotifications() {
    if (!authStore.address) return;
    store.isLoading = true;
    try {
      const { data } = await api.getNotifications(authStore.address);
      store.setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      store.isLoading = false;
    }
  }

  async function markRead(id: number) {
    try {
      await api.markNotificationRead(id);
      store.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }

  return { fetchNotifications, markRead };
}
