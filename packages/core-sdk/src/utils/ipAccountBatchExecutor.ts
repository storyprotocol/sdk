import { Address, maxUint256, PublicClient } from "viem";

import { aeneid } from "./chain";
import { simulateAndWriteContract } from "./contract";
import { groupTokenSpenders } from "./feeUtils";
import { ERC20Client, WipTokenClient } from "./token";
import { getTokenAmountDisplay, waitTx } from "./utils";
import {
  EncodedTxData,
  erc20Address,
  ipAccountImplAbi,
  IpAccountImplExecuteBatchRequest,
  SimpleWalletClient,
} from "../abi/generated";
import { WIP_TOKEN_ADDRESS } from "../constants/common";
import {
  TransactionResponse,
  WithErc20AndWipOptions,
  WithERC20Options,
  WithWipOptions,
} from "../types/options";
import { Fee } from "../types/utils/token";

export type IpAccountBatchExecutorExecuteWithFeesParams = {
  mintFees: Fee[];
  spenderAddress: Address;
  encodedTxs: EncodedTxData;
} & WithErc20AndWipOptions;

/**
 * Handles batch transaction execution through IP Account with automatic fee management for ERC20 and WIP tokens.
 */
export class IpAccountBatchExecutor {
  private readonly erc20Token: ERC20Client;
  private readonly wipToken: WipTokenClient;
  private readonly walletAddress: Address;

  constructor(
    private readonly rpcClient: PublicClient,
    private readonly wallet: SimpleWalletClient,
    private readonly ipId: Address,
  ) {
    //erc20 address only available in aeneid
    this.erc20Token = new ERC20Client(rpcClient, wallet, erc20Address[aeneid.id]);
    this.wipToken = new WipTokenClient(rpcClient, wallet);
    this.walletAddress = wallet.account!.address;
  }

  /**
   * Executes a batch transaction with automatic fee handling for both ERC20 and WIP tokens.
   */
  public async executeWithFees({
    mintFees,
    spenderAddress,
    encodedTxs,
    ...options
  }: IpAccountBatchExecutorExecuteWithFeesParams): Promise<TransactionResponse> {
    const { wipSpenders, erc20Spenders } = groupTokenSpenders(
      mintFees.map((fee) => ({
        address: spenderAddress,
        ...fee,
      })),
    );
    const wipTotalFees = wipSpenders.reduce((acc, spender) => acc + (spender.amount || 0n), 0n);
    const erc20TotalFees = erc20Spenders.reduce((acc, spender) => acc + (spender.amount || 0n), 0n);

    const wipBalance = await this.wipToken.balanceOf(this.walletAddress);
    const callData: IpAccountImplExecuteBatchRequest["calls"] = [];
    let depositValue = 0n;

    // Build ERC20 fee call data if needed
    if (erc20TotalFees > 0n) {
      callData.push(...(await this.buildErc20FeeCallData(erc20TotalFees, spenderAddress, options)));
    }

    // Build WIP fee call data if needed
    if (wipTotalFees > 0n) {
      if (wipBalance < wipTotalFees) {
        const { calls, value } = await this.buildWipDepositCallData(
          spenderAddress,
          wipTotalFees,
          wipBalance,
          options,
        );
        callData.push(...calls);
        depositValue = value;
      } else {
        callData.push(
          ...(await this.buildWipTransferCallData(wipTotalFees, spenderAddress, options)),
        );
      }
    }

    // Add the actual transaction call data
    callData.push({
      target: encodedTxs.to,
      value: 0n,
      data: encodedTxs.data,
    });

    const isMulticall = options.options?.wipOptions?.useMulticallWhenPossible !== false;
    if (!isMulticall) {
      for (const [index, call] of callData.entries()) {
        const value = call.value;
        const txHash = await simulateAndWriteContract({
          rpcClient: this.rpcClient,
          wallet: this.wallet,
          data: {
            abi: ipAccountImplAbi,
            address: this.ipId,
            functionName: "execute",
            args: [call.target, call.value, call.data, 0],
            ...(value > 0n && { value }),
          },
        });
        await waitTx(this.rpcClient, txHash.txHash);
        if (index === callData.length - 1) {
          return { txHash: txHash.txHash, receipt: txHash.receipt };
        }
      }
    }
    const txHash = await simulateAndWriteContract({
      rpcClient: this.rpcClient,
      wallet: this.wallet,
      data: {
        abi: ipAccountImplAbi,
        address: this.ipId,
        functionName: "executeBatch",
        args: [callData, 0],
        ...(depositValue > 0n && { value: depositValue }),
      },
    });
    await waitTx(this.rpcClient, txHash.txHash);
    return { txHash: txHash.txHash, receipt: txHash.receipt };
  }

  /**
   * Builds call data for transferring ERC20 tokens from wallet to IP account and approving spender.
   */
  private async buildErc20FeeCallData(
    totalFee: bigint,
    spenderAddress: Address,
    options: WithERC20Options,
  ): Promise<IpAccountImplExecuteBatchRequest["calls"]> {
    const erc20Balance = await this.erc20Token.balanceOf(this.walletAddress);
    if (erc20Balance < totalFee) {
      throw new Error(
        `Wallet does not have enough ERC20 tokens to pay for fees. ` +
          `Required: ${getTokenAmountDisplay(totalFee)}, ` +
          `Available: ${getTokenAmountDisplay(erc20Balance)}.`,
      );
    }
    const autoApprove = options.options?.erc20Options?.enableAutoApprove !== false;
    if (!autoApprove) {
      return [];
    }
    // erc20 address only available in aeneid
    const erc20ContractAddress = erc20Address[aeneid.id];
    const allowance = await this.erc20Token.allowance(this.walletAddress, this.ipId);
    if (allowance < totalFee) {
      // Separate approve and transfer from wallet to IP account due to `msg.sender` context limitations
      await waitTx(this.rpcClient, await this.erc20Token.approve(this.ipId, totalFee));
    }
    const calls: IpAccountImplExecuteBatchRequest["calls"] = [
      {
        target: erc20ContractAddress,
        value: 0n,
        data: this.erc20Token.transferFromEncode(this.walletAddress, this.ipId, totalFee).data,
      },
    ];
    const spenderAllowance = await this.erc20Token.allowance(this.ipId, spenderAddress);
    if (spenderAllowance < totalFee) {
      calls.push({
        target: erc20ContractAddress,
        value: 0n,
        data: this.erc20Token.approveEncode(spenderAddress, maxUint256).data,
      });
    }
    return calls;
  }

  /**
   * Builds call data for depositing IP tokens to WIP and approving spender.
   */
  private async buildWipDepositCallData(
    spenderAddress: Address,
    totalFee: bigint,
    wipBalance: bigint,
    options: WithWipOptions,
  ): Promise<{ calls: IpAccountImplExecuteBatchRequest["calls"]; value: bigint }> {
    const calls: IpAccountImplExecuteBatchRequest["calls"] = [];
    const autoApprove = options.options?.wipOptions?.enableAutoApprove !== false;
    const autoWrapIp = options.options?.wipOptions?.enableAutoWrapIp !== false;
    const ipBalance = await this.rpcClient.getBalance({ address: this.walletAddress });
    if (!autoWrapIp) {
      throw new Error(
        `Wallet does not have enough WIP to pay for fees. Total fees: ${getTokenAmountDisplay(
          totalFee,
        )}, balance: ${getTokenAmountDisplay(wipBalance, "WIP")}.`,
      );
    }

    if (ipBalance < totalFee) {
      throw new Error(
        `Wallet does not have enough IP tokens to wrap to WIP and pay for fees. ` +
          `Required: ${getTokenAmountDisplay(totalFee)}, ` +
          `Available: ${getTokenAmountDisplay(ipBalance)}.`,
      );
    }
    calls.push({
      target: WIP_TOKEN_ADDRESS,
      value: totalFee,
      data: this.wipToken.depositEncode().data,
    });
    const value = totalFee;
    const allowance = await this.wipToken.allowance(this.ipId, spenderAddress);
    if (autoApprove && allowance < totalFee) {
      calls.push({
        target: WIP_TOKEN_ADDRESS,
        value: 0n,
        data: this.wipToken.approveEncode(spenderAddress, maxUint256).data,
      });
    }
    return { calls, value };
  }

  /**
   * Builds call data for transferring existing WIP tokens from wallet to IP account and approving spender.
   */
  private async buildWipTransferCallData(
    totalFee: bigint,
    spenderAddress: Address,
    options: WithWipOptions,
  ): Promise<IpAccountImplExecuteBatchRequest["calls"]> {
    const autoApprove = options.options?.wipOptions?.enableAutoApprove !== false;
    const allowance = await this.wipToken.allowance(this.walletAddress, this.ipId);
    if (autoApprove && allowance < totalFee) {
      // Separate approve and transfer from wallet to IP account due to `msg.sender` context limitations
      await waitTx(this.rpcClient, await this.wipToken.approve(this.ipId, totalFee));
    }

    const calls: IpAccountImplExecuteBatchRequest["calls"] = [
      {
        target: WIP_TOKEN_ADDRESS,
        value: 0n,
        data: this.wipToken.transferFromEncode(this.walletAddress, this.ipId, totalFee).data,
      },
    ];
    const spenderAllowance = await this.wipToken.allowance(this.ipId, spenderAddress);
    if (autoApprove && spenderAllowance < totalFee) {
      calls.push({
        target: WIP_TOKEN_ADDRESS,
        value: 0n,
        data: this.wipToken.approveEncode(spenderAddress, maxUint256).data,
      });
    }
    return calls;
  }
}
