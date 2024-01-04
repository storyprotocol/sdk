import { Address, PublicClient, WalletClient, getAddress, Hex } from "viem";
import { AxiosInstance } from "axios";

import storyProtocolJson from "../abi/json/StoryProtocol.abi";
import { storyProtocolConfig } from "../abi/storyProtocol.abi";
import { handleError } from "../utils/errors";
import { typedDataToBytes, waitTxAndFilterLog } from "../utils/utils";
import { LicenseReadOnlyClient } from "./licenseReadOnly";
import {
  ConfigureLicenseRequest,
  ConfigureLicenseResponse,
  CreateLicenseRequest,
  CreateLicenseResponse,
} from "../types/resources/license";
import { TypedData } from "../types/common";

/**
 * Client for managing relationships.
 */
export class LicenseClient extends LicenseReadOnlyClient {
  private readonly wallet: WalletClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient, wallet: WalletClient) {
    super(httpClient, rpcClient);
    this.wallet = wallet;
  }

  public async create(request: CreateLicenseRequest): Promise<CreateLicenseResponse> {
    const parsedParams = this.parseParamValues(request.params);

    const createLicenseParams = {
      params: parsedParams,
      parentLicenseId: request.parentLicenseId,
      ipaId: request.ipaId,
    };

    const args = [request.ipOrgId, createLicenseParams, request.preHookData, request.postHookData];

    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...storyProtocolConfig,
        functionName: "createLicense",
        args,
        account: this.wallet.account,
      });
      const txHash = await this.wallet.writeContract(call);
      if (request.txOptions?.waitForTransaction) {
        const targetLog = await waitTxAndFilterLog(this.rpcClient, txHash, {
          abi: [
            {
              type: "event",
              name: "LicenseRegistered",
              inputs: [
                { name: "id", type: "uint256", indexed: true, internalType: "uint256" },
                {
                  name: "licenseData",
                  type: "tuple",
                  indexed: false,
                  internalType: "struct Licensing.LicenseData",
                  components: [
                    { name: "status", type: "uint8", internalType: "enum Licensing.LicenseStatus" },
                    { name: "derivativesAllowed", type: "bool", internalType: "bool" },
                    { name: "isReciprocal", type: "bool", internalType: "bool" },
                    { name: "derivativeNeedsApproval", type: "bool", internalType: "bool" },
                    { name: "revoker", type: "address", internalType: "address" },
                    { name: "licensor", type: "address", internalType: "address" },
                    { name: "ipOrg", type: "address", internalType: "address" },
                    { name: "frameworkId", type: "bytes32", internalType: "ShortString" },
                    { name: "ipaId", type: "uint256", internalType: "uint256" },
                    { name: "parentLicenseId", type: "uint256", internalType: "uint256" },
                  ],
                },
              ],
              anonymous: false,
            },
          ],
          eventName: "LicenseRegistered",
          confirmations: request.txOptions?.numBlockConfirmations,
        });
        return { txHash: txHash, licenseId: targetLog?.args.id.toString() };
      } else {
        return { txHash: txHash };
      }
    } catch (error: unknown) {
      handleError(error, `Failed to register license`);
    }
  }

  public async configure(request: ConfigureLicenseRequest): Promise<ConfigureLicenseResponse> {
    const parsedParams = this.parseParamValues(request.params);
    const config = {
      frameworkId: request.frameworkId,
      params: parsedParams,
      licensor: request.licensor,
    };

    try {
      const { request: call } = await this.rpcClient.simulateContract({
        // ...storyProtocolConfig,
        abi: storyProtocolJson,
        address: getAddress(process.env.NEXT_PUBLIC_STORY_PROTOCOL_CONTRACT!),
        functionName: "configureIpOrgLicensing",
        args: [request.ipOrg as Address, config],
        account: this.wallet.account,
      });
      const txHash = await this.wallet.writeContract(call);

      if (request.txOptions?.waitForTransaction) {
        await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
        return { txHash: txHash, success: true };
      } else {
        return { txHash: txHash };
      }
    } catch (error: unknown) {
      handleError(error, "Failed to configure license");
    }
  }

  private parseParamValues(params: { tag: Hex; value: TypedData }[]) {
    return params.map((param: { tag: Hex; value: TypedData }) => {
      return {
        ...param,
        tag: param.tag,
        value: typedDataToBytes(param.value),
      };
    });
  }
}
