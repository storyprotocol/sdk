import { AxiosInstance } from "axios";
import { PublicClient, WalletClient, getAddress } from "viem";

// import { handleError } from "../utils/errors";
import { IPAssetReadOnlyClient } from "./ipAssetReadOnly";
import { handleError } from "../utils/errors";
import { IPAccountRegistryConfig } from "../abi/ipAccountRegistry.abi";
import {
  RegisterDerivativeIpRequest,
  RegisterDerivativeIpResponse,
  RegisterRootIpRequest,
  RegisterRootIpResponse,
  addPolicyRequest,
  addPolicyResponse,
  // addPolicyToIpRequest,
  // addPolicyToIpResponse,
} from "../types/resources/ipAsset";
import { parseToBigInt, waitTxAndFilterLog } from "../utils/utils";
import { RegistrationModuleConfig } from "../abi/registrationModule.abi";
import { LicenseRegistryConfig } from "../abi/licenseRegistry.abi";
// import { HashZero } from "../constants/common";

export class IPAssetClient extends IPAssetReadOnlyClient {
  private readonly wallet: WalletClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient, wallet: WalletClient) {
    super(httpClient, rpcClient);
    this.wallet = wallet;
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
          ...IPAccountRegistryConfig,
          eventName: "IPAccountRegistered",
        });
        return { txHash: txHash, ipAccountId: targetLog?.args.account.toString() };
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
          ...IPAccountRegistryConfig,
          eventName: "IPAccountRegistered",
        });
        return { txHash: txHash, ipAccountId: targetLog?.args.account.toString() };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register derivative IP");
    }
  }

  // TODO: move to License resource
  public async createPolicy(request: addPolicyRequest): Promise<addPolicyResponse> {
    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...LicenseRegistryConfig,
        functionName: "addPolicy",
        args: [
          {
            frameworkId: parseToBigInt(request.frameworkId),
            mintingParamValues: request.mintingParamValues.map((add) => getAddress(add)),
            activationParamValues: request.activationParamValues.map((add) => getAddress(add)),
            needsActivation: request.needsActivation,
            linkParentParamValues: request.linkParentParamValues.map((add) => getAddress(add)),
          },
        ], // TODO: add args
      });

      const txHash = await this.wallet.writeContract(call);
      // TODO: need an emitted event
      // if (request.txOptions?.waitForTransaction) {
      //   const targetLog = await waitTxAndFilterLog(this.rpcClient, txHash, {
      //     ...IPAccountRegistryConfig,
      //     eventName: "IPAccountRegistered",
      //   });
      //   return { txHash: txHash, policyId: targetLog?.args.account.toString() };
      // } else {
      return { txHash: txHash };
      // }
    } catch (error) {
      handleError(error, "Failed to register derivative IP");
    }
  }

  // TODO: move to License resource
  // public async addPolicyToIp(request: addPolicyToIpRequest): Promise<addPolicyToIpResponse> {
  //   // TODO: use getIpAccount to get the ipId
  // }
}
