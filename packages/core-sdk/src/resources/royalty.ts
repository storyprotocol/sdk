import { Address, Hex, PublicClient, zeroAddress } from "viem";

import { handleError } from "../utils/errors";
import {
  ClaimableRevenueRequest,
  ClaimableRevenueResponse,
  PayRoyaltyOnBehalfRequest,
  PayRoyaltyOnBehalfResponse,
} from "../types/resources/royalty";
import {
  IpAssetRegistryClient,
  IpRoyaltyVaultImplEventClient,
  IpRoyaltyVaultImplReadOnlyClient,
  RoyaltyModuleClient,
  SimpleWalletClient,
} from "../abi/generated";
import { IPAccountClient } from "./ipAccount";
import { getAddress } from "../utils/utils";

export class RoyaltyClient {
  public royaltyModuleClient: RoyaltyModuleClient;
  public ipAssetRegistryClient: IpAssetRegistryClient;
  public ipAccountClient: IPAccountClient;
  public ipRoyaltyVaultImplReadOnlyClient: IpRoyaltyVaultImplReadOnlyClient;
  public ipRoyaltyVaultImplEventClient: IpRoyaltyVaultImplEventClient;
  private readonly rpcClient: PublicClient;
  private readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient) {
    this.royaltyModuleClient = new RoyaltyModuleClient(rpcClient, wallet);
    this.ipAssetRegistryClient = new IpAssetRegistryClient(rpcClient, wallet);
    this.ipRoyaltyVaultImplReadOnlyClient = new IpRoyaltyVaultImplReadOnlyClient(rpcClient);
    this.ipRoyaltyVaultImplEventClient = new IpRoyaltyVaultImplEventClient(rpcClient);
    this.ipAccountClient = new IPAccountClient(rpcClient, wallet);
    this.rpcClient = rpcClient;
    this.wallet = wallet;
  }

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
  public async payRoyaltyOnBehalf(
    request: PayRoyaltyOnBehalfRequest,
  ): Promise<PayRoyaltyOnBehalfResponse> {
    try {
      const { receiverIpId, payerIpId, token, amount } = request;
      const isReceiverRegistered = await this.ipAssetRegistryClient.isRegistered({
        id: getAddress(receiverIpId, "request.receiverIpId"),
      });
      if (!isReceiverRegistered) {
        throw new Error(`The receiver IP with id ${receiverIpId} is not registered.`);
      }
      if (getAddress(payerIpId, "request.payerIpId") && payerIpId !== zeroAddress) {
        const isPayerRegistered = await this.ipAssetRegistryClient.isRegistered({
          id: payerIpId,
        });
        if (!isPayerRegistered) {
          throw new Error(`The payer IP with id ${request.payerIpId} is not registered.`);
        }
      }
      const req = {
        receiverIpId: receiverIpId,
        payerIpId: payerIpId,
        token: getAddress(token, "request.token"),
        amount: BigInt(amount),
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: this.royaltyModuleClient.payRoyaltyOnBehalfEncode(req) };
      } else {
        const txHash = await this.royaltyModuleClient.payRoyaltyOnBehalf(req);
        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          return { txHash };
        } else {
          return { txHash };
        }
      }
    } catch (error) {
      handleError(error, "Failed to pay royalty on behalf");
    }
  }

  /**
   * Get total amount of revenue token claimable by a royalty token holder.
   * @param request - The request object that contains all data needed to claim Revenue.
   *   @param request.royaltyVaultIpId The id of the royalty vault.
   *   @param request.claimer The address of the royalty token holder
   *   @param request.token The revenue token to claim.
   * @returns A Promise that contains the amount of revenue token claimable
   */
  public async claimableRevenue(
    request: ClaimableRevenueRequest,
  ): Promise<ClaimableRevenueResponse> {
    try {
      const proxyAddress = await this.getRoyaltyVaultAddress(
        getAddress(request.royaltyVaultIpId, "request.royaltyVaultIpId"),
      );
      const ipRoyaltyVault = new IpRoyaltyVaultImplReadOnlyClient(this.rpcClient, proxyAddress);
      return await ipRoyaltyVault.claimableRevenue({
        claimer: getAddress(request.claimer, "request.account"),
        token: getAddress(request.token, "request.token"),
      });
    } catch (error) {
      handleError(error, "Failed to calculate claimable revenue");
    }
  }

  /**
   * Get the royalty vault proxy address of given royaltyVaultIpId.
   * @param royaltyVaultIpId the id of the royalty vault.
   * @returns A Promise that resolves to an object containing the royalty vault address.
   */
  public async getRoyaltyVaultAddress(royaltyVaultIpId: Hex): Promise<Address> {
    const isRoyaltyVaultIpIdRegistered = await this.ipAssetRegistryClient.isRegistered({
      id: getAddress(royaltyVaultIpId, "royaltyVaultIpId"),
    });
    if (!isRoyaltyVaultIpIdRegistered) {
      throw new Error(`The royalty vault IP with id ${royaltyVaultIpId} is not registered.`);
    }
    return await this.royaltyModuleClient.ipRoyaltyVaults({ ipId: royaltyVaultIpId });
  }
}
