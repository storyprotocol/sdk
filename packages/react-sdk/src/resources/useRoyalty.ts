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

import { useStoryContext } from "../StoryProtocolContext";
import { handleError } from "../util";
import { useLoading } from "../hooks/useLoading";
import { useErrors } from "../hooks/useError";

const useRoyalty = () => {
  const client = useStoryContext();
  const [loadings, setLoadings] = useLoading({
    collectRoyaltyTokens: false,
    payRoyaltyOnBehalf: false,
    claimableRevenue: false,
    claimRevenue: false,
    snapshot: false,
    getRoyaltyVaultAddress: false,
  });
  const [errors, setErrors] = useErrors({
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
      setLoadings("collectRoyaltyTokens", true);
      setErrors("collectRoyaltyTokens", null);
      const response = await client.royalty.collectRoyaltyTokens(request);
      setLoadings("collectRoyaltyTokens", false);
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors("collectRoyaltyTokens", errorMessage);
      setLoadings("collectRoyaltyTokens", false);
      throw new Error(errorMessage);
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
      setLoadings("payRoyaltyOnBehalf", true);
      setErrors("payRoyaltyOnBehalf", null);
      const response = await client.royalty.payRoyaltyOnBehalf(request);
      setLoadings("payRoyaltyOnBehalf", false);
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors("payRoyaltyOnBehalf", errorMessage);
      setLoadings("payRoyaltyOnBehalf", false);
      throw new Error(errorMessage);
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
      setLoadings("claimableRevenue", true);
      setErrors("claimableRevenue", null);
      const response = await client.royalty.claimableRevenue(request);
      setLoadings("claimableRevenue", false);
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors("claimableRevenue", errorMessage);
      setLoadings("claimableRevenue", false);
      throw new Error(errorMessage);
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
      setLoadings("claimRevenue", true);
      setErrors("claimRevenue", null);
      const response = await client.royalty.claimRevenue(request);
      setLoadings("claimRevenue", false);
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors("claimRevenue", errorMessage);
      setLoadings("claimRevenue", false);
      throw new Error(errorMessage);
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
      setLoadings("snapshot", true);
      setErrors("snapshot", null);
      const response = await client.royalty.snapshot(request);
      setLoadings("snapshot", false);
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors("snapshot", errorMessage);
      setLoadings("snapshot", false);
      throw new Error(errorMessage);
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
      setLoadings("getRoyaltyVaultAddress", true);
      setErrors("getRoyaltyVaultAddress", null);
      const response = await client.royalty.getRoyaltyVaultAddress(
        royaltyVaultIpId
      );
      setLoadings("getRoyaltyVaultAddress", false);
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors("getRoyaltyVaultAddress", errorMessage);
      setLoadings("getRoyaltyVaultAddress", false);
      throw new Error(errorMessage);
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
