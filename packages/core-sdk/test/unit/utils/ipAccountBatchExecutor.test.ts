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
  describe("erc20", () => {
    it("should success when erc20 token balance is sufficient", async () => {
      const mintFees = [{ token: erc20Contract, address: mockAddress, amount: 100n }];
      stub(ERC20Client.prototype, "balanceOf").resolves(100n);
      const approveMock = stub(ERC20Client.prototype, "approve").resolves("0x1");
      stub(ERC20Client.prototype, "allowance").resolves(10n);
      const simulateAndWriteContractMock = stub(contractUtils, "simulateAndWriteContract").resolves(
        {
          txHash: txHash,
          receipt: {
            status: "success",
          } as unknown as TransactionReceipt,
        },
      );
      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });
      expect(simulateAndWriteContractMock.calledOnce).equals(true);
      const callData = simulateAndWriteContractMock.args[0][0].data.args![0];
      expect((callData as IpAccountImplExecuteBatchRequest["calls"]).length).equals(3); //transfer, approve, actual transaction
      expect((callData as IpAccountImplExecuteBatchRequest["calls"])[0].target).equals(
        erc20Contract,
      );
      expect(approveMock.callCount).equals(1);
      expect(result.txHash).equals(txHash);
    });

    it("should only a call to executeBatch when autoApprove is false", async () => {
      const mintFees = [{ token: erc20Contract, address: mockAddress, amount: 100n }];
      stub(ERC20Client.prototype, "balanceOf").resolves(100n);
      const approveMock = stub(ERC20Client.prototype, "approve").resolves("0x1");
      const simulateAndWriteContractMock = stub(contractUtils, "simulateAndWriteContract").resolves(
        {
          txHash: txHash,
          receipt: {
            status: "success",
          } as unknown as TransactionReceipt,
        },
      );
      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
        options: { erc20Options: { enableAutoApprove: false } },
      });
      expect(simulateAndWriteContractMock.calledOnce).equals(true);
      const callData = simulateAndWriteContractMock.args[0][0].data.args![0];
      expect((callData as IpAccountImplExecuteBatchRequest["calls"]).length).equals(1);
      expect(approveMock.calledOnce).equals(false);
      expect(result.txHash).equals(txHash);
    });

    it("should only a call to executeBatch when fee amount is 0", async () => {
      const mintFees = [{ token: erc20Contract, address: mockAddress, amount: 0n }];
      stub(ERC20Client.prototype, "balanceOf").resolves(100n);
      const approveMock = stub(ERC20Client.prototype, "approve").resolves("0x1");
      const simulateAndWriteContractMock = stub(contractUtils, "simulateAndWriteContract").resolves(
        {
          txHash: txHash,
          receipt: {
            status: "success",
          } as unknown as TransactionReceipt,
        },
      );
      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });
      const callData = simulateAndWriteContractMock.args[0][0].data.args![0];
      expect((callData as IpAccountImplExecuteBatchRequest["calls"]).length).equals(1);
      expect(approveMock.callCount).equals(0);
      expect(result.txHash).equals(txHash);
    });
  });

  describe("wip", () => {
    it("should successfully when wip token balance is sufficient", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, address: mockAddress, amount: 100n }];
      stub(WipTokenClient.prototype, "balanceOf").resolves(100n);
      stub(WipTokenClient.prototype, "allowance").resolves(10n);
      const approveMock = stub(WipTokenClient.prototype, "approve").resolves("0x1");
      const simulateAndWriteContractMock = stub(contractUtils, "simulateAndWriteContract").resolves(
        {
          txHash: txHash,
          receipt: {
            status: "success",
          } as unknown as TransactionReceipt,
        },
      );
      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });
      expect(simulateAndWriteContractMock.calledOnce).equals(true);
      const callData = simulateAndWriteContractMock.args[0][0].data.args![0];
      expect((callData as IpAccountImplExecuteBatchRequest["calls"]).length).equals(3); // approve, transfer, actual transaction
      expect((callData as IpAccountImplExecuteBatchRequest["calls"])[0].target).equals(
        WIP_TOKEN_ADDRESS,
      );
      expect((callData as IpAccountImplExecuteBatchRequest["calls"])[0].value).equals(0n);
      expect(approveMock.callCount).equals(1);
      expect(result.txHash).equals(txHash);
    });

    it("should success when wip token balance is sufficient and ip id allowance is sufficient", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, address: mockAddress, amount: 100n }];
      stub(WipTokenClient.prototype, "balanceOf").resolves(100n);
      stub(WipTokenClient.prototype, "allowance")
        .onFirstCall()
        .resolves(100n)
        .onSecondCall()
        .resolves(0n);
      const approveMock = stub(WipTokenClient.prototype, "approve").resolves("0x1");
      const simulateAndWriteContractMock = stub(contractUtils, "simulateAndWriteContract").resolves(
        {
          txHash: txHash,
          receipt: {
            status: "success",
          } as unknown as TransactionReceipt,
        },
      );
      await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
        options: { wipOptions: { enableAutoApprove: true } },
      });
      const callData = simulateAndWriteContractMock.args[0][0].data.args![0];
      expect(approveMock.callCount).equals(0);
      expect((callData as IpAccountImplExecuteBatchRequest["calls"]).length).equals(3); //approve, transfer, actual transaction
    });

    it("should when wip token balance is sufficient and both allowance are sufficient", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, address: mockAddress, amount: 100n }];
      stub(WipTokenClient.prototype, "balanceOf").resolves(100n);
      stub(WipTokenClient.prototype, "allowance").resolves(100n);
      const approveMock = stub(WipTokenClient.prototype, "approve").resolves("0x1");
      const simulateAndWriteContractMock = stub(contractUtils, "simulateAndWriteContract").resolves(
        {
          txHash: txHash,
          receipt: {
            status: "success",
          } as unknown as TransactionReceipt,
        },
      );
      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
        options: { wipOptions: { enableAutoApprove: true } },
      });
      expect(simulateAndWriteContractMock.calledOnce).equals(true);
      const callData = simulateAndWriteContractMock.args[0][0].data.args![0];
      expect((callData as IpAccountImplExecuteBatchRequest["calls"]).length).equals(2); // transfer, actual transaction
      expect(approveMock.callCount).equals(0);
      expect(result.txHash).equals(txHash);
    });
    it("should only a call to executeBatch when autoApprove is false", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, address: mockAddress, amount: 100n }];
      stub(WipTokenClient.prototype, "balanceOf").resolves(100n);
      stub(WipTokenClient.prototype, "allowance").resolves(10n);
      const approveMock = stub(WipTokenClient.prototype, "approve").resolves("0x1");
      const simulateAndWriteContractMock = stub(contractUtils, "simulateAndWriteContract").resolves(
        {
          txHash: txHash,
          receipt: {
            status: "success",
          } as unknown as TransactionReceipt,
        },
      );
      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
        options: { wipOptions: { enableAutoApprove: false } },
      });
      expect(simulateAndWriteContractMock.calledOnce).equals(true);
      const callData = simulateAndWriteContractMock.args[0][0].data.args![0];
      expect((callData as IpAccountImplExecuteBatchRequest["calls"]).length).equals(1); // actual transaction
      expect(approveMock.callCount).equals(0);
      expect(result.txHash).equals(txHash);
    });
    it("should success when wip token balance is insufficient and both allowance are sufficient", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, address: mockAddress, amount: 100n }];
      stub(WipTokenClient.prototype, "balanceOf").resolves(0n);
      stub(WipTokenClient.prototype, "allowance").resolves(100n);
      const approveMock = stub(WipTokenClient.prototype, "approve").resolves("0x1");
      const simulateAndWriteContractMock = stub(contractUtils, "simulateAndWriteContract").resolves(
        {
          txHash: txHash,
          receipt: {
            status: "success",
          } as unknown as TransactionReceipt,
        },
      );
      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
        options: { wipOptions: { enableAutoWrapIp: true } },
      });
      expect(simulateAndWriteContractMock.calledOnce).equals(true);
      const callData = simulateAndWriteContractMock.args[0][0].data.args![0];
      expect((callData as IpAccountImplExecuteBatchRequest["calls"]).length).equals(2); // deposit, actual transaction
      expect((callData as IpAccountImplExecuteBatchRequest["calls"])[0].value).equals(100n);
      expect(approveMock.callCount).equals(0);
      expect(result.txHash).equals(txHash);
    });
    it("should success when allowance and wip token balance are insufficient and first allowance is sufficient", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, address: mockAddress, amount: 100n }];
      stub(WipTokenClient.prototype, "balanceOf").resolves(0n);
      stub(WipTokenClient.prototype, "allowance")
        .onFirstCall()
        .resolves(10n)
        .onSecondCall()
        .resolves(100n);
      const approveMock = stub(WipTokenClient.prototype, "approve").resolves("0x1");
      const simulateAndWriteContractMock = stub(contractUtils, "simulateAndWriteContract").resolves(
        {
          txHash: txHash,
          receipt: {
            status: "success",
          } as unknown as TransactionReceipt,
        },
      );
      await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });
      const callData = simulateAndWriteContractMock.args[0][0].data.args![0];
      expect((callData as IpAccountImplExecuteBatchRequest["calls"]).length).equals(3); // deposit, approve, actual transaction
      expect(approveMock.callCount).equals(0);
    });
    it("should success when allowance and wip token balance are insufficient and  ip id allowance is sufficient and spender allowance is insufficient", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, address: mockAddress, amount: 100n }];
      stub(WipTokenClient.prototype, "balanceOf").resolves(0n);
      stub(WipTokenClient.prototype, "allowance")
        .onFirstCall()
        .resolves(100n)
        .onSecondCall()
        .resolves(0n);
      const approveMock = stub(WipTokenClient.prototype, "approve").resolves("0x1");
      const simulateAndWriteContractMock = stub(contractUtils, "simulateAndWriteContract").resolves(
        {
          txHash: txHash,
          receipt: {
            status: "success",
          } as unknown as TransactionReceipt,
        },
      );
      await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });
      const callData = simulateAndWriteContractMock.args[0][0].data.args![0];
      expect((callData as IpAccountImplExecuteBatchRequest["calls"]).length).equals(2); // deposit, actual transaction
      expect(approveMock.callCount).equals(0);
    });

    it("should success when fee amount is 0", async () => {
      const mintFees = [{ token: WIP_TOKEN_ADDRESS, address: mockAddress, amount: 0n }];
      stub(WipTokenClient.prototype, "balanceOf").resolves(100n);
      stub(WipTokenClient.prototype, "allowance").resolves(100n);
      const approveMock = stub(WipTokenClient.prototype, "approve").resolves("0x1");
      const simulateAndWriteContractMock = stub(contractUtils, "simulateAndWriteContract").resolves(
        {
          txHash: txHash,
          receipt: {
            status: "success",
          } as unknown as TransactionReceipt,
        },
      );
      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });
      expect(simulateAndWriteContractMock.calledOnce).equals(true);
      const callData = simulateAndWriteContractMock.args[0][0].data.args![0];
      expect((callData as IpAccountImplExecuteBatchRequest["calls"]).length).equals(1); // actual transaction
      expect(approveMock.callCount).equals(0);
      expect(result.txHash).equals(txHash);
    });
  });
  describe("erc20 and wip", () => {
    it("should successfully execute with fees when erc20 token balance is sufficient and wip token balance is sufficient", async () => {
      const mintFees = [
        { token: erc20Contract, address: mockAddress, amount: 100n },
        { token: WIP_TOKEN_ADDRESS, address: mockAddress, amount: 100n },
      ];
      stub(ERC20Client.prototype, "balanceOf").resolves(100n);
      stub(WipTokenClient.prototype, "balanceOf").resolves(100n);
      const approveErc20Mock = stub(ERC20Client.prototype, "approve").resolves("0x1");
      const approveWipMock = stub(WipTokenClient.prototype, "approve").resolves("0x1");
      const simulateAndWriteContractMock = stub(contractUtils, "simulateAndWriteContract").resolves(
        {
          txHash: txHash,
          receipt: {
            status: "success",
          } as unknown as TransactionReceipt,
        },
      );
      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });
      expect(simulateAndWriteContractMock.calledOnce).equals(true);
      const callData = simulateAndWriteContractMock.args[0][0].data.args![0];
      expect((callData as IpAccountImplExecuteBatchRequest["calls"]).length).equals(5);
      expect((callData as IpAccountImplExecuteBatchRequest["calls"])[0].target).equals(
        erc20Contract,
      );
      expect((callData as IpAccountImplExecuteBatchRequest["calls"])[1].target).equals(
        erc20Contract,
      );
      expect((callData as IpAccountImplExecuteBatchRequest["calls"])[2].target).equals(
        WIP_TOKEN_ADDRESS,
      );
      expect((callData as IpAccountImplExecuteBatchRequest["calls"])[3].target).equals(
        WIP_TOKEN_ADDRESS,
      );
      expect((callData as IpAccountImplExecuteBatchRequest["calls"])[4].target).equals(mockAddress);
      expect(approveErc20Mock.calledOnce).equals(true);
      expect(approveWipMock.calledOnce).equals(true);
      expect(result.txHash).equals(txHash);
    });

    it("should throw error when erc20 token balance is insufficient and wip token balance is sufficient", async () => {
      const mintFees = [
        { token: erc20Contract, address: mockAddress, amount: 100n },
        { token: WIP_TOKEN_ADDRESS, address: mockAddress, amount: 100n },
      ];
      stub(ERC20Client.prototype, "balanceOf").resolves(0n);
      stub(WipTokenClient.prototype, "balanceOf").resolves(100n);
      await expect(
        ipAccountBatchExecutor.executeWithFees({ mintFees, spenderAddress, encodedTxs }),
      ).to.be.rejectedWith(
        "Wallet does not have enough ERC20 tokens to pay for fees. Required: 0.0000000000000001IP, Available: 0IP.",
      );
    });

    it("should throw error when erc20 token balance is sufficient and wip token balance is insufficient and ip balance is insufficient", async () => {
      const mintFees = [
        { token: erc20Contract, address: mockAddress, amount: 100n },
        { token: WIP_TOKEN_ADDRESS, address: mockAddress, amount: 101n },
      ];
      stub(ERC20Client.prototype, "balanceOf").resolves(100n);
      stub(WipTokenClient.prototype, "balanceOf").resolves(0n);
      await expect(
        ipAccountBatchExecutor.executeWithFees({ mintFees, spenderAddress, encodedTxs }),
      ).to.be.rejectedWith(
        "Wallet does not have enough IP tokens to wrap to WIP and pay for fees. Required: 0.000000000000000101IP, Available: 0.0000000000000001IP",
      );
    });

    it("should success when erc20 token balance is sufficient and wip token balance is insufficient", async () => {
      const mintFees = [
        { token: WIP_TOKEN_ADDRESS, address: mockAddress, amount: 100n },
        { token: erc20Contract, address: mockAddress, amount: 100n },
      ];
      stub(ERC20Client.prototype, "balanceOf").resolves(100n);
      stub(WipTokenClient.prototype, "balanceOf").resolves(10n);
      const approveErc20Mock = stub(ERC20Client.prototype, "approve").resolves("0x1");
      const approveWipMock = stub(WipTokenClient.prototype, "approve").resolves("0x1");
      const simulateAndWriteContractMock = stub(contractUtils, "simulateAndWriteContract").resolves(
        {
          txHash: txHash,
          receipt: {
            status: "success",
          } as unknown as TransactionReceipt,
        },
      );
      const result = await ipAccountBatchExecutor.executeWithFees({
        mintFees,
        spenderAddress,
        encodedTxs,
      });
      expect(result.txHash).equals(txHash);
      const callData = simulateAndWriteContractMock.args[0][0].data.args![0];
      expect((callData as IpAccountImplExecuteBatchRequest["calls"]).length).equals(5);
      expect((callData as IpAccountImplExecuteBatchRequest["calls"])[0].target).equals(
        erc20Contract,
      );
      expect((callData as IpAccountImplExecuteBatchRequest["calls"])[1].target).equals(
        erc20Contract,
      );
      expect((callData as IpAccountImplExecuteBatchRequest["calls"])[2].target).equals(
        WIP_TOKEN_ADDRESS,
      );
      expect((callData as IpAccountImplExecuteBatchRequest["calls"])[2].value).equals(100n);
      expect((callData as IpAccountImplExecuteBatchRequest["calls"])[3].target).equals(
        WIP_TOKEN_ADDRESS,
      );
      expect((callData as IpAccountImplExecuteBatchRequest["calls"])[4].target).equals(mockAddress);
      expect(approveErc20Mock.calledOnce).equals(true);
      expect(approveWipMock.calledOnce).equals(false);
      expect(result.txHash).equals(txHash);
    });

    it("should throw error when erc20 token balance is sufficient and wip token balance is insufficient and autoWrapIp is false", async () => {
      const mintFees = [
        { token: WIP_TOKEN_ADDRESS, address: mockAddress, amount: 1001n },
        { token: erc20Contract, address: mockAddress, amount: 100n },
      ];
      stub(ERC20Client.prototype, "balanceOf").resolves(100n);
      stub(WipTokenClient.prototype, "balanceOf").resolves(0n);
      const approveErc20Mock = stub(ERC20Client.prototype, "approve").resolves("0x1");
      await expect(
        ipAccountBatchExecutor.executeWithFees({
          mintFees,
          spenderAddress,
          encodedTxs,
          options: { wipOptions: { enableAutoWrapIp: false } },
        }),
      ).to.be.rejectedWith(
        "Wallet does not have enough IP tokens to wrap to WIP and pay for fees. Required: 0.000000000000001001IP, Available: 0.0000000000000001IP.",
      );
      expect(approveErc20Mock.calledOnce).equals(false);
    });
  });
});
