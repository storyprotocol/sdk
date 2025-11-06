import { Hash, maxUint256, PublicClient } from "viem";

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
  Multicall3ValueCall,
  MulticallWithWrapIp,
  TokenSpender,
} from "../types/utils/wip";

/**
 * Merges spenders with the same address by summing their amounts.
 */
const mergeSpenderByAddress = (spenders: TokenSpender[], newSpender: TokenSpender): void => {
  const existingSpender = spenders.find((s) => s.address === newSpender.address);
  if (existingSpender) {
    existingSpender.amount = (newSpender.amount || 0n) + (existingSpender.amount || 0n);
  } else {
    spenders.push({ ...newSpender, amount: newSpender.amount || 0n });
  }
};

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
 * Handle ERC20 token payment with approval and balance check.
 */
const handleErc20Payment = async <T extends Hash | Hash[] = Hash>(
  {
    tokenSpenders,
    sender,
    options,
    multicall3Address,
    rpcClient,
    wallet,
    contractCall,
    txOptions,
  }: ContractCallWithFees<T>,
  isFinalStep: boolean = true,
): Promise<ContractCallWithFeesResponse<T> | undefined> => {
  const tokenClient = new ERC20Client(rpcClient, wallet, tokenSpenders[0].address);
  const balance = await tokenClient.balanceOf(sender);
  const totalFees = calculateTotalAmount(tokenSpenders);
  if (balance < totalFees) {
    throw new Error(
      `Wallet does not have enough erc20 token to pay for fees. Total fees:  ${getTokenAmountDisplay(
        totalFees,
      )}, balance: ${getTokenAmountDisplay(balance)}.`,
    );
  }

  const autoApprove = options?.erc20Options?.enableAutoApprove !== false;
  if (autoApprove) {
    // ERC20 token is not supported multicall, because approve method is called by the multicall contract,
    // the owner is the multicall contract, not the sender. When transfer from the sender to the multicall contract,
    // the owner is the sender, not the multicall contract. We cannot use multicall in this case.
    await approvalAllSpenders({
      spenders: tokenSpenders,
      client: tokenClient,
      owner: sender,
      multicallAddress: multicall3Address,
      rpcClient,
      useMultiCall: false,
    });
  }

  if (isFinalStep) {
    return handleTransactionResponse(await contractCall(), rpcClient, txOptions);
  }
};

/**
 * Handle WIP token payment with approval and balance check.
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
    wipClient: wipClient,
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
 * - For fees in `WIP`, it automatically wraps `IP` to `WIP` when insufficient `WIP` balance.
 * - For fees in `ERC20` tokens, it automatically approves if sufficient balance is available.
 *
 * @remarks
 * This function will automatically handle the following logic:
 * - If token is `WIP` and the user does not have enough `WIP` balance, it will wrap `IP` to `WIP`, unless
 * disabled via `disableAutoWrappingIp`.
 * - If the user have enough token, it will check for if approvals are needed
 * for each spender address and approve it, unless disabled via `disableAutoApprove`.
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

  const wipTokenAddress = WIP_TOKEN_ADDRESS.toLowerCase();
  const wipSpenders: TokenSpender[] = [];
  const erc20Spenders: TokenSpender[] = [];

  for (const spender of tokenSpenders) {
    if (spender.token.toLowerCase() === wipTokenAddress) {
      mergeSpenderByAddress(wipSpenders, spender);
    } else {
      mergeSpenderByAddress(erc20Spenders, spender);
    }
  }
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
  if (wipSpenders.length > 0 && erc20Spenders.length > 0) {
    await handleErc20Payment({ ...baseContractCallArgs, tokenSpenders: erc20Spenders }, false);
    return handleWipPayment({ ...baseContractCallArgs, tokenSpenders: wipSpenders });
  } else if (erc20Spenders.length > 0) {
    return handleErc20Payment({
      ...baseContractCallArgs,
      tokenSpenders: erc20Spenders,
    }) as unknown as Promise<ContractCallWithFeesResponse<T>>;
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
