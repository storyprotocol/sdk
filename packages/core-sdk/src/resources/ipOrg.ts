import { AxiosInstance } from "axios";
import { getAddress, PublicClient, WalletClient } from "viem";

import { CreateIPOrgRequest, CreateIPOrgResponse } from "../types/resources/ipOrg";
import { handleError } from "../utils/errors";
import { IPOrgReadOnlyClient } from "./ipOrgReadOnly";
import { storyProtocolConfig } from "../abi/storyProtocol.abi";
import { ipOrgControllerConfig } from "../abi/ipOrgController.abi";
import { waitTxAndFilterLog } from "../utils/utils";

/**
 * IPOrgClient allows you to create, view, search IPOrgs on Story Protocol.
 */
export class IPOrgClient extends IPOrgReadOnlyClient {
  private readonly wallet: WalletClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient, wallet: WalletClient) {
    super(httpClient, rpcClient);
    this.wallet = wallet;
  }

  /**
   * Create a IPOrg on Story Protocol based on the specified input IPOrg data.
   *
   * @param request - the request object that contains all data needed to create a IPOrg
   * @returns the response object that contains results from the create IPOrg action
   */
  public async create(request: CreateIPOrgRequest): Promise<CreateIPOrgResponse> {
    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...storyProtocolConfig,
        functionName: "registerIpOrg",
        args: [
          getAddress(request.owner || this.wallet.account!.address),
          request.name,
          request.symbol,
          request.ipAssetTypes,
        ],
        account: this.wallet.account,
      });

      const txHash = await this.wallet.writeContract(call);
      if (request.txOptions?.waitForTransaction) {
        const targetLog = await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...ipOrgControllerConfig,
          eventName: "IPOrgRegistered",
        });
        return { txHash: txHash, ipOrgId: targetLog?.args.ipAssetOrg };
      } else {
        return { txHash: txHash };
      }
    } catch (error: unknown) {
      handleError(error, "Failed to create IPOrg");
    }
  }
}
