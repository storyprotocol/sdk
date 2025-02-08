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
   * Raises a dispute on a given ipId
   * @param request - The request object containing necessary data to raise a dispute.
   *   @param request.targetIpId The IP ID that is the target of the dispute.
   *   @param request.targetTag The target tag of the dispute.
   *   @param request.cid CID (Content Identifier) is a unique identifier in IPFS, including CID v0 (base58) and CID v1 (base32).
   *   @param request.liveness The liveness time.
   *   @param request.bond The bond size.
   *   @param request.txOptions [Optional] This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a RaiseDisputeResponse containing the transaction hash.
   * @throws `NotRegisteredIpId` if targetIpId is not registered in the IPA Registry.
   * @throws `NotWhitelistedDisputeTag` if targetTag is not whitelisted.
   * @throws `ZeroLinkToDisputeEvidence` if linkToDisputeEvidence is empty
   * @calls raiseDispute(address _targetIpId, string memory _linkToDisputeEvidence, bytes32 _targetTag, bytes calldata _data) external nonReentrant returns (uint256) {
   * @emits DisputeRaised (disputeId_, targetIpId, msg.sender, arbitrationPolicy, linkToDisputeEvidence, targetTag, calldata);
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
   */
  public async tagIfRelatedIpInfringed(request: TagIfRelatedIpInfringedRequest) {
    try {
      const objects: DisputeModuleTagIfRelatedIpInfringedRequest[] = request.args.map((arg) => ({
        ipIdToTag: validateAddress(arg.ipIdToTag),
        infringerDisputeId: BigInt(arg.infringerDisputeId),
      }));
      let txHash: Hex;
      if (request.useMulticallWhenPossible !== false && request.args.length > 1) {
        const calls = objects.map((object) => ({
          target: this.disputeModuleClient.address,
          allowFailure: false,
          callData: this.disputeModuleClient.tagIfRelatedIpInfringedEncode(object).data,
        }));
        txHash = await this.multicall3Client.aggregate3({ calls });
      } else {
        txHash = await this.disputeModuleClient.tagIfRelatedIpInfringed(objects[0]);
      }
      if (request.txOptions?.waitForTransaction) {
        await this.rpcClient.waitForTransactionReceipt({
          ...request.txOptions,
          hash: txHash,
        });
        //TODO: wait for querying event
      }
    } catch (error) {
      handleError(error, "Failed to tag related ip");
    }
  }
}
