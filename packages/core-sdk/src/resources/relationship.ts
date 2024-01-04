import { getAddress, PublicClient, WalletClient } from "viem";
import { AxiosInstance } from "axios";

import {
  RegisterRelationshipRequest,
  RegisterRelationshipResponse,
} from "../types/resources/relationship";
import { handleError } from "../utils/errors";
import { RelationshipReadOnlyClient } from "./relationshipReadOnly";
import { storyProtocolConfig } from "../abi/storyProtocol.abi";
import { relationshipModuleConfig } from "../abi/relationshipModule.abi";
import { waitTxAndFilterLog, typedDataArrayToBytesArray } from "../utils/utils";

/**
 * RelationshipClient allows you to create, view and search relationships on Story Protocol.
 */
export class RelationshipClient extends RelationshipReadOnlyClient {
  private readonly wallet: WalletClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient, wallet: WalletClient) {
    super(httpClient, rpcClient);
    this.wallet = wallet;
  }

  /**
   * Register a relationship on Story Protocol based on the specified input relationship data.
   *
   * @param request - the request object that contains all data needed to register a relationship
   * @returns the response object that contains results from the register relationship action
   */
  public async register(
    request: RegisterRelationshipRequest,
  ): Promise<RegisterRelationshipResponse> {
    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...storyProtocolConfig,
        functionName: "createRelationship",
        args: [
          getAddress(request.ipOrgId),
          {
            relType: request.relType,
            srcAddress: request.srcContract as `0x${string}`,
            srcId: request.srcTokenId,
            dstAddress: request.dstContract as `0x${string}`,
            dstId: request.dstTokenId,
          },
          request.preHookData ? typedDataArrayToBytesArray(request.preHookData) : [],
          request.postHookData ? typedDataArrayToBytesArray(request.postHookData) : [],
        ],
        account: this.wallet.account,
      });

      const txHash = await this.wallet.writeContract(call);
      if (request.txOptions?.waitForTransaction) {
        const targetLog = await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...relationshipModuleConfig,
          eventName: "RelationshipCreated",
        });
        // https://sepolia.etherscan.io/tx/0x99d5736c65bd81cd4a361a731d4a035375a0926c95e4132e8fcb80ad5b602b5c#eventlog
        return { txHash: txHash, relationshipId: targetLog?.args.relationshipId.toString() };
      } else {
        return { txHash: txHash };
      }
    } catch (error: unknown) {
      handleError(error, "Failed to register relationship");
    }
  }
}
