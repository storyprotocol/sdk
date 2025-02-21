import { Address, Hash, PublicClient } from "viem";

import {
  Multicall3Aggregate3Request,
  Multicall3Client,
  EncodedTxData,
  SimpleWalletClient,
  PiLicenseTemplateClient,
  LicensingModuleClient,
  Erc20Client,
} from "../../abi/generated";
import { ERC20Options, TxOptions, WipOptions, WithWipOptions } from "../options";
import { TokenClient, WIPTokenClient } from "../../utils/token";

export type Multicall3ValueCall = Multicall3Aggregate3Request["calls"][0] & { value: bigint };

export type Erc20Spender = {
  address: Address;
  /**
   * Amount that the address will spend in erc20 token.
   * If not provided, then unlimited amount is assumed.
   */
  amount?: bigint;
};

export type ApprovalCall = {
  spenders: Erc20Spender[];
  client: TokenClient;
  rpcClient: PublicClient;
  /** owner is the address calling the approval */
  owner: Address;
  /** when true, will return an array of {@link Multicall3ValueCall} */
  useMultiCall: boolean;
  multicallAddress?: Address;
};

export type TokenApprovalCall = {
  spenders: Erc20Spender[];
  client: Erc20Client;
  multicallAddress: Address;
  rpcClient: PublicClient;
  /** owner is the address calling the approval */
  owner: Address;
  /** when true, will return an array of {@link Multicall3ValueCall} */
  useMultiCall: boolean;
};

export type ContractCallWithFees = {
  totalFees: bigint;
  multicall3Address: Address;
  /** all possible spenders of the erc20 token */
  tokenSpenders: Erc20Spender[];
  contractCall: () => Promise<Hash>;
  encodedTxs: EncodedTxData[];
  rpcClient: PublicClient;
  wallet: SimpleWalletClient;
  sender: Address;
  options: {
    wipOptions?: WipOptions;
    erc20Options?: ERC20Options;
  };
  token?: Address;
  txOptions?: TxOptions;
};

export type MulticallWithWrapIp = WithWipOptions & {
  calls: Multicall3ValueCall[];
  ipAmountToWrap: bigint;
  contractCall: () => Promise<Hash>;
  wipSpenders: Erc20Spender[];
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
