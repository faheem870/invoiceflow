<script setup lang="ts">
import { ref, computed } from 'vue';

const searchQuery = ref('');
const sortBy = ref('newest');
const viewMode = ref<'grid' | 'list'>('grid');

const listings = ref([
  { id: 1, invoiceId: 4, title: 'API Integration', originalAmount: '2,500', salePrice: '2,375', discountPercent: '5.0', riskLevel: 'LOW', dueDate: '2026-04-01', seller: '0x4567...8901', tokenSymbol: 'mUSDT', daysUntilDue: 36 },
  { id: 2, invoiceId: 8, title: 'Mobile App Development', originalAmount: '12,000', salePrice: '11,280', discountPercent: '6.0', riskLevel: 'MEDIUM', dueDate: '2026-05-15', seller: '0xaaaa...bbbb', tokenSymbol: 'mUSDT', daysUntilDue: 80 },
  { id: 3, invoiceId: 9, title: 'Security Audit Q1', originalAmount: '7,500', salePrice: '7,275', discountPercent: '3.0', riskLevel: 'LOW', dueDate: '2026-03-10', seller: '0xcccc...dddd', tokenSymbol: 'mUSDT', daysUntilDue: 14 },
  { id: 4, invoiceId: 10, title: 'Data Pipeline Setup', originalAmount: '4,800', salePrice: '4,464', discountPercent: '7.0', riskLevel: 'HIGH', dueDate: '2026-06-01', seller: '0xeeee...ffff', tokenSymbol: 'mUSDT', daysUntilDue: 97 },
]);

const riskColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-red-100 text-red-700',
};

const filteredListings = computed(() => {
  let result = listings.value;
  if (searchQuery.value) {
    result = result.filter(l => l.title.toLowerCase().includes(searchQuery.value.toLowerCase()));
  }
  if (sortBy.value === 'discount') {
    result = [...result].sort((a, b) => parseFloat(b.discountPercent) - parseFloat(a.discountPercent));
  } else if (sortBy.value === 'dueDate') {
    result = [...result].sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }
  return result;
});

function calcROI(original: string, sale: string): string {
  const o = parseFloat(original.replace(/,/g, ''));
  const s = parseFloat(sale.replace(/,/g, ''));
  return ((o - s) / s * 100).toFixed(1);
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Invoice Marketplace</h1>
      <p class="text-muted-foreground mt-1">Browse and purchase discounted invoices for yield</p>
    </div>

    <div class="flex gap-4 mb-6">
      <input v-model="searchQuery" type="text" placeholder="Search listings..." class="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      <select v-model="sortBy" class="px-3 py-2 rounded-md border border-input bg-background text-sm">
        <option value="newest">Newest</option>
        <option value="discount">Highest Discount</option>
        <option value="dueDate">Soonest Due</option>
      </select>
      <div class="flex rounded-md border border-border overflow-hidden">
        <button @click="viewMode = 'grid'" :class="['px-3 py-2 text-sm', viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted']">Grid</button>
        <button @click="viewMode = 'list'" :class="['px-3 py-2 text-sm', viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted']">List</button>
      </div>
    </div>

    <div :class="viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'">
      <div v-for="listing in filteredListings" :key="listing.id" :class="['rounded-lg border border-border bg-card hover:shadow-md transition-shadow', viewMode === 'list' ? 'p-4 flex items-center justify-between' : 'p-6']">
        <div :class="viewMode === 'list' ? 'flex-1' : ''">
          <div class="flex items-center gap-2 mb-2">
            <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', riskColors[listing.riskLevel]]">{{ listing.riskLevel }}</span>
            <span class="text-xs text-muted-foreground">{{ listing.daysUntilDue }} days until due</span>
          </div>
          <h3 class="font-semibold">{{ listing.title }}</h3>
          <p class="text-xs text-muted-foreground mt-1">Seller: {{ listing.seller }}</p>

          <div class="flex items-center gap-4 mt-3 text-sm">
            <div>
              <p class="text-muted-foreground text-xs">Face Value</p>
              <p class="font-medium">${{ listing.originalAmount }}</p>
            </div>
            <div>
              <p class="text-muted-foreground text-xs">Sale Price</p>
              <p class="font-semibold text-primary">${{ listing.salePrice }}</p>
            </div>
            <div>
              <p class="text-muted-foreground text-xs">Discount</p>
              <p class="font-medium text-green-600">{{ listing.discountPercent }}%</p>
            </div>
            <div>
              <p class="text-muted-foreground text-xs">ROI</p>
              <p class="font-medium text-green-600">{{ calcROI(listing.originalAmount, listing.salePrice) }}%</p>
            </div>
          </div>
        </div>

        <div :class="viewMode === 'list' ? 'ml-4' : 'mt-4'">
          <RouterLink :to="`/marketplace/${listing.invoiceId}`" class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 w-full">
            View Details
          </RouterLink>
        </div>
      </div>
    </div>

    <div v-if="filteredListings.length === 0" class="text-center py-12 text-muted-foreground">
      No listings found
    </div>
  </div>
</template>
