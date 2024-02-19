import { PublicClient, WalletClient, encodeFunctionData, getAddress } from "viem";

import { handleError } from "../utils/errors";
import { parseToBigInt, waitTxAndFilterLog } from "../utils/utils";
import { IPAccountABI, LicensingModuleConfig, LicenseRegistryConfig } from "../abi/config";
import {
  LinkIpToParentRequest,
  LinkIpToParentResponse,
  MintLicenseRequest,
  MintLicenseResponse,
} from "../types/resources/license";

export class LicenseClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;
  public ipAccountABI = IPAccountABI;
  public licenseRegistryConfig = LicenseRegistryConfig;
  public licensingModuleConfig = LicensingModuleConfig;

  constructor(rpcClient: PublicClient, wallet: WalletClient) {
    this.wallet = wallet;
    this.rpcClient = rpcClient;
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
      // 1. Call royalty policy API to get royalty policy for ipId
      // 1.1. If data: null, it's a root. Pass empty
      // 1.2. If not null, call royalty policy API for its parents and compose the 6 arrays
      // 1.2.1. encode the 6 arrays into royalty context
      const IPAccountConfig = {
        abi: this.ipAccountABI,
        address: getAddress(request.licensorIpId),
      };
      const { request: call } = await this.rpcClient.simulateContract({
        ...IPAccountConfig,
        functionName: "execute",
        args: [
          this.licensingModuleConfig.address,
          parseToBigInt(0),
          encodeFunctionData({
            abi: this.licensingModuleConfig.abi,
            functionName: "mintLicense",
            args: [
              parseToBigInt(request.policyId),
              request.licensorIpId,
              parseToBigInt(request.mintAmount),
              getAddress(request.receiverAddress),
              "0x",
            ],
          }),
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
            args: [licenseIds, getAddress(request.childIpId), "0x"],
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
      handleError(error, "Failed to mint license");
    }
  }
}
