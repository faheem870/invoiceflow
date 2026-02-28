import { defineStore } from 'pinia';
import { ref } from 'vue';

const THEME_KEY = 'invoiceflow_theme';

function getInitialDarkMode(): boolean {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  // Fall back to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(true);
  const isDarkMode = ref(getInitialDarkMode());

  // Sync the class on store creation (covers HMR / late init)
  document.documentElement.classList.toggle('dark', isDarkMode.value);

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value;
    document.documentElement.classList.toggle('dark', isDarkMode.value);
    localStorage.setItem(THEME_KEY, isDarkMode.value ? 'dark' : 'light');
  }

  return {
    sidebarOpen,
    isDarkMode,
    toggleSidebar,
    toggleDarkMode,
  };
});
