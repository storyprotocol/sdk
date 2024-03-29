import { PublicClient, WalletClient, Hex, getAddress } from "viem";

import { handleError } from "../utils/errors";
import { HashZero } from "../constants/common";
import { IPAssetRegistryConfig, RegistrationModuleConfig } from "../abi/config";
import { StoryAPIClient } from "../clients/storyAPI";
import {
  RegisterDerivativeIpRequest,
  RegisterDerivativeIpResponse,
  RegisterRootIpRequest,
  RegisterRootIpResponse,
} from "../types/resources/ipAsset";
import { RoyaltyContext } from "../types/resources/royalty";
import { parseToBigInt, waitTxAndFilterLog } from "../utils/utils";
import { SepoliaChainId } from "../constants/common";
import { computeRoyaltyContext, encodeRoyaltyContext } from "../utils/royaltyContext";

export class IPAssetClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;
  private readonly storyClient: StoryAPIClient;
  public ipAssetRegistryConfig = IPAssetRegistryConfig;
  public registrationModuleConfig = RegistrationModuleConfig;

  constructor(rpcClient: PublicClient, wallet: WalletClient, storyClient: StoryAPIClient) {
    this.wallet = wallet;
    this.rpcClient = rpcClient;
    this.storyClient = storyClient;
  }

  /**
   *  Registers a root-level IP into the protocol. Root-level IPs can be thought of as organizational hubs
   *  for encapsulating policies that actual IPs can use to register through. As such, a root-level IP is not an
   *  actual IP, but a container for IP policy management for their child IP assets.
   * @param request The request object that contains all data needed to register a root IP.
   *   @param request.policyId The policy that identifies the licensing terms of the IP.
   *   @param request.tokenContract The address of the NFT bound to the root-level IP.
   *   @param request.tokenId The token id of the NFT bound to the root-level IP.
   *   @param request.ipName [Optional] The name assigned to the new IP.
   *   @param request.contentHash [Optional] The content hash of the IP being registered.
   *   @param request.uri [Optional] An external URI to link to the IP.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID if waitForTxn is set to true.
   * @emits RootIPRegistered (msg.sender, ipId, policyId)
   */
  public async registerRootIp(request: RegisterRootIpRequest): Promise<RegisterRootIpResponse> {
    try {
      const ipId = await this.isNFTRegistered(
        SepoliaChainId,
        request.tokenContractAddress,
        request.tokenId,
      );
      if (ipId !== "0x") {
        return { ipId: ipId };
      }
      const { request: call } = await this.rpcClient.simulateContract({
        ...this.registrationModuleConfig,
        functionName: "registerRootIp",
        args: [
          parseToBigInt(request.policyId || "0"),
          getAddress(request.tokenContractAddress), // 0x Address
          parseToBigInt(request.tokenId),
          request.ipName || "",
          request.contentHash || HashZero,
          request.uri || "",
        ],
        account: this.wallet.account,
      });

      const txHash = await this.wallet.writeContract(call);
      if (request.txOptions?.waitForTransaction) {
        const targetLogs = await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...this.ipAssetRegistryConfig,
          eventName: "IPRegistered",
        });
        return { txHash: txHash, ipId: targetLogs[0].args.ipId };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register root IP");
    }
  }

  /**
   *  Registers derivative IPs into the protocol. Derivative IPs are IP assets that inherit policies from
   *  parent IPs by burning acquired license NFTs.
   * @param request The request object that contains all data needed to register a root IP.
   *   @param request.licenseIds The policy that identifies the licensing terms of the IP.
   *   @param request.tokenContract The address of the NFT bound to the derivative IP.
   *   @param request.tokenId The token id of the NFT bound to the derivative IP.
   *   @param request.ipName [Optional] The name assigned to the new IP.
   *   @param request.contentHash [Optional] The content hash of the IP being registered.
   *   @param request.uri [Optional] An external URI to link to the IP.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID if waitForTxn is set to true.
   * @emits RootIPRegistered (msg.sender, ipId, policyId)
   */
  public async registerDerivativeIp(
    request: RegisterDerivativeIpRequest,
  ): Promise<RegisterDerivativeIpResponse> {
    try {
      const ipId = await this.isNFTRegistered(
        SepoliaChainId,
        request.tokenContractAddress,
        request.tokenId,
      );
      if (ipId !== "0x") {
        return { ipId: ipId };
      }
      const licenseIds: bigint[] = [];
      request.licenseIds.forEach(function (licenseId) {
        licenseIds.push(parseToBigInt(licenseId));
      });
      const royaltyContext: RoyaltyContext = await computeRoyaltyContext(
        request.licenseIds,
        this.storyClient,
      );

      const { request: call } = await this.rpcClient.simulateContract({
        ...this.registrationModuleConfig,
        functionName: "registerDerivativeIp",
        args: [
          licenseIds,
          getAddress(request.tokenContractAddress), // 0x Address
          parseToBigInt(request.tokenId),
          request.ipName || "",
          request.contentHash || HashZero,
          request.uri || "",
          encodeRoyaltyContext(royaltyContext),
        ],
        account: this.wallet.account,
      });

      const txHash = await this.wallet.writeContract(call);
      if (request.txOptions?.waitForTransaction) {
        const targetLogs = await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...this.ipAssetRegistryConfig,
          eventName: "IPRegistered",
        });
        return { txHash: txHash, ipId: targetLogs[0].args.ipId };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register derivative IP");
    }
  }

  /**
   *  Checks if an NFT is already registered in the protocol.
   * @param chainId The chain ID of the NFT.
   * @param tokenAddress The address of the NFT.
   * @param tokenId The token ID of the NFT.
   * @returns A Promise that resolves to the IP ID if the NFT is already registered, otherwise it resolves to 0x.
   */
  public async isNFTRegistered(chainId: string, tokenAddress: Hex, tokenId: string): Promise<Hex> {
    const ipId = await this.rpcClient.readContract({
      ...this.ipAssetRegistryConfig,
      functionName: "ipId",
      args: [parseToBigInt(chainId), tokenAddress, parseToBigInt(tokenId)],
    });
    const isRegistered = await this.rpcClient.readContract({
      ...this.ipAssetRegistryConfig,
      functionName: "isRegistered",
      args: [ipId],
    });

    return isRegistered ? ipId : "0x";
  }
}
