/**
 * Currency Utility for Indian Rupees (₹)
 * Operates on integer paise (1 Rupee = 100 Paise) to avoid floating-point issues.
 */

/**
 * Formats paise into Indian Rupee string: e.g. 79900 -> "₹799", 20833 -> "₹208.33"
 * @param paise integer amount in paise
 * @param showDecimals optional boolean to force 2 decimals or auto-hide when .00
 */
export function formatRupees(paise: number, showDecimals: boolean = false): string {
  if (isNaN(paise) || !isFinite(paise)) return '₹0';
  
  const rupees = paise / 100;
  
  // Format using Indian Numbering system (Lakhs and Crores)
  const hasDecimals = paise % 100 !== 0;
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals || hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });

  return formatter.format(rupees);
}

/**
 * Formats without the currency symbol (just formatted number)
 */
export function formatAmountNumber(paise: number, showDecimals: boolean = false): string {
  if (isNaN(paise) || !isFinite(paise)) return '0';
  const rupees = paise / 100;
  const hasDecimals = paise % 100 !== 0;
  
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: showDecimals || hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Converts a rupee input string (e.g., "799" or "799.50") into integer paise
 */
export function rupeeStringToPaise(input: string): number {
  if (!input) return 0;
  // Clean string of commas, spaces, currency symbols
  const cleaned = input.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}
