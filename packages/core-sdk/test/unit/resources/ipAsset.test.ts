import chai from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { IPAssetClient, LicenseTerms } from "../../../src";
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
import { MockERC20 } from "../../integration/utils/mockERC20";
import { LicenseRegistryReadOnlyClient } from "../../../src/abi/generated";
import { royaltySharesTotalSupply } from "../../../src/constants/common";
const {
  RoyaltyModuleReadOnlyClient,
  IpRoyaltyVaultImplReadOnlyClient,
  IpAccountImplClient,
} = require("../../../src/abi/generated");
const txHash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
chai.use(chaiAsPromised);
const expect = chai.expect;
const licenseTerms: LicenseTerms = {
  transferable: true,
  royaltyPolicy: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
  defaultMintingFee: BigInt(1),
  expiration: BigInt(0),
  commercialUse: true,
  commercialAttribution: false,
  commercializerChecker: zeroAddress,
  commercializerCheckerData: zeroAddress,
  commercialRevShare: 0,
  commercialRevCeiling: BigInt(0),
  derivativesAllowed: true,
  derivativesAttribution: true,
  derivativesApproval: false,
  derivativesReciprocal: true,
  derivativeRevCeiling: BigInt(0),
  currency: MockERC20.address,
  uri: "",
};
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
    RoyaltyModuleReadOnlyClient.prototype.isWhitelistedRoyaltyPolicy = sinon.stub().resolves(true);
    RoyaltyModuleReadOnlyClient.prototype.isWhitelistedRoyaltyToken = sinon.stub().resolves(true);
    IpRoyaltyVaultImplReadOnlyClient.prototype.balanceOf = sinon
      .stub()
      .resolves(royaltySharesTotalSupply);
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
    (ipAssetClient.royaltyTokenDistributionWorkflowsClient as any).address =
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
    it("should throw address error when createIpAssetWithPilTerms given spgNftContract is wrong address", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await ipAssetClient.mintAndRegisterIpAssetWithPilTerms({
          spgNftContract: "0x",
          terms: [licenseTerms],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          `Failed to mint and register IP and attach PIL terms: request.spgNftContract address is invalid: 0x, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`,
        );
      }
    });

    it("should return txHash when createIpAssetWithPilTerms given correct args", async () => {
      sinon
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "mintAndRegisterIpAndAttachPilTerms2")
        .resolves(txHash);
      const result = await ipAssetClient.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract,
        terms: [licenseTerms],
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
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "mintAndRegisterIpAndAttachPilTerms2")
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
      sinon
        .stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: 5n });
      const result = await ipAssetClient.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract,
        terms: [licenseTerms],
        ipMetadata: {
          nftMetadataHash: toHex(0, { size: 32 }),
        },
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.ipId).to.equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      expect(result.licenseTermsIds![0]).to.equal(5n);
      expect(result.tokenId).to.equal(1n);
    });

    it("should return ipId, tokenId, licenseTermsId,txHash when createIpAssetWithPilTerms given correct args and waitForTransaction of true with default license terms id", async () => {
      sinon
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "mintAndRegisterIpAndAttachPilTerms2")
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
      sinon
        .stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: 5n });
      const result = await ipAssetClient.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract,
        terms: [licenseTerms],
        ipMetadata: {
          nftMetadataHash: toHex(0, { size: 32 }),
        },
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.ipId).to.equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      expect(result.licenseTermsIds![0]).to.equal(5n);
      expect(result.tokenId).to.equal(1n);
    });

    it("should return encoded tx data when createIpAssetWithPilTerms given correct args and encodedTxDataOnly is true", async () => {
      const result = await ipAssetClient.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        terms: [licenseTerms],
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
          terms: [licenseTerms],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and attach PIL terms: The NFT with id 3 is already registered as IP.",
        );
      }
    });

    it("should return hash when registerIpAndAttachPilTerms given correct args", async () => {
      sinon
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "registerIpAndAttachPilTerms2")
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
        terms: [licenseTerms],
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash and ipId when registerIpAndAttachPilTerms given correct args and waitForTransaction of true", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      sinon
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "registerIpAndAttachPilTerms2")
        .resolves(txHash);
      sinon
        .stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: 5n });
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
        terms: [licenseTerms],
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.ipId).to.equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      expect(result.licenseTermsIds).to.deep.equal([5n]);
    });

    it("should return encoded tx data when registerIpAndAttachPilTerms given correct args and encodedTxDataOnly of true", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: 5n });
      sinon
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "registerIpAndAttachPilTerms2")
        .resolves(txHash);
      const result = await ipAssetClient.registerIpAndAttachPilTerms({
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c662ac",
        tokenId: "3",
        ipMetadata: {
          ipMetadataURI: "https://",
        },
        terms: [licenseTerms],
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
      sinon
        .stub(IpAccountImplClient.prototype, "state")
        .resolves({ result: "0x2e778894d11b5308e4153f094e190496c1e0609652c19f8b87e5176484b9a56e" });
    });
    it("should throw ipId error when registerPilTermsAndAttach given ipId is wrong address", async () => {
      try {
        await ipAssetClient.registerPilTermsAndAttach({
          ipId: "0x",
          terms: [licenseTerms],
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
          terms: [licenseTerms],
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
        terms: [licenseTerms],
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
        terms: [licenseTerms],
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
      const result = await ipAssetClient.registerPilTermsAndAttach({
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        terms: [licenseTerms, licenseTerms],
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTermsIds).to.deep.equal([0n, 0n]);
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
              terms: [licenseTerms],
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
            terms: [licenseTerms],
          },
          {
            spgNftContract,
            ipMetadata: {
              ipMetadataURI: "",
              ipMetadataHash: toHex(0, { size: 32 }),
            },
            terms: [licenseTerms],
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
          tokenContract: "0x1daAE3197Bc469Cb97B917a460a12dD95c6627c",
          tokenId: 3n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      sinon
        .stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: 5n });
      const result = await ipAssetClient.batchMintAndRegisterIpAssetWithPilTerms({
        args: [
          {
            spgNftContract,
            ipMetadata: {
              ipMetadataURI: "",
              ipMetadataHash: toHex(0, { size: 32 }),
            },
            terms: [licenseTerms],
          },
          {
            spgNftContract,
            ipMetadata: {
              ipMetadataURI: "",
              ipMetadataHash: toHex(0, { size: 32 }),
            },
            terms: [licenseTerms],
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
          licenseTermsIds: [5n],
          tokenId: 1n,
          spgNftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD94c6627c",
          licenseTermsIds: [5n],
          spgNftContract: "0x1daAE3197Bc469Cb97B917a460a12dD95c6627c",
          tokenId: 3n,
        },
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
          tokenContract: "0x1daAE3197Bc469Cb972B917aa460a12dD95c6627c",
          tokenId: 1n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
        {
          ipId: "0x11aAE3197Bc469Cb97B9171a460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469C8b97B917aa460a12dD95c6627c",
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
          spgNftContract: "0x1daAE3197Bc469Cb972B917aa460a12dD95c6627c",
          tokenId: 1n,
        },
        {
          ipId: "0x11aAE3197Bc469Cb97B9171a460a12dD95c6627c",
          spgNftContract: "0x1daAE3197Bc469C8b97B917aa460a12dD95c6627c",
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
          tokenContract: "0x1daAE3197Bc469Cbd97B917aa460a12dD95c6627c",
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
          nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 1n,
        },
        {
          ipId: "0x1daAE3197Bc469Cb87B917aa460a12dD95c6627c",
          nftContract: "0x1daAE3197Bc469Cbd97B917aa460a12dD95c6627c",
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

  describe("Test ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens", async () => {
    it("should throw ipId registered error when registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens given ipId is registered", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      try {
        await ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: "1",
          terms: licenseTerms,
          royaltyShares: [
            {
              author: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
              percentage: 1,
            },
          ],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and attach license terms and distribute royalty tokens: The NFT with id 1 is already registered as IP.",
        );
      }
    });
    it("should throw commercial terms error when registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens given commercial terms is not false", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      try {
        await ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: "1",
          terms: {
            ...licenseTerms,
            commercialUse: false,
          },
          royaltyShares: [
            {
              author: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
              percentage: 1,
            },
          ],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and attach license terms and distribute royalty tokens: Commercial use is required to deploy a royalty vault.",
        );
      }
    });

    it("should throw percentage error when registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens given percentage is less 0", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      try {
        await ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: "1",
          terms: licenseTerms,
          royaltyShares: [{ author: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: -1 }],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and attach license terms and distribute royalty tokens: The percentage of the royalty shares must be greater than 0.",
        );
      }
    });

    it("should throw percentage error when registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens given percentage is greater 100", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      try {
        await ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: "1",
          terms: licenseTerms,
          royaltyShares: [
            { author: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 101 },
          ],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and attach license terms and distribute royalty tokens: The percentage of the royalty shares must be less than or equal to 100.",
        );
      }
    });

    it("should throw percentage error when registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens given total percentage is greater 100", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      try {
        await ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: "1",
          terms: licenseTerms,
          royaltyShares: [
            { author: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 10 },
            { author: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and attach license terms and distribute royalty tokens: The sum of the royalty shares cannot exceeds 100.",
        );
      }
    });
    it("should return txHash when registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens given correct args", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon
        .stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "registerIpAndAttachPilTermsAndDeployRoyaltyVault",
        )
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      sinon
        .stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: 8n });
      sinon
        .stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent")
        .returns([
          {
            ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          },
        ]);
      sinon
        .stub(ipAssetClient.royaltyTokenDistributionWorkflowsClient, "distributeRoyaltyTokens")
        .resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 0n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      const result = await ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
        nftContract: spgNftContract,
        tokenId: "1",
        terms: licenseTerms,
        royaltyShares: [{ author: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 }],
      });
      expect(result).to.deep.equal({
        registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash:
          "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
        distributeRoyaltyTokensTxHash: txHash,
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        licenseTermsId: 8n,
        ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });
    });

    it("should throw error when registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens given IpAccount balance is not enough", async () => {
      IpRoyaltyVaultImplReadOnlyClient.prototype.balanceOf = sinon.stub().resolves(100);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon
        .stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "registerIpAndAttachPilTermsAndDeployRoyaltyVault",
        )
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 0n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      sinon
        .stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: 8n });
      sinon
        .stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent")
        .returns([
          {
            ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          },
        ]);
      sinon
        .stub(ipAssetClient.royaltyTokenDistributionWorkflowsClient, "distributeRoyaltyTokens")
        .resolves(txHash);
      try {
        await ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: "1",
          terms: licenseTerms,
          royaltyShares: [
            { author: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and attach license terms and distribute royalty tokens: The balance of the IP account in the IP Royalty Vault is insufficient to distribute the royalty tokens.",
        );
      }
    });
    it("should return txHash when registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens given correct args  and waitForTransaction of true", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon
        .stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "registerIpAndAttachPilTermsAndDeployRoyaltyVault",
        )
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 0n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      sinon
        .stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: 8n });
      sinon
        .stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent")
        .returns([
          {
            ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          },
        ]);
      sinon
        .stub(ipAssetClient.royaltyTokenDistributionWorkflowsClient, "distributeRoyaltyTokens")
        .resolves(txHash);

      const result = await ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
        nftContract: spgNftContract,
        tokenId: "1",
        terms: licenseTerms,
        royaltyShares: [{ author: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 }],
        ipMetadata: {
          ipMetadataURI: "",
          ipMetadataHash: toHex(0, { size: 32 }),
          nftMetadataHash: toHex("nftMetadata", { size: 32 }),
          nftMetadataURI: "",
        },
        txOptions: {
          waitForTransaction: true,
        },
      });
      expect(result).to.deep.equal({
        registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash:
          "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
        distributeRoyaltyTokensTxHash: txHash,
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        licenseTermsId: 8n,
        ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });
    });
  });

  describe("Test ipAssetClient.registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokens", async () => {
    it("should throw ipId registered error when registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokens given ipId is registered", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      try {
        await ipAssetClient.registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          derivData: {
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
          },
          royaltyShares: [
            { author: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          nftContract: spgNftContract,
          tokenId: "1",
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative IP and attach license terms and distribute royalty tokens: The NFT with id 1 is already registered as IP.",
        );
      }
    });

    it("should return txHash when registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokens given correct args", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon
        .stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "registerIpAndMakeDerivativeAndDeployRoyaltyVault",
        )
        .resolves(txHash);
      sinon
        .stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: 8n });
      sinon
        .stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent")
        .returns([
          {
            ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          },
        ]);
      sinon
        .stub(ipAssetClient.royaltyTokenDistributionWorkflowsClient, "distributeRoyaltyTokens")
        .resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 0n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      const result =
        await ipAssetClient.registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          derivData: {
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
          },
          royaltyShares: [
            { author: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          nftContract: spgNftContract,
          tokenId: "1",
        });
      expect(result).to.deep.equal({
        registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensTxHash:
          "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
        distributeRoyaltyTokensTxHash: txHash,
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: 0n,
      });
    });

    it("should return txHash when registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokens given correct args with waitForTransaction of true", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon
        .stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "registerIpAndMakeDerivativeAndDeployRoyaltyVault",
        )
        .resolves(txHash);
      sinon
        .stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: 8n });
      sinon
        .stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent")
        .returns([
          {
            ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          },
        ]);
      sinon
        .stub(ipAssetClient.royaltyTokenDistributionWorkflowsClient, "distributeRoyaltyTokens")
        .resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 0n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      const result =
        await ipAssetClient.registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          derivData: {
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
          },
          royaltyShares: [
            { author: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            nftMetadataURI: "",
          },
          nftContract: spgNftContract,
          tokenId: "1",
          txOptions: {
            waitForTransaction: true,
          },
        });
      expect(result).to.deep.equal({
        registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokensTxHash:
          "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
        distributeRoyaltyTokensTxHash: txHash,
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: 0n,
      });
    });
  });

  describe("Test ipAssetClient.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens", async () => {
    it("should commercial terms error when mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens given commercial terms is not false", async () => {
      try {
        await ipAssetClient.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens({
          spgNftContract,
          terms: {
            ...licenseTerms,
            commercialUse: false,
          },
          royaltyShares: [
            {
              author: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
              percentage: 1,
            },
          ],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to mint and register IP and attach PIL terms and distribute royalty tokens: Commercial use is required to deploy a royalty vault.",
        );
      }
    });

    it("should return txHash when mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens given correct args", async () => {
      sinon
        .stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens",
        )
        .resolves(txHash);
      const result =
        await ipAssetClient.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens({
          spgNftContract,
          terms: licenseTerms,
          royaltyShares: [
            { author: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            nftMetadataURI: "",
          },
        });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash when mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens given correct args and waitForTransaction of true", async () => {
      sinon
        .stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens",
        )
        .resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 0n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      sinon
        .stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent")
        .returns([
          {
            ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          },
        ]);
      sinon
        .stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: 5n });
      const result =
        await ipAssetClient.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens({
          spgNftContract,
          terms: licenseTerms,
          royaltyShares: [
            {
              author: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
              percentage: 100,
            },
          ],
          txOptions: {
            waitForTransaction: true,
          },
        });
      expect(result).to.deep.equal({
        txHash: txHash,
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: 0n,
        licenseTermsId: 5n,
        ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });
    });
  });

  describe("Test ipAssetClient.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens", async () => {
    it("should throw commercial terms error when mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens given license terms id is not commercial", async () => {
      try {
        sinon.stub(ipAssetClient.licenseTemplateClient, "getLicenseTerms").resolves({
          terms: {
            ...licenseTerms,
            commercialUse: false,
          },
        });
        await ipAssetClient.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens({
          spgNftContract,
          royaltyShares: [
            { author: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          derivData: {
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to mint and register IP and make derivative and distribute royalty tokens: The license terms attached to the IP must be a commercial license to distribute royalty tokens.",
        );
      }
    });

    it("should return txHash when mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens given correct args", async () => {
      sinon
        .stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens",
        )
        .resolves(txHash);
      sinon.stub(ipAssetClient.licenseTemplateClient, "getLicenseTerms").resolves({
        terms: licenseTerms,
      });
      const result =
        await ipAssetClient.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens({
          spgNftContract,
          royaltyShares: [
            {
              author: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
              percentage: 100,
            },
          ],
          derivData: {
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
          },
        });
      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash when mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens given correct args and waitForTransaction of true", async () => {
      sinon
        .stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens",
        )
        .resolves(txHash);
      sinon.stub(ipAssetClient.licenseTemplateClient, "getLicenseTerms").resolves({
        terms: licenseTerms,
      });
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 0n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      sinon
        .stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent")
        .returns([
          {
            ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          },
        ]);
      const result =
        await ipAssetClient.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens({
          spgNftContract,
          royaltyShares: [
            { author: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          derivData: {
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
            licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          },
          recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            nftMetadataURI: "",
          },
          txOptions: {
            waitForTransaction: true,
          },
        });
      expect(result).to.deep.equal({
        txHash: txHash,
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: 0n,
      });
    });
  });
});
