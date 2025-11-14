import { Address, Hash, maxUint256, PublicClient } from "viem";

import { simulateAndWriteContract } from "./contract";
import { ERC20Client, WipTokenClient } from "./token";
import { waitForTxReceipt, waitForTxReceipts } from "./txOptions";
import { getTokenAmountDisplay } from "./utils";
import { multicall3Abi, wrappedIpAbi } from "../abi/generated";
import { WIP_TOKEN_ADDRESS } from "../constants/common";
import { TxOptions } from "../types/options";
import {
  ApprovalCall,
  ContractCallWithFees,
  ContractCallWithFeesResponse,
  Erc20SpendersHandlerRequest,
  Multicall3ValueCall,
  MulticallWithWrapIp,
  TokenSpender,
} from "../types/utils/token";

/**
 * check the allowance of all spenders and call approval if any spender
 * allowance is lower than the amount they are expected to spend.
 * Supports using multicall to return all approve calls in a multicall array.
 */
const approvalAllSpenders = async ({
  spenders,
  client,
  owner,
  useMultiCall,
  rpcClient,
  multicallAddress,
}: ApprovalCall): Promise<Multicall3ValueCall[]> => {
  const approvals = await Promise.all(
    spenders.map(async (spender) => {
      // make sure we never give approval to the multicall contract
      if (spender.address === multicallAddress) {
        return;
      }
      const spenderAmount = spender.amount || maxUint256;
      const allowance = await client.allowance(owner, spender.address);
      if (allowance < spenderAmount) {
        return {
          spender: spender.address,
          value: maxUint256, // approve max amount to avoid approvals in the future
        };
      }
      return;
    }),
  );
  if (useMultiCall) {
    const allCalls: Multicall3ValueCall[] = [];
    approvals.forEach((approval) => {
      if (!approval) {
        return;
      }
      const encodedData = client.approveEncode(approval.spender, approval.value);
      allCalls.push({
        target: encodedData.to,
        allowFailure: false,
        value: 0n,
        callData: encodedData.data,
      });
    });
    return allCalls;
  }

  // make approval calls sequentially
  for (const approval of approvals) {
    if (!approval) {
      continue;
    }
    const hash = await client.approve(approval.spender, approval.value);
    await rpcClient.waitForTransactionReceipt({ hash });
  }
  return [];
};

const multiCallWrapIp = async ({
  ipAmountToWrap,
  wipClient,
  multicall3Address,
  wipSpenders,
  calls,
  rpcClient,
  wallet,
  contractCall,
  wipOptions,
}: MulticallWithWrapIp): Promise<{ txHash: Hash | Hash[] }> => {
  if (ipAmountToWrap === 0n) {
    throw new Error("ipAmountToWrap should be greater than 0");
  }
  const multiCalls: Multicall3ValueCall[] = [];

  const useMultiCall = wipOptions?.useMulticallWhenPossible !== false;
  if (useMultiCall) {
    const deposit = wipClient.depositEncode();
    multiCalls.push({
      target: deposit.to,
      allowFailure: false,
      value: ipAmountToWrap,
      callData: deposit.data,
    });
  } else {
    // convert IP to WIP directly from the wallet
    await simulateAndWriteContract({
      rpcClient,
      wallet: wallet,
      data: {
        abi: wrappedIpAbi,
        address: wipClient.address,
        functionName: "deposit",
        value: ipAmountToWrap,
      },
    });
  }

  const autoApprove = wipOptions?.enableAutoApprove !== false;
  if (autoApprove) {
    const approvalCalls = await approvalAllSpenders({
      spenders: wipSpenders,
      client: wipClient,
      multicallAddress: multicall3Address,
      owner: useMultiCall ? multicall3Address : wallet.account!.address,
      rpcClient,
      useMultiCall,
    });
    if (approvalCalls.length > 0 && useMultiCall) {
      multiCalls.push(...approvalCalls);
    }
  }

  multiCalls.push(...calls);

  if (!useMultiCall) {
    const txHash = await contractCall();
    return { txHash };
  }
  return simulateAndWriteContract({
    rpcClient,
    wallet: wallet,
    data: {
      abi: multicall3Abi,
      address: multicall3Address,
      functionName: "aggregate3Value",
      args: [multiCalls],
      value: ipAmountToWrap,
    },
  });
};

/**
 * Calculate the total amount needed from spenders.
 */
const calculateTotalAmount = (spenders: TokenSpender[]): bigint =>
  spenders.reduce((acc, spender) => acc + (spender.amount || 0n), 0n);

/**
 * Handle ERC20 token approval.
 * If auto approve is enabled, it will approve the token for the spenders.
 */
const handleErc20Approval = async ({
  erc20Spenders,
  sender,
  options,
  rpcClient,
  wallet,
  multicallAddress,
}: Erc20SpendersHandlerRequest): Promise<void> => {
  for (const spender of erc20Spenders) {
    const tokenClient = new ERC20Client(rpcClient, wallet, spender[0].token);
    const autoApprove = options?.erc20Options?.enableAutoApprove !== false;
    if (autoApprove) {
      await approvalAllSpenders({
        spenders: spender,
        client: tokenClient,
        owner: sender,
        multicallAddress,
        rpcClient,
        useMultiCall: false,
      });
    }
  }
};

/**
 * Handle WIP token payment with approval and wrapper ip to wip.
 */
const handleWipPayment = async <T extends Hash | Hash[] = Hash>({
  tokenSpenders,
  sender,
  options,
  multicall3Address,
  rpcClient,
  contractCall,
  txOptions,
  wallet,
  encodedTxs,
}: ContractCallWithFees<T>): Promise<ContractCallWithFeesResponse<T>> => {
  const wipTokenClient = new WipTokenClient(rpcClient, wallet);
  const balance = await wipTokenClient.balanceOf(sender);
  const totalFees = calculateTotalAmount(tokenSpenders);

  if (balance < totalFees) {
    return handleIpWrapping({
      tokenSpenders,
      sender,
      options,
      rpcClient,
      multicall3Address,
      contractCall,
      encodedTxs,
      wallet,
      txOptions,
    });
  }

  const autoApprove = options?.wipOptions?.enableAutoApprove !== false;
  if (autoApprove) {
    await approvalAllSpenders({
      spenders: tokenSpenders,
      client: wipTokenClient,
      owner: sender,
      multicallAddress: multicall3Address,
      rpcClient,
      useMultiCall: false,
    });
  }

  return handleTransactionResponse(await contractCall(), rpcClient, txOptions);
};

/**
 * Handle IP wrapping to WIP when insufficient WIP balance.
 */
const handleIpWrapping = async <T extends Hash | Hash[] = Hash>({
  tokenSpenders,
  sender,
  options,
  rpcClient,
  multicall3Address,
  contractCall,
  encodedTxs,
  wallet,
  txOptions,
}: ContractCallWithFees<T>): Promise<ContractCallWithFeesResponse<T>> => {
  const autoWrapIp = options?.wipOptions?.enableAutoWrapIp !== false;
  const ipBalance = await rpcClient.getBalance({ address: sender });
  const wipClient = new WipTokenClient(rpcClient, wallet);
  const wipBalance = await wipClient.balanceOf(sender);
  const totalFees = calculateTotalAmount(tokenSpenders);

  if (ipBalance < totalFees) {
    throw new Error(
      `Wallet does not have enough IP to wrap to WIP and pay for fees. Total fees: ${getTokenAmountDisplay(
        totalFees,
      )}, balance: ${getTokenAmountDisplay(ipBalance)}.`,
    );
  }

  if (!autoWrapIp) {
    throw new Error(
      `Wallet does not have enough WIP to pay for fees. Total fees: ${getTokenAmountDisplay(
        totalFees,
      )}, balance: ${getTokenAmountDisplay(wipBalance, "WIP")}.`,
    );
  }

  const { txHash } = await multiCallWrapIp({
    ipAmountToWrap: totalFees,
    multicall3Address,
    wipClient,
    wipOptions: options?.wipOptions,
    contractCall,
    wipSpenders: tokenSpenders,
    rpcClient,
    wallet,
    calls: encodedTxs.map((data) => ({
      target: data.to,
      allowFailure: false,
      value: 0n,
      callData: data.data,
    })),
  });

  return handleTransactionResponse(txHash, rpcClient, txOptions) as unknown as Promise<
    ContractCallWithFeesResponse<T>
  >;
};

/**
 * Handle contract calls that require token fees.
 *
 * @remarks
 * This function will automatically handle the following logic:
 * - If token is `WIP` and the user does not have enough `WIP` balance, it will wrap `IP` to `WIP`, unless
 * disabled via `disableAutoWrappingIp`.
 * - If the user have enough token, it will check for if approvals are needed
 * for each spender address and approve it, unless disabled via `disableAutoApprove`.
 * - If the fees are in `WIP` and `ERC20` tokens, it will not use disable `useMulticallWhenPossible` to pay for fees.
 */
export const contractCallWithFees = async <T extends Hash | Hash[] = Hash>({
  options,
  multicall3Address,
  wallet,
  tokenSpenders,
  contractCall,
  sender,
  txOptions,
  encodedTxs,
  rpcClient,
}: ContractCallWithFees<T>): Promise<ContractCallWithFeesResponse<T>> => {
  // Skip fee logic if no fees
  const zeroFees = tokenSpenders.every((spender) => spender.amount === 0n);
  if (zeroFees) {
    return handleTransactionResponse(await contractCall(), rpcClient, txOptions);
  }
  const { wipSpenders, erc20Spenders } = groupByTokenAndMergeSpenders(tokenSpenders);
  const baseContractCallArgs = {
    sender,
    options,
    multicall3Address,
    rpcClient,
    contractCall,
    encodedTxs,
    txOptions,
    wallet,
  };
  if (erc20Spenders.length > 0) {
    await judgeErc20BalanceBelowFees({
      erc20Spenders,
      sender,
      rpcClient,
      wallet,
      multicallAddress: multicall3Address,
    });
  }

  if (wipSpenders.length > 0 && erc20Spenders.length > 0) {
    await handleErc20Approval({
      erc20Spenders,
      multicallAddress: multicall3Address,
      sender,
      options,
      rpcClient,
      wallet,
    });
    return handleWipPayment({
      ...baseContractCallArgs,
      tokenSpenders: wipSpenders,
      options: {
        wipOptions: {
          ...options?.wipOptions,
          // Need to pay erc20 fees with the wallet, cannot use multicall when handling erc20 payment.
          useMulticallWhenPossible: false,
        },
      },
    });
  } else if (erc20Spenders.length > 0) {
    await handleErc20Approval({
      erc20Spenders,
      sender,
      options,
      rpcClient,
      wallet,
      multicallAddress: multicall3Address,
    });
    return handleTransactionResponse(await contractCall(), rpcClient, txOptions);
  } else {
    return handleWipPayment({ ...baseContractCallArgs, tokenSpenders: wipSpenders });
  }
};

export const handleTransactionResponse = async <T extends Hash | Hash[] = Hash>(
  txHash: T,
  rpcClient: PublicClient,
  txOptions?: TxOptions,
): Promise<ContractCallWithFeesResponse<T>> => {
  if (Array.isArray(txHash)) {
    return waitForTxReceipts({
      rpcClient,
      txOptions,
      txHashes: txHash,
    }) as unknown as Promise<ContractCallWithFeesResponse<T>>;
  }

  return waitForTxReceipt({
    rpcClient,
    txOptions,
    txHash,
  }) as unknown as Promise<ContractCallWithFeesResponse<T>>;
};

/**
 * Merges spenders with the same token and address by summing their amounts.
 */

const mergeSpenderByAddress = (spenders: TokenSpender[]): TokenSpender[] => {
  return spenders.reduce<TokenSpender[]>((acc, spender) => {
    const existingSpender = acc.find(
      (s) => s.address === spender.address && s.token === spender.token,
    );
    if (existingSpender) {
      existingSpender.amount = (existingSpender.amount || 0n) + (spender.amount || 0n);
    } else {
      acc.push({ ...spender, amount: spender.amount || 0n });
    }
    return acc;
  }, [] as TokenSpender[]);
};

/**
 * Group by token and merge spenders with the same address.
 */
const groupByTokenAndMergeSpenders = (
  tokenSpenders: TokenSpender[],
): { wipSpenders: TokenSpender[]; erc20Spenders: TokenSpender[][] } => {
  const wipSpenders: TokenSpender[] = [];
  const erc20SpendersByToken = new Map<Address, TokenSpender[]>();
  const erc20Spenders: TokenSpender[][] = [];
  for (const spender of tokenSpenders) {
    if (spender.token === WIP_TOKEN_ADDRESS) {
      wipSpenders.push(spender);
    } else {
      if (erc20SpendersByToken.has(spender.token)) {
        erc20SpendersByToken.get(spender.token)?.push(spender);
      } else {
        erc20SpendersByToken.set(spender.token, [spender]);
      }
    }
  }

  for (const [, spenders] of erc20SpendersByToken.entries()) {
    erc20Spenders.push(mergeSpenderByAddress(spenders));
  }
  return { wipSpenders: mergeSpenderByAddress(wipSpenders), erc20Spenders };
};

const judgeErc20BalanceBelowFees = async ({
  erc20Spenders,
  sender,
  rpcClient,
  wallet,
}: Erc20SpendersHandlerRequest): Promise<void> => {
  for (const spender of erc20Spenders) {
    const erc20Client = new ERC20Client(rpcClient, wallet, spender[0].token);
    const erc20Balance = await erc20Client.balanceOf(sender);
    const erc20TotalFees = calculateTotalAmount(spender);
    //If the wallet does not have enough erc20 token to pay for fees, throw an error.
    if (erc20Balance < erc20TotalFees) {
      throw new Error(
        `Wallet does not have enough erc20 token of ${
          spender[0].token
        } to pay for fees. Total fees:  ${getTokenAmountDisplay(
          erc20TotalFees,
        )}, balance: ${getTokenAmountDisplay(erc20Balance)}.`,
      );
    }
  }
};
