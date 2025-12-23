import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { SinonStub, stub } from "sinon";
import { encodeFunctionData, PublicClient, WalletClient } from "viem";

import { EncodedTxData, erc20Address, ipAccountImplAbi } from "../../../src/abi/generated";
import { WIP_TOKEN_ADDRESS } from "../../../src/constants/common";
import { aeneid } from "../../../src/utils/chain";
import { IpAccountBatchExecutor } from "../../../src/utils/ipAccountBatchExecutor";
import { ERC20Client, WipTokenClient } from "../../../src/utils/token";
import { mockAddress } from "../mockData";
import { createMockPublicClient, createMockWalletClient } from "../testUtils";

use(chaiAsPromised);

describe("IpAccountBatchExecutor", () => {
  const spenderAddress = mockAddress;
  let ipAccountBatchExecutor: IpAccountBatchExecutor;
  let wallet: WalletClient;
  let rpcClient: PublicClient;
  let walletBalance: SinonStub;
  const erc20Contract = erc20Address[aeneid.id];
  const encodedTxs: EncodedTxData = {
    data: encodeFunctionData({
      abi: ipAccountImplAbi,
      functionName: "executeBatch",
      args: [[], 0],
    }),
    to: mockAddress,
  };
  beforeEach(() => {
    walletBalance = stub().resolves(100);
    rpcClient = createMockPublicClient();
    rpcClient.getBalance = walletBalance;
    wallet = createMockWalletClient();
    ipAccountBatchExecutor = new IpAccountBatchExecutor(rpcClient, wallet, mockAddress);
  });

  describe("validation errors", () => {
    it("should throw error when wallet does not have enough ERC20 tokens to pay for fees", async () => {
      const mintFees = [{ token: erc20Contract, address: mockAddress, amount: 100n }];
      stub(ERC20Client.prototype, "balanceOf").resolves(0n);
      await expect(
        ipAccountBatchExecutor.executeWithFees({
          mintFees,
          spenderAddress,
          encodedTxs,
        }),
      ).to.be.rejectedWith(
        "Wallet does not have enough ERC20 tokens to pay for fees. Required: 0.0000000000000001IP, Available: 0IP.",
      );
    });
    it("should throw error when wallet does not have enough IP tokens to wrap to WIP and pay for fees", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, address: mockAddress, amount: 1000n }];
      await expect(
        ipAccountBatchExecutor.executeWithFees({ mintFees, spenderAddress, encodedTxs }),
      ).to.be.rejectedWith(
        `Wallet does not have enough IP tokens to wrap to WIP and pay for fees. Required: 0.000000000000001IP, Available: 0.0000000000000001IP.`,
      );
    });
    it("should throw error when wip token balance is insufficient and enableAutoWrapIp is false", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, address: mockAddress, amount: 100n }];
      stub(WipTokenClient.prototype, "balanceOf").resolves(0n);
      await expect(
        ipAccountBatchExecutor.executeWithFees({
          mintFees,
          spenderAddress,
          encodedTxs,
          options: { wipOptions: { enableAutoWrapIp: false } },
        }),
      ).to.be.rejectedWith(
        "Wallet does not have enough WIP to pay for fees. Total fees: 0.0000000000000001IP, balance: 0WIP.",
      );
    });
  });
});
