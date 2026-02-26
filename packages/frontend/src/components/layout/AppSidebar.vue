<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

defineProps<{
  collapsed: boolean;
}>();

const route = useRoute();

const navGroups = [
  {
    label: 'Seller',
    items: [
      { name: 'Dashboard', path: '/seller', icon: 'LayoutDashboard' },
      { name: 'Create Invoice', path: '/seller/invoices/create', icon: 'FilePlus' },
      { name: 'My Invoices', path: '/seller/invoices', icon: 'FileText' },
      { name: 'Earnings', path: '/seller/earnings', icon: 'Wallet' },
    ],
  },
  {
    label: 'Payer',
    items: [
      { name: 'Dashboard', path: '/payer', icon: 'CreditCard' },
    ],
  },
  {
    label: 'Investor',
    items: [
      { name: 'Dashboard', path: '/investor', icon: 'TrendingUp' },
      { name: 'Marketplace', path: '/marketplace', icon: 'Store' },
      { name: 'Portfolio', path: '/investor/portfolio', icon: 'Briefcase' },
    ],
  },
  {
    label: 'AI',
    items: [
      { name: 'Insights', path: '/ai/insights', icon: 'Brain' },
    ],
  },
  {
    label: 'DeSci',
    items: [
      { name: 'Research Pool', path: '/research', icon: 'Microscope' },
      { name: 'Data Market', path: '/research/data', icon: 'Database' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { name: 'Disputes', path: '/admin/disputes', icon: 'Shield' },
      { name: 'Explorer', path: '/explorer', icon: 'Search' },
    ],
  },
];

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/');
}
</script>

<template>
  <aside
    :class="[
      'border-r border-border bg-card h-screen sticky top-0 transition-all duration-300 flex flex-col',
      collapsed ? 'w-16' : 'w-64'
    ]"
  >
    <!-- Logo -->
    <div class="h-16 flex items-center px-4 border-b border-border">
      <div class="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
        <span class="text-primary-foreground font-bold text-sm">IF</span>
      </div>
      <span v-if="!collapsed" class="ml-2 font-bold text-lg">InvoiceFlow</span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 px-2">
      <div v-for="group in navGroups" :key="group.label" class="mb-4">
        <p v-if="!collapsed" class="px-3 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {{ group.label }}
        </p>
        <div v-else class="h-px bg-border mx-2 mb-2" />

        <RouterLink
          v-for="item in group.items"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
            isActive(item.path)
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          ]"
          :title="collapsed ? item.name : undefined"
        >
          <div class="w-5 h-5 flex-shrink-0 flex items-center justify-center">
            <div class="w-4 h-4 rounded bg-current opacity-40" />
          </div>
          <span v-if="!collapsed">{{ item.name }}</span>
        </RouterLink>
      </div>
    </nav>

    <!-- Settings -->
    <div class="border-t border-border p-2">
      <RouterLink
        to="/settings"
        :class="[
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
          isActive('/settings')
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        ]"
      >
        <div class="w-5 h-5 flex-shrink-0 flex items-center justify-center">
          <div class="w-4 h-4 rounded bg-current opacity-40" />
        </div>
        <span v-if="!collapsed">Settings</span>
      </RouterLink>
    </div>
  </aside>
</template>
