import { expect } from "chai";
import sinon from "sinon";
import { PublicClient, WalletClient, Account, zeroAddress } from "viem";
import { PolicyClient } from "../../../src/resources/policy";
import {
  RegisterPILPolicyRequest,
  AddPolicyToIpRequest,
  RegisterPILSocialRemixPolicyRequest,
  RegisterPILCommercialUsePolicyRequest,
} from "../../../src/types/resources/policy";
import { createMock } from "../testUtils";
import * as utils from "../../../src/utils/utils";
import {
  IPAccountABI,
  getLicensingModuleConfig,
  getPILPolicyFrameworkManagerConfig,
  getRoyaltyPolicyLAPConfig,
} from "../../config";

describe("Test PolicyClient", () => {
  let policyClient: PolicyClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(function () {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<Account>();
    accountMock.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
    walletMock.account = accountMock;
    policyClient = new PolicyClient(rpcMock, walletMock, "sepolia");
    policyClient.ipAccountABI = IPAccountABI;
    policyClient.pilPolicyFrameworkManagerConfig = getPILPolicyFrameworkManagerConfig("sepolia");
    policyClient.licensingModuleConfig = getLicensingModuleConfig("sepolia");
    policyClient.royaltyPolicyLAPConfig = getRoyaltyPolicyLAPConfig("sepolia");
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("test for constructor", () => {
    it("test constructor", () => {
      expect(policyClient.ipAccountABI).to.eql(IPAccountABI);
      expect(policyClient.licensingModuleConfig).to.eql(getLicensingModuleConfig("sepolia"));
      expect(policyClient.pilPolicyFrameworkManagerConfig).to.eql(
        getPILPolicyFrameworkManagerConfig("sepolia"),
      );
      expect(policyClient.royaltyPolicyLAPConfig).to.eql(getRoyaltyPolicyLAPConfig("sepolia"));
    });
  });
  describe("test for registerPILPolicy", () => {
    it("should throw error if simulateContract throws an error", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.readContract = sinon.stub().resolves(0);
      rpcMock.simulateContract = sinon.stub().throws(new Error("simulateContract error"));
      walletMock.writeContract = sinon.stub().resolves(txHash);
      let error: Error | undefined;
      const request: RegisterPILPolicyRequest = {
        transferable: true,
      };
      try {
        await policyClient.registerPILPolicy(request);
      } catch (err) {
        error = err as Error;
        expect(error?.message).to.equal("Failed to register policy: simulateContract error");
      }
    });

    it("should throw error if writeContract throws an error", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      rpcMock.readContract = sinon.stub().resolves(0);
      walletMock.writeContract = sinon.stub().throws(new Error("writeContract error"));
      const request: RegisterPILPolicyRequest = {
        transferable: true,
      };
      try {
        await policyClient.registerPILPolicy(request);
      } catch (err) {
        expect((err as Error).message).to.equal("Failed to register policy: writeContract error");
      }
    });

    it("should return policyId only if readContract resolves 0", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.simulateContract = sinon.stub().resolves({ request: {} });
      rpcMock.readContract = sinon.stub().resolves("0x0000000000000000000000000000000000000001");
      walletMock.writeContract = sinon.stub().resolves(txHash);
      const request: RegisterPILPolicyRequest = { transferable: true };
      const result = await policyClient.registerPILPolicy(request);
      expect(Object.keys(result).length).to.equal(1);
      expect(Object.keys(result)[0]).to.equal("policyId");
      expect(result.policyId).to.equal("1");
    });
    it("should return txHash only if request.txOptions is missing", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.simulateContract = sinon.stub().resolves({ request: {} });
      rpcMock.readContract = sinon.stub().resolves(0);
      walletMock.writeContract = sinon.stub().resolves(txHash);
      const request: RegisterPILPolicyRequest = {
        transferable: true,
      };
      const result = await policyClient.registerPILPolicy(request);
      expect(Object.keys(result).length).to.equal(1);
      expect(Object.keys(result)[0]).to.equal("txHash");
      expect(result.txHash).to.equal(txHash);
    });

    it("should return licenseId if request.txOptions is present", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      sinon.stub(utils, "waitTxAndFilterLog").resolves([
        {
          eventName: "PolicyRegistered",
          args: {
            policyId: "7",
          },
        },
      ]);
      rpcMock.simulateContract = sinon.stub().resolves({
        request: {
          abi: "event",
          eventName: "PolicyRegistered",
        },
      });
      rpcMock.readContract = sinon.stub().resolves(0);
      walletMock.writeContract = sinon.stub().resolves(txHash);
      const request: RegisterPILPolicyRequest = {
        transferable: true,
        txOptions: {
          waitForTransaction: true,
        },
      };
      const result = await policyClient.registerPILPolicy(request);
      expect(result.txHash).to.equal(txHash);
      expect(result.policyId).to.equal("7");
    });
  });

  describe("test for addPolicyToIp", () => {
    let policyClient: PolicyClient;
    let rpcMock: PublicClient;
    let walletMock: WalletClient;
    const ipId = "0x2222222222222222222222222222222222222222";
    const policyId = "3";

    beforeEach(function () {
      rpcMock = createMock<PublicClient>();
      walletMock = createMock<WalletClient>();
      const accountMock = createMock<Account>();
      accountMock.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
      walletMock.account = accountMock;
      policyClient = new PolicyClient(rpcMock, walletMock, "sepolia");
    });

    afterEach(function () {
      sinon.restore();
    });
    it("should throw invalidAddressError if address is invalid", async () => {
      const request: AddPolicyToIpRequest = {
        ipId: "0xKKKKKKKK", // invalid address
        policyId,
        txOptions: {
          waitForTransaction: true,
        },
      };
      try {
        await policyClient.addPolicyToIp(request);
      } catch (err) {
        expect((err as Error).message).includes(
          'Failed to add policy to IP: Address "0xKKKKKKKK" is invalid.',
        );
      }
    });

    it("should throw error if simulateContract throws an error", async () => {
      rpcMock.simulateContract = sinon.stub().throws(new Error("simulateContract error"));
      const request: AddPolicyToIpRequest = {
        ipId,
        policyId,
        txOptions: {
          waitForTransaction: true,
        },
      };
      try {
        await policyClient.addPolicyToIp(request);
      } catch (err) {
        expect((err as Error).message).includes(
          "Failed to add policy to IP: simulateContract error",
        );
      }
    });

    it("should throw error if writeContract throws an error", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().throws(new Error("writeContract error"));
      const request: AddPolicyToIpRequest = {
        ipId,
        policyId,
        txOptions: {
          waitForTransaction: true,
        },
      };
      try {
        await policyClient.addPolicyToIp(request);
      } catch (err) {
        expect((err as Error).message).to.equal("Failed to add policy to IP: writeContract error");
      }
    });

    it("should return txHash only if request.txOptions is missing", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.simulateContract = sinon.stub().resolves({ request: {} });
      walletMock.writeContract = sinon.stub().resolves(txHash);
      const request: AddPolicyToIpRequest = {
        ipId,
        policyId,
      };
      const result = await policyClient.addPolicyToIp(request);
      expect(Object.keys(result).length).to.equal(1);
      expect(Object.keys(result)[0]).to.equal("txHash");
      expect(result.txHash).to.equal(txHash);
    });

    it("should return index if request.txOptions is present", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      sinon.stub(utils, "waitTxAndFilterLog").resolves([
        {
          eventName: "PolicyAddedToIpId",
          args: {
            index: "10",
          },
        },
      ]);
      rpcMock.simulateContract = sinon.stub().resolves({
        request: {
          abi: "event",
          eventName: "PolicyAddedToIpId",
        },
      });
      walletMock.writeContract = sinon.stub().resolves(txHash);
      const request: AddPolicyToIpRequest = {
        ipId,
        policyId: "1",
        txOptions: {
          waitForTransaction: true,
        },
      };
      const result = await policyClient.addPolicyToIp(request);
      expect(result.txHash).to.equal(txHash);
      expect(result.index).to.equal("10");
    });
  });

  describe("Test registerPILSocialRemixPolicy", () => {
    let policyClient: PolicyClient;
    let rpcMock: PublicClient;
    let walletMock: WalletClient;
    const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";

    beforeEach(function () {
      rpcMock = createMock<PublicClient>();
      walletMock = createMock<WalletClient>();
      const accountMock = createMock<Account>();
      accountMock.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
      walletMock.account = accountMock;
      policyClient = new PolicyClient(rpcMock, walletMock, "sepolia");
    });

    afterEach(function () {
      sinon.restore();
    });

    it("should return readContract error if readContract throws an error", async () => {
      rpcMock.readContract = sinon.stub().rejects(new Error("readContract error"));
      const request: RegisterPILSocialRemixPolicyRequest = {};
      try {
        await policyClient.registerPILSocialRemixPolicy(request);
      } catch (err) {
        expect((err as Error).message).includes("readContract error");
      }
    });

    it("should return policyId only, if contract is successfully read", async () => {
      rpcMock.readContract = sinon.stub().resolves("0x0000000000000000000000000000000000000001");
      const request: RegisterPILSocialRemixPolicyRequest = {};
      const result = await policyClient.registerPILSocialRemixPolicy(request);
      expect(Object.keys(result)).includes.all.members(["policyId"]);
      expect(result.policyId).to.equal("1");
    });

    it("should throw simulateContract error, if simulateContract throws an error", async () => {
      rpcMock.readContract = sinon.stub().resolves("0x0000000000000000000000000000000000000000");
      rpcMock.simulateContract = sinon.stub().rejects(new Error("simulateContract error"));
      const request: RegisterPILSocialRemixPolicyRequest = {};
      try {
        await policyClient.registerPILSocialRemixPolicy(request);
      } catch (err) {
        expect((err as Error).message).includes("simulateContract error");
      }
    });

    it("should throw writeContract error, if writeContract throws an error", async () => {
      rpcMock.readContract = sinon.stub().resolves("0x0000000000000000000000000000000000000000");
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().rejects(new Error("writeContract error"));
      const request: RegisterPILSocialRemixPolicyRequest = {};
      try {
        await policyClient.registerPILSocialRemixPolicy(request);
      } catch (err) {
        expect((err as Error).message).includes("writeContract error");
      }
    });

    it("should throw writeContract error, if writeContract throws an error", async () => {
      rpcMock.readContract = sinon.stub().resolves("0x0000000000000000000000000000000000000000");
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().rejects(new Error("writeContract error"));
      const request: RegisterPILSocialRemixPolicyRequest = {};
      try {
        await policyClient.registerPILSocialRemixPolicy(request);
      } catch (err) {
        expect((err as Error).message).includes("writeContract error");
      }
    });

    it("should throw waitTxAndFilterLog error, if waitTxAndFilterLog throws an error", async () => {
      rpcMock.readContract = sinon.stub().resolves("0x0000000000000000000000000000000000000000");
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves();
      sinon.stub(utils, "waitTxAndFilterLog").rejects(new Error("waitTxAndFilterLog error"));
      const request: RegisterPILSocialRemixPolicyRequest = {
        txOptions: {
          waitForTransaction: true,
        },
      };
      try {
        await policyClient.registerPILSocialRemixPolicy(request);
      } catch (err) {
        expect((err as Error).message).includes("waitTxAndFilterLog error");
      }
    });

    it("should return txHash only, if txOptions.waitForTransaction is falsy", async () => {
      rpcMock.readContract = sinon.stub().resolves("0x0000000000000000000000000000000000000000");
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);
      sinon.stub(utils, "waitTxAndFilterLog").rejects(new Error("waitTxAndFilterLog error"));
      const request: RegisterPILSocialRemixPolicyRequest = {
        txOptions: {
          waitForTransaction: false,
        },
      };
      const result = await policyClient.registerPILSocialRemixPolicy(request);
      expect(Object.keys(result)).includes.all.members(["txHash"]);
      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash and policyId, if txOptions.waitForTransaction is true", async () => {
      rpcMock.readContract = sinon.stub().resolves("0x0000000000000000000000000000000000000000");
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().resolves(txHash);
      sinon.stub(utils, "waitTxAndFilterLog").resolves([
        {
          eventName: "PolicyRegistered",
          args: {
            policyId: zeroAddress,
          },
        },
      ]);
      const request: RegisterPILSocialRemixPolicyRequest = {
        txOptions: {
          waitForTransaction: true,
        },
      };
      const result = await policyClient.registerPILSocialRemixPolicy(request);
      expect(result.txHash).to.equal(txHash);
      expect(result.policyId).to.equal(zeroAddress);
    });

    describe("Test registerPILCommercialUsePolicy", () => {
      let policyClient: PolicyClient;
      let rpcMock: PublicClient;
      let walletMock: WalletClient;
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";

      beforeEach(function () {
        rpcMock = createMock<PublicClient>();
        walletMock = createMock<WalletClient>();
        const accountMock = createMock<Account>();
        accountMock.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
        walletMock.account = accountMock;
        policyClient = new PolicyClient(rpcMock, walletMock, "sepolia");
      });

      afterEach(function () {
        sinon.restore();
      });

      it("should return readContract error if readContract throws an error", async () => {
        rpcMock.readContract = sinon.stub().rejects(new Error("readContract error"));
        const request: RegisterPILCommercialUsePolicyRequest = { commercialRevShare: 10 };
        try {
          await policyClient.registerPILCommercialUsePolicy(request);
        } catch (err) {
          expect((err as Error).message).includes("readContract error");
        }
      });

      it("should return policyId only, if contract is successfully read", async () => {
        rpcMock.readContract = sinon.stub().resolves("0x0000000000000000000000000000000000000001");
        const request: RegisterPILCommercialUsePolicyRequest = { commercialRevShare: 10 };
        const result = await policyClient.registerPILCommercialUsePolicy(request);
        expect(Object.keys(result)).includes.all.members(["policyId"]);
        expect(result.policyId).to.equal("1");
      });

      it("should throw simulateContract error, if simulateContract throws an error", async () => {
        rpcMock.readContract = sinon.stub().resolves("0x0000000000000000000000000000000000000000");
        rpcMock.simulateContract = sinon.stub().rejects(new Error("simulateContract error"));
        const request: RegisterPILCommercialUsePolicyRequest = { commercialRevShare: 10 };
        try {
          await policyClient.registerPILCommercialUsePolicy(request);
        } catch (err) {
          expect((err as Error).message).includes("simulateContract error");
        }
      });

      it("should throw writeContract error, if writeContract throws an error", async () => {
        rpcMock.readContract = sinon.stub().resolves("0x0000000000000000000000000000000000000000");
        rpcMock.simulateContract = sinon.stub().resolves({ request: null });
        walletMock.writeContract = sinon.stub().rejects(new Error("writeContract error"));
        const request: RegisterPILCommercialUsePolicyRequest = { commercialRevShare: 10 };
        try {
          await policyClient.registerPILCommercialUsePolicy(request);
        } catch (err) {
          expect((err as Error).message).includes("writeContract error");
        }
      });

      it("should throw writeContract error, if writeContract throws an error", async () => {
        rpcMock.readContract = sinon.stub().resolves("0x0000000000000000000000000000000000000000");
        rpcMock.simulateContract = sinon.stub().resolves({ request: null });
        walletMock.writeContract = sinon.stub().rejects(new Error("writeContract error"));
        const request: RegisterPILCommercialUsePolicyRequest = { commercialRevShare: 10 };
        try {
          await policyClient.registerPILCommercialUsePolicy(request);
        } catch (err) {
          expect((err as Error).message).includes("writeContract error");
        }
      });

      it("should throw waitTxAndFilterLog error, if waitTxAndFilterLog throws an error", async () => {
        rpcMock.readContract = sinon.stub().resolves("0x0000000000000000000000000000000000000000");
        rpcMock.simulateContract = sinon.stub().resolves({ request: null });
        walletMock.writeContract = sinon.stub().resolves();
        sinon.stub(utils, "waitTxAndFilterLog").rejects(new Error("waitTxAndFilterLog error"));
        const request: RegisterPILCommercialUsePolicyRequest = {
          commercialRevShare: 10,
          txOptions: {
            waitForTransaction: true,
          },
        };
        try {
          await policyClient.registerPILCommercialUsePolicy(request);
        } catch (err) {
          expect((err as Error).message).includes("waitTxAndFilterLog error");
        }
      });

      it("should return txHash only, if txOptions.waitForTransaction is falsy", async () => {
        rpcMock.readContract = sinon.stub().resolves("0x0000000000000000000000000000000000000000");
        rpcMock.simulateContract = sinon.stub().resolves({ request: null });
        walletMock.writeContract = sinon.stub().resolves(txHash);
        sinon.stub(utils, "waitTxAndFilterLog").rejects(new Error("waitTxAndFilterLog error"));
        const request: RegisterPILCommercialUsePolicyRequest = {
          commercialRevShare: 10,
          txOptions: {
            waitForTransaction: false,
          },
        };
        const result = await policyClient.registerPILCommercialUsePolicy(request);
        expect(Object.keys(result)).includes.all.members(["txHash"]);
        expect(result.txHash).to.equal(txHash);
      });

      it("should return txHash and policyId, if txOptions.waitForTransaction is true", async () => {
        rpcMock.readContract = sinon.stub().resolves("0x0000000000000000000000000000000000000000");
        rpcMock.simulateContract = sinon.stub().resolves({ request: null });
        walletMock.writeContract = sinon.stub().resolves(txHash);
        sinon.stub(utils, "waitTxAndFilterLog").resolves([
          {
            eventName: "PolicyRegistered",
            args: {
              policyId: zeroAddress,
            },
          },
        ]);
        const request: RegisterPILCommercialUsePolicyRequest = {
          commercialRevShare: 10,
          txOptions: {
            waitForTransaction: true,
          },
        };
        const result = await policyClient.registerPILCommercialUsePolicy(request);
        expect(result.txHash).to.equal(txHash);
        expect(result.policyId).to.equal(zeroAddress);
      });
    });
  });
});
