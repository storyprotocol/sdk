import type { PublicClient, WalletClient } from "viem";
import { createPublicClient, createWalletClient, getAddress } from "viem";

import { StoryConfig } from "../../src";
import { handleError } from "../../src/utils/errors";
import { chainStringToViemChain, parseToBigInt, waitTxAndFilterLog } from "../../src/utils/utils";
import {
  MockERC20Config,
  MockERC721Config,
  MockTokenGatedHookConfig,
} from "../integration/testABI";
import type {
  MintMockERC20Request,
  ApproveMockERC20Request,
  AllowanceMockERC20Request,
  MintMockERC721Request,
  BalanceOfMockERC20Request,
  BalanceOfMockERC20Response,
} from "./types";

export class MockAssetClient {
  private readonly wallet: WalletClient;
  private readonly rpcClient: PublicClient;
  private erc20DecimalsCached: bigint | undefined;
  public mockERC20Config = MockERC20Config;
  public mockERC721Config = MockERC721Config;
  public mockTokenGatedHookConfig = MockTokenGatedHookConfig;

  constructor(config: StoryConfig) {
    const clientConfig = {
      chain: chainStringToViemChain(config.chainId || "sepolia"),
      transport: config.transport,
    };

    this.wallet = createWalletClient({
      ...clientConfig,
      account: config.account,
    });
    this.rpcClient = createPublicClient(clientConfig);
  }

  public async erc20BalanceOf(
    request: BalanceOfMockERC20Request,
  ): Promise<BalanceOfMockERC20Response> {
    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...this.mockERC20Config,
        functionName: "balanceOf",
        args: [getAddress(request.owner)],
        account: this.wallet.account,
      });

      const amountRaw = (await this.rpcClient.readContract(call)) as bigint;
      const _amount = request.convertToDisplay
        ? await this.convertSolidityToDisplayValue(amountRaw)
        : amountRaw;
      return _amount as BalanceOfMockERC20Response;
    } catch (error) {
      handleError(error, "Failed to read balance from mock erc20");
    }
  }

  public async erc20Decimals(): Promise<bigint> {
    try {
      if (this.erc20DecimalsCached) return this.erc20DecimalsCached;

      const { request: readDecimalsCall } = await this.rpcClient.simulateContract({
        ...this.mockERC20Config,
        functionName: "decimals",
        args: [],
        account: this.wallet.account,
      });
      this.erc20DecimalsCached = (await this.rpcClient.readContract(readDecimalsCall)) as bigint;
      return this.erc20DecimalsCached;
    } catch (error) {
      handleError(error, "Failed to read decimals from mock erc20");
    }
  }

  public async erc20Mint(request: MintMockERC20Request): Promise<{ txHash: string }> {
    try {
      const decimalAdjAmount = await this.convertDisplayToSolidityValue(request.amount);

      const { request: call } = await this.rpcClient.simulateContract({
        ...this.mockERC20Config,
        functionName: "mint",
        args: [getAddress(request.to), decimalAdjAmount],
        account: this.wallet.account,
      });

      const txHash = await this.wallet.writeContract(call);
      return { txHash };
    } catch (error) {
      handleError(error, "Failed to mint mock erc20");
    }
  }

  public async erc20Approve(request: ApproveMockERC20Request): Promise<{ txHash: string }> {
    try {
      const decimalAdjAmount = await this.convertDisplayToSolidityValue(request.amount);

      const { request: call } = await this.rpcClient.simulateContract({
        ...this.mockERC20Config,
        functionName: "approve",
        args: [getAddress(request.spender), decimalAdjAmount],
        account: this.wallet.account,
      });

      const txHash = await this.wallet.writeContract(call);
      return { txHash };
    } catch (error) {
      handleError(error, "Failed to approve mock erc20");
    }
  }

  public async erc20Allowance(request: AllowanceMockERC20Request): Promise<bigint> {
    try {
      const { request: call } = await this.rpcClient.simulateContract({
        ...this.mockERC20Config,
        functionName: "allowance",
        args: [getAddress(request.owner), getAddress(request.spender)],
        account: this.wallet.account,
      });

      return (await this.rpcClient.readContract(call)) as bigint;
    } catch (error) {
      handleError(error, "Failed to get allowance from mock erc20");
    }
  }

  public async erc721Mint(
    request: MintMockERC721Request,
  ): Promise<{ txHash: string; tokenId: bigint }> {
    try {
      const args = request.id ? [getAddress(request.to), request.id] : [getAddress(request.to)];

      const { request: call } = await this.rpcClient.simulateContract({
        ...this.mockERC721Config,
        functionName: request.id ? "mintId" : "mint",
        args,
        account: this.wallet.account,
      });

      const txHash = await this.wallet.writeContract(call);

      if (request.id) return { txHash, tokenId: request.id };

      const logs = await waitTxAndFilterLog(this.rpcClient, txHash, {
        ...this.mockERC721Config,
        eventName: "Transfer",
      });
      return {
        txHash: txHash,
        // tokenId: BigInt(logs.args.tokenId),
        tokenId: 0n, // TODO: fix this
      };
    } catch (error) {
      handleError(error, "Failed to approve mock erc20");
    }
  }

  /**
   * Converts a normal number to Solidity representation of the number, taking into account the number of decimals.
   * @param amount - The amount to convert
   * @returns The Solidity representation of the amount, ie. amount * 10^decimals
   */
  private async convertDisplayToSolidityValue(amount: string | number): Promise<bigint> {
    // Example: 1 USDC input => in Solidity, it's represented as 1_000_000 since USDC has 6 decimals
    const expo = BigInt(10) ** BigInt(await this.erc20Decimals());
    return parseToBigInt(amount) * expo;
  }

  /**
   * Converts a Solidity representation of a number to a normal number, taking into account the number of decimals.
   * @param amount - The amount to convert
   * @param precision - The precision to round the number to
   * @returns The normal representation of the amount, ie. amount / 10^decimals (with precision rounding)
   */
  private async convertSolidityToDisplayValue(amount: bigint, precision?: number): Promise<number> {
    const _precision = 10n ^ BigInt(precision ?? 2);
    const expo = BigInt(10) ** BigInt(await this.erc20Decimals());
    return Number((amount * _precision) / expo) / Number(_precision);
  }
}
