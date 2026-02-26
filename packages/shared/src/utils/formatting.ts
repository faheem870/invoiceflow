export function formatAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatCurrency(amount: string | number, decimals = 18, displayDecimals = 2): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const adjusted = num / Math.pow(10, decimals);
  return adjusted.toLocaleString('en-US', {
    minimumFractionDigits: displayDecimals,
    maximumFractionDigits: displayDecimals,
  });
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function daysUntil(dateString: string): number {
  const now = new Date();
  const target = new Date(dateString);
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function calculateDiscountPercent(originalAmount: string, salePrice: string): string {
  const original = parseFloat(originalAmount);
  const sale = parseFloat(salePrice);
  if (original === 0) return '0';
  const discount = ((original - sale) / original) * 100;
  return discount.toFixed(2);
}

export function calculateImpliedROI(originalAmount: string, salePrice: string): string {
  const original = parseFloat(originalAmount);
  const sale = parseFloat(salePrice);
  if (sale === 0) return '0';
  const roi = ((original - sale) / sale) * 100;
  return roi.toFixed(2);
}
