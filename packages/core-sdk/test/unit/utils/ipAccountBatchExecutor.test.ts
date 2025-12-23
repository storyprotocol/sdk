import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { SinonStub, stub } from "sinon";
import { encodeFunctionData, PublicClient, TransactionReceipt, WalletClient } from "viem";

import {
  EncodedTxData,
  erc20Address,
  ipAccountImplAbi,
  IpAccountImplExecuteBatchRequest,
} from "../../../src/abi/generated";
import { WIP_TOKEN_ADDRESS } from "../../../src/constants/common";
import { Fee } from "../../../src/types/utils/token";
import { aeneid } from "../../../src/utils/chain";
import * as contractUtils from "../../../src/utils/contract";
import { IpAccountBatchExecutor } from "../../../src/utils/ipAccountBatchExecutor";
import { ERC20Client, WipTokenClient } from "../../../src/utils/token";
import { mockAddress, txHash } from "../mockData";
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

  const setupErc20Stubs = (balance: bigint, allowance: bigint): { approveMock: SinonStub } => {
    stub(ERC20Client.prototype, "balanceOf").resolves(balance);
    stub(ERC20Client.prototype, "allowance").resolves(allowance);
    return {
      approveMock: stub(ERC20Client.prototype, "approve").resolves("0x1"),
    };
  };

  const setupWipStubs = (
    balance: bigint,
    allowance: bigint | bigint[],
  ): { approveMock: SinonStub } => {
    stub(WipTokenClient.prototype, "balanceOf").resolves(balance);
    const allowanceStub = stub(WipTokenClient.prototype, "allowance");
    if (Array.isArray(allowance)) {
      allowance.forEach((value, index) => {
        if (index === 0) {
          allowanceStub.onFirstCall().resolves(value);
        } else if (index === 1) {
          allowanceStub.onSecondCall().resolves(value);
        }
      });
    } else {
      allowanceStub.resolves(allowance);
    }
    return {
      approveMock: stub(WipTokenClient.prototype, "approve").resolves("0x1"),
    };
  };

  const setupExecuteBatchTransaction = (): SinonStub =>
    stub(contractUtils, "simulateAndWriteContract").resolves({
      txHash: txHash,
      receipt: { status: "success" } as unknown as TransactionReceipt,
    });

  const getCallData = (simulateStub: SinonStub): IpAccountImplExecuteBatchRequest["calls"] =>
    (simulateStub.args[0] as [{ data: { args: [IpAccountImplExecuteBatchRequest["calls"]] } }])[0]
      .data.args[0];

  const expectCallCount = (
    callData: IpAccountImplExecuteBatchRequest["calls"],
    expectedCount: number,
  ): void => {
    expect(callData.length).equals(expectedCount);
  };

  describe("validation errors", () => {
    it("should reject when wallet ERC20 balance is insufficient for fees", async () => {
      const mintFees = [{ token: erc20Contract, amount: 100n }];
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

    it("should reject when wallet IP balance is insufficient to wrap into WIP for fees", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, amount: 1000n }];

      await expect(
        ipAccountBatchExecutor.executeWithFees({ mintFees, spenderAddress, encodedTxs }),
      ).to.be.rejectedWith(
        "Wallet does not have enough IP tokens to wrap to WIP and pay for fees. Required: 0.000000000000001IP, Available: 0.0000000000000001IP.",
      );
    });

    it("should reject when WIP balance is insufficient and auto-wrapping is disabled", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, amount: 100n }];
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
  describe("ERC20 token fee handling", () => {
    it("should execute batch with transfer, approve, and transaction calls when ERC20 balance is sufficient", async () => {
      const mintFees = [{ token: erc20Contract, amount: 100n }];
      const { approveMock } = setupErc20Stubs(100n, 10n);
      const simulateStub = setupExecuteBatchTransaction();

      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });

      expect(simulateStub.calledOnce).equals(true);
      const callData = getCallData(simulateStub);
      expectCallCount(callData, 3); // transfer, approve, transaction
      expect(callData[0].target).equals(erc20Contract);
      expect(approveMock.callCount).equals(1);
      expect(result.txHash).equals(txHash);
    });

    it("should skip approval and transfer calls when auto-approve is disabled", async () => {
      const mintFees = [{ token: erc20Contract, amount: 100n }];
      const { approveMock } = setupErc20Stubs(100n, 10n);
      const simulateStub = setupExecuteBatchTransaction();

      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
        options: { erc20Options: { enableAutoApprove: false } },
      });

      expect(simulateStub.calledOnce).equals(true);
      const callData = getCallData(simulateStub);
      expectCallCount(callData, 1); // transaction only
      expect(approveMock.calledOnce).equals(false);
      expect(result.txHash).equals(txHash);
    });

    it("should skip fee handling and only execute transaction when fee amount is zero", async () => {
      const mintFees = [{ token: erc20Contract, amount: 0n }];
      const { approveMock } = setupErc20Stubs(100n, 10n);
      const simulateStub = setupExecuteBatchTransaction();

      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });

      const callData = getCallData(simulateStub);
      expectCallCount(callData, 1); // transaction only
      expect(approveMock.callCount).equals(0);
      expect(result.txHash).equals(txHash);
    });
  });

  describe("WIP token fee handling", () => {
    it("should execute batch with approve, transfer, and transaction calls when WIP balance is sufficient but allowances are insufficient", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, amount: 100n }];
      const { approveMock } = setupWipStubs(100n, 10n);
      const simulateStub = setupExecuteBatchTransaction();

      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });

      expect(simulateStub.calledOnce).equals(true);
      const callData = getCallData(simulateStub);
      expectCallCount(callData, 3); // approve, transfer, transaction
      expect(callData[0].target).equals(WIP_TOKEN_ADDRESS);
      expect(callData[0].value).equals(0n);
      expect(approveMock.callCount).equals(1);
      expect(result.txHash).equals(txHash);
    });

    it("should execute batch with approve, transfer, and transaction calls when WIP balance and IP account allowance are sufficient but spender allowance is insufficient", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, amount: 100n }];
      const { approveMock } = setupWipStubs(100n, [100n, 0n]);
      const simulateStub = setupExecuteBatchTransaction();

      await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
        options: { wipOptions: { enableAutoApprove: true } },
      });

      const callData = getCallData(simulateStub);
      expect(approveMock.callCount).equals(0);
      expectCallCount(callData, 3); // approve, transfer, transaction
    });

    it("should execute batch with only transfer and transaction calls when WIP balance and both allowances are sufficient", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, amount: 100n }];
      const { approveMock } = setupWipStubs(100n, 100n);
      const simulateStub = setupExecuteBatchTransaction();

      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
        options: { wipOptions: { enableAutoApprove: true } },
      });

      expect(simulateStub.calledOnce).equals(true);
      const callData = getCallData(simulateStub);
      expectCallCount(callData, 2); // transfer, transaction
      expect(approveMock.callCount).equals(0);
      expect(result.txHash).equals(txHash);
    });

    it("should skip approval and transfer calls when auto-approve is disabled", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, amount: 100n }];
      const { approveMock } = setupWipStubs(100n, 10n);
      const simulateStub = setupExecuteBatchTransaction();

      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
        options: { wipOptions: { enableAutoApprove: false } },
      });

      expect(simulateStub.calledOnce).equals(true);
      const callData = getCallData(simulateStub);
      expectCallCount(callData, 1); // transaction only
      expect(approveMock.callCount).equals(0);
      expect(result.txHash).equals(txHash);
    });

    it("should auto-wrap IP tokens to WIP via deposit when WIP balance is insufficient but allowances are sufficient", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, amount: 100n }];
      const { approveMock } = setupWipStubs(0n, 100n);
      const simulateStub = setupExecuteBatchTransaction();

      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
        options: { wipOptions: { enableAutoWrapIp: true } },
      });

      expect(simulateStub.calledOnce).equals(true);
      const callData = getCallData(simulateStub);
      expectCallCount(callData, 2); // deposit, transaction
      expect(callData[0].value).equals(100n);
      expect(approveMock.callCount).equals(0);
      expect(result.txHash).equals(txHash);
    });

    it("should auto-wrap IP and add approve call when WIP balance is insufficient, wallet-to-IP-account allowance is insufficient, but spender allowance is sufficient", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, amount: 100n }];
      const { approveMock } = setupWipStubs(0n, [10n, 100n]);
      const simulateStub = setupExecuteBatchTransaction();

      await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });

      const callData = getCallData(simulateStub);
      expectCallCount(callData, 3); // deposit, approve, transaction
      expect(approveMock.callCount).equals(0);
    });

    it("should auto-wrap IP without approve call when WIP balance is insufficient, wallet-to-IP-account allowance is sufficient, but spender allowance is insufficient", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, amount: 100n }];
      const { approveMock } = setupWipStubs(0n, [100n, 0n]);
      const simulateStub = setupExecuteBatchTransaction();

      await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });

      const callData = getCallData(simulateStub);
      expectCallCount(callData, 2); // deposit, transaction
      expect(approveMock.callCount).equals(0);
    });

    it("should skip fee handling and only execute transaction when fee amount is zero", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, amount: 0n }];
      const { approveMock } = setupWipStubs(100n, 100n);
      const simulateStub = setupExecuteBatchTransaction();

      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });

      expect(simulateStub.calledOnce).equals(true);
      const callData = getCallData(simulateStub);
      expectCallCount(callData, 1); // transaction only
      expect(approveMock.callCount).equals(0);
      expect(result.txHash).equals(txHash);
    });

    it("should call multiple times when wip balance is sufficient and useMulticallWhenPossible is false and allowances are insufficient", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, amount: 100n }];
      const { approveMock } = setupWipStubs(100n, [10n, 10n]);
      const simulateStub = setupExecuteBatchTransaction();

      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
        options: { wipOptions: { useMulticallWhenPossible: false } },
      });

      expect(simulateStub.calledTwice).equals(true);
      const callData = getCallData(simulateStub);
      expectCallCount(callData, 2); // deposit, transaction
      expect(approveMock.callCount).equals(0);
      expect(result.txHash).equals(txHash);
    });
  });
  describe("Combined ERC20 and WIP token fee handling", () => {
    const setupCombinedStubs = (
      erc20Balance: bigint,
      wipBalance: bigint,
      erc20Allowance: bigint,
      wipAllowance: bigint | bigint[],
    ): { approveErc20Mock: SinonStub; approveWipMock: SinonStub } => {
      const { approveMock: approveErc20Mock } = setupErc20Stubs(erc20Balance, erc20Allowance);
      const { approveMock: approveWipMock } = setupWipStubs(wipBalance, wipAllowance);
      return { approveErc20Mock, approveWipMock };
    };

    it("should execute batch with all ERC20 and WIP fee calls when both token balances are sufficient and allowances are sufficient", async () => {
      const mintFees = [
        { token: erc20Contract, amount: 100n },
        { token: WIP_TOKEN_ADDRESS, amount: 100n },
      ];
      const { approveErc20Mock, approveWipMock } = setupCombinedStubs(100n, 100n, 10n, 10n);
      const simulateStub = setupExecuteBatchTransaction();

      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });

      expect(simulateStub.calledOnce).equals(true);
      const callData = getCallData(simulateStub);
      // erc20: transfer, approve
      // wip: approve, transfer
      // transaction
      expectCallCount(callData, 5);
      expect(callData[0].target).equals(erc20Contract);
      expect(callData[1].target).equals(erc20Contract);
      expect(callData[2].target).equals(WIP_TOKEN_ADDRESS);
      expect(callData[3].target).equals(WIP_TOKEN_ADDRESS);
      expect(callData[4].target).equals(mockAddress);
      expect(approveErc20Mock.callCount).equals(1);
      expect(approveWipMock.callCount).equals(1);
      expect(result.txHash).equals(txHash);
    });

    it("should reject when ERC20 balance is insufficient even if WIP balance is sufficient", async () => {
      const mintFees = [
        { token: erc20Contract, amount: 100n },
        { token: WIP_TOKEN_ADDRESS, amount: 100n },
      ];
      setupCombinedStubs(0n, 100n, 10n, 10n);

      await expect(
        ipAccountBatchExecutor.executeWithFees({ mintFees, spenderAddress, encodedTxs }),
      ).to.be.rejectedWith(
        "Wallet does not have enough ERC20 tokens to pay for fees. Required: 0.0000000000000001IP, Available: 0IP.",
      );
    });

    it("should reject when ERC20 balance is sufficient but IP balance is insufficient to wrap into WIP", async () => {
      const mintFees = [
        { token: erc20Contract, amount: 100n },
        { token: WIP_TOKEN_ADDRESS, amount: 101n },
      ];
      setupCombinedStubs(100n, 0n, 10n, 10n);

      await expect(
        ipAccountBatchExecutor.executeWithFees({ mintFees, spenderAddress, encodedTxs }),
      ).to.be.rejectedWith(
        "Wallet does not have enough IP tokens to wrap to WIP and pay for fees. Required: 0.000000000000000101IP, Available: 0.0000000000000001IP",
      );
    });

    it("should auto-wrap IP to WIP and handle ERC20 fees when ERC20 balance is sufficient but WIP balance is insufficient", async () => {
      const mintFees = [
        { token: WIP_TOKEN_ADDRESS, amount: 100n },
        { token: erc20Contract, amount: 100n },
      ];
      const { approveErc20Mock, approveWipMock } = setupCombinedStubs(100n, 10n, 10n, 10n);
      const simulateStub = setupExecuteBatchTransaction();

      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });

      expect(result.txHash).equals(txHash);
      const callData = getCallData(simulateStub);
      // erc20: transfer, approve
      // wip: deposit, approve
      // transaction
      expectCallCount(callData, 5);
      expect(callData[0].target).equals(erc20Contract);
      expect(callData[1].target).equals(erc20Contract);
      expect(callData[2].target).equals(WIP_TOKEN_ADDRESS);
      expect(callData[2].value).equals(100n);
      expect(callData[3].target).equals(WIP_TOKEN_ADDRESS);
      expect(callData[4].target).equals(mockAddress);
      expect(approveErc20Mock.calledOnce).equals(true);
      expect(approveWipMock.calledOnce).equals(false);
      expect(result.txHash).equals(txHash);
    });

    it("should auto-wrap IP to WIP and handle ERC20 fees when ERC20 balance is insufficient but WIP balance is insufficient and allowances are sufficient", async () => {
      const mintFees = [
        { token: WIP_TOKEN_ADDRESS, amount: 100n },
        { token: erc20Contract, amount: 100n },
      ];
      const { approveErc20Mock, approveWipMock } = setupCombinedStubs(101n, 10n, 100n, 100n);
      const simulateStub = setupExecuteBatchTransaction();

      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });

      expect(result.txHash).equals(txHash);
      const callData = getCallData(simulateStub);
      // erc20: transfer
      // wip: deposit
      // transaction
      expectCallCount(callData, 3);
      expect(callData[0].target).equals(erc20Contract);
      expect(callData[1].target).equals(WIP_TOKEN_ADDRESS);
      expect(callData[2].target).equals(mockAddress);
      expect(approveErc20Mock.callCount).equals(0);
      expect(approveWipMock.callCount).equals(0);
      expect(result.txHash).equals(txHash);
    });

    it("should success when erc20 fees amount is zero and WIP balance is sufficient and ip id allowances are sufficient", async () => {
      const mintFees = [
        { token: WIP_TOKEN_ADDRESS, amount: 100n },
        { token: erc20Contract, amount: 0n },
      ];
      const { approveErc20Mock, approveWipMock } = setupCombinedStubs(0n, 100n, 100n, [100n, 0n]);
      const simulateStub = setupExecuteBatchTransaction();

      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });

      const callData = getCallData(simulateStub);
      // wip: approve, transfer
      // transaction
      expectCallCount(callData, 3);
      expect(callData[0].target).equals(WIP_TOKEN_ADDRESS);
      expect(callData[2].target).equals(mockAddress);
      expect(approveWipMock.callCount).equals(0);
      expect(approveErc20Mock.callCount).equals(0);
      expect(result.txHash).equals(txHash);
    });

    it("should success when erc20 fees amount is zero and WIP balance is insufficient and spender allowances are insufficient", async () => {
      const mintFees = [
        { token: WIP_TOKEN_ADDRESS, amount: 100n },
        { token: erc20Contract, amount: 0n },
      ];
      const { approveErc20Mock, approveWipMock } = setupCombinedStubs(0n, 10n, 10n, [100n, 0n]);
      const simulateStub = setupExecuteBatchTransaction();

      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });

      expect(result.txHash).equals(txHash);
      const callData = getCallData(simulateStub);
      // wip: deposit
      // transaction
      expectCallCount(callData, 2);
      expect(callData[0].target).equals(WIP_TOKEN_ADDRESS);
      expect(callData[1].target).equals(mockAddress);
      expect(approveWipMock.callCount).equals(0);
      expect(approveErc20Mock.callCount).equals(0);
      expect(result.txHash).equals(txHash);
    });

    it("should success when erc20 and WIP fees amount are zero", async () => {
      const mintFees = [
        { token: WIP_TOKEN_ADDRESS, amount: 0n },
        { token: erc20Contract, amount: 0n },
      ];
      const simulateStub = setupExecuteBatchTransaction();

      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });

      expect(result.txHash).equals(txHash);
      const callData = getCallData(simulateStub);
      expectCallCount(callData, 1); // transaction only
      expect(callData[0].target).equals(mockAddress);
      expect(result.txHash).equals(txHash);
    });
  });
});
