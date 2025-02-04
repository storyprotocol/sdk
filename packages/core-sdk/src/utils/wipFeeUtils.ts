import { maxUint256, zeroAddress } from "viem";

import { erc20TokenAbi, multicall3Abi, SpgnftImplReadOnlyClient } from "../abi/generated";
import { WIP_TOKEN_ADDRESS } from "../constants/common";
import { getTokenAmountDisplay } from "./utils";
import {
  WipApprovalCall,
  Multicall3ValueCall,
  CalculateDerivativeMintFeeParams,
  MulticallWithWrapIp,
  ContractCallWithWipFees,
} from "../types/utils/wip";
import { simulateAndWriteContract } from "./contract";
import { handleTxOptions } from "./txOptions";
import { HandleTxOptionsResponse } from "../types/utils/txOptions";

/**
 * check the allowance of all spenders and call approval if any spender
 * allowance is lower than the amount they are expected to spend.
 * Supports using multicall to batch all approve calls.
 */
const approvalAllSpenders = async ({
  spenders,
  client,
  owner,
  useMultiCall,
  rpcClient,
}: WipApprovalCall) => {
  const approvals = await Promise.all(
    spenders.map(async (spender) => {
      const spenderAmount = spender.amount || maxUint256;
      const { result: allowance } = await client.allowance({
        owner: owner,
        spender: spender.address,
      });
      if (allowance < spenderAmount) {
        return {
          spender: spender.address,
          amount: maxUint256, // approve max amount to avoid approvals in the future
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
      const encodedData = client.approveEncode(approval);
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
    const hash = await client.approve(approval);
    await rpcClient.waitForTransactionReceipt({ hash });
  }
  return [];
};

export const calculateLicenseWipMintFee = async (params: CalculateDerivativeMintFeeParams) => {
  const fee = await params.licensingModuleClient.predictMintingLicenseFee({
    licensorIpId: params.parentIpId,
    licenseTemplate: params.licenseTemplateClient.address,
    licenseTermsId: params.licenseTermsId,
    amount: 1n,
    receiver: params.receiver,
    royaltyContext: zeroAddress,
  });
  if (fee.currencyToken !== WIP_TOKEN_ADDRESS) {
    return 0n;
  }
  return fee.tokenAmount;
};

export const calculateSPGWipMintFee = async (spgNftClient: SpgnftImplReadOnlyClient) => {
  const token = await spgNftClient.mintFeeToken();
  if (token !== WIP_TOKEN_ADDRESS) {
    return 0n;
  }
  return await spgNftClient.mintFee();
};

const multiCallWrapIp = async ({
  ipAmountToWrap,
  wipClient,
  multicall3Client,
  wipSpenders,
  calls,
  rpcClient,
  wallet,
  contractCall,
  wipOptions,
}: MulticallWithWrapIp) => {
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
        abi: erc20TokenAbi,
        address: WIP_TOKEN_ADDRESS,
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
      owner: useMultiCall ? multicall3Client.address : wallet.account!.address,
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
      address: multicall3Client.address,
      functionName: "aggregate3Value",
      args: [multiCalls],
      value: ipAmountToWrap,
    },
    // caller should handle waiting for transaction if needed
    waitForTransaction: false,
  });
};

/**
 * Handle contract calls that require WIP fees by automatically wrapping IP to WIP when needed.
 *
 * @remarks
 * This function will automatically handle the following:
 *
 * If the user does not have enough WIP, it will wrap IP to WIP, unless
 * disabled via `disableAutoWrappingIp`.
 *
 * If the user have enough WIP, it will check for if approvals are needed
 * for each spender address and batch them in a multicall, unless disabled via
 * `disableAutoApprove`.
 */
export const contractCallWithWipFees = async ({
  totalFees,
  wipOptions,
  multicall3Client,
  rpcClient,
  wipClient,
  wallet,
  wipSpenders,
  contractCall,
  sender,
  txOptions,
  encodedTxs,
}: ContractCallWithWipFees): Promise<HandleTxOptionsResponse> => {
  // if no fees, skip all WIP logic
  if (totalFees === 0n) {
    const txHash = await contractCall();
    return handleTxOptions({ rpcClient, txOptions, txHash });
  }

  const wipBalanceOf = await wipClient.balanceOf({
    owner: sender,
  });
  const wipBalance = wipBalanceOf.result;
  const calls = encodedTxs.map((data) => ({
    target: data.to,
    allowFailure: false,
    value: 0n,
    callData: data.data,
  }));

  const autoApprove = wipOptions?.enableAutoApprove !== false;
  const autoWrapIp = wipOptions?.enableAutoWrapIp !== false;

  // handle when there's enough WIP to cover all fees
  if (wipBalance >= totalFees) {
    if (autoApprove) {
      await approvalAllSpenders({
        spenders: wipSpenders,
        client: wipClient,
        owner: sender, // sender owns the wip
        rpcClient,
        // since sender has all wip, if using multicall, we will also need to transfer
        // sender's wip to multicall, which brings more complexity. So in this case,
        // we don't use multicall here and instead just wait for each approval to be finished.
        useMultiCall: false,
      });
    }
    const txHash = await contractCall();
    return handleTxOptions({ rpcClient, txOptions, txHash });
  }

  const startingBalance = await rpcClient.getBalance({ address: sender });

  // error if wallet does not have enough IP to cover fees
  if (startingBalance < totalFees) {
    throw new Error(
      `Wallet does not have enough IP to wrap to WIP and pay for fees. Total fees: ${getTokenAmountDisplay(
        totalFees,
      )}, balance: ${getTokenAmountDisplay(startingBalance)}`,
    );
  }

  // error if there's enough IP to cover fees and we cannot wrap IP to WIP
  if (!autoWrapIp) {
    throw new Error(
      `Wallet does not have enough WIP to pay for fees. Total fees: ${getTokenAmountDisplay(
        totalFees,
      )}, balance: ${getTokenAmountDisplay(wipBalance, "WIP")}`,
    );
  }

  const { txHash } = await multiCallWrapIp({
    ipAmountToWrap: totalFees,
    multicall3Client,
    wipClient,
    wipOptions,
    contractCall,
    wipSpenders,
    rpcClient,
    wallet,
    calls,
  });
  return handleTxOptions({ rpcClient, txOptions, txHash });
};
