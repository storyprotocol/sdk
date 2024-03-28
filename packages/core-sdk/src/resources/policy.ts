import { PublicClient, WalletClient, encodeFunctionData, getAddress, zeroAddress } from "viem";

import { handleError } from "../utils/errors";
import {
  IPAccountABI,
  getLicensingModuleConfig,
  getPILPolicyFrameworkManagerConfig,
  getRoyaltyPolicyLAPConfig,
} from "../abi/config";
import { parseToBigInt, waitTxAndFilterLog, typedDataToBytes } from "../utils/utils";
import {
  RegisterPILPolicyRequest,
  RegisterPILPolicyResponse,
  RegisterPILSocialRemixPolicyRequest,
  RegisterPILSocialRemixPolicyResponse,
  RegisterPILCommercialUsePolicyRequest,
  RegisterPILCommercialUsePolicyResponse,
  AddPolicyToIpRequest,
  AddPolicyToIpResponse,
  FrameworkData,
} from "../types/resources/policy";
import { SupportedChainIds } from "../types/config";

export class PolicyClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;
  public ipAccountABI = IPAccountABI;
  public licensingModuleConfig;
  public pilPolicyFrameworkManagerConfig;
  public royaltyPolicyLAPConfig;

  constructor(rpcClient: PublicClient, wallet: WalletClient, chainId: SupportedChainIds) {
    this.wallet = wallet;
    this.rpcClient = rpcClient;
    this.licensingModuleConfig = getLicensingModuleConfig(chainId);
    this.pilPolicyFrameworkManagerConfig = getPILPolicyFrameworkManagerConfig(chainId);
    this.royaltyPolicyLAPConfig = getRoyaltyPolicyLAPConfig(chainId);
  }

  /**
   * Registers a PIL policy to the registry
   * Internally, this function must generate a Licensing.Policy struct and call registerPolicy.
   * @param request - the licensing parameters for the Programmable IP License v1 (PIL) standard.
   *   @param request.transferable Whether or not the license is transferable
   *   @param request.attribution Whether or not attribution is required when reproducing the work
   *   @param request.commercialUse Whether or not the work can be used commercially
   *   @param request.commercialAttribution Whether or not attribution is required when reproducing the work commercially
   *   @param request.commercializerChecker commericializers that are allowed to commercially exploit the work. If zero address, then no restrictions is enforced.
   *   @param request.commercialRevShare Percentage of revenue that must be shared with the licensor
   *   @param request.derivativesAllowed Whether or not the licensee can create derivatives of his work
   *   @param request.derivativesAttribution Whether or not attribution is required for derivatives of the work
   *   @param request.derivativesApproval Whether or not the licensor must approve derivatives of the work before they can be linked to the licensor IP ID
   *   @param request.derivativesReciprocal Whether or not the licensee must license derivatives of the work under the same terms.
   *   @param request.territories List of territories where the license is valid. If empty, global.
   *   @param request.distributionChannels List of distribution channels where the license is valid. Empty if no restrictions.
   *   @param request.royaltyPolicy Address of a royalty policy contract (e.g. RoyaltyPolicyLS) that will handle royalty payments
   * @returns the transaction hash and the policy ID if the txOptions.waitForTransaction is set to true
   */
  public async registerPILPolicy(
    request: RegisterPILPolicyRequest,
  ): Promise<RegisterPILPolicyResponse> {
    try {
      // First check if the policy exists
      const frameworkData = {
        attribution: request.attribution || false,
        commercialUse: request.commercialUse || false,
        commercialAttribution: request.commercialAttribution || false,
        commercializerChecker: request.commercializerChecker || zeroAddress,
        commercializerCheckerData: (request.commercializerCheckerData || "0x") as `0x${string}`,
        commercialRevShare: request.commercialRevShare || 0,
        derivativesAllowed: request.derivativesAllowed || false,
        derivativesAttribution: request.derivativesAttribution || false,
        derivativesApproval: request.derivativesApproval || false,
        derivativesReciprocal: request.derivativesReciprocal || false,
        territories: request.territories || [],
        distributionChannels: request.distributionChannels || [],
        contentRestrictions: request.contentRestrictions || [],
      };
      const policyId = await this.getPolicyId(
        request.transferable,
        this.encodeFrameworkData(frameworkData),
        typedDataToBytes({
          interface: "uint32",
          data: [request.commercialRevShare || 0],
        }),
        request.mintingFee || "0",
        request.mintingFeeToken || zeroAddress,
        request.royaltyPolicy || zeroAddress,
      );
      if (policyId !== 0) {
        return { policyId: policyId.toString() };
      }

      const { request: call } = await this.rpcClient.simulateContract({
        ...this.pilPolicyFrameworkManagerConfig,
        functionName: "registerPolicy",
        args: [
          {
            transferable: request.transferable,
            royaltyPolicy: request.royaltyPolicy || zeroAddress,
            mintingFee: parseToBigInt(request.mintingFee || "0"),
            mintingFeeToken: request.mintingFeeToken || zeroAddress,
            policy: {
              attribution: request.attribution || false,
              commercialUse: request.commercialUse || false,
              commercialAttribution: request.commercialAttribution || false,
              commercialRevShare: request.commercialRevShare || 0,
              derivativesAllowed: request.derivativesAllowed || false,
              derivativesAttribution: request.derivativesAttribution || false,
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
        const targetLogs = await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...this.licensingModuleConfig,
          eventName: "PolicyRegistered",
        });
        return { txHash: txHash, policyId: targetLogs[0].args.policyId.toString() };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register policy");
    }
  }

  /**
   * Convenient function to register a PIL social remix policy to the registry
   * Internally, this function must generate a Licensing.Policy struct and call registerPolicy.
   * @param request - the licensing parameters for the Programmable IP License v1 (PIL) standard.
   *   @param request.territories List of territories where the license is valid. If empty, global.
   *   @param request.distributionChannels List of distribution channels where the license is valid. Empty if no restrictions.
   *   @param request.contentRestrictions List of content restrictions where the license is valid. Empty if no restrictions.
   * @returns the transaction hash and the policy ID if the txOptions.waitForTransaction is set to true
   */
  public async registerPILSocialRemixPolicy(
    request: RegisterPILSocialRemixPolicyRequest,
  ): Promise<RegisterPILSocialRemixPolicyResponse> {
    try {
      // First check if the policy exists
      const frameworkData = {
        attribution: true,
        commercialUse: false,
        commercialAttribution: false,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: "0x" as `0x${string}`,
        commercialRevShare: 0,
        derivativesAllowed: true,
        derivativesAttribution: true,
        derivativesApproval: false,
        derivativesReciprocal: true,
        territories: request.territories || [],
        distributionChannels: request.distributionChannels || [],
        contentRestrictions: request.contentRestrictions || [],
      };
      const policyId = await this.getPolicyId(
        true,
        this.encodeFrameworkData(frameworkData),
        typedDataToBytes({
          interface: "uint32",
          data: [0],
        }),
        "0",
        zeroAddress,
        zeroAddress,
      );
      if (policyId !== 0) {
        return { policyId: policyId.toString() };
      }

      const { request: call } = await this.rpcClient.simulateContract({
        ...this.pilPolicyFrameworkManagerConfig,
        functionName: "registerPolicy",
        args: [
          {
            transferable: true,
            royaltyPolicy: zeroAddress,
            mintingFee: parseToBigInt(0),
            mintingFeeToken: zeroAddress,
            policy: {
              attribution: true,
              commercialUse: false,
              commercialAttribution: false,
              commercialRevShare: 0,
              derivativesAllowed: true,
              derivativesAttribution: true,
              derivativesApproval: false,
              derivativesReciprocal: true,
              commercializerChecker: zeroAddress,
              commercializerCheckerData: "0x" as `0x${string}`,
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
          ...this.licensingModuleConfig,
          eventName: "PolicyRegistered",
        });
        return { txHash: txHash, policyId: targetLog[0].args.policyId.toString() };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register social remix policy");
    }
  }

  /**
   * Convenient function to register a PIL social remix policy to the registry
   * Internally, this function must generate a Licensing.Policy struct and call registerPolicy.
   * @param request - the licensing parameters for the Programmable IP License v1 (PIL) standard.
   *   @param request.commercialRevShare Percentage of revenue that must be shared with the licensor
   *   @param mintingFee Fee to be paid when minting a license
   *   @param mintingFeeToken Token to be used to pay the minting fee
   *   @param request.territories List of territories where the license is valid. If empty, global.
   *   @param request.distributionChannels List of distribution channels where the license is valid. Empty if no restrictions.
   *   @param request.contentRestrictions List of content restrictions where the license is valid. Empty if no restrictions.
   * @returns the transaction hash and the policy ID if the txOptions.waitForTransaction is set to true
   */
  public async registerPILCommercialUsePolicy(
    request: RegisterPILCommercialUsePolicyRequest,
  ): Promise<RegisterPILCommercialUsePolicyResponse> {
    try {
      // First check if the policy exists
      const frameworkData = {
        attribution: true,
        commercialUse: true,
        commercialAttribution: true,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: "0x" as `0x${string}`,
        commercialRevShare: request.commercialRevShare,
        derivativesAllowed: true,
        derivativesAttribution: true,
        derivativesApproval: false,
        derivativesReciprocal: true,
        territories: request.territories || [],
        distributionChannels: request.distributionChannels || [],
        contentRestrictions: request.contentRestrictions || [],
      };
      const policyId = await this.getPolicyId(
        true,
        this.encodeFrameworkData(frameworkData),
        typedDataToBytes({
          interface: "uint32",
          data: [request.commercialRevShare],
        }),
        request.mintingFee || "0",
        request.mintingFeeToken || zeroAddress,
        this.royaltyPolicyLAPConfig.address,
      );
      if (policyId !== 0) {
        return { policyId: policyId.toString() };
      }

      const { request: call } = await this.rpcClient.simulateContract({
        ...this.pilPolicyFrameworkManagerConfig,
        functionName: "registerPolicy",
        args: [
          {
            transferable: true,
            royaltyPolicy: this.royaltyPolicyLAPConfig.address,
            mintingFee: parseToBigInt(request.mintingFee || "0"),
            mintingFeeToken: request.mintingFeeToken || zeroAddress,
            policy: {
              attribution: true,
              commercialUse: true,
              commercialAttribution: true,
              commercialRevShare: request.commercialRevShare,
              derivativesAllowed: true,
              derivativesAttribution: true,
              derivativesApproval: false,
              derivativesReciprocal: true,
              commercializerChecker: zeroAddress,
              commercializerCheckerData: "0x" as `0x${string}`,
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
        const targetLogs = await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...this.licensingModuleConfig,
          eventName: "PolicyRegistered",
        });
        return { txHash: txHash, policyId: targetLogs[0].args.policyId.toString() };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to register commercial use policy");
    }
  }

  private async getPolicyId(
    transferable: boolean,
    frameworkData: `0x${string}`,
    royaltyData: `0x${string}`,
    mintingFee: string,
    mintingFeeToken: `0x${string}`,
    royaltyPolicy: `0x${string}`,
    policyFramework?: `0x${string}`,
  ): Promise<number> {
    const data = await this.rpcClient.readContract({
      ...this.licensingModuleConfig,
      functionName: "getPolicyId",
      args: [
        {
          isLicenseTransferable: transferable,
          policyFramework: policyFramework || this.pilPolicyFrameworkManagerConfig.address,
          frameworkData: frameworkData,
          royaltyPolicy: royaltyPolicy,
          royaltyData: royaltyData,
          mintingFee: parseToBigInt(mintingFee),
          mintingFeeToken: mintingFeeToken,
        },
      ],
    });
    return Number(data);
  }

  private encodeFrameworkData(data: FrameworkData): `0x${string}` {
    return typedDataToBytes({
      interface:
        "(bool, bool, bool, address, bytes, uint32, bool, bool, bool, bool, string[], string[], string[])",
      data: [
        [
          data.attribution,
          data.commercialUse,
          data.commercialAttribution,
          data.commercializerChecker,
          data.commercializerCheckerData,
          data.commercialRevShare,
          data.derivativesAllowed,
          data.derivativesAttribution,
          data.derivativesApproval,
          data.derivativesReciprocal,
          data.territories,
          data.distributionChannels,
          data.contentRestrictions,
        ],
      ],
    });
  }

  /**
   * Adds a policy to the set of policies of an IP
   * @param request The request object containing details to add a policy to an IP
   *   @param request.ipId The id of the IP
   *   @param request.polId The id of the policy
   * @return the transaction hash and the index of the policy in the IP's policy set if the txOptions.waitForTransaction is set to true
   */
  public async addPolicyToIp(request: AddPolicyToIpRequest): Promise<AddPolicyToIpResponse> {
    try {
      const IPAccountConfig = {
        abi: this.ipAccountABI,
        address: getAddress(request.ipId),
      };

      const { request: call } = await this.rpcClient.simulateContract({
        ...IPAccountConfig,
        functionName: "execute",
        args: [
          this.licensingModuleConfig.address,
          parseToBigInt(0),
          encodeFunctionData({
            abi: this.licensingModuleConfig.abi,
            functionName: "addPolicyToIp",
            args: [getAddress(request.ipId), parseToBigInt(request.policyId)],
          }),
        ],
        account: this.wallet.account,
      });
      const txHash = await this.wallet.writeContract(call);

      if (request.txOptions?.waitForTransaction) {
        const targetLogs = await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...this.licensingModuleConfig,
          eventName: "PolicyAddedToIpId",
        });
        return { txHash: txHash, index: targetLogs[0].args.index.toString() };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to add policy to IP");
    }
  }
}
