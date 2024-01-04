import { getAddress, PublicClient, WalletClient } from "viem";
import { AxiosInstance } from "axios";

import {
  RegisterRelationshipTypeRequest,
  RegisterRelationshipTypeResponse,
} from "../types/resources/relationshipType";
import { handleError } from "../utils/errors";
import { RelationshipTypeReadOnlyClient } from "./relationshipTypeReadOnly";
import { storyProtocolConfig } from "../abi/storyProtocol.abi";
import { relationshipModuleConfig } from "../abi/relationshipModule.abi";
import { waitTxAndFilterLog } from "../utils/utils";

/**
 * RelationshipTypeClient allows you to create, view and search relationship types on Story Protocol.
 */
export class RelationshipTypeClient extends RelationshipTypeReadOnlyClient {
  private readonly wallet: WalletClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient, wallet: WalletClient) {
    super(httpClient, rpcClient);
    this.wallet = wallet;
  }
  /**
   * Register a relationship type on Story Protocol based on the specified input data.
   *
   * @param request - the request object that contains all data needed to register a relationship type
   * @returns the response object that contains results from the register relationship type action
   */
  public async register(
    request: RegisterRelationshipTypeRequest,
  ): Promise<RegisterRelationshipTypeResponse> {
    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...storyProtocolConfig,
        functionName: "addRelationshipType",
        args: [
          {
            ipOrg: getAddress(request.ipOrgId),
            relType: request.relType,
            allowedElements: {
              src: request.relatedElements.src,
              dst: request.relatedElements.dst,
            },
            allowedSrcs: request.allowedSrcIpAssetTypes,
            allowedDsts: request.allowedDstIpAssetTypes,
          },
        ],
        account: this.wallet.account,
      });

      const txHash = await this.wallet.writeContract(call);
      if (request.txOptions?.waitForTransaction) {
        await waitTxAndFilterLog(this.rpcClient, txHash, {
          ...relationshipModuleConfig,
          eventName: "RelationshipTypeSet",
        });
        // https://sepolia.etherscan.io/tx/0x6b5072235bf5af5e3dc440dcd67b295a6fe6d68e5263c5dc9576f84392e77616#eventlog
        return { txHash: txHash, success: true };
      } else {
        return { txHash: txHash };
      }
    } catch (error: unknown) {
      handleError(error, "Failed to register relationship type");
    }
  }
}
