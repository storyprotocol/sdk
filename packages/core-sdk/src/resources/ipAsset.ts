import { PublicClient, WalletClient, getAddress } from "viem";

import { handleError } from "../utils/errors";
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
   * Register a root IP on Story Protocol based on the specified input asset data.
   *
   * @param request - the request object that contains all data needed to register a root IP.
   * @returns the response object that contains results from the IP creation.
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
        ],
        account: this.wallet.account,
      });

      const txHash = await this.wallet.writeContract(call);
      if (request.txOptions?.waitForTransaction) {
        const targetLog = await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...IPAssetRegistryConfig,
          eventName: "IPRegistered",
        });
        return { txHash: txHash, ipAccountId: targetLog.args.ipId };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register root IP");
    }
  }

  /**
   * Register a derivative IP on Story Protocol based on the specified input asset data.
   *
   * @param request - the request object that contains all data needed to register a derivative IP.
   * @returns the response object that contains results from the IP creation.
   */
  public async registerDerivativeIp(
    request: RegisterDerivativeIpRequest,
  ): Promise<RegisterDerivativeIpResponse> {
    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...RegistrationModuleConfig,
        functionName: "registerDerivativeIp",
        args: [
          parseToBigInt(request.licenseId),
          getAddress(request.tokenContractAddress), // 0x Address
          parseToBigInt(request.tokenId),
          request.ipName,
          request.ipDescription,
          getAddress(request.hash), // Byte32
        ],
      });

      const txHash = await this.wallet.writeContract(call);
      if (request.txOptions?.waitForTransaction) {
        const targetLog = await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...IPAssetRegistryConfig,
          eventName: "IPRegistered",
        });
        return { txHash: txHash, ipAccountId: targetLog?.args.ipId };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register derivative IP");
    }
  }
}
