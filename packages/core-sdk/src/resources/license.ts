import { PublicClient, WalletClient, encodeFunctionData, getAddress } from "viem";

import { handleError } from "../utils/errors";
import { parseToBigInt, waitTxAndFilterLog, encodeRoyaltyContext } from "../utils/utils";
import { IPAccountABI, LicensingModuleConfig, LicenseRegistryConfig } from "../abi/config";
import { StoryAPIClient } from "../clients/storyAPI";
import {
  LinkIpToParentRequest,
  LinkIpToParentResponse,
  MintLicenseRequest,
  MintLicenseResponse,
} from "../types/resources/license";
import { RoyaltyContext } from "../types/resources/royalty";

export class LicenseClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;
  private readonly storyClient: StoryAPIClient;
  public ipAccountABI = IPAccountABI;
  public licenseRegistryConfig = LicenseRegistryConfig;
  public licensingModuleConfig = LicensingModuleConfig;

  constructor(rpcClient: PublicClient, wallet: WalletClient, storyClient: StoryAPIClient) {
    this.wallet = wallet;
    this.rpcClient = rpcClient;
    this.storyClient = storyClient;
  }

  /**
   * Mints license NFTs representing a policy granted by a set of ipIds (licensors). This NFT needs to be
   * burned in order to link a derivative IP with its parents. If this is the first combination of policy and
   * licensors, a new licenseId will be created. If not, the license is fungible and an id will be reused.
   * @dev Only callable by the licensing module.
   * @param request The request object containing necessary data to mint a license.
   *   @param request.policyId The ID of the policy to be minted
   *   @param request.licensorIpId_ The ID of the IP granting the license (ie. licensor)
   *   @param request.mintAmount Number of licenses to mint. License NFT is fungible for same policy and same licensors
   *   @param request.receiver Receiver address of the minted license NFT(s).
   * @return licenseId The ID of the minted license NFT(s).
   */
  public async mintLicense(request: MintLicenseRequest): Promise<MintLicenseResponse> {
    try {
      const royaltyContext: RoyaltyContext = {
        targetAncestors: [],
        targetRoyaltyAmount: [],
        parentAncestors1: [],
        parentAncestors2: [],
        parentAncestorsRoyalties1: [],
        parentAncestorsRoyalties2: [],
      };

      const royaltyPolicy = await this.storyClient.getRoyaltyPolicy(request.licensorIpId);
      if (royaltyPolicy) {
        royaltyContext.targetAncestors.push(...royaltyPolicy.targetAncestors);
        const targetRoyaltyAmount = royaltyPolicy.targetRoyaltyAmount.map((e) => parseInt(e));
        royaltyContext.targetRoyaltyAmount.push(...targetRoyaltyAmount);
      }

      const { request: call } = await this.rpcClient.simulateContract({
        ...this.licensingModuleConfig,
        functionName: "mintLicense",
        args: [
          parseToBigInt(request.policyId),
          request.licensorIpId,
          parseToBigInt(request.mintAmount),
          getAddress(request.receiverAddress),
          encodeRoyaltyContext(royaltyContext),
        ],
        account: this.wallet.account,
      });
      const txHash = await this.wallet.writeContract(call);

      if (request.txOptions?.waitForTransaction) {
        const targetLog = await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...this.licenseRegistryConfig,
          eventName: "TransferSingle",
        });
        return { txHash: txHash, licenseId: targetLog.args.id.toString() };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to mint license");
    }
  }

  public async linkIpToParent(request: LinkIpToParentRequest): Promise<LinkIpToParentResponse> {
    try {
      const royaltyContext: RoyaltyContext = {
        targetAncestors: [],
        targetRoyaltyAmount: [],
        parentAncestors1: [],
        parentAncestors2: [],
        parentAncestorsRoyalties1: [],
        parentAncestorsRoyalties2: [],
      };

      for (let i = 0; i < request.licenseIds.length; i++) {
        const licenseData = await this.storyClient.getLicense(request.licenseIds[i]);
        const royaltyPolicy = await this.storyClient.getRoyaltyPolicy(licenseData.licensorIpId);
        const policy = await this.storyClient.getPolicy(licenseData.policyId);

        if (royaltyPolicy) {
          const targetRoyaltyAmount = royaltyPolicy.targetRoyaltyAmount.map((e) => parseInt(e));
          if (i === 0) {
            royaltyContext.parentAncestors1 = royaltyPolicy.targetAncestors;
            royaltyContext.parentAncestorsRoyalties1 = targetRoyaltyAmount;
          } else {
            royaltyContext.parentAncestors2 = royaltyPolicy.targetAncestors;
            royaltyContext.parentAncestorsRoyalties2 = targetRoyaltyAmount;
          }
          this._updateRoyaltyContext(
            royaltyContext,
            [licenseData.licensorIpId],
            [parseInt(policy.pil.commercialRevShare)],
          );
          this._updateRoyaltyContext(
            royaltyContext,
            royaltyPolicy.targetAncestors,
            targetRoyaltyAmount,
          );
        }
      }

      const IPAccountConfig = {
        abi: this.ipAccountABI,
        address: getAddress(request.childIpId),
      };

      const licenseIds: bigint[] = [];
      request.licenseIds.forEach(function (licenseId) {
        licenseIds.push(parseToBigInt(licenseId));
      });

      const { request: call } = await this.rpcClient.simulateContract({
        ...IPAccountConfig,
        functionName: "execute",
        args: [
          this.licensingModuleConfig.address,
          parseToBigInt(0),
          encodeFunctionData({
            abi: this.licensingModuleConfig.abi,
            functionName: "linkIpToParents",
            args: [licenseIds, getAddress(request.childIpId), encodeRoyaltyContext(royaltyContext)],
          }),
        ],
        account: this.wallet.account,
      });
      const txHash = await this.wallet.writeContract(call);

      if (request.txOptions?.waitForTransaction) {
        await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...LicenseRegistryConfig,
          eventName: "TransferBatch",
        });
        return { txHash: txHash, success: true };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to link IP to parents");
    }
  }

  private _updateRoyaltyContext(
    royaltyContext: RoyaltyContext,
    targetAncestors: string[],
    targetRoyaltyAccounts: number[],
  ) {
    for (let i = 0; i < targetAncestors.length; i++) {
      const index = royaltyContext.targetAncestors.indexOf(targetAncestors[i]);
      if (index === -1) {
        royaltyContext.targetAncestors.push(targetAncestors[i]);
        royaltyContext.targetRoyaltyAmount.push(targetRoyaltyAccounts[i]);
      } else {
        royaltyContext.targetRoyaltyAmount[index] += targetRoyaltyAccounts[i];
      }
    }
  }
}
