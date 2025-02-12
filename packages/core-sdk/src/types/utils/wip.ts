import { Address, Hash, PublicClient } from "viem";

import {
  Multicall3Aggregate3Request,
  Multicall3Client,
  EncodedTxData,
  SimpleWalletClient,
  PiLicenseTemplateClient,
  LicensingModuleClient,
  MockErc20Client,
} from "../../abi/generated";
import { TxOptions } from "../options";
import { TokenClient, WIPTokenClient } from "../../utils/token";

/**
 * Options to override the default behavior of the auto wrapping IP
 * and auto approve logic.
 */
export type WithWipOptions = {
  /** options to configure WIP behavior */
  wipOptions?: {
    /**
     * Use multicall to batch the WIP calls into one transaction when possible.
     *
     * @default true
     */
    useMulticallWhenPossible?: boolean;

    /**
     * By default IP is converted to WIP if the current WIP
     * balance does not cover the fees.
     * Set this to `false` to disable this behavior.
     *
     * @default true
     */
    enableAutoWrapIp?: boolean;

    /**
     * Automatically approve WIP usage when WIP is needed but current allowance
     * is not sufficient.
     * Set this to `false` to disable this behavior.
     *
     * @default true
     */
    enableAutoApprove?: boolean;
  };
};

export type Multicall3ValueCall = Multicall3Aggregate3Request["calls"][0] & { value: bigint };

export type TokenSpender = {
  address: Address;
  /**
   * Amount that the address will spend in WIP.
   * If not provided, then unlimited amount is assumed.
   */
  amount?: bigint;
};

export type ApprovalCall = {
  spenders: TokenSpender[];
  client: TokenClient;
  rpcClient: PublicClient;
  /** owner is the address calling the approval */
  owner: Address;
  /** when true, will return an array of {@link Multicall3ValueCall} */
  useMultiCall: boolean;
  multicallAddress?: Address;
};

export type TokenApprovalCall = {
  spenders: TokenSpender[];
  client: MockErc20Client;
  multicallAddress: Address;
  rpcClient: PublicClient;
  /** owner is the address calling the approval */
  owner: Address;
  /** when true, will return an array of {@link Multicall3ValueCall} */
  useMultiCall: boolean;
};

export type ContractCallWithFees = WithWipOptions & {
  totalFees: bigint;
  tokenClient: TokenClient;
  /** all possible spenders of the wip */
  tokenSpenders: TokenSpender[];
  contractCall: () => Promise<Hash>;
  rpcClient: PublicClient;
  sender: Address;
  /** If tokenClient is WIPTokenClient, The field is required */
  encodedTxs?: EncodedTxData[];
  /** If tokenClient is WIPTokenClient, The field is required */
  wallet?: SimpleWalletClient;
  /** If tokenClient is WIPTokenClient, The field is required */
  multicall3Address?: Address;
  txOptions?: TxOptions;
};

export type MulticallWithWrapIp = WithWipOptions & {
  calls: Multicall3ValueCall[];
  ipAmountToWrap: bigint;
  contractCall: () => Promise<Hash>;
  wipSpenders: TokenSpender[];
  multicall3Address: Address;
  wipClient: WIPTokenClient;
  rpcClient: PublicClient;
  wallet: SimpleWalletClient;
};

export type CalculateDerivativeMintFeeParams = {
  multicall3Client: Multicall3Client;
  licenseTemplateClient: PiLicenseTemplateClient;
  licensingModuleClient: LicensingModuleClient;
  parentIpId: Address;
  licenseTermsId: bigint;
  receiver: Address;
  amount: bigint;
};
