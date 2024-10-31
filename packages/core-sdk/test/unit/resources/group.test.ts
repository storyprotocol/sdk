import chai from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { PublicClient, WalletClient, Account } from "viem";
import chaiAsPromised from "chai-as-promised";
import { GroupClient } from "../../../src";
const { IpAccountImplClient } = require("../../../src/abi/generated");

chai.use(chaiAsPromised);
const expect = chai.expect;
const txHash = "0x2e778894d11b5308e4153f094e190496c1e0609652c19f8b87e5176484b9a56e";
describe("Test IpAssetClient", () => {
  let groupClient: GroupClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(() => {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<Account>();
    walletMock.account = accountMock;
    walletMock.signTypedData = sinon
      .stub()
      .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
    groupClient = new GroupClient(rpcMock, walletMock, "1516");
    (groupClient.groupingWorkflowsClient as any).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (groupClient.groupingModuleClient as any).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (groupClient.coreMetadataModuleClient as any).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (groupClient.licensingModuleClient as any).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    sinon
      .stub(IpAccountImplClient.prototype, "state")
      .resolves({ result: "0x2e778894d11b5308e4153f094e190496c1e0609652c19f8b87e5176484b9a56e" });
  });

  afterEach(() => {
    sinon.restore();
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
      expect(result.groupId).equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
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
    it("should throw group id register error when call registerGroupAndAttachLicenseAndAddIps given ip id is not registered", async () => {
      try {
        sinon
          .stub(groupClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
          .resolves(true);
        sinon.stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(false);
        await groupClient.registerGroupAndAttachLicenseAndAddIps({
          groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          ipIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
          licenseTermsId: "100",
          licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register group and attach license and add ips: IP 0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c is not registered.",
        );
      }
    });
    it("should throw not attach between license terms and ip id when call registerGroupAndAttachLicenseAndAddIps given ipIds is not attach license terms", async () => {
      try {
        sinon
          .stub(groupClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
          .resolves(false);
        sinon.stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
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
      sinon.stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);

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
      sinon.stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
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
      sinon.stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
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

  describe("Test groupClient.mintAndRegisterIpAndAttachLicenseAndAddToGroup", async () => {
    beforeEach(() => {});
    it("should throw group id register error when call mintAndRegisterIpAndAttachLicenseAndAddToGroup given group id is not registered", async () => {
      sinon.stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await groupClient.mintAndRegisterIpAndAttachLicenseAndAddToGroup({
          groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          spgNftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          licenseTermsId: "100",
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to mint and register IP and attach license and add to group: Group IP 0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c is not registered.",
        );
      }
    });

    it("should return txHash when call mintAndRegisterIpAndAttachLicenseAndAddToGroup given correct args", async () => {
      sinon.stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(groupClient.groupingWorkflowsClient, "mintAndRegisterIpAndAttachLicenseAndAddToGroup")
        .resolves(txHash);

      const result = await groupClient.mintAndRegisterIpAndAttachLicenseAndAddToGroup({
        groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        spgNftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        licenseTermsId: "100",
      });
      expect(result.txHash).equal(txHash);
    });

    it("should return txHash when call mintAndRegisterIpAndAttachLicenseAndAddToGroup given correct args with waitForTransaction of true", async () => {
      sinon.stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(groupClient.groupingWorkflowsClient, "mintAndRegisterIpAndAttachLicenseAndAddToGroup")
        .resolves(txHash);
      sinon.stub(groupClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x",
          tokenId: 0n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      const result = await groupClient.mintAndRegisterIpAndAttachLicenseAndAddToGroup({
        groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        spgNftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        licenseTermsId: "100",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).equal(txHash);
      expect(result.ipId).equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      expect(result.tokenId).equal(0n);
    });

    it("should return encodedData when call mintAndRegisterIpAndAttachLicenseAndAddToGroup successfully with encodedTxDataOnly of true", async () => {
      sinon.stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(
          groupClient.groupingWorkflowsClient,
          "mintAndRegisterIpAndAttachLicenseAndAddToGroupEncode",
        )
        .returns({
          data: "0x11111111111111111111111111111",
          to: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        });

      const result = await groupClient.mintAndRegisterIpAndAttachLicenseAndAddToGroup({
        groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        spgNftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        licenseTermsId: "100",
        recipient: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        ipMetadata: {
          ipMetadataHash: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          ipMetadataURI: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          nftMetadataHash: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          nftMetadataURI: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
        txOptions: {
          encodedTxDataOnly: true,
        },
      });
      expect(result.encodedTxData!.data).to.be.a("string").and.not.empty;
    });
  });

  describe("Test groupClient.registerIpAndAttachLicenseAndAddToGroup", async () => {
    it("should throw group id register error when call registerIpAndAttachLicenseAndAddToGroup given ip id is not registered", async () => {
      sinon
        .stub(groupClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await groupClient.registerIpAndAttachLicenseAndAddToGroup({
          groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: "100",
          licenseTermsId: "100",
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and attach license and add to group: Group IP 0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c is not registered.",
        );
      }
    });
    it("should throw nft contract error when call registerIpAndAttachLicenseAndAddToGroup given nft contract address is invalid", async () => {
      sinon
        .stub(groupClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      try {
        await groupClient.registerIpAndAttachLicenseAndAddToGroup({
          groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          nftContract: "0x",
          tokenId: "100",
          licenseTermsId: "100",
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and attach license and add to group: nftContract address is invalid: 0x, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.",
        );
      }
    });

    it("should return txHash when call registerIpAndAttachLicenseAndAddToGroup given correct args", async () => {
      sinon
        .stub(groupClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(groupClient.groupingWorkflowsClient, "registerIpAndAttachLicenseAndAddToGroup")
        .resolves(txHash);
      const result = await groupClient.registerIpAndAttachLicenseAndAddToGroup({
        groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "100",
        licenseTermsId: "100",
      });
      expect(result.txHash).equal(txHash);
    });

    it("should return txHash when call registerIpAndAttachLicenseAndAddToGroup given correct args with waitForTransaction of true", async () => {
      sinon
        .stub(groupClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(groupClient.groupingWorkflowsClient, "registerIpAndAttachLicenseAndAddToGroup")
        .resolves(txHash);
      sinon.stub(groupClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x",
          tokenId: 0n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      const result = await groupClient.registerIpAndAttachLicenseAndAddToGroup({
        groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "100",
        licenseTermsId: "100",
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).equal(txHash);
      expect(result.ipId).equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
    });

    it("should return encodedData when call registerIpAndAttachLicenseAndAddToGroup successfully with encodedTxDataOnly of true", async () => {
      sinon
        .stub(groupClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(groupClient.groupingWorkflowsClient, "registerIpAndAttachLicenseAndAddToGroupEncode")
        .returns({
          data: "0x11111111111111111111111111111",
          to: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        });
      const result = await groupClient.registerIpAndAttachLicenseAndAddToGroup({
        groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "100",
        licenseTermsId: "100",
        licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        ipMetadata: {
          ipMetadataHash: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          ipMetadataURI: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          nftMetadataHash: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          nftMetadataURI: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
        txOptions: {
          encodedTxDataOnly: true,
        },
      });
      expect(result.encodedTxData!.data).to.be.a("string").and.not.empty;
    });
  });
});
