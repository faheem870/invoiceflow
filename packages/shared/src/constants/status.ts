export const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  awaiting_approval: 'Awaiting Approval',
  approved: 'Approved',
  listed: 'Listed for Sale',
  sold: 'Sold',
  disputed: 'Disputed',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: 'gray',
  awaiting_approval: 'yellow',
  approved: 'green',
  listed: 'blue',
  sold: 'purple',
  disputed: 'red',
  paid: 'emerald',
  cancelled: 'slate',
};
