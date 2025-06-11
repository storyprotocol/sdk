import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { restore, SinonStub, stub } from "sinon";
import { Address, maxUint256, parseEther, PublicClient, WalletClient } from "viem";

import { WIP_TOKEN_ADDRESS } from "../../../src";
import {
  derivativeWorkflowsAddress,
  erc20Address,
  multicall3Address,
  royaltyModuleAddress,
} from "../../../src/abi/generated";
import { ContractCallWithFees } from "../../../src/types/utils/wip";
import { contractCallWithFees } from "../../../src/utils/feeUtils";
import { ERC20Client, WipTokenClient } from "../../../src/utils/token";
import { TEST_WALLET_ADDRESS } from "../../integration/utils/util";
import { aeneid, txHash } from "../mockData";
import {
  createMockPublicClient,
  createMockWalletClient,
  createMockWithAddress,
  generateRandomAddress,
  generateRandomHash,
} from "../testUtils";

use(chaiAsPromised);

describe("Erc20 Token Fee Utilities", () => {
  let rpcMock: PublicClient;
  let walletMock: WalletClient;
  let contractCallMock: SinonStub;
  let rpcWaitForTxMock: SinonStub;
  let walletBalanceMock: SinonStub;

  beforeEach(() => {
    rpcMock = createMockPublicClient();
    walletBalanceMock = stub().resolves(0);
    rpcMock.getBalance = walletBalanceMock;
    walletMock = createMockWalletClient();
    rpcWaitForTxMock = rpcMock.waitForTransactionReceipt as SinonStub;
    createMockWithAddress<WipTokenClient>();
  });

  afterEach(() => {
    restore();
  });

  const getDefaultParams = (overrides: Partial<ContractCallWithFees>): ContractCallWithFees => {
    const hash = generateRandomHash();
    contractCallMock = stub().resolves(hash);
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
  };
  describe("No Fees", () => {
    it("should call contract directly if no fees", async () => {
      const params = getDefaultParams({ totalFees: 0n });
      const txResponse = await contractCallWithFees(params);
      const { txHash: result } = txResponse;
      expect(contractCallMock.callCount).equals(1);
      expect(result).to.be.a("string");
    });

    it("should support wait for tx", async () => {
      const params = getDefaultParams({
        totalFees: 0n,
      });
      const txResponse = await contractCallWithFees(params);
      const { txHash: result } = txResponse;
      expect(contractCallMock.callCount).equals(1);
      expect(rpcWaitForTxMock.callCount).equals(1);
      expect(result).to.be.a("string");
    });
  });

  describe("contractCallWithFees with wip", () => {
    let approveMock: SinonStub;

    beforeEach(() => {
      approveMock = stub(WipTokenClient.prototype, "approve").resolves(txHash);
    });

    describe("Enough WIP", () => {
      beforeEach(() => {
        stub(WipTokenClient.prototype, "balanceOf").resolves(200n);
      });
      it("should not call approval if disabled via enableAutoApprove", async () => {
        const params = getDefaultParams({
          totalFees: 100n,
          options: { erc20Options: { enableAutoApprove: false } },
        });
        const txResponse = await contractCallWithFees(params);
        const { txHash: result } = txResponse;
        expect(contractCallMock.callCount).equals(1);
        expect(approveMock.callCount).equals(0);
        expect(result).to.be.a("string");
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
        });
        const allowanceMock = stub(WipTokenClient.prototype, "allowance").resolves(50n);

        const txResponse = await contractCallWithFees(params);
        const { txHash: result } = txResponse;
        expect(allowanceMock.callCount).equals(2);
        expect(allowanceMock.firstCall.args).to.deep.eq([
          TEST_WALLET_ADDRESS,
          params.tokenSpenders[0].address,
        ]);
        expect(allowanceMock.secondCall.args).to.deep.eq([
          TEST_WALLET_ADDRESS,
          params.tokenSpenders[1].address,
        ]);
        expect(contractCallMock.callCount).equals(1);
        expect(approveMock.callCount).equals(0);
        expect(result).to.be.a("string");
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
        });
        stub(WipTokenClient.prototype, "allowance").resolves(15n);
        const txResponse = await contractCallWithFees(params);
        const { txHash: result } = txResponse;
        expect(contractCallMock.callCount).equals(1);
        expect(approveMock.callCount).equals(1);
        expect(approveMock.firstCall.args).to.deep.eq([
          derivativeWorkflowsAddress[aeneid],
          maxUint256,
        ]);
        expect(rpcWaitForTxMock.callCount).equals(2); // 1 approval + 1 contract call
        expect(result).to.be.a("string");
      });
    });

    describe("Enough IP, not enough WIP", () => {
      let simulateContractMock: SinonStub;
      let params: ContractCallWithFees;

      beforeEach(() => {
        stub(WipTokenClient.prototype, "balanceOf").resolves(1n);
        walletBalanceMock.resolves(1_000);
        simulateContractMock = stub().resolves({ request: {} });
        rpcMock.simulateContract = simulateContractMock;

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
        stub(WipTokenClient.prototype, "allowance").resolves(50n);
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
          const { txHash: result } = txResponse;
          expect(simulateContractMock.callCount).equals(1);
          expect(simulateContractMock.firstCall.args[0]).to.include({
            functionName: "deposit",
            value: 100n,
            address: WIP_TOKEN_ADDRESS,
          });
          expect(approveMock.callCount).equals(1);
          expect(approveMock.firstCall.args).to.deep.eq([
            derivativeWorkflowsAddress[aeneid],
            maxUint256,
          ]);
          expect(contractCallMock.callCount).equals(1);
          expect(rpcWaitForTxMock.callCount).equals(3); // 1 deposit + 1 approval + 1 contract call
          expect(result).to.be.a("string");
        });

        it("should support wait for tx", async () => {
          const txResponse = await contractCallWithFees({
            ...params,
            options: {
              wipOptions: { useMulticallWhenPossible: false },
            },
          });
          const { txHash: result } = txResponse;
          expect(simulateContractMock.callCount).equals(1);
          expect(approveMock.callCount).equals(1);
          expect(contractCallMock.callCount).equals(1);
          expect(rpcWaitForTxMock.callCount).equals(3);
          expect(result).to.be.a("string");
        });

        it("should not call approval if enableAutoApprove is false", async () => {
          const txResponse = await contractCallWithFees({
            ...params,
            options: {
              wipOptions: { enableAutoApprove: false, useMulticallWhenPossible: false },
            },
          });
          const { txHash: result } = txResponse;
          expect(simulateContractMock.callCount).equals(1);
          expect(approveMock.callCount).equals(0);
          expect(contractCallMock.callCount).equals(1);
          expect(rpcWaitForTxMock.callCount).equals(2); // 1 deposit + 1 contract call
          expect(result).to.be.a("string");
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
          const { txHash: result } = txResponse;
          expect(result).to.be.a("string");
          expect(simulateContractMock.callCount).equals(1);
          expect(approveMock.callCount).equals(0);
          expect(contractCallMock.callCount).equals(1);
          expect(rpcWaitForTxMock.callCount).equals(2); // 1 deposit + 1 contract call
        });
      });

      describe("multicall", () => {
        let depositEncodeMock: SinonStub;
        let approveEncodeMock: SinonStub;

        beforeEach(() => {
          depositEncodeMock = stub(WipTokenClient.prototype, "depositEncode").returns({
            to: generateRandomAddress(),
            data: txHash,
          });
          approveEncodeMock = stub(WipTokenClient.prototype, "approveEncode").returns({
            to: generateRandomAddress(),
            data: txHash,
          });
        });

        it("should deposit, approve, and call contract in one multicall", async () => {
          const txResponse = await contractCallWithFees(params);
          const { txHash: result } = txResponse;
          expect(result).to.be.a("string");
          expect(depositEncodeMock.callCount).equals(1);
          expect(approveEncodeMock.callCount).equals(1);
          expect(simulateContractMock.callCount).equals(1);
          expect(simulateContractMock.firstCall.args[0]).to.include({
            functionName: "aggregate3Value",
            value: 100n,
          });
          const calls = (
            simulateContractMock.firstCall.args[0] as {
              args: { target: Address }[];
            }
          ).args[0] as unknown as { target: Address }[];
          expect(calls).to.have.length(3); // 1 deposit, 1 approve, 1 call
          expect(calls.map((c) => c.target)).to.deep.eq([
            (depositEncodeMock.returnValues[0] as { to: Address }).to,
            (approveEncodeMock.returnValues[0] as { to: Address }).to,
            params.encodedTxs[0].to,
          ]);
        });

        it("should support wait for tx", async () => {
          const txResponse = await contractCallWithFees({
            ...params,
          });
          const { txHash: result } = txResponse;
          expect(result).to.be.a("string");
          expect(simulateContractMock.callCount).equals(1);
          expect(rpcWaitForTxMock.callCount).equals(2);
          const calls = (
            simulateContractMock.firstCall.args[0] as {
              args: { target: Address }[];
            }
          ).args[0];
          expect(calls).to.have.length(3);
        });

        it("should not include approvals if enableAutoApprove is false", async () => {
          const txResponse = await contractCallWithFees({
            ...params,
            options: {
              wipOptions: { enableAutoApprove: false },
            },
          });
          const { txHash: result } = txResponse;
          expect(result).to.be.a("string");
          expect(simulateContractMock.callCount).equals(1);
          expect(approveEncodeMock.callCount).equals(0);
          const calls = (
            simulateContractMock.firstCall.args[0] as {
              args: { target: Address }[];
            }
          ).args[0];
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
          const { txHash: result } = txResponse;
          expect(result).to.be.a("string");
          expect(simulateContractMock.callCount).equals(1);
          expect(approveEncodeMock.callCount).equals(0);
          const calls = (
            simulateContractMock.firstCall.args[0] as {
              args: { target: Address }[];
            }
          ).args[0];
          expect(calls).to.have.length(2); // 1 deposit, 1 call
        });
      });
    });

    describe("Not enough IP or WIP", () => {
      const totalFees = parseEther("1");

      beforeEach(() => {
        walletBalanceMock.resolves(parseEther("0.1"));
        stub(WipTokenClient.prototype, "balanceOf").resolves(0n);
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
      approveMock = stub(ERC20Client.prototype, "approve").resolves(txHash);
      allowanceMock = stub(ERC20Client.prototype, "allowance").resolves(0n);
      stub(ERC20Client.prototype, "balanceOf").resolves(100n);
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
      const { txHash: result } = txResponse;
      expect(contractCallMock.callCount).equals(1);
      expect(approveMock.callCount).equals(0);
      expect(result).to.be.a("string");
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
      });
      allowanceMock.resolves(1001n);

      const txResponse = await contractCallWithFees(params);
      const { txHash: result } = txResponse;
      expect(allowanceMock.callCount).equals(2);
      expect(allowanceMock.firstCall.args).to.deep.eq([
        TEST_WALLET_ADDRESS,
        params.tokenSpenders[0].address,
      ]);
      expect(allowanceMock.secondCall.args).to.deep.eq([
        TEST_WALLET_ADDRESS,
        params.tokenSpenders[1].address,
      ]);
      expect(contractCallMock.callCount).equals(1);
      expect(approveMock.callCount).equals(0);
      expect(result).to.be.a("string");
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
      });
      allowanceMock.resolves(15n);
      const txResponse = await contractCallWithFees(params);
      const { txHash: result } = txResponse;
      expect(contractCallMock.callCount).equals(1);
      expect(approveMock.callCount).equals(2);
      expect(approveMock.firstCall.args).to.deep.eq([royaltyModuleAddress[aeneid], maxUint256]);
      expect(rpcWaitForTxMock.callCount).equals(3); // 2 approval + 1 contract call
      expect(result).to.be.a("string");
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
