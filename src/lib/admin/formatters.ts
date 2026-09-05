export function formatCurrency(amount: number): string {
  return `GH₵ ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}