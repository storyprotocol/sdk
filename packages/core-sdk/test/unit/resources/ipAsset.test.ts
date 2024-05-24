import chai from "chai";
import { createMock } from "../testUtils";
import * as sinon from "sinon";
import { CreateIpAssetWithPilTermsRequest, IPAssetClient } from "../../../src";
import { PublicClient, WalletClient, Account, toHex, zeroHash, LocalAccount } from "viem";
import chaiAsPromised from "chai-as-promised";
import { RegisterIpAndAttachPilTermsRequest } from "../../../src/types/resources/ipAsset";
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Test IpAssetClient", () => {
  let ipAssetClient: IPAssetClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(() => {
    rpcMock = createMock<PublicClient>();
    walletMock = createMock<WalletClient>();
    const accountMock = createMock<LocalAccount>();
    walletMock.account = accountMock;
    walletMock.account.signTypedData = sinon
      .stub()
      .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");
    ipAssetClient = new IPAssetClient(rpcMock, walletMock, "sepolia");
    (ipAssetClient.spgClient as any).address = "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (ipAssetClient.accessControllerClient as any).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (ipAssetClient.coreMetadataModuleClient as any).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (ipAssetClient.licensingModuleClient as any).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("Test ipAssetClient.register", async () => {
    it("should return ipId when register given tokenId have registered", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      const res = await ipAssetClient.register({
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
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
          nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: "3",
          deadline: "error",
          metadata: {
            metadataURI: "1",
            metadataHash: zeroHash,
          },
        });
      } catch (err) {
        expect((err as Error).message).equal("Failed to register IP: Invalid deadline value.");
      }
    });

    it("should throw account error when register given account is not local account ", async () => {
      const walletMock = createMock<WalletClient>();
      walletMock.account = createMock<Account>();
      ipAssetClient = new IPAssetClient(rpcMock, walletMock, "sepolia");
      (ipAssetClient.spgClient as any).address = "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
      (ipAssetClient.coreMetadataModuleClient as any).address =
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await ipAssetClient.register({
          nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: "3",
          deadline: "12321",
          metadata: {
            metadataURI: "",
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP: The account does not support signTypedData, Please use a local account.",
        );
      }
    });

    it("should return txHash when register given tokenId have no registered", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "register")
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      const res = await ipAssetClient.register({
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "3",
      });

      expect(res.txHash).equal(
        "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
      );
    });

    it("should return ipId and txHash when register a IP and given waitForTransaction of true and tokenId is not registered ", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "register")
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
          waitForTransaction: true,
        },
      });

      expect(response.txHash).equal(
        "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
      );
      expect(response.ipId).equals("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
    });

    it("should return ipId and txHash when register a IP given correct args, waitForTransaction is true and metadata", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon
        .stub(ipAssetClient.spgClient, "registerIp")
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
        metadata: {
          metadataURI: "",
          metadataHash: zeroHash,
          nftMetadataHash: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(response.txHash).equal(
        "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
      );
      expect(response.ipId).equals("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
    });

    it("should throw error when request fails", async () => {
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "register").throws(new Error("revert error"));
      try {
        await ipAssetClient.register({
          nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: "3",
          txOptions: {
            waitForTransaction: true,
          },
        });
      } catch (err) {
        expect((err as Error).message).equal("Failed to register IP: revert error");
      }
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
      sinon
        .stub(ipAssetClient.licensingModuleClient, "registerDerivative")
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      const res = await ipAssetClient.registerDerivative({
        childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
        licenseTermsIds: ["1"],
      });

      expect(res.txHash).equal(
        "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
      );
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
      sinon
        .stub(ipAssetClient.licensingModuleClient, "registerDerivative")
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      const res = await ipAssetClient.registerDerivative({
        childIpId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
        licenseTermsIds: ["1"],
        licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(res.txHash).equal(
        "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
      );
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
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      const res = await ipAssetClient.registerDerivativeWithLicenseTokens({
        childIpId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
        licenseTokenIds: ["1"],
      });

      expect(res.txHash).equal(
        "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
      );
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
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      const res = await ipAssetClient.registerDerivativeWithLicenseTokens({
        childIpId: "0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4",
        licenseTokenIds: ["1"],
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(res.txHash).equal(
        "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
      );
    });
  });

  describe("Test ipAssetClient.createIpAssetWithPilTerms", async () => {
    it("throw PIL_TYPE error when createIpAssetWithPilTerms given PIL_TYPE is not match", async () => {
      try {
        await ipAssetClient.mintAndRegisterIpAssetWithPilTerms({
          nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        } as unknown as CreateIpAssetWithPilTermsRequest);
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to mint and register IP and attach PIL terms: PIL type is required.",
        );
      }
    });

    it("should throw address error when createIpAssetWithPilTerms given nftContract is not registered", async () => {
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      try {
        await ipAssetClient.mintAndRegisterIpAssetWithPilTerms({
          nftContract: "0x",
          pilType: 0,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          `Failed to mint and register IP and attach PIL terms: request.nftContract address is invalid: 0x, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`,
        );
      }
    });

    it("should return txHash when createIpAssetWithPilTerms given correct args", async () => {
      const hash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      sinon.stub(ipAssetClient.spgClient, "mintAndRegisterIpAndAttachPilTerms").resolves(hash);
      const result = await ipAssetClient.mintAndRegisterIpAssetWithPilTerms({
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        pilType: 0,
        recipient: "0x73fcb515cee99e4991465ef586cfe2b072ebb512",
        metadata: {
          metadataURI: "",
          metadataHash: toHex(0, { size: 32 }),
        },
      });

      expect(result.txHash).to.equal(hash);
    });
    it("should return ipId, tokenId, licenseTermsId,txHash when createIpAssetWithPilTerms given correct args and waitForTransaction of true", async () => {
      const hash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      sinon.stub(ipAssetClient.spgClient, "mintAndRegisterIpAndAttachPilTerms").resolves(hash);
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
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c662ac",
        pilType: 0,
        metadata: {
          nftMetadataHash: toHex(0, { size: 32 }),
        },
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(hash);
      expect(result.ipId).to.equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      expect(result.licenseTermsId).to.equal(0n);
      expect(result.tokenId).to.equal(1n);
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
          nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
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
          nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
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
          nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
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
        .stub(ipAssetClient.spgClient, "registerIpAndMakeDerivative")
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      const res = await ipAssetClient.registerDerivativeIp({
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "3",
        derivData: {
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: ["1"],
          licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
        metadata: {
          metadataHash: toHex(0, { size: 32 }),
        },
      });

      expect(res.txHash).equal(
        "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
      );
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
        .stub(ipAssetClient.spgClient, "registerIpAndMakeDerivative")
        .resolves("0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997");

      const res = await ipAssetClient.registerDerivativeIp({
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "3",
        derivData: {
          parentIpIds: ["0xd142822Dc1674154EaF4DDF38bbF7EF8f0D8ECe4"],
          licenseTermsIds: ["1"],
          licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
        metadata: {
          metadataHash: toHex(0, { size: 32 }),
          metadataURI: "",
        },
      });

      expect(res.txHash).equal(
        "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
      );
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
        .stub(ipAssetClient.spgClient, "registerIpAndMakeDerivative")
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
        },
        metadata: {
          metadataURI: "https://",
          nftMetadataHash: toHex("nftMetadata", { size: 32 }),
        },
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(res.txHash).equal(
        "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997",
      );
      expect(res.ipId).equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
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
          nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: "3",
          metadata: {
            metadataURI: "https://",
            metadataHash: toHex("metadata", { size: 32 }),
            nftMetadataHash: toHex("nftMetadata", { size: 32 }),
          },
          pilType: 0,
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
          nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: "3",
        } as unknown as RegisterIpAndAttachPilTermsRequest);
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and attach PIL terms: PIL type is required.",
        );
      }
    });

    it("should called with initial metadata when registerIpAndAttachPilTerms given empty metadataURI", async () => {
      const stub = sinon.stub(ipAssetClient.spgClient, "registerIpAndAttachPilTerms");
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      await ipAssetClient.registerIpAndAttachPilTerms({
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "3",
        metadata: {
          metadataHash: toHex(0, { size: 32 }),
          metadataURI: "",
        },
        pilType: 0,
      });
      expect(stub.args[0][0].metadata).to.deep.equal({
        metadataURI: "",
        metadataHash: toHex(0, { size: 32 }),
        nftMetadataHash: toHex(0, { size: 32 }),
      });
    });
    it("should return hash when registerIpAndAttachPilTerms given correct args", async () => {
      const hash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      sinon.stub(ipAssetClient.spgClient, "registerIpAndAttachPilTerms").resolves(hash);
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      const result = await ipAssetClient.registerIpAndAttachPilTerms({
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: "3",
        metadata: {
          metadataHash: toHex(0, { size: 32 }),
        },
        pilType: 0,
      });

      expect(result.txHash).to.equal(hash);
    });

    it("should return txHash and ipId when registerIpAndAttachPilTerms given correct args and waitForTransaction of true", async () => {
      const hash = "0x129f7dd802200f096221dd89d5b086e4bd3ad6eafb378a0c75e3b04fc375f997";
      sinon
        .stub(ipAssetClient.ipAssetRegistryClient, "ipId")
        .resolves("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      sinon.stub(ipAssetClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      sinon.stub(ipAssetClient.spgClient, "registerIpAndAttachPilTerms").resolves(hash);
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
        metadata: {
          metadataURI: "https://",
        },
        pilType: 0,
        txOptions: {
          waitForTransaction: true,
        },
      });

      expect(result.txHash).to.equal(hash);
      expect(result.ipId).to.equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
    });
  });
});
