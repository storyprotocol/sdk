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
 * and auto approve logic, use multicall.
 */
export type ERC20Options = {
  /** Options to configure erc20 behavior */
  erc20Options?: {
    /**
     * Use multicall to batch the erc20 calls into one transaction when possible.
     * This option is false if the token is not WIP.
     *
     * @default true
     */
    useMulticallWhenPossible?: boolean;

    /**
     * By default IP is converted to WIP if the current WIP
     * balance does not cover the fees.
     * Set this to `false` to disable this behavior.
     * This option is false if the token is not WIP.
     *
     * @default true
     */
    enableAutoWrapIp?: boolean;

    /**
     * Automatically approve token usage when token is needed but current allowance
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

export type ContractCallWithFees = ERC20Options & {
  totalFees: bigint;
  multicall3Address: Address;
  /** all possible spenders of the wip */
  tokenSpenders: TokenSpender[];
  contractCall: () => Promise<Hash>;
  encodedTxs: EncodedTxData[];
  rpcClient: PublicClient;
  wallet: SimpleWalletClient;
  sender: Address;
  token?: Address;
  txOptions?: TxOptions;
};

export type MulticallWithWrapIp = ERC20Options & {
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
