import { Hex, PublicClient, encodeAbiParameters, maxUint256, stringToHex } from "viem";

import { handleError } from "../utils/errors";
import {
  CancelDisputeRequest,
  CancelDisputeResponse,
  DisputeAssertionRequest,
  RaiseDisputeRequest,
  RaiseDisputeResponse,
  ResolveDisputeRequest,
  ResolveDisputeResponse,
  TagIfRelatedIpInfringedRequest,
} from "../types/resources/dispute";
import {
  ArbitrationPolicyUmaClient,
  DisputeModuleClient,
  DisputeModuleTagIfRelatedIpInfringedRequest,
  IpAccountImplClient,
  Multicall3Client,
  SimpleWalletClient,
  WrappedIpClient,
} from "../abi/generated";
import { validateAddress } from "../utils/utils";
import { convertCIDtoHashIPFS } from "../utils/ipfs";
import { ChainIds } from "../types/config";
import { handleTxOptions } from "../utils/txOptions";
import { TransactionResponse } from "../types/options";
import { contractCallWithFees } from "../utils/feeUtils";
import { getAssertionDetails } from "../utils/oov3";
import { WIP_TOKEN_ADDRESS } from "../constants/common";

export class DisputeClient {
  public disputeModuleClient: DisputeModuleClient;
  public arbitrationPolicyUmaClient: ArbitrationPolicyUmaClient;
  public multicall3Client: Multicall3Client;
  public wrappedIpClient: WrappedIpClient;
  private readonly rpcClient: PublicClient;
  private readonly chainId: ChainIds;
  private readonly wallet: SimpleWalletClient;

  constructor(rpcClient: PublicClient, wallet: SimpleWalletClient, chainId: ChainIds) {
    this.rpcClient = rpcClient;
    this.disputeModuleClient = new DisputeModuleClient(rpcClient, wallet);
    this.arbitrationPolicyUmaClient = new ArbitrationPolicyUmaClient(rpcClient, wallet);
    this.multicall3Client = new Multicall3Client(rpcClient, wallet);
    this.wrappedIpClient = new WrappedIpClient(rpcClient, wallet);
    this.chainId = chainId;
    this.wallet = wallet;
  }

  /**
   * Raises a dispute on a given ipId.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/dispute/IDisputeModule.sol#L64 | `DisputeRaised`} event.
   */
  public async raiseDispute(request: RaiseDisputeRequest): Promise<RaiseDisputeResponse> {
    try {
      const liveness = BigInt(request.liveness);
      const bonds = BigInt(request.bond);
      const [minLiveness, maxLiveness] = await Promise.all([
        this.arbitrationPolicyUmaClient.minLiveness(),
        this.arbitrationPolicyUmaClient.maxLiveness(),
      ]);

      const tag = stringToHex(request.targetTag, { size: 32 });
      if (liveness < minLiveness || liveness > maxLiveness) {
        throw new Error(`Liveness must be between ${minLiveness} and ${maxLiveness}.`);
      }

      const maxBonds = await this.arbitrationPolicyUmaClient.maxBonds({
        token: WIP_TOKEN_ADDRESS,
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
        [liveness, WIP_TOKEN_ADDRESS, bonds],
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
      const encodedTxData = this.disputeModuleClient.raiseDisputeEncode(req);
      if (request.txOptions?.encodedTxDataOnly) {
        return { encodedTxData };
      } else {
        const contractCall = () => this.disputeModuleClient.raiseDispute(req);
        const { txHash, receipt } = await contractCallWithFees({
          totalFees: bonds,
          options: {
            wipOptions: {
              ...request.wipOptions,
              // Disable multicall because multicall makes more complex due to disputeInitiator in this version.
              useMulticallWhenPossible: false,
            },
          },
          multicall3Address: this.multicall3Client.address,
          rpcClient: this.rpcClient,
          tokenSpenders: [
            {
              address: this.arbitrationPolicyUmaClient.address,
              amount: bonds,
            },
          ],
          contractCall,
          encodedTxs: [encodedTxData],
          wallet: this.wallet,
          txOptions: request.txOptions,
          sender: this.wallet.account!.address,
        });
        if (!receipt) {
          return { txHash };
        }
        const targetLogs = this.disputeModuleClient.parseTxDisputeRaisedEvent(receipt);
        return {
          txHash,
          disputeId: targetLogs[0].disputeId,
        };
      }
    } catch (error) {
      handleError(error, "Failed to raise dispute");
    }
  }

  /**
   * Cancels an ongoing dispute
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/dispute/IDisputeModule.sol#L84 | `DisputeCancelled`} event.
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
   * Resolves a dispute after it has been judged.
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/dispute/IDisputeModule.sol#L104 | `DisputeResolved`} event.
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
   *
   * Emits an on-chain {@link https://github.com/storyprotocol/protocol-core-v1/blob/v1.3.1/contracts/interfaces/modules/dispute/IDisputeModule.sol#L93 | `IpTaggedOnRelatedIpInfringement`} event.
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
      if (
        request.options?.useMulticallWhenPossible !== false &&
        request.infringementTags.length > 1
      ) {
        const calls = objects.map((object) => ({
          target: this.disputeModuleClient.address,
          allowFailure: false,
          callData: this.disputeModuleClient.tagIfRelatedIpInfringedEncode(object).data,
        }));
        const txHash = await this.multicall3Client.aggregate3({ calls });
        txHashes.push(txHash);
      } else {
        for (const object of objects) {
          const txHash = await this.disputeModuleClient.tagIfRelatedIpInfringed(object);
          txHashes.push(txHash);
        }
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

  /**
   * Counters a dispute that was raised by another party on an IP using counter evidence.
   *
   * This method can only be called by the IP's owner to counter a dispute by providing
   * counter evidence. The counter evidence (e.g., documents, images) should be
   * uploaded to IPFS, and its corresponding CID is converted to a hash for the request.
   *
   * If you only have a `disputeId`, call {@link disputeIdToAssertionId} to get the `assertionId` needed here.
   */
  public async disputeAssertion(request: DisputeAssertionRequest): Promise<TransactionResponse> {
    try {
      const ipAccount = new IpAccountImplClient(
        this.rpcClient,
        this.wallet,
        validateAddress(request.ipId),
      );
      const bond = await getAssertionDetails(
        this.rpcClient,
        this.arbitrationPolicyUmaClient,
        request.assertionId,
      );
      const counterEvidenceHash = convertCIDtoHashIPFS(request.counterEvidenceCID);
      const encodedData = this.arbitrationPolicyUmaClient.disputeAssertionEncode({
        assertionId: request.assertionId,
        counterEvidenceHash,
      });
      const { result: allowance } = await this.wrappedIpClient.allowance({
        owner: this.wallet.account!.address,
        spender: ipAccount.address,
      });
      if (allowance < bond) {
        // Approve ipAccount to transfer WrappedIP tokens
        // Note: We must use client wallet directly because:
        // 1. The bond payment requires WrappedIP tokens
        // 2. Cannot use ipAccount.executeBatch since msg.sender would be the same as spender
        const txHash = await this.wrappedIpClient.approve({
          spender: ipAccount.address,
          amount: maxUint256,
        });
        await this.rpcClient.waitForTransactionReceipt({
          hash: txHash,
        });
      }
      const contractCall = () => {
        const calls = [];
        if (bond > 0) {
          calls.push({
            target: this.wrappedIpClient.address,
            value: 0n,
            data: this.wrappedIpClient.transferFromEncode({
              from: this.wallet.account!.address,
              to: ipAccount.address,
              amount: bond,
            }).data,
          });
          calls.push({
            target: this.wrappedIpClient.address,
            value: 0n,
            data: this.wrappedIpClient.approveEncode({
              spender: this.arbitrationPolicyUmaClient.address,
              amount: maxUint256,
            }).data,
          });
        }
        return ipAccount.executeBatch({
          calls: [
            ...calls,
            {
              target: encodedData.to,
              value: 0n,
              data: encodedData.data,
            },
          ],
          operation: 0,
        });
      };

      const { txHash, receipt } = await contractCallWithFees({
        totalFees: bond,
        options: {
          wipOptions: {
            ...request.wipOptions,
            // Disable auto approve because msg.sender is ipAccount instead of wallet.
            enableAutoApprove: false,
            // Disable multicall because multicall makes more complex due to disputeInitiator in this version.
            useMulticallWhenPossible: false,
          },
        },
        multicall3Address: this.multicall3Client.address,
        rpcClient: this.rpcClient,
        contractCall,
        tokenSpenders: [
          {
            address: this.arbitrationPolicyUmaClient.address,
            amount: bond,
          },
        ],
        encodedTxs: [encodedData],
        wallet: this.wallet,
        sender: this.wallet.account!.address,
        txOptions: request.txOptions,
      });
      if (!receipt) {
        return { txHash };
      }
      return {
        txHash,
        receipt,
      };
    } catch (e) {
      handleError(e, "Failed to dispute assertion");
    }
  }

  public async disputeIdToAssertionId(disputeId: number | bigint): Promise<Hex> {
    const assertionId = await this.arbitrationPolicyUmaClient.disputeIdToAssertionId({
      disputeId: BigInt(disputeId),
    });
    return assertionId;
  }
}
