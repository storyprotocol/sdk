import { PublicClient, WalletClient, getAddress } from "viem";

import { handleError } from "../utils/errors";
import { HashZero } from "../constants/common";
import { IPAssetRegistryConfig, RegistrationModuleConfig } from "../abi/config";
import {
  RegisterDerivativeIpRequest,
  RegisterDerivativeIpResponse,
  RegisterRootIpRequest,
  RegisterRootIpResponse,
} from "../types/resources/ipAsset";
import { parseToBigInt, waitTxAndFilterLog } from "../utils/utils";

export class IPAssetClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;

  constructor(rpcClient: PublicClient, wallet: WalletClient) {
    this.wallet = wallet;
    this.rpcClient = rpcClient;
  }

  /**
   *  Registers a root-level IP into the protocol. Root-level IPs can be thought of as organizational hubs
   *  for encapsulating policies that actual IPs can use to register through. As such, a root-level IP is not an
   *  actual IP, but a container for IP policy management for their child IP assets.
   * @param request The request object that contains all data needed to register a root IP.
   * 		@param request.policyId The policy that identifies the licensing terms of the IP.
   * 		@param request.tokenContract The address of the NFT bound to the root-level IP.
   * 		@param request.tokenId The token id of the NFT bound to the root-level IP.
   * 		@param request.ipName [Optional] The name assigned to the new IP.
   * 		@param request.contentHash [Optional] The content hash of the IP being registered.
   * 		@param request.uri [Optional] An external URI to link to the IP.
   *    @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID if waitForTxn is set to true.
   * @throws
   * @emits RootIPRegistered (msg.sender, ipId, policyId)
   */
  public async registerRootIp(request: RegisterRootIpRequest): Promise<RegisterRootIpResponse> {
    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...RegistrationModuleConfig,
        functionName: "registerRootIp",
        args: [
          parseToBigInt(request.policyId),
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
        const targetLog = await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...IPAssetRegistryConfig,
          eventName: "IPRegistered",
        });
        return { txHash: txHash, ipId: targetLog.args.ipId };
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
   * 		@param request.licenseIds The policy that identifies the licensing terms of the IP.
   * 		@param request.tokenContract The address of the NFT bound to the derivative IP.
   * 		@param request.tokenId The token id of the NFT bound to the derivative IP.
   * 		@param request.ipName [Optional] The name assigned to the new IP.
   * 		@param request.contentHash [Optional] The content hash of the IP being registered.
   * 		@param request.uri [Optional] An external URI to link to the IP.
   * 		@param request.minRoyalty [Optional] The minimum royalty percentage that the IP owner will receive.
   *    @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash and optional IP ID if waitForTxn is set to true.
   * @throws
   * @emits RootIPRegistered (msg.sender, ipId, policyId)
   */
  public async registerDerivativeIp(
    request: RegisterDerivativeIpRequest,
  ): Promise<RegisterDerivativeIpResponse> {
    try {
      const licenseIds: bigint[] = [];
      request.licenseIds.forEach(function (licenseId) {
        licenseIds.push(parseToBigInt(licenseId));
      });
      const { request: call } = await this.rpcClient.simulateContract({
        ...RegistrationModuleConfig,
        functionName: "registerDerivativeIp",
        args: [
          licenseIds,
          getAddress(request.tokenContractAddress), // 0x Address
          parseToBigInt(request.tokenId),
          request.ipName || "",
          request.contentHash || HashZero,
          request.uri || "",
          request.minRoyalty || 0,
        ],
        account: this.wallet.account,
      });

      const txHash = await this.wallet.writeContract(call);
      if (request.txOptions?.waitForTransaction) {
        const targetLog = await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...IPAssetRegistryConfig,
          eventName: "IPRegistered",
        });
        return { txHash: txHash, ipId: targetLog.args.ipId };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register derivative IP");
    }
  }
}
