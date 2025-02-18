import { Address } from "viem";

import { TxOptions, WithTxOptions } from "../options";
import { EncodedTxData } from "../../abi/generated";

export type RaiseDisputeRequest = WithTxOptions & {
  /** The IP ID that is the target of the dispute. */
  targetIpId: Address;
  cid: string;
  /**
   * The target tag of the dispute.
   * @see https://docs.story.foundation/docs/dispute-module#dispute-tags
   * @example "IMPROPER_REGISTRATION"
   */
  targetTag: string;
  /** The liveness is the time window (in seconds) in which a counter dispute can be presented (30days). */
  liveness: bigint | number | string;
  /**
   * The amount of ERC20 that the dispute initiator pays upfront into a pool.
   * To counter that dispute the opposite party of the dispute has to place a bond of the same amount.
   * The winner of the dispute gets the original bond back + 50% of the other party bond. The remaining 50% of the loser party bond goes to the reviewer.
   */
  bond: bigint | number | string;
};

export type RaiseDisputeResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  disputeId?: bigint;
};

export type CancelDisputeRequest = {
  disputeId: number | string | bigint;
  data?: Address;
  txOptions?: TxOptions;
};

export type CancelDisputeResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
};

export type ResolveDisputeRequest = {
  disputeId: number | string | bigint;
  data: Address;
  txOptions?: TxOptions;
};

export type ResolveDisputeResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
};

export type TagIfRelatedIpInfringedRequest = {
  infringementTags: {
    /** The ipId to tag */
    ipId: Address;
    /** The dispute id that tagged the related infringing ipId */
    disputeId: number | string | bigint;
  }[];
  options?: {
    /**
     * Use multicall to batch the calls into one transaction when possible.
     *
     * If only 1 infringementTag is provided, multicall will not be used.
     * @default true
     */
    useMulticallWhenPossible?: boolean;
  };
} & WithTxOptions;
