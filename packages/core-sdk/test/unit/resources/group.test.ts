import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { stub } from "sinon";
import { Address, PublicClient, WalletClient, zeroAddress, zeroHash } from "viem";

import { GroupClient } from "../../../src";
import { IpAccountImplClient } from "../../../src/abi/generated";
import { LicenseDataInput } from "../../../src/types/resources/group";
import { mockAddress, txHash, walletAddress } from "../mockData";
import { createMockPublicClient, createMockWalletClient } from "../testUtils";

use(chaiAsPromised);
const mockLicenseData: LicenseDataInput = {
  licenseTermsId: "100",
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
};
describe("Test IpAssetClient", () => {
  let groupClient: GroupClient;
  let rpcMock: PublicClient;
  let walletMock: WalletClient;

  beforeEach(() => {
    rpcMock = createMockPublicClient();
    walletMock = createMockWalletClient();
    groupClient = new GroupClient(rpcMock, walletMock, 1315);
    (groupClient.groupingWorkflowsClient as { address: Address }).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (groupClient.groupingModuleClient as { address: Address }).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (groupClient.coreMetadataModuleClient as { address: Address }).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (groupClient.licensingModuleClient as { address: Address }).address =
      "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c";
    (groupClient.licenseTemplateClient as { address: Address }).address = mockAddress;
    stub(IpAccountImplClient.prototype, "state").resolves({
      result: "0x2e778894d11b5308e4153f094e190496c1e0609652c19f8b87e5176484b9a56e",
    });
  });

 
  describe("Test groupClient.registerGroup", () => {
    it("should throw groupPool address is invalid error when groupPool is invalid", async () => {
      try {
        await groupClient.registerGroup({
          groupPool: "0x123",
        });
      } catch (err) {
        expect((err as Error).message).equal("Failed to register group: Invalid address: 0x123.");
      }
    });

    it("should return txHash when call registerGroup successfully ", async () => {
      stub(groupClient.groupingModuleClient, "registerGroup").resolves(txHash);
      stub(groupClient.groupingModuleEventClient, "parseTxIpGroupRegisteredEvent").returns([
        {
          groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      ]);
      const result = await groupClient.registerGroup({
        groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
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
      expect(result.encodedTxData!.data).to.be.a("string");
    });
  });
  describe("Test groupClient.registerGroupAndAttachLicense", () => {
    it("should throw licenseTemplate error when call registerGroupAndAttachLicense given licenseTemplate is invalid", async () => {
      try {
        await groupClient.registerGroupAndAttachLicense({
          groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          licenseData: {
            ...mockLicenseData,
            licenseTemplate: "0x123",
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register group and attach license: Invalid address: 0x123.",
        );
      }
    });
    it("should return txHash when call registerGroupAndAttachLicense successfully ", async () => {
      stub(groupClient.groupingWorkflowsClient, "registerGroupAndAttachLicense").resolves(txHash);
      stub(groupClient.groupingModuleEventClient, "parseTxIpGroupRegisteredEvent").returns([
        {
          groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      ]);
      const result = await groupClient.registerGroupAndAttachLicense({
        groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        licenseData: {
          ...mockLicenseData,
          licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      });
      expect(result.txHash).equal(txHash);
      expect(result.groupId).equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
    });

    it("should return encodedData when call registerGroupAndAttachLicense successfully with encodedTxDataOnly of true", async () => {
      const result = await groupClient.registerGroupAndAttachLicense({
        groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        licenseData: {
          ...mockLicenseData,
          licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
        txOptions: {
          encodedTxDataOnly: true,
        },
      });
      expect(result.encodedTxData!.data).to.be.a("string");
    });
  });
  describe("Test groupClient.registerGroupAndAttachLicenseAndAddIps", () => {
    it("should throw group id register error when call registerGroupAndAttachLicenseAndAddIps given ip id is not registered", async () => {
      try {
        stub(groupClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
        stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(false);
        await groupClient.registerGroupAndAttachLicenseAndAddIps({
          groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          ipIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
          maxAllowedRewardShare: 5,
          licenseData: {
            ...mockLicenseData,
            licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register group and attach license and add ips: IP 0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c is not registered.",
        );
      }
    });
    it("should throw not attach between license terms and ip id when call registerGroupAndAttachLicenseAndAddIps given ipIds is not attach license terms", async () => {
      try {
        stub(groupClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(
          false,
        );
        stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
        await groupClient.registerGroupAndAttachLicenseAndAddIps({
          groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          maxAllowedRewardShare: 5,
          ipIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
          licenseData: {
            ...mockLicenseData,
            licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          },
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register group and attach license and add ips: License terms must be attached to IP 0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c before adding to group.",
        );
      }
    });

    it("should return encodedData when call registerGroupAndAttachLicenseAndAddIps successfully with encodedTxDataOnly of true", async () => {
      stub(groupClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);

      const result = await groupClient.registerGroupAndAttachLicenseAndAddIps({
        groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        ipIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        maxAllowedRewardShare: 5,
        licenseData: {
          ...mockLicenseData,
          licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
        txOptions: {
          encodedTxDataOnly: true,
        },
      });
      expect(result.encodedTxData!.data).to.be.a("string");
    });

    it("should return txHash when call registerGroupAndAttachLicenseAndAddIps given correct args ", async () => {
      stub(groupClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(groupClient.groupingWorkflowsClient, "registerGroupAndAttachLicenseAndAddIps").resolves(
        txHash,
      );
      stub(groupClient.groupingModuleEventClient, "parseTxIpGroupRegisteredEvent").returns([
        {
          groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      ]);
      const result = await groupClient.registerGroupAndAttachLicenseAndAddIps({
        groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        maxAllowedRewardShare: 5,
        ipIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        licenseData: mockLicenseData,
      });
      expect(result.txHash).equal(txHash);
    });
  });

  describe("Test groupClient.mintAndRegisterIpAndAttachLicenseAndAddToGroup", () => {
    beforeEach(() => {});
    it("should throw group id register error when call mintAndRegisterIpAndAttachLicenseAndAddToGroup given group id is not registered", async () => {
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await groupClient.mintAndRegisterIpAndAttachLicenseAndAddToGroup({
          groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          maxAllowedRewardShare: 5,
          spgNftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          licenseData: [mockLicenseData],
          allowDuplicates: true,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to mint and register IP and attach license and add to group: Group IP 0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c is not registered.",
        );
      }
    });

    it("should return txHash when call mintAndRegisterIpAndAttachLicenseAndAddToGroup given correct args ", async () => {
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(
        groupClient.groupingWorkflowsClient,
        "mintAndRegisterIpAndAttachLicenseAndAddToGroup",
      ).resolves(txHash);
      stub(groupClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
        maxAllowedRewardShare: 5,
        licenseData: [mockLicenseData],
        allowDuplicates: true,
      });
      expect(result.txHash).equal(txHash);
      expect(result.ipId).equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
      expect(result.tokenId).equal(0n);
    });

    it("should return encodedData when call mintAndRegisterIpAndAttachLicenseAndAddToGroup successfully with encodedTxDataOnly of true", async () => {
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(
        groupClient.groupingWorkflowsClient,
        "mintAndRegisterIpAndAttachLicenseAndAddToGroupEncode",
      ).returns({
        data: "0x11111111111111111111111111111",
        to: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });

      const result = await groupClient.mintAndRegisterIpAndAttachLicenseAndAddToGroup({
        groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        spgNftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        maxAllowedRewardShare: 5,
        licenseData: [
          {
            ...mockLicenseData,
            licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          },
        ],
        allowDuplicates: true,
        recipient: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
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
      expect(result.encodedTxData!.data).to.be.a("string");
    });

    it("should call with default values when mintAndRegisterIpAndAttachLicenseAndAddToGroup without providing allowDuplicates, ipMetadata, recipient", async () => {
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      const mintAndRegisterIpAndAttachLicenseAndAddToGroupStub = stub(
        groupClient.groupingWorkflowsClient,
        "mintAndRegisterIpAndAttachLicenseAndAddToGroup",
      ).resolves(txHash);
      stub(groupClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
      await groupClient.mintAndRegisterIpAndAttachLicenseAndAddToGroup({
        groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        maxAllowedRewardShare: 5,
        spgNftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        licenseData: [mockLicenseData],
      });

      const args = mintAndRegisterIpAndAttachLicenseAndAddToGroupStub.args[0][0];
      expect(args.allowDuplicates).to.equal(true);
      expect(args.ipMetadata).to.deep.equal({
        ipMetadataURI: "",
        ipMetadataHash: zeroHash,
        nftMetadataURI: "",
        nftMetadataHash: zeroHash,
      });
      expect(args.recipient).to.equal(walletAddress);
    });
  });

  describe("Test groupClient.registerIpAndAttachLicenseAndAddToGroup", () => {
    it("should throw group id register error when call registerIpAndAttachLicenseAndAddToGroup given ip id is not registered", async () => {
      stub(groupClient.ipAssetRegistryClient, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(false);
      try {
        await groupClient.registerIpAndAttachLicenseAndAddToGroup({
          groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: "100",
          licenseData: [mockLicenseData],
          maxAllowedRewardShare: 5,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and attach license and add to group: Group IP 0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c is not registered.",
        );
      }
    });
    it("should throw licenseData error when call registerIpAndAttachLicenseAndAddToGroup given licenseData is empty", async () => {
      stub(groupClient.ipAssetRegistryClient, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      try {
        await groupClient.registerIpAndAttachLicenseAndAddToGroup({
          groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          tokenId: "100",
          licenseData: [],
          maxAllowedRewardShare: 5,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and attach license and add to group: License data is required.",
        );
      }
    });

    it("should throw nft contract error when call registerIpAndAttachLicenseAndAddToGroup given nft contract address is invalid", async () => {
      stub(groupClient.ipAssetRegistryClient, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      try {
        await groupClient.registerIpAndAttachLicenseAndAddToGroup({
          groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          nftContract: "0x",
          tokenId: "100",
          licenseData: [mockLicenseData],
          maxAllowedRewardShare: 5,
        });
      } catch (err) {
        expect((err as Error).message).equal(
          "Failed to register IP and attach license and add to group: Invalid address: 0x.",
        );
      }
    });

    it("should return txHash when call registerIpAndAttachLicenseAndAddToGroup given correct args ", async () => {
      stub(groupClient.ipAssetRegistryClient, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(groupClient.groupingWorkflowsClient, "registerIpAndAttachLicenseAndAddToGroup").resolves(
        txHash,
      );
      stub(groupClient.ipAssetRegistryClient, "parseTxIpRegisteredEvent").returns([
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
        licenseData: [mockLicenseData],
        maxAllowedRewardShare: 5,
      });
      expect(result.txHash).equal(txHash);
      expect(result.ipId).equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
    });

    it("should return encodedData when call registerIpAndAttachLicenseAndAddToGroup successfully with encodedTxDataOnly of true", async () => {
      stub(groupClient.ipAssetRegistryClient, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(
        groupClient.groupingWorkflowsClient,
        "registerIpAndAttachLicenseAndAddToGroupEncode",
      ).returns({
        data: "0x11111111111111111111111111111",
        to: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      });
      const result = await groupClient.registerIpAndAttachLicenseAndAddToGroup({
        groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        maxAllowedRewardShare: 5,
        tokenId: "100",
        licenseData: [
          {
            ...mockLicenseData,
            licenseTemplate: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          },
        ],
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
      expect(result.encodedTxData!.data).to.be.a("string");
    });
  });

  describe("Test groupClient.collectAndDistributeGroupRoyalties", () => {
    it("throws if group ipId is not registered", async () => {
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(false);

      const result = groupClient.collectAndDistributeGroupRoyalties({
        groupIpId: mockAddress,
        currencyTokens: [mockAddress],
        memberIpIds: [mockAddress],
      });
      await expect(result).to.be.rejectedWith(
        `Failed to collect and distribute group royalties: The group IP with ID ${mockAddress} is not registered.`,
      );
    });

    it("throws if member ip ids is not registered", async () => {
      stub(groupClient.ipAssetRegistryClient, "isRegistered")
        .onFirstCall()
        .resolves(true)
        .onSecondCall()
        .resolves(false);
      const result = groupClient.collectAndDistributeGroupRoyalties({
        groupIpId: mockAddress,
        currencyTokens: [mockAddress],
        memberIpIds: [mockAddress],
      });
      await expect(result).to.be.rejectedWith(
        `Failed to collect and distribute group royalties: Member IP with ID ${mockAddress} is not registered .`,
      );
    });

    it("throws if empty member ip ids", async () => {
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      const result = groupClient.collectAndDistributeGroupRoyalties({
        groupIpId: mockAddress,
        currencyTokens: [mockAddress],
        memberIpIds: [],
      });
      await expect(result).to.be.rejectedWith(
        "Failed to collect and distribute group royalties: At least one member IP ID is required.",
      );
    });

    it("throws if currency token is zero address", async () => {
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      const result = groupClient.collectAndDistributeGroupRoyalties({
        groupIpId: mockAddress,
        currencyTokens: [zeroAddress],
        memberIpIds: [mockAddress],
      });
      await expect(result).to.be.rejectedWith(
        "Failed to collect and distribute group royalties: Currency token cannot be the zero address.",
      );
    });

    it("throws if empty currency tokens", async () => {
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      const result = groupClient.collectAndDistributeGroupRoyalties({
        groupIpId: mockAddress,
        currencyTokens: [],
        memberIpIds: [mockAddress],
      });
      await expect(result).to.be.rejectedWith(
        "Failed to collect and distribute group royalties: At least one currency token is required.",
      );
    });

    it("returns txHash given correct args", async () => {
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(groupClient.groupingWorkflowsClient, "collectRoyaltiesAndClaimReward").resolves(txHash);
      stub(
        groupClient.groupingModuleEventClient,
        "parseTxCollectedRoyaltiesToGroupPoolEvent",
      ).returns([
        {
          groupId: mockAddress,
          amount: 100n,
          token: mockAddress,
          pool: mockAddress,
        },
      ]);
      stub(groupClient.royaltyModuleEventClient, "parseTxRoyaltyPaidEvent").returns([
        {
          receiverIpId: mockAddress,
          amount: 100n,
          token: mockAddress,
          amountAfterFee: 100n,
          payerIpId: mockAddress,
          sender: mockAddress,
        },
      ]);

      const result = await groupClient.collectAndDistributeGroupRoyalties({
        groupIpId: mockAddress,
        currencyTokens: [mockAddress],
        memberIpIds: [mockAddress],
      });
      expect(result.txHash).equal(txHash);
    });

    it("returns additional details", async () => {
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(
        groupClient.groupingModuleEventClient,
        "parseTxCollectedRoyaltiesToGroupPoolEvent",
      ).returns([
        {
          groupId: mockAddress,
          amount: 100n,
          token: mockAddress,
          pool: mockAddress,
        },
      ]);
      stub(groupClient.royaltyModuleEventClient, "parseTxRoyaltyPaidEvent").returns([
        {
          receiverIpId: mockAddress,
          amount: 100n,
          token: mockAddress,
          amountAfterFee: 100n,
          payerIpId: mockAddress,
          sender: mockAddress,
        },
      ]);
      stub(groupClient.groupingWorkflowsClient, "collectRoyaltiesAndClaimReward").resolves(txHash);
      const result = await groupClient.collectAndDistributeGroupRoyalties({
        groupIpId: mockAddress,
        currencyTokens: [mockAddress],
        memberIpIds: [mockAddress],
      });
      expect(result.txHash).equal(txHash);
      expect(result.collectedRoyalties).to.deep.equal([
        {
          amount: 100n,
          token: mockAddress,
          groupId: mockAddress,
        },
      ]);
      expect(result.royaltiesDistributed).to.deep.equal([
        {
          ipId: mockAddress,
          amount: 100n,
          token: mockAddress,
          amountAfterFee: 100n,
        },
      ]);
    });
  });

  describe("Test groupClient.addIpsToGroup", () => {
    it("should throw error when call fails", async () => {
      stub(groupClient.groupingModuleClient, "addIp").rejects(new Error("rpc error"));
      const result = groupClient.addIpsToGroup({
        groupIpId: mockAddress,
        ipIds: [mockAddress],
      });
      await expect(result).to.be.rejectedWith("Failed to add IP to group: rpc error");
    });

    it("should return txHash when call succeeds", async () => {
      stub(groupClient.groupingModuleClient, "addIp").resolves(txHash);
      const result = await groupClient.addIpsToGroup({
        groupIpId: mockAddress,
        ipIds: [mockAddress],
        maxAllowedRewardSharePercentage: 5,
      });
      expect(result.txHash).equal(txHash);
    });
  });

  describe("Test groupClient.getClaimableReward", () => {
    it("should throw error when call fail", async () => {
      stub(groupClient.groupingModuleClient, "getClaimableReward").rejects(new Error("rpc error"));
      const result = groupClient.getClaimableReward({
        groupIpId: mockAddress,
        currencyToken: mockAddress,
        memberIpIds: [mockAddress],
      });
      await expect(result).to.be.rejectedWith("Failed to get claimable reward: rpc error");
    });

    it("should return claimable reward when call successfully", async () => {
      stub(groupClient.groupingModuleClient, "getClaimableReward").resolves([10n]);
      const result = await groupClient.getClaimableReward({
        groupIpId: mockAddress,
        currencyToken: mockAddress,
        memberIpIds: [mockAddress],
      });
      expect(result).to.deep.equal([10n]);
    });
  });

  describe("Test groupClient.removeIpsFromGroup", () => {
    it("should throw error when call fails", async () => {
      stub(groupClient.groupingModuleClient, "removeIp").rejects(new Error("rpc error"));
      const result = groupClient.removeIpsFromGroup({
        groupIpId: mockAddress,
        ipIds: [mockAddress],
      });
      await expect(result).to.be.rejectedWith("Failed to remove IPs from group: rpc error");
    });

    it("should return txHash when call succeeds", async () => {
      stub(groupClient.groupingModuleClient, "removeIp").resolves(txHash);
      const result = await groupClient.removeIpsFromGroup({
        groupIpId: mockAddress,
        ipIds: [mockAddress],
      });
      expect(result.txHash).equal(txHash);
    });
  });

  describe("Test groupClient.claimReward", () => {
    it("should throw error when call fail", async () => {
      stub(groupClient.groupingModuleClient, "claimReward").rejects(new Error("rpc error"));
      const result = groupClient.claimReward({
        groupIpId: mockAddress,
        currencyToken: mockAddress,
        memberIpIds: [mockAddress],
      });
      await expect(result).to.be.rejectedWith("Failed to claim reward: rpc error");
    });

    it("should return txHash when call successfully", async () => {
      stub(groupClient.groupingModuleClient, "claimReward").resolves(txHash);
      stub(groupClient.groupingModuleEventClient, "parseTxClaimedRewardEvent").returns([
        {
          ipId: [mockAddress],
          amount: [100n],
          token: mockAddress,
          groupId: mockAddress,
        },
      ]);
      const result = await groupClient.claimReward({
        groupIpId: mockAddress,
        currencyToken: mockAddress,
        memberIpIds: [mockAddress],
      });
      expect(result.txHash).equal(txHash);
    });

    it("should return additional details", async () => {
      stub(groupClient.groupingModuleClient, "claimReward").resolves(txHash);
      stub(groupClient.groupingModuleEventClient, "parseTxClaimedRewardEvent").returns([
        {
          ipId: [mockAddress],
          amount: [100n],
          token: mockAddress,
          groupId: mockAddress,
        },
      ]);
      const result = await groupClient.claimReward({
        groupIpId: mockAddress,
        currencyToken: mockAddress,
        memberIpIds: [mockAddress],
      });
      expect(result.txHash).equal(txHash);
      expect(result.claimedReward).to.deep.equal([
        {
          ipId: [mockAddress],
          amount: [100n],
          token: mockAddress,
          groupId: mockAddress,
        },
      ]);
    });
  });

  describe("Test groupClient.collectRoyalties", () => {
    it("should throw error when call fails", async () => {
      stub(groupClient.groupingModuleClient, "collectRoyalties").rejects(new Error("rpc error"));

      const result = groupClient.collectRoyalties({
        groupIpId: mockAddress,
        currencyToken: mockAddress,
      });
      await expect(result).to.be.rejectedWith("Failed to collect royalties: rpc error");
    });

    it("should return txHash when call successfully", async () => {
      stub(groupClient.groupingModuleClient, "collectRoyalties").resolves(txHash);
      stub(
        groupClient.groupingModuleEventClient,
        "parseTxCollectedRoyaltiesToGroupPoolEvent",
      ).returns([
        {
          groupId: mockAddress,
          amount: 100n,
          token: mockAddress,
          pool: mockAddress,
        },
      ]);
      const result = await groupClient.collectRoyalties({
        groupIpId: mockAddress,
        currencyToken: mockAddress,
      });
      expect(result.txHash).equal(txHash);
      expect(result.collectedRoyalties).to.equal(100n);
    });

    it("should return additional details", async () => {
      stub(groupClient.groupingModuleClient, "collectRoyalties").resolves(txHash);
      stub(
        groupClient.groupingModuleEventClient,
        "parseTxCollectedRoyaltiesToGroupPoolEvent",
      ).returns([
        {
          groupId: mockAddress,
          amount: 100n,
          token: mockAddress,
          pool: mockAddress,
        },
      ]);

      const result = await groupClient.collectRoyalties({
        groupIpId: mockAddress,
        currencyToken: mockAddress,
      });
      expect(result.txHash).equal(txHash);
      expect(result.collectedRoyalties).to.equal(100n);
    });
  });
});
