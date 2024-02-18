import { PublicClient, WalletClient, encodeFunctionData, getAddress, zeroAddress } from "viem";

import { handleError } from "../utils/errors";
import {
  IPAccountABI,
  LicensingModuleConfig,
  PILPolicyFrameworkManagerConfig,
} from "../abi/config";
import { parseToBigInt, waitTxAndFilterLog } from "../utils/utils";
import {
  RegisterPILPolicyRequest,
  RegisterPILPolicyResponse,
  AddPolicyToIpRequest,
  AddPolicyToIpResponse,
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
  public async registerPILPolicy(
    request: RegisterPILPolicyRequest,
  ): Promise<RegisterPILPolicyResponse> {
    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...PILPolicyFrameworkManagerConfig,
        functionName: "registerPolicy",
        args: [
          {
            transferable: request.transferable,
            royaltyPolicy: request.royaltyPolicy || zeroAddress,
            mintingFee: parseToBigInt(request.mintingFee || 0),
            mintingFeeToken: request.mintingFeeToken || zeroAddress,
            policy: {
              attribution: request.attribution || false,
              commercialUse: request.commercialUse || false,
              commercialAttribution: request.commercialAttribution || false,
              commercialRevShare: request.commercialRevShare || 0,
              derivativesAllowed: request.derivativesAllowed || false,
              derivativesAttribution: request.commercialAttribution || false,
              derivativesApproval: request.derivativesApproval || false,
              derivativesReciprocal: request.derivativesReciprocal || false,
              commercializerChecker: request.commercializerChecker || zeroAddress,
              commercializerCheckerData: (request.commercializerCheckerData ||
                "0x") as `0x${string}`,
              territories: request.territories || [],
              distributionChannels: request.distributionChannels || [],
              contentRestrictions: request.contentRestrictions || [],
            },
          },
        ],
        account: this.wallet.account,
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
      handleError(error, "Failed to register policy");
    }
  }

  public async addPolicyToIp(request: AddPolicyToIpRequest): Promise<AddPolicyToIpResponse> {
    try {
      const IPAccountConfig = {
        abi: IPAccountABI,
        address: getAddress(request.ipId),
      };

      const { request: call } = await this.rpcClient.simulateContract({
        ...IPAccountConfig,
        functionName: "execute",
        args: [
          LicensingModuleConfig.address,
          parseToBigInt(0),
          encodeFunctionData({
            abi: LicensingModuleConfig.abi,
            functionName: "addPolicyToIp",
            args: [getAddress(request.ipId), parseToBigInt(request.policyId)],
          }),
        ],
        account: this.wallet.account,
      });
      const txHash = await this.wallet.writeContract(call);
      // TODO: the emit event doesn't return anything
      if (request.txOptions?.waitForTransaction) {
        const targetLog = await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...LicensingModuleConfig,
          eventName: "PolicyAddedToIpId",
        });
        return { txHash: txHash, index: targetLog.args.index.toString() };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to add policy to IP");
    }
  }
}
