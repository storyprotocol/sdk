import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { restore, SinonStub, stub } from "sinon";
import { Address, maxUint256, parseEther, PublicClient, WalletClient } from "viem";

import { WIP_TOKEN_ADDRESS } from "../../../src";
import {
  derivativeWorkflowsAddress,
  erc20Address,
  licensingModuleAddress,
  multicall3Address,
  royaltyModuleAddress,
} from "../../../src/abi/generated";
import { ContractCallWithFees } from "../../../src/types/utils/wip";
import { contractCallWithFees } from "../../../src/utils/feeUtils";
import { ERC20Client, WipTokenClient } from "../../../src/utils/token";
import { getTokenAmountDisplay } from "../../../src/utils/utils";
import { TEST_WALLET_ADDRESS } from "../../integration/utils/util";
import { aeneid, mockAddress, txHash } from "../mockData";
import {
  createMockPublicClient,
  createMockWalletClient,
  createMockWithAddress,
  generateRandomAddress,
} from "../testUtils";

use(chaiAsPromised);

describe.only("Token Fee Utilities", () => {
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
    contractCallMock = stub().resolves(txHash);
    return {
      rpcClient: rpcMock,
      wallet: walletMock,
      multicall3Address: multicall3Address[aeneid],
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
  describe("contractCallWithFees with wip", () => {
    let approveMock: SinonStub;

    beforeEach(() => {
      approveMock = stub(WipTokenClient.prototype, "approve").resolves(txHash);
    });

    it("should call contract directly if no fees", async () => {
      const params = getDefaultParams({
        tokenSpenders: [{ address: mockAddress, amount: 0n, token: WIP_TOKEN_ADDRESS }],
      });
      const txResponse = await contractCallWithFees(params);
      const { txHash: result } = txResponse;
      expect(contractCallMock.callCount).equals(1);
      expect(rpcWaitForTxMock.callCount).equals(1);
      expect(result).equals(txHash);
    });

    describe("Enough WIP", () => {
      beforeEach(() => {
        stub(WipTokenClient.prototype, "balanceOf").resolves(200n);
      });
      it("should not call approval if disabled via enableAutoApprove", async () => {
        const params = getDefaultParams({
          tokenSpenders: [{ address: mockAddress, amount: 100n, token: WIP_TOKEN_ADDRESS }],
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
          tokenSpenders: [
            {
              address: royaltyModuleAddress[aeneid],
              amount: 50n,
              token: WIP_TOKEN_ADDRESS,
            },
            {
              address: derivativeWorkflowsAddress[aeneid],
              amount: 50n,
              token: WIP_TOKEN_ADDRESS,
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
          tokenSpenders: [
            {
              address: royaltyModuleAddress[aeneid],
              amount: 10n,
              token: WIP_TOKEN_ADDRESS,
            },
            {
              address: derivativeWorkflowsAddress[aeneid],
              amount: 90n,
              token: WIP_TOKEN_ADDRESS,
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
          tokenSpenders: [
            {
              address: royaltyModuleAddress[aeneid],
              amount: 20n,
              token: WIP_TOKEN_ADDRESS,
            },
            {
              address: derivativeWorkflowsAddress[aeneid],
              amount: 80n,
              token: WIP_TOKEN_ADDRESS,
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
                token: WIP_TOKEN_ADDRESS,
              },
              {
                address: derivativeWorkflowsAddress[aeneid],
                amount: 10n,
                token: WIP_TOKEN_ADDRESS,
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
                token: WIP_TOKEN_ADDRESS,
              },
              {
                address: derivativeWorkflowsAddress[aeneid],
                amount: 10n,
                token: WIP_TOKEN_ADDRESS,
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
      beforeEach(() => {
        walletBalanceMock.resolves(parseEther("0.1"));
        stub(WipTokenClient.prototype, "balanceOf").resolves(0n);
      });

      it("should throw error indicating not enough wip funds to complete given token is wip", async () => {
        const params = getDefaultParams({
          tokenSpenders: [
            { address: mockAddress, amount: parseEther("1"), token: WIP_TOKEN_ADDRESS },
          ],
        });
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
    it("should skip approvals if no fees", async () => {
      const params = getDefaultParams({
        tokenSpenders: [
          { address: mockAddress, amount: 0n, token: erc20Address[aeneid] },
          { address: mockAddress, amount: 0n, token: erc20Address[aeneid] },
        ],
      });
      const txResponse = await contractCallWithFees(params);
      const { txHash: result } = txResponse;
      expect(contractCallMock.callCount).equals(1);
      expect(approveMock.callCount).equals(0);
      expect(rpcWaitForTxMock.callCount).equals(1);
      expect(result).equals(txHash);
    });
    it("should not call approval if disabled via enableAutoApprove and enough erc20 token", async () => {
      const params = getDefaultParams({
        tokenSpenders: [{ address: mockAddress, amount: 100n, token: erc20Address[aeneid] }],
        options: {
          erc20Options: { enableAutoApprove: false },
        },
      });
      const txResponse = await contractCallWithFees(params);
      const { txHash: result } = txResponse;
      expect(contractCallMock.callCount).equals(1);
      expect(approveMock.callCount).equals(0);
      expect(result).equals(txHash);
    });

    it("should skip approvals if all spenders have sufficient allowance and enough erc20 token", async () => {
      const params = getDefaultParams({
        tokenSpenders: [
          {
            address: royaltyModuleAddress[aeneid],
            amount: 50n,
            token: erc20Address[aeneid],
          },
          {
            address: derivativeWorkflowsAddress[aeneid],
            amount: 50n,
            token: erc20Address[aeneid],
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
      expect(result).equals(txHash);
    });

    it("should call separate approvals for each spender address if not enough allowance and enough erc20 token", async () => {
      const params = getDefaultParams({
        tokenSpenders: [
          {
            address: royaltyModuleAddress[aeneid],
            amount: 20n,
            token: erc20Address[aeneid],
          },
          {
            address: mockAddress,
            amount: 22n,
            token: erc20Address[aeneid],
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
      expect(result).equals(txHash);
    });

    it("should throw not enough erc20 token when call contractCallWithFees given erc20 token is not enough", async () => {
      const params = getDefaultParams({
        tokenSpenders: [
          { address: erc20Address[aeneid], amount: 101n, token: erc20Address[aeneid] },
        ],
      });
      await expect(contractCallWithFees(params)).to.be.rejectedWith(
        "Wallet does not have enough erc20 token to pay for fees. Total fees:  0.000000000000000101IP, balance: 0.0000000000000001IP.",
      );
    });
  });

  describe("contractCallWithFees with wip and erc20 token", () => {
    let approveMockForErc20: SinonStub;
    let allowanceMockForErc20: SinonStub;
    let balanceOfMockForErc20: SinonStub;
    let approveMockForWip: SinonStub;
    let allowanceMockForWip: SinonStub;
    let balanceOfMockForWip: SinonStub;
    beforeEach(() => {
      approveMockForErc20 = stub(ERC20Client.prototype, "approve").resolves(txHash);
      allowanceMockForErc20 = stub(ERC20Client.prototype, "allowance").resolves(0n);
      balanceOfMockForErc20 = stub(ERC20Client.prototype, "balanceOf").resolves(100n);
      approveMockForWip = stub(WipTokenClient.prototype, "approve").resolves(txHash);
      allowanceMockForWip = stub(WipTokenClient.prototype, "allowance").resolves(0n);
      balanceOfMockForWip = stub(WipTokenClient.prototype, "balanceOf").resolves(100n);
    });
    describe("enough balance", () => {
      it("should call contract directly if no fees", async () => {
        const params = getDefaultParams({
          tokenSpenders: [
            { address: mockAddress, amount: 0n, token: WIP_TOKEN_ADDRESS },
            { address: mockAddress, amount: 0n, token: erc20Address[aeneid] },
          ],
        });
        const { txHash: result } = await contractCallWithFees(params);
        expect(contractCallMock.callCount).equals(1);
        expect(rpcWaitForTxMock.callCount).equals(1);
        expect(approveMockForErc20.callCount).equals(0);
        expect(approveMockForWip.callCount).equals(0);
        expect(result).to.equal(txHash);
      });
      it("should call approve for erc20 token and wip token separately if not enough allowance and enough balance", async () => {
        // Mock the insufficient allowance and enough balance for the erc20 and wip token
        allowanceMockForErc20.resolves(15n);
        allowanceMockForWip.resolves(15n);
        balanceOfMockForErc20.resolves(100n);
        balanceOfMockForWip.resolves(100n);

        const params = getDefaultParams({
          tokenSpenders: [
            { address: mockAddress, amount: 100n, token: erc20Address[aeneid] },
            { address: mockAddress, amount: 100n, token: WIP_TOKEN_ADDRESS },
          ],
        });
        const { txHash: result } = await contractCallWithFees(params);

        expect(allowanceMockForErc20.callCount).equals(1);
        expect(allowanceMockForErc20.firstCall.args).to.deep.eq([TEST_WALLET_ADDRESS, mockAddress]);
        expect(approveMockForErc20.callCount).equals(1);
        expect(approveMockForErc20.firstCall.args).to.deep.eq([mockAddress, maxUint256]);

        expect(allowanceMockForWip.callCount).equals(1);
        expect(allowanceMockForWip.firstCall.args).to.deep.eq([TEST_WALLET_ADDRESS, mockAddress]);
        expect(approveMockForWip.callCount).equals(1);
        expect(approveMockForWip.firstCall.args).to.deep.eq([mockAddress, maxUint256]);

        expect(contractCallMock.callCount).equals(1);
        expect(rpcWaitForTxMock.callCount).equals(3); // 1 contract call + 2 approvals
        expect(result).to.equal(txHash);
      });

      it("should only call approve for wip token if not enough allowance with wip and enough balance", async () => {
        allowanceMockForErc20.resolves(100n);
        allowanceMockForWip.resolves(0n);
        balanceOfMockForErc20.resolves(100n);
        balanceOfMockForWip.resolves(100n);

        const params = getDefaultParams({
          tokenSpenders: [
            { address: mockAddress, amount: 100n, token: erc20Address[aeneid] },
            { address: mockAddress, amount: 100n, token: WIP_TOKEN_ADDRESS },
          ],
        });
        const { txHash: result } = await contractCallWithFees(params);

        expect(allowanceMockForWip.callCount).equals(1);
        expect(approveMockForWip.callCount).equals(1);

        expect(allowanceMockForErc20.callCount).equals(1);
        expect(approveMockForErc20.callCount).equals(0);
        expect(rpcWaitForTxMock.callCount).equals(2); // 1 contract call + 1 wip approval
        expect(result).to.equal(txHash);
      });
      it("should call approve for erc20 token if not enough allowance with erc20 and enough balance", async () => {
        allowanceMockForErc20.resolves(0n);
        allowanceMockForWip.resolves(100n);
        balanceOfMockForErc20.resolves(100n);
        balanceOfMockForWip.resolves(100n);

        const params = getDefaultParams({
          tokenSpenders: [
            { address: mockAddress, amount: 100n, token: erc20Address[aeneid] },
            { address: mockAddress, amount: 100n, token: WIP_TOKEN_ADDRESS },
          ],
        });
        const { txHash: result } = await contractCallWithFees(params);

        expect(allowanceMockForErc20.callCount).equals(1);
        expect(approveMockForErc20.callCount).equals(1);

        expect(allowanceMockForWip.callCount).equals(1);
        expect(approveMockForWip.callCount).equals(0);
        expect(rpcWaitForTxMock.callCount).equals(2); // 1 contract call + 1 erc20 approval
        expect(result).to.equal(txHash);
      });
      it("should call multicall approves for both erc20 and wip token if enough balance", async () => {
        allowanceMockForErc20.resolves(10n);
        allowanceMockForWip.resolves(10n);
        balanceOfMockForErc20.resolves(200n);
        balanceOfMockForWip.resolves(200n);

        const params = getDefaultParams({
          tokenSpenders: [
            { address: mockAddress, amount: 100n, token: erc20Address[aeneid] },
            { address: mockAddress, amount: 100n, token: WIP_TOKEN_ADDRESS },
            { address: erc20Address[aeneid], amount: 100n, token: WIP_TOKEN_ADDRESS },
            { address: erc20Address[aeneid], amount: 100n, token: erc20Address[aeneid] },
          ],
        });
        const { txHash: result } = await contractCallWithFees(params);

        expect(allowanceMockForErc20.callCount).equals(2);
        expect(approveMockForErc20.callCount).equals(2); //cannot use multicall for erc20 approval

        expect(allowanceMockForWip.callCount).equals(2);
        expect(approveMockForWip.callCount).equals(2); // cannot use multicall for wip approval

        expect(rpcWaitForTxMock.callCount).equals(5); // 1 contract call + 2 erc20 approvals + 2 wip approvals
        expect(result).to.equal(txHash);
      });

      it("should merge same token and address to approve given enough balance", async () => {
        allowanceMockForErc20.resolves(10n);
        allowanceMockForWip.resolves(10n);
        balanceOfMockForErc20.resolves(300n);
        balanceOfMockForWip.resolves(300n);

        const params = getDefaultParams({
          tokenSpenders: [
            { address: mockAddress, amount: 100n, token: erc20Address[aeneid] },
            { address: royaltyModuleAddress[aeneid], amount: 100n, token: erc20Address[aeneid] },
            { address: royaltyModuleAddress[aeneid], amount: 100n, token: erc20Address[aeneid] },
            { address: mockAddress, amount: 100n, token: WIP_TOKEN_ADDRESS },
            { address: licensingModuleAddress[aeneid], amount: 100n, token: WIP_TOKEN_ADDRESS },
            { address: licensingModuleAddress[aeneid], amount: 100n, token: WIP_TOKEN_ADDRESS },
          ],
        });
        const { txHash: result } = await contractCallWithFees(params);
        expect(allowanceMockForErc20.callCount).equals(2);
        expect(approveMockForErc20.callCount).equals(2); //two royaltyModuleAddress approvals merge into one call + one mockAddress approval
        expect(approveMockForErc20.firstCall.args).to.deep.eq([mockAddress, maxUint256]);
        expect(approveMockForErc20.secondCall.args).to.deep.eq([
          royaltyModuleAddress[aeneid],
          maxUint256,
        ]);

        expect(allowanceMockForWip.callCount).equals(2);
        expect(approveMockForWip.callCount).equals(2); // two licensingModuleAddress approvals merge into one call + one mockAddress approval
        expect(approveMockForWip.firstCall.args).to.deep.eq([mockAddress, maxUint256]);
        expect(approveMockForWip.secondCall.args).to.deep.eq([
          licensingModuleAddress[aeneid],
          maxUint256,
        ]);
        expect(rpcWaitForTxMock.callCount).equals(5); // 1 contract call + 2 erc20 approvals + 2 wip approvals
        expect(result).to.equal(txHash);
      });

      it("should not approve given token is multicall address and enough balance", async () => {
        allowanceMockForErc20.resolves(10n);
        allowanceMockForWip.resolves(10n);
        balanceOfMockForErc20.resolves(200n);
        balanceOfMockForWip.resolves(200n);

        const params = getDefaultParams({
          tokenSpenders: [
            { address: mockAddress, amount: 100n, token: erc20Address[aeneid] },
            { address: multicall3Address[aeneid], amount: 100n, token: erc20Address[aeneid] },
            { address: mockAddress, amount: 100n, token: WIP_TOKEN_ADDRESS },
            { address: multicall3Address[aeneid], amount: 100n, token: WIP_TOKEN_ADDRESS },
          ],
        });
        const { txHash: result } = await contractCallWithFees(params);
        expect(allowanceMockForErc20.callCount).equals(1);
        expect(approveMockForErc20.callCount).equals(1);

        expect(allowanceMockForWip.callCount).equals(1);
        expect(approveMockForWip.callCount).equals(1);

        expect(rpcWaitForTxMock.callCount).equals(3); // 1 contract call + 2 approvals
        expect(result).to.equal(txHash);
      });

      it("should skip approval if enough allowance and balance", async () => {
        allowanceMockForErc20.resolves(100n);
        allowanceMockForWip.resolves(100n);
        balanceOfMockForErc20.resolves(200n);
        balanceOfMockForWip.resolves(200n);
        const params = getDefaultParams({
          tokenSpenders: [
            { address: mockAddress, amount: 100n, token: erc20Address[aeneid] },
            { address: mockAddress, amount: 100n, token: WIP_TOKEN_ADDRESS },
          ],
        });
        const { txHash: result } = await contractCallWithFees(params);
        expect(allowanceMockForErc20.callCount).equals(1);
        expect(approveMockForErc20.callCount).equals(0);

        expect(allowanceMockForWip.callCount).equals(1);
        expect(approveMockForWip.callCount).equals(0);
        expect(contractCallMock.callCount).equals(1);
        expect(rpcWaitForTxMock.callCount).equals(1); // 1 contract call
        expect(result).to.equal(txHash);
      });

      it("should skip approval and allowance check if enough balance and disable auto approve", async () => {
        allowanceMockForErc20.resolves(10n);
        allowanceMockForWip.resolves(10n);
        balanceOfMockForErc20.resolves(200n);
        balanceOfMockForWip.resolves(200n);
        const params = getDefaultParams({
          tokenSpenders: [
            { address: mockAddress, amount: 100n, token: erc20Address[aeneid] },
            { address: mockAddress, amount: 100n, token: WIP_TOKEN_ADDRESS },
          ],
          options: {
            erc20Options: { enableAutoApprove: false },
            wipOptions: { enableAutoApprove: false },
          },
        });
        const { txHash: result } = await contractCallWithFees(params);
        expect(allowanceMockForErc20.callCount).equals(0);
        expect(approveMockForErc20.callCount).equals(0);

        expect(allowanceMockForWip.callCount).equals(0);
        expect(approveMockForWip.callCount).equals(0);

        expect(contractCallMock.callCount).equals(1);
        expect(rpcWaitForTxMock.callCount).equals(1); // 1 contract call
        expect(result).to.equal(txHash);
      });
    });
    describe("not enough balance", () => {
      it("should throw error if not enough balance for erc20 token", async () => {
        balanceOfMockForErc20.resolves(0n);
        balanceOfMockForWip.resolves(100n);
        const params = getDefaultParams({
          tokenSpenders: [
            { address: mockAddress, amount: 100n, token: erc20Address[aeneid] },
            { address: mockAddress, amount: 100n, token: WIP_TOKEN_ADDRESS },
          ],
        });
        await expect(contractCallWithFees(params)).to.be.rejectedWith(
          `Wallet does not have enough erc20 token to pay for fees. Total fees:  ${getTokenAmountDisplay(
            100n,
          )}, balance: ${getTokenAmountDisplay(0n)}.`,
        );
      });
    });
  });
});
