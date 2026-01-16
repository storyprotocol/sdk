import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { stub } from "sinon";
import { Address, PublicClient, WalletClient, zeroAddress, zeroHash } from "viem";

import { GroupClient } from "../../../src";
import { IpAccountImplClient } from "../../../src/abi/generated";
import { WIP_TOKEN_ADDRESS } from "../../../src/constants/common";
import { LicenseDataInput } from "../../../src/types/resources/group";
import { invalidAddress, ipId, mockAddress, mockERC20, nonWhitelistedToken, txHash, walletAddress } from "../mockData";
import { createMockPublicClient, createMockWalletClient } from "../testUtils";

use(chaiAsPromised);
const mockLicenseData: LicenseDataInput = {
  licenseTermsId: 100,
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
      const registerGroupAndAttachLicenseAndAddIpsStub = stub(
        groupClient.groupingWorkflowsClient,
        "registerGroupAndAttachLicenseAndAddIps",
      ).resolves(txHash);
      stub(groupClient.groupingModuleEventClient, "parseTxIpGroupRegisteredEvent").returns([
        {
          groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      ]);
      const result = await groupClient.registerGroupAndAttachLicenseAndAddIps({
        groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        maxAllowedRewardShare: 0,
        ipIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        licenseData: mockLicenseData,
      });
      expect(registerGroupAndAttachLicenseAndAddIpsStub.args[0][0].maxAllowedRewardShare).equal(0n);
      expect(result.txHash).equal(txHash);
    });
    it("should call with default value of maxAllowedRewardShare when registerGroupAndAttachLicenseAndAddIps without maxAllowedRewardShare", async () => {
      stub(groupClient.licenseRegistryReadOnlyClient, "hasIpAttachedLicenseTerms").resolves(true);
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      const registerGroupAndAttachLicenseAndAddIpsStub = stub(
        groupClient.groupingWorkflowsClient,
        "registerGroupAndAttachLicenseAndAddIps",
      ).resolves(txHash);
      stub(groupClient.groupingModuleEventClient, "parseTxIpGroupRegisteredEvent").returns([
        {
          groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
          groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        },
      ]);
      const result = await groupClient.registerGroupAndAttachLicenseAndAddIps({
        groupPool: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        ipIds: ["0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c"],
        licenseData: mockLicenseData,
      });
      expect(registerGroupAndAttachLicenseAndAddIpsStub.args[0][0].maxAllowedRewardShare).equal(
        BigInt(100 * 10 ** 6),
      );
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
      const result = await groupClient.mintAndRegisterIpAndAttachLicenseAndAddToGroup({
        groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        spgNftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        maxAllowedRewardShare: 0,
        licenseData: [mockLicenseData],
        allowDuplicates: true,
      });
      expect(
        mintAndRegisterIpAndAttachLicenseAndAddToGroupStub.args[0][0].maxAllowedRewardShare,
      ).to.equal(0n);
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

    it("should call with default values when mintAndRegisterIpAndAttachLicenseAndAddToGroup without default values", async () => {
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
      expect(args.maxAllowedRewardShare).to.equal(BigInt(100 * 10 ** 6));
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
          tokenId: 100,
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
          tokenId: 100,
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
          tokenId: 100,
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
      const registerIpAndAttachLicenseAndAddToGroupStub = stub(
        groupClient.groupingWorkflowsClient,
        "registerIpAndAttachLicenseAndAddToGroup",
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
      const result = await groupClient.registerIpAndAttachLicenseAndAddToGroup({
        groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: 100,
        licenseData: [mockLicenseData],
        maxAllowedRewardShare: 0,
      });
      expect(registerIpAndAttachLicenseAndAddToGroupStub.args[0][0].maxAllowedRewardShare).to.equal(
        0n,
      );
      expect(result.txHash).equal(txHash);
      expect(result.ipId).equal("0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c");
    });
    it("should call with default value of maxAllowedRewardShare when registerIpAndAttachLicenseAndAddToGroup without maxAllowedRewardShare", async () => {
      stub(groupClient.ipAssetRegistryClient, "ipId").resolves(
        "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
      );
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      const registerIpAndAttachLicenseAndAddToGroupStub = stub(
        groupClient.groupingWorkflowsClient,
        "registerIpAndAttachLicenseAndAddToGroup",
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
      const result = await groupClient.registerIpAndAttachLicenseAndAddToGroup({
        groupId: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        nftContract: "0x1daAE3197Bc469Cb97B917aa460a12dD95c6627c",
        tokenId: 100,
        licenseData: [mockLicenseData],
      });
      expect(registerIpAndAttachLicenseAndAddToGroupStub.args[0][0].maxAllowedRewardShare).to.equal(
        BigInt(100 * 10 ** 6),
      );
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
        tokenId: 100,
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

  describe("TSSDK-135(Add validation for inputs currency and currencyToken.) Test groupClient.collectAndDistributeGroupRoyalties", () => {
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

    it("throws if currency token address is invalid on aeneid (1315)", async () => {
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      const result = groupClient.collectAndDistributeGroupRoyalties({
        groupIpId: mockAddress,
        currencyTokens: [invalidAddress as unknown as Address],
        memberIpIds: [mockAddress],
      });
      await expect(result).to.be.rejectedWith(
        `Failed to collect and distribute group royalties: Currency token ${invalidAddress} is not allowed on chain 1315.`,
      );
    });

    it("throws if currency token is not allowed on aeneid (1315)", async () => {
      stub(groupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      const tokens = [nonWhitelistedToken] as unknown as Address[];
      const result = groupClient.collectAndDistributeGroupRoyalties({
        groupIpId: mockAddress,
        currencyTokens: tokens,
        memberIpIds: [mockAddress],
      });
      await expect(result).to.be.rejectedWith(
        `Failed to collect and distribute group royalties: Currency token ${tokens.toString()} is not allowed on chain 1315.`,
      );
    });

    it("throws if MERC20 is not allowed on mainnet (1514)", async () => {
      const rpc = createMockPublicClient();
      const wallet = createMockWalletClient();
      const mainnetGroupClient = new GroupClient(rpc, wallet, 1514);
      stub(mainnetGroupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      const tokens = [mockERC20] as unknown as Address[];
      const result = mainnetGroupClient.collectAndDistributeGroupRoyalties({
        groupIpId: mockAddress,
        currencyTokens: tokens,
        memberIpIds: [mockAddress],
      });
      await expect(result).to.be.rejectedWith(
        `Failed to collect and distribute group royalties: Currency token ${tokens.toString()} is not allowed on chain 1514.`,
      );
    });

    it("throws if non-whitelisted token is not allowed on mainnet (1514)", async () => {
      const rpc = createMockPublicClient();
      const wallet = createMockWalletClient();
      const mainnetGroupClient = new GroupClient(rpc, wallet, 1514);
      stub(mainnetGroupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      const tokens = [nonWhitelistedToken] as unknown as Address[];
      const result = mainnetGroupClient.collectAndDistributeGroupRoyalties({
        groupIpId: mockAddress,
        currencyTokens: tokens,
        memberIpIds: [mockAddress],
      });
      await expect(result).to.be.rejectedWith(
        `Failed to collect and distribute group royalties: Currency token ${tokens.toString()} is not allowed on chain 1514.`,
      );
    });

    it("throws if invalid address token is not allowed on mainnet (1514) (expected: whitelist error)", async () => {
      const rpc = createMockPublicClient();
      const wallet = createMockWalletClient();
      const mainnetGroupClient = new GroupClient(rpc, wallet, 1514);
      stub(mainnetGroupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      const tokens = [invalidAddress as unknown as Address];
      const result = mainnetGroupClient.collectAndDistributeGroupRoyalties({
        groupIpId: mockAddress,
        currencyTokens: tokens,
        memberIpIds: [mockAddress],
      });
      await expect(result).to.be.rejectedWith(
        `Failed to collect and distribute group royalties: Currency token ${tokens.toString()} is not allowed on chain 1514.`,
      );
    });

    it("allows WIP on mainnet (1514)", async () => {
      const rpc = createMockPublicClient();
      const wallet = createMockWalletClient();
      const mainnetGroupClient = new GroupClient(rpc, wallet, 1514);
      stub(mainnetGroupClient.ipAssetRegistryClient, "isRegistered").resolves(true);
      stub(mainnetGroupClient.groupingWorkflowsClient, "collectRoyaltiesAndClaimReward").resolves(txHash);
      stub(
        mainnetGroupClient.groupingModuleEventClient,
        "parseTxCollectedRoyaltiesToGroupPoolEvent",
      ).returns([
        { groupId: mockAddress, amount: 1n, token: WIP_TOKEN_ADDRESS, pool: mockAddress },
      ]);
      stub(mainnetGroupClient.royaltyModuleEventClient, "parseTxRoyaltyPaidEvent").returns([
        {
          receiverIpId: mockAddress,
          amount: 1n,
          token: WIP_TOKEN_ADDRESS,
          amountAfterFee: 1n,
          payerIpId: mockAddress,
          sender: mockAddress,
        },
      ]);
      const result = await mainnetGroupClient.collectAndDistributeGroupRoyalties({
        groupIpId: mockAddress,
        currencyTokens: [WIP_TOKEN_ADDRESS],
        memberIpIds: [mockAddress],
      });
      expect(result.txHash).equal(txHash);
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
      const addIpStub = stub(groupClient.groupingModuleClient, "addIp").resolves(txHash);
      const result = await groupClient.addIpsToGroup({
        groupIpId: mockAddress,
        ipIds: [mockAddress],
        maxAllowedRewardSharePercentage: 0,
      });
      expect(addIpStub.args[0][0].maxAllowedRewardShare).to.equal(0n);
      expect(result.txHash).equal(txHash);
    });
    it("should call with default value of maxAllowedRewardSharePercentage when addIpsToGroup without maxAllowedRewardSharePercentage", async () => {
      const addIpStub = stub(groupClient.groupingModuleClient, "addIp").resolves(txHash);
      const result = await groupClient.addIpsToGroup({
        groupIpId: mockAddress,
        ipIds: [mockAddress],
      });
      expect(addIpStub.args[0][0].maxAllowedRewardShare).to.equal(BigInt(100 * 10 ** 6));
      expect(result.txHash).equal(txHash);
    });

    it("should call maxAllowedRewardSharePercentage of 0 when provided of 0", async () => {
      const mockAddIp = stub(groupClient.groupingModuleClient, "addIp").resolves(txHash);
      await groupClient.addIpsToGroup({
        groupIpId: mockAddress,
        ipIds: [mockAddress],
        maxAllowedRewardSharePercentage: 0,
      });
      expect(mockAddIp.args[0][0].maxAllowedRewardShare).to.equal(0n);
    });

    it("should call maxAllowedRewardSharePercentage of 100 when it is not provided", async () => {
      const mockAddIp = stub(groupClient.groupingModuleClient, "addIp").resolves(txHash);
      await groupClient.addIpsToGroup({
        groupIpId: mockAddress,
        ipIds: [mockAddress],
      });
      expect(mockAddIp.args[0][0].maxAllowedRewardShare).to.equal(100000000n);
    });
  });

  describe("TSSDK-135(Add validation for inputs currency and currencyToken.) Test groupClient.getClaimableReward", () => {
    it("should reject when currencyToken is not allowed on aeneid (1315)", async () => {
      const getClaimableRewardStub = stub(groupClient.groupingModuleClient, "getClaimableReward").resolves([10n]);
      const result = groupClient.getClaimableReward({
        groupIpId: ipId,
        currencyToken: nonWhitelistedToken,
        memberIpIds: [ipId],
      });
      await expect(result).to.be.rejectedWith(
        `Failed to get claimable reward: Currency token ${nonWhitelistedToken} is not allowed on chain 1315.`,
      );
      expect(getClaimableRewardStub.callCount).equals(0);
    });

    it("should reject when currencyToken is invalid address on aeneid (expected: whitelist error)", async () => {
      const getClaimableRewardStub = stub(groupClient.groupingModuleClient, "getClaimableReward").resolves([10n]);
      const result = groupClient.getClaimableReward({
        groupIpId: ipId,
        currencyToken: invalidAddress,
        memberIpIds: [ipId],
      });
      await expect(result).to.be.rejectedWith(
        `Failed to get claimable reward: Currency token ${invalidAddress} is not allowed on chain 1315.`,
      );
      expect(getClaimableRewardStub.callCount).equals(0);
    });

    it("should allow WIP on aeneid (1315)", async () => {
      stub(groupClient.groupingModuleClient, "getClaimableReward").resolves([10n]);
      const result = await groupClient.getClaimableReward({
        groupIpId: ipId,
        currencyToken: WIP_TOKEN_ADDRESS,
        memberIpIds: [ipId],
      });
      expect(result).to.deep.equal([10n]);
    });

    it("should allow MERC20 on aeneid (1315)", async () => {
      stub(groupClient.groupingModuleClient, "getClaimableReward").resolves([10n]);
      const result = await groupClient.getClaimableReward({
        groupIpId: ipId,
        currencyToken: mockERC20,
        memberIpIds: [ipId],
      });
      expect(result).to.deep.equal([10n]);
    });

    it("should allow WIP on mainnet (1514)", async () => {
      const rpc = createMockPublicClient();
      const wallet = createMockWalletClient();
      const mainnetGroupClient = new GroupClient(rpc, wallet, 1514);
      stub(mainnetGroupClient.groupingModuleClient, "getClaimableReward").resolves([10n]);
      const result = await mainnetGroupClient.getClaimableReward({
        groupIpId: ipId,
        currencyToken: WIP_TOKEN_ADDRESS,
        memberIpIds: [ipId],
      });
      expect(result).to.deep.equal([10n]);
    });

    it("should reject MERC20 on mainnet (1514)", async () => {
      const rpc = createMockPublicClient();
      const wallet = createMockWalletClient();
      const mainnetGroupClient = new GroupClient(rpc, wallet, 1514);
      const getClaimableRewardStub = stub(mainnetGroupClient.groupingModuleClient, "getClaimableReward").resolves([10n]);
      const result = mainnetGroupClient.getClaimableReward({
        groupIpId: ipId,
        currencyToken: mockERC20,
        memberIpIds: [ipId],
      });
      await expect(result).to.be.rejectedWith(
        `Failed to get claimable reward: Currency token ${mockERC20} is not allowed on chain 1514.`,
      );
      expect(getClaimableRewardStub.callCount).equals(0);
    });

    it("should reject non-whitelisted token on mainnet (1514)", async () => {
      const rpc = createMockPublicClient();
      const wallet = createMockWalletClient();
      const mainnetGroupClient = new GroupClient(rpc, wallet, 1514);
      const getClaimableRewardStub = stub(mainnetGroupClient.groupingModuleClient, "getClaimableReward").resolves([10n]);
      const result = mainnetGroupClient.getClaimableReward({
        groupIpId: ipId,
        currencyToken: nonWhitelistedToken,
        memberIpIds: [ipId],
      });
      await expect(result).to.be.rejectedWith(
        `Failed to get claimable reward: Currency token ${nonWhitelistedToken} is not allowed on chain 1514.`,
      );
      expect(getClaimableRewardStub.callCount).equals(0);
    });

    it("should reject invalid address token on mainnet (1514) (expected: whitelist error)", async () => {
      const rpc = createMockPublicClient();
      const wallet = createMockWalletClient();
      const mainnetGroupClient = new GroupClient(rpc, wallet, 1514);
      const getClaimableRewardStub = stub(mainnetGroupClient.groupingModuleClient, "getClaimableReward").resolves([10n]);
      const result = mainnetGroupClient.getClaimableReward({
        groupIpId: ipId,
        currencyToken: invalidAddress,
        memberIpIds: [ipId],
      });
      await expect(result).to.be.rejectedWith(
        `Failed to get claimable reward: Currency token ${invalidAddress} is not allowed on chain 1514.`,
      );
      expect(getClaimableRewardStub.callCount).equals(0);
    });

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

  describe("TSSDK-135(Add validation for inputs currency and currencyToken.) Test groupClient.claimReward", () => {
    it("should reject when currencyToken is not allowed (aeneid)", async () => {
      const claimRewardStub = stub(groupClient.groupingModuleClient, "claimReward").resolves(txHash);
      const result = groupClient.claimReward({
        groupIpId: ipId,
        currencyToken: nonWhitelistedToken,
        memberIpIds: [ipId],
      });
      await expect(result).to.be.rejectedWith(
        `Failed to claim reward: Currency token ${nonWhitelistedToken} is not allowed on chain 1315.`,
      );
      expect(claimRewardStub.callCount).equals(0);
    });

    it("should reject when currencyToken is invalid address (expected: whitelist error)", async () => {
      const claimRewardStub = stub(groupClient.groupingModuleClient, "claimReward").resolves(txHash);
      const result = groupClient.claimReward({
        groupIpId: ipId,
        currencyToken: invalidAddress,
        memberIpIds: [ipId],
      });
      await expect(result).to.be.rejectedWith(
        `Failed to claim reward: Currency token ${invalidAddress} is not allowed on chain 1315.`,
      );
      expect(claimRewardStub.callCount).equals(0);
    });

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

  describe("TSSDK-135(Add validation for inputs currency and currencyToken.) Test groupClient.collectRoyalties", () => {
    it("should reject when currencyToken is not allowed (aeneid)", async () => {
      const collectRoyaltiesStub = stub(groupClient.groupingModuleClient, "collectRoyalties").resolves(txHash);
      const result = groupClient.collectRoyalties({
        groupIpId: mockAddress,
        currencyToken: nonWhitelistedToken,
      });
      await expect(result).to.be.rejectedWith(
        `Failed to collect royalties: Currency token ${nonWhitelistedToken} is not allowed on chain 1315.`,
      );
      expect(collectRoyaltiesStub.callCount).equals(0);
    });

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
