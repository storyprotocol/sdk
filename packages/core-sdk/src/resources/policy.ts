import { PublicClient, WalletClient, encodeFunctionData, getAddress } from "viem";

import { handleError } from "../utils/errors";
import { IPAccountABI, LicensingModuleConfig } from "../abi/config";
import { parseToBigInt, waitTxAndFilterLog } from "../utils/utils";
import {
  addPolicyRequest,
  addPolicyResponse,
  addPolicyToIpRequest,
  addPolicyToIpResponse,
} from "../types/resources/policy";

export class PolicyClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;

  constructor(rpcClient: PublicClient, wallet: WalletClient) {
    this.wallet = wallet;
    this.rpcClient = rpcClient;
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
        ...LicensingModuleConfig,
        functionName: "registerPolicy",
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

      if (request.txOptions?.waitForTransaction) {
        const targetLog = await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...LicensingModuleConfig,
          eventName: "PolicyRegistered",
        });
        return { txHash: txHash, policyId: targetLog?.args.policyId.toString() };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register derivative IP");
    }
  }

  // TODO: move to License resource
  public async addPolicyToIp(request: addPolicyToIpRequest): Promise<addPolicyToIpResponse> {
    try {
      const IPAccountConfig = {
        abi: IPAccountABI,
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
          parseToBigInt(0),
          encodeFunctionData({
            abi: LicensingModuleConfig.abi,
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
      if (request.txOptions?.waitForTransaction) {
        await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...LicensingModuleConfig,
          eventName: "PolicyAddedToIpId",
        });
        return { txHash: txHash };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to add policy to IP");
    }
  }
}
