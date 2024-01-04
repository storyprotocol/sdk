import { AxiosInstance } from "axios";
import { getAddress, PublicClient, WalletClient } from "viem";

import { CreateIpAssetRequest, CreateIpAssetResponse } from "../types/resources/ipAsset";
import { handleError } from "../utils/errors";
import { IPAssetReadOnlyClient } from "./ipAssetReadOnly";
import { storyProtocolConfig } from "../abi/storyProtocol.abi";
import { registrationModuleConfig } from "../abi/registrationModule.abi";
import { parseToBigInt, waitTxAndFilterLog, typedDataArrayToBytesArray } from "../utils/utils";
import { HashZero } from "../constants/common";

/**
 * IpAssetClient allows you to create, view, and search IP Assets on Story Protocol.
 */
export class IPAssetClient extends IPAssetReadOnlyClient {
  private readonly wallet: WalletClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient, wallet: WalletClient) {
    super(httpClient, rpcClient);
    this.wallet = wallet;
  }

  /**
   * Create an IP Asset on Story Protocol based on the specified input asset data.
   *
   * @param request - the request object that contains all data needed to create an IP Asset.
   * @returns the response object that contains results from the asset creation.
   */
  public async create(request: CreateIpAssetRequest): Promise<CreateIpAssetResponse> {
    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...storyProtocolConfig,
        functionName: "registerIPAsset",
        args: [
          getAddress(request.ipOrgId),
          {
            owner: getAddress(request.owner || this.wallet.account!.address),
            name: request.name,
            ipOrgAssetType: parseToBigInt(request.typeIndex),
            hash: request.contentHash || HashZero,
            mediaUrl: request.mediaUrl || "",
          },
          request.licenseId || 0,
          request.preHookData ? typedDataArrayToBytesArray(request.preHookData) : [],
          request.postHookData ? typedDataArrayToBytesArray(request.postHookData) : [],
        ],
        account: this.wallet.account,
      });

      const txHash = await this.wallet.writeContract(call);
      if (request.txOptions?.waitForTransaction) {
        const targetLog = await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...registrationModuleConfig,
          eventName: "IPAssetRegistered",
        });
        return { txHash: txHash, ipAssetId: targetLog?.args.ipAssetId.toString() };
      } else {
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to create IP Asset");
    }
  }
}
