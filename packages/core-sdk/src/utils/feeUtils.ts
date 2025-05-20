import { Hash, maxUint256, PublicClient } from "viem";

import { simulateAndWriteContract } from "./contract";
import { ERC20Client, WipTokenClient } from "./token";
import { waitForTxReceipt, waitForTxReceipts } from "./txOptions";
import { getTokenAmountDisplay } from "./utils";
import { multicall3Abi, wrappedIpAbi } from "../abi/generated";
import { TxOptions } from "../types/options";
import {
  ApprovalCall,
  ContractCallWithFees,
  ContractCallWithFeesResponse,
  Multicall3ValueCall,
  MulticallWithWrapIp,
} from "../types/utils/wip";

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
      waitForTransaction: true,
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
    // caller should handle waiting for transaction if needed
    waitForTransaction: false,
  });
};

/**
 * Handle contract calls that require token fees. For fees in WIP, it automatically wraps IP to WIP when insufficient WIP balance.
 * For all other ERC20 tokens, it handles approvals if insufficient allowance.
 *
 * @remarks
 * This function will automatically handle the following:
 *
 * If token is wip and the user does not have enough WIP, it will wrap IP to WIP, unless
 * disabled via `disableAutoWrappingIp`.
 *
 * If the user have enough token, it will check for if approvals are needed
 * for each spender address and approve it, unless disabled via `disableAutoApprove`.
 */
export const contractCallWithFees = async <T extends Hash | Hash[] = Hash>({
  totalFees,
  options,
  multicall3Address,
  wallet,
  tokenSpenders,
  contractCall,
  sender,
  txOptions,
  encodedTxs,
  rpcClient,
  token,
}: ContractCallWithFees<T>): Promise<ContractCallWithFeesResponse<T>> => {
  const wipTokenClient = new WipTokenClient(rpcClient, wallet);
  const isWip = token === wipTokenClient.address || token === undefined;
  const selectedOptions = isWip ? options?.wipOptions : options.erc20Options;
  const tokenClient = isWip ? wipTokenClient : new ERC20Client(rpcClient, wallet, token);
  // if no fees, skip all logic
  if (totalFees === 0n) {
    const txHash = await contractCall();
    return handleTransactionResponse(txHash, rpcClient, txOptions);
  }
  const balance = await tokenClient.balanceOf(sender);
  const autoApprove = selectedOptions?.enableAutoApprove !== false;

  // handle when there's enough token to cover all fees
  if (balance >= totalFees) {
    if (autoApprove) {
      await approvalAllSpenders({
        spenders: tokenSpenders,
        client: tokenClient,
        owner: sender, // sender owns the wip
        multicallAddress: multicall3Address,
        rpcClient,
        // since sender has all token, if using multicall, we cannot approve transfer token into multicall by multicall.
        //  So in this case, we don't use multicall here and instead just wait for each approval to be finished.
        useMultiCall: false,
      });
    }
    const txHash = await contractCall();
    return handleTransactionResponse(txHash, rpcClient, txOptions);
  }

  if (!isWip) {
    throw new Error(
      `Wallet does not have enough erc20 token to pay for fees. Total fees:  ${getTokenAmountDisplay(
        totalFees,
      )}, balance: ${getTokenAmountDisplay(balance)}.`,
    );
  }
  const autoWrapIp = options?.wipOptions?.enableAutoWrapIp !== false;
  const startingBalance = await rpcClient.getBalance({ address: sender });
  // error if wallet does not have enough IP to cover fees
  if (startingBalance < totalFees) {
    throw new Error(
      `Wallet does not have enough IP to wrap to WIP and pay for fees. Total fees: ${getTokenAmountDisplay(
        totalFees,
      )}, balance: ${getTokenAmountDisplay(startingBalance)}.`,
    );
  }

  // error if there's enough IP to cover fees and we cannot wrap IP to WIP
  if (!autoWrapIp) {
    throw new Error(
      `Wallet does not have enough WIP to pay for fees. Total fees: ${getTokenAmountDisplay(
        totalFees,
      )}, balance: ${getTokenAmountDisplay(balance, "WIP")}.`,
    );
  }
  const calls = encodedTxs?.map((data) => ({
    target: data.to,
    allowFailure: false,
    value: 0n,
    callData: data.data,
  }));
  const { txHash } = await multiCallWrapIp({
    ipAmountToWrap: totalFees,
    multicall3Address,
    wipClient: wipTokenClient,
    wipOptions: options?.wipOptions,
    contractCall,
    wipSpenders: tokenSpenders,
    rpcClient,
    wallet,
    calls,
  });
  return handleTransactionResponse(txHash, rpcClient, txOptions) as unknown as Promise<
    ContractCallWithFeesResponse<T>
  >;
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
