import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string | null;
  invoiceId: number | null;
  isRead: boolean;
  createdAt: string;
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([]);
  const isLoading = ref(false);

  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.isRead).length
  );

  function setNotifications(list: Notification[]) {
    notifications.value = list;
  }

  function markAsRead(id: number) {
    const notif = notifications.value.find(n => n.id === id);
    if (notif) notif.isRead = true;
  }

  function markAllAsRead() {
    notifications.value.forEach(n => (n.isRead = true));
  }

  return {
    notifications,
    isLoading,
    unreadCount,
    setNotifications,
    markAsRead,
    markAllAsRead,
  };
});
