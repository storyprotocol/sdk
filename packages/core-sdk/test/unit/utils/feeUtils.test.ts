import chai from "chai";
import * as sinon from "sinon";
import chaiAsPromised from "chai-as-promised";
import { Address, LocalAccount, PublicClient, WalletClient, maxUint256, parseEther } from "viem";
import {
  royaltyModuleAddress,
  derivativeWorkflowsAddress,
  multicall3Address,
  erc20Address,
} from "../../../src/abi/generated";
import { createMock, generateRandomAddress, generateRandomHash } from "../testUtils";
import { aeneid, txHash } from "../mockData";
import { TEST_WALLET_ADDRESS } from "../../integration/utils/util";
import { TransactionResponse, WIP_TOKEN_ADDRESS } from "../../../src";
import { ContractCallWithFees } from "../../../src/types/utils/wip";
import { ERC20Client, WipTokenClient } from "../../../src/utils/token";
import { contractCallWithFees } from "../../../src/utils/feeUtils";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Erc20 Token Fee Utilities", () => {
  let rpcMock: PublicClient;
  let walletMock: WalletClient;
  let contractCallMock: sinon.SinonStub;
  let rpcWaitForTxMock: sinon.SinonStub;
  let walletBalanceMock: sinon.SinonStub;

  beforeEach(() => {
    rpcMock = createMock<PublicClient>();
    walletBalanceMock = sinon.stub().resolves(0);
    rpcMock.getBalance = walletBalanceMock;
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<LocalAccount>();
    walletMock.account = accountMock;
    walletMock.writeContract = sinon.stub().resolves(generateRandomHash());
    rpcWaitForTxMock = rpcMock.waitForTransactionReceipt as sinon.SinonStub;
    sinon.stub(WipTokenClient.prototype, "address").get(() => WIP_TOKEN_ADDRESS);
  });

  afterEach(() => {
    sinon.restore();
  });

  function getDefaultParams(overrides: Partial<ContractCallWithFees>): ContractCallWithFees {
    const hash = generateRandomHash();
    contractCallMock = sinon.stub().resolves(hash);
    return {
      rpcClient: rpcMock,
      wallet: walletMock,
      multicall3Address: multicall3Address[aeneid],
      totalFees: 0n,
      tokenSpenders: [],
      contractCall: contractCallMock,
      encodedTxs: [
        {
          to: generateRandomAddress(),
          data: txHash,
        },
      ],
      sender: TEST_WALLET_ADDRESS,
      options: {
        wipOptions: {},
      },
      ...overrides,
    };
  }
  describe("No Fees", () => {
    it("should call contract directly if no fees", async () => {
      const params = getDefaultParams({ totalFees: 0n });
      const txResponse = await contractCallWithFees(params);
      const { txHash } = txResponse as TransactionResponse;
      expect(contractCallMock.calledOnce).to.be.true;
      expect(rpcWaitForTxMock.notCalled).to.be.true;
      expect(txHash).not.to.be.empty;
    });

    it("should support wait for tx", async () => {
      const params = getDefaultParams({
        totalFees: 0n,
        txOptions: { waitForTransaction: true },
      });
      const txResponse = await contractCallWithFees(params);
      const { txHash } = txResponse as TransactionResponse;
      expect(contractCallMock.calledOnce).to.be.true;
      expect(rpcWaitForTxMock.calledOnce).to.be.true;
      expect(txHash).not.to.be.empty;
    });
  });

  describe("contractCallWithFees with wip", () => {
    let approveMock: sinon.SinonStub;

    beforeEach(() => {
      approveMock = sinon.stub(WipTokenClient.prototype, "approve").resolves(txHash);
    });

    describe("Enough WIP", () => {
      beforeEach(() => {
        sinon.stub(WipTokenClient.prototype, "balanceOf").resolves(200n);
      });
      it("should not call approval if disabled via enableAutoApprove", async () => {
        const params = getDefaultParams({
          totalFees: 100n,
          options: { erc20Options: { enableAutoApprove: false } },
        });
        const txResponse = await contractCallWithFees(params);
        const { txHash, receipt } = txResponse as TransactionResponse;
        expect(receipt).to.be.undefined;
        expect(contractCallMock.calledOnce).to.be.true;
        expect(rpcWaitForTxMock.notCalled).to.be.true;
        expect(approveMock.notCalled).to.be.true;
        expect(txHash).not.to.be.empty;
      });

      it("should skip approvals if all spenders have enough allowance", async () => {
        const params = getDefaultParams({
          totalFees: 100n,
          tokenSpenders: [
            {
              address: royaltyModuleAddress[aeneid],
              amount: 50n,
            },
            {
              address: derivativeWorkflowsAddress[aeneid],
              amount: 50n,
            },
          ],
          txOptions: { waitForTransaction: false },
        });
        const allowanceMock = sinon.stub(WipTokenClient.prototype, "allowance").resolves(50n);

        const txResponse = await contractCallWithFees(params);
        const { txHash, receipt } = txResponse as TransactionResponse;
        expect(receipt).to.be.undefined;
        expect(allowanceMock.calledTwice).to.be.true;
        expect(
          allowanceMock.firstCall.calledWith(TEST_WALLET_ADDRESS, params.tokenSpenders[0].address),
        ).to.be.true;

        expect(
          allowanceMock.secondCall.calledWith(TEST_WALLET_ADDRESS, params.tokenSpenders[1].address),
        ).to.be.true;
        expect(contractCallMock.calledOnce).to.be.true;
        expect(rpcWaitForTxMock.notCalled).to.be.true;
        expect(approveMock.notCalled).to.be.true;
        expect(txHash).not.to.be.empty;
      });

      it("should call separate approvals for each spender address if not enough allowance", async () => {
        const params = getDefaultParams({
          totalFees: 100n,
          tokenSpenders: [
            {
              address: royaltyModuleAddress[aeneid],
              amount: 10n,
            },
            {
              address: derivativeWorkflowsAddress[aeneid],
              amount: 90n,
            },
          ],
          txOptions: { waitForTransaction: true },
        });
        sinon.stub(WipTokenClient.prototype, "allowance").resolves(15n);
        const txResponse = await contractCallWithFees(params);
        const { txHash, receipt } = txResponse as TransactionResponse;
        expect(receipt).not.to.be.undefined;
        expect(contractCallMock.calledOnce).to.be.true;
        expect(approveMock.calledOnce).to.be.true;
        expect(approveMock.firstCall.calledWith(derivativeWorkflowsAddress[aeneid], maxUint256)).to
          .be.true;
        expect(rpcWaitForTxMock.callCount).to.equal(2); // 1 approval + 1 contract call
        expect(txHash).not.to.be.empty;
      });
    });

    describe("Enough IP, not enough WIP", () => {
      let simulateContractMock: sinon.SinonStub;
      let params: ContractCallWithFees;

      beforeEach(() => {
        sinon.stub(WipTokenClient.prototype, "balanceOf").resolves(1n);
        walletBalanceMock.resolves(1_000);
        simulateContractMock = sinon.stub().resolves({ request: {} });
        rpcMock.simulateContract = simulateContractMock;
        rpcMock;
        params = getDefaultParams({
          totalFees: 100n,
          tokenSpenders: [
            {
              address: royaltyModuleAddress[aeneid],
              amount: 20n,
            },
            {
              address: derivativeWorkflowsAddress[aeneid],
              amount: 80n,
            },
          ],
        });
        sinon.stub(WipTokenClient.prototype, "allowance").resolves(50n);
      });

      it("should error if enableAutoWrapIp is false", async () => {
        await expect(
          contractCallWithFees({
            ...params,
            options: { wipOptions: { enableAutoWrapIp: false } },
          }),
        ).to.be.rejectedWith(/^Wallet does not have enough WIP to pay for fees./);
      });

      describe("no multicall", () => {
        it("should deposit, approve, and call contract separately", async () => {
          const txResponse = await contractCallWithFees({
            ...params,
            options: { wipOptions: { useMulticallWhenPossible: false } },
          });
          const { txHash, receipt } = txResponse as TransactionResponse;
          expect(receipt).to.be.undefined;
          expect(simulateContractMock.calledOnce).to.be.true;
          expect(simulateContractMock.firstCall.args[0]).to.include({
            functionName: "deposit",
            value: 100n,
            address: WIP_TOKEN_ADDRESS,
          });
          expect(approveMock.calledOnce).to.be.true;
          expect(
            approveMock.firstCall.calledWith({
              spender: derivativeWorkflowsAddress[aeneid],
              amount: maxUint256,
            }),
          );
          expect(contractCallMock.calledOnce).to.be.true;
          expect(rpcWaitForTxMock.callCount).to.equal(2); // 1 deposit + 1 approval, no contract call
          expect(txHash).not.to.be.empty;
        });

        it("should support wait for tx", async () => {
          const txResponse = await contractCallWithFees({
            ...params,
            options: {
              wipOptions: { useMulticallWhenPossible: false },
            },
            txOptions: { waitForTransaction: true },
          });
          const { txHash, receipt } = txResponse as TransactionResponse;
          expect(receipt).not.to.be.undefined;
          expect(txHash).not.to.be.empty;
          expect(simulateContractMock.calledOnce).to.be.true;
          expect(approveMock.calledOnce).to.be.true;
          expect(contractCallMock.calledOnce).to.be.true;
          expect(rpcWaitForTxMock.callCount).to.equal(3);
        });

        it("should not call approval if enableAutoApprove is false", async () => {
          const txResponse = await contractCallWithFees({
            ...params,
            options: {
              wipOptions: { enableAutoApprove: false, useMulticallWhenPossible: false },
            },
          });
          const { txHash, receipt } = txResponse as TransactionResponse;
          expect(receipt).to.be.undefined;
          expect(txHash).not.to.be.empty;
          expect(simulateContractMock.calledOnce).to.be.true;
          expect(approveMock.notCalled).to.be.true;
          expect(contractCallMock.calledOnce).to.be.true;
          expect(rpcWaitForTxMock.callCount).to.equal(1);
        });

        it("should not call approval if spender has enough allowance", async () => {
          const txResponse = await contractCallWithFees({
            ...params,
            tokenSpenders: [
              {
                address: royaltyModuleAddress[aeneid],
                amount: 20n,
              },
              {
                address: derivativeWorkflowsAddress[aeneid],
                amount: 10n,
              },
            ],
            options: {
              wipOptions: { useMulticallWhenPossible: false },
            },
          });
          const { txHash, receipt } = txResponse as TransactionResponse;
          expect(receipt).to.be.undefined;
          expect(txHash).not.to.be.empty;
          expect(simulateContractMock.calledOnce).to.be.true;
          expect(approveMock.notCalled).to.be.true;
          expect(contractCallMock.calledOnce).to.be.true;
          expect(rpcWaitForTxMock.callCount).to.equal(1);
        });
      });

      describe("multicall", () => {
        let depositEncodeMock: sinon.SinonStub;
        let approveEncodeMock: sinon.SinonStub;

        beforeEach(() => {
          depositEncodeMock = sinon.stub(WipTokenClient.prototype, "depositEncode").returns({
            to: generateRandomAddress(),
            data: txHash,
          });
          approveEncodeMock = sinon.stub(WipTokenClient.prototype, "approveEncode").returns({
            to: generateRandomAddress(),
            data: txHash,
          });
        });

        it("should deposit, approve, and call contract in one multicall", async () => {
          const txResponse = await contractCallWithFees(params);
          const { txHash, receipt } = txResponse as TransactionResponse;
          expect(receipt).to.be.undefined;
          expect(txHash).not.to.be.empty;
          expect(depositEncodeMock.calledOnce).to.be.true;
          expect(approveEncodeMock.calledOnce).to.be.true;
          expect(simulateContractMock.calledOnce).to.be.true;
          expect(rpcWaitForTxMock.notCalled).to.be.true;
          expect(simulateContractMock.firstCall.args[0]).to.include({
            functionName: "aggregate3Value",
            value: 100n,
          });
          const calls = simulateContractMock.firstCall.args[0].args[0];
          expect(calls).to.have.length(3); // 1 deposit, 1 approve, 1 call
          expect(calls.map((c: { target: Address }) => c.target)).to.deep.eq([
            depositEncodeMock.returnValues[0].to,
            approveEncodeMock.returnValues[0].to,
            params.encodedTxs[0].to,
          ]);
        });

        it("should support wait for tx", async () => {
          const txResponse = await contractCallWithFees({
            ...params,
            txOptions: { waitForTransaction: true },
          });
          const { txHash, receipt } = txResponse as TransactionResponse;
          expect(receipt).not.to.be.undefined;
          expect(txHash).not.to.be.empty;
          expect(simulateContractMock.calledOnce).to.be.true;
          expect(rpcWaitForTxMock.calledOnce).to.be.true;
          const calls = simulateContractMock.firstCall.args[0].args[0];
          expect(calls).to.have.length(3);
        });

        it("should not include approvals if enableAutoApprove is false", async () => {
          const txResponse = await contractCallWithFees({
            ...params,
            options: {
              wipOptions: { enableAutoApprove: false },
            },
          });
          const { txHash, receipt } = txResponse as TransactionResponse;
          expect(receipt).to.be.undefined;
          expect(txHash).not.to.be.empty;
          expect(simulateContractMock.calledOnce).to.be.true;
          expect(approveEncodeMock.notCalled).to.be.true;
          expect(rpcWaitForTxMock.notCalled).to.be.true;
          const calls = simulateContractMock.firstCall.args[0].args[0];
          expect(calls).to.have.length(2); // 1 deposit, 1 call, no approves
        });

        it("should only include approves if enough allowances", async () => {
          const txResponse = await contractCallWithFees({
            ...params,
            tokenSpenders: [
              {
                address: royaltyModuleAddress[aeneid],
                amount: 20n,
              },
              {
                address: derivativeWorkflowsAddress[aeneid],
                amount: 10n,
              },
            ],
          });
          const { txHash, receipt } = txResponse as TransactionResponse;
          expect(receipt).to.be.undefined;
          expect(txHash).not.to.be.empty;
          expect(simulateContractMock.calledOnce).to.be.true;
          expect(approveEncodeMock.notCalled).to.be.true;
          expect(rpcWaitForTxMock.notCalled).to.be.true;
          const calls = simulateContractMock.firstCall.args[0].args[0];
          expect(calls).to.have.length(2); // 1 deposit, 1 call
        });
      });
    });

    describe("Not enough IP or WIP", () => {
      const totalFees = parseEther("1");

      beforeEach(() => {
        walletBalanceMock.resolves(parseEther("0.1"));
        sinon.stub(WipTokenClient.prototype, "balanceOf").resolves(0n);
      });

      it("should throw error indicating not enough wip funds to complete given token is wip", async () => {
        const params = getDefaultParams({ totalFees });
        await expect(contractCallWithFees(params)).to.be.rejectedWith(
          "Wallet does not have enough IP to wrap to WIP and pay for fees. Total fees: 1IP, balance: 0.1IP",
        );
      });
    });
  });

  describe("contractCallWithFees with erc20 token", () => {
    let approveMock: sinon.SinonStub;
    let allowanceMock: sinon.SinonStub;

    beforeEach(() => {
      approveMock = sinon.stub(ERC20Client.prototype, "approve").resolves(txHash);
      allowanceMock = sinon.stub(ERC20Client.prototype, "allowance").resolves(0n);
      sinon.stub(ERC20Client.prototype, "balanceOf").resolves(100n);
    });

    it("should not call approval if disabled via enableAutoApprove and enough erc20 token", async () => {
      const params = getDefaultParams({
        totalFees: 100n,
        token: erc20Address[aeneid],
        options: {
          erc20Options: { enableAutoApprove: false },
        },
      });
      const txResponse = await contractCallWithFees(params);
      const { txHash, receipt } = txResponse as TransactionResponse;
      expect(receipt).to.be.undefined;
      expect(contractCallMock.calledOnce).to.be.true;
      expect(rpcWaitForTxMock.notCalled).to.be.true;
      expect(approveMock.notCalled).to.be.true;
      expect(txHash).not.to.be.empty;
    });

    it("should skip approvals if all spenders have sufficient allowance and enough erc20 token", async () => {
      const params = getDefaultParams({
        totalFees: 100n,
        token: erc20Address[aeneid],
        tokenSpenders: [
          {
            address: royaltyModuleAddress[aeneid],
            amount: 50n,
          },
          {
            address: derivativeWorkflowsAddress[aeneid],
            amount: 50n,
          },
        ],
        txOptions: { waitForTransaction: false },
      });
      allowanceMock.resolves(1001n);

      const txResponse = await contractCallWithFees(params);
      const { txHash, receipt } = txResponse as TransactionResponse;
      expect(receipt).to.be.undefined;
      expect(allowanceMock.calledTwice).to.be.true;
      expect(
        allowanceMock.firstCall.calledWith(TEST_WALLET_ADDRESS, params.tokenSpenders[0].address),
      ).to.be.true;

      expect(
        allowanceMock.secondCall.calledWith(TEST_WALLET_ADDRESS, params.tokenSpenders[1].address),
      ).to.be.true;
      expect(contractCallMock.calledOnce).to.be.true;
      expect(rpcWaitForTxMock.notCalled).to.be.true;
      expect(approveMock.notCalled).to.be.true;
      expect(txHash).not.to.be.empty;
    });

    it("should call separate approvals for each spender address if not enough allowance and enough erc20 token", async () => {
      const params = getDefaultParams({
        totalFees: 100n,
        token: erc20Address[aeneid],
        tokenSpenders: [
          {
            address: royaltyModuleAddress[aeneid],
            amount: 20n,
          },
          {
            address: royaltyModuleAddress[aeneid],
            amount: 22n,
          },
          {
            address: multicall3Address[aeneid],
            amount: 22n,
          },
        ],
        txOptions: { waitForTransaction: true },
      });
      allowanceMock.resolves(15n);
      const txResponse = await contractCallWithFees(params);
      const { txHash, receipt } = txResponse as TransactionResponse;
      expect(receipt).not.to.be.undefined;
      expect(contractCallMock.calledOnce).to.be.true;
      expect(approveMock.calledTwice).to.be.true;
      expect(approveMock.firstCall.calledWith(royaltyModuleAddress[aeneid], maxUint256)).to.be.true;
      expect(rpcWaitForTxMock.callCount).to.equal(3); // 2 approval + 1 contract call
      expect(txHash).not.to.be.empty;
    });

    it("should throw not enough erc20 token when call contractCallWithFees given erc20 token is not enough", async () => {
      const params = getDefaultParams({
        totalFees: 101n,
        token: erc20Address[aeneid],
      });
      await expect(contractCallWithFees(params)).to.be.rejectedWith(
        "Wallet does not have enough erc20 token to pay for fees. Total fees:  0.000000000000000101IP, balance: 0.0000000000000001IP.",
      );
    });
  });
});
