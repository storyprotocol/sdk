import chai from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import {
  CreateIpAssetWithPilTermsRequest,
  IPAssetClient,
  LicenseTerms,
  PIL_TYPE,
} from "../../../src";
import {
  PublicClient,
  WalletClient,
  Account,
  toHex,
  zeroHash,
  LocalAccount,
  zeroAddress,
  Address,
} from "viem";
import chaiAsPromised from "chai-as-promised";
import { RegisterIpAndAttachPilTermsRequest } from "../../../src/types/resources/ipAsset";
import { MockERC20 } from "../../integration/utils/mockERC20";
import {
  LicenseRegistryReadOnlyClient,
  LicensingModuleLicenseTermsAttachedEvent,
} from "../../../src/abi/generated";
const { RoyaltyModuleReadOnlyClient } = require("../../../src/abi/generated");
const { IpAccountImplClient } = require("../../../src/abi/generated");
const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Test IpAssetClient", () => {
  let ipAssetClient: IPAssetClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;
  const spgNftContract = "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";

  beforeEach(() => {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<LocalAccount>();
    walletMock.account = accountMock;
    sinon.stub(LicenseRegistryReadOnlyClient.prototype, "getDefaultLicenseTerms").resolves({
      licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      licenseTermsId: 5n,
    });

    ipAssetClient = new IPAssetClient(rpcMock, walletMock, "1516");
    walletMock.signTypedData = sinon
      .stub()
      .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
    (ipAssetClient.derivativeWorkflowsClient as any).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (ipAssetClient.accessControllerClient as any).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (ipAssetClient.coreMetadataModuleClient as any).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (ipAssetClient.licensingModuleClient as any).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (ipAssetClient.registrationWorkflowsClient as any).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (ipAssetClient.licenseAttachmentWorkflowsClient as any).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (ipAssetClient.licenseTemplateClient as any).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("IP Metadata Functions", () => {
    const sampleCreatorData = {
      name: "Jane Doe",
      address: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c" as Address,
      description: "Author",
      image: "https://example.com/jane.jpg",
      socialMedia: [{ platform: "Twitter", url: "https://twitter.com/janedoe" }],
      contributionPercent: 100,
      role: "Author",
    };

    const sampleMetadataData = {
      title: "The Great Adventure",
      description: "A thrilling adventure story",
      ipType: "Book",
      relationships: [
        {
          parentIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512" as Address,
          type: "APPEARS_IN",
        },
      ],
      createdAt: "2024-08-22T10:20:30Z",
      watermarkImg: "https://example.com/watermark.png",
      creators: [sampleCreatorData],
      media: [
        { name: "Cover Image", url: "https://example.com/cover.jpg", mimeType: "image/jpeg" },
      ],
      attributes: [
        { key: "Genre", value: "Adventure" },
        { key: "Pages", value: 350 },
      ],
      app: { id: "app_001", name: "Story Protocol", website: "https://story.foundation" },
      tags: ["Adventure", "Thriller"],
      robotTerms: { userAgent: "*", allow: "/" },
      customField1: "Custom Value 1",
      customField2: 42,
    };

    describe("generateCreatorMetadata", function () {
      it("should create an IpCreator object with the provided details", function () {
        const creator = ipAssetClient.generateCreatorMetadata(sampleCreatorData);

        expect(creator).to.be.an("object");
        expect(creator).to.have.property("name", "Jane Doe");
        expect(creator).to.have.property("address", "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
        expect(creator).to.have.property("description", "Author");
        expect(creator).to.have.property("image", "https://example.com/jane.jpg");
        expect(creator)
          .to.have.property("socialMedia")
          .that.is.an("array")
          .that.deep.equals([{ platform: "Twitter", url: "https://twitter.com/janedoe" }]);
        expect(creator).to.have.property("contributionPercent", 100);
        expect(creator).to.have.property("role", "Author");
      });
    });

    describe("generateIpMetadata", function () {
      it("should create an IpMetadata object with the provided details", function () {
        const metadata = ipAssetClient.generateIpMetadata(sampleMetadataData);

        expect(metadata).to.be.an("object");
        expect(metadata).to.have.property("title", "The Great Adventure");
        expect(metadata).to.have.property("description", "A thrilling adventure story");
        expect(metadata).to.have.property("ipType", "Book");
        expect(metadata)
          .to.have.property("relationships")
          .that.is.an("array")
          .that.deep.equals([
            { parentIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", type: "APPEARS_IN" },
          ]);
        expect(metadata).to.have.property("createdAt", "2024-08-22T10:20:30Z");
        expect(metadata).to.have.property("watermarkImg", "https://example.com/watermark.png");
        expect(metadata)
          .to.have.property("creators")
          .that.is.an("array")
          .that.deep.equals([sampleCreatorData]);
        expect(metadata)
          .to.have.property("media")
          .that.is.an("array")
          .that.deep.equals([
            { name: "Cover Image", url: "https://example.com/cover.jpg", mimeType: "image/jpeg" },
          ]);
        expect(metadata)
          .to.have.property("attributes")
          .that.is.an("array")
          .that.deep.equals([
            { key: "Genre", value: "Adventure" },
            { key: "Pages", value: 350 },
          ]);
        expect(metadata).to.have.property("app").that.deep.equals({
          id: "app_001",
          name: "Story Protocol",
          website: "https://story.foundation",
        });
        expect(metadata)
          .to.have.property("tags")
          .that.is.an("array")
          .that.deep.equals(["Adventure", "Thriller"]);
        expect(metadata)
          .to.have.property("robotTerms")
          .that.deep.equals({ userAgent: "*", allow: "/" });
        expect(metadata).to.have.property("customField1", "Custom Value 1");
        expect(metadata).to.have.property("customField2", 42);
      });
    });
  });

  describe("Test ipAssetClient.register", async () => {
    it("should return ipId when register given tokenId have registered", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      const res = await ipAssetClient.register({
        nftContract: spgNftContract,
        tokenId: "3",
      });

      expect(res.ipId).equal("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
      expect(res.txHash).to.be.undefined;
    });

    it("should throw invalid address error when register given deadline is string", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await ipAssetClient.register({
          nftContract: spgNftContract,
          tokenId: "3",
          deadline: "error",
          ipMetadata: {
            ipMetadataURI: "1",
            ipMetadataHash: zeroHash,
          },
        });
      } catch (err) {
        expect((err as Error).message).equal("Failed to register IP: Invalid deadline value.");
      }
    });

    it("should throw account error when register given wallet have no signTypedData ", async () => {
      const walletMock = createMock<WalletClient>();
      walletMock.account = createMock<Account>();
      ipAssetClient = new IPAssetClient(rpcMock, walletMock, "odyssey");
      (ipAssetClient.registrationWorkflowsClient as any).address =
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
      (ipAssetClient.coreMetadataModuleClient as any).address =
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      const waitForTransaction: boolean = true;
      try {
        await ipAssetClient.register({
          nftContract: spgNftContract,
          tokenId: "3",
          deadline: "12321",
          ipMetadata: {
            ipMetadataURI: "",
          },
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP: The wallet client does not support signTypedData, please try again.",
        );
      }
    });

    it("should return txHash when register given tokenId have no registered", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "register").resolves(txHash);

      const res = await ipAssetClient.register({
        nftContract: spgNftContract,
        tokenId: "3",
      });

      expect(res.txHash).equal(txHash);
    });

    it("should return ipId and txHash when register a IP and given waitForTransaction of true and tokenId is not registered ", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "register").resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 0n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);

      const response = await ipAssetClient.register({
        nftContract: spgNftContract,
        tokenId: "3",
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(response.txHash).equal(txHash);
      expect(response.ipId).equals("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
    });

    it("should return ipId and txHash when register a IP given correct args, waitForTransaction is true and metadata", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon.stub(ipAssetClient.registrationWorkflowsClient, "registerIp").resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 0n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      const response = await ipAssetClient.register({
        nftContract: spgNftContract,
        tokenId: "3",
        ipMetadata: {
          ipMetadataURI: "",
          ipMetadataHash: zeroHash,
          nftMetadataHash: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(response.txHash).equal(txHash);
      expect(response.ipId).equals("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
    });

    it("should return encoded tx data when register a IP given correct args, encodedTxDataOnly is true and metadata", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.registrationWorkflowsClient, "registerIp")
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 0n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      const response = await ipAssetClient.register({
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "3",
        ipMetadata: {
          ipMetadataURI: "",
          ipMetadataHash: zeroHash,
          nftMetadataHash: zeroHash,
        },
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(response.encodedTxData!.data).to.be.a("string").and.not.empty;
    });

    it("should throw error when request fails", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "register").throws(new Error("revert error"));
      try {
        await ipAssetClient.register({
          nftContract: spgNftContract,
          tokenId: "3",
          txOptions: {
            waitForTransaction: true,
          },
        });
      } catch (err) {
        expect((err as Error).message).equal("Failed to register IP: revert error");
      }
    });

    it("should return encoded tx data when register a IP given correct args, encodedTxDataOnly is true and metadata", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.registrationWorkflowsClient, "registerIp")
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 0n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      const response = await ipAssetClient.register({
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "3",
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(response.encodedTxData!.data).to.be.a("string").and.not.empty;
    });
  });

  describe("Test ipAssetClient.registerDerivative", async () => {
    it("should throw childIpId error when registerDerivative given childIpId is not registered", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await ipAssetClient.registerDerivative({
          childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: ["1"],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative: The child IP with id 0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c is not registered.",
        );
      }
    });

    it("should throw parentIpId error when registerDerivative given parentIpId is not registered", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(false);

      try {
        await ipAssetClient.registerDerivative({
          childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627a"],
          licenseTermsIds: ["1"],
          licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative: The parent IP with id 0x1daAE3197Bc469Cb97B917aa460a12dD95c6627a is not registered.",
        );
      }
    });

    it("should throw not match error when registerDerivative given parentIds'length is not equal licenseTermsIds'length", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);

      try {
        await ipAssetClient.registerDerivative({
          childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: ["1", "2"],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative: Parent IP IDs and License terms IDs must be provided in pairs.",
        );
      }
    });

    it("should throw not attach error when registerDerivative given licenseTermsIds is not attached parentIpIds", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(false);

      try {
        await ipAssetClient.registerDerivative({
          childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: ["1"],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative: License terms id 1 must be attached to the parent ipId 0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4 before registering derivative.",
        );
      }
    });

    it("should return txHash when registerDerivative given childIpId and parentIpIds are registered, and parentIpIds match License terms ids", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon.stub(ipAssetClient.licensingModuleClient, "registerDerivative").resolves(txHash);

      const res = await ipAssetClient.registerDerivative({
        childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
        licenseTermsIds: ["1"],
      });

      expect(res.txHash).equal(txHash);
    });

    it("should return txHash when registerDerivative given correct childIpId, parentIpId, licenseTermsIds and waitForTransaction of true ", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon.stub(ipAssetClient.licensingModuleClient, "registerDerivative").resolves(txHash);

      const res = await ipAssetClient.registerDerivative({
        childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
        licenseTermsIds: ["1"],
        licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(res.txHash).equal(txHash);
    });

    it("should return encoded tx data when registerDerivative given correct childIpId, parentIpId, licenseTermsIds and encodedTxDataOnly of true ", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon
        .stub(ipAssetClient.licensingModuleClient, "registerDerivative")
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      const res = await ipAssetClient.registerDerivative({
        childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
        licenseTermsIds: ["1"],
        licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(res.encodedTxData!.data).to.be.a("string").and.not.empty;
    });
  });

  describe("Test ipAssetClient.registerDerivativeWithLicenseTokens", async () => {
    it("should throw childIpId error when registerDerivativeWithLicenseTokens given childIpId is not registered", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await ipAssetClient.registerDerivativeWithLicenseTokens({
          childIpId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
          licenseTokenIds: ["1"],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative with license tokens: The child IP with id 0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4 is not registered.",
        );
      }
    });

    it("should throw own error when registerDerivativeWithLicenseTokens given licenseTokenIds is not belongs caller", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);
      sinon.stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf").resolves(undefined);

      try {
        await ipAssetClient.registerDerivativeWithLicenseTokens({
          childIpId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
          licenseTokenIds: ["1"],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative with license tokens: License token id 1 must be owned by the caller.",
        );
      }
    });

    it("should return txHash when registerDerivativeWithLicenseTokens given correct args", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);
      sinon
        .stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      sinon
        .stub(ipAssetClient.licensingModuleClient, "registerDerivativeWithLicenseTokens")
        .resolves(txHash);

      const res = await ipAssetClient.registerDerivativeWithLicenseTokens({
        childIpId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
        licenseTokenIds: ["1"],
      });

      expect(res.txHash).equal(txHash);
    });

    it("should return txHash when registerDerivativeWithLicenseTokens given correct args and waitForTransaction of true", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);
      sinon
        .stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      sinon
        .stub(ipAssetClient.licensingModuleClient, "registerDerivativeWithLicenseTokens")
        .resolves(txHash);

      const res = await ipAssetClient.registerDerivativeWithLicenseTokens({
        childIpId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
        licenseTokenIds: ["1"],
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(res.txHash).equal(txHash);
    });

    it("should return encoded tx data when registerDerivativeWithLicenseTokens given correct args and encodedTxDataOnly of true", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);
      sinon
        .stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      sinon
        .stub(ipAssetClient.licensingModuleClient, "registerDerivativeWithLicenseTokens")
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      const res = await ipAssetClient.registerDerivativeWithLicenseTokens({
        childIpId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
        licenseTokenIds: ["1"],
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(res.encodedTxData!.data).to.be.a("string").and.not.empty;
    });
  });

  describe("Test ipAssetClient.createIpAssetWithPilTerms", async () => {
    it("throw PIL_TYPE error when createIpAssetWithPilTerms given PIL_TYPE is not match", async () => {
      try {
        await ipAssetClient.mintAndRegisterIpAssetWithPilTerms({
          spgNftContract,
        } as unknown as CreateIpAssetWithPilTermsRequest);
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to mint and register IP and attach PIL terms: PIL type is required.",
        );
      }
    });

    it("should throw address error when createIpAssetWithPilTerms given spgNftContract is wrong address", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await ipAssetClient.mintAndRegisterIpAssetWithPilTerms({
          spgNftContract: "0x",
          pilType: PIL_TYPE.COMMERCIAL_USE,
          mintingFee: "100",
          currency: zeroAddress,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          `Failed to mint and register IP and attach PIL terms: request.spgNftContract address is invalid: 0x, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`,
        );
      }
    });

    it("should return txHash when createIpAssetWithPilTerms given correct args", async () => {
      sinon
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "mintAndRegisterIpAndAttachPilTerms")
        .resolves(txHash);
      const result = await ipAssetClient.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract,
        pilType: PIL_TYPE.COMMERCIAL_USE,
        mintingFee: "100",
        currency: zeroAddress,
        recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        royaltyPolicyAddress: zeroAddress,
        ipMetadata: {
          ipMetadataURI: "",
          ipMetadataHash: toHex(0, { size: 32 }),
        },
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return ipId, tokenId, licenseTermsId,txHash when createIpAssetWithPilTerms given correct args and waitForTransaction of true", async () => {
      sinon
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "mintAndRegisterIpAndAttachPilTerms")
        .resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 1n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      sinon.stub(ipAssetClient.licensingModuleClient, "parseTxLicenseTermsAttachedEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          caller: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          licenseTermsId: 0n,
        },
      ]);
      const result = await ipAssetClient.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract,
        pilType: PIL_TYPE.COMMERCIAL_USE,
        mintingFee: "100",
        currency: zeroAddress,
        ipMetadata: {
          nftMetadataHash: toHex(0, { size: 32 }),
        },
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.ipId).to.equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      expect(result.licenseTermsId).to.equal(0n);
      expect(result.tokenId).to.equal(1n);
    });

    it("should return encoded tx data when createIpAssetWithPilTerms given correct args and encodedTxDataOnly is true", async () => {
      // sinon
      //   .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "mintAndRegisterIpAndAttachPilTerms")
      //   .resolves(txHash);
      const result = await ipAssetClient.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        pilType: 0,
        mintingFee: "100",
        currency: zeroAddress,
        recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        ipMetadata: {
          ipMetadataURI: "",
          ipMetadataHash: toHex(0, { size: 32 }),
        },
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData!.data).to.be.a("string").and.not.empty;
    });
  });

  describe("Test ipAssetClient.registerDerivativeIp", async () => {
    it("should throw ipId have registered error when registerDerivativeIp given tokenId have registered", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      try {
        await ipAssetClient.registerDerivativeIp({
          nftContract: spgNftContract,
          tokenId: "3",
          derivData: {
            parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
            licenseTermsIds: ["1"],
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative IP: The NFT with id 3 is already registered as IP.",
        );
      }
    });

    it("should throw not match error when registerDerivativeIp given parentIds'length is not equal licenseTermsIds'length", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await ipAssetClient.registerDerivativeIp({
          nftContract: spgNftContract,
          tokenId: "3",
          derivData: {
            parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
            licenseTermsIds: ["1", "2"],
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative IP: Parent IP IDs and License terms IDs must be provided in pairs.",
        );
      }
    });

    it("should throw not attach error when registerDerivativeIp given licenseTermsIds is not attached parentIpIds", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(false);

      try {
        await ipAssetClient.registerDerivativeIp({
          nftContract: spgNftContract,
          tokenId: "3",
          derivData: {
            parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
            licenseTermsIds: ["1"],
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative IP: License terms id 1 must be attached to the parent ipId 0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4 before registering derivative.",
        );
      }
    });

    it("should return txHash when registerDerivativeIp given correct args", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon
        .stub(ipAssetClient.derivativeWorkflowsClient, "registerIpAndMakeDerivative")
        .resolves(txHash);

      const res = await ipAssetClient.registerDerivativeIp({
        nftContract: spgNftContract,
        tokenId: "3",
        derivData: {
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: ["1"],
          licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
        ipMetadata: {
          ipMetadataHash: toHex(0, { size: 32 }),
        },
      });

      expect(res.txHash).equal(txHash);
    });
    it("should return txHash when registerDerivativeIp given correct args", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon
        .stub(ipAssetClient.derivativeWorkflowsClient, "registerIpAndMakeDerivative")
        .resolves(txHash);

      const res = await ipAssetClient.registerDerivativeIp({
        nftContract: spgNftContract,
        tokenId: "3",
        derivData: {
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: ["1"],
          licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
        ipMetadata: {
          ipMetadataHash: toHex(0, { size: 32 }),
          ipMetadataURI: "",
        },
      });

      expect(res.txHash).equal(txHash);
    });

    it("should return txHash and ipId when registerDerivativeIp given correct args and waitForTransaction of true", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon
        .stub(ipAssetClient.derivativeWorkflowsClient, "registerIpAndMakeDerivative")
        .resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 1n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);

      const res = await ipAssetClient.registerDerivativeIp({
        nftContract: spgNftContract,
        tokenId: "3",
        derivData: {
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: ["1"],
        },
        ipMetadata: {
          ipMetadataURI: "https://",
          nftMetadataHash: toHex("nftMetadata", { size: 32 }),
        },
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(res.txHash).equal(txHash);
      expect(res.ipId).equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
    });

    it("should return encoded tx data when registerDerivativeIp given correct args and encodedTxDataOnly of true", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon
        .stub(ipAssetClient.derivativeWorkflowsClient, "registerIpAndMakeDerivative")
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 1n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);

      const res = await ipAssetClient.registerDerivativeIp({
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "3",
        derivData: {
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: ["1"],
          licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
        ipMetadata: {
          ipMetadataURI: "https://",
          nftMetadataHash: toHex("nftMetadata", { size: 32 }),
        },
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(res.encodedTxData!.data).to.be.a("string").and.not.empty;
    });
  });

  describe("Test ipAssetClient.registerIpAndAttachPilTerms", async () => {
    it("should throw ipId have registered error when registerIpAndAttachPilTerms given tokenId have registered", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      try {
        await ipAssetClient.registerIpAndAttachPilTerms({
          nftContract: spgNftContract,
          tokenId: "3",
          ipMetadata: {
            ipMetadataURI: "https://",
            ipMetadataHash: toHex("metadata", { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
          },
          pilType: PIL_TYPE.COMMERCIAL_USE,
          mintingFee: "100",
          currency: zeroAddress,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and attach PIL terms: The NFT with id 3 is already registered as IP.",
        );
      }
    });
    it("should throw PIL_TYPE error when registerIpAndAttachPilTerms given PIL_TYPE is not match", async () => {
      try {
        await ipAssetClient.registerIpAndAttachPilTerms({
          spgNftContract,
          tokenId: "3",
        } as unknown as RegisterIpAndAttachPilTermsRequest);
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and attach PIL terms: PIL type is required.",
        );
      }
    });

    it("should called with initial metadata when registerIpAndAttachPilTerms given empty ipMetadataURI", async () => {
      const stub = sinon.stub(
        ipAssetClient.licenseAttachmentWorkflowsClient,
        "registerIpAndAttachPilTerms",
      );
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      await ipAssetClient.registerIpAndAttachPilTerms({
        nftContract: spgNftContract,
        tokenId: "3",
        ipMetadata: {
          ipMetadataHash: toHex(0, { size: 32 }),
          ipMetadataURI: "",
        },
        pilType: PIL_TYPE.COMMERCIAL_USE,
        mintingFee: "100",
        currency: zeroAddress,
      });
      expect(stub.args[0][0].ipMetadata).to.deep.equal({
        ipMetadataURI: "",
        ipMetadataHash: toHex(0, { size: 32 }),
        nftMetadataHash: toHex(0, { size: 32 }),
        nftMetadataURI: "",
      });
    });
    it("should return hash when registerIpAndAttachPilTerms given correct args", async () => {
      sinon
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "registerIpAndAttachPilTerms")
        .resolves(txHash);
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      const result = await ipAssetClient.registerIpAndAttachPilTerms({
        nftContract: spgNftContract,
        tokenId: "3",
        ipMetadata: {
          ipMetadataHash: toHex(0, { size: 32 }),
        },
        pilType: PIL_TYPE.COMMERCIAL_USE,
        mintingFee: "100",
        currency: zeroAddress,
        royaltyPolicyAddress: zeroAddress,
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash and ipId when registerIpAndAttachPilTerms given correct args and waitForTransaction of true", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      sinon
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "registerIpAndAttachPilTerms")
        .resolves(txHash);
      sinon
        .stub(ipAssetClient.licensingModuleClient, "parseTxLicenseTermsAttachedEvent")
        .returns([]);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 1n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      const result = await ipAssetClient.registerIpAndAttachPilTerms({
        nftContract: spgNftContract,
        tokenId: "3",
        ipMetadata: {
          ipMetadataURI: "https://",
        },
        pilType: PIL_TYPE.COMMERCIAL_USE,
        mintingFee: 1,
        currency: zeroAddress,
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.ipId).to.equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      expect(result.licenseTermsId).to.equal(5n);
    });

    it("should return encoded tx data when registerIpAndAttachPilTerms given correct args and encodedTxDataOnly of true", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      sinon
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "registerIpAndAttachPilTerms")
        .resolves(txHash);
      sinon.stub(ipAssetClient.licensingModuleClient, "parseTxLicenseTermsAttachedEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          caller: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          licenseTermsId: 0n,
        },
      ]);
      const result = await ipAssetClient.registerIpAndAttachPilTerms({
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c662ac",
        tokenId: "3",
        ipMetadata: {
          ipMetadataURI: "https://",
        },
        pilType: 0,
        mintingFee: 1,
        currency: zeroAddress,
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData!.data).to.be.a("string").and.not.empty;
    });
  });

  describe("Test ipAssetClient.mintAndRegisterIpAndMakeDerivative", async () => {
    it("should throw not match error when mintAndRegisterIpAndMakeDerivative given parentIds'length is not equal licenseTermsIds'length", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await ipAssetClient.mintAndRegisterIpAndMakeDerivative({
          spgNftContract,
          derivData: {
            parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
            licenseTermsIds: ["1", "2"],
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to mint and register IP and make derivative: Parent IP IDs and License terms IDs must be provided in pairs.",
        );
      }
    });

    it("should throw not attach error when call mintAndRegisterIpAndMakeDerivative given licenseTermsIds is not attached parentIpIds", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(false);

      try {
        await ipAssetClient.mintAndRegisterIpAndMakeDerivative({
          spgNftContract,
          derivData: {
            parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
            licenseTermsIds: ["1"],
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to mint and register IP and make derivative: License terms id 1 must be attached to the parent ipId 0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4 before registering derivative.",
        );
      }
    });

    it("should return txHash when call mintAndRegisterIpAndMakeDerivative given correct args", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon
        .stub(ipAssetClient.derivativeWorkflowsClient, "mintAndRegisterIpAndMakeDerivative")
        .resolves(txHash);

      const res = await ipAssetClient.mintAndRegisterIpAndMakeDerivative({
        spgNftContract,
        derivData: {
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: ["1"],
          licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
        ipMetadata: {
          ipMetadataHash: toHex(0, { size: 32 }),
        },
      });

      expect(res.txHash).equal(txHash);
    });
    it("should return txHash and ipId when call mintAndRegisterIpAndMakeDerivative given correct args and waitForTransaction of true", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon
        .stub(ipAssetClient.derivativeWorkflowsClient, "mintAndRegisterIpAndMakeDerivative")
        .resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 1n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);

      const res = await ipAssetClient.mintAndRegisterIpAndMakeDerivative({
        spgNftContract,
        recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        derivData: {
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: ["1"],
        },
        ipMetadata: {
          ipMetadataURI: "https://",
          nftMetadataHash: toHex("nftMetadata", { size: 32 }),
        },
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(res.txHash).equal(txHash);
      expect(res.childIpId).equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
    });

    it("should return encoded tx data when call mintAndRegisterIpAndMakeDerivative given correct args and encodedTxDataOnly of true", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon
        .stub(ipAssetClient.derivativeWorkflowsClient, "mintAndRegisterIpAndMakeDerivative")
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 1n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);

      const res = await ipAssetClient.mintAndRegisterIpAndMakeDerivative({
        spgNftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        derivData: {
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: ["1"],
          licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
        ipMetadata: {
          ipMetadataURI: "https://",
          nftMetadataHash: toHex("nftMetadata", { size: 32 }),
        },
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(res.encodedTxData!.data).to.be.a("string").and.not.empty;
    });
  });
  describe("Test ipAssetClient.mintAndRegisterIp", async () => {
    it("should throw spgNftContract error when mintAndRegisterIp given spgNftContract is wrong address", async () => {
      try {
        await ipAssetClient.mintAndRegisterIp({
          spgNftContract: "0x",
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          `Failed to mint and register IP: request.spgNftContract address is invalid: 0x, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`,
        );
      }
    });

    it("should throw recipient error when mintAndRegisterIp given recipient is wrong address", async () => {
      try {
        await ipAssetClient.mintAndRegisterIp({
          spgNftContract,
          recipient: "0x",
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          `Failed to mint and register IP: request.recipient address is invalid: 0x, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`,
        );
      }
    });

    it("should return txHash when mintAndRegisterIp given correct args", async () => {
      sinon.stub(ipAssetClient.registrationWorkflowsClient, "mintAndRegisterIp").resolves(txHash);

      const result = await ipAssetClient.mintAndRegisterIp({
        spgNftContract,
        ipMetadata: {
          ipMetadataURI: "",
          ipMetadataHash: toHex(0, { size: 32 }),
        },
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return ipId,txHash when mintAndRegisterIp given correct args and waitForTransaction of true", async () => {
      sinon.stub(ipAssetClient.registrationWorkflowsClient, "mintAndRegisterIp").resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 1n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);

      const result = await ipAssetClient.mintAndRegisterIp({
        spgNftContract,
        ipMetadata: {
          ipMetadataURI: "",
          ipMetadataHash: toHex(0, { size: 32 }),
        },
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.ipId).to.equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
    });

    it("should return encoded tx data when mintAndRegisterIp given correct args and encodedTxDataOnly of true", async () => {
      sinon.stub(ipAssetClient.registrationWorkflowsClient, "mintAndRegisterIp").resolves(txHash);

      const result = await ipAssetClient.mintAndRegisterIp({
        spgNftContract,
        recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        ipMetadata: {
          ipMetadataURI: "",
        },
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData!.data).to.be.a("string").and.not.empty;
    });
  });

  describe("Test ipAssetClient.registerPilTermsAndAttach", async () => {
    beforeEach(() => {
      RoyaltyModuleReadOnlyClient.prototype.isWhitelistedRoyaltyPolicy = sinon
        .stub()
        .resolves(true);
      RoyaltyModuleReadOnlyClient.prototype.isWhitelistedRoyaltyToken = sinon.stub().resolves(true);
      sinon
        .stub(IpAccountImplClient.prototype, "state")
        .resolves({ result: "0x2e778894d11b5308e4153f094e190496c1e0609652c19f8b87e5176484b9a56e" });
    });
    const licenseTerms: LicenseTerms = {
      defaultMintingFee: 1513n,
      currency: MockERC20.address,
      royaltyPolicy: zeroAddress,
      transferable: false,
      expiration: 0n,
      commercialUse: false,
      commercialAttribution: false,
      commercializerChecker: zeroAddress,
      commercializerCheckerData: "0x",
      commercialRevShare: 0,
      commercialRevCeiling: 0n,
      derivativesAllowed: false,
      derivativesAttribution: false,
      derivativesApproval: false,
      derivativesReciprocal: false,
      derivativeRevCeiling: 0n,
      uri: "",
    };
    it("should throw ipId error when registerPilTermsAndAttach given ipId is wrong address", async () => {
      try {
        await ipAssetClient.registerPilTermsAndAttach({
          ipId: "0x",
          terms: licenseTerms,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          `Failed to register PIL terms and attach: ipId address is invalid: 0x, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`,
        );
      }
    });

    it("should throw ipId have not registered error when registerPilTermsAndAttach given ipId have not registered", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await ipAssetClient.registerPilTermsAndAttach({
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          terms: licenseTerms,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register PIL terms and attach: The IP with id 0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c is not registered.",
        );
      }
    });

    it("should return encoded tx data when registerPilTermsAndAttach given correct args and encodedTxDataOnly of true", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: 0n });

      const result = await ipAssetClient.registerPilTermsAndAttach({
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        terms: licenseTerms,
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData!.data).to.be.a("string").and.not.empty;
    });

    it("should return txHash when registerPilTermsAndAttach given correct args", async () => {
      sinon
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "registerPilTermsAndAttach")
        .resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: 0n });
      const result = await ipAssetClient.registerPilTermsAndAttach({
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        terms: licenseTerms,
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash and licenseTermsId when registerPilTermsAndAttach given correct args and waitForTransaction of true", async () => {
      sinon
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "registerPilTermsAndAttach")
        .resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: 0n });
      sinon.stub(ipAssetClient.licensingModuleClient, "parseTxLicenseTermsAttachedEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          caller: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          licenseTermsId: 0n,
        },
      ]);

      const result = await ipAssetClient.registerPilTermsAndAttach({
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        terms: licenseTerms,
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTermsId).to.equal(0n);
    });
  });

  describe("Test ipAssetClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens", async () => {
    it("should throw licenseTokens error when mintAndRegisterIpAndMakeDerivativeWithLicenseTokens given licenseTokens empty", async () => {
      try {
        await ipAssetClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens({
          spgNftContract,
          licenseTokenIds: [],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to mint and register IP and make derivative with license tokens: License token IDs must be provided.",
        );
      }
    });

    it("should throw licenseTokens is not owned by caller error when mintAndRegisterIpAndMakeDerivativeWithLicenseTokens given wrong licenseTokens", async () => {
      sinon.stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf").resolves(undefined);

      try {
        await ipAssetClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens({
          spgNftContract,
          licenseTokenIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to mint and register IP and make derivative with license tokens: License token id 169371642198122114185371466690533487013299380860 must be owned by the caller.",
        );
      }
    });
    it("should return txHash when mintAndRegisterIpAndMakeDerivativeWithLicenseTokens given correct args", async () => {
      sinon
        .stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      sinon
        .stub(
          ipAssetClient.derivativeWorkflowsClient,
          "mintAndRegisterIpAndMakeDerivativeWithLicenseTokens",
        )
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      const result = await ipAssetClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens({
        spgNftContract,
        licenseTokenIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        ipMetadata: {
          ipMetadataURI: "",
          ipMetadataHash: toHex(0, { size: 32 }),
          nftMetadataHash: toHex("nftMetadata", { size: 32 }),
          nftMetadataURI: "",
        },
        recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      });

      expect(result.txHash).to.equal(
        "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
      );
    });

    it("should return txHash and ipId when mintAndRegisterIpAndMakeDerivativeWithLicenseTokens given correct args and waitForTransaction of true", async () => {
      sinon
        .stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      sinon
        .stub(
          ipAssetClient.derivativeWorkflowsClient,
          "mintAndRegisterIpAndMakeDerivativeWithLicenseTokens",
        )
        .resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 1n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);

      const result = await ipAssetClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens({
        spgNftContract,
        licenseTokenIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.ipId).to.equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      expect(result.tokenId).to.equal(1n);
    });

    it("should return encoded tx data when mintAndRegisterIpAndMakeDerivativeWithLicenseTokens given correct args and encodedTxDataOnly of true", async () => {
      sinon
        .stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      sinon
        .stub(
          ipAssetClient.derivativeWorkflowsClient,
          "mintAndRegisterIpAndMakeDerivativeWithLicenseTokens",
        )
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      const result = await ipAssetClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens({
        spgNftContract,
        licenseTokenIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        ipMetadata: {
          ipMetadataURI: "",
          ipMetadataHash: toHex(0, { size: 32 }),
          nftMetadataHash: toHex("nftMetadata", { size: 32 }),
          nftMetadataURI: "",
        },
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData!.data).to.be.a("string").and.not.empty;
    });
  });

  describe("Test ipAssetClient.registerIpAndMakeDerivativeWithLicenseTokens", async () => {
    beforeEach(() => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
    });
    it("should throw tokenId error when registerIpAndMakeDerivativeWithLicenseTokens given tokenId is registered", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      try {
        await ipAssetClient.registerIpAndMakeDerivativeWithLicenseTokens({
          nftContract: spgNftContract,
          tokenId: "3",
          licenseTokenIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and make derivative with license tokens: The NFT with id 3 is already registered as IP.",
        );
      }
    });

    it("should throw licenseTokens error when registerIpAndMakeDerivativeWithLicenseTokens given licenseTokens is not owner of caller", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon.stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf").resolves(undefined);

      try {
        await ipAssetClient.registerIpAndMakeDerivativeWithLicenseTokens({
          nftContract: spgNftContract,
          tokenId: "3",
          licenseTokenIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and make derivative with license tokens: License token id 169371642198122114185371466690533487013299380860 must be owned by the caller.",
        );
      }
    });
    it("should return txHash when registerIpAndMakeDerivativeWithLicenseTokens given correct args", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      sinon
        .stub(
          ipAssetClient.derivativeWorkflowsClient,
          "registerIpAndMakeDerivativeWithLicenseTokens",
        )
        .resolves(txHash);
      const result = await ipAssetClient.registerIpAndMakeDerivativeWithLicenseTokens({
        nftContract: spgNftContract,
        tokenId: "3",
        licenseTokenIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        ipMetadata: {
          ipMetadataURI: "",
          ipMetadataHash: toHex(0, { size: 32 }),
        },
      });
      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash and ipId when registerIpAndMakeDerivativeWithLicenseTokens given correct args and waitForTransaction of true", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      sinon
        .stub(
          ipAssetClient.derivativeWorkflowsClient,
          "registerIpAndMakeDerivativeWithLicenseTokens",
        )
        .resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 1n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      const result = await ipAssetClient.registerIpAndMakeDerivativeWithLicenseTokens({
        nftContract: spgNftContract,
        tokenId: "3",
        licenseTokenIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result.txHash).to.equal(txHash);
      expect(result.ipId).to.equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
    });

    it("should return encoded tx data when registerIpAndMakeDerivativeWithLicenseTokens given correct args and encodedTxDataOnly of true", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      sinon
        .stub(
          ipAssetClient.derivativeWorkflowsClient,
          "registerIpAndMakeDerivativeWithLicenseTokens",
        )
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      const result = await ipAssetClient.registerIpAndMakeDerivativeWithLicenseTokens({
        nftContract: spgNftContract,
        tokenId: "3",
        licenseTokenIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        ipMetadata: {
          ipMetadataURI: "",
          ipMetadataHash: toHex(0, { size: 32 }),
          nftMetadataHash: toHex("nftMetadata", { size: 32 }),
          nftMetadataURI: "",
        },
        txOptions: {
          encodedTxDataOnly: true,
        },
      });
      expect(result.encodedTxData!.data).to.be.a("string").and.not.empty;
    });
  });

  describe("Test ipAssetClient.batchMintAndRegisterIpAssetWithPilTerms", async () => {
    it("should throw spgNftContract error when batchMintAndRegisterIpAssetWithPilTerms given spgNftContract is wrong address", async () => {
      try {
        await ipAssetClient.batchMintAndRegisterIpAssetWithPilTerms({
          args: [
            {
              spgNftContract: "0x",
              ipMetadata: {
                ipMetadataURI: "",
                ipMetadataHash: toHex(0, { size: 32 }),
              },
              pilType: 0,
              mintingFee: 1,
              currency: zeroAddress,
            },
          ],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to batch mint and register IP and attach PIL terms: Failed to mint and register IP and attach PIL terms: request.spgNftContract address is invalid: 0x, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.",
        );
      }
    });

    it("should return txHash when batchMintAndRegisterIpAssetWithPilTerms given correct args", async () => {
      sinon.stub(ipAssetClient.licenseAttachmentWorkflowsClient, "multicall").resolves(txHash);

      const result = await ipAssetClient.batchMintAndRegisterIpAssetWithPilTerms({
        args: [
          {
            spgNftContract,
            ipMetadata: {
              ipMetadataURI: "",
              ipMetadataHash: toHex(0, { size: 32 }),
            },
            pilType: 0,
            mintingFee: 1,
            currency: zeroAddress,
          },
          {
            spgNftContract,
            ipMetadata: {
              ipMetadataURI: "",
              ipMetadataHash: toHex(0, { size: 32 }),
            },
            pilType: 0,
            mintingFee: 1,
            currency: zeroAddress,
          },
        ],
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash and ipId when batchMintAndRegisterIpAssetWithPilTerms given correct args and waitForTransaction of true", async () => {
      sinon.stub(ipAssetClient.licenseAttachmentWorkflowsClient, "multicall").resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 1n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD94c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 2n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
        {
          ipId: "0x1daAE3197Bc469Cb97B9171a460a12dD94c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917a460a12dD95c6627c",
          tokenId: 3n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      sinon.stub(ipAssetClient.licensingModuleClient, "parseTxLicenseTermsAttachedEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          caller: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          licenseTermsId: 0n,
        },
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD94c6627c",
          caller: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          licenseTermsId: 4n,
        },
        {
          ipId: "0x1daAE3197Bc469Cb97B9171a460a12dD94c6627c",
          caller: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        } as unknown as LicensingModuleLicenseTermsAttachedEvent,
      ]);
      const result = await ipAssetClient.batchMintAndRegisterIpAssetWithPilTerms({
        args: [
          {
            spgNftContract,
            ipMetadata: {
              ipMetadataURI: "",
              ipMetadataHash: toHex(0, { size: 32 }),
            },
            pilType: 0,
            mintingFee: 1,
            currency: zeroAddress,
          },
          {
            spgNftContract,
            ipMetadata: {
              ipMetadataURI: "",
              ipMetadataHash: toHex(0, { size: 32 }),
            },
            pilType: 0,
            mintingFee: 1,
            currency: zeroAddress,
          },
        ],
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.results).to.deep.equal([
        { ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c", licenseTermsId: 0n, tokenId: 1n },
        { ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD94c6627c", licenseTermsId: 4n, tokenId: 2n },
        { ipId: "0x1daAE3197Bc469Cb97B9171a460a12dD94c6627c", licenseTermsId: 5n, tokenId: 3n },
      ]);
    });
  });

  describe("Test ipAssetClient.batchMintAndRegisterIpAndMakeDerivative", async () => {
    it("should throw ipId and licenseTerms error when batchMintAndRegisterIpAndMakeDerivative given ipId and licenseTerms is not match", async () => {
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(false);
      try {
        await ipAssetClient.batchMintAndRegisterIpAndMakeDerivative({
          args: [
            {
              spgNftContract,
              recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
              derivData: {
                parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
                licenseTermsIds: ["1"],
              },
              ipMetadata: {
                ipMetadataURI: "https://",
                nftMetadataHash: toHex("nftMetadata", { size: 32 }),
              },
            },
          ],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to batch mint and register IP and make derivative: License terms id 1 must be attached to the parent ipId 0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4 before registering derivative.",
        );
      }
    });

    it("should return txHash when batchMintAndRegisterIpAndMakeDerivative given correct args", async () => {
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon
        .stub(ipAssetClient.derivativeWorkflowsClient, "mintAndRegisterIpAndMakeDerivative")
        .resolves(txHash);
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.derivativeWorkflowsClient, "multicall").resolves(txHash);

      const result = await ipAssetClient.batchMintAndRegisterIpAndMakeDerivative({
        args: [
          {
            spgNftContract,
            recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            derivData: {
              parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
              licenseTermsIds: ["1"],
            },
            ipMetadata: {
              ipMetadataURI: "https://",
              nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            },
          },
        ],
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash and ipId when batchMintAndRegisterIpAndMakeDerivative given correct args and waitForTransaction of true", async () => {
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon
        .stub(ipAssetClient.derivativeWorkflowsClient, "mintAndRegisterIpAndMakeDerivative")
        .resolves(txHash);
      sinon.stub(ipAssetClient.derivativeWorkflowsClient, "multicall").resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 1n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
        {
          ipId: "0x11aAE3197Bc469Cb97B9171a460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 2n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);

      const result = await ipAssetClient.batchMintAndRegisterIpAndMakeDerivative({
        args: [
          {
            spgNftContract,
            recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            derivData: {
              parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
              licenseTermsIds: ["1"],
            },
            ipMetadata: {
              ipMetadataURI: "https://",
              nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            },
          },
          {
            spgNftContract,
            recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            derivData: {
              parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
              licenseTermsIds: ["1"],
            },
            ipMetadata: {
              ipMetadataURI: "https://",
              nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            },
          },
        ],
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.results).to.deep.equal([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 1n,
        },
        {
          ipId: "0x11aAE3197Bc469Cb97B9171a460a12dD95c6627c",
          tokenId: 2n,
        },
      ]);
    });
  });

  describe("Test ipAssetClient.batchRegister", async () => {
    it("should throw error when call batchRegister given args have wrong nftContract", async () => {
      try {
        await ipAssetClient.batchRegister({
          args: [
            {
              nftContract: "0x",
              tokenId: "1",
            },
          ],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to batch register IP: nftContract address is invalid: 0x, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.",
        );
      }
    });

    it("should return txhash when call batchRegister given correct args", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon.stub(ipAssetClient.registrationWorkflowsClient, "registerIpEncode").returns({
        data: "0x",
        to: "0x",
      });
      sinon.stub(ipAssetClient.multicall3Client, "aggregate3").resolves(txHash);
      const result = await ipAssetClient.batchRegister({
        args: [
          {
            nftContract: spgNftContract,
            tokenId: "1",
          },
        ],
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txhash and ipId when call batchRegister given correct args and waitForTransaction of true", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon.stub(ipAssetClient.registrationWorkflowsClient, "registerIpEncode").returns({
        data: "0x",
        to: "0x",
      });
      sinon.stub(ipAssetClient.multicall3Client, "aggregate3").resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 1n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
        {
          ipId: "0x1daAE3197Bc469Cb87B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 2n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      const result = await ipAssetClient.batchRegister({
        args: [
          {
            nftContract: spgNftContract,
            tokenId: "1",
          },
          {
            nftContract: spgNftContract,
            tokenId: "2",
            ipMetadata: {
              ipMetadataURI: "",
              ipMetadataHash: toHex(0, { size: 32 }),
              nftMetadataHash: toHex("nftMetadata", { size: 32 }),
              nftMetadataURI: "",
            },
          },
        ],
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.results).to.deep.equal([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 1n,
        },
        {
          ipId: "0x1daAE3197Bc469Cb87B917aa460a12dD95c6627c",
          tokenId: 2n,
        },
      ]);
    });
  });
  describe("Test ipAssetClient.batchRegisterDerivative", async () => {
    it("should throw childIpId error when call batchRegisterDerivative given childIpId is wrong address", async () => {
      try {
        await ipAssetClient.batchRegisterDerivative({
          args: [
            {
              childIpId: "0x",
              parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
              licenseTermsIds: ["1"],
            },
          ],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to batch register derivative: ipId address is invalid: 0x, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.",
        );
      }
    });

    it("should return results when call batchRegisterDerivative given correct args", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon.stub(ipAssetClient.licensingModuleClient, "registerDerivativeEncode").returns({
        data: "0x",
        to: "0x",
      });
      sinon
        .stub(IpAccountImplClient.prototype, "state")
        .resolves({ result: "0x2e778894d11b5308e4153f094e190496c1e0609652c19f8b87e5176484b9a56e" });
      sinon.stub(ipAssetClient.multicall3Client, "aggregate3").resolves(txHash);
      const result = await ipAssetClient.batchRegisterDerivative({
        args: [
          {
            childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: ["1"],
          },
        ],
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return results when call batchRegisterDerivative given correct args and waitForTransaction of true", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon.stub(ipAssetClient.licensingModuleClient, "registerDerivativeEncode").returns({
        data: "0x",
        to: "0x",
      });
      sinon
        .stub(IpAccountImplClient.prototype, "state")
        .resolves({ result: "0x2e778894d11b5308e4153f094e190496c1e0609652c19f8b87e5176484b9a56e" });
      sinon.stub(ipAssetClient.multicall3Client, "aggregate3").resolves(txHash);
      const result = await ipAssetClient.batchRegisterDerivative({
        args: [
          {
            childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: ["1"],
          },
        ],
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
    });
  });

  describe("Test ipAssetClient.isRegistered", async () => {
    beforeEach(() => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
    });
    it("should return true if IP asset is registered", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      expect(await ipAssetClient.isRegistered("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c")).to.be
        .true;
    });

    it("should return false if IP asset is not registered", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      expect(await ipAssetClient.isRegistered("0x2BCAE3197Bc469Cb97B917aa460a12dD95c6538D")).to.be
        .false;
    });
  });
});
