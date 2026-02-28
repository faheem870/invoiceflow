import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export interface UserProfile {
  id: number;
  walletAddress: string;
  displayName: string | null;
  role: string;
  email?: string | null;
  avatarUrl?: string | null;
  desciOptIn: boolean;
  createdAt?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useAuthStore = defineStore('auth', () => {
  const address = ref<string | null>(null);
  const user = ref<UserProfile | null>(null);
  const jwt = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isConnected = computed(() => !!address.value);
  const isAuthenticated = computed(() => !!user.value);
  const userRole = computed(() => user.value?.role || 'seller');

  function setAddress(addr: string | null) {
    address.value = addr;
  }

  function setUser(profile: UserProfile | null) {
    user.value = profile;
  }

  function setJwt(token: string | null) {
    jwt.value = token;
    if (token) {
      localStorage.setItem('invoiceflow_jwt', token);
    } else {
      localStorage.removeItem('invoiceflow_jwt');
    }
  }

  /**
   * Authenticate with the backend using a signed message.
   * Returns the user profile on success, null on failure.
   */
  async function authenticate(
    walletAddress: string,
    signature: string,
    message: string,
  ): Promise<UserProfile | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const { data } = await axios.post(`${API_URL}/api/v1/users/auth`, {
        address: walletAddress,
        signature,
        message,
      });

      setJwt(data.token);
      setUser(data.user);
      setAddress(data.user.walletAddress);

      return data.user;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Authentication failed.';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update user role (and optionally other profile fields).
   */
  async function updateRole(role: string): Promise<boolean> {
    if (!jwt.value) return false;

    try {
      const { data } = await axios.put(`${API_URL}/api/v1/users/me`, { role }, {
        headers: { Authorization: `Bearer ${jwt.value}` },
      });

      setUser(data);
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update role.';
      return false;
    }
  }

  /**
   * Fetch the current user profile using stored JWT.
   */
  async function fetchProfile(): Promise<UserProfile | null> {
    if (!jwt.value) return null;

    try {
      const { data } = await axios.get(`${API_URL}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${jwt.value}` },
      });

      setUser(data);
      setAddress(data.walletAddress);
      return data;
    } catch {
      // JWT expired or invalid — clear only JWT, keep local session if set
      jwt.value = null;
      localStorage.removeItem('invoiceflow_jwt');
      return null;
    }
  }

  function disconnect() {
    address.value = null;
    user.value = null;
    jwt.value = null;
    error.value = null;
    localStorage.removeItem('invoiceflow_jwt');
  }

  /**
   * Load JWT from localStorage and try to restore the session.
   */
  async function loadSession(): Promise<boolean> {
    // If already authenticated locally (e.g. wallet-only session), skip
    if (user.value) return true;

    const stored = localStorage.getItem('invoiceflow_jwt');
    if (stored) {
      jwt.value = stored;
      const profile = await fetchProfile();
      return !!profile;
    }
    return false;
  }

  return {
    address,
    user,
    jwt,
    isLoading,
    error,
    isConnected,
    isAuthenticated,
    userRole,
    setAddress,
    setUser,
    setJwt,
    authenticate,
    updateRole,
    fetchProfile,
    disconnect,
    loadSession,
  };
});
