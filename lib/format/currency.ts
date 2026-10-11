/**
 * Currency Formatting Utility
 * Formats numbers into Indian Rupee style (e.g. ₹249, ₹1,199)
 */

export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
