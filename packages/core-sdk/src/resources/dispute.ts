import { AxiosInstance } from "axios";
import { PublicClient, WalletClient, stringToHex } from "viem";

import { handleError } from "../utils/errors";
import { TxOptions } from "../types/options";
import { DisputeReadOnlyClient } from "./disputeReadOnly";
import { DisputeModuleConfig } from "../abi/disputeModule.abi";

export class DisputeClient extends DisputeReadOnlyClient {
  private readonly wallet: WalletClient;

  constructor(httpClient: AxiosInstance, rpcClient: PublicClient, wallet: WalletClient) {
    super(httpClient, rpcClient);
    this.wallet = wallet;
  }

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

type WhitelistDisputeTagsResponse = {
  txHash: string;
};

type WhitelistDisputeTagsRequest = {
  tag: string;
  allowed: boolean;
  txOptions?: TxOptions;
};

type WhitelistArbitrationPolicyRequest = {
  arbitrationPolicy: `0x${string}`;
  allowed: boolean;
  txOptions?: TxOptions;
};

type WhitelistArbitrationPolicyResponse = {
  txHash: string;
};

type WhitelistArbitrationRelayerRequest = {
  arbitrationPolicy: `0x${string}`;
  arbitrationRelayer: `0x${string}`;
  allowed: boolean;
  txOptions?: TxOptions;
};

type WhitelistArbitrationRelayerResponse = {
  txHash: string;
};

type RaiseDisputeRequest = {
  targetIpId: `0x${string}`;
  arbitrationPolicy: `0x${string}`;
  linkToDisputeEvidence: string;
  targetTag: string;
  calldata?: `0x${string}`;
  txOptions?: TxOptions;
};

type RaiseDisputeResponse = {
  txHash: string;
};

type SetDisputeJudgementRequest = {
  disputeId: number;
  decision: boolean;
  calldata?: `0x${string}`;
  txOptions?: TxOptions;
};

type SetDisputeJudgementResponse = {
  txHash: string;
};
