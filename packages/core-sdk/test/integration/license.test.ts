import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { Hex, maxUint256, zeroAddress } from "viem";

import { LicensingConfig, PILFlavor, StoryClient } from "../../src";
import { getDerivedStoryClient } from "./utils/BIP32";
import { generateHex } from "./utils/generateHex";
import {
  aeneid,
  getStoryClient,
  getTokenId,
  mockERC721,
  publicClient,
  walletClient,
} from "./utils/util";
import {
  erc20Address,
  LicenseRegistryReadOnlyClient,
  licensingModuleAddress,
} from "../../src/abi/generated";
import { WIP_TOKEN_ADDRESS } from "../../src/constants/common";
import { ERC20Client } from "../../src/utils/token";

use(chaiAsPromised);

describe("License Functions", () => {
  let client: StoryClient;
  let clientB: StoryClient;
  before(async () => {
    client = getStoryClient();
    const derivedClient = await getDerivedStoryClient();
    clientB = derivedClient.clientB;
  });
  describe("register license with different types", () => {
    it("should register license ", async () => {
      const result = await client.license.registerPILTerms({
        defaultMintingFee: 0,
        currency: WIP_TOKEN_ADDRESS,
        transferable: false,
        royaltyPolicy: zeroAddress,
        commercialUse: false,
        commercialAttribution: false,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: "0x",
        commercialRevShare: 0,
        derivativesAllowed: false,
        derivativesAttribution: false,
        derivativesApproval: false,
        derivativesReciprocal: false,
        uri: "",
        expiration: "",
        commercialRevCeiling: "",
        derivativeRevCeiling: "",
      });
      expect(result.licenseTermsId).to.be.a("bigint");
    });
  });

  describe("attach License Terms and mint license tokens", () => {
    let ipId: Hex;
    let licenseId: bigint;
    let paidLicenseId: bigint; // license with 0.01IP minting fee
    let tokenId: number | undefined;
    before(async () => {
      tokenId = await getTokenId();
      const registerResult = await client.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenId!,
      });
      const mockERC20 = new ERC20Client(publicClient, walletClient, erc20Address[aeneid]);
      await mockERC20.approve(licensingModuleAddress[aeneid], maxUint256);
      ipId = registerResult.ipId!;
      const registerLicenseResult = await client.license.registerPILTerms(
        PILFlavor.commercialRemix({
          defaultMintingFee: 0n,
          commercialRevShare: 100,
          currency: WIP_TOKEN_ADDRESS,
        }),
      );
      licenseId = registerLicenseResult.licenseTermsId!;

      const paidLicenseResult = await client.license.registerPILTerms(
        PILFlavor.commercialRemix({
          defaultMintingFee: 100n,
          commercialRevShare: 10,
          currency: WIP_TOKEN_ADDRESS,
        }),
      );
      paidLicenseId = paidLicenseResult.licenseTermsId!;
    });

    it("should attach License Terms", async () => {
      const result = await client.license.attachLicenseTerms({
        ipId: ipId,
        licenseTermsId: licenseId,
      });
      expect(result.txHash).to.be.a("string");
    });

    it("should be able to attach another license terms", async () => {
      const result = await client.license.attachLicenseTerms({
        ipId: ipId,
        licenseTermsId: paidLicenseId,
      });
      expect(result.txHash).to.be.a("string");
    });

    it("should mint license tokens with ip owner", async () => {
      const result = await client.license.mintLicenseTokens({
        licenseTermsId: licenseId,
        licensorIpId: ipId,
        maxMintingFee: "1",
        maxRevenueShare: "100",
      });
      expect(result.txHash).to.be.a("string");
      expect(result.licenseTokenIds).to.be.a("array");
    });

    it("should mint license tokens with non ip owner", async () => {
      // register ip with another wallet account
      const tokenIdB = await getTokenId();
      const registerResult = await clientB.ipAsset.register({
        nftContract: mockERC721,
        tokenId: tokenIdB!,
      });
      const ipIdB = registerResult.ipId!;

      // attach license terms to the ip
      await client.license.attachLicenseTerms({
        ipId: ipIdB,
        licenseTermsId: licenseId,
      });

      const result = await client.license.mintLicenseTokens({
        licenseTermsId: licenseId,
        licensorIpId: ipIdB,
        maxMintingFee: "1",
        maxRevenueShare: "100",
      });
      expect(result.txHash).to.be.a("string");
      expect(result.licenseTokenIds).to.be.a("array");
    });

    it("should mint license token with default license terms", async () => {
      // get default license terms id
      const licenseRegistryReadOnlyClient = new LicenseRegistryReadOnlyClient(publicClient);
      const { licenseTermsId: defaultLicenseTermsId } =
        await licenseRegistryReadOnlyClient.getDefaultLicenseTerms();

      const result = await client.license.mintLicenseTokens({
        licenseTermsId: defaultLicenseTermsId,
        licensorIpId: ipId,
        maxMintingFee: 0n,
        maxRevenueShare: 1,
      });

      expect(result.txHash).to.be.a("string");
      expect(result.licenseTokenIds).to.be.a("array");
    });

    it("should mint license tokens with fee and pay with IP", async () => {
      const balanceBefore = await client.getWalletBalance();
      const result = await client.license.mintLicenseTokens({
        licenseTermsId: paidLicenseId,
        licensorIpId: ipId,
        maxMintingFee: 0n,
        maxRevenueShare: 50,
      });
      expect(result.txHash).to.be.a("string");
      const balanceAfter = await client.getWalletBalance();
      expect(Number(balanceAfter)).lessThan(Number(balanceBefore - 100n));
    });

    it("should get license terms", async () => {
      const result = await client.license.getLicenseTerms(licenseId);
      expect(result).to.be.an("object");
    });

    it("should predict minting license fee", async () => {
      const result = await client.license.predictMintingLicenseFee({
        licenseTermsId: licenseId,
        licensorIpId: ipId,
        amount: 1,
      });
      expect(result.currencyToken).to.be.a("string");
      expect(result.tokenAmount).to.be.a("bigint");
    });

    describe("licensing config and max license tokens", () => {
      const randomHookData = generateHex();
      const licensingConfig: LicensingConfig = {
        mintingFee: 0n,
        isSet: true,
        licensingHook: zeroAddress,
        hookData: randomHookData,
        commercialRevShare: 0,
        disabled: false,
        expectMinimumGroupRewardShare: 1,
        expectGroupRewardPool: zeroAddress,
      };
      it("should set licensing config", async () => {
        const result = await client.license.setLicensingConfig({
          ipId: ipId,
          licenseTermsId: licenseId,
          licensingConfig,
        });
        expect(result.txHash).to.be.a("string");
        expect(result.success).to.equal(true);
      });

      it("should get licensing config", async () => {
        const result = await client.license.getLicensingConfig({
          ipId: ipId,
          licenseTermsId: licenseId,
        });
        expect(result).to.deep.equal({
          ...licensingConfig,
          expectMinimumGroupRewardShare: 1 * 10 ** 6,
        });
      });

      it("should set max license tokens", async () => {
        const result = await client.license.setMaxLicenseTokens({
          ipId: ipId,
          licenseTermsId: licenseId,
          maxLicenseTokens: 100,
        });
        expect(result.txHash).to.be.a("string");
      });
    });
  });
});
