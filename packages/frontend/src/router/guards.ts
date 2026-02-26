import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export function requireWallet(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();
  if (!authStore.isConnected) {
    next({ name: 'connect-wallet', query: { redirect: to.fullPath } });
  } else {
    next();
  }
}
