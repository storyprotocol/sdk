import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { SinonStub, stub } from "sinon";
import { Address, PublicClient, toHex, WalletClient, zeroAddress, zeroHash } from "viem";

import {
  IPAssetClient,
  LicenseTerms,
  NativeRoyaltyPolicy,
  PILFlavor,
  StoryRelationship,
} from "../../../src";
import {
  DerivativeWorkflowsClient,
  erc20Address,
  IpAccountImplClient,
  IpAssetRegistryClient,
  IpRoyaltyVaultImplReadOnlyClient,
  LicenseAttachmentWorkflowsClient,
  LicenseRegistryReadOnlyClient,
  LicensingModuleClient,
  PiLicenseTemplateClient,
  RoyaltyModuleEventClient,
  RoyaltyModuleReadOnlyClient,
  royaltyPolicyLapAddress,
  royaltyPolicyLrpAddress,
  RoyaltyTokenDistributionWorkflowsClient,
  SpgnftImplReadOnlyClient,
} from "../../../src/abi/generated";
import {
  MAX_ROYALTY_TOKEN,
  royaltySharesTotalSupply,
  WIP_TOKEN_ADDRESS,
} from "../../../src/constants/common";
import { LicensingConfigInput } from "../../../src/types/common";
import {
  DerivativeDataInput,
  IpRegistrationWorkflowRequest,
} from "../../../src/types/resources/ipAsset";
import { mockERC721 } from "../../integration/utils/util";
import { aeneid, ipId, mockAddress, txHash, walletAddress } from "../mockData";
import {
  createMockPublicClient,
  createMockWalletClient,
  generateRandomAddress,
} from "../testUtils";

use(chaiAsPromised);
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

const licensingConfig: LicensingConfigInput = {
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
  licenseTermsIds: [1n],
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
    rpcMock = createMockPublicClient();
    walletMock = createMockWalletClient();
    // Mock predictMintingLicenseFee
    rpcMock.readContract = stub().resolves([zeroAddress, 0n]);
    ipAssetClient = new IPAssetClient(rpcMock, walletMock, 1315);
    stub(LicenseRegistryReadOnlyClient.prototype, "getDefaultLicenseTerms").resolves({
      licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      licenseTermsId: 5n,
    });
    stub(RoyaltyModuleReadOnlyClient.prototype, "isWhitelistedRoyaltyPolicy").resolves(true);
    stub(RoyaltyModuleReadOnlyClient.prototype, "isWhitelistedRoyaltyToken").resolves(true);
    stub(IpRoyaltyVaultImplReadOnlyClient.prototype, "balanceOf").resolves(
      BigInt(royaltySharesTotalSupply),
    );
    stub(IpAccountImplClient.prototype, "state").resolves({
      result: "0x2e778894d11b5308e4153f094e190496c1e0609652c19f8b87e5176484b9a56e",
    });
    (ipAssetClient.accessControllerClient as { address: Address }).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (ipAssetClient.coreMetadataModuleClient as { address: Address }).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (ipAssetClient.licensingModuleClient as { address: Address }).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (ipAssetClient.registrationWorkflowsClient as { address: Address }).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (ipAssetClient.licenseAttachmentWorkflowsClient as { address: Address }).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (ipAssetClient.licenseTemplateClient as { address: Address }).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (ipAssetClient.royaltyTokenDistributionWorkflowsClient as { address: Address }).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (ipAssetClient.derivativeWorkflowsClient as { address: Address }).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (ipAssetClient.multicall3Client as { address: Address }).address = mockAddress;
    stub(SpgnftImplReadOnlyClient.prototype, "mintFeeToken").resolves(WIP_TOKEN_ADDRESS);
    stub(LicensingModuleClient.prototype, "predictMintingLicenseFee").resolves({
      currencyToken: zeroAddress,
      tokenAmount: 0n,
    });
    stub(ipAssetClient.totalLicenseTokenLimitHookClient, "setTotalLicenseTokenLimit").resolves(
      txHash,
    );
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

  describe("Test ipAssetClient.register", () => {
    it("should return ipId when register given tokenId have registered", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
      );
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      const res = await ipAssetClient.register({
        nftContract: spgNftContract,
        tokenId: 3,
      });

      expect(res.ipId).equal("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
      expect(res.txHash).to.equal(undefined);
    });

    it("should throw account error when register given wallet have no signTypedData ", async () => {
      const newWalletMock = createMockWalletClient();
      const walletWithOptionalMethods = newWalletMock as Partial<typeof newWalletMock>;
      delete walletWithOptionalMethods.signTypedData;
      ipAssetClient = new IPAssetClient(rpcMock, newWalletMock, 1315);
      (ipAssetClient.registrationWorkflowsClient as { address: Address }).address =
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
      (ipAssetClient.coreMetadataModuleClient as { address: Address }).address =
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";

      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
      );
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await ipAssetClient.register({
          nftContract: spgNftContract,
          tokenId: 3,
          deadline: 12321,
          ipMetadata: {
            ipMetadataURI: "",
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP: The wallet client does not support signTypedData, please try again.",
        );
      }
    });

    it("should return txHash when register given tokenId have no registered", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      stub(ipAssetClient.ipAssetRegistryClient, "register").resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
      const res = await ipAssetClient.register({
        nftContract: spgNftContract,
        tokenId: 3,
      });

      expect(res.txHash).equal(txHash);
    });

    it("should return ipId and txHash when register a IP and tokenId is not registered ", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
      );
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      stub(ipAssetClient.ipAssetRegistryClient, "register").resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
        tokenId: 3,
      });

      expect(response.txHash).equal(txHash);
      expect(response.ipId).equals("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
    });

    it("should return ipId and txHash when register a IP given correct args and metadata", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
      );
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      stub(ipAssetClient.registrationWorkflowsClient, "registerIp").resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
        tokenId: 3,
        ipMetadata: {
          ipMetadataURI: "",
          ipMetadataHash: zeroHash,
          nftMetadataHash: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      });

      expect(response.txHash).equal(txHash);
      expect(response.ipId).equals("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
    });

    it("should throw error when request fails", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
      );
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      stub(ipAssetClient.ipAssetRegistryClient, "register").throws(new Error("revert error"));
      try {
        await ipAssetClient.register({
          nftContract: spgNftContract,
          tokenId: 3,
        });
      } catch (err) {
        expect((err as Error).message).equal("Failed to register IP: revert error");
      }
    });

    it("should return encoded tx data when register a IP given correct args, encodedTxDataOnly is true and metadata", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
      );
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      stub(ipAssetClient.registrationWorkflowsClient, "registerIp").resolves(
        "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
      );
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
        tokenId: 3,
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(response.encodedTxData!.data).to.be.a("string");
    });
  });

  describe("Test ipAssetClient.registerDerivative", () => {
    it("should throw childIpId error when registerDerivative given childIpId is not registered", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await ipAssetClient.registerDerivative({
          childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: [1n],
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
      stub(IpAssetRegistryClient.prototype, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(false);

      try {
        await ipAssetClient.registerDerivative({
          childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627a"],
          licenseTermsIds: [1n],
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
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);
      stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      try {
        await ipAssetClient.registerDerivative({
          childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: [1n, 2n],
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
        stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
        await ipAssetClient.registerDerivative({
          childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: [1n],
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
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      try {
        await ipAssetClient.registerDerivative({
          childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: [1n],
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
      stub(LicenseRegistryReadOnlyClient.prototype, "getRoyaltyPercent").resolves({
        royaltyPercent: 100000000,
      });

      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);

      stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      try {
        await ipAssetClient.registerDerivative({
          childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: [1n],
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
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);

      stub(LicenseRegistryReadOnlyClient.prototype, "hasIpAttachedLicenseTerms").resolves(false);

      stub(LicenseRegistryReadOnlyClient.prototype, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });

      try {
        await ipAssetClient.registerDerivative({
          childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: [1n],
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

    it("should return txHash when registerDerivative given correct childIpId, parentIpId, licenseTermsIds", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);

      stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      stub(ipAssetClient.licensingModuleClient, "registerDerivative").resolves(txHash);
      stub(LicenseRegistryReadOnlyClient.prototype, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      // Because registerDerivative doesn't call trigger IPRegistered event, but the `handleRegistrationWithFees`
      // will call it, so we need to mock the result of parseTxIpRegisteredEvent to avoid the error.
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([]);

      const res = await ipAssetClient.registerDerivative({
        childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
        licenseTermsIds: [1n],
        licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        maxMintingFee: 0n,
        maxRts: 0,
        maxRevenueShare: 0,
      });

      expect(res.txHash).equal(txHash);
    });

    it("should return encoded tx data when registerDerivative given correct childIpId, parentIpId, licenseTermsIds and encodedTxDataOnly of true ", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);

      stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);

      stub(ipAssetClient.licensingModuleClient, "registerDerivative").resolves(
        "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
      );
      stub(LicenseRegistryReadOnlyClient.prototype, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });

      const res = await ipAssetClient.registerDerivative({
        childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
        licenseTermsIds: [1n],
        licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        maxMintingFee: 0n,
        maxRts: 0,
        maxRevenueShare: 0,
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(res.encodedTxData!.data).to.be.a("string");
    });

    it("should call with default values of maxMintingFee, maxRts, maxRevenueShare when registerDerivative given maxMintingFee, maxRts, maxRevenueShare is not provided", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);

      stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      const registerDerivativeStub = stub(
        ipAssetClient.licensingModuleClient,
        "registerDerivative",
      ).resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      stub(LicenseRegistryReadOnlyClient.prototype, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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

      await ipAssetClient.registerDerivative({
        childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
        licenseTermsIds: [1n],
        licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });
      expect(registerDerivativeStub.args[0][0].maxMintingFee).equal(0n);
      expect(registerDerivativeStub.args[0][0].maxRts).equal(MAX_ROYALTY_TOKEN);
      expect(registerDerivativeStub.args[0][0].maxRevenueShare).equal(MAX_ROYALTY_TOKEN);
    });
  });

  describe("Test ipAssetClient.registerDerivativeWithLicenseTokens", () => {
    it("should throw childIpId error when registerDerivativeWithLicenseTokens given childIpId is not registered", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await ipAssetClient.registerDerivativeWithLicenseTokens({
          childIpId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
          licenseTokenIds: [1n],
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
          licenseTokenIds: [1n],
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
          licenseTokenIds: [1n],
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
        stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
          .onCall(0)
          .resolves(true)
          .onCall(1)
          .resolves(true);
        await ipAssetClient.registerDerivativeWithLicenseTokens({
          childIpId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
          licenseTokenIds: [1n],
          maxRts: 0,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative with license tokens: The licenseTokenIds must be provided.",
        );
      }
    });
    it("should throw own error when registerDerivativeWithLicenseTokens given licenseTokenIds is not belongs caller", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);
      stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf").resolves(undefined);

      try {
        await ipAssetClient.registerDerivativeWithLicenseTokens({
          childIpId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
          licenseTokenIds: [1n],
          maxRts: 0,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative with license tokens: License token id 1 must be owned by the caller.",
        );
      }
    });

    it("should return txHash when registerDerivativeWithLicenseTokens given correct args", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);

      stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf").resolves(
        "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      );

      stub(ipAssetClient.licensingModuleClient, "registerDerivativeWithLicenseTokens").resolves(
        txHash,
      );

      const res = await ipAssetClient.registerDerivativeWithLicenseTokens({
        childIpId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
        licenseTokenIds: [1n],
        maxRts: 0,
      });

      expect(res.txHash).equal(txHash);
    });

    it("should return txHash when registerDerivativeWithLicenseTokens given correct args", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);

      stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf").resolves(
        "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      );

      stub(ipAssetClient.licensingModuleClient, "registerDerivativeWithLicenseTokens").resolves(
        txHash,
      );

      const res = await ipAssetClient.registerDerivativeWithLicenseTokens({
        childIpId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
        licenseTokenIds: [1n],
        maxRts: 0,
      });

      expect(res.txHash).equal(txHash);
    });

    it("should return encoded tx data when registerDerivativeWithLicenseTokens given correct args and encodedTxDataOnly of true", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onCall(0)
        .resolves(true)
        .onCall(1)
        .resolves(true);

      stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf").resolves(
        "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      );

      stub(ipAssetClient.licensingModuleClient, "registerDerivativeWithLicenseTokens").resolves(
        "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
      );

      const res = await ipAssetClient.registerDerivativeWithLicenseTokens({
        childIpId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
        licenseTokenIds: [1n],
        maxRts: 0,
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(res.encodedTxData!.data).to.be.a("string");
    });
  });

  describe("Test ipAssetClient.createIpAssetWithPilTerms", () => {
    it("should throw address error when createIpAssetWithPilTerms given spgNftContract is wrong address", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

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
      stub(
        ipAssetClient.licenseAttachmentWorkflowsClient,
        "mintAndRegisterIpAndAttachPilTerms",
      ).resolves(txHash);
      stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
        ipMetadata: {
          ipMetadataURI: "",
          ipMetadataHash: toHex(0, { size: 32 }),
        },
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return ipId, tokenId, licenseTermsId,txHash when createIpAssetWithPilTerms given correct args", async () => {
      stub(
        ipAssetClient.licenseAttachmentWorkflowsClient,
        "mintAndRegisterIpAndAttachPilTerms",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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

      stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 5n,
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
        ipMetadata: {
          nftMetadataHash: toHex(0, { size: 32 }),
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.ipId).to.equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      expect(result.licenseTermsIds![0]).to.equal(5n);
      expect(result.tokenId).to.equal(1n);
      expect(result.maxLicenseTokensTxHashes).to.be.an("undefined");
    });

    it("should return ipId, tokenId, licenseTermsId,txHash when createIpAssetWithPilTerms given correct args with default license terms id", async () => {
      stub(
        ipAssetClient.licenseAttachmentWorkflowsClient,
        "mintAndRegisterIpAndAttachPilTerms",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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

      stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 5n,
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
        ipMetadata: {
          nftMetadataHash: toHex(0, { size: 32 }),
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
        ipMetadata: {
          ipMetadataURI: "",
          ipMetadataHash: toHex(0, { size: 32 }),
        },
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData!.data).to.be.a("string");
    });

    it("should call with default values when createIpAssetWithPilTerms without providing allowDuplicates, ipMetadata, recipient", async () => {
      const mintAndRegisterIpAndAttachPilTermsStub = stub(
        ipAssetClient.licenseAttachmentWorkflowsClient,
        "mintAndRegisterIpAndAttachPilTerms",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
    it("should successfully when call mint and register ip asset with pil terms with license terms max limit", async () => {
      stub(
        ipAssetClient.licenseAttachmentWorkflowsClient,
        "mintAndRegisterIpAndAttachPilTerms",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
      const result = await ipAssetClient.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: mockAddress,
        allowDuplicates: false,
        licenseTermsData: [
          {
            terms: licenseTerms,
            licensingConfig,
            maxLicenseTokens: 100,
          },
          {
            terms: licenseTerms,
            licensingConfig,
            maxLicenseTokens: 100,
          },
          {
            terms: licenseTerms,
            licensingConfig,
          },
        ],
      });
      expect(result.maxLicenseTokensTxHashes).to.be.an("array");
      expect(result.maxLicenseTokensTxHashes?.length).to.be.equal(2);
    });
    it("should be called with expected values given PILFlavor.commercialRemix", async () => {
      const mintAndRegisterIpAndAttachPilTermsStub = stub(
        ipAssetClient.licenseAttachmentWorkflowsClient,
        "mintAndRegisterIpAndAttachPilTerms",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
      await ipAssetClient.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: mockAddress,
        allowDuplicates: false,
        licenseTermsData: [
          {
            terms: PILFlavor.commercialRemix({
              defaultMintingFee: 0n,
              currency: mockAddress,
              commercialRevShare: 90,
              royaltyPolicy: NativeRoyaltyPolicy.LAP,
              override: {
                commercialRevShare: 10,
              },
            }),
          },
        ],
      });
      expect(
        mintAndRegisterIpAndAttachPilTermsStub.args[0][0].licenseTermsData[0].terms,
      ).to.deep.equal({
        commercialAttribution: true,
        commercialRevCeiling: 0n,
        commercialRevShare: 10 * 10 ** 6,
        commercialUse: true,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: zeroAddress,
        currency: mockAddress,
        defaultMintingFee: 0n,
        derivativeRevCeiling: 0n,
        derivativesAllowed: true,
        derivativesApproval: false,
        derivativesAttribution: true,
        derivativesReciprocal: true,
        expiration: 0n,
        royaltyPolicy: royaltyPolicyLapAddress[aeneid],
        transferable: true,
        uri: "https://github.com/piplabs/pil-document/blob/ad67bb632a310d2557f8abcccd428e4c9c798db1/off-chain-terms/CommercialRemix.json",
      });
    });
  });

  describe("Test ipAssetClient.registerDerivativeIp", () => {
    it("should throw ipId have registered error when registerDerivativeIp given tokenId have registered", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      try {
        await ipAssetClient.registerDerivativeIp({
          nftContract: spgNftContract,
          tokenId: 3,
          derivData,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative IP: The NFT with id 3 is already registered as IP.",
        );
      }
    });

    it("should throw not attach error when registerDerivativeIp given licenseTermsIds is not attached parentIpIds", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );

      stub(IpAssetRegistryClient.prototype, "isRegistered")
        .onFirstCall()
        .resolves(false)
        .onSecondCall()
        .resolves(true);

      stub(LicenseRegistryReadOnlyClient.prototype, "hasIpAttachedLicenseTerms").resolves(false);

      try {
        await ipAssetClient.registerDerivativeIp({
          nftContract: spgNftContract,
          tokenId: 3,
          derivData,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative IP: License terms id 1 must be attached to the parent ipId 0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4 before registering derivative.",
        );
      }
    });
    it("should return txHash and ipId when registerDerivativeIp given correct args ", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );

      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(false)
        .onSecondCall()
        .resolves(true);
      stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });

      stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);

      stub(ipAssetClient.derivativeWorkflowsClient, "registerIpAndMakeDerivative").resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
        tokenId: 3,
        derivData,
        ipMetadata: {
          ipMetadataURI: "https://",
          nftMetadataHash: toHex("nftMetadata", { size: 32 }),
        },
      });

      expect(res.txHash).equal(txHash);
      expect(res.ipId).equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
    });

    it("should return encoded tx data when registerDerivativeIp given correct args and encodedTxDataOnly of true", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );

      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(false)
        .onSecondCall()
        .resolves(true);

      stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });

      stub(ipAssetClient.derivativeWorkflowsClient, "registerIpAndMakeDerivative").resolves(
        "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
      );
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
        tokenId: 3,
        derivData,
        ipMetadata: {
          ipMetadataURI: "https://",
          nftMetadataHash: toHex("nftMetadata", { size: 32 }),
        },
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(res.encodedTxData!.data).to.be.a("string");
    });
  });

  describe("Test ipAssetClient.registerIpAndAttachPilTerms", () => {
    it("should throw ipId have registered error when registerIpAndAttachPilTerms given tokenId have registered", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      try {
        await ipAssetClient.registerIpAndAttachPilTerms({
          nftContract: spgNftContract,
          tokenId: 3,
          ipMetadata: {
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

    it("should return txHash and ipId when registerIpAndAttachPilTerms given correct args ", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      stub(ipAssetClient.licenseAttachmentWorkflowsClient, "registerIpAndAttachPilTerms").resolves(
        txHash,
      );

      stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 5n,
      });
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
        tokenId: 3,
        ipMetadata: {
          ipMetadataURI: "https://",
        },
        licenseTermsData: [
          {
            terms: licenseTerms,
            licensingConfig,
          },
        ],
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.ipId).to.equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      expect(result.licenseTermsIds).to.deep.equal([5n]);
      expect(result.maxLicenseTokensTxHashes).to.be.an("undefined");
    });
    it("should return licenseTermsMaxLimitTxHashes when registerIpAndAttachPilTerms given correct args with license terms max limit", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 5n,
      });
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
      stub(ipAssetClient.licenseAttachmentWorkflowsClient, "registerIpAndAttachPilTerms").resolves(
        txHash,
      );
      const result = await ipAssetClient.registerIpAndAttachPilTerms({
        nftContract: spgNftContract,
        tokenId: 3,
        ipMetadata: {
          ipMetadataURI: "https://",
        },
        licenseTermsData: [
          {
            terms: licenseTerms,
            licensingConfig,
            maxLicenseTokens: 100,
          },
          {
            terms: licenseTerms,
            licensingConfig,
            maxLicenseTokens: 100,
          },
          {
            terms: licenseTerms,
            licensingConfig,
          },
        ],
      });
      expect(result.maxLicenseTokensTxHashes).to.be.an("array");
      expect(result.maxLicenseTokensTxHashes?.length).to.be.equal(2);
    });
    it("should return encoded tx data when registerIpAndAttachPilTerms given correct args and encodedTxDataOnly of true", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 5n,
      });

      stub(ipAssetClient.licenseAttachmentWorkflowsClient, "registerIpAndAttachPilTerms").resolves(
        txHash,
      );
      const nftContract = generateRandomAddress();
      const result = await ipAssetClient.registerIpAndAttachPilTerms({
        nftContract,
        tokenId: 3,
        ipMetadata: {
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

      expect(result.encodedTxData!.data).to.be.a("string");
    });

    it("should be called with expected values given PILFlavor.commercialUse", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
      stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 5n,
      });
      const mintAndRegisterIpAndAttachPilTermsStub = stub(
        ipAssetClient.licenseAttachmentWorkflowsClient,
        "registerIpAndAttachPilTerms",
      ).resolves(txHash);
      await ipAssetClient.registerIpAndAttachPilTerms({
        nftContract: mockAddress,
        tokenId: 3,
        licenseTermsData: [
          {
            terms: PILFlavor.commercialUse({
              defaultMintingFee: 100n,
              currency: mockAddress,
              royaltyPolicy: NativeRoyaltyPolicy.LRP,
            }),
          },
        ],
      });
      expect(
        mintAndRegisterIpAndAttachPilTermsStub.args[0][0].licenseTermsData[0].terms,
      ).to.deep.equal({
        commercialAttribution: true,
        commercialRevCeiling: 0n,
        commercialRevShare: 0,
        commercialUse: true,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: zeroAddress,
        currency: mockAddress,
        defaultMintingFee: 100n,
        derivativeRevCeiling: 0n,
        derivativesAllowed: false,
        expiration: 0n,
        derivativesApproval: false,
        derivativesAttribution: false,
        derivativesReciprocal: false,
        royaltyPolicy: royaltyPolicyLrpAddress[aeneid],
        transferable: true,
        uri: "https://github.com/piplabs/pil-document/blob/9a1f803fcf8101a8a78f1dcc929e6014e144ab56/off-chain-terms/CommercialUse.json",
      });
    });
  });

  describe("Test ipAssetClient.mintAndRegisterIpAndMakeDerivative", () => {
    it("should throw not attach error when call mintAndRegisterIpAndMakeDerivative given licenseTermsIds is not attached parentIpIds", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );

      stub(IpAssetRegistryClient.prototype, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);

      stub(LicenseRegistryReadOnlyClient.prototype, "hasIpAttachedLicenseTerms").resolves(false);

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

    it("should return txHash and ipId when call mintAndRegisterIpAndMakeDerivative given correct args ", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );

      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);
      stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });

      stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);

      stub(ipAssetClient.derivativeWorkflowsClient, "mintAndRegisterIpAndMakeDerivative").resolves(
        txHash,
      );
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
        ipMetadata: {
          ipMetadataURI: "https://",
          nftMetadataHash: toHex("nftMetadata", { size: 32 }),
        },
      });

      expect(res.txHash).equal(txHash);
      expect(res.ipId).equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
    });

    it("should return encoded tx data when call mintAndRegisterIpAndMakeDerivative given correct args and encodedTxDataOnly of true", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );

      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);

      stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });

      stub(ipAssetClient.derivativeWorkflowsClient, "mintAndRegisterIpAndMakeDerivative").resolves(
        "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
      );
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
        ipMetadata: {
          ipMetadataURI: "https://",
          nftMetadataHash: toHex("nftMetadata", { size: 32 }),
        },
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(res.encodedTxData!.data).to.be.a("string");
    });

    it("should call with default values when mintAndRegisterIpAndMakeDerivative without providing allowDuplicates, ipMetadata", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );

      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);

      stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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

      const mintAndRegisterIpAndMakeDerivativeStub = stub(
        ipAssetClient.derivativeWorkflowsClient,
        "mintAndRegisterIpAndMakeDerivative",
      ).resolves(txHash);

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
  describe("Test ipAssetClient.mintAndRegisterIp", () => {
    it("should throw spgNftContract error when mintAndRegisterIp given spgNftContract is wrong address", async () => {
      try {
        await ipAssetClient.mintAndRegisterIp({
          spgNftContract: "0x",
          ipMetadata: {
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
          ipMetadata: {
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

    it("should return ipId,txHash when mintAndRegisterIp given correct args ", async () => {
      stub(ipAssetClient.registrationWorkflowsClient, "mintAndRegisterIp").resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
        ipMetadata: {
          ipMetadataURI: "",
          ipMetadataHash: toHex(0, { size: 32 }),
        },
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.ipId).to.equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
    });

    it("should return encoded tx data when mintAndRegisterIp given correct args and encodedTxDataOnly of true", async () => {
      stub(ipAssetClient.registrationWorkflowsClient, "mintAndRegisterIp").resolves(txHash);

      const result = await ipAssetClient.mintAndRegisterIp({
        spgNftContract,
        allowDuplicates: false,
        recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        ipMetadata: {
          ipMetadataURI: "",
        },
        txOptions: {
          encodedTxDataOnly: true,
        },
      });

      expect(result.encodedTxData!.data).to.be.a("string");
    });

    it("should call with default values when mintAndRegisterIp without providing allowDuplicates, ipMetadata, recipient", async () => {
      const mintAndRegisterIpStub = stub(
        ipAssetClient.registrationWorkflowsClient,
        "mintAndRegisterIp",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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

  describe("Test ipAssetClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens", () => {
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
      stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf").resolves(undefined);

      try {
        await ipAssetClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens({
          spgNftContract,
          licenseTokenIds: [1n],
          maxRts: 0,
          allowDuplicates: false,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to mint and register IP and make derivative with license tokens: License token id 1 must be owned by the caller.",
        );
      }
    });
    it("should return txHash when mintAndRegisterIpAndMakeDerivativeWithLicenseTokens given correct args", async () => {
      stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf").resolves(
        "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      );

      stub(
        ipAssetClient.derivativeWorkflowsClient,
        "mintAndRegisterIpAndMakeDerivativeWithLicenseTokens",
      ).resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          chainId: 1513n,
          tokenContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: 1n,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      const result = await ipAssetClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens({
        spgNftContract,
        licenseTokenIds: [1n],
        ipMetadata: {
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

    it("should return txHash and ipId when mintAndRegisterIpAndMakeDerivativeWithLicenseTokens given correct args ", async () => {
      stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf").resolves(
        "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      );

      stub(
        ipAssetClient.derivativeWorkflowsClient,
        "mintAndRegisterIpAndMakeDerivativeWithLicenseTokens",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
        licenseTokenIds: [1n],
        maxRts: 0,
        allowDuplicates: false,
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.ipId).to.equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      expect(result.tokenId).to.equal(1n);
    });

    it("should return encoded tx data when mintAndRegisterIpAndMakeDerivativeWithLicenseTokens given correct args and encodedTxDataOnly of true", async () => {
      stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf").resolves(
        "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      );

      stub(
        ipAssetClient.derivativeWorkflowsClient,
        "mintAndRegisterIpAndMakeDerivativeWithLicenseTokens",
      ).resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      const result = await ipAssetClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens({
        maxRts: 0,
        allowDuplicates: false,
        spgNftContract,
        licenseTokenIds: [1n],
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

      expect(result.encodedTxData!.data).to.be.a("string");
    });

    it("should call with default values when mintAndRegisterIpAndMakeDerivativeWithLicenseTokens without providing allowDuplicates, ipMetadata, royaltyContext, recipient", async () => {
      stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf").resolves(
        "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      );
      const mintAndRegisterIpAndMakeDerivativeWithLicenseTokensStub = stub(
        ipAssetClient.derivativeWorkflowsClient,
        "mintAndRegisterIpAndMakeDerivativeWithLicenseTokens",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
      await ipAssetClient.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens({
        spgNftContract,
        licenseTokenIds: [1n],
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

  describe("Test ipAssetClient.registerIpAndMakeDerivativeWithLicenseTokens", () => {
    beforeEach(() => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
    });
    it("should throw tokenId error when registerIpAndMakeDerivativeWithLicenseTokens given tokenId is registered", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      try {
        await ipAssetClient.registerIpAndMakeDerivativeWithLicenseTokens({
          maxRts: 0,
          nftContract: spgNftContract,
          tokenId: 3,
          licenseTokenIds: [1n],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and make derivative with license tokens: The NFT with id 3 is already registered as IP.",
        );
      }
    });

    it("should throw licenseTokens error when registerIpAndMakeDerivativeWithLicenseTokens given licenseTokens is not owner of caller", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf").resolves(undefined);

      try {
        await ipAssetClient.registerIpAndMakeDerivativeWithLicenseTokens({
          maxRts: 0,
          nftContract: spgNftContract,
          tokenId: 3,
          licenseTokenIds: [1n],
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and make derivative with license tokens: License token id 1 must be owned by the caller.",
        );
      }
    });
    it("should return txHash and ipId when registerIpAndMakeDerivativeWithLicenseTokens given correct args ", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf").resolves(
        "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      );

      stub(
        ipAssetClient.derivativeWorkflowsClient,
        "registerIpAndMakeDerivativeWithLicenseTokens",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
        tokenId: 3,
        licenseTokenIds: [1n],
      });
      expect(result.txHash).to.equal(txHash);
      expect(result.ipId).to.equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
    });

    it("should return encoded tx data when registerIpAndMakeDerivativeWithLicenseTokens given correct args and encodedTxDataOnly of true", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      stub(ipAssetClient.licenseTokenReadOnlyClient, "ownerOf").resolves(
        "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
      );

      stub(
        ipAssetClient.derivativeWorkflowsClient,
        "registerIpAndMakeDerivativeWithLicenseTokens",
      ).resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      const result = await ipAssetClient.registerIpAndMakeDerivativeWithLicenseTokens({
        nftContract: spgNftContract,
        tokenId: 3,
        maxRts: 0,
        licenseTokenIds: [1n],
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
      expect(result.encodedTxData!.data).to.be.a("string");
    });
  });

  describe("Test ipAssetClient.batchMintAndRegisterIpAssetWithPilTerms", () => {
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

    it("should return txHash and ipId when batchMintAndRegisterIpAssetWithPilTerms given correct args ", async () => {
      stub(ipAssetClient.licenseAttachmentWorkflowsClient, "multicall").resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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

      stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 5n,
      });
      const result = await ipAssetClient.batchMintAndRegisterIpAssetWithPilTerms({
        args: [
          {
            spgNftContract,
            ipMetadata: {
              ipMetadataURI: "",
              ipMetadataHash: toHex(0, { size: 32 }),
            },

            licenseTermsData: [
              {
                terms: licenseTerms,
                licensingConfig,
                maxLicenseTokens: 100,
              },
              {
                terms: licenseTerms,
                licensingConfig,
              },
              {
                terms: licenseTerms,
                licensingConfig,
                maxLicenseTokens: 100,
              },
            ],
            allowDuplicates: false,
          },
          {
            spgNftContract,
            ipMetadata: {
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
      expect(result.results).to.deep.equal([
        {
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          licenseTermsIds: [5n, 5n, 5n],
          tokenId: 1n,
          spgNftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          maxLicenseTokensTxHashes: [txHash, txHash],
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

  describe("Test ipAssetClient.batchMintAndRegisterIpAndMakeDerivative", () => {
    it("should throw ipId and licenseTerms error when batchMintAndRegisterIpAndMakeDerivative given ipId and licenseTerms is not match", async () => {
      stub(LicenseRegistryReadOnlyClient.prototype, "hasIpAttachedLicenseTerms").resolves(false);
      stub(IpAssetRegistryClient.prototype, "isRegistered").resolves(true);
      try {
        await ipAssetClient.batchMintAndRegisterIpAndMakeDerivative({
          args: [
            {
              spgNftContract,
              recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
              derivData,
              allowDuplicates: false,
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

    it("should return txHash and ipId when batchMintAndRegisterIpAndMakeDerivative given correct args ", async () => {
      stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      stub(ipAssetClient.derivativeWorkflowsClient, "mintAndRegisterIpAndMakeDerivative").resolves(
        txHash,
      );
      stub(ipAssetClient.derivativeWorkflowsClient, "multicall").resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
      stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      const result = await ipAssetClient.batchMintAndRegisterIpAndMakeDerivative({
        args: [
          {
            spgNftContract,
            recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            derivData,
            allowDuplicates: false,
            ipMetadata: {
              ipMetadataURI: "https://",
              nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            },
          },
          {
            spgNftContract,
            recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
            derivData,
            allowDuplicates: false,
            ipMetadata: {
              ipMetadataURI: "https://",
              nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            },
          },
        ],
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

  describe("Test ipAssetClient.batchRegister", () => {
    it("should throw error when call batchRegister given args have wrong nftContract", async () => {
      try {
        await ipAssetClient.batchRegister({
          args: [
            {
              nftContract: "0x",
              tokenId: 1n,
            },
          ],
        });
      } catch (err) {
        expect((err as Error).message).equal("Failed to batch register IP: Invalid address: 0x.");
      }
    });

    it("should return txhash and ipId when call batchRegister given correct args ", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      stub(ipAssetClient.registrationWorkflowsClient, "registerIpEncode").returns({
        data: "0x",
        to: "0x",
      });
      stub(ipAssetClient.multicall3Client, "aggregate3").resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
      stub(ipAssetClient.registrationWorkflowsClient, "multicall").resolves(txHash);
      const result = await ipAssetClient.batchRegister({
        args: [
          {
            nftContract: spgNftContract,
            tokenId: 1n,
          },
          {
            nftContract: spgNftContract,
            tokenId: 2n,
            ipMetadata: {
              ipMetadataURI: "",
              ipMetadataHash: toHex(0, { size: 32 }),
              nftMetadataHash: toHex("nftMetadata", { size: 32 }),
              nftMetadataURI: "",
            },
          },
        ],
      });

      expect(result.txHash).to.equal(txHash);
      expect(result.spgTxHash).to.equal(txHash);
      expect(result.results?.length).to.equal(4);
    });
  });
  describe("Test ipAssetClient.batchRegisterDerivative", () => {
    it("should throw childIpId error when call batchRegisterDerivative given childIpId is wrong address", async () => {
      try {
        await ipAssetClient.batchRegisterDerivative({
          args: [
            {
              childIpId: "0x",
              parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
              licenseTermsIds: [1n],
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
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      stub(ipAssetClient.licensingModuleClient, "registerDerivativeEncode").returns({
        data: "0x",
        to: "0x",
      });
      stub(ipAssetClient.multicall3Client, "aggregate3").resolves(txHash);
      stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      const result = await ipAssetClient.batchRegisterDerivative({
        args: [
          {
            childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
            maxMintingFee: 0n,
            maxRts: 0,
            maxRevenueShare: 0,
          },
        ],
      });

      expect(result.txHash).to.equal(txHash);
    });

    it("should return results when call batchRegisterDerivative given correct args ", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      stub(ipAssetClient.licensingModuleClient, "registerDerivativeEncode").returns({
        data: "0x",
        to: "0x",
      });
      stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      stub(ipAssetClient.multicall3Client, "aggregate3").resolves(txHash);
      const result = await ipAssetClient.batchRegisterDerivative({
        args: [
          {
            childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
            parentIpIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
            licenseTermsIds: [1n],
            maxMintingFee: 0n,
            maxRts: 0,
            maxRevenueShare: 0,
          },
        ],
      });

      expect(result.txHash).to.equal(txHash);
    });
  });

  describe("Test ipAssetClient.isRegistered", () => {
    beforeEach(() => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
    });
    it("should return true if IP asset is registered", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      const result = await ipAssetClient.isRegistered("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      expect(result).to.equal(true);
    });

    it("should return false if IP asset is not registered", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      const result = await ipAssetClient.isRegistered("0x2BCAE3197Bc469Cb97B917aa460a12dD95c6538D");
      expect(result).to.equal(false);
    });
  });

  describe("Test ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens", () => {
    it("should throw ipId registered error when registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens given ipId is registered", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      try {
        await ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: 1n,
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
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      try {
        await ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: 1n,
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
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      try {
        await ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: 1n,
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
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      try {
        await ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: 1n,
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
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      try {
        await ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: 1n,
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
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );

      stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "registerIpAndAttachPilTermsAndDeployRoyaltyVault",
      ).resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 8n,
      });

      stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent").returns([
        {
          ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      ]);

      stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "distributeRoyaltyTokens",
      ).resolves(txHash);

      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
        tokenId: 1n,
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
    it("should return txHash when registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens given correct args with license terms max limit", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );

      stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "registerIpAndAttachPilTermsAndDeployRoyaltyVault",
      ).resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 8n,
      });

      stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent").returns([
        {
          ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      ]);

      stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "distributeRoyaltyTokens",
      ).resolves(txHash);

      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
        tokenId: 1n,
        licenseTermsData: [
          {
            terms: licenseTerms,
            licensingConfig,
          },
          {
            terms: licenseTerms,
            licensingConfig,
            maxLicenseTokens: 100,
          },
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
        licenseTermsIds: [8n, 8n, 8n],
        ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        maxLicenseTokensTxHashes: [txHash],
      });
    });

    it("should throw error when registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens given IpAccount balance is not enough", async () => {
      IpRoyaltyVaultImplReadOnlyClient.prototype.balanceOf = stub().resolves(100);
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );

      stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "registerIpAndAttachPilTermsAndDeployRoyaltyVault",
      ).resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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

      stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 8n,
      });

      stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent").returns([
        {
          ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      ]);

      stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "distributeRoyaltyTokens",
      ).resolves(txHash);
      try {
        await ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: 1n,
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
    it("should return txHash when registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens given correct args  ", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );

      stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "registerIpAndAttachPilTermsAndDeployRoyaltyVault",
      ).resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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

      stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 8n,
      });

      stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent").returns([
        {
          ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      ]);

      stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "distributeRoyaltyTokens",
      ).resolves(txHash);

      const result = await ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
        nftContract: spgNftContract,
        tokenId: 1n,
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
        ipMetadata: {
          ipMetadataURI: "",
          ipMetadataHash: toHex(0, { size: 32 }),
          nftMetadataHash: toHex("nftMetadata", { size: 32 }),
          nftMetadataURI: "",
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

    it("should be called with expected values given PILFlavor.creativeCommonsAttribution", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );

      const registerIpAndAttachPilTermsAndDeployRoyaltyVaultStub = stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "registerIpAndAttachPilTermsAndDeployRoyaltyVault",
      ).resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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

      stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 8n,
      });

      stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent").returns([
        {
          ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      ]);

      stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "distributeRoyaltyTokens",
      ).resolves(txHash);

      await ipAssetClient.registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens({
        nftContract: spgNftContract,
        tokenId: 1n,
        licenseTermsData: [
          {
            terms: PILFlavor.creativeCommonsAttribution({
              currency: mockAddress,
              royaltyPolicy: mockAddress,
            }),
          },
        ],
        royaltyShares: [
          { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
        ],
        ipMetadata: {
          ipMetadataURI: "",
          ipMetadataHash: toHex(0, { size: 32 }),
          nftMetadataHash: toHex("nftMetadata", { size: 32 }),
          nftMetadataURI: "",
        },
      });
      expect(
        registerIpAndAttachPilTermsAndDeployRoyaltyVaultStub.args[0][0].licenseTermsData[0].terms,
      ).to.deep.equal({
        commercialUse: true,
        commercialAttribution: true,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: zeroAddress,
        commercialRevShare: 0,
        commercialRevCeiling: 0n,
        derivativesAllowed: true,
        derivativesAttribution: true,
        derivativesApproval: false,
        derivativesReciprocal: true,
        derivativeRevCeiling: 0n,
        currency: mockAddress,
        uri: "https://github.com/piplabs/pil-document/blob/998c13e6ee1d04eb817aefd1fe16dfe8be3cd7a2/off-chain-terms/CC-BY.json",
        defaultMintingFee: 0n,
        expiration: 0n,
        royaltyPolicy: mockAddress,
        transferable: true,
      });
    });
  });

  describe("Test ipAssetClient.registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokens", () => {
    it("should throw ipId registered error when registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokens given ipId is registered", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );

      stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
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
          tokenId: 1n,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register derivative IP and attach license terms and distribute royalty tokens: The NFT with id 1 is already registered as IP.",
        );
      }
    });
    it("should throw maxRts error when registerDerivativeAndAttachLicenseTermsAndDistributeRoyaltyTokens given maxRts is less than 0", async () => {
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await ipAssetClient.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: 1n,
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
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await ipAssetClient.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: 1,
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
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await ipAssetClient.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: 1,
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
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );

      stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });
      try {
        await ipAssetClient.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: 1,
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
      stub(IpAssetRegistryClient.prototype, "isRegistered").resolves(false);

      stub(ipAssetClient.ipAssetRegistryClient, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      try {
        await ipAssetClient.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: 1,
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
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      stub(LicenseRegistryReadOnlyClient.prototype, "getRoyaltyPercent").resolves({
        royaltyPercent: 1000000000,
      });

      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);

      stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      try {
        await ipAssetClient.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens({
          nftContract: spgNftContract,
          tokenId: 1,
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
      stub(IpAssetRegistryClient.prototype, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);

      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );

      stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "registerIpAndMakeDerivativeAndDeployRoyaltyVault",
      ).resolves(txHash);

      stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 8n,
      });

      stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent").returns([
        {
          ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      ]);

      stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "distributeRoyaltyTokens",
      ).resolves(txHash);

      stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
      stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
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
          tokenId: 1,
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
      stub(IpAssetRegistryClient.prototype, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);

      stub(IpAssetRegistryClient.prototype, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );

      stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "registerIpAndMakeDerivativeAndDeployRoyaltyVault",
      ).resolves(txHash);

      stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 8n,
      });

      stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent").returns([
        {
          ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      ]);
      stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });

      stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);

      stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "distributeRoyaltyTokens",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            nftMetadataURI: "",
          },
          nftContract: spgNftContract,
          tokenId: 1n,
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

  describe("Test ipAssetClient.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens", () => {
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
      stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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

      stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 5n,
      });

      stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent").returns([
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
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            nftMetadataURI: "",
          },
        });

      expect(result.txHash).to.equal(txHash);
      expect(result.maxLicenseTokensTxHashes).to.be.an("undefined");
    });

    it("should return txHash when mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens given correct args with license terms max limit", async () => {
      stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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

      stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 5n,
      });

      stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent").returns([
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
            {
              terms: licenseTerms,
              licensingConfig,
            },
            {
              terms: licenseTerms,
              licensingConfig,
              maxLicenseTokens: 100,
            },
          ],
          allowDuplicates: true,
          royaltyShares: [
            { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
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
      expect(result.maxLicenseTokensTxHashes).to.be.an("array");
      expect(result.maxLicenseTokensTxHashes?.length).to.be.equal(1);
    });

    it("should return txHash when mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens given correct args ", async () => {
      stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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

      stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent").returns([
        {
          ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      ]);

      stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 5n,
      });
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
      const mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensStub = stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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

      stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent").returns([
        {
          ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      ]);
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
    it("should call with expected license terms with PILFlavor.creativeCommonsAttribution", async () => {
      const mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensStub = stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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

      stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent").returns([
        {
          ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      ]);
      await ipAssetClient.mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens({
        spgNftContract,
        licenseTermsData: [
          {
            terms: PILFlavor.creativeCommonsAttribution({
              currency: mockAddress,
              royaltyPolicy: mockAddress,
            }),
          },
        ],
        royaltyShares: [
          { recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512", percentage: 100 },
        ],
      });

      expect(
        mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensStub.args[0][0]
          .licenseTermsData[0].terms,
      ).to.deep.equal({
        commercialUse: true,
        commercialAttribution: true,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: zeroAddress,
        commercialRevShare: 0,
        commercialRevCeiling: 0n,
        derivativesAllowed: true,
        derivativesAttribution: true,
        derivativesApproval: false,
        derivativesReciprocal: true,
        derivativeRevCeiling: 0n,
        currency: mockAddress,
        uri: "https://github.com/piplabs/pil-document/blob/998c13e6ee1d04eb817aefd1fe16dfe8be3cd7a2/off-chain-terms/CC-BY.json",
        defaultMintingFee: 0n,
        expiration: 0n,
        royaltyPolicy: mockAddress,
        transferable: true,
      });
    });
  });

  describe("Test ipAssetClient.mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens", () => {
    it("should throw parent ip id error when mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens given parent ip id is empty", async () => {
      stub(ipAssetClient.licenseTemplateClient, "getLicenseTerms").resolves({
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
      stub(ipAssetClient.licenseTemplateClient, "getLicenseTerms").resolves({
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
      stub(ipAssetClient.licenseTemplateClient, "getLicenseTerms").resolves({
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
          "Failed to mint and register IP and make derivative and distribute royalty tokens: maxRevenueShare must be between 0 and 100.",
        );
      }
    });
    it("should throw maxRevenueShare error when mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens given maxRevenueShare is less than 0", async () => {
      stub(ipAssetClient.licenseTemplateClient, "getLicenseTerms").resolves({
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
          "Failed to mint and register IP and make derivative and distribute royalty tokens: maxRevenueShare must be between 0 and 100.",
        );
      }
    });

    it("should return txHash when mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens given correct args ", async () => {
      stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });

      stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens",
      ).resolves(txHash);
      stub(ipAssetClient.licenseTemplateClient, "getLicenseTerms").resolves({
        terms: licenseTerms,
      });
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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

      stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent").returns([
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
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            nftMetadataURI: "",
          },
          allowDuplicates: false,
        });
      expect(result).to.deep.equal({
        txHash: txHash,
        receipt: {
          transactionHash: "0x063834efe214f4199b1ad7181ce8c5ced3e15d271c8e866da7c89e86ee629cfb",
        },
        ipId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: 0n,
      });
    });

    it("should call with default values when mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens without providing allowDuplicates, ipMetadata, recipient", async () => {
      stub(ipAssetClient.licenseRegistryReadOnlyClient, "getRoyaltyPercent").resolves({
        royaltyPercent: 100,
      });

      stub(ipAssetClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(ipAssetClient.licenseTemplateClient, "getLicenseTerms").resolves({
        terms: licenseTerms,
      });
      const mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensStub = stub(
        ipAssetClient.royaltyTokenDistributionWorkflowsClient,
        "mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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

  describe("Test ipAssetClient.batchRegisterIpAssetsWithOptimizedWorkflows", () => {
    /**
     * We need to mock the entire module instead of individual methods because
     * the code needs to access the `address` property from workflow clients,
     * which is impossible to mock individually. This approach ensures all
     * required properties and methods are properly mocked for testing.
     */

    // Need to mock the entire module instead of individual methods
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
    const contractModules = require("../../../src/abi/generated");
    let royaltyTokenDistributionWorkflowsMulticallStub: SinonStub;
    let derivativeWorkflowsMulticallStub: SinonStub;
    let licenseAttachmentWorkflowsMulticallStub: SinonStub;
    let mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensStub: SinonStub;
    let mintAndRegisterIpAndMakeDerivativeStub: SinonStub;
    let registerIpAndMakeDerivativeStub: SinonStub;
    let registerIpAndMakeDerivativeAndDeployRoyaltyVaultStub: SinonStub;
    let distributeRoyaltyTokensStub: SinonStub;
    let getLicenseTermsIdStub: SinonStub;

    beforeEach(() => {
      rpcMock.getBalance = stub().resolves(10n);
      // Mock deposit with WIP
      rpcMock.simulateContract = stub().resolves({ request: {} });
      walletMock.writeContract = stub().resolves(txHash);
      stub(IpAssetRegistryClient.prototype, "ipId").resolves(ipId);
      // RoyaltyTokenDistributionWorkflowsClient
      mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensStub = stub(
        RoyaltyTokenDistributionWorkflowsClient.prototype,
        "mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens",
      );
      royaltyTokenDistributionWorkflowsMulticallStub = stub(
        RoyaltyTokenDistributionWorkflowsClient.prototype,
        "multicall",
      );
      registerIpAndMakeDerivativeAndDeployRoyaltyVaultStub = stub(
        RoyaltyTokenDistributionWorkflowsClient.prototype,
        "registerIpAndMakeDerivativeAndDeployRoyaltyVault",
      );
      distributeRoyaltyTokensStub = stub(
        RoyaltyTokenDistributionWorkflowsClient.prototype,
        "distributeRoyaltyTokens",
      );
      stub(contractModules, "RoyaltyTokenDistributionWorkflowsClient").returns({
        multicall: royaltyTokenDistributionWorkflowsMulticallStub.resolves(txHash),
        address: mockAddress + 1,
        mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens:
          mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensStub.resolves(txHash),
        registerIpAndMakeDerivativeAndDeployRoyaltyVault:
          registerIpAndMakeDerivativeAndDeployRoyaltyVaultStub.resolves(txHash),
        distributeRoyaltyTokens: distributeRoyaltyTokensStub.resolves(txHash),
      });
      registerIpAndMakeDerivativeStub = stub(
        DerivativeWorkflowsClient.prototype,
        "registerIpAndMakeDerivative",
      );
      mintAndRegisterIpAndMakeDerivativeStub = stub(
        DerivativeWorkflowsClient.prototype,
        "mintAndRegisterIpAndMakeDerivative",
      );
      derivativeWorkflowsMulticallStub = stub(DerivativeWorkflowsClient.prototype, "multicall");
      stub(contractModules, "DerivativeWorkflowsClient").returns({
        multicall: derivativeWorkflowsMulticallStub.resolves(txHash),
        address: mockAddress + 2,
        mintAndRegisterIpAndMakeDerivative: mintAndRegisterIpAndMakeDerivativeStub.resolves(txHash),
        registerIpAndMakeDerivative: registerIpAndMakeDerivativeStub.resolves(txHash),
      });
      licenseAttachmentWorkflowsMulticallStub = stub(
        LicenseAttachmentWorkflowsClient.prototype,
        "multicall",
      );
      stub(contractModules, "LicenseAttachmentWorkflowsClient").returns({
        multicall: licenseAttachmentWorkflowsMulticallStub.resolves(txHash),
        address: mockAddress + 3,
      });
      stub(RoyaltyModuleEventClient.prototype, "parseTxIpRoyaltyVaultDeployedEvent").returns([
        {
          ipRoyaltyVault: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          ipId: ipId,
        },
      ]);
      getLicenseTermsIdStub = stub(PiLicenseTemplateClient.prototype, "getLicenseTermsId").resolves(
        {
          selectedLicenseTermsId: 1n,
        },
      );
    });

    it("should empty  given requests is empty", async () => {
      const result = await ipAssetClient.batchRegisterIpAssetsWithOptimizedWorkflows({
        requests: [],
      });
      expect(result.distributeRoyaltyTokensTxHashes).to.equal(undefined);
      expect(result.registrationResults).to.deep.equal([]);
    });

    it("should throw error given parentIpIds is empty", async () => {
      const result = ipAssetClient.batchRegisterIpAssetsWithOptimizedWorkflows({
        requests: [
          {
            nftContract: mockERC721,
            tokenId: 5,
            derivData: {
              parentIpIds: [],
              licenseTermsIds: [1],
              maxMintingFee: 0,
              maxRts: MAX_ROYALTY_TOKEN,
              maxRevenueShare: 100,
            },
          },
        ],
      });

      await expect(result).to.be.rejectedWith(
        "Failed to batch register IP assets with optimized workflows: The parent IP IDs must be provided.",
      );
    });

    it("should success given requests are the nft contracts", async () => {
      stub(IpAssetRegistryClient.prototype, "parseTxIpRegisteredEvent")
        .onFirstCall()
        .returns([
          {
            ipId: ipId,
            chainId: 0n,
            tokenContract: mockERC721,
            tokenId: 1n,
            name: "",
            uri: "",
            registrationDate: 0n,
          },
          {
            ipId: ipId,
            chainId: 0n,
            tokenContract: mockERC721,
            tokenId: 2n,
            name: "",
            uri: "",
            registrationDate: 0n,
          },
          {
            ipId: ipId,
            chainId: 0n,
            tokenContract: mockERC721,
            tokenId: 3n,
            name: "",
            uri: "",
            registrationDate: 0n,
          },
          {
            ipId: ipId,
            chainId: 0n,
            tokenContract: mockERC721,
            tokenId: 4n,
            name: "",
            uri: "",
            registrationDate: 0n,
          },
        ])
        .onSecondCall()
        .returns([
          {
            ipId: ipId,
            chainId: 0n,
            tokenContract: mockERC721,
            tokenId: 5n,
            name: "",
            uri: "",
            registrationDate: 0n,
          },
        ])
        .onThirdCall()
        .returns([
          {
            ipId: ipId,
            chainId: 0n,
            tokenContract: mockERC721,
            tokenId: 6n,
            name: "",
            uri: "",
            registrationDate: 0n,
          },
          {
            ipId: ipId,
            chainId: 0n,
            tokenContract: mockERC721,
            tokenId: 7n,
            name: "",
            uri: "",
            registrationDate: 0n,
          },
        ]);

      const requests: IpRegistrationWorkflowRequest[] = [
        // royaltyTokenDistributionWorkflowsClient workflow + royaltyTokenDistributionWorkflowsClient(distributeRoyaltyTokens)
        {
          nftContract: mockERC721,
          tokenId: 1,
          derivData: {
            parentIpIds: [ipId],
            licenseTermsIds: [1],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: walletAddress,
              percentage: 100,
            },
          ],
        },
        // royaltyTokenDistributionWorkflowsClient workflow + royaltyTokenDistributionWorkflowsClient(distributeRoyaltyTokens)
        {
          nftContract: mockERC721,
          tokenId: 2,
          derivData: {
            parentIpIds: [ipId],
            licenseTermsIds: [1],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: walletAddress,
              percentage: 100,
            },
          ],
        },
        // licenseAttachmentWorkflowsClient  workflow + 1 license terms + maxLicenseTokensTxHashes
        {
          nftContract: mockERC721,
          tokenId: 3,
          deadline: 1000n,
          licenseTermsData: [
            {
              terms: {
                transferable: true,
                royaltyPolicy: zeroAddress,
                defaultMintingFee: 0n,
                expiration: 0n,
                commercialUse: false,
                commercialAttribution: false,
                commercializerChecker: zeroAddress,
                commercializerCheckerData: zeroAddress,
                commercialRevShare: 0,
                commercialRevCeiling: 0n,
                derivativesAllowed: true,
                derivativesAttribution: true,
                derivativesApproval: false,
                derivativesReciprocal: true,
                derivativeRevCeiling: 0n,
                currency: WIP_TOKEN_ADDRESS,
                uri: "",
              },
              licensingConfig: {
                isSet: true,
                mintingFee: 0n,
                licensingHook: zeroAddress,
                hookData: zeroAddress,
                commercialRevShare: 0,
                disabled: false,
                expectMinimumGroupRewardShare: 0,
                expectGroupRewardPool: zeroAddress,
              },
              maxLicenseTokens: 100,
            },
          ],
        },
        // royaltyTokenDistributionWorkflowsClient workflow + royaltyTokenDistributionWorkflowsClient(distributeRoyaltyTokens)+ 2 license terms + 1 maxLicenseTokensTxHashes
        {
          nftContract: mockERC721,
          tokenId: 4,
          licenseTermsData: [
            {
              terms: {
                transferable: true,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
                defaultMintingFee: 0n,
                expiration: 1000n,
                commercialUse: true,
                commercialAttribution: false,
                commercializerChecker: zeroAddress,
                commercializerCheckerData: zeroAddress,
                commercialRevShare: 0,
                commercialRevCeiling: 0n,
                derivativesAllowed: true,
                derivativesAttribution: true,
                derivativesApproval: false,
                derivativesReciprocal: true,
                derivativeRevCeiling: 0n,
                currency: erc20Address[aeneid],
                uri: "test case",
              },
              licensingConfig: {
                isSet: true,
                mintingFee: 1n,
                licensingHook: zeroAddress,
                hookData: zeroAddress,
                commercialRevShare: 0,
                disabled: false,
                expectMinimumGroupRewardShare: 0,
                expectGroupRewardPool: zeroAddress,
              },
            },
            {
              terms: {
                transferable: true,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
                defaultMintingFee: 0n,
                expiration: 1000n,
                commercialUse: true,
                commercialAttribution: false,
                commercializerChecker: zeroAddress,
                commercializerCheckerData: zeroAddress,
                commercialRevShare: 0,
                commercialRevCeiling: 0n,
                derivativesAllowed: true,
                derivativesAttribution: true,
                derivativesApproval: false,
                derivativesReciprocal: true,
                derivativeRevCeiling: 0n,
                currency: erc20Address[aeneid],
                uri: "test case",
              },
              licensingConfig: {
                isSet: true,
                mintingFee: 1n,
                licensingHook: zeroAddress,
                hookData: zeroAddress,
                commercialRevShare: 0,
                disabled: false,
                expectMinimumGroupRewardShare: 0,
                expectGroupRewardPool: zeroAddress,
              },
              maxLicenseTokens: 100,
            },
          ],
          royaltyShares: [
            {
              recipient: walletAddress,
              percentage: 43,
            },
            {
              recipient: walletAddress,
              percentage: 17,
            },
            {
              recipient: walletAddress,
              percentage: 2,
            },
            {
              recipient: walletAddress,
              percentage: 38,
            },
          ],
        },
        // derivativeWorkflowsClient workflow
        {
          nftContract: mockERC721,
          tokenId: 5,
          derivData: {
            parentIpIds: [ipId],
            licenseTermsIds: [1],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
        },
        // derivativeWorkflowsClient workflow
        {
          nftContract: mockERC721,
          tokenId: 6,
          derivData: {
            parentIpIds: [ipId],
            licenseTermsIds: [1],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
        },
        // royaltyTokenDistributionWorkflowsClient workflow + royaltyTokenDistributionWorkflowsClient(distributeRoyaltyTokens)
        {
          nftContract: mockERC721,
          tokenId: 7,
          derivData: {
            parentIpIds: [ipId],
            licenseTermsIds: [1],
            maxMintingFee: 0,
            maxRts: MAX_ROYALTY_TOKEN,
            maxRevenueShare: 100,
          },
          royaltyShares: [
            {
              recipient: walletAddress,
              percentage: 10,
            },
          ],
        },
      ];

      const result = await ipAssetClient.batchRegisterIpAssetsWithOptimizedWorkflows({
        requests,
      });
      expect(royaltyTokenDistributionWorkflowsMulticallStub.callCount).to.equal(2); // nft contracts + distribute royalty tokens
      expect(
        (royaltyTokenDistributionWorkflowsMulticallStub.args[0][0] as { data: [] }).data.length,
      ).to.equal(4);
      expect(
        (royaltyTokenDistributionWorkflowsMulticallStub.secondCall.args[0] as { data: [] }).data
          .length,
      ).to.equal(4); // distribute royalty tokens
      expect(derivativeWorkflowsMulticallStub.callCount).to.equal(1);
      expect((derivativeWorkflowsMulticallStub.args[0][0] as { data: [] }).data.length).to.equal(2);
      expect(licenseAttachmentWorkflowsMulticallStub.callCount).to.equal(1);
      expect(
        (licenseAttachmentWorkflowsMulticallStub.args[0][0] as { data: [] }).data.length,
      ).to.equal(1);
      expect(getLicenseTermsIdStub.callCount).to.equal(3);
      expect(result.distributeRoyaltyTokensTxHashes).to.deep.equal([txHash]);
      expect(result.registrationResults).to.deep.equal([
        {
          ipAssetsWithLicenseTerms: [
            {
              ipId: ipId,
              tokenId: 1n,
            },
            {
              ipId: ipId,
              tokenId: 2n,
            },
            {
              ipId: ipId,
              tokenId: 3n,
              licenseTermsIds: [1n, 1n],
              maxLicenseTokensTxHashes: [txHash],
            },
            {
              ipId: ipId,
              tokenId: 4n,
            },
          ],
          receipt: {
            transactionHash: txHash,
          },
          txHash: txHash,
        },
        {
          ipAssetsWithLicenseTerms: [
            {
              ipId: ipId,
              tokenId: 5n,
              licenseTermsIds: [1n],
              maxLicenseTokensTxHashes: [txHash],
            },
          ],
          receipt: {
            transactionHash: txHash,
          },
          txHash: txHash,
        },
        {
          ipAssetsWithLicenseTerms: [
            {
              ipId: ipId,
              tokenId: 6n,
            },
            {
              ipId: ipId,
              tokenId: 7n,
            },
          ],
          receipt: {
            transactionHash: txHash,
          },
          txHash: txHash,
        },
      ]);
    });

    it("should return success given request are the spg contracts", async () => {
      stub(SpgnftImplReadOnlyClient.prototype, "publicMinting")
        .onFirstCall()
        .resolves(false)
        .onSecondCall()
        .resolves(false)
        .resolves(true);

      stub(IpAssetRegistryClient.prototype, "parseTxIpRegisteredEvent")
        .onFirstCall()
        .returns([
          {
            ipId: ipId,
            chainId: 0n,
            tokenContract: mockERC721,
            tokenId: 1n,
            name: "",
            uri: "",
            registrationDate: 0n,
          },
        ])
        .onSecondCall()
        .returns([
          {
            ipId: ipId,
            chainId: 0n,
            tokenContract: mockERC721,
            tokenId: 2n,
            name: "",
            uri: "",
            registrationDate: 0n,
          },
        ])
        .onThirdCall()
        .returns([
          {
            ipId: ipId,
            chainId: 0n,
            tokenContract: mockERC721,
            tokenId: 3n,
            name: "",
            uri: "",
            registrationDate: 0n,
          },
          {
            ipId: ipId,
            chainId: 0n,
            tokenContract: mockERC721,
            tokenId: 4n,
            name: "",
            uri: "",
            registrationDate: 0n,
          },
        ])
        .returns([
          {
            ipId: ipId,
            chainId: 0n,
            tokenContract: mockERC721,
            tokenId: 5n,
            name: "",
            uri: "",
            registrationDate: 0n,
          },
        ]);
      const result = await ipAssetClient.batchRegisterIpAssetsWithOptimizedWorkflows({
        requests: [
          /**
           * mintAndRegisterIpAndMakeDerivative workflow
           * - Total fees: 0 WIP tokens
           * - Uses `derivativeWorkflowsClient` multicall due to the private minting
           */
          {
            spgNftContract: mockERC721,
            derivData: {
              parentIpIds: [ipId],
              licenseTermsIds: [1],
              maxMintingFee: 0,
              maxRts: MAX_ROYALTY_TOKEN,
              maxRevenueShare: 100,
            },
          },
          /**
           * mintAndRegisterIpAssetWithPilTerms workflow
           * - Total fees: 0 WIP tokens
           * - Uses `licenseAttachmentWorkflowsClient` multicall due to the private minting
           * - 1 license terms + 1 maxLicenseTokensTxHashes
           */
          {
            spgNftContract: mockERC721,
            allowDuplicates: true,
            licenseTermsData: [
              {
                terms: {
                  transferable: true,
                  royaltyPolicy: royaltyPolicyLapAddress[aeneid],
                  defaultMintingFee: 0n,
                  expiration: 0n,
                  commercialUse: true,
                  commercialAttribution: false,
                  commercializerChecker: zeroAddress,
                  commercializerCheckerData: zeroAddress,
                  commercialRevShare: 90,
                  commercialRevCeiling: 0n,
                  derivativesAllowed: true,
                  derivativesAttribution: true,
                  derivativesApproval: false,
                  derivativesReciprocal: true,
                  derivativeRevCeiling: 0n,
                  currency: WIP_TOKEN_ADDRESS,
                  uri: "",
                },
                licensingConfig: {
                  isSet: true,
                  mintingFee: 0n,
                  licensingHook: zeroAddress,
                  hookData: zeroAddress,
                  commercialRevShare: 0,
                  disabled: false,
                  expectMinimumGroupRewardShare: 0,
                  expectGroupRewardPool: mockAddress,
                },
              },
            ],
          },
          /**
           * royaltyTokenDistributionWorkflowsClient workflow
           * - Total fees: 0 WIP tokens
           * - Uses `mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens`to call due to 0 fee
           */
          {
            spgNftContract: mockERC721,
            derivData: {
              parentIpIds: [ipId],
              licenseTermsIds: [1],
              maxMintingFee: 0,
              maxRts: MAX_ROYALTY_TOKEN,
              maxRevenueShare: 100,
            },
            royaltyShares: [
              {
                recipient: walletAddress,
                percentage: 100,
              },
            ],
          },
          /**
           * royaltyTokenDistributionWorkflowsClient workflow
           * - Total fees: 0 WIP tokens
           * - Uses `mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens`to call due to 0 fee
           */
          {
            spgNftContract: mockERC721,
            derivData: {
              parentIpIds: [ipId],
              licenseTermsIds: [1],
              maxMintingFee: 0,
              maxRts: MAX_ROYALTY_TOKEN,
              maxRevenueShare: 100,
            },
            royaltyShares: [
              {
                recipient: walletAddress,
                percentage: 100,
              },
            ],
          },
          /**
           * royaltyTokenDistributionWorkflowsClient workflow
           * - Total fees: 0 WIP tokens
           * - Uses `royaltyTokenDistributionWorkflowsClient` multicall due to the mint tokens is given `msg.sender` as the recipient
           * - 2 license terms + 1 maxLicenseTokensTxHashes
           */
          {
            spgNftContract: mockERC721,
            licenseTermsData: [
              {
                terms: {
                  transferable: true,
                  royaltyPolicy: royaltyPolicyLapAddress[aeneid],
                  defaultMintingFee: 10000n,
                  expiration: 1000n,
                  commercialUse: true,
                  commercialAttribution: false,
                  commercializerChecker: zeroAddress,
                  commercializerCheckerData: zeroAddress,
                  commercialRevShare: 0,
                  commercialRevCeiling: 0n,
                  derivativesAllowed: true,
                  derivativesAttribution: true,
                  derivativesApproval: false,
                  derivativesReciprocal: true,
                  derivativeRevCeiling: 0n,
                  currency: WIP_TOKEN_ADDRESS,
                  uri: "test case",
                },
                maxLicenseTokens: 100,
              },
              {
                terms: {
                  transferable: true,
                  royaltyPolicy: royaltyPolicyLapAddress[aeneid],
                  defaultMintingFee: 10000n,
                  expiration: 1000n,
                  commercialUse: true,
                  commercialAttribution: false,
                  commercializerChecker: zeroAddress,
                  commercializerCheckerData: zeroAddress,
                  commercialRevShare: 0,
                  commercialRevCeiling: 0n,
                  derivativesAllowed: true,
                  derivativesAttribution: true,
                  derivativesApproval: false,
                  derivativesReciprocal: true,
                  derivativeRevCeiling: 0n,
                  currency: WIP_TOKEN_ADDRESS,
                  uri: "test case",
                },
              },
            ],
            royaltyShares: [
              {
                recipient: walletAddress,
                percentage: 10,
              },
            ],
          },
        ],
      });
      expect(mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensStub.callCount).to.equal(
        2,
      );
      expect(mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensStub.args.length).to.equal(
        2,
      );
      expect(derivativeWorkflowsMulticallStub.callCount).to.equal(1);
      expect(derivativeWorkflowsMulticallStub.args.length).to.equal(1);
      expect(licenseAttachmentWorkflowsMulticallStub.callCount).to.equal(1);
      expect(licenseAttachmentWorkflowsMulticallStub.args.length).to.equal(1);
      expect(royaltyTokenDistributionWorkflowsMulticallStub.callCount).to.equal(1);
      expect(royaltyTokenDistributionWorkflowsMulticallStub.args.length).to.equal(1);
      expect(result.distributeRoyaltyTokensTxHashes).to.equal(undefined);
      expect(getLicenseTermsIdStub.callCount).to.equal(3);
      expect(result.registrationResults).to.deep.equal([
        {
          ipAssetsWithLicenseTerms: [
            {
              ipId: ipId,
              tokenId: 1n,
            },
          ],
          receipt: {
            transactionHash: txHash,
          },
          txHash: txHash,
        },
        {
          ipAssetsWithLicenseTerms: [
            {
              ipId: ipId,
              tokenId: 2n,
              licenseTermsIds: [1n],
            },
          ],
          receipt: {
            transactionHash: txHash,
          },
          txHash: txHash,
        },
        {
          ipAssetsWithLicenseTerms: [
            {
              ipId: ipId,
              tokenId: 3n,
            },
            {
              ipId: ipId,
              tokenId: 4n,
            },
          ],
          receipt: {
            transactionHash: txHash,
          },
          txHash: txHash,
        },
        {
          ipAssetsWithLicenseTerms: [
            {
              ipId: ipId,
              tokenId: 5n,
              licenseTermsIds: [1n, 1n],
              maxLicenseTokensTxHashes: [txHash],
            },
          ],
          receipt: {
            transactionHash: txHash,
          },
          txHash: txHash,
        },
        {
          ipAssetsWithLicenseTerms: [
            {
              ipId: ipId,
              tokenId: 5n,
            },
          ],
          receipt: {
            transactionHash: txHash,
          },
          txHash: txHash,
        },
      ]);
    });

    it("should return success given request are mixed of spg and non-spg contracts and disableMulticallWhenPossible is true", async () => {
      stub(SpgnftImplReadOnlyClient.prototype, "publicMinting").resolves(true);
      stub(SpgnftImplReadOnlyClient.prototype, "mintFee").resolves(10n);

      stub(IpAssetRegistryClient.prototype, "parseTxIpRegisteredEvent")
        .onFirstCall()
        .returns([
          {
            ipId: ipId,
            chainId: 0n,
            tokenContract: mockERC721,
            tokenId: 1n,
            name: "",
            uri: "",
            registrationDate: 0n,
          },
        ])
        .onSecondCall()
        .returns([
          {
            ipId: ipId,
            chainId: 0n,
            tokenContract: mockERC721,
            tokenId: 2n,
            name: "",
            uri: "",
            registrationDate: 0n,
          },
        ])
        .onThirdCall()
        .returns([
          {
            ipId: ipId,
            chainId: 0n,
            tokenContract: mockERC721,
            tokenId: 3n,
            name: "",
            uri: "",
            registrationDate: 0n,
          },
        ])
        .returns([
          {
            ipId: ipId,
            chainId: 0n,
            tokenContract: mockERC721,
            tokenId: 4n,
            name: "",
            uri: "",
            registrationDate: 0n,
          },
        ]);
      const result = await ipAssetClient.batchRegisterIpAssetsWithOptimizedWorkflows({
        requests: [
          // royaltyTokenDistributionWorkflowsClient workflow + royaltyTokenDistributionWorkflowsClient(distributeRoyaltyTokens)
          {
            nftContract: mockERC721,
            tokenId: 2,
            derivData: {
              parentIpIds: [ipId],
              licenseTermsIds: [1],
              maxMintingFee: 0,
              maxRts: MAX_ROYALTY_TOKEN,
              maxRevenueShare: 100,
            },
            royaltyShares: [
              {
                recipient: walletAddress,
                percentage: 100,
              },
            ],
          },
          // derivativeWorkflowsClient workflow
          {
            nftContract: mockERC721,
            tokenId: 5,
            derivData: {
              parentIpIds: [ipId],
              licenseTermsIds: [1],
              maxMintingFee: 0,
              maxRts: MAX_ROYALTY_TOKEN,
              maxRevenueShare: 100,
            },
          },
          // derivativeWorkflowsClient workflow
          {
            nftContract: mockERC721,
            tokenId: 5,
            derivData: {
              parentIpIds: [ipId],
              licenseTermsIds: [1],
              maxMintingFee: 0,
              maxRts: MAX_ROYALTY_TOKEN,
              maxRevenueShare: 100,
            },
          },
          /**
           * mintAndRegisterIpAndMakeDerivative workflow
           * - Total fees: 0 WIP tokens
           * - Uses `multicall3Address` multicall due to the public minting
           */
          {
            spgNftContract: mockERC721,
            derivData: {
              parentIpIds: [ipId],
              licenseTermsIds: [1],
              maxMintingFee: 0,
              maxRts: MAX_ROYALTY_TOKEN,
              maxRevenueShare: 100,
            },
          },
        ],
        options: {
          wipOptions: {
            useMulticallWhenPossible: false,
          },
        },
      });
      expect(mintAndRegisterIpAndMakeDerivativeStub.callCount).to.equal(1);
      expect(mintAndRegisterIpAndMakeDerivativeStub.args.length).to.equal(1);
      expect(registerIpAndMakeDerivativeStub.callCount).to.equal(2);
      expect(registerIpAndMakeDerivativeStub.args.length).to.equal(2);
      expect(registerIpAndMakeDerivativeAndDeployRoyaltyVaultStub.callCount).to.equal(1);
      expect(registerIpAndMakeDerivativeAndDeployRoyaltyVaultStub.args.length).to.equal(1);
      expect(distributeRoyaltyTokensStub.callCount).to.equal(1);
      expect(distributeRoyaltyTokensStub.args.length).to.equal(1);
      expect(result.distributeRoyaltyTokensTxHashes).to.deep.equal([txHash]);
      expect(result.registrationResults).to.deep.equal([
        {
          ipAssetsWithLicenseTerms: [
            {
              ipId: ipId,
              tokenId: 1n,
            },
          ],
          receipt: {
            transactionHash: txHash,
          },
          txHash: txHash,
        },
        {
          ipAssetsWithLicenseTerms: [
            {
              ipId: ipId,
              tokenId: 2n,
            },
          ],
          receipt: {
            transactionHash: txHash,
          },
          txHash: txHash,
        },
        {
          ipAssetsWithLicenseTerms: [
            {
              ipId: ipId,
              tokenId: 3n,
            },
          ],
          receipt: {
            transactionHash: txHash,
          },
          txHash: txHash,
        },
        {
          ipAssetsWithLicenseTerms: [
            {
              ipId: ipId,
              tokenId: 4n,
            },
          ],
          receipt: {
            transactionHash: txHash,
          },
          txHash: txHash,
        },
      ]);
    });
  });

  describe("Batch Mint and Register IP Asset with License Terms", () => {
    it("should throw caller error when spgNftContract has public minting disabled", async () => {
      stub(SpgnftImplReadOnlyClient.prototype, "publicMinting").resolves(false);
      stub(SpgnftImplReadOnlyClient.prototype, "mintFee").resolves(1n);
      stub(SpgnftImplReadOnlyClient.prototype, "hasRole").resolves(false);
      const publicMintingSpgContract = mockAddress;
      await expect(
        ipAssetClient.batchMintAndRegisterIp({
          requests: [{ spgNftContract: publicMintingSpgContract }],
        }),
      ).to.be.rejectedWith("does not have the minter role");
    });

    it("should should not use spg multicall3 when spgNftContract has public minting enabled", async () => {
      stub(SpgnftImplReadOnlyClient.prototype, "publicMinting").resolves(true);
      stub(SpgnftImplReadOnlyClient.prototype, "mintFee").resolves(1n);
      stub(SpgnftImplReadOnlyClient.prototype, "hasRole").resolves(true);
      const spgMulticallStub = stub(
        ipAssetClient.registrationWorkflowsClient,
        "multicall",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: ipId,
          tokenId: 1n,
          chainId: 0n,
          tokenContract: mockAddress,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      const publicMintingSpgContract = mockAddress;
      const result = await ipAssetClient.batchMintAndRegisterIp({
        requests: [
          { spgNftContract: publicMintingSpgContract },
          { spgNftContract: publicMintingSpgContract, recipient: mockAddress },
          {
            spgNftContract: publicMintingSpgContract,
            recipient: mockAddress,
            allowDuplicates: false,
          },
        ],
      });
      expect(spgMulticallStub.callCount).to.equal(0);
      expect(result.registrationResults.length).to.equal(1);
      expect(result.registrationResults[0].txHash).to.equal(txHash);
      expect(result.registrationResults[0].ipIdsAndTokenIds).to.deep.equal([
        {
          ipId: ipId,
          tokenId: 1n,
          spgNftContract: mockAddress,
        },
      ]);
    });
    it("should should use spg multicall3 when spgNftContract has public minting enabled and mint fee is 0", async () => {
      stub(SpgnftImplReadOnlyClient.prototype, "publicMinting").resolves(true);
      stub(SpgnftImplReadOnlyClient.prototype, "mintFee").resolves(0n);
      stub(SpgnftImplReadOnlyClient.prototype, "hasRole").resolves(true);
      const spgMulticallStub = stub(
        ipAssetClient.registrationWorkflowsClient,
        "multicall",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: ipId,
          tokenId: 1n,
          chainId: 0n,
          tokenContract: mockAddress,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      const publicMintingSpgContract = mockAddress;
      const result = await ipAssetClient.batchMintAndRegisterIp({
        requests: [
          { spgNftContract: publicMintingSpgContract },
          { spgNftContract: publicMintingSpgContract, recipient: mockAddress },
          {
            spgNftContract: publicMintingSpgContract,
            recipient: mockAddress,
            allowDuplicates: false,
          },
        ],
      });
      expect(spgMulticallStub.callCount).to.equal(1);
      expect(result.registrationResults.length).to.equal(1);
      expect(result.registrationResults[0].txHash).to.equal(txHash);
      expect(result.registrationResults[0].ipIdsAndTokenIds).to.deep.equal([
        {
          ipId: ipId,
          tokenId: 1n,
          spgNftContract: mockAddress,
        },
      ]);
    });
    it("should be called with spg multicall when spgNftContract has private minting enabled", async () => {
      stub(SpgnftImplReadOnlyClient.prototype, "publicMinting").resolves(false);
      stub(SpgnftImplReadOnlyClient.prototype, "mintFee").resolves(1n);
      stub(SpgnftImplReadOnlyClient.prototype, "hasRole").resolves(true);
      const spgMulticallStub = stub(
        ipAssetClient.registrationWorkflowsClient,
        "multicall",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: ipId,
          tokenId: 1n,
          chainId: 0n,
          tokenContract: mockAddress,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      const privateMintingSpgContract = mockAddress;
      const result = await ipAssetClient.batchMintAndRegisterIp({
        requests: [
          { spgNftContract: privateMintingSpgContract },
          { spgNftContract: privateMintingSpgContract, recipient: mockAddress },
          {
            spgNftContract: privateMintingSpgContract,
            recipient: mockAddress,
            allowDuplicates: false,
          },
        ],
      });
      expect(spgMulticallStub.callCount).to.equal(1);
      expect(result.registrationResults.length).to.equal(1);
      expect(result.registrationResults[0].txHash).to.equal(txHash);
      expect(result.registrationResults[0].ipIdsAndTokenIds).to.deep.equal([
        {
          ipId: ipId,
          tokenId: 1n,
          spgNftContract: mockAddress,
        },
      ]);
    });
    it("should both called with spg multicall when spgNftContract has private and public minting enabled", async () => {
      stub(SpgnftImplReadOnlyClient.prototype, "publicMinting")
        .onFirstCall()
        .resolves(false)
        .onSecondCall()
        .resolves(true)
        .onThirdCall()
        .resolves(false);
      stub(SpgnftImplReadOnlyClient.prototype, "mintFee").resolves(1n);
      stub(SpgnftImplReadOnlyClient.prototype, "hasRole").resolves(true);
      const spgMulticallStub = stub(
        ipAssetClient.registrationWorkflowsClient,
        "multicall",
      ).resolves(txHash);
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: ipId,
          tokenId: 1n,
          chainId: 0n,
          tokenContract: mockAddress,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      const privateMintingSpgContract = mockAddress;
      const publicMintingSpgContract = mockAddress;
      const result = await ipAssetClient.batchMintAndRegisterIp({
        requests: [
          { spgNftContract: privateMintingSpgContract },
          { spgNftContract: publicMintingSpgContract, recipient: mockAddress },
          {
            spgNftContract: privateMintingSpgContract,
            recipient: mockAddress,
            allowDuplicates: false,
          },
        ],
      });
      expect(spgMulticallStub.callCount).to.equal(1);
      expect(result.registrationResults.length).to.equal(2);
      expect(result.registrationResults[0].txHash).to.equal(txHash);
      expect(result.registrationResults[0].ipIdsAndTokenIds).to.deep.equal([
        {
          ipId: ipId,
          tokenId: 1n,
          spgNftContract: mockAddress,
        },
      ]);
      expect(result.registrationResults[0].ipIdsAndTokenIds).to.deep.equal([
        {
          ipId: ipId,
          tokenId: 1n,
          spgNftContract: mockAddress,
        },
      ]);
    });
  });

  describe("Register IP Asset", () => {
    beforeEach(() => {
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: ipId,
          tokenId: 1n,
          chainId: 0n,
          tokenContract: mockAddress,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 1n,
      });
    });

    it("should throw error when invalid NFT type", async () => {
      await expect(
        ipAssetClient.registerIpAsset({
          nft: { type: "invalid" as "mint", spgNftContract: mockERC721, tokenId: 1n },
        }),
      ).to.be.rejectedWith("Failed to register IP Asset: Invalid NFT type");
    });
    describe("Register IP Asset with Minted NFT", () => {
      beforeEach(() => {
        stub(IpAssetRegistryClient.prototype, "ipId").resolves(ipId);
        stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      });
      it("should throw error when royalty shares are required when registering IP with license terms data", async () => {
        await expect(
          ipAssetClient.registerIpAsset({
            nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
            royaltyShares: [
              {
                recipient: mockAddress,
                percentage: 100,
              },
            ],
          }),
        ).to.be.rejectedWith(
          "Failed to register IP Asset: License terms data must be provided when royalty shares are specified.",
        );
      });

      it("should call registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens when royalty shares and license terms data are provided", async () => {
        const registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash = "0x1";
        const distributeRoyaltyTokensTxHash = "0x2";
        const registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokensStub = stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "registerIpAndAttachPilTermsAndDeployRoyaltyVault",
        ).resolves(registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash);
        stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent").returns([
          {
            ipId: ipId,
            ipRoyaltyVault: mockAddress,
          },
        ]);
        const distributeRoyaltyTokensStub = stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "distributeRoyaltyTokens",
        ).resolves(distributeRoyaltyTokensTxHash);

        const result = await ipAssetClient.registerIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
          royaltyShares: [
            {
              recipient: mockAddress,
              percentage: 100,
            },
          ],
          licenseTermsData: [
            {
              terms: PILFlavor.creativeCommonsAttribution({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              }),
              maxLicenseTokens: 100,
            },
          ],
        });

        expect(registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokensStub.callCount).to.equal(1);
        expect(distributeRoyaltyTokensStub.callCount).to.equal(1);
        expect(result.distributeRoyaltyTokensTxHash).to.equal(distributeRoyaltyTokensTxHash);
        expect(result.ipId).to.equal(ipId);
        expect(result.licenseTermsIds).to.deep.equal([1n]);
        expect(result.ipRoyaltyVault).to.equal(mockAddress);
        expect(result.maxLicenseTokensTxHashes).to.deep.equal([txHash]);
        expect(result.registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash).to.equal(
          registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash,
        );
      });

      it("should call registerIpAndAttachPilTerms when only license terms data is provided", async () => {
        const registerIpAndAttachPilTermsTxHash = "0x1";
        const registerIpAndAttachPilTermsStub = stub(
          ipAssetClient.licenseAttachmentWorkflowsClient,
          "registerIpAndAttachPilTerms",
        ).resolves(registerIpAndAttachPilTermsTxHash);

        const result = await ipAssetClient.registerIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
          licenseTermsData: [
            {
              terms: PILFlavor.creativeCommonsAttribution({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              }),
              maxLicenseTokens: 100,
            },
          ],
        });

        expect(registerIpAndAttachPilTermsStub.callCount).to.equal(1);
        expect(result.ipId).to.equal(ipId);
        expect(result.licenseTermsIds).to.deep.equal([1n]);
        expect(result.maxLicenseTokensTxHashes).to.deep.equal([txHash]);
        expect(result.txHash).to.equal(registerIpAndAttachPilTermsTxHash);
      });

      it("should call register without license terms data, royalty shares and ip metadata", async () => {
        const registerStub = stub(ipAssetClient.ipAssetRegistryClient, "register").resolves(txHash);

        const result = await ipAssetClient.registerIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
        });

        expect(registerStub.callCount).to.equal(1);
        expect(result.ipId).to.equal(ipId);
        expect(result.txHash).to.equal(txHash);
      });

      it("should call register with only ip metadata", async () => {
        const registerStub = stub(ipAssetClient.registrationWorkflowsClient, "registerIp").resolves(
          txHash,
        );

        const result = await ipAssetClient.registerIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
          ipMetadata: {
            ipMetadataURI: "test-uri",
          },
        });

        expect(registerStub.callCount).to.equal(1);
        expect(result.ipId).to.equal(ipId);
        expect(result.txHash).to.equal(txHash);
      });
    });

    describe("Register IP Asset with Mint NFT", () => {
      it("should throw royalty shares are required when registering IP with license terms data", async () => {
        await expect(
          ipAssetClient.registerIpAsset({
            nft: { type: "mint", spgNftContract: mockERC721, tokenId: 1n },
            royaltyShares: [
              {
                recipient: mockAddress,
                percentage: 100,
              },
            ],
          }),
        ).to.be.rejectedWith(
          "Failed to register IP Asset: License terms data must be provided when royalty shares are specified.",
        );
      });
      it("should call mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens when royalty shares and license terms data are provided", async () => {
        const mintAndRegisterIpTxHash = "0x1";
        const mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensStub = stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens",
        ).resolves(mintAndRegisterIpTxHash);
        stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent").returns([
          {
            ipId: ipId,
            ipRoyaltyVault: mockAddress,
          },
        ]);
        const result = await ipAssetClient.registerIpAsset({
          nft: { type: "mint", spgNftContract: mockERC721, tokenId: 1n },
          royaltyShares: [
            {
              recipient: mockAddress,
              percentage: 100,
            },
          ],
          licenseTermsData: [
            {
              terms: PILFlavor.creativeCommonsAttribution({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              }),
              maxLicenseTokens: 100,
            },
          ],
        });

        expect(mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensStub.callCount).to.equal(
          1,
        );
        expect(result.ipId).to.equal(ipId);
        expect(result.txHash).to.equal(mintAndRegisterIpTxHash);
        expect(result.licenseTermsIds).to.deep.equal([1n]);
        expect(result.ipRoyaltyVault).to.equal(mockAddress);
        expect(result.maxLicenseTokensTxHashes).to.deep.equal([txHash]);
      });

      it("should call mintAndRegisterIpAndAttachPilTerms when only license terms data is provided", async () => {
        const mintAndRegisterIpAndAttachPilTermsTxHash = "0x1";
        const mintAndRegisterIpAndAttachPilTermsStub = stub(
          ipAssetClient.licenseAttachmentWorkflowsClient,
          "mintAndRegisterIpAndAttachPilTerms",
        ).resolves(mintAndRegisterIpAndAttachPilTermsTxHash);
        const result = await ipAssetClient.registerIpAsset({
          nft: { type: "mint", spgNftContract: mockERC721, tokenId: 1n },
          licenseTermsData: [
            {
              terms: PILFlavor.creativeCommonsAttribution({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              }),
            },
          ],
        });

        expect(mintAndRegisterIpAndAttachPilTermsStub.callCount).to.equal(1);
        expect(result.ipId).to.equal(ipId);
        expect(result.txHash).to.equal(mintAndRegisterIpAndAttachPilTermsTxHash);
        expect(result.tokenId).to.equal(1n);
        expect(result.licenseTermsIds).to.deep.equal([1n]);
        expect(result.maxLicenseTokensTxHashes).to.deep.equal(undefined);
      });

      it("should call mintAndRegisterIp without license terms data and royalty shares", async () => {
        const mintAndRegisterIpTxHash = "0x1";
        const mintAndRegisterIpStub = stub(
          ipAssetClient.registrationWorkflowsClient,
          "mintAndRegisterIp",
        ).resolves(mintAndRegisterIpTxHash);
        const result = await ipAssetClient.registerIpAsset({
          nft: { type: "mint", spgNftContract: mockERC721, tokenId: 1n },
        });

        expect(mintAndRegisterIpStub.callCount).to.equal(1);
        expect(result.ipId).to.equal(ipId);
        expect(result.txHash).to.equal(mintAndRegisterIpTxHash);
        expect(result.tokenId).to.equal(1n);
      });
    });
    describe("Register with optional parameters", () => {
      it("should call registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens with optional parameters", async () => {
        const registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokensStub = stub(
          ipAssetClient,
          "registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokens",
        ).resolves({
          ipId: ipId,
          licenseTermsIds: [1n],
          ipRoyaltyVault: mockAddress,
          maxLicenseTokensTxHashes: [txHash],
          registerIpAndAttachPilTermsAndDeployRoyaltyVaultTxHash: txHash,
          distributeRoyaltyTokensTxHash: txHash,
        });
        await ipAssetClient.registerIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
          licenseTermsData: [
            {
              terms: PILFlavor.creativeCommonsAttribution({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              }),
              maxLicenseTokens: 100,
            },
          ],
          royaltyShares: [{ recipient: mockAddress, percentage: 100 }],
          deadline: 2000,
          txOptions: {
            timeout: 1000,
          },
          ipMetadata: {
            ipMetadataURI: "test-uri",
          },
        });
        expect(registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokensStub.callCount).to.equal(1);
        expect(
          registerIPAndAttachLicenseTermsAndDistributeRoyaltyTokensStub.args[0][0],
        ).to.deep.equal({
          nftContract: mockERC721,
          tokenId: 1n,
          licenseTermsData: [
            {
              terms: PILFlavor.creativeCommonsAttribution({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              }),
              maxLicenseTokens: 100,
            },
          ],
          royaltyShares: [{ recipient: mockAddress, percentage: 100 }],
          deadline: 2000,
          txOptions: {
            timeout: 1000,
          },
          ipMetadata: {
            ipMetadataURI: "test-uri",
          },
        });
      });

      it("should call registerIpAndAttachPilTerms with optional parameters", async () => {
        const registerIpAndAttachPilTermsStub = stub(
          ipAssetClient,
          "registerIpAndAttachPilTerms",
        ).resolves({
          ipId: ipId,
          licenseTermsIds: [1n],
          maxLicenseTokensTxHashes: [txHash],
          txHash: txHash,
        });
        await ipAssetClient.registerIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
          licenseTermsData: [
            {
              maxLicenseTokens: 100,

              terms: PILFlavor.creativeCommonsAttribution({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              }),
            },
          ],
          deadline: 2000,
          txOptions: {
            timeout: 1000,
          },
          ipMetadata: {
            ipMetadataURI: "test-uri",
          },
        });
        expect(registerIpAndAttachPilTermsStub.callCount).to.equal(1);
        expect(registerIpAndAttachPilTermsStub.args[0][0]).to.deep.equal({
          nftContract: mockERC721,
          tokenId: 1n,
          licenseTermsData: [
            {
              terms: PILFlavor.creativeCommonsAttribution({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              }),
              maxLicenseTokens: 100,
            },
          ],
          deadline: 2000,
          txOptions: {
            timeout: 1000,
          },
          ipMetadata: {
            ipMetadataURI: "test-uri",
          },
        });
      });

      it("should call register with optional parameters", async () => {
        const registerStub = stub(ipAssetClient, "register").resolves({
          ipId: ipId,
          txHash: txHash,
        });
        await ipAssetClient.registerIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
          deadline: 2000,
          txOptions: {
            timeout: 1000,
          },
          ipMetadata: {
            ipMetadataURI: "test-uri",
          },
        });
        expect(registerStub.callCount).to.equal(1);
        expect(registerStub.args[0][0]).to.deep.equal({
          nftContract: mockERC721,
          tokenId: 1n,
          deadline: 2000,
          txOptions: {
            timeout: 1000,
          },
          ipMetadata: {
            ipMetadataURI: "test-uri",
          },
        });
      });

      it("should call mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens with optional parameters", async () => {
        const mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensStub = stub(
          ipAssetClient,
          "mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokens",
        ).resolves({
          ipId: ipId,
          licenseTermsIds: [1n],
          ipRoyaltyVault: mockAddress,
          maxLicenseTokensTxHashes: [txHash],
          txHash: txHash,
        });
        await ipAssetClient.registerIpAsset({
          nft: {
            type: "mint",
            spgNftContract: mockERC721,
            allowDuplicates: false,
            recipient: mockAddress,
          },
          royaltyShares: [{ recipient: mockAddress, percentage: 100 }],
          licenseTermsData: [
            {
              terms: PILFlavor.creativeCommonsAttribution({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              }),
              maxLicenseTokens: 100,
            },
          ],
          deadline: 2000,
          txOptions: {
            timeout: 1000,
          },
          ipMetadata: {
            ipMetadataURI: "test-uri",
          },
          options: {
            wipOptions: {
              enableAutoApprove: true,
            },
          },
        });
        expect(mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensStub.callCount).to.equal(
          1,
        );
        expect(
          mintAndRegisterIpAndAttachPilTermsAndDistributeRoyaltyTokensStub.getCall(0).args[0],
        ).to.deep.equal({
          spgNftContract: mockERC721,
          recipient: mockAddress,
          allowDuplicates: false,
          ipMetadata: {
            ipMetadataURI: "test-uri",
          },
          royaltyShares: [{ recipient: mockAddress, percentage: 100 }],
          licenseTermsData: [
            {
              terms: PILFlavor.creativeCommonsAttribution({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              }),
              maxLicenseTokens: 100,
            },
          ],
          txOptions: {
            timeout: 1000,
          },
          options: {
            wipOptions: {
              enableAutoApprove: true,
            },
          },
        });
      });

      it("should call mintAndRegisterIpAndAttachPilTerms with optional parameters", async () => {
        const mintAndRegisterIpAndAttachPilTermsStub = stub(
          ipAssetClient,
          "mintAndRegisterIpAssetWithPilTerms",
        ).resolves({
          ipId: ipId,
          licenseTermsIds: [1n],
          maxLicenseTokensTxHashes: [txHash],
          txHash: txHash,
        });
        await ipAssetClient.registerIpAsset({
          nft: {
            type: "mint",
            spgNftContract: mockERC721,
            allowDuplicates: false,
            recipient: mockAddress,
          },
          licenseTermsData: [
            {
              terms: PILFlavor.creativeCommonsAttribution({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              }),
              maxLicenseTokens: 100,
            },
          ],
          deadline: 2000,
          txOptions: {
            timeout: 1000,
          },
          ipMetadata: {
            ipMetadataURI: "test-uri",
          },
          options: {
            wipOptions: {
              enableAutoApprove: true,
            },
          },
        });
        expect(mintAndRegisterIpAndAttachPilTermsStub.callCount).to.equal(1);
        expect(mintAndRegisterIpAndAttachPilTermsStub.args[0][0]).to.deep.equal({
          spgNftContract: mockERC721,
          recipient: mockAddress,
          allowDuplicates: false,
          licenseTermsData: [
            {
              terms: PILFlavor.creativeCommonsAttribution({
                currency: WIP_TOKEN_ADDRESS,
                royaltyPolicy: royaltyPolicyLapAddress[aeneid],
              }),
              maxLicenseTokens: 100,
            },
          ],
          txOptions: {
            timeout: 1000,
          },
          ipMetadata: {
            ipMetadataURI: "test-uri",
          },
          options: {
            wipOptions: {
              enableAutoApprove: true,
            },
          },
        });
      });
      it("should call mintAndRegisterIp with optional parameters", async () => {
        const mintAndRegisterIpStub = stub(ipAssetClient, "mintAndRegisterIp").resolves({
          ipId: ipId,
          txHash: txHash,
        });
        await ipAssetClient.registerIpAsset({
          nft: {
            type: "mint",
            spgNftContract: mockERC721,
            allowDuplicates: false,
            recipient: mockAddress,
          },
          txOptions: {
            timeout: 1000,
          },
          ipMetadata: {
            ipMetadataURI: "test-uri",
          },
          deadline: 2000,
          options: {
            wipOptions: {
              enableAutoApprove: true,
            },
          },
        });
        expect(mintAndRegisterIpStub.callCount).to.equal(1);
        expect(mintAndRegisterIpStub.args[0][0]).to.deep.equal({
          spgNftContract: mockERC721,
          recipient: mockAddress,
          allowDuplicates: false,
          txOptions: {
            timeout: 1000,
          },
          ipMetadata: {
            ipMetadataURI: "test-uri",
          },
          options: {
            wipOptions: {
              enableAutoApprove: true,
            },
          },
        });
      });
    });
  });

  describe("Register Derivative IP Asset", () => {
    beforeEach(() => {
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
        {
          ipId: ipId,
          tokenId: 1n,
          chainId: 0n,
          tokenContract: mockAddress,
          name: "",
          uri: "",
          registrationDate: 0n,
        },
      ]);
      stub(ipAssetClient.licenseTemplateClient, "getLicenseTermsId").resolves({
        selectedLicenseTermsId: 1n,
      });
    });

    it("should throw error when invalid NFT type", async () => {
      await expect(
        ipAssetClient.registerDerivativeIpAsset({
          nft: { type: "invalid" as "mint", spgNftContract: mockERC721, tokenId: 1n },
          derivData,
        }),
      ).to.be.rejectedWith("Failed to register derivative IP Asset: Invalid NFT type.");
    });

    it("should throw error when licenseTokenIds provided without maxRts", async () => {
      await expect(
        ipAssetClient.registerDerivativeIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
          licenseTokenIds: [1, 2, 3],
        }),
      ).to.be.rejectedWith(
        "Failed to register derivative IP Asset: licenseTokenIds and maxRts must be provided together.",
      );
    });

    it("should throw error when maxRts provided without licenseTokenIds", async () => {
      await expect(
        ipAssetClient.registerDerivativeIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
          maxRts: 100,
        }),
      ).to.be.rejectedWith(
        "Failed to register derivative IP Asset: licenseTokenIds and maxRts must be provided together.",
      );
    });

    it("should throw error when empty licenseTokenIds array provided with maxRts", async () => {
      await expect(
        ipAssetClient.registerDerivativeIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
          licenseTokenIds: [],
          maxRts: 100,
        }),
      ).to.be.rejectedWith(
        "Failed to register derivative IP Asset: licenseTokenIds and maxRts must be provided together.",
      );
    });

    it("should throw error when royaltyShares provided without derivData", async () => {
      await expect(
        ipAssetClient.registerDerivativeIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
          royaltyShares: [
            {
              recipient: mockAddress,
              percentage: 100,
            },
          ],
        }),
      ).to.be.rejectedWith(
        "Failed to register derivative IP Asset: derivData must be provided when royaltyShares are provided.",
      );
    });

    it("should throw error without derivData and licenseTokenIds, maxRts", async () => {
      await expect(
        ipAssetClient.registerDerivativeIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
        }),
      ).to.be.rejectedWith(
        "Failed to register derivative IP Asset: Either derivData or (licenseTokenIds and maxRts) must be provided.",
      );
    });

    describe("Register Derivative IP Asset with Minted NFT", () => {
      beforeEach(() => {
        stub(IpAssetRegistryClient.prototype, "ipId").resolves(ipId);
        stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      });
      it("should call registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens when royalty shares and derivData are provided", async () => {
        const registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensTxHash = "0x1";
        const distributeRoyaltyTokensTxHash = "0x2";
        const registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensStub = stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "registerIpAndMakeDerivativeAndDeployRoyaltyVault",
        ).resolves(registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensTxHash);
        stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent").returns([
          {
            ipId: ipId,
            ipRoyaltyVault: mockAddress,
          },
        ]);
        const distributeRoyaltyTokensStub = stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "distributeRoyaltyTokens",
        ).resolves(distributeRoyaltyTokensTxHash);

        const result = await ipAssetClient.registerDerivativeIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
          royaltyShares: [
            {
              recipient: mockAddress,
              percentage: 100,
            },
          ],
          derivData,
        });

        expect(
          registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensStub.callCount,
        ).to.equal(1);
        expect(distributeRoyaltyTokensStub.callCount).to.equal(1);
        expect(
          result.registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensTxHash,
        ).to.equal(registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensTxHash);
        expect(result.distributeRoyaltyTokensTxHash).to.equal(distributeRoyaltyTokensTxHash);
        expect(result.ipId).to.equal(ipId);
        expect(result.ipRoyaltyVault).to.equal(mockAddress);
        expect(result.tokenId).to.equal(1n);
      });

      it("should call registerDerivativeIp when only derivData is provided", async () => {
        const registerDerivativeIpTxHash = "0x1";
        const registerDerivativeIpStub = stub(
          ipAssetClient.derivativeWorkflowsClient,
          "registerIpAndMakeDerivative",
        ).resolves(registerDerivativeIpTxHash);

        const result = await ipAssetClient.registerDerivativeIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
          derivData,
        });

        expect(registerDerivativeIpStub.callCount).to.equal(1);
        expect(result.txHash).to.equal(registerDerivativeIpTxHash);
        expect(result.ipId).to.equal(ipId);
        expect(result.tokenId).to.equal(1n);
      });

      it("should call registerIpAndMakeDerivativeWithLicenseTokens when licenseTokenIds and maxRts are provided", async () => {
        const registerIpAndMakeDerivativeWithLicenseTokensTxHash = "0x1";
        const registerIpAndMakeDerivativeWithLicenseTokensStub = stub(
          ipAssetClient.derivativeWorkflowsClient,
          "registerIpAndMakeDerivativeWithLicenseTokens",
        ).resolves(registerIpAndMakeDerivativeWithLicenseTokensTxHash);

        const result = await ipAssetClient.registerDerivativeIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
          licenseTokenIds: [1, 2, 3],
          maxRts: 100,
        });

        expect(registerIpAndMakeDerivativeWithLicenseTokensStub.callCount).to.equal(1);
        expect(result.txHash).to.equal(registerIpAndMakeDerivativeWithLicenseTokensTxHash);
        expect(result.ipId).to.equal(ipId);
        expect(result.tokenId).to.equal(1n);
      });

      it("should throw error when no valid parameters provided for minted NFT", async () => {
        await expect(
          ipAssetClient.registerDerivativeIpAsset({
            nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
          }),
        ).to.be.rejectedWith(
          "Failed to register derivative IP Asset: Either derivData or (licenseTokenIds and maxRts) must be provided.",
        );
      });
    });

    describe("Register Derivative IP Asset with Mint NFT", () => {
      it("should call mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens when royalty shares and derivData are provided", async () => {
        const mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensTxHash = "0x1";
        const mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensStub = stub(
          ipAssetClient.royaltyTokenDistributionWorkflowsClient,
          "mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens",
        ).resolves(mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensTxHash);
        stub(ipAssetClient.royaltyModuleEventClient, "parseTxIpRoyaltyVaultDeployedEvent").returns([
          {
            ipId: ipId,
            ipRoyaltyVault: mockAddress,
          },
        ]);
        const result = await ipAssetClient.registerDerivativeIpAsset({
          nft: { type: "mint", spgNftContract: mockERC721, recipient: mockAddress },
          royaltyShares: [
            {
              recipient: mockAddress,
              percentage: 100,
            },
          ],
          derivData,
        });

        expect(mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensStub.callCount).to.equal(
          1,
        );
        expect(result.txHash).to.equal(
          mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensTxHash,
        );
        expect(result.ipId).to.equal(ipId);
        expect(result.tokenId).to.equal(1n);
      });

      it("should call mintAndRegisterIpAndMakeDerivative when only derivData is provided", async () => {
        const mintAndRegisterIpAndMakeDerivativeTxHash = "0x1";
        const mintAndRegisterIpAndMakeDerivativeStub = stub(
          ipAssetClient.derivativeWorkflowsClient,
          "mintAndRegisterIpAndMakeDerivative",
        ).resolves(mintAndRegisterIpAndMakeDerivativeTxHash);

        const result = await ipAssetClient.registerDerivativeIpAsset({
          nft: { type: "mint", spgNftContract: mockERC721, recipient: mockAddress },
          derivData,
        });

        expect(mintAndRegisterIpAndMakeDerivativeStub.callCount).to.equal(1);
        expect(result.txHash).to.equal(mintAndRegisterIpAndMakeDerivativeTxHash);
        expect(result.ipId).to.equal(ipId);
        expect(result.tokenId).to.equal(1n);
      });

      it("should call mintAndRegisterIpAndMakeDerivativeWithLicenseTokens when licenseTokenIds and maxRts are provided", async () => {
        const mintAndRegisterIpAndMakeDerivativeWithLicenseTokensTxHash = "0x1";
        const mintAndRegisterIpAndMakeDerivativeWithLicenseTokensStub = stub(
          ipAssetClient.derivativeWorkflowsClient,
          "mintAndRegisterIpAndMakeDerivativeWithLicenseTokens",
        ).resolves(mintAndRegisterIpAndMakeDerivativeWithLicenseTokensTxHash);

        const result = await ipAssetClient.registerDerivativeIpAsset({
          nft: { type: "mint", spgNftContract: mockERC721, recipient: mockAddress },
          licenseTokenIds: [1, 2, 3],
          maxRts: 100,
        });

        expect(mintAndRegisterIpAndMakeDerivativeWithLicenseTokensStub.callCount).to.equal(1);
        expect(result.txHash).to.equal(mintAndRegisterIpAndMakeDerivativeWithLicenseTokensTxHash);
        expect(result.ipId).to.equal(ipId);
        expect(result.tokenId).to.equal(1n);
      });

      it("should throw error when no valid parameters provided for mint NFT", async () => {
        await expect(
          ipAssetClient.registerDerivativeIpAsset({
            nft: { type: "mint", spgNftContract: mockERC721, recipient: mockAddress },
          }),
        ).to.be.rejectedWith(
          "Failed to register derivative IP Asset: Either derivData or (licenseTokenIds and maxRts) must be provided.",
        );
      });
    });

    describe("Test with Optional Parameters", () => {
      it("should call registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens with optional parameters", async () => {
        const registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensStub = stub(
          ipAssetClient,
          "registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokens",
        ).resolves({
          registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensTxHash: txHash,
          distributeRoyaltyTokensTxHash: txHash,
          ipId: ipId,
          tokenId: 1n,
          ipRoyaltyVault: mockAddress,
        });
        await ipAssetClient.registerDerivativeIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
          royaltyShares: [{ recipient: mockAddress, percentage: 100 }],
          derivData,
          deadline: 2000,
          txOptions: { timeout: 10000 },
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            nftMetadataURI: "",
          },
          options: {
            wipOptions: {
              useMulticallWhenPossible: true,
            },
          },
        });
        expect(
          registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensStub.callCount,
        ).to.equal(1);
        expect(
          registerDerivativeIpAndAttachLicenseTermsAndDistributeRoyaltyTokensStub.getCall(0)
            .args[0],
        ).to.deep.equal({
          nftContract: mockERC721,
          tokenId: 1n,
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            nftMetadataURI: "",
          },
          deadline: 2000,
          txOptions: { timeout: 10000 },
          options: {
            wipOptions: {
              useMulticallWhenPossible: true,
            },
          },
          royaltyShares: [{ recipient: mockAddress, percentage: 100 }],
          derivData,
        });
      });

      it("should call registerDerivativeIp with optional parameters", async () => {
        const registerDerivativeIpStub = stub(ipAssetClient, "registerDerivativeIp").resolves({
          txHash: txHash,
          ipId: ipId,
          tokenId: 1n,
        });
        await ipAssetClient.registerDerivativeIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
          derivData,
          deadline: 2000,
          txOptions: { timeout: 10000 },
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            nftMetadataURI: "",
          },
          options: {
            wipOptions: {
              useMulticallWhenPossible: true,
            },
          },
        });
        expect(registerDerivativeIpStub.callCount).to.equal(1);
        expect(registerDerivativeIpStub.getCall(0).args[0]).to.deep.equal({
          nftContract: mockERC721,
          tokenId: 1n,
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            nftMetadataURI: "",
          },
          deadline: 2000,
          txOptions: { timeout: 10000 },
          options: {
            wipOptions: {
              useMulticallWhenPossible: true,
            },
          },
          derivData,
        });
      });

      it("should call registerIpAndMakeDerivativeWithLicenseTokens with optional parameters", async () => {
        const registerIpAndMakeDerivativeWithLicenseTokensStub = stub(
          ipAssetClient,
          "registerIpAndMakeDerivativeWithLicenseTokens",
        ).resolves({
          txHash: txHash,
          ipId: ipId,
          tokenId: 1n,
        });
        await ipAssetClient.registerDerivativeIpAsset({
          nft: { type: "minted", nftContract: mockERC721, tokenId: 1n },
          licenseTokenIds: [1, 2, 3],
          maxRts: 100,
          deadline: 2000,
          txOptions: { timeout: 10000 },
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            nftMetadataURI: "",
          },
          options: {
            wipOptions: {
              useMulticallWhenPossible: true,
            },
          },
        });
        expect(registerIpAndMakeDerivativeWithLicenseTokensStub.callCount).to.equal(1);
        expect(registerIpAndMakeDerivativeWithLicenseTokensStub.getCall(0).args[0]).to.deep.equal({
          nftContract: mockERC721,
          tokenId: 1n,
          licenseTokenIds: [1, 2, 3],
          maxRts: 100,
          deadline: 2000,
          txOptions: { timeout: 10000 },
          options: {
            wipOptions: {
              useMulticallWhenPossible: true,
            },
          },
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            nftMetadataURI: "",
          },
        });
      });
      it("should call mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens with optional parameters", async () => {
        const mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensStub = stub(
          ipAssetClient,
          "mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokens",
        ).resolves({
          txHash: txHash,
          ipId: ipId,
          tokenId: 1n,
        });
        await ipAssetClient.registerDerivativeIpAsset({
          nft: {
            type: "mint",
            spgNftContract: mockERC721,
            recipient: mockAddress,
            allowDuplicates: false,
          },
          royaltyShares: [{ recipient: mockAddress, percentage: 100 }],
          derivData,
          deadline: 2000,
          txOptions: { timeout: 10000 },
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            nftMetadataURI: "",
          },
          options: {
            wipOptions: {
              useMulticallWhenPossible: false,
            },
          },
        });
        expect(mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensStub.callCount).to.equal(
          1,
        );
        expect(
          mintAndRegisterIpAndMakeDerivativeAndDistributeRoyaltyTokensStub.getCall(0).args[0],
        ).to.deep.equal({
          spgNftContract: mockERC721,
          royaltyShares: [{ recipient: mockAddress, percentage: 100 }],
          derivData,
          txOptions: { timeout: 10000 },
          allowDuplicates: false,
          recipient: mockAddress,
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            nftMetadataURI: "",
          },
          options: {
            wipOptions: {
              useMulticallWhenPossible: false,
            },
          },
        });
      });

      it("should call mintAndRegisterIpAndMakeDerivative with optional parameters", async () => {
        const mintAndRegisterIpAndMakeDerivativeStub = stub(
          ipAssetClient,
          "mintAndRegisterIpAndMakeDerivative",
        ).resolves({
          txHash: txHash,
          ipId: ipId,
          tokenId: 1n,
        });
        await ipAssetClient.registerDerivativeIpAsset({
          nft: {
            type: "mint",
            spgNftContract: mockERC721,
            recipient: mockAddress,
            allowDuplicates: false,
          },
          derivData,
          deadline: 2000,
          txOptions: { timeout: 10000 },
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            nftMetadataURI: "",
          },
          options: {
            wipOptions: {
              useMulticallWhenPossible: false,
            },
          },
        });
        expect(mintAndRegisterIpAndMakeDerivativeStub.callCount).to.equal(1);
        expect(mintAndRegisterIpAndMakeDerivativeStub.getCall(0).args[0]).to.deep.equal({
          spgNftContract: mockERC721,
          derivData,
          txOptions: { timeout: 10000 },
          allowDuplicates: false,
          recipient: mockAddress,
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            nftMetadataURI: "",
          },
          options: {
            wipOptions: {
              useMulticallWhenPossible: false,
            },
          },
        });
      });

      it("should call mintAndRegisterIpAndMakeDerivativeWithLicenseTokens with optional parameters", async () => {
        const mintAndRegisterIpAndMakeDerivativeWithLicenseTokensStub = stub(
          ipAssetClient,
          "mintAndRegisterIpAndMakeDerivativeWithLicenseTokens",
        ).resolves({
          txHash: txHash,
          ipId: ipId,
          tokenId: 1n,
        });
        await ipAssetClient.registerDerivativeIpAsset({
          nft: {
            type: "mint",
            spgNftContract: mockERC721,
            recipient: mockAddress,
            allowDuplicates: false,
          },
          licenseTokenIds: [1, 2, 3],
          maxRts: 100,
          deadline: 2000,
          txOptions: { timeout: 10000 },
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            nftMetadataURI: "",
          },
          options: {
            wipOptions: {
              useMulticallWhenPossible: true,
            },
          },
        });
        expect(mintAndRegisterIpAndMakeDerivativeWithLicenseTokensStub.callCount).to.equal(1);
        expect(
          mintAndRegisterIpAndMakeDerivativeWithLicenseTokensStub.getCall(0).args[0],
        ).to.deep.equal({
          spgNftContract: mockERC721,
          licenseTokenIds: [1, 2, 3],
          maxRts: 100,
          txOptions: { timeout: 10000 },
          allowDuplicates: false,
          recipient: mockAddress,
          ipMetadata: {
            ipMetadataURI: "",
            ipMetadataHash: toHex(0, { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
            nftMetadataURI: "",
          },
          options: {
            wipOptions: {
              useMulticallWhenPossible: true,
            },
          },
        });
      });
    });
  });

  describe("Link Derivative", () => {
    beforeEach(() => {
      stub(ipAssetClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([]);
    });
    it("should successfully when give parentIpIds", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(ipAssetClient.licensingModuleClient, "registerDerivative").resolves(txHash);
      const result = await ipAssetClient.linkDerivative({
        childIpId: ipId,
        parentIpIds: [ipId],
        licenseTermsIds: [1n],
        maxRts: 100,
        maxMintingFee: 0n,
        maxRevenueShare: 0,
        txOptions: { timeout: 10000 },
      });
      expect(result.txHash).to.equal(txHash);
    });

    it("should successfully when give licenseTokenIds", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(ipAssetClient.licensingModuleClient, "registerDerivativeWithLicenseTokens").resolves(
        txHash,
      );
      const result = await ipAssetClient.linkDerivative({
        childIpId: ipId,
        licenseTokenIds: [1, 2, 3],
        maxRts: 100,
        maxMintingFee: 0n,
        maxRevenueShare: 0,
        txOptions: { timeout: 10000 },
      });
      expect(result.txHash).to.equal(txHash);
    });

    it("should throw error when parent ip is not registered", async () => {
      stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      await expect(
        ipAssetClient.linkDerivative({
          childIpId: ipId,
          parentIpIds: [ipId],
          licenseTermsIds: [1n],
          maxRts: 100,
          maxMintingFee: 0,
          maxRevenueShare: 0,
          txOptions: { timeout: 10000 },
        }),
      ).to.be.rejectedWith(
        `Failed to register derivative: The child IP with id ${ipId} is not registered.`,
      );
    });
  });
});
