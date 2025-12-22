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
import { TransactionResponse } from "../types/options";
import { Fee } from "../types/utils/token";

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
    this.erc20Token = new ERC20Client(rpcClient, wallet);
    this.wipToken = new WipTokenClient(rpcClient, wallet);
    this.walletAddress = wallet.account!.address;
  }

  /**
   * Executes a batch transaction with automatic fee handling for both ERC20 and WIP tokens.
   */
  public async executeWithFees(
    mintFees: Fee[],
    spenderAddress: Address,
    encodedTxs: EncodedTxData,
  ): Promise<TransactionResponse> {
    const { wipSpenders, erc20Spenders } = groupTokenSpenders(
      mintFees.map((fee) => ({
        address: spenderAddress,
        ...fee,
      })),
    );
    const wipTotalFees = wipSpenders.reduce((acc, spender) => acc + (spender.amount || 0n), 0n);
    const erc20TotalFees = erc20Spenders.reduce((acc, spender) => acc + (spender.amount || 0n), 0n);

    await this.validateWalletBalances(erc20TotalFees, wipTotalFees);

    const wipBalance = await this.wipToken.balanceOf(this.walletAddress);
    const callData: IpAccountImplExecuteBatchRequest["calls"] = [];
    let depositValue = 0n;

    // Build ERC20 fee call data if needed
    if (erc20TotalFees > 0n) {
      callData.push(...(await this.buildErc20FeeCallData(erc20TotalFees, spenderAddress)));
    }

    // Build WIP fee call data if needed
    if (wipTotalFees > 0n) {
      if (wipBalance < wipTotalFees) {
        const { calls, value } = this.buildWipDepositCallData(spenderAddress, wipTotalFees);
        callData.push(...calls);
        depositValue = value;
      } else {
        callData.push(...(await this.buildWipTransferCallData(wipTotalFees, spenderAddress)));
      }
    }

    // Add the actual transaction call data
    callData.push({
      target: encodedTxs.to,
      value: 0n,
      data: encodedTxs.data,
    });

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
   * Validates that the wallet has sufficient balances for both ERC20 and WIP token fees.
   */
  private async validateWalletBalances(
    erc20TotalFees: bigint,
    wipTotalFees: bigint,
  ): Promise<void> {
    const erc20Balance = await this.erc20Token.balanceOf(this.walletAddress);
    const ipBalance = await this.rpcClient.getBalance({ address: this.walletAddress });

    if (erc20Balance < erc20TotalFees) {
      throw new Error(
        `Wallet does not have enough ERC20 tokens to pay for fees. ` +
          `Required: ${getTokenAmountDisplay(erc20TotalFees)}, ` +
          `Available: ${getTokenAmountDisplay(erc20Balance)}.`,
      );
    }

    if (ipBalance < wipTotalFees) {
      throw new Error(
        `Wallet does not have enough IP tokens to wrap to WIP and pay for fees. ` +
          `Required: ${getTokenAmountDisplay(wipTotalFees)}, ` +
          `Available: ${getTokenAmountDisplay(ipBalance)}.`,
      );
    }
  }

  /**
   * Builds call data for transferring ERC20 tokens from wallet to IP account and approving spender.
   */
  private async buildErc20FeeCallData(
    totalFee: bigint,
    spenderAddress: Address,
  ): Promise<IpAccountImplExecuteBatchRequest["calls"]> {
    const erc20ContractAddress = erc20Address[aeneid.id];

    // Separate approve and transfer from wallet to IP account due to `msg.sender` context limitations
    await waitTx(this.rpcClient, await this.erc20Token.approve(this.ipId, totalFee));

    return [
      {
        target: erc20ContractAddress,
        value: 0n,
        data: this.erc20Token.transferFromEncode(this.walletAddress, this.ipId, totalFee).data,
      },
      {
        target: erc20ContractAddress,
        value: 0n,
        data: this.erc20Token.approveEncode(spenderAddress, maxUint256).data,
      },
    ];
  }

  /**
   * Builds call data for depositing IP tokens to WIP and approving spender.
   */
  private buildWipDepositCallData(
    spenderAddress: Address,
    totalFee: bigint,
  ): { calls: IpAccountImplExecuteBatchRequest["calls"]; value: bigint } {
    return {
      calls: [
        {
          target: WIP_TOKEN_ADDRESS,
          value: totalFee,
          data: this.wipToken.depositEncode().data,
        },
        {
          target: WIP_TOKEN_ADDRESS,
          value: 0n,
          data: this.wipToken.approveEncode(spenderAddress, maxUint256).data,
        },
      ],
      value: totalFee,
    };
  }

  /**
   * Builds call data for transferring existing WIP tokens from wallet to IP account and approving spender.
   */
  private async buildWipTransferCallData(
    totalFee: bigint,
    spenderAddress: Address,
  ): Promise<IpAccountImplExecuteBatchRequest["calls"]> {
    // Separate approve and transfer from wallet to IP account due to `msg.sender` context limitations
    await waitTx(this.rpcClient, await this.wipToken.approve(this.ipId, totalFee));

    return [
      {
        target: WIP_TOKEN_ADDRESS,
        value: 0n,
        data: this.wipToken.transferFromEncode(this.walletAddress, this.ipId, totalFee).data,
      },
      {
        target: WIP_TOKEN_ADDRESS,
        value: 0n,
        data: this.wipToken.approveEncode(spenderAddress, maxUint256).data,
      },
    ];
  }
}
