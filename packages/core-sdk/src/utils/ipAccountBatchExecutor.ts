import { Address, encodeFunctionData, maxUint256, PublicClient } from "viem";

import { aeneid } from "./chain";
import { simulateAndWriteContract } from "./contract";
import { groupTokenSpenders } from "./feeUtils";
import { generateOperationSignature } from "./generateOperationSignature";
import { getCalculatedDeadline } from "./registrationUtils/registerValidation";
import { ERC20Client, WipTokenClient } from "./token";
import { getTokenAmountDisplay, waitTx } from "./utils";
import {
  EncodedTxData,
  erc20Address,
  ipAccountImplAbi,
  IpAccountImplClient,
  IpAccountImplExecuteBatchRequest,
  Multicall3Client,
  SimpleWalletClient,
  wrappedIpAbi,
} from "../abi/generated";
import { WIP_TOKEN_ADDRESS } from "../constants/common";
import { ChainIds } from "../types/config";
import {
  ERC20Options,
  TransactionResponse,
  WipOptions,
  WithErc20AndWipOptions,
} from "../types/options";
import { SignatureMethodType } from "../types/utils/registerHelper";
import { Fee, Multicall3ValueCall } from "../types/utils/token";
import { getSignature } from "./sign";

export type IpAccountBatchExecutorExecuteWithFeesParams = {
  mintFees: Fee[];
  ipId: Address;
  spenderAddress: Address;
  encodedTxs: EncodedTxData;
} & WithErc20AndWipOptions;

export type ExecuteMultipleWithFeesParams = {
  items: Omit<IpAccountBatchExecutorExecuteWithFeesParams, "options">[];
  deadline?: bigint;
} & WithErc20AndWipOptions;

export type FeeExecutionParam<T extends ERC20Options | WipOptions> = {
  ipId: Address,
  totalFee: bigint,
  spenderAddress: Address,
  wipBalance?: bigint,
  options: T,
};
/**
 * Handles batch transaction execution through IP Account with automatic fee management for ERC20 and WIP tokens.
 * Supports fulfilling contract-level `verifyPermission` checks, ensuring that all required permissions are validated during execution.
 */
export class IpAccountBatchExecutor {
  private readonly erc20Token: ERC20Client;
  private readonly wipToken: WipTokenClient;
  private readonly walletAddress: Address;
  private readonly multicall3Client: Multicall3Client;
  constructor(
    private readonly rpcClient: PublicClient,
    private readonly wallet: SimpleWalletClient,
    private readonly chainId: ChainIds,
  ) {
    //erc20 address only available in aeneid
    this.erc20Token = new ERC20Client(rpcClient, wallet, erc20Address[aeneid.id]);
    this.wipToken = new WipTokenClient(rpcClient, wallet);
    this.walletAddress = wallet.account!.address;
    this.rpcClient = rpcClient;
    this.wallet = wallet;
    this.multicall3Client = new Multicall3Client(rpcClient, wallet);
    this.chainId = chainId;
  }

  /**
   * Executes a batch transaction with automatic fee handling for both ERC20 and WIP tokens.
   */
  public async executeWithFees({
    mintFees,
    spenderAddress,
    encodedTxs,
    ipId,
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
      callData.push(...(await this.buildErc20FeeCallData({ totalFee: erc20TotalFees, ipId, spenderAddress, options: options.options?.erc20Options??{} })));
    }

    // Build WIP fee call data if needed
    if (wipTotalFees > 0n) {
      if (wipBalance < wipTotalFees) {
        const { calls, value } = await this.buildWipDepositCallData(
          { totalFee: wipTotalFees, ipId, spenderAddress, options: options.options?.wipOptions??{}, wipBalance },
        );
        callData.push(...calls);
        depositValue = value;
      } else {
        callData.push(
          ...(await this.buildWipTransferCallData({ totalFee: wipTotalFees, ipId, spenderAddress, options: options.options?.wipOptions??{} })),
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
            address: ipId,
            functionName: "execute",
            args: [call.target, call.value, call.data, 0],
            ...(value > 0n && { value }),
          },
        });
        await waitTx(this.rpcClient, txHash.txHash);
        // Only return txHash and receipt for the main user transaction (last in the batch)
        // All previous calls are for setup (e.g., approvals/deposits) and do not require a return value
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
        address: ipId,
        functionName: "executeBatch",
        args: [callData, 0],
        ...(depositValue > 0n && { value: depositValue }),
      },
    });
    await waitTx(this.rpcClient, txHash.txHash);
    return { txHash: txHash.txHash, receipt: txHash.receipt };
  }
  /**
   * Executes batch transactions across multiple IP accounts with automatic fee handling.
   *
   * This method handles the complexity of batching operations that span multiple IP accounts,
   * each potentially requiring fee payments. It works in two phases:
   * 1. Pre-fund phase: Transfers WIP/ERC20 fees from wallet to each IP account
   * 2. Execution phase: Batches all IP account operations via multicall3 with executeWithSig
   */
  public async executeMultipleWithFees({
    items,
    deadline,
    ...options
  }: ExecuteMultipleWithFeesParams): Promise<TransactionResponse> {
    const wipToken = new WipTokenClient(this.rpcClient, this.wallet);
    const erc20Token = new ERC20Client(this.rpcClient, this.wallet, erc20Address[aeneid.id]);
    const autoApprove = options.options?.wipOptions?.enableAutoApprove !== false;
    const autoWrapIp = options.options?.wipOptions?.enableAutoWrapIp !== false;

    // Calculate fees per IP account
    const ipFees = new Map<Address, { wipFee: bigint; erc20Fee: bigint }>();
    let totalWipFee = 0n;
    let totalErc20Fee = 0n;

    for (const item of items) {
      const { wipSpenders, erc20Spenders } = groupTokenSpenders(
        item.mintFees.map((fee) => ({ address: item.spenderAddress, ...fee })),
      );
      const wipFee = wipSpenders.reduce((acc, s) => acc + (s.amount || 0n), 0n);
      const erc20Fee = erc20Spenders.reduce((acc, s) => acc + (s.amount || 0n), 0n);
      if (ipFees.has(item.ipId)) {
        ipFees.get(item.ipId)!.wipFee += wipFee;
        ipFees.get(item.ipId)!.erc20Fee += erc20Fee;
      } else {
        ipFees.set(item.ipId, { wipFee, erc20Fee });
      }
      totalWipFee += wipFee;
      totalErc20Fee += erc20Fee;
    }

    // Phase 1: Check balances and pre-fund IP accounts
    const multicallCalls: Multicall3ValueCall[] = [];
    if (totalWipFee > 0n) {
      const wipBalance = await wipToken.balanceOf(this.walletAddress);

      if (wipBalance < totalWipFee) {
        if (!autoWrapIp) {
          throw new Error(
            `Wallet does not have enough WIP to pay for fees. ` +
              `Required: ${getTokenAmountDisplay(totalWipFee)}, ` +
              `Available: ${getTokenAmountDisplay(wipBalance, "WIP")}.`,
          );
        }

        const needed = totalWipFee - wipBalance;
        const ipBalance = await this.rpcClient.getBalance({ address: this.walletAddress });
        if (ipBalance < needed) {
          throw new Error(
            `Wallet does not have enough IP tokens to wrap to WIP and pay for fees. ` +
              `Required: ${getTokenAmountDisplay(needed)}, ` +
              `Available: ${getTokenAmountDisplay(ipBalance)}.`,
          );
        }

        // Wrap IP to WIP using direct contract call with value
        const depositTx = await simulateAndWriteContract({
          rpcClient: this.rpcClient,
          wallet: this.wallet,
          data: {
            abi: wrappedIpAbi,
            address: WIP_TOKEN_ADDRESS,
            functionName: "deposit",
            value: needed,
          },
        });
        await this.rpcClient.waitForTransactionReceipt({ hash: depositTx.txHash });
      }

      // Transfer WIP to each IP account
      for (const [ipId, { wipFee }] of ipFees) {
        if (wipFee > 0n) {
          const allowance = await wipToken.allowance(this.walletAddress, ipId);
          if (autoApprove && allowance < wipFee) {
            multicallCalls.push({
              target: WIP_TOKEN_ADDRESS,
              allowFailure: false,
              value: 0n,
              callData: wipToken.approveEncode(ipId, maxUint256).data,
            });
          }
          multicallCalls.push({
            target: WIP_TOKEN_ADDRESS,
            allowFailure: false,
            value: 0n,
            callData: wipToken.transferFromEncode(this.walletAddress, ipId, wipFee).data,
          });
        }
      }
    }

    if (totalErc20Fee > 0n) {
      const erc20Balance = await erc20Token.balanceOf(this.walletAddress);
      if (erc20Balance < totalErc20Fee) {
        throw new Error(
          `Wallet does not have enough ERC20 tokens to pay for fees. ` +
            `Required: ${getTokenAmountDisplay(totalErc20Fee)}, ` +
            `Available: ${getTokenAmountDisplay(erc20Balance)}.`,
        );
      }

      // Transfer ERC20 to each IP account
      for (const [ipId, { erc20Fee }] of ipFees) {
        if (erc20Fee > 0n) {
          const allowance = await erc20Token.allowance(this.walletAddress, ipId);
          if (autoApprove && allowance < erc20Fee) {
            multicallCalls.push({
              target: erc20Address[aeneid.id],
              allowFailure: false,
              value: 0n,
              callData: erc20Token.approveEncode(ipId, maxUint256).data,
            });
          }
          multicallCalls.push({
            target: erc20Address[aeneid.id],
            allowFailure: false,
            value: 0n,
            callData: erc20Token.transferFromEncode(this.walletAddress, ipId, erc20Fee).data,
          });
        }
      }
    }

    if (multicallCalls.length > 0) {
      const txHash = await this.multicall3Client.aggregate3({ calls: multicallCalls });
      await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
    }

    // Phase 2: Build multicall3 batch with executeWithSig for each IP account
    const calls: Multicall3ValueCall[] = [];

    for (const item of items) {
      const fees = ipFees.get(item.ipId);
      const ipAccountCalls: IpAccountImplExecuteBatchRequest["calls"] = [];
      const calculatedDeadline =
      deadline ?? (await getCalculatedDeadline(this.rpcClient));
      // Add approval call for WIP if needed
      if (fees && fees.wipFee > 0n && autoApprove) {
        const spenderAllowance = await wipToken.allowance(item.ipId, item.spenderAddress);
        if (spenderAllowance < fees.wipFee && autoApprove) {
          ipAccountCalls.push({
            target: WIP_TOKEN_ADDRESS,
            value: 0n,
            data: wipToken.approveEncode(item.spenderAddress, maxUint256).data,
          });
        }
      }

      // Add approval call for ERC20 if needed
      if (fees && fees.erc20Fee > 0n && autoApprove) {
        const spenderAllowance = await erc20Token.allowance(item.ipId, item.spenderAddress);
        if (spenderAllowance < fees.erc20Fee && autoApprove) {
          ipAccountCalls.push({
            target: erc20Address[aeneid.id],
            value: 0n,
            data: erc20Token.approveEncode(item.spenderAddress, maxUint256).data,
          });
        }
      }
      // Cannot use executeBatch with Multicall3 due to `msg.sender` context limitations and signature also need to user confirmation, so it's not good to use here.
      // Add main transaction
      ipAccountCalls.push({
        target: item.encodedTxs.to,
        value: 0n,
        data: item.encodedTxs.data,
      });
      console.log("ipAccountCalls", ipAccountCalls);
      // Build executeBatch call data for this IP account
      const executeBatchData = encodeFunctionData({
        abi: ipAccountImplAbi,
        functionName: "executeBatch",
        args: [ipAccountCalls, 0],
      });
      
      // Get state and signature for this IP account
      const ipAccount = new IpAccountImplClient(this.rpcClient, this.wallet, item.ipId);
      const { result: state } = await ipAccount.state();

      const { signature } = await getSignature({
        to: item.ipId,
        verifyingContract: item.ipId,
        deadline: calculatedDeadline,
        state,
        wallet: this.wallet,
        chainId: this.chainId,
        encodeData: executeBatchData,
      });

      // Add executeWithSig call to multicall3 batch
      calls.push({
        target: item.ipId,
        allowFailure: true,
        value: 0n,
        callData: encodeFunctionData({
          abi: ipAccountImplAbi,
          functionName: "executeWithSig",
          args: [
            item.ipId, // to: self (for executeBatch)
            0n, // value
            executeBatchData, // data
            this.walletAddress, // signer
            calculatedDeadline, // deadline
            signature, // signature
          ],
        }),
      });
    }

    // Execute all via multicall3
    const txHash = await this.multicall3Client.aggregate3({ calls });
    const receipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
    return { txHash, receipt };
  }
  /**
   * Builds call data for transferring ERC20 tokens from wallet to IP account and approving spender.
   */
  private async buildErc20FeeCallData(
      {totalFee, ipId, spenderAddress, options}: FeeExecutionParam<ERC20Options>): Promise<IpAccountImplExecuteBatchRequest["calls"]> {
    const erc20Balance = await this.erc20Token.balanceOf(this.walletAddress);
    if (erc20Balance < totalFee) {
      throw new Error(
        `Wallet does not have enough ERC20 tokens to pay for fees. ` +
          `Required: ${getTokenAmountDisplay(totalFee)}, ` +
          `Available: ${getTokenAmountDisplay(erc20Balance)}.`,
      );
    }
    const autoApprove = options.enableAutoApprove !== false;
    // erc20 address only available in aeneid
    const allowance = await this.erc20Token.allowance(this.walletAddress, ipId);
    if (autoApprove && allowance < totalFee) {
      // Separate approve and transfer from wallet to IP account due to `msg.sender` context limitations
      await waitTx(this.rpcClient, await this.erc20Token.approve(ipId, maxUint256));
    }
    const calls: IpAccountImplExecuteBatchRequest["calls"] = [
      {
        target: this.erc20ContractAddress,
        value: 0n,
        data: this.erc20Token.transferFromEncode(this.walletAddress, ipId, totalFee).data,
      },
    ];
    const spenderAllowance = await this.erc20Token.allowance(ipId, spenderAddress);
    if (autoApprove && spenderAllowance < totalFee) {
      calls.push({
        target: this.erc20ContractAddress,
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
    {totalFee, ipId, spenderAddress, options, wipBalance}: FeeExecutionParam<WipOptions>,
  ): Promise<{ calls: IpAccountImplExecuteBatchRequest["calls"]; value: bigint }> {
    const calls: IpAccountImplExecuteBatchRequest["calls"] = [];
    const autoApprove = options.enableAutoApprove !== false;
    const autoWrapIp = options.enableAutoWrapIp !== false;
    const ipBalance = await this.rpcClient.getBalance({ address: this.walletAddress });
    if (!autoWrapIp) {
      throw new Error(
        `Wallet does not have enough WIP to pay for fees. Total fees: ${getTokenAmountDisplay(
          totalFee,
          //TODO: need to consider how to handle undefined wipBalance
        )}, balance: ${getTokenAmountDisplay(wipBalance??0n, "WIP")}.`,
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
    const allowance = await this.wipToken.allowance(ipId, spenderAddress);
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
    {totalFee, ipId, spenderAddress, options}: FeeExecutionParam<WipOptions>,
  ): Promise<IpAccountImplExecuteBatchRequest["calls"]> {
    const autoApprove = options.enableAutoApprove !== false;
    const allowance = await this.wipToken.allowance(this.walletAddress, ipId);
    if (autoApprove && allowance < totalFee) {
      // Separate approve and transfer from wallet to IP account due to `msg.sender` context limitations
      await waitTx(this.rpcClient, await this.wipToken.approve(ipId, maxUint256));
    }

    const calls: IpAccountImplExecuteBatchRequest["calls"] = [
      {
        target: WIP_TOKEN_ADDRESS,
        value: 0n,
        data: this.wipToken.transferFromEncode(this.walletAddress, ipId, totalFee).data,
      },
    ];
    const spenderAllowance = await this.wipToken.allowance(ipId, spenderAddress);
    if (autoApprove && spenderAllowance < totalFee) {
      calls.push({
        target: WIP_TOKEN_ADDRESS,
        value: 0n,
        data: this.wipToken.approveEncode(spenderAddress, maxUint256).data,
      });
    }
    return calls;
  }

  private get erc20ContractAddress(): Address {
    return erc20Address[aeneid.id];
  }

}
