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

  constructor(rpcClient: PublicClient, wallet: WalletClient) {
    this.wallet = wallet;
    this.rpcClient = rpcClient;
  }

  public async mintLicense(request: MintLicenseRequest): Promise<MintLicenseResponse> {
    try {
      const IPAccountConfig = {
        abi: IPAccountABI,
        address: getAddress(request.licensorIpId),
      };
      const { request: call } = await this.rpcClient.simulateContract({
        ...IPAccountConfig,
        functionName: "execute",
        args: [
          LicensingModuleConfig.address,
          parseToBigInt(0),
          encodeFunctionData({
            abi: LicensingModuleConfig.abi,
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
          ...LicenseRegistryConfig,
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
        abi: IPAccountABI,
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
          LicensingModuleConfig.address,
          parseToBigInt(0),
          encodeFunctionData({
            abi: LicensingModuleConfig.abi,
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
