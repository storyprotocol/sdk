import { expect } from "chai";
import sinon from "sinon";
import { PublicClient, WalletClient, Account } from "viem";
import { StoryAPIClient } from "../../../src/clients/storyAPI";
import { LicenseClient } from "../../../src/resources/license";
import * as royaltyContextUtils from "../../../src/utils/royaltyContext";
import { createMock } from "../testUtils";
import { LinkIpToParentRequest, MintLicenseRequest } from "../../../src/types/resources/license";
import * as utils from "../../../src/utils/utils";

describe("Test LicenseClient", () => {
  let licenseClient: LicenseClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;
  let storyMock: StoryAPIClient;
  const policyId = "1";
  const licensorIpId = "0x2222222222222222222222222222222222222222";
  const mintAmount = 3;
  const receiverAddress = "0x3333333333333333333333333333333333333333";

  beforeEach(function () {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    storyMock = createMock<StoryAPIClient>();
    const accountMock = createMock<Account>();
    accountMock.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
    walletMock.account = accountMock;
    licenseClient = new LicenseClient(rpcMock, walletMock, storyMock, "sepolia");
  });

  afterEach(function () {
    sinon.restore();
  });
  describe("test for mintLicense", () => {
    it("should throw invalidAddressError if address is invalid", async () => {
      storyMock.getRoyaltyPolicy = sinon.stub().resolves();
      const request: MintLicenseRequest = {
        policyId,
        licensorIpId,
        mintAmount,
        receiverAddress: "0xKKKKKKKK", // invalid address,
      };
      try {
        await licenseClient.mintLicense(request);
      } catch (err) {
        expect((err as Error).message).includes(
          'Failed to mint license: Address "0xKKKKKKKK" is invalid.',
        );
      }
    });

    it("should throw error if simulateContract throws an error", async () => {
      storyMock.getRoyaltyPolicy = sinon
        .stub()
        .resolves({ targetAncestors: [], targetRoyaltyAmount: [] });
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.simulateContract = sinon.stub().throws(new Error("simulateContract error"));
      walletMock.writeContract = sinon.stub().resolves(txHash);
      const request: MintLicenseRequest = {
        policyId,
        licensorIpId,
        mintAmount,
        receiverAddress,
      };
      try {
        await licenseClient.mintLicense(request);
      } catch (err) {
        expect((err as Error).message).to.equal("Failed to mint license: simulateContract error");
      }
    });

    it("should throw error if writeContract throws an error", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      storyMock.getRoyaltyPolicy = sinon.stub().resolves();
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().throws(new Error("writeContract error"));
      const request: MintLicenseRequest = {
        policyId,
        licensorIpId,
        mintAmount,
        receiverAddress,
      };
      try {
        await licenseClient.mintLicense(request);
      } catch (err) {
        expect((err as Error).message).to.equal("Failed to mint license: writeContract error");
      }
    });

    it("should return txHash only if request.txOptions is missing", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.simulateContract = sinon.stub().resolves({ request: {} });
      walletMock.writeContract = sinon.stub().resolves(txHash);
      storyMock.getRoyaltyPolicy = sinon.stub().resolves();
      const request: MintLicenseRequest = {
        policyId,
        licensorIpId,
        mintAmount,
        receiverAddress,
      };
      const result = await licenseClient.mintLicense(request);
      expect(Object.keys(result).length).to.equal(1);
      expect(Object.keys(result)[0]).to.equal("txHash");
      expect(result.txHash).to.equal(txHash);
    });

    it("should return licenseId if request.txOptions is present", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      storyMock.getRoyaltyPolicy = sinon.stub().resolves();
      sinon.stub(utils, "waitTxAndFilterLog").resolves([
        {
          eventName: "TransferSingle",
          args: {
            id: "7",
          },
        },
      ]);
      rpcMock.simulateContract = sinon.stub().resolves({
        request: {
          abi: "event",
          eventName: "TransferSingle",
        },
      });
      walletMock.writeContract = sinon.stub().resolves(txHash);
      const request: MintLicenseRequest = {
        policyId,
        licensorIpId,
        mintAmount,
        receiverAddress,
        txOptions: {
          waitForTransaction: true,
        },
      };
      const result = await licenseClient.mintLicense(request);
      expect(result.txHash).to.equal(txHash);
      expect(result.licenseId).to.equal("7");
    });
  });

  describe("test for linkIpToParent", () => {
    let licenseClient: LicenseClient;
    let rpcMock: PublicClient;
    let walletMock: WalletClient;
    const childIpId = "0x2222222222222222222222222222222222222222";
    const licenseIds = ["0x2222222222222222222222222222222222222222"];

    beforeEach(function () {
      rpcMock = createMock<PublicClient>();
      walletMock = createMock<WalletClient>();
      const accountMock = createMock<Account>();
      accountMock.address = "0x73fcb515cee99e4991465ef586cfe2b072ebb512";
      walletMock.account = accountMock;
      licenseClient = new LicenseClient(rpcMock, walletMock, storyMock, "sepolia");
      sinon.stub(royaltyContextUtils, "computeRoyaltyContext").resolves();
      sinon
        .stub(royaltyContextUtils, "encodeRoyaltyContext")
        .returns("0x2222222222222222222222222222222222");
    });

    afterEach(function () {
      sinon.restore();
    });
    it("should throw invalidAddressError if address is invalid", async () => {
      const request: LinkIpToParentRequest = {
        licenseIds,
        childIpId: "0xKKKKKKKK", // invalid address,
      };
      try {
        await licenseClient.linkIpToParent(request);
      } catch (err) {
        expect((err as Error).message).includes(
          'Failed to link IP to parents: Address "0xKKKKKKKK" is invalid.',
        );
      }
    });

    it("should throw error if simulateContract throws an error", async () => {
      rpcMock.simulateContract = sinon.stub().throws(new Error("simulateContract error"));
      storyMock.getLicense = sinon.stub().resolves();
      const request: LinkIpToParentRequest = {
        licenseIds,
        childIpId,
      };
      try {
        await licenseClient.linkIpToParent(request);
      } catch (err) {
        expect((err as Error).message).includes(
          "Failed to link IP to parents: simulateContract error",
        );
      }
    });

    it("should throw error if writeContract throws an error", async () => {
      rpcMock.simulateContract = sinon.stub().resolves({ request: null });
      walletMock.writeContract = sinon.stub().throws(new Error("writeContract error"));
      const request: LinkIpToParentRequest = {
        licenseIds,
        childIpId,
      };
      try {
        await licenseClient.linkIpToParent(request);
      } catch (err) {
        expect((err as Error).message).to.equal(
          "Failed to link IP to parents: writeContract error",
        );
      }
    });

    it("should return txHash only if request.txOptions is missing", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      rpcMock.simulateContract = sinon.stub().resolves({ request: {} });
      walletMock.writeContract = sinon.stub().resolves(txHash);
      const request: LinkIpToParentRequest = {
        licenseIds,
        childIpId,
      };
      const result = await licenseClient.linkIpToParent(request);
      expect(Object.keys(result).length).to.equal(1);
      expect(Object.keys(result)[0]).to.equal("txHash");
      expect(result.txHash).to.equal(txHash);
    });
    it("should return licenseId if request.txOptions is present", async () => {
      const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      sinon.stub(utils, "waitTxAndFilterLog").resolves([
        {
          eventName: "TransferBatch",
          args: {
            ids: [7],
          },
        },
      ]);
      rpcMock.simulateContract = sinon.stub().resolves({
        request: {
          abi: "event",
          eventName: "TransferBatch",
        },
      });
      walletMock.writeContract = sinon.stub().resolves(txHash);
      const request: LinkIpToParentRequest = {
        licenseIds,
        childIpId,
        txOptions: {
          waitForTransaction: true,
        },
      };
      const result = await licenseClient.linkIpToParent(request);
      expect(result.txHash).to.equal(txHash);
      expect(result.success).to.equal(true);
    });
  });
});
