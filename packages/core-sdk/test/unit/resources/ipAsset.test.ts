import chai from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { IPAssetClient, LicenseTerms, StoryRelationship } from "../../../src";
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
import { LicenseRegistryReadOnlyClient } from "../../../src/abi/generated";
import { MAX_ROYALTY_TOKEN, royaltySharesTotalSupply } from "../../../src/constants/common";
import { LicensingConfig } from "../../../src/types/common";
import { DerivativeDataInput } from "../../../src/types/resources/ipAsset";
import { txHash, walletAddress } from "../mockData";
const {
  RoyaltyModuleReadOnlyClient,
  IpRoyaltyVaultImplReadOnlyClient,
  IpAccountImplClient,
  SpgnftImplReadOnlyClient,
  LicensingModuleClient,
} = require("../../../src/abi/generated");
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
  currency: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
  uri: "",
};

const licensingConfig: LicensingConfig = {
  isSet: true,
  mintingFee: BigInt(1),
  licensingHook: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
  hookData: zeroHash,
  commercialRevShare: 1,
  disabled: false,
  expectMinimumGroupRewardShare: 0,
  expectGroupRewardPool: zeroAddress,
};
const derivData: DerivativeDataInput = {
  parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
  licenseTermsIds: ["1"],
  maxMintingFee: 0n,
  maxRts: 0,
  maxRevenueShare: 0,
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
    ipAssetClient = new IPAssetClient(rpcMock, walletMock, "1315");
    sinon.stub(LicenseRegistryReadOnlyClient.prototype, "getDefaultLicenseTerms").resolves({
      licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      licenseTermsId: 5n,
    });
    sinon.stub(RoyaltyModuleReadOnlyClient.prototype, "isWhitelistedRoyaltyPolicy").resolves(true);
    sinon.stub(RoyaltyModuleReadOnlyClient.prototype, "isWhitelistedRoyaltyToken").resolves(true);
    sinon
      .stub(IpRoyaltyVaultImplReadOnlyClient.prototype, "balanceOf")
      .resolves(royaltySharesTotalSupply);
    walletMock.signTypedData = sinon
      .stub()
      .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
    sinon
      .stub(IpAccountImplClient.prototype, "state")
      .resolves({ result: "0x2e778894d11b5308e4153f094e190496c1e0609652c19f8b87e5176484b9a56e" });
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
    (ipAssetClient.derivativeWorkflowsClient as any).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    sinon.stub(SpgnftImplReadOnlyClient.prototype, "mintFeeToken").resolves(zeroAddress);
    sinon.stub(LicensingModuleClient.prototype, "predictMintingLicenseFee").resolves({
      currencyToken: zeroAddress,
      tokenAmount: 0n,
    });
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
          type: StoryRelationship.APPEARS_IN,
        },
      ],
      createdAt: "2024-08-22T10:20:30Z",
      watermarkImg: "https://example.com/watermark.png",
      creators: [sampleCreatorData],
      media: [
        { name: "Cover Image", url: "https://example.com/cover.jpg", mimeType: "image/jpeg" },
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
            {
              parentIpId: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
              type: StoryRelationship.APPEARS_IN,
            },
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
          ipMetadataInput: {
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
      ipAssetClient = new IPAssetClient(rpcMock, walletMock, "1315");
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
          ipMetadataInput: {
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
        ipMetadataInput: {
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
        ipMetadataInput: {
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
          maxMintingFee: 0n,
          maxRts: 0,
          maxRevenueShare: 0,
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
          maxMintingFee: 0n,
          maxRts: 0,
          maxRevenueShare: 0,
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
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      try {
        await ipAssetClient.registerDerivative({
          childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: ["1", "2"],
          maxMintingFee: 0n,
          maxRts: 0,
          maxRevenueShare: 0,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative: The number of parent IP IDs must match the number of license terms IDs.",
        );
      }
    });
    it("should throw maxMintingFee error when registerDerivative given maxMintingFee is less than 0", async () => {
      try {
        sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
        await ipAssetClient.registerDerivative({
          childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: ["1"],
          maxMintingFee: -1,
          maxRts: 100,
          maxRevenueShare: 0,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative: The maxMintingFee must be greater than 0.",
        );
      }
    });
    it(`should throw maxRts error when registerDerivative given maxRts is greater than ${MAX_ROYALTY_TOKEN}`, async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      try {
        await ipAssetClient.registerDerivative({
          childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: ["1"],
          maxMintingFee: 0n,
          maxRts: 1000000001,
          maxRevenueShare: 0,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          `Failed to register derivative: The maxRts must be greater than 0 and less than ${MAX_ROYALTY_TOKEN}.`,
        );
      }
    });
    it("should throw maxRevenueShare error when registerDerivative given maxRevenueShare is less than royalty percent", async () => {
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100000000,
      });
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      try {
        await ipAssetClient.registerDerivative({
          childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: ["1"],
          maxMintingFee: 0n,
          maxRts: 0,
          maxRevenueShare: 1,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative: The royalty percent for the parent IP with id 0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4 is greater than the maximum revenue share 1000000.",
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

      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });

      try {
        await ipAssetClient.registerDerivative({
          childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: ["1"],
          maxMintingFee: 0n,
          maxRts: 0,
          maxRevenueShare: 0,
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
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });

      const res = await ipAssetClient.registerDerivative({
        childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
        licenseTermsIds: ["1"],
        maxMintingFee: 0n,
        maxRts: 0,
        maxRevenueShare: 0,
      });

      expect(res.txHash).equal(txHash);
    });

    it("should return txHash when registerDerivative given correct childIpId, parentIpId, licenseTermsIds and waitForTransaction of true", async () => {
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
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      // Because registerDerivative doesn't call trigger IPRegistered event, but the `handleRegistrationWithFees`
      // will call it, so we need to mock the result of parseTxIpRegisteredEvent to avoid the error.
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([]);

      const res = await ipAssetClient.registerDerivative({
        childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
        licenseTermsIds: ["1"],
        licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        maxMintingFee: 0n,
        maxRts: 0,
        maxRevenueShare: 0,
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
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });

      const res = await ipAssetClient.registerDerivative({
        childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
        licenseTermsIds: ["1"],
        licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        maxMintingFee: 0n,
        maxRts: 0,
        maxRevenueShare: 0,
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(res.encodedTxData!.data).to.be.a("string").and.not.empty;
    });

    it("should call with default values of maxMintingFee, maxRts, maxRevenueShare when registerDerivative given maxMintingFee, maxRts, maxRevenueShare is not provided", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      const registerDerivativeStub = sinon
        .stub(ipAssetClient.licensingModuleClient, "registerDerivative")
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });

      await ipAssetClient.registerDerivative({
        childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
        licenseTermsIds: ["1"],
        licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });
      expect(registerDerivativeStub.args[0][0].maxMintingFee).equal(0n);
      expect(registerDerivativeStub.args[0][0].maxRts).equal(MAX_ROYALTY_TOKEN);
      expect(registerDerivativeStub.args[0][0].maxRevenueShare).equal(MAX_ROYALTY_TOKEN);
    });
  });

  describe("Test ipAssetClient.registerDerivativeWithLicenseTokens", async () => {
    it("should throw maxRts error when registerDerivativeWithLicenseTokens given maxRts is not number", async () => {
      try {
        await ipAssetClient.registerDerivativeWithLicenseTokens({
          childIpId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
          licenseTokenIds: ["1"],
          maxRts: "s",
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative with license tokens: The maxRts must be a number.",
        );
      }
    });
    it("should throw childIpId error when registerDerivativeWithLicenseTokens given childIpId is not registered", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await ipAssetClient.registerDerivativeWithLicenseTokens({
          childIpId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
          licenseTokenIds: ["1"],
          maxRts: 0,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative with license tokens: The child IP with id 0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4 is not registered.",
        );
      }
    });

    it("should throw maxRts error when registerDerivativeWithLicenseTokens given maxRts is less than 0", async () => {
      try {
        await ipAssetClient.registerDerivativeWithLicenseTokens({
          childIpId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
          licenseTokenIds: ["1"],
          maxRts: -1,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative with license tokens: The maxRts must be greater than 0 and less than 100000000.",
        );
      }
    });
    it("should throw maxRts error when registerDerivativeWithLicenseTokens given maxRts is greater than 100000000", async () => {
      try {
        await ipAssetClient.registerDerivativeWithLicenseTokens({
          childIpId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
          licenseTokenIds: ["1"],
          maxRts: 1000000001,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative with license tokens: The maxRts must be greater than 0 and less than 100000000.",
        );
      }
    });
    it("should throw licenseTokenIds error when registerDerivativeWithLicenseTokens given licenseTokenIds is empty", async () => {
      try {
        sinon
          .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
          .onCall(0)
          .resolves(true)
          .onCall(1)
          .resolves(true);
        await ipAssetClient.registerDerivativeWithLicenseTokens({
          childIpId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
          licenseTokenIds: [],
          maxRts: 0,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative with license tokens: The licenseTokenIds must be provided.",
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
          maxRts: 0,
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
        maxRts: 0,
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
        maxRts: 0,
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
        maxRts: 0,
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
          licenseTermsData: [
            {
              terms: licenseTerms,
              licensingConfig,
            },
          ],
          allowDuplicates: false,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to mint and register IP and attach PIL terms: Invalid address: 0x.",
        );
      }
    });

    it("should return txHash when createIpAssetWithPilTerms given correct args", async () => {
      sinon
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "mintAndRegisterIpAndAttachPilTerms")
        .resolves(txHash);
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      const result = await ipAssetClient.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract,
        licenseTermsData: [
          {
            terms: licenseTerms,
            licensingConfig,
          },
        ],
        allowDuplicates: false,
        recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        ipMetadataInput: {
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
      sinon
        .stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: 5n });
      const result = await ipAssetClient.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract,
        licenseTermsData: [
          {
            terms: licenseTerms,
            licensingConfig,
          },
        ],
        allowDuplicates: false,
        ipMetadataInput: {
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
      sinon
        .stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: 5n });
      const result = await ipAssetClient.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract,
        licenseTermsData: [
          {
            terms: licenseTerms,
            licensingConfig,
          },
        ],
        allowDuplicates: false,
        ipMetadataInput: {
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
        licenseTermsData: [
          {
            terms: licenseTerms,
            licensingConfig,
          },
        ],
        recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        ipMetadataInput: {
          ipMetadataURI: "",
          ipMetadataHash: toHex(0, { size: 32 }),
        },
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData!.data).to.be.a("string").and.not.empty;
    });

    it("should call with default values when createIpAssetWithPilTerms without providing allowDuplicates, ipMetadata, recipient", async () => {
      const mintAndRegisterIpAndAttachPilTermsStub = sinon
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "mintAndRegisterIpAndAttachPilTerms")
        .resolves(txHash);
      await ipAssetClient.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        licenseTermsData: [
          {
            terms: licenseTerms,
            licensingConfig,
          },
        ],
      });
      expect(mintAndRegisterIpAndAttachPilTermsStub.args[0][0].allowDuplicates).to.equal(true);
      expect(mintAndRegisterIpAndAttachPilTermsStub.args[0][0].ipMetadata).to.deep.equal({
        ipMetadataURI: "",
        ipMetadataHash: zeroHash,
        nftMetadataURI: "",
        nftMetadataHash: zeroHash,
      });
      expect(mintAndRegisterIpAndAttachPilTermsStub.args[0][0].recipient).to.equal(walletAddress);
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
          derivData,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative IP: The NFT with id 3 is already registered as IP.",
        );
      }
    });

    it("should throw not attach error when registerDerivativeIp given licenseTermsIds is not attached parentIpIds", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(false)
        .onSecondCall()
        .resolves(true);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(false);

      try {
        await ipAssetClient.registerDerivativeIp({
          nftContract: spgNftContract,
          tokenId: "3",
          derivData,
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
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(false)
        .onSecondCall()
        .resolves(true);
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon
        .stub(ipAssetClient.derivativeWorkflowsClient, "registerIpAndMakeDerivative")
        .resolves(txHash);

      const res = await ipAssetClient.registerDerivativeIp({
        nftContract: spgNftContract,
        tokenId: "3",
        derivData,
        ipMetadataInput: {
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
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(false)
        .onSecondCall()
        .resolves(true);
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
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
        derivData,
        ipMetadataInput: {
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
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(false)
        .onSecondCall()
        .resolves(true);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
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
        derivData,
        ipMetadataInput: {
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
          ipMetadataInput: {
            ipMetadataURI: "https://",
            ipMetadataHash: toHex("metadata", { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
          },
          licenseTermsData: [
            {
              terms: licenseTerms,
              licensingConfig,
            },
          ],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and attach PIL terms: The NFT with id 3 is already registered as IP.",
        );
      }
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
        ipMetadataInput: {
          ipMetadataHash: toHex(0, { size: 32 }),
        },
        licenseTermsData: [
          {
            terms: licenseTerms,
            licensingConfig,
          },
        ],
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
        ipMetadataInput: {
          ipMetadataURI: "https://",
        },
        licenseTermsData: [
          {
            terms: licenseTerms,
            licensingConfig,
          },
        ],
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
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "registerIpAndAttachPilTerms")
        .resolves(txHash);
      const result = await ipAssetClient.registerIpAndAttachPilTerms({
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c662ac",
        tokenId: "3",
        ipMetadataInput: {
          ipMetadataURI: "https://",
        },
        licenseTermsData: [
          {
            terms: licenseTerms,
            licensingConfig,
          },
        ],
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData!.data).to.be.a("string").and.not.empty;
    });
  });

  describe("Test ipAssetClient.mintAndRegisterIpAndMakeDerivative", async () => {
    it("should throw not attach error when call mintAndRegisterIpAndMakeDerivative given licenseTermsIds is not attached parentIpIds", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(false);

      try {
        await ipAssetClient.mintAndRegisterIpAndMakeDerivative({
          spgNftContract,
          derivData,
          allowDuplicates: false,
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
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon
        .stub(ipAssetClient.derivativeWorkflowsClient, "mintAndRegisterIpAndMakeDerivative")
        .resolves(txHash);

      const res = await ipAssetClient.mintAndRegisterIpAndMakeDerivative({
        spgNftContract,
        derivData,
        allowDuplicates: false,
        ipMetadataInput: {
          ipMetadataHash: toHex(0, { size: 32 }),
        },
      });

      expect(res.txHash).equal(txHash);
    });
    it("should return txHash and ipId when call mintAndRegisterIpAndMakeDerivative given correct args and waitForTransaction of true", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
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
        derivData,
        allowDuplicates: false,
        ipMetadataInput: {
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

    it("should return encoded tx data when call mintAndRegisterIpAndMakeDerivative given correct args and encodedTxDataOnly of true", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
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
        derivData,
        ipMetadataInput: {
          ipMetadataURI: "https://",
          nftMetadataHash: toHex("nftMetadata", { size: 32 }),
        },
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(res.encodedTxData!.data).to.be.a("string").and.not.empty;
    });

    it("should call with default values when mintAndRegisterIpAndMakeDerivative without providing allowDuplicates, ipMetadata", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
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

      const mintAndRegisterIpAndMakeDerivativeStub = sinon
        .stub(ipAssetClient.derivativeWorkflowsClient, "mintAndRegisterIpAndMakeDerivative")
        .resolves(txHash);

      await ipAssetClient.mintAndRegisterIpAndMakeDerivative({
        spgNftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        derivData,
      });

      expect(mintAndRegisterIpAndMakeDerivativeStub.args[0][0].allowDuplicates).to.equal(true);
      expect(mintAndRegisterIpAndMakeDerivativeStub.args[0][0].ipMetadata).to.deep.equal({
        ipMetadataURI: "",
        ipMetadataHash: zeroHash,
        nftMetadataURI: "",
        nftMetadataHash: zeroHash,
      });
      expect(mintAndRegisterIpAndMakeDerivativeStub.args[0][0].recipient).to.equal(walletAddress);
    });
  });
  describe("Test ipAssetClient.mintAndRegisterIp", async () => {
    it("should throw spgNftContract error when mintAndRegisterIp given spgNftContract is wrong address", async () => {
      try {
        await ipAssetClient.mintAndRegisterIp({
          spgNftContract: "0x",
          ipMetadataInput: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
          },
          allowDuplicates: false,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to mint and register IP: Invalid address: 0x.",
        );
      }
    });

    it("should throw recipient error when mintAndRegisterIp given recipient is wrong address", async () => {
      try {
        await ipAssetClient.mintAndRegisterIp({
          spgNftContract,
          recipient: "0x",
          ipMetadataInput: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
          },
          allowDuplicates: false,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to mint and register IP: Invalid address: 0x.",
        );
      }
    });

    it("should return txHash when mintAndRegisterIp given correct args", async () => {
      sinon.stub(ipAssetClient.registrationWorkflowsClient, "mintAndRegisterIp").resolves(txHash);

      const result = await ipAssetClient.mintAndRegisterIp({
        spgNftContract,
        allowDuplicates: false,
        ipMetadataInput: {
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
        allowDuplicates: false,
        ipMetadataInput: {
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
        allowDuplicates: false,
        recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        ipMetadataInput: {
          ipMetadataURI: "",
        },
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData!.data).to.be.a("string").and.not.empty;
    });

    it("should call with default values when mintAndRegisterIp without providing allowDuplicates, ipMetadata, recipient", async () => {
      const mintAndRegisterIpStub = sinon
        .stub(ipAssetClient.registrationWorkflowsClient, "mintAndRegisterIp")
        .resolves(txHash);

      await ipAssetClient.mintAndRegisterIp({
        spgNftContract,
      });

      expect(mintAndRegisterIpStub.args[0][0].allowDuplicates).to.equal(true);
      expect(mintAndRegisterIpStub.args[0][0].ipMetadata).to.deep.equal({
        ipMetadataURI: "",
        ipMetadataHash: zeroHash,
        nftMetadataURI: "",
        nftMetadataHash: zeroHash,
      });
      expect(mintAndRegisterIpStub.args[0][0].recipient).to.equal(walletAddress);
    });
  });

  describe("Test ipAssetClient.registerPilTermsAndAttach", async () => {
    it("should throw ipId error when registerPilTermsAndAttach given ipId is wrong address", async () => {
      try {
        await ipAssetClient.registerPilTermsAndAttach({
          ipId: "0x",
          licenseTermsData: [
            {
              terms: licenseTerms,
              licensingConfig,
            },
          ],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register PIL terms and attach: Invalid address: 0x.",
        );
      }
    });

    it("should throw ipId have not registered error when registerPilTermsAndAttach given ipId have not registered", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await ipAssetClient.registerPilTermsAndAttach({
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          licenseTermsData: [
            {
              terms: licenseTerms,
              licensingConfig,
            },
          ],
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
        licenseTermsData: [
          {
            terms: licenseTerms,
            licensingConfig,
          },
        ],
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData!.data).to.be.a("string").and.not.empty;
    });

    it("should return txHash when registerPilTermsAndAttach given correct args and waitForTransaction of true", async () => {
      sinon
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "registerPilTermsAndAttach")
        .resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId")
        .resolves({ selectedLicenseTermsId: 0n });
      const result = await ipAssetClient.registerPilTermsAndAttach({
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        licenseTermsData: [
          {
            terms: licenseTerms,
            licensingConfig,
          },
          {
            terms: licenseTerms,
            licensingConfig,
          },
        ],
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.licenseTermsIds).to.deep.equal([0n, 0n]);
    });

    it("should return txHash when registerPilTermsAndAttach given correct args ", async () => {
      sinon
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "registerPilTermsAndAttach")
        .resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      const result = await ipAssetClient.registerPilTermsAndAttach({
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        licenseTermsData: [
          {
            terms: licenseTerms,
            licensingConfig,
          },
        ],
      });
      expect(result.txHash).to.equal(txHash);
    });

    it("should call with default values of licensingConfig when registerPilTermsAndAttach given licensingConfig is not provided", async () => {
      const registerPilTermsAndAttachStub = sinon
        .stub(ipAssetClient.licenseAttachmentWorkflowsClient, "registerPilTermsAndAttach")
        .resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      await ipAssetClient.registerPilTermsAndAttach({
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        licenseTermsData: [
          {
            terms: licenseTerms,
          },
        ],
      });
      expect(
        registerPilTermsAndAttachStub.args[0][0].licenseTermsData[0].licensingConfig,
      ).to.deep.equal({
        isSet: false,
        mintingFee: 0n,
        licensingHook: zeroAddress,
        hookData: zeroAddress,
        commercialRevShare: 0,
        disabled: false,
        expectMinimumGroupRewardShare: 0,
        expectGroupRewardPool: zeroAddress,
      });
    });
  });

  describe("Test ipAssetClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens", async () => {
    it("should throw licenseTokens error when mintAndRegisterIpAndMakeDerivativeWithLicenseTokens given licenseTokens empty", async () => {
      try {
        await ipAssetClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens({
          spgNftContract,
          licenseTokenIds: [],
          maxRts: 0,
          allowDuplicates: false,
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
          maxRts: 0,
          allowDuplicates: false,
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
        ipMetadataInput: {
          ipMetadataURI: "",
          ipMetadataHash: toHex(0, { size: 32 }),
          nftMetadataHash: toHex("nftMetadata", { size: 32 }),
          nftMetadataURI: "",
        },
        recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        maxRts: 0,
        allowDuplicates: false,
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
        maxRts: 0,
        allowDuplicates: false,
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
        maxRts: 0,
        allowDuplicates: false,
        spgNftContract,
        licenseTokenIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        ipMetadataInput: {
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

    it("should call with default values when mintAndRegisterIpAndMakeDerivativeWithLicenseTokens without providing allowDuplicates, ipMetadata, royaltyContext, recipient", async () => {
      sinon
        .stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf")
        .resolves("0x73fcb515cee99e4991465ef586cfe2b072ebb512");
      const mintAndRegisterIpAndMakeDerivativeWithLicenseTokensStub = sinon
        .stub(
          ipAssetClient.derivativeWorkflowsClient,
          "mintAndRegisterIpAndMakeDerivativeWithLicenseTokens",
        )
        .resolves(txHash);

      await ipAssetClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens({
        spgNftContract,
        licenseTokenIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        maxRts: 0,
      });

      expect(
        mintAndRegisterIpAndMakeDerivativeWithLicenseTokensStub.args[0][0].allowDuplicates,
      ).to.equal(true);
      expect(
        mintAndRegisterIpAndMakeDerivativeWithLicenseTokensStub.args[0][0].ipMetadata,
      ).to.deep.equal({
        ipMetadataURI: "",
        ipMetadataHash: zeroHash,
        nftMetadataURI: "",
        nftMetadataHash: zeroHash,
      });
      expect(
        mintAndRegisterIpAndMakeDerivativeWithLicenseTokensStub.args[0][0].royaltyContext,
      ).to.equal(zeroAddress);
      expect(mintAndRegisterIpAndMakeDerivativeWithLicenseTokensStub.args[0][0].recipient).to.equal(
        walletAddress,
      );
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
          maxRts: 0,
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
          maxRts: 0,
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
        maxRts: 0,
        tokenId: "3",
        licenseTokenIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        ipMetadataInput: {
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
        maxRts: 0,
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
        maxRts: 0,
        licenseTokenIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        ipMetadataInput: {
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
              ipMetadataInput: {
                ipMetadataURI: "",
                ipMetadataHash: toHex(0, { size: 32 }),
              },
              licenseTermsData: [
                {
                  terms: licenseTerms,
                  licensingConfig,
                },
              ],
              allowDuplicates: false,
            },
          ],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to batch mint and register IP and attach PIL terms: Failed to mint and register IP and attach PIL terms: Invalid address: 0x.",
        );
      }
    });

    it("should return txHash when batchMintAndRegisterIpAssetWithPilTerms given correct args", async () => {
      sinon.stub(ipAssetClient.licenseAttachmentWorkflowsClient, "multicall").resolves(txHash);

      const result = await ipAssetClient.batchMintAndRegisterIpAssetWithPilTerms({
        args: [
          {
            spgNftContract,
            ipMetadataInput: {
              ipMetadataURI: "",
              ipMetadataHash: toHex(0, { size: 32 }),
            },

            licenseTermsData: [
              {
                terms: licenseTerms,
                licensingConfig,
              },
            ],
            allowDuplicates: false,
          },
          {
            spgNftContract,
            ipMetadataInput: {
              ipMetadataURI: "",
              ipMetadataHash: toHex(0, { size: 32 }),
            },

            licenseTermsData: [
              {
                terms: licenseTerms,
                licensingConfig,
              },
            ],
            allowDuplicates: false,
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
          ipId: "0x1daAE3197Bc469Cb87B917aa460a12dD95c6627c",
          chainId: 0n,
          tokenContract: "0x1daAE3197Bc469Cbd97B917aa460a12dD95c6627c",
          tokenId: 2n,
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
            ipMetadataInput: {
              ipMetadataURI: "",
              ipMetadataHash: toHex(0, { size: 32 }),
            },

            licenseTermsData: [
              {
                terms: licenseTerms,
                licensingConfig,
              },
            ],
            allowDuplicates: false,
          },
          {
            spgNftContract,
            ipMetadataInput: {
              ipMetadataURI: "",
              ipMetadataHash: toHex(0, { size: 32 }),
            },

            licenseTermsData: [
              {
                terms: licenseTerms,
                licensingConfig,
              },
            ],
            allowDuplicates: false,
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
          ipId: "0x1daAE3197Bc469Cb87B917aa460a12dD95c6627c",
          licenseTermsIds: [5n],
          spgNftContract: "0x1daAE3197Bc469Cbd97B917aa460a12dD95c6627c",
          tokenId: 2n,
        },
      ]);
    });
  });

  describe("Test ipAssetClient.batchMintAndRegisterIpAndMakeDerivative", async () => {
    it("should throw ipId and licenseTerms error when batchMintAndRegisterIpAndMakeDerivative given ipId and licenseTerms is not match", async () => {
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(false);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      try {
        await ipAssetClient.batchMintAndRegisterIpAndMakeDerivative({
          args: [
            {
              spgNftContract,
              recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
              derivData,
              allowDuplicates: false,
              ipMetadataInput: {
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
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      sinon.stub(ipAssetClient.derivativeWorkflowsClient, "multicall").resolves(txHash);

      const result = await ipAssetClient.batchMintAndRegisterIpAndMakeDerivative({
        args: [
          {
            spgNftContract,
            recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            derivData,
            allowDuplicates: false,
            ipMetadataInput: {
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
      //isRegistered
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
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
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      const result = await ipAssetClient.batchMintAndRegisterIpAndMakeDerivative({
        args: [
          {
            spgNftContract,
            recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            derivData,
            allowDuplicates: false,
            ipMetadataInput: {
              ipMetadataURI: "https://",
              nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            },
          },
          {
            spgNftContract,
            recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            derivData,
            allowDuplicates: false,
            ipMetadataInput: {
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
        expect((err as Error).message).equal("Failed to batch register IP: Invalid address: 0x.");
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
      sinon.stub(ipAssetClient.registrationWorkflowsClient, "multicall").resolves(txHash);
      const result = await ipAssetClient.batchRegister({
        args: [
          {
            nftContract: spgNftContract,
            tokenId: "1",
          },
          {
            nftContract: spgNftContract,
            tokenId: "2",
            ipMetadataInput: {
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
      expect(result.spgTxHash).to.equal(txHash);
      expect(result.results?.length).to.equal(4);
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
              maxMintingFee: 0n,
              maxRts: 0,
              maxRevenueShare: 0,
            },
          ],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to batch register derivative: Invalid address: 0x.",
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
      sinon.stub(ipAssetClient.multicall3Client, "aggregate3").resolves(txHash);
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      const result = await ipAssetClient.batchRegisterDerivative({
        args: [
          {
            childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: ["1"],
            maxMintingFee: 0n,
            maxRts: 0,
            maxRevenueShare: 0,
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
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      sinon.stub(ipAssetClient.multicall3Client, "aggregate3").resolves(txHash);
      const result = await ipAssetClient.batchRegisterDerivative({
        args: [
          {
            childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: ["1"],
            maxMintingFee: 0n,
            maxRts: 0,
            maxRevenueShare: 0,
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
          licenseTermsData: [
            {
              terms: licenseTerms,
              licensingConfig,
            },
          ],
          royaltyShares: [
            {
              recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
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

    it("should throw percentage error when registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens given percentage is less 0", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      try {
        await ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: "1",
          licenseTermsData: [
            {
              terms: licenseTerms,
              licensingConfig,
            },
          ],
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: -1 },
          ],
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
          licenseTermsData: [
            {
              terms: licenseTerms,
              licensingConfig,
            },
          ],
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 101 },
          ],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and attach license terms and distribute royalty tokens: The percentage of the royalty shares must be less than or equal to 100.",
        );
      }
    });
    it("should throw royaltyPolicy and mintFee match error when registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens given royaltyPolicy is zero address and mint fee is more than zero", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      try {
        await ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: "1",
          licenseTermsData: [
            {
              terms: {
                ...licenseTerms,
                royaltyPolicy: zeroAddress,
                defaultMintingFee: 0,
                commercialUse: false,
              },
              licensingConfig,
            },
          ],
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 10 },
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 10 },
          ],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and attach license terms and distribute royalty tokens: A royalty policy must be provided when the minting fee is greater than 0.",
        );
      }
    });
    it("should throw percentage error when registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens given total percentage is greater 100", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      try {
        await ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: "1",
          licenseTermsData: [
            {
              terms: licenseTerms,
              licensingConfig,
            },
          ],
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 10 },
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
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
        licenseTermsData: [
          {
            terms: licenseTerms,
            licensingConfig,
          },
        ],
        royaltyShares: [
          { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
        ],
      });
      expect(result).to.deep.equal({
        registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash:
          "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
        distributeRoyaltyTokensTxHash: txHash,
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        licenseTermsIds: [8n],
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
          licenseTermsData: [
            {
              terms: licenseTerms,
              licensingConfig,
            },
          ],
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
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
        licenseTermsData: [
          {
            terms: licenseTerms,
            licensingConfig,
          },
          {
            terms: licenseTerms,
            licensingConfig,
          },
        ],
        royaltyShares: [
          { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
        ],
        ipMetadataInput: {
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
        licenseTermsIds: [8n, 8n],
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
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      try {
        await ipAssetClient.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          derivData: {
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
            maxMintingFee: 100,
            maxRts: 100,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
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
    it("should throw maxRts error when registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokens given maxRts is less than 0", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await ipAssetClient.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: "1",
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          derivData: {
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
            maxMintingFee: 100,
            maxRts: -1,
            maxRevenueShare: 100,
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative IP and attach license terms and distribute royalty tokens: The maxRts must be greater than 0 and less than 100000000.",
        );
      }
    });
    it("should throw maxRts error when registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokens given maxRts is greater than 100000000", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await ipAssetClient.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: "1",
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          derivData: {
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
            maxMintingFee: 100,
            maxRts: MAX_ROYALTY_TOKEN + 1,
            maxRevenueShare: 100,
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative IP and attach license terms and distribute royalty tokens: The maxRts must be greater than 0 and less than 100000000.",
        );
      }
    });
    it("should throw maxMintingFee error when registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokens given maxMintingFee is less than 0", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await ipAssetClient.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: "1",
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          derivData: {
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
            maxMintingFee: -1,
            maxRts: 100,
            maxRevenueShare: 100,
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative IP and attach license terms and distribute royalty tokens: The maxMintingFee must be greater than 0.",
        );
      }
    });
    it("should throw parentIpIds and licenseTermsIds not match error when registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokens given parentIpIds and licenseTermsIds not match", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent")
        .resolves({ royaltyPercent: 100 });
      try {
        await ipAssetClient.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: "1",
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          derivData: {
            parentIpIds: [
              "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
              "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            ],
            licenseTermsIds: [1n],
            maxMintingFee: 100,
            maxRts: 100,
            maxRevenueShare: 100,
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative IP and attach license terms and distribute royalty tokens: The number of parent IP IDs must match the number of license terms IDs.",
        );
      }
    });

    it("should throw parentIpId not registered error when registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokens given parentIpId not registered", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      try {
        await ipAssetClient.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: "1",
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          derivData: {
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
            maxMintingFee: 100,
            maxRts: 100,
            maxRevenueShare: 100,
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative IP and attach license terms and distribute royalty tokens: The parent IP with id 0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c is not registered.",
        );
      }
    });
    it("should throw maxRevenueShare error when registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokens given maxRevenueShare is less than royaltyPercent", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 1000000000,
      });
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      try {
        await ipAssetClient.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: "1",
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          derivData: {
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
            maxMintingFee: 100,
            maxRts: 100,
            maxRevenueShare: 1,
            licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative IP and attach license terms and distribute royalty tokens: The royalty percent for the parent IP with id 0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c is greater than the maximum revenue share 1000000.",
        );
      }
    });
    it("should return txHash when registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokens given correct args", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);
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
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
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
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      const result =
        await ipAssetClient.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          derivData: {
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
            maxMintingFee: 100,
            maxRts: 100,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          nftContract: spgNftContract,
          tokenId: "1",
        });
      expect(result).to.deep.equal({
        registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensTxHash: txHash,
        distributeRoyaltyTokensTxHash: txHash,
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: 0n,
      });
    });

    it("should return txHash when registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokens given correct args with waitForTransaction of true", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);
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
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
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
        await ipAssetClient.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          derivData: {
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
            maxMintingFee: 100,
            maxRts: 100,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          ipMetadataInput: {
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
        registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensTxHash: txHash,
        distributeRoyaltyTokensTxHash: txHash,
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: 0n,
      });
    });
  });

  describe("Test ipAssetClient.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens", async () => {
    it("should throw spgNftContract error when mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens given spgNftContract is not correct", async () => {
      try {
        await ipAssetClient.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens({
          spgNftContract: "0x",
          licenseTermsData: [
            {
              terms: licenseTerms,
              licensingConfig,
            },
          ],
          allowDuplicates: true,
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to mint and register IP and attach PIL terms and distribute royalty tokens: Invalid address: 0x.",
        );
      }
    });
    it("should return txHash when mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens given correct args", async () => {
      const ipId = "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4";
      sinon
        .stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens",
        )
        .resolves(txHash);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId,
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
        .resolves({ selectedLicenseTermsId: 5n });
      sinon
        .stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent")
        .returns([
          {
            ipId,
            ipRoyaltyVault: zeroAddress,
          },
        ]);
      const result =
        await ipAssetClient.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens({
          spgNftContract,
          licenseTermsData: [
            {
              terms: licenseTerms,
              licensingConfig,
            },
          ],
          allowDuplicates: true,
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          ipMetadataInput: {
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
          licenseTermsData: [
            {
              terms: licenseTerms,
              licensingConfig,
            },
          ],
          allowDuplicates: true,
          royaltyShares: [
            {
              recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
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
        licenseTermsIds: [5n],
        ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });
    });

    it("should call with default values when mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens without providing allowDuplicates, ipMetadata, recipient", async () => {
      const mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensStub = sinon
        .stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens",
        )
        .resolves(txHash);

      await ipAssetClient.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens({
        spgNftContract,
        licenseTermsData: [
          {
            terms: licenseTerms,
            licensingConfig,
          },
        ],
        royaltyShares: [
          { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
        ],
      });

      expect(
        mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensStub.args[0][0].allowDuplicates,
      ).to.equal(true);
      expect(
        mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensStub.args[0][0].ipMetadata,
      ).to.deep.equal({
        ipMetadataURI: "",
        ipMetadataHash: zeroHash,
        nftMetadataHash: zeroHash,
        nftMetadataURI: "",
      });
      expect(
        mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensStub.args[0][0].recipient,
      ).to.equal(walletAddress);
    });
  });

  describe("Test ipAssetClient.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens", async () => {
    it("should throw parent ip id error when mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens given parent ip id is empty", async () => {
      sinon.stub(ipAssetClient.licenseTemplateClient, "getLicenseTerms").resolves({
        terms: {
          ...licenseTerms,
          commercialUse: true,
        },
      });
      try {
        await ipAssetClient.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens({
          spgNftContract,
          allowDuplicates: false,
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          derivData: {
            parentIpIds: [],
            licenseTermsIds: [1n],
            maxMintingFee: 100,
            maxRts: 100,
            maxRevenueShare: 100,
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to mint and register IP and make derivative and distribute royalty tokens: The parent IP IDs must be provided.",
        );
      }
    });

    it("should throw license terms id error when mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens given license terms id is empty", async () => {
      sinon.stub(ipAssetClient.licenseTemplateClient, "getLicenseTerms").resolves({
        terms: {
          ...licenseTerms,
          commercialUse: true,
        },
      });
      try {
        await ipAssetClient.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens({
          spgNftContract,
          allowDuplicates: false,
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          derivData: {
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [],
            maxMintingFee: 100,
            maxRts: 100,
            maxRevenueShare: 100,
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to mint and register IP and make derivative and distribute royalty tokens: The license terms IDs must be provided.",
        );
      }
    });

    it("should throw maxRevenueShare error when mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens given maxRevenueShare is greater than 100", async () => {
      sinon.stub(ipAssetClient.licenseTemplateClient, "getLicenseTerms").resolves({
        terms: {
          ...licenseTerms,
          commercialUse: true,
        },
      });
      try {
        await ipAssetClient.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens({
          spgNftContract,
          allowDuplicates: false,
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          derivData: {
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
            maxMintingFee: 100,
            maxRts: 100,
            maxRevenueShare: 101,
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to mint and register IP and make derivative and distribute royalty tokens: MaxRevenueShare must be between 0 and 100.",
        );
      }
    });
    it("should throw maxRevenueShare error when mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens given maxRevenueShare is less than 0", async () => {
      sinon.stub(ipAssetClient.licenseTemplateClient, "getLicenseTerms").resolves({
        terms: {
          ...licenseTerms,
          commercialUse: true,
        },
      });
      try {
        await ipAssetClient.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens({
          spgNftContract,
          allowDuplicates: false,
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          derivData: {
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
            maxMintingFee: 100,
            maxRts: 100,
            maxRevenueShare: -1,
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to mint and register IP and make derivative and distribute royalty tokens: MaxRevenueShare must be between 0 and 100.",
        );
      }
    });
    it("should return txHash when mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens given correct args", async () => {
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
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
              recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
              percentage: 100,
            },
          ],
          derivData: {
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
            maxMintingFee: 100,
            maxRts: 100,
            maxRevenueShare: 100,
          },
          allowDuplicates: false,
        });
      expect(result.txHash).to.equal(txHash);
    });

    it("should return txHash when mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens given correct args and waitForTransaction of true", async () => {
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
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
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
          ],
          derivData: {
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
            licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            maxMintingFee: 100,
            maxRts: 100,
            maxRevenueShare: 100,
          },
          recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
          ipMetadataInput: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            nftMetadataURI: "",
          },
          allowDuplicates: false,
          txOptions: {
            waitForTransaction: true,
          },
        });
      expect(result).to.deep.equal({
        txHash: txHash,
        receipt: {},
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: 0n,
      });
    });

    it("should call with default values when mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens without providing allowDuplicates, ipMetadata, recipient", async () => {
      sinon.stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      sinon
        .stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms")
        .resolves(true);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      sinon.stub(ipAssetClient.licenseTemplateClient, "getLicenseTerms").resolves({
        terms: licenseTerms,
      });
      const mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensStub = sinon
        .stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens",
        )
        .resolves(txHash);

      await ipAssetClient.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens({
        spgNftContract,
        derivData: {
          parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
          licenseTermsIds: [1n],
          maxMintingFee: 100,
          maxRts: 100,
          maxRevenueShare: 100,
        },
        royaltyShares: [
          { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
        ],
      });

      expect(
        mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensStub.args[0][0].allowDuplicates,
      ).to.equal(true);
      expect(
        mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensStub.args[0][0].ipMetadata,
      ).to.deep.equal({
        ipMetadataURI: "",
        ipMetadataHash: zeroHash,
        nftMetadataHash: zeroHash,
        nftMetadataURI: "",
      });
      expect(
        mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensStub.args[0][0].recipient,
      ).to.equal(walletAddress);
    });
  });
});
