// lib/merchant/wallet/wallet-mutations.ts
//
// Public merchant dispatchers over the shared merchant money mutations.
// Same exported names, same signatures, same actor shape.

import {
  fundMerchantWallet as sharedFundMerchantWallet,
  transferBetweenWallets as sharedTransferBetweenWallets,
  requestMerchantWithdrawal as sharedRequestMerchantWithdrawal,
  cancelMerchantWithdrawal as sharedCancelMerchantWithdrawal,
  requestDestinationChange as sharedRequestDestinationChange,
  cancelPendingDestinationChange as sharedCancelPendingDestinationChange,
  updateAutoPayCard as sharedUpdateAutoPayCard,
  setAutoPayEnabled as sharedSetAutoPayEnabled,
  setAutoPaySource as sharedSetAutoPaySource,
  addMerchantSavedMethod as sharedAddMerchantSavedMethod,
  removeMerchantSavedMethod as sharedRemoveMerchantSavedMethod,
} from "@/lib/domains/wallet/merchant-money/mutations";
import type {
  FundInput,
  TransferInput,
  WithdrawInput,
  DestinationChangeInput,
  UpdateCardInput,
  AddSavedMethodInput,
} from "@/lib/domains/wallet/merchant-money/mutations";
import type {
  MerchantMoneyActor,
  MerchantMoneyMutationResult,
  MerchantWalletType,
} from "@/lib/domains/wallet/merchant-money/types";

export type MerchantActor = MerchantMoneyActor;
export type MerchantMutationResult = MerchantMoneyMutationResult;

export type {
  FundInput,
  TransferInput,
  WithdrawInput,
  DestinationChangeInput,
  UpdateCardInput,
  AddSavedMethodInput,
};

export function fundMerchantWallet(
  walletType: MerchantWalletType,
  input: FundInput,
  actor: MerchantActor
): MerchantMutationResult {
  return sharedFundMerchantWallet(walletType, input, actor);
}

export function transferBetweenWallets(
  input: TransferInput,
  actor: MerchantActor
): MerchantMutationResult {
  return sharedTransferBetweenWallets(input, actor);
}

export function requestMerchantWithdrawal(
  input: WithdrawInput,
  actor: MerchantActor
): MerchantMutationResult {
  return sharedRequestMerchantWithdrawal(input, actor);
}

export function cancelMerchantWithdrawal(
  requestId: string,
  actor: MerchantActor
): MerchantMutationResult {
  return sharedCancelMerchantWithdrawal(requestId, actor);
}

export function requestDestinationChange(
  input: DestinationChangeInput,
  actor: MerchantActor
): MerchantMutationResult {
  return sharedRequestDestinationChange(input, actor);
}

export function cancelPendingDestinationChange(
  actor: MerchantActor
): MerchantMutationResult {
  return sharedCancelPendingDestinationChange(actor);
}

export function updateAutoPayCard(
  input: UpdateCardInput,
  actor: MerchantActor
): MerchantMutationResult {
  return sharedUpdateAutoPayCard(input, actor);
}

export function setAutoPayEnabled(
  enabled: boolean,
  actor: MerchantActor
): MerchantMutationResult {
  return sharedSetAutoPayEnabled(enabled, actor);
}

export function setAutoPaySource(
  source: "card" | "billing_wallet",
  actor: MerchantActor
): MerchantMutationResult {
  return sharedSetAutoPaySource(source, actor);
}

export function addMerchantSavedMethod(
  input: AddSavedMethodInput,
  actor: MerchantActor
): MerchantMutationResult {
  return sharedAddMerchantSavedMethod(input, actor);
}

export function removeMerchantSavedMethod(
  methodId: string,
  actor: MerchantActor
): MerchantMutationResult {
  return sharedRemoveMerchantSavedMethod(methodId, actor);
}