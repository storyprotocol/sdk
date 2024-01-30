import { AxiosInstance } from "axios";
import { PublicClient, WalletClient, encodeFunctionData, getAddress } from "viem";

import { handleError } from "../utils/errors";
import { LicenseRegistryConfig, LicenseRegistryRaw } from "../abi/licenseRegistry.abi";
import {
  parseToBigInt,
  // waitTxAndFilterLog
} from "../utils/utils";
import { PolicyReadOnlyClient } from "./policyReadOnly";
import {
  addPolicyRequest,
  addPolicyResponse,
  addPolicyToIpRequest,
  addPolicyToIpResponse,
} from "../types/resources/policy";
import { IPAccountImplMerged } from "../abi/ipAccountImpl.abi";

export class PolicyClient extends PolicyReadOnlyClient {
  private readonly wallet: WalletClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient, wallet: WalletClient) {
    super(httpClient, rpcClient);
    this.wallet = wallet;
  }

  /**
   * Create a policy on Story Protocol based on the specified params.
   *
   * @param request - the request object that contains all data needed to register a policy.
   * @returns the response object that contains results from the policy creation.
   */
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
        ],
      });

      const txHash = await this.wallet.writeContract(call);

      // if (request.txOptions?.waitForTransaction) {
      //   const targetLog = await waitTxAndFilterLog(this.rpcClient, txHash, {
      //     ...LicenseRegistryConfig,
      //     // TODO: need PolicyCreated ABI
      //     eventName: "PolicyCreated",
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
  public async addPolicyToIp(request: addPolicyToIpRequest): Promise<addPolicyToIpResponse> {
    try {
      const IPAccountConfig = {
        abi: IPAccountImplMerged,
        address: getAddress(request.ipId),
      };
      const licenseRegistry = getAddress(
        process.env.LICENSE_REGISTRY || process.env.NEXT_PUBLIC_LICENSE_REGISTRY || "",
      );
      const { request: call } = await this.rpcClient.simulateContract({
        ...IPAccountConfig,
        functionName: "execute",
        args: [
          licenseRegistry,
          0,
          encodeFunctionData({
            abi: LicenseRegistryRaw,
            functionName: "addPolicyToIp",
            args: [
              getAddress(request.ipId), // 0x Address
              parseToBigInt(request.policyId),
            ],
          }),
        ],
        account: this.wallet.account,
      });

      const txHash = await this.wallet.writeContract(call);
      // TODO: the emit event doesn't return anything
      // if (request.txOptions?.waitForTransaction) {
      //   await waitTxAndFilterLog(this.rpcClient, txHash, {
      //     ...AccessControllerConfig,
      //     eventName: "PermissionSet",
      //   });
      //   return { txHash: txHash };
      // } else {

      return { txHash: txHash };
    } catch (error) {
      handleError(error, "Failed to add policy to IP");
    }
    // TODO: use getIpAccount to get the ipId
  }
}
