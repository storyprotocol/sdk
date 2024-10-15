import { PublicClient, WalletClient, Account, Hex } from "viem";
import { createMock } from "../testUtils";
import { GroupClient } from "../../../src/resources/group";
import sinon from "sinon";
import { expect } from "chai";

describe("Test GroupClient", () => {
  let groupClient: GroupClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;
  const txHash: Hex = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
  beforeEach(() => {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<Account>();
    walletMock.account = accountMock;
    groupClient = new GroupClient(rpcMock, walletMock, "1513");
  });

  describe("Test groupClient.registerGroup", async () => {
    it("should throw groupPool address is invalid error when groupPool is invalid", async () => {
      try {
        await groupClient.registerGroup({
          groupPool: "0x123",
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register group: request.groupPool address is invalid: 0x123, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.",
        );
      }
    });

    it("should return txHash when call registerGroup successfully", async () => {
      sinon.stub(groupClient.groupingModuleClient, "registerGroup").resolves(txHash);
      const result = await groupClient.registerGroup({
        groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });
      expect(result.txHash).equal(txHash);
    });

    it("should return txHash when call registerGroup successfully with waitForTransaction of true", async () => {
      sinon.stub(groupClient.groupingModuleClient, "registerGroup").resolves(txHash);
      sinon.stub(groupClient.groupingModuleEventClient, "parseTxIpGroupRegisteredEvent").returns([
        {
          groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      ]);
      const result = await groupClient.registerGroup({
        groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).equal(txHash);
    });

    it("should return encodedData when call registerGroup successfully with encodedTxDataOnly of true", async () => {
      const result = await groupClient.registerGroup({
        groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        txOptions: {
          encodedTxDataOnly: true,
        },
      });
      expect(result.encodedTxData!.data).to.be.a("string").and.not.empty;
    });
  });
  describe("Test groupClient.registerGroupAndAttachLicense", async () => {
    it("should throw licenseTemplate error when call registerGroupAndAttachLicense given licenseTemplate is invalid", async () => {
      try {
        await groupClient.registerGroupAndAttachLicense({
          groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          licenseTermsId: "0x123",
          licenseTemplate: "0x123",
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register group and attach license: request.licenseTemplate address is invalid: 0x123, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.",
        );
      }
    });
    it("should return txHash when call registerGroupAndAttachLicense successfully", async () => {
      sinon
        .stub(groupClient.groupingWorkflowsClient, "registerGroupAndAttachLicense")
        .resolves(txHash);
      const result = await groupClient.registerGroupAndAttachLicense({
        groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        licenseTermsId: "100",
        licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });
      expect(result.txHash).equal(txHash);
    });

    it("should return txHash when call registerGroupAndAttachLicense successfully with waitForTransaction of true", async () => {
      sinon
        .stub(groupClient.groupingWorkflowsClient, "registerGroupAndAttachLicense")
        .resolves(txHash);
      sinon.stub(groupClient.groupingModuleEventClient, "parseTxIpGroupRegisteredEvent").returns([
        {
          groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      ]);
      const result = await groupClient.registerGroupAndAttachLicense({
        groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        licenseTermsId: "100",
        licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).equal(txHash);
    });

    it("should return encodedData when call registerGroupAndAttachLicense successfully with encodedTxDataOnly of true", async () => {
      const result = await groupClient.registerGroupAndAttachLicense({
        groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        licenseTermsId: "100",
        licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        txOptions: {
          encodedTxDataOnly: true,
        },
      });
      expect(result.encodedTxData!.data).to.be.a("string").and.not.empty;
    });
  });
  describe("Test groupClient.registerGroupAndAttachLicenseAndAddIps", async () => {
    it("should throw not attach between license terms and ip id when call registerGroupAndAttachLicenseAndAddIps given ipIds is not attach license terms", async () => {
      try {
        sinon
          .stub(groupClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
          .resolves(false);
        await groupClient.registerGroupAndAttachLicenseAndAddIps({
          groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          ipIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
          licenseTermsId: "100",
          licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register group and attach license and add ips: License terms must be attached to IP 0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c before adding to group.",
        );
      }
    });

    it("should return encodedData when call registerGroupAndAttachLicenseAndAddIps successfully with encodedTxDataOnly of true", async () => {
      sinon
        .stub(groupClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      const result = await groupClient.registerGroupAndAttachLicenseAndAddIps({
        groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        ipIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        licenseTermsId: "100",
        licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        txOptions: {
          encodedTxDataOnly: true,
        },
      });
      expect(result.encodedTxData!.data).to.be.a("string").and.not.empty;
    });
    it("should return txHash when call registerGroupAndAttachLicenseAndAddIps given correct args", async () => {
      sinon
        .stub(groupClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon
        .stub(groupClient.groupingWorkflowsClient, "registerGroupAndAttachLicenseAndAddIps")
        .resolves(txHash);
      const result = await groupClient.registerGroupAndAttachLicenseAndAddIps({
        groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        ipIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        licenseTermsId: "100",
      });
      expect(result.txHash).equal(txHash);
    });

    it("should return txHash when call registerGroupAndAttachLicenseAndAddIps given correct args with waitForTransaction of true", async () => {
      sinon
        .stub(groupClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon
        .stub(groupClient.groupingWorkflowsClient, "registerGroupAndAttachLicenseAndAddIps")
        .resolves(txHash);
      sinon.stub(groupClient.groupingModuleEventClient, "parseTxIpGroupRegisteredEvent").returns([
        {
          groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      ]);
      const result = await groupClient.registerGroupAndAttachLicenseAndAddIps({
        groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        ipIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        licenseTermsId: "100",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).equal(txHash);
    });
  });
});
