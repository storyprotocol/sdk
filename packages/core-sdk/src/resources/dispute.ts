import { PublicClient, WalletClient } from "viem";

import { handleError } from "../utils/errors";
import { DisputeModuleConfig } from "../abi/disputeModule.abi";
import {
  SetDisputeJudgementRequest,
  SetDisputeJudgementResponse,
  WhitelistArbitrationPolicyRequest,
  WhitelistArbitrationPolicyResponse,
  WhitelistArbitrationRelayerRequest,
  WhitelistArbitrationRelayerResponse,
} from "../types/resources/dispute";

export class DisputeClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;

  constructor(rpcClient: PublicClient, wallet: WalletClient) {
    this.rpcClient = rpcClient;
    this.wallet = wallet;
  }
  /*
  public async whitelistDisputeTags(
    request: WhitelistDisputeTagsRequest,
  ): Promise<WhitelistDisputeTagsResponse> {
    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...DisputeModuleConfig,
        functionName: "whitelistDisputeTags",
        args: [stringToHex(request.tag, { size: 32 }), request.allowed],
      });

      const txHash = await this.wallet.writeContract(call);

      return { txHash: txHash };
    } catch (error) {
      handleError(error, "Failed to whitelist dispute tags");
    }
  }
*/
  public async whitelistArbitrationPolicy(
    request: WhitelistArbitrationPolicyRequest,
  ): Promise<WhitelistArbitrationPolicyResponse> {
    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...DisputeModuleConfig,
        functionName: "whitelistArbitrationPolicy",
        args: [request.arbitrationPolicy, request.allowed],
      });

      const txHash = await this.wallet.writeContract(call);

      return { txHash: txHash };
    } catch (error) {
      handleError(error, "Failed to whitelist arbitration policy");
    }
  }

  public async whitelistArbitrationRelayer(
    request: WhitelistArbitrationRelayerRequest,
  ): Promise<WhitelistArbitrationRelayerResponse> {
    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...DisputeModuleConfig,
        functionName: "whitelistArbitrationRelayer",
        args: [request.arbitrationPolicy, request.arbitrationRelayer, request.allowed],
      });

      const txHash = await this.wallet.writeContract(call);

      return { txHash: txHash };
    } catch (error) {
      handleError(error, "Failed to whitelist arbitration relayer");
    }
  }
  /*
  public async raiseDispute(request: RaiseDisputeRequest): Promise<RaiseDisputeResponse> {
    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...DisputeModuleConfig,
        functionName: "raiseDispute",
        args: [
          request.targetIpId,
          request.arbitrationPolicy,
          request.linkToDisputeEvidence,
          stringToHex(request.targetTag, { size: 32 }),
          request.calldata ? request.calldata : "0x",
        ],
      });

      const txHash = await this.wallet.writeContract(call);

      return { txHash: txHash };
    } catch (error) {
      handleError(error, "Failed to raise dispute");
    }
  }
*/
  public async setDisputeJudgement(
    request: SetDisputeJudgementRequest,
  ): Promise<SetDisputeJudgementResponse> {
    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...DisputeModuleConfig,
        functionName: "setDisputeJudgement",
        args: [
          BigInt(request.disputeId),
          request.decision,
          request.calldata ? request.calldata : "0x",
        ],
      });

      const txHash = await this.wallet.writeContract(call);

      return { txHash: txHash };
    } catch (error) {
      handleError(error, "Failed to raise dispute");
    }
  }
}
