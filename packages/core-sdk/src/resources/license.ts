import { AxiosInstance } from "axios";
import { PublicClient, WalletClient, encodeFunctionData, getAddress } from "viem";

import { handleError } from "../utils/errors";
import { parseToBigInt, waitTxAndFilterLog } from "../utils/utils";
import { LicenseReadOnlyClient } from "./licenseReadOnly";
import { IPAccountImplMerged } from "../abi/ipAccountImpl.abi";
import { LicenseRegistryConfig, LicenseRegistryRaw } from "../abi/licenseRegistry.abi";
import {
  linkIpToParentRequest,
  linkIpToParentResponse,
  // mintLicenseRequest,
  // mintLicenseResponse,
  // transferRequest,
  // transferResponse,
} from "../types/resources/license";

export class LicenseClient extends LicenseReadOnlyClient {
  private readonly wallet: WalletClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient, wallet: WalletClient) {
    super(httpClient, rpcClient);
    this.wallet = wallet;
  }

  // public async mintLicense(request: mintLicenseRequest): Promise<mintLicenseResponse> {
  //   try {
  //     const IPAccountConfig = {
  //       abi: IPAccountImplMerged,
  //       address: getAddress(request.licensorIp),
  //     };

  //     const licenseRegistry = getAddress(
  //       process.env.LICENSE_REGISTRY || process.env.NEXT_PUBLIC_LICENSE_REGISTRY || "",
  //     );

  //     const { request: call } = await this.rpcClient.simulateContract({
  //       ...IPAccountConfig,
  //       functionName: "execute",
  //       args: [
  //         licenseRegistry,
  //         0,
  //         encodeFunctionData({
  //           abi: LicenseRegistryRaw,
  //           functionName: "mintLicense",
  //           args: [
  //             request.policyId,
  //             request.licensorIp,
  //             request.mintAmount,
  //             request.receiverAddress,
  //             // TODO:
  //           ],
  //         }),
  //       ],
  //       account: this.wallet.account,
  //     });
  //     const txHash = await this.wallet.writeContract(call);
  //     // if (request.txOptions?.waitForTransaction) {
  //     //   const targetLog = await waitTxAndFilterLog(this.rpcClient, txHash, {
  //     //     ...LicenseRegistryConfig,
  //     //     eventName: "LicenseMinted",
  //     //   });
  //     //   return { txHash: txHash, licenseId: targetLog?.args.account.toString() };
  //     // } else {
  //     return { txHash: txHash };
  //     // }
  //   } catch (error) {
  //     handleError(error, "Failed to mint license");
  //   }
  // }

  public async linkIpToParent(request: linkIpToParentRequest): Promise<linkIpToParentResponse> {
    try {
      const IPAccountConfig = {
        abi: IPAccountImplMerged,
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
          0,
          encodeFunctionData({
            abi: LicenseRegistryRaw,
            functionName: "linkIpToParent",
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
      // if (request.txOptions?.waitForTransaction) {
      //   const targetLog = await waitTxAndFilterLog(this.rpcClient, txHash, {
      //     ...LicenseRegistryConfig,
      //     eventName: "LicenseMinted",
      //   });
      //   return { txHash: txHash, licenseId: targetLog?.args.account.toString() };
      // } else {
      return { txHash: txHash };
      // }
    } catch (error) {
      handleError(error, "Failed to mint license");
    }
  }

  // public async transfer(request: transferRequest): Promise<transferResponse> {
  //   try {
  //     const { request: call } = await this.rpcClient.simulateContract({
  //       ...LicenseRegistryConfig,
  //       functionName: "transfer",
  //       args: [
  //         // TODO: format args
  //         request.operator,
  //         request.fromAddress,
  //         request.toAddress,
  //         request.id,
  //         request.value,
  //       ],
  //       account: this.wallet.account,
  //     });

  //     const txHash = await this.wallet.writeContract(call);
  //     // if (request.txOptions?.waitForTransaction) {
  //     //   const targetLog = await waitTxAndFilterLog(this.rpcClient, txHash, {
  //     //     ...LicenseRegistryConfig,
  //     //     eventName: "LicenseBurnt",
  //     //   });
  //     //   return { txHash: txHash, ipAccountId: targetLog?.args.account.toString() };
  //     // } else {
  //     return { txHash: txHash };
  //     // }
  //   } catch (error) {
  //     handleError(error, "Failed to register root IP");
  //   }
  // }
}
