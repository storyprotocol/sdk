import { TxOptions } from "../options";

export type WhitelistDisputeTagsResponse = {
  txHash: string;
};

export type WhitelistDisputeTagsRequest = {
  tag: string;
  allowed: boolean;
  txOptions?: TxOptions;
};

export type WhitelistArbitrationPolicyRequest = {
  arbitrationPolicy: `0x${string}`;
  allowed: boolean;
  txOptions?: TxOptions;
};

export type WhitelistArbitrationPolicyResponse = {
  txHash: string;
};

export type WhitelistArbitrationRelayerRequest = {
  arbitrationPolicy: `0x${string}`;
  arbitrationRelayer: `0x${string}`;
  allowed: boolean;
  txOptions?: TxOptions;
};

export type WhitelistArbitrationRelayerResponse = {
  txHash: string;
};

export type RaiseDisputeRequest = {
  targetIpId: `0x${string}`;
  arbitrationPolicy: `0x${string}`;
  linkToDisputeEvidence: string;
  targetTag: string;
  calldata?: `0x${string}`;
  txOptions?: TxOptions;
};

export type RaiseDisputeResponse = {
  txHash: string;
};

export type SetDisputeJudgementRequest = {
  disputeId: number;
  decision: boolean;
  calldata?: `0x${string}`;
  txOptions?: TxOptions;
};

export type SetDisputeJudgementResponse = {
  txHash: string;
};
