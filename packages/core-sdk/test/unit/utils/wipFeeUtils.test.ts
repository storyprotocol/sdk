import chai from "chai";
import * as sinon from "sinon";
import chaiAsPromised from "chai-as-promised";
import { Address, LocalAccount, PublicClient, WalletClient, maxUint256, parseEther } from "viem";
import {
  Multicall3Client,
  Erc20TokenClient,
  royaltyModuleAddress,
  derivativeWorkflowsAddress,
} from "../../../src/abi/generated";
import { createMock, generateRandomAddress, generateRandomHash } from "../testUtils";
import { contractCallWithWipFees } from "../../../src/utils/wipFeeUtils";
import { ContractCallWithWipFees } from "../../../src/types/utils/wip";
import { TEST_WALLET_ADDRESS, aeneid } from "../../integration/utils/util";
import { WIP_TOKEN_ADDRESS } from "../../../src/constants/common";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("WIP Fee Utilities", () => {
  let wipClient: Erc20TokenClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;
  let multicall3Client: Multicall3Client;
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
    wipClient = createMock<Erc20TokenClient>();
    multicall3Client = createMock<Multicall3Client>();
    rpcWaitForTxMock = rpcMock.waitForTransactionReceipt as sinon.SinonStub;
  });

  afterEach(() => {
    sinon.restore();
  });

  function getDefaultParams(overrides: Partial<ContractCallWithWipFees>): ContractCallWithWipFees {
    const hash = generateRandomHash();
    contractCallMock = sinon.stub().resolves(hash);
    return {
      rpcClient: rpcMock,
      wallet: walletMock,
      multicall3Client: multicall3Client,
      wipClient: wipClient,
      totalFees: 0n,
      wipSpenders: [],
      contractCall: contractCallMock,
      encodedTxs: [
        {
          to: generateRandomAddress(),
          data: "0x",
        },
      ],
      sender: TEST_WALLET_ADDRESS,
      ...overrides,
    };
  }

  describe("contractCallWithWipFees", () => {
    let approveMock: sinon.SinonStub;

    beforeEach(() => {
      approveMock = sinon.stub().resolves();
      wipClient.approve = approveMock;
    });

    describe("No Fees", () => {
      it("should call contract directly if no fees", async () => {
        const params = getDefaultParams({ totalFees: 0n });
        const { txHash } = await contractCallWithWipFees(params);
        expect(contractCallMock.calledOnce).to.be.true;
        expect(rpcWaitForTxMock.notCalled).to.be.true;
        expect(txHash).not.to.be.empty;
      });

      it("should support wait for tx", async () => {
        const params = getDefaultParams({
          totalFees: 0n,
          txOptions: { waitForTransaction: true },
        });
        const { txHash } = await contractCallWithWipFees(params);
        expect(contractCallMock.calledOnce).to.be.true;
        expect(rpcWaitForTxMock.calledOnce).to.be.true;
        expect(txHash).not.to.be.empty;
      });
    });

    describe("Enough WIP", () => {
      beforeEach(() => {
        wipClient.balanceOf = sinon.stub().resolves({
          result: 200n,
        });
      });

      it("should not call approval if disabled via enableAutoApprove", async () => {
        const params = getDefaultParams({
          totalFees: 100n,
          wipOptions: { enableAutoApprove: false },
        });
        const { txHash, receipt } = await contractCallWithWipFees(params);
        expect(receipt).to.be.undefined;
        expect(contractCallMock.calledOnce).to.be.true;
        expect(rpcWaitForTxMock.notCalled).to.be.true;
        expect(approveMock.notCalled).to.be.true;
        expect(txHash).not.to.be.empty;
      });

      it("should skip approvals if all spenders have enough allowance", async () => {
        const params = getDefaultParams({
          totalFees: 100n,
          wipSpenders: [
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
        const allowanceMock = sinon.stub().resolves({
          result: 50n,
        });
        wipClient.allowance = allowanceMock;

        const { txHash, receipt } = await contractCallWithWipFees(params);
        expect(receipt).to.be.undefined;
        expect(allowanceMock.calledTwice).to.be.true;
        expect(
          allowanceMock.firstCall.calledWith({
            owner: TEST_WALLET_ADDRESS,
            spender: params.wipSpenders[0].address,
          }),
        ).to.be.true;
        expect(
          allowanceMock.secondCall.calledWith({
            owner: TEST_WALLET_ADDRESS,
            spender: params.wipSpenders[1].address,
          }),
        ).to.be.true;
        expect(contractCallMock.calledOnce).to.be.true;
        expect(rpcWaitForTxMock.notCalled).to.be.true;
        expect(approveMock.notCalled).to.be.true;
        expect(txHash).not.to.be.empty;
      });

      it("should call separate approvals for each spender address if not enough allowance", async () => {
        const params = getDefaultParams({
          totalFees: 100n,
          wipSpenders: [
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
        const allowanceMock = sinon.stub().resolves({
          result: 15n,
        });
        wipClient.allowance = allowanceMock;
        const { txHash, receipt } = await contractCallWithWipFees(params);
        expect(receipt).not.to.be.undefined;
        expect(contractCallMock.calledOnce).to.be.true;
        expect(approveMock.calledOnce).to.be.true;
        expect(
          approveMock.firstCall.calledWith({
            spender: derivativeWorkflowsAddress[aeneid],
            amount: maxUint256,
          }),
        ).to.be.true;
        expect(rpcWaitForTxMock.callCount).to.equal(2); // 1 approval + 1 contract call
        expect(txHash).not.to.be.empty;
      });
    });

    describe("Enough IP, not enough WIP", () => {
      let simulateContractMock: sinon.SinonStub;
      let params: ContractCallWithWipFees;

      beforeEach(() => {
        wipClient.balanceOf = sinon.stub().resolves({
          result: 1n,
        });
        walletBalanceMock.resolves(1_000);
        simulateContractMock = sinon.stub().resolves({ request: {} });
        rpcMock.simulateContract = simulateContractMock;
        rpcMock;
        params = getDefaultParams({
          totalFees: 100n,
          wipSpenders: [
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
        const allowanceMock = sinon.stub().resolves({
          result: 50n,
        });
        wipClient.allowance = allowanceMock;
      });

      it("should error if enableAutoWrapIp is false", async () => {
        await expect(
          contractCallWithWipFees({
            ...params,
            wipOptions: { enableAutoWrapIp: false },
          }),
        ).to.be.rejectedWith(/^Wallet does not have enough WIP to pay for fees./);
      });

      describe("no multicall", () => {
        it("should deposit, approve, and call contract separately", async () => {
          const { txHash, receipt } = await contractCallWithWipFees({
            ...params,
            wipOptions: { useMulticallWhenPossible: false },
          });
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
          const { txHash, receipt } = await contractCallWithWipFees({
            ...params,
            wipOptions: { useMulticallWhenPossible: false },
            txOptions: { waitForTransaction: true },
          });
          expect(receipt).not.to.be.undefined;
          expect(txHash).not.to.be.empty;
          expect(simulateContractMock.calledOnce).to.be.true;
          expect(approveMock.calledOnce).to.be.true;
          expect(contractCallMock.calledOnce).to.be.true;
          expect(rpcWaitForTxMock.callCount).to.equal(3);
        });

        it("should not call approval if enableAutoApprove is false", async () => {
          const { txHash, receipt } = await contractCallWithWipFees({
            ...params,
            wipOptions: { enableAutoApprove: false, useMulticallWhenPossible: false },
          });
          expect(receipt).to.be.undefined;
          expect(txHash).not.to.be.empty;
          expect(simulateContractMock.calledOnce).to.be.true;
          expect(approveMock.notCalled).to.be.true;
          expect(contractCallMock.calledOnce).to.be.true;
          expect(rpcWaitForTxMock.callCount).to.equal(1);
        });

        it("should not call approval if spender has enough allowance", async () => {
          const { txHash, receipt } = await contractCallWithWipFees({
            ...params,
            wipSpenders: [
              {
                address: royaltyModuleAddress[aeneid],
                amount: 20n,
              },
              {
                address: derivativeWorkflowsAddress[aeneid],
                amount: 10n,
              },
            ],
            wipOptions: { useMulticallWhenPossible: false },
          });
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
          depositEncodeMock = sinon.stub().returns({
            to: generateRandomAddress(),
            data: "",
          });
          wipClient.depositEncode = depositEncodeMock;
          approveEncodeMock = sinon.stub().returns({
            to: generateRandomAddress(),
            data: "",
          });
          wipClient.approveEncode = approveEncodeMock;
        });

        it("should deposit, approve, and call contract in one multicall", async () => {
          const { txHash, receipt } = await contractCallWithWipFees(params);
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
          const { txHash, receipt } = await contractCallWithWipFees({
            ...params,
            txOptions: { waitForTransaction: true },
          });
          expect(receipt).not.to.be.undefined;
          expect(txHash).not.to.be.empty;
          expect(simulateContractMock.calledOnce).to.be.true;
          expect(rpcWaitForTxMock.calledOnce).to.be.true;
          const calls = simulateContractMock.firstCall.args[0].args[0];
          expect(calls).to.have.length(3);
        });

        it("should not include approvals if enableAutoApprove is false", async () => {
          const { txHash, receipt } = await contractCallWithWipFees({
            ...params,
            wipOptions: { enableAutoApprove: false },
          });
          expect(receipt).to.be.undefined;
          expect(txHash).not.to.be.empty;
          expect(simulateContractMock.calledOnce).to.be.true;
          expect(approveEncodeMock.notCalled).to.be.true;
          expect(rpcWaitForTxMock.notCalled).to.be.true;
          const calls = simulateContractMock.firstCall.args[0].args[0];
          expect(calls).to.have.length(2); // 1 deposit, 1 call, no approves
        });

        it("should only include approves if enough allowances", async () => {
          const { txHash, receipt } = await contractCallWithWipFees({
            ...params,
            wipSpenders: [
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
        wipClient.balanceOf = sinon.stub().resolves({
          result: parseEther("0.1"),
        });
        walletBalanceMock.resolves(parseEther("0.1"));
      });

      it("should throw error indicating not enough funds to complete", async () => {
        const params = getDefaultParams({ totalFees });
        await expect(contractCallWithWipFees(params)).to.be.rejectedWith(
          "Wallet does not have enough IP to wrap to WIP and pay for fees. Total fees: 1IP, balance: 0.1IP",
        );
      });
    });
  });
});
