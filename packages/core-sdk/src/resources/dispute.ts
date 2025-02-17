import { Hex, PublicClient, encodeAbiParameters, stringToHex } from "viem";

import { handleError } from "../utils/errors";
import {
  CancelDisputeRequest,
  CancelDisputeResponse,
  RaiseDisputeRequest,
  RaiseDisputeResponse,
  ResolveDisputeRequest,
  ResolveDisputeResponse,
  TagIfRelatedIpInfringedRequest,
} from "../types/resources/dispute";
import {
  ArbitrationPolicyUmaReadOnlyClient,
  DisputeModuleClient,
  DisputeModuleTagIfRelatedIpInfringedRequest,
  Multicall3Client,
  SimpleWalletClient,
  wrappedIpAddress,
} from "../abi/generated";
import { chain, validateAddress } from "../utils/utils";
import { convertCIDtoHashIPFS } from "../utils/ipfs";
import { ChainIds } from "../types/config";
import { handleTxOptions } from "../utils/txOptions";
import { TransactionResponse } from "../types/options";

export class DisputeClient {
  public disputeModuleClient: DisputeModuleClient;
  public arbitrationPolicyUmaReadOnlyClient: ArbitrationPolicyUmaReadOnlyClient;
  public multicall3Client: Multicall3Client;
  private readonly rpcClient: PublicClient;
  private readonly chainId: ChainIds;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, chainId: ChainIds) {
    this.rpcClient = rpcClient;
    this.disputeModuleClient = new DisputeModuleClient(rpcClient, wallet);
    this.arbitrationPolicyUmaReadOnlyClient = new ArbitrationPolicyUmaReadOnlyClient(rpcClient);
    this.multicall3Client = new Multicall3Client(rpcClient, wallet);
    this.chainId = chainId;
  }

  /**
   * Raises a dispute on a given ipId.
   * Submits a {@link DisputeRaised} event.
   * @see https://github.com/storyprotocol/protocol-core-v1/blob/main/contracts/interfaces/modules/dispute/IDisputeModule.sol
   */
  public async raiseDispute(request: RaiseDisputeRequest): Promise<RaiseDisputeResponse> {
    try {
      const liveness = BigInt(request.liveness);
      const bonds = BigInt(request.bond);
      const tokenAddress = wrappedIpAddress[chain[this.chainId]];
      const [minLiveness, maxLiveness] = await Promise.all([
        this.arbitrationPolicyUmaReadOnlyClient.minLiveness(),
        this.arbitrationPolicyUmaReadOnlyClient.maxLiveness(),
      ]);

      const tag = stringToHex(request.targetTag, { size: 32 });
      if (liveness < minLiveness || liveness > maxLiveness) {
        throw new Error(`Liveness must be between ${minLiveness} and ${maxLiveness}.`);
      }

      const maxBonds = await this.arbitrationPolicyUmaReadOnlyClient.maxBonds({
        token: tokenAddress,
      });
      if (bonds > maxBonds) {
        throw new Error(`Bonds must be less than ${maxBonds}.`);
      }
      const data = encodeAbiParameters(
        [
          { name: "", type: "uint64" },
          { name: "", type: "address" },
          { name: "", type: "uint256" },
        ],
        [liveness, tokenAddress, bonds],
      );
      const { allowed: isWhiteList } = await this.disputeModuleClient.isWhitelistedDisputeTag({
        tag,
      });
      if (!isWhiteList) {
        throw new Error(`The target tag ${request.targetTag} is not whitelisted.`);
      }
      const req = {
        targetIpId: validateAddress(request.targetIpId),
        targetTag: tag,
        disputeEvidenceHash: convertCIDtoHashIPFS(request.cid),
        data,
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: this.disputeModuleClient.raiseDisputeEncode(req) };
      } else {
        const txHash = await this.disputeModuleClient.raiseDispute(req);

        if (request.txOptions?.waitForTransaction) {
          const txReceipt = await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
          const targetLogs = this.disputeModuleClient.parseTxDisputeRaisedEvent(txReceipt);
          return {
            txHash: txHash,
            disputeId: targetLogs[0].disputeId,
          };
        }
        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to raise dispute");
    }
  }

  /**
   * Cancels an ongoing dispute
   * @param request - The request object containing details to cancel the dispute.
   *   @param request.disputeId The ID of the dispute to be cancelled.
   *   @param request.data [Optional] additional data used in the cancellation process.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a CancelDisputeResponse containing the transaction hash.
   * @throws NotInDisputeState, if the currentTag of the Dispute is not being disputed
   * @throws NotDisputeInitiator, if the transaction executor is not the one that initiated the dispute
   * @throws error if the Dispute's ArbitrationPolicy contract is not valid
   * @calls cancelDispute(uint256 _disputeId, bytes calldata _data) external nonReentrant {
   * @emits DisputeCancelled (_disputeId, _data);
   */
  public async cancelDispute(request: CancelDisputeRequest): Promise<CancelDisputeResponse> {
    try {
      const req = {
        disputeId: BigInt(request.disputeId),
        data: request.data ? request.data : "0x",
      };
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: this.disputeModuleClient.cancelDisputeEncode(req) };
      } else {
        const txHash = await this.disputeModuleClient.cancelDispute(req);

        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
        }

        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to cancel dispute");
    }
  }

  /**
   * Resolves a dispute after it has been judged
   * @param request - The request object containing details to resolve the dispute.
   *   @param request.disputeId The ID of the dispute to be resolved.
   *   @param request.data The data to resolve the dispute.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a ResolveDisputeResponse.
   * @throws NotAbleToResolve, if currentTag is still in dispute (i.e still needs a judgement to be set)
   * @throws NotDisputeInitiator, if the transaction executor is not the one that initiated the dispute
   * @emits DisputeResolved (_disputeId)
   */
  public async resolveDispute(request: ResolveDisputeRequest): Promise<ResolveDisputeResponse> {
    try {
      const req = {
        disputeId: BigInt(request.disputeId),
        data: request.data,
      };

      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData: this.disputeModuleClient.resolveDisputeEncode(req) };
      } else {
        const txHash = await this.disputeModuleClient.resolveDispute(req);
        if (request.txOptions?.waitForTransaction) {
          await this.rpcClient.waitForTransactionReceipt({
            ...request.txOptions,
            hash: txHash,
          });
        }

        return { txHash: txHash };
      }
    } catch (error) {
      handleError(error, "Failed to resolve dispute");
    }
  }
  /**
   * Tags a derivative if a parent has been tagged with an infringement tag
   * or a group ip if a group member has been tagged with an infringement tag.
   * it emits IpTaggedOnRelatedIpInfringement(infringingIpId, ipIdToTag, infringerDisputeId, tag, disputeTimestamp)
   * Submits a {@link IpTaggedOnRelatedIpInfringement} event.
   * @see https://github.com/storyprotocol/protocol-core-v1/blob/main/contracts/interfaces/modules/dispute/IDisputeModule.sol.
   */
  public async tagIfRelatedIpInfringed(
    request: TagIfRelatedIpInfringedRequest,
  ): Promise<TransactionResponse[]> {
    try {
      const objects: DisputeModuleTagIfRelatedIpInfringedRequest[] = request.infringementTags.map(
        (arg) => ({
          ipIdToTag: validateAddress(arg.ipId),
          infringerDisputeId: BigInt(arg.disputeId),
        }),
      );
      let txHashes: Hex[] = [];
      if (request.useMulticallWhenPossible !== false && request.infringementTags.length > 1) {
        const calls = objects.map((object) => ({
          target: this.disputeModuleClient.address,
          allowFailure: false,
          callData: this.disputeModuleClient.tagIfRelatedIpInfringedEncode(object).data,
        }));
        const txHash = await this.multicall3Client.aggregate3({ calls });
        txHashes.push(txHash);
      } else {
        txHashes = await Promise.all(
          objects.map((object) => this.disputeModuleClient.tagIfRelatedIpInfringed(object)),
        );
      }
      return await Promise.all(
        txHashes.map((txHash) =>
          handleTxOptions({
            txHash,
            txOptions: request.txOptions,
            rpcClient: this.rpcClient,
          }),
        ),
      );
    } catch (error) {
      handleError(error, "Failed to tag related ip infringed");
    }
  }
}
