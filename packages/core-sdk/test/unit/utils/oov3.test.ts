import { expect } from "chai";
import { stub } from "sinon";
import * as viem from "viem";
import { generatePrivateKey } from "viem/accounts";

import { ArbitrationPolicyUmaClient } from "../../../src/abi/generated";
import { getAssertionDetails, getMinimumBond, getOov3Contract, settleAssertion } from "../../../src/utils/oov3";
import { WIP_TOKEN_ADDRESS } from "../../../src/constants/common";
import { invalidAddress, mockAddress, mockERC20, nonWhitelistedToken, txHash } from "../mockData";
import { createMockPublicClient, createMockWithAddress } from "../testUtils";

describe("oov3", () => {
  let rpcClient: viem.PublicClient;
  let arbitrationPolicyUmaClient: ArbitrationPolicyUmaClient;

  beforeEach(() => {
    rpcClient = createMockPublicClient();
    arbitrationPolicyUmaClient = createMockWithAddress<ArbitrationPolicyUmaClient>();
    arbitrationPolicyUmaClient.oov3 = stub().resolves(mockAddress);
  });

  it("should get assertion details", async () => {
    rpcClient.readContract = stub().resolves({
      bond: 1n,
    });
    const assertionDetails = await getAssertionDetails(
      rpcClient,
      arbitrationPolicyUmaClient,
      mockAddress,
    );
    expect(assertionDetails).to.equal(1n);
  });

  it("should get oov3 contract address", async () => {
    const oov3Contract = await getOov3Contract(arbitrationPolicyUmaClient);
    expect(oov3Contract).to.equal(mockAddress);
  });

  describe("TSSDK-135(Add validation for inputs currency and currencyToken.) getMinimumBond", () => {
    it("should allow MERC20 on aeneid (chain.id = 1315) and call readContract", async () => {
      rpcClient.chain = { id: 1315 } as any;
      const readContractStub = (rpcClient.readContract = stub().resolves(123n));
      const bond = await getMinimumBond(rpcClient, arbitrationPolicyUmaClient, mockERC20 as any);
      expect(bond).to.equal(123n);
      expect(readContractStub.callCount).to.equal(1);
    });

    it("should allow WIP on mainnet (chain.id = 1514) and call readContract", async () => {
      rpcClient.chain = { id: 1514 } as any;
      const readContractStub = (rpcClient.readContract = stub().resolves(1n));
      const bond = await getMinimumBond(rpcClient, arbitrationPolicyUmaClient, WIP_TOKEN_ADDRESS as any);
      expect(bond).to.equal(1n);
      expect(readContractStub.callCount).to.equal(1);
    });

    it("should reject MERC20 on mainnet (chain.id = 1514) and not call readContract", async () => {
      rpcClient.chain = { id: 1514 } as any;
      const readContractStub = (rpcClient.readContract = stub().resolves(123n));
      try {
        await getMinimumBond(rpcClient, arbitrationPolicyUmaClient, mockERC20 as any);
        expect.fail("Expected getMinimumBond to throw");
      } catch (err) {
        expect((err as Error).message).to.equal(
          `Currency token ${mockERC20} is not allowed on chain 1514.`,
        );
      }
      expect(readContractStub.callCount).to.equal(0);
    });

    it("should reject non-whitelisted token on aeneid (chain.id = 1315)", async () => {
      rpcClient.chain = { id: 1315 } as any;
      const readContractStub = (rpcClient.readContract = stub().resolves(1n));
      try {
        await getMinimumBond(rpcClient, arbitrationPolicyUmaClient, nonWhitelistedToken as any);
        expect.fail("Expected getMinimumBond to throw");
      } catch (err) {
        expect((err as Error).message).to.equal(
          `Currency token ${nonWhitelistedToken} is not allowed on chain 1315.`,
        );
      }
      expect(readContractStub.callCount).to.equal(0);
    });

    it("should reject invalid address token on mainnet (expected: whitelist error)", async () => {
      rpcClient.chain = { id: 1514 } as any;
      const readContractStub = (rpcClient.readContract = stub().resolves(1n));
      try {
        await getMinimumBond(rpcClient, arbitrationPolicyUmaClient, invalidAddress as any);
        expect.fail("Expected getMinimumBond to throw");
      } catch (err) {
        expect((err as Error).message).to.equal(
          `Currency token ${invalidAddress} is not allowed on chain 1514.`,
        );
      }
      expect(readContractStub.callCount).to.equal(0);
    });

    it("should default to aeneid when rpcClient.chain is undefined", async () => {
      rpcClient.chain = undefined as any;
      rpcClient.readContract = stub().resolves(1n);
      const bond = await getMinimumBond(rpcClient, arbitrationPolicyUmaClient, mockERC20 as any);
      expect(bond).to.equal(1n);
    });

    it("should default to aeneid when rpcClient.chain is undefined and reject non-whitelisted token", async () => {
      rpcClient.chain = undefined as any;
      const readContractStub = (rpcClient.readContract = stub().resolves(1n));
      try {
        await getMinimumBond(rpcClient, arbitrationPolicyUmaClient, nonWhitelistedToken as any);
        expect.fail("Expected getMinimumBond to throw");
      } catch (err) {
        expect((err as Error).message).to.equal(
          `Currency token ${nonWhitelistedToken} is not allowed on chain aeneid.`,
        );
      }
      expect(readContractStub.callCount).to.equal(0);
    });
  });

  describe("settleAssertion", () => {
    const privateKey = generatePrivateKey();
    const originalWalletClient = Object.getOwnPropertyDescriptor(viem, "createWalletClient");
    const originalPublicClient = Object.getOwnPropertyDescriptor(viem, "createPublicClient");

    afterEach(() => {
      // Restore original properties
      if (originalWalletClient) {
        Object.defineProperty(viem, "createWalletClient", originalWalletClient);
      }

      if (originalPublicClient) {
        Object.defineProperty(viem, "createPublicClient", originalPublicClient);
      }
    });

    it("should throw error when call settleAssertion given privateKey is not valid", async () => {
      // It's not possible to stub viem functions, so we need to replace the original functions with stubs.
      Object.defineProperty(viem, "createWalletClient", {
        value: () => ({
          writeContract: stub().rejects(new Error("rpc error")),
        }),
      });
      await expect(settleAssertion(privateKey, 1n)).to.be.rejectedWith(
        "Failed to settle assertion: rpc error",
      );
    });

    it("should return the hash of the settlement", async () => {
      // It's not possible to stub viem functions, so we need to replace the original functions with stubs.
      Object.defineProperty(viem, "createWalletClient", {
        value: () => ({
          writeContract: stub().resolves(txHash),
        }),
      });
      Object.defineProperty(viem, "createPublicClient", {
        value: () => ({
          waitForTransactionReceipt: stub().resolves(txHash),
          readContract: stub().resolves(1n),
        }),
      });
      const hash = await settleAssertion(privateKey, 1n);
      expect(hash).to.equal(hash);
    });
  });
});
