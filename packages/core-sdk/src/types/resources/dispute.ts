import { Address, Hex } from "viem";

import { EncodedTxData } from "../../abi/generated";
import { TxOptions, WipOptions, WithTxOptions } from "../options";

export type RaiseDisputeRequest = WithTxOptions & {
  /** The IP ID that is the target of the dispute. */
  targetIpId: Address;
  /**
   * Content Identifier (CID) for the dispute evidence.
   * This should be obtained by uploading your dispute evidence (documents, images, etc.) to IPFS.
   * @example "QmX4zdp8VpzqvtKuEqMo6gfZPdoUx9TeHXCgzKLcFfSUbk"
   */
  cid: string;
  /**
   * The target tag of the dispute.
   * @see {@link https://docs.story.foundation/docs/dispute-module#dispute-tags | Dispute Tags}
   * @example {@link DisputeTargetTag.IMPROPER_REGISTRATION}
   */
  targetTag: DisputeTargetTag;
  /** The liveness is the time window (in seconds) in which a counter dispute can be presented (30days). */
  liveness: bigint | number | string;
  /**
   * The amount of wrapper IP that the dispute initiator pays upfront into a pool.
   * To counter that dispute the opposite party of the dispute has to place a bond of the same amount.
   * The winner of the dispute gets the original bond back + 50% of the other party bond. The remaining 50% of the loser party bond goes to the reviewer.
   * The bond amount must be between the minimum and maximum bond values defined in the Optimistic Oracle V3 (OOV3) contract. If not specified, it defaults to the minimum bond value.
   */
  bond?: bigint | number | string;
  /**
   * Omit {@link WipOptions.useMulticallWhenPossible} for this function due to disputeInitiator issue.
   * It will be executed sequentially with several transactions.
   */
  wipOptions?: Omit<WipOptions, "useMulticallWhenPossible">;
};

export type RaiseDisputeResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
  disputeId?: bigint;
};

export type CancelDisputeRequest = {
  disputeId: number | string | bigint;
  /**
   * Additional data used in the cancellation process.
   *
   * @default 0x
   */
  data?: Hex;
  txOptions?: TxOptions;
};

export type CancelDisputeResponse = {
  txHash?: string;
  encodedTxData?: EncodedTxData;
};

export type ResolveDisputeRequest = {
  disputeId: number | string | bigint;
  /**
   * Additional data used in the resolution process.
   *
   * @default 0x
   */
  data?: Hex;
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

export type DisputeAssertionRequest = {
  /**
   * The IP ID that is the target of the dispute.
   */
  ipId: Address;
  /**
   * The identifier of the assertion that was disputed.
   *
   * You can get this from the `disputeId` by calling `dispute.disputeIdToAssertionId`.
   */
  assertionId: Hex;
  /**
   * Content Identifier (CID) for the counter evidence.
   * This should be obtained by uploading your dispute evidence (documents, images, etc.) to IPFS.
   *
   * @example "QmX4zdp8VpzqvtKuEqMo6gfZPdoUx9TeHXCgzKLcFfSUbk"
   */
  counterEvidenceCID: string;
  /**
   * Omit {@link WipOptions.useMulticallWhenPossible} for this function due to disputeInitiator issue.
   * It will be executed sequentially with several transactions.
   */
  wipOptions?: Omit<WipOptions, "useMulticallWhenPossible">;
} & WithTxOptions;

/**
 * Tags refer to the “labels” that can be applied to IP Assets in the protocol when raising a dispute.
 * Tags must be whitelisted by protocol governance to be used in a dispute.
 * @see {@link https://docs.story.foundation/docs/dispute-module#dispute-tags | Dispute Tags}
 */
export enum DisputeTargetTag {
  /** Refers to registration of IP that already exists. */
  IMPROPER_REGISTRATION = "IMPROPER_REGISTRATION",
  /**
   * Refers to improper use of an IP Asset across multiple items.
   * For more details, @see {@link https://docs.story.foundation/concepts/programmable-ip-license/overview | Programmable IP License (PIL)} documentation.
   */
  IMPROPER_USAGE = "IMPROPER_USAGE",
  /** Refers to missing payments associated with an IP. */
  IMPROPER_PAYMENT = "IMPROPER_PAYMENT",
  /**
   * Refers to “No-Hate”, “Suitable-for-All-Ages”, “No-Drugs-or-Weapons” and “No-Pornography”.
   * These items can be found in more detail in the {@link https://docs.story.foundation/concepts/programmable-ip-license/overview  | 💊 Programmable IP License (PIL) } legal document.
   */
  CONTENT_STANDARDS_VIOLATION = "CONTENT_STANDARDS_VIOLATION",
  /**
   * Different from the other 4, this is a temporary tag that goes away
   * at the end of a dispute and is replaced by “0x” in case of no infringement or is replaced by one of the other tags.
   */
  IN_DISPUTE = "IN_DISPUTE",
}
