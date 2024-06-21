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
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional the amount of royalty tokens collected if waitForTxn is set to true.
   * @emits RoyaltyTokensCollected (ancestorIpId, royaltyTokensCollected)
   */
  const collectRoyaltyTokens = async (
    request: CollectRoyaltyTokensRequest
  ): Promise<CollectRoyaltyTokensResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, collectRoyaltyTokens: true }));
      setErrors((prev) => ({ ...prev, collectRoyaltyTokens: null }));
      const response = await client.royalty.collectRoyaltyTokens(request);
      setLoadings((prev) => ({ ...prev, collectRoyaltyTokens: false }));
      return response;
    } catch (e) {
      if (e instanceof Error) {
        setErrors((prev) => ({ ...prev, collectRoyaltyTokens: e.message }));
        setLoadings((prev) => ({ ...prev, collectRoyaltyTokens: false }));
      }
      throw new Error(`unhandled error type`);
    }
  };

  /**
   * Allows the function caller to pay royalties to the receiver IP asset on behalf of the payer IP asset.
   * @param request - The request object that contains all data needed to pay royalty on behalf.
   *   @param request.receiverIpId The ipId that receives the royalties.
   *   @param request.payerIpId The ID of the IP asset that pays the royalties.
   *   @param request.token The token to use to pay the royalties.
   *   @param request.amount The amount to pay.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash.
   */
  const payRoyaltyOnBehalf = async (
    request: PayRoyaltyOnBehalfRequest
  ): Promise<PayRoyaltyOnBehalfResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, payRoyaltyOnBehalf: true }));
      setErrors((prev) => ({ ...prev, payRoyaltyOnBehalf: null }));
      const response = await client.royalty.payRoyaltyOnBehalf(request);
      setLoadings((prev) => ({ ...prev, payRoyaltyOnBehalf: false }));
      return response;
    } catch (e) {
      if (e instanceof Error) {
        setErrors((prev) => ({ ...prev, payRoyaltyOnBehalf: e.message }));
        setLoadings((prev) => ({ ...prev, payRoyaltyOnBehalf: false }));
      }
      throw new Error(`unhandled error type`);
    }
  };

  /**
   * Calculates the amount of revenue token claimable by a token holder at certain snapshot.
   * @param request - The request object that contains all data needed to claim Revenue.
   *   @param request.royaltyVaultIpId The id of the royalty vault.
   *   @param request.account The address of the token holder.
   *   @param request.snapshotId The snapshot id.
   *   @param request.token The revenue token to claim.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that contains the amount of revenue token claimable
   */
  const claimableRevenue = async (
    request: ClaimableRevenueRequest
  ): Promise<ClaimableRevenueResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, claimableRevenue: true }));
      setErrors((prev) => ({ ...prev, claimableRevenue: null }));
      const response = await client.royalty.claimableRevenue(request);
      setLoadings((prev) => ({ ...prev, claimableRevenue: false }));
      return response;
    } catch (e) {
      if (e instanceof Error) {
        setErrors((prev) => ({ ...prev, claimableRevenue: e.message }));
        setLoadings((prev) => ({ ...prev, claimableRevenue: false }));
      }
      throw new Error(`unhandled error type`);
    }
  };

  /**
   * Allows token holders to claim by a list of snapshot ids based on the token balance at certain snapshot
   * @param request - The request object that contains all data needed to claim revenue.
   *   @param request.snapshotIds The list of snapshot ids.
   *   @param request.royaltyVaultIpId The id of the royalty vault.
   *   @param request.token The revenue token to claim.
   *   @param request.account [Optional] The ipId to send.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional claimableToken if waitForTxn is set to true.
   * @emits RevenueTokenClaimed (claimer, token, amount).
   */
  const claimRevenue = async (
    request: ClaimRevenueRequest
  ): Promise<ClaimRevenueResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, claimRevenue: true }));
      setErrors((prev) => ({ ...prev, claimRevenue: null }));
      const response = await client.royalty.claimRevenue(request);
      setLoadings((prev) => ({ ...prev, claimRevenue: false }));
      return response;
    } catch (e) {
      if (e instanceof Error) {
        setErrors((prev) => ({ ...prev, claimRevenue: e.message }));
        setLoadings((prev) => ({ ...prev, claimRevenue: false }));
      }
      throw new Error(`unhandled error type`);
    }
  };

  /**
   * Snapshots the claimable revenue and royalty token amounts.
   * @param request - The request object that contains all data needed to snapshot.
   *   @param request.royaltyVaultIpId The id of the royalty vault.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional snapshotId if waitForTxn is set to true.
   * @emits SnapshotCompleted (snapshotId, snapshotTimestamp, unclaimedTokens).
   */
  const snapshot = async (
    request: SnapshotRequest
  ): Promise<SnapshotResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, snapshot: true }));
      setErrors((prev) => ({ ...prev, snapshot: null }));
      const response = await client.royalty.snapshot(request);
      setLoadings((prev) => ({ ...prev, snapshot: false }));
      return response;
    } catch (e) {
      if (e instanceof Error) {
        setErrors((prev) => ({ ...prev, snapshot: e.message }));
        setLoadings((prev) => ({ ...prev, snapshot: false }));
      }
      throw new Error(`unhandled error type`);
    }
  };

  /**
   * Get the royalty vault proxy address of given royaltyVaultIpId.
   * @param royaltyVaultIpId the id of the royalty vault.
   * @returns A Promise that resolves to an object containing the royalty vault address.
   */
  const getRoyaltyVaultAddress = async (
    royaltyVaultIpId: Hex
  ): Promise<Address> => {
    try {
      setLoadings((prev) => ({ ...prev, getRoyaltyVaultAddress: true }));
      setErrors((prev) => ({ ...prev, getRoyaltyVaultAddress: null }));
      const response = await client.royalty.getRoyaltyVaultAddress(
        royaltyVaultIpId
      );
      setLoadings((prev) => ({ ...prev, getRoyaltyVaultAddress: false }));
      return response;
    } catch (e) {
      if (e instanceof Error) {
        setErrors((prev) => ({ ...prev, getRoyaltyVaultAddress: e.message }));
        setLoadings((prev) => ({ ...prev, getRoyaltyVaultAddress: false }));
      }
      throw new Error(`unhandled error type`);
    }
  };

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
