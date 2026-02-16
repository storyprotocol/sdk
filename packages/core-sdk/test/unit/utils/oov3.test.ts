import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { stub, useFakeTimers } from "sinon";
import * as viem from "viem";
import { generatePrivateKey } from "viem/accounts";

use(chaiAsPromised);

import { ArbitrationPolicyUmaClient } from "../../../src/abi/generated";
import { getAssertionDetails, getOov3Contract, settleAssertion } from "../../../src/utils/oov3";
import { mockAddress, txHash } from "../mockData";
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
      Object.defineProperty(viem, "createPublicClient", {
        value: () => ({
          waitForTransactionReceipt: stub().resolves(txHash),
          readContract: stub().resolves(1n),
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
      expect(hash).to.equal(txHash);
    });

    it("should retry and succeed when first attempt fails with Assertion not expired", async () => {
      const clock = useFakeTimers();
      const writeContractStub = stub()
        .onFirstCall()
        .rejects(new Error("Assertion not expired"))
        .onSecondCall()
        .resolves(txHash);
      Object.defineProperty(viem, "createWalletClient", {
        value: () => ({
          writeContract: writeContractStub,
        }),
      });
      Object.defineProperty(viem, "createPublicClient", {
        value: () => ({
          waitForTransactionReceipt: stub().resolves(txHash),
          readContract: stub().resolves(1n),
        }),
      });
      const promise = settleAssertion(privateKey, 1n);
      await clock.tickAsync(3000);
      const hash = await promise;
      expect(hash).to.equal(txHash);
      expect(writeContractStub.callCount).to.equal(2);
    });

    it("should throw after max retries when Assertion not expired persists", async function () {
      this.timeout(20000);
      const clock = useFakeTimers();
      Object.defineProperty(viem, "createWalletClient", {
        value: () => ({
          writeContract: stub().rejects(new Error("Assertion not expired")),
        }),
      });
      Object.defineProperty(viem, "createPublicClient", {
        value: () => ({
          waitForTransactionReceipt: stub().resolves(txHash),
          readContract: stub().resolves(1n),
        }),
      });
      const promise = settleAssertion(privateKey, 1n);
      await clock.tickAsync(12000);
      await expect(promise).to.be.rejectedWith(
        "Failed to settle assertion: Assertion not expired",
      );
    });
  });
});
