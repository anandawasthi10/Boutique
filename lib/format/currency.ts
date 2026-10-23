/**
 * Currency Formatting Utility
 * Formats numbers into Indian Rupee style (e.g. ₹249, ₹1,199)
 */

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === 0) return '₹0';

  // Money from the database/backend is stored as integer paise (100 paise = 1 rupee).
  // Amounts in paise are multiples of 100 and >= 2000 (min price in catalogue is 5000 paise = ₹50).
  const isPaise = amount >= 2000 && Number.isInteger(amount) && amount % 100 === 0;
  const rupees = isPaise ? amount / 100 : amount;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}
