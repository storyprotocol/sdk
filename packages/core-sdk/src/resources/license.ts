import { PublicClient, WalletClient, encodeFunctionData, getAddress } from "viem";

import { handleError } from "../utils/errors";
import { parseToBigInt, waitTxAndFilterLog } from "../utils/utils";
import { IPAccountABI, LicensingModuleConfig, LicenseRegistryConfig } from "../abi/config";
import {
  linkIpToParentRequest,
  linkIpToParentResponse,
  mintLicenseRequest,
  mintLicenseResponse,
} from "../types/resources/license";

export class LicenseClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;

  constructor(rpcClient: PublicClient, wallet: WalletClient) {
    this.wallet = wallet;
    this.rpcClient = rpcClient;
  }

  public async mintLicense(request: mintLicenseRequest): Promise<mintLicenseResponse> {
    try {
      const IPAccountConfig = {
        abi: IPAccountABI,
        address: getAddress(request.licensorIps[0]),
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
            functionName: "mintLicense",
            args: [
              { policyId: parseToBigInt(request.policyId), licensorIpIds: request.licensorIps },
              parseToBigInt(request.mintAmount),
              getAddress(request.receiverAddress),
            ],
          }),
        ],
        account: this.wallet.account,
      });
      const txHash = await this.wallet.writeContract(call);
      if (request.txOptions?.waitForTransaction) {
        const targetLog = await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...LicenseRegistryConfig,
          eventName: "LicenseMinted",
        });
        return { txHash: txHash, licenseId: targetLog.args.licenseId.toString() };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to mint license");
    }
  }

  public async linkIpToParent(request: linkIpToParentRequest): Promise<linkIpToParentResponse> {
    try {
      const IPAccountConfig = {
        abi: IPAccountABI,
        address: getAddress(request.childIpId),
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
            functionName: "linkIpToParents",
            args: [
              parseToBigInt(request.licenseId),
              getAddress(request.childIpId),
              getAddress(request.holderAddress),
            ],
          }),
        ],
        account: this.wallet.account,
      });
      const txHash = await this.wallet.writeContract(call);
      if (request.txOptions?.waitForTransaction) {
        await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...LicenseRegistryConfig,
          eventName: "LicenseMinted",
        });
        return { txHash: txHash };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to mint license");
    }
  }
}
