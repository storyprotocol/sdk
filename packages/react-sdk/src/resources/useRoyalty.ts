import {
  CollectRoyaltyTokensRequest,
  CollectRoyaltyTokensResponse,
  PayRoyaltyOnBehalfRequest,
  PayRoyaltyOnBehalfResponse,
  ClaimableRevenueRequest,
  ClaimableRevenueResponse,
  ClaimRevenueRequest,
  ClaimRevenueResponse,
  SnapshotRequest,
  SnapshotResponse,
} from "@story-protocol/core-sdk";
import { Hex, Address } from "viem";
import { useState } from "react";

import { useStoryContext } from "../StoryProtocolContext";
import { withLoadingErrorHandling } from "../withLoadingErrorHandling";

const useRoyalty = () => {
  const client = useStoryContext();
  const [loadings, setLoadings] = useState<Record<string, boolean>>({
    collectRoyaltyTokens: false,
    payRoyaltyOnBehalf: false,
    claimableRevenue: false,
    claimRevenue: false,
    snapshot: false,
    getRoyaltyVaultAddress: false,
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({
    collectRoyaltyTokens: null,
    payRoyaltyOnBehalf: null,
    claimableRevenue: null,
    claimRevenue: null,
    snapshot: null,
    getRoyaltyVaultAddress: null,
  });

  /**
   * Allows ancestors to claim the royalty tokens and any accrued revenue tokens
   * @param request - The request object that contains all data needed to collect royalty tokens.
   *   @param request.parentIpId The ip id of the ancestor to whom the royalty tokens belong to.
   *   @param request.royaltyVaultIpId The id of the royalty vault.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash and optional the amount of royalty tokens collected if waitForTxn is set to true.
   * @emits RoyaltyTokensCollected (ancestorIpId, royaltyTokensCollected)
   */
  const collectRoyaltyTokens = withLoadingErrorHandling<
    CollectRoyaltyTokensRequest,
    CollectRoyaltyTokensResponse
  >(
    "collectRoyaltyTokens",
    client.royalty.collectRoyaltyTokens.bind(client.royalty),
    setLoadings,
    setErrors
  );

  /**
   * Allows the function caller to pay royalties to the receiver IP asset on behalf of the payer IP asset.
   * @param request - The request object that contains all data needed to pay royalty on behalf.
   *   @param request.receiverIpId The ipId that receives the royalties.
   *   @param request.payerIpId The ID of the IP asset that pays the royalties.
   *   @param request.token The token to use to pay the royalties.
   *   @param request.amount The amount to pay.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  const payRoyaltyOnBehalf = withLoadingErrorHandling<
    PayRoyaltyOnBehalfRequest,
    PayRoyaltyOnBehalfResponse
  >(
    "payRoyaltyOnBehalf",
    client.royalty.payRoyaltyOnBehalf.bind(client.royalty),
    setLoadings,
    setErrors
  );

  /**
   * Calculates the amount of revenue token claimable by a token holder at certain snapshot.
   * @param request - The request object that contains all data needed to claim Revenue.
   *   @param request.royaltyVaultIpId The id of the royalty vault.
   *   @param request.account The address of the token holder.
   *   @param request.snapshotId The snapshot id.
   *   @param request.token The revenue token to claim.
   * @returns A Promise that contains the amount of revenue token claimable
   */
  const claimableRevenue = withLoadingErrorHandling<
    ClaimableRevenueRequest,
    ClaimableRevenueResponse
  >(
    "claimableRevenue",
    client.royalty.claimableRevenue.bind(client.royalty),
    setLoadings,
    setErrors
  );

  /**
   * Allows token holders to claim by a list of snapshot ids based on the token balance at certain snapshot
   * @param request - The request object that contains all data needed to claim revenue.
   *   @param request.snapshotIds The list of snapshot ids.
   *   @param request.royaltyVaultIpId The id of the royalty vault.
   *   @param request.token The revenue token to claim.
   *   @param request.account [Optional] The ipId to send.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash and optional claimableToken if waitForTxn is set to true.
   * @emits RevenueTokenClaimed (claimer, token, amount).
   */
  const claimRevenue = withLoadingErrorHandling<
    ClaimRevenueRequest,
    ClaimRevenueResponse
  >(
    "claimRevenue",
    client.royalty.claimRevenue.bind(client.royalty),
    setLoadings,
    setErrors
  );

  /**
   * Snapshots the claimable revenue and royalty token amounts.
   * @param request - The request object that contains all data needed to snapshot.
   *   @param request.royaltyVaultIpId The id of the royalty vault.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to an object containing the transaction hash and optional snapshotId if waitForTxn is set to true.
   * @emits SnapshotCompleted (snapshotId, snapshotTimestamp, unclaimedTokens).
   */
  const snapshot = withLoadingErrorHandling<SnapshotRequest, SnapshotResponse>(
    "snapshot",
    client.royalty.snapshot.bind(client.royalty),
    setLoadings,
    setErrors
  );

  /**
   * Get the royalty vault proxy address of given royaltyVaultIpId.
   * @param royaltyVaultIpId the id of the royalty vault.
   * @returns A Promise that resolves to an object containing the royalty vault address.
   */
  const getRoyaltyVaultAddress = withLoadingErrorHandling<Hex, Address>(
    "getRoyaltyVaultAddress",
    client.royalty.getRoyaltyVaultAddress.bind(client.royalty),
    setLoadings,
    setErrors
  );

  return {
    loadings,
    errors,
    collectRoyaltyTokens,
    payRoyaltyOnBehalf,
    claimableRevenue,
    claimRevenue,
    snapshot,
    getRoyaltyVaultAddress,
  };
};
export default useRoyalty;
