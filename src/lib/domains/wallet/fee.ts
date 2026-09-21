export const DEFAULT_WITHDRAWAL_FEE_PERCENT = 0.5;

export function computeWithdrawalFee(
  amount: number,
  feeRatePercent: number
): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  const raw = amount * (feeRatePercent / 100);
  return Math.round(raw * 100) / 100;
}

export function computeWithdrawalTotal(
  amount: number,
  feeRatePercent: number
): { fee: number; total: number } {
  const fee = computeWithdrawalFee(amount, feeRatePercent);
  return { fee, total: Math.round((amount + fee) * 100) / 100 };
}