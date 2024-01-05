import { expect } from "chai";
import { StoryClient, StoryConfig, Client } from "../../src";
import { http, parseGwei, PrivateKeyAccount, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import {
  ConfigureLicenseRequest,
  CreateLicenseRequest,
  LicensorConfigEnum,
} from "../../src/types/resources/license";

describe("License Functions", () => {
  let client: Client;
  let senderAddress: string;
  let wallet: PrivateKeyAccount;

  before(function () {
    wallet = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

    const config: StoryConfig = {
      chainId: "sepolia",
      transport: http(process.env.RPC_PROVIDER_URL),
      account: wallet,
    };

    senderAddress = config.account.address;
    client = StoryClient.newClient(config);
  });

  describe("Configuring license", async function () {
    it("should be able to configure license with default values", async () => {
      const waitForTransaction: boolean = true;
      const createIpoResponse = await expect(
        client.ipOrg.create({
          name: "Alice In Wonderland",
          symbol: "AIW",
          owner: senderAddress,
          ipAssetTypes: ["Story", "Character"],
          txOptions: {
            waitForTransaction: waitForTransaction,
          },
        }),
      ).to.not.be.rejected;
      expect(createIpoResponse.txHash).to.be.a("string");
      expect(createIpoResponse.txHash).not.empty;
      expect(createIpoResponse.ipOrgId).to.be.a("string");
      expect(createIpoResponse.ipOrgId).not.empty;

      // Configure license
      const configureLicenseRequest: ConfigureLicenseRequest = {
        ipOrg: createIpoResponse.ipOrgId,
        frameworkId: "SPUML-1.0",
        params: [],
        licensor: 1,
        txOptions: {
          waitForTransaction: true,
          gasPrice: parseGwei("250"),
        },
      };

      const response = await client.license.configure(configureLicenseRequest);

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.be.undefined;

      expect(response.success).to.be.true;
    });
    it("should be able to configure with Attribution=true", async () => {
      // 1. Create IPO first
      // 2. Configure framework
      // 3. Create license

      const createIpoResponse = await expect(
        client.ipOrg.create({
          name: "Alice In Wonderland",
          symbol: "AIW",
          owner: senderAddress,
          ipAssetTypes: ["Story", "Character"],
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.not.be.rejected;
      expect(createIpoResponse.txHash).to.be.a("string");
      expect(createIpoResponse.txHash).not.empty;
      expect(createIpoResponse.ipOrgId).to.be.a("string");
      expect(createIpoResponse.ipOrgId).not.empty;

      const attributionParam = {
        tag: stringToHex("Attribution", { size: 32 }),
        value: {
          interface: "bool",
          data: [true],
        },
      };

      const licenseParameters = [attributionParam];

      // Configure license
      const configureLicenseRequest: ConfigureLicenseRequest = {
        ipOrg: createIpoResponse.ipOrgId,
        frameworkId: "SPUML-1.0",
        params: licenseParameters,
        licensor: LicensorConfigEnum.Source,
        txOptions: {
          waitForTransaction: true,
          gasPrice: parseGwei("250"),
        },
      };

      const configureResponse = await client.license.configure(configureLicenseRequest);

      expect(configureResponse.txHash).to.be.a("string");
      expect(configureResponse.txHash).not.be.undefined;

      expect(configureResponse.success).to.be.true;
    });
    it("should be able to configure with Attribution=false", async () => {
      // 1. Create IPO first
      // 2. Configure framework
      // 3. Create license

      const createIpoResponse = await expect(
        client.ipOrg.create({
          name: "Alice In Wonderland",
          symbol: "AIW",
          owner: senderAddress,
          ipAssetTypes: ["Story", "Character"],
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.not.be.rejected;
      expect(createIpoResponse.txHash).to.be.a("string");
      expect(createIpoResponse.txHash).not.empty;
      expect(createIpoResponse.ipOrgId).to.be.a("string");
      expect(createIpoResponse.ipOrgId).not.empty;

      const attributionParam = {
        tag: stringToHex("Attribution", { size: 32 }),
        value: {
          interface: "bool",
          data: [false],
        },
      };

      const licenseParameters = [attributionParam];

      // Configure license
      const configureLicenseRequest: ConfigureLicenseRequest = {
        ipOrg: createIpoResponse.ipOrgId,
        frameworkId: "SPUML-1.0",
        params: licenseParameters,
        licensor: LicensorConfigEnum.Source,
        txOptions: {
          waitForTransaction: true,
          gasPrice: parseGwei("250"),
        },
      };

      const configureResponse = await client.license.configure(configureLicenseRequest);

      expect(configureResponse.txHash).to.be.a("string");
      expect(configureResponse.txHash).not.be.undefined;

      expect(configureResponse.success).to.be.true;
    });
    it("should be able get txHash after configuring with Derivatives-Allowed=false", async () => {
      // 1. Create IPO first
      // 2. Configure framework
      // 3. Create license

      const createIpoResponse = await expect(
        client.ipOrg.create({
          name: "Alice In Wonderland",
          symbol: "AIW",
          owner: senderAddress,
          ipAssetTypes: ["Story", "Character"],
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.not.be.rejected;
      expect(createIpoResponse.txHash).to.be.a("string");
      expect(createIpoResponse.txHash).not.empty;
      expect(createIpoResponse.ipOrgId).to.be.a("string");
      expect(createIpoResponse.ipOrgId).not.empty;

      const attributionParam = {
        tag: stringToHex("Derivatives-Allowed", { size: 32 }),
        value: {
          interface: "bool",
          data: [false],
        },
      };

      const licenseParameters = [attributionParam];

      // Configure license
      const configureLicenseRequest: ConfigureLicenseRequest = {
        ipOrg: createIpoResponse.ipOrgId,
        frameworkId: "SPUML-1.0",
        params: licenseParameters,
        licensor: LicensorConfigEnum.Source,
        txOptions: {
          waitForTransaction: false,
          gasPrice: parseGwei("250"),
        },
      };

      const configureResponse = await client.license.configure(configureLicenseRequest);

      expect(configureResponse.txHash).to.be.a("string");
      expect(configureResponse.txHash).not.be.undefined;
    });
  });

  describe("License creation", async function () {
    it("should be able to create an NFT with empty/default values", async () => {
      // 1. Create IPO first
      // 2. Configure framework
      // 3. Create license

      const createIpoResponse = await expect(
        client.ipOrg.create({
          name: "Alice In Wonderland",
          symbol: "AIW",
          owner: senderAddress,
          ipAssetTypes: ["Story", "Character"],
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.not.be.rejected;
      expect(createIpoResponse.txHash).to.be.a("string");
      expect(createIpoResponse.txHash).not.empty;
      expect(createIpoResponse.ipOrgId).to.be.a("string");
      expect(createIpoResponse.ipOrgId).not.empty;

      // Configure license
      const configureLicenseRequest: ConfigureLicenseRequest = {
        ipOrg: createIpoResponse.ipOrgId,
        frameworkId: "",
        params: [],
        licensor: 1,
        txOptions: {
          waitForTransaction: true,
          gasPrice: parseGwei("250"),
          // numBlockConfirmations: 1,
        },
      };

      const configureResponse = await client.license.configure(configureLicenseRequest);

      expect(configureResponse.txHash).to.be.a("string");
      expect(configureResponse.txHash).not.be.undefined;

      expect(configureResponse.success).to.be.true;

      const createLicenseRequest: CreateLicenseRequest = {
        ipOrgId: createIpoResponse.ipOrgId,
        params: [],
        parentLicenseId: "0",
        ipaId: "0",
        preHookData: [],
        postHookData: [],
        txOptions: {
          waitForTransaction: true,
          gasPrice: parseGwei("250"),
          // numBlockConfirmations: 1,
        },
      };

      const response = await expect(client.license.create(createLicenseRequest)).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.be.undefined;

      expect(response.licenseId).to.be.a("string");
      expect(response.licenseId).not.be.undefined;
    });
    it("should be able to create an NFT with non-default license parameters", async () => {
      // 1. Create IPO first
      // 2. Configure framework
      // 3. Create license

      const createIpoResponse = await expect(
        client.ipOrg.create({
          name: "Alice In Wonderland",
          symbol: "AIW",
          owner: senderAddress,
          ipAssetTypes: ["Story", "Character"],
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.not.be.rejected;
      expect(createIpoResponse.txHash).to.be.a("string");
      expect(createIpoResponse.txHash).not.empty;
      expect(createIpoResponse.ipOrgId).to.be.a("string");
      expect(createIpoResponse.ipOrgId).not.empty;

      // const attributionParam = {
      //   tag: "Attribution",
      //   value: {
      //     interface: "bool",
      //     data: [true],
      //   },
      // };
      const derivativesParam = {
        tag: stringToHex("Derivatives-Allowed", { size: 32 }),
        value: {
          interface: "bool",
          data: [false],
        },
      };
      // const licenseParameters = [attributionParam];
      const licenseParameters = [derivativesParam];

      // Configure license
      const configureLicenseRequest: ConfigureLicenseRequest = {
        ipOrg: createIpoResponse.ipOrgId,
        frameworkId: "SPUML-1.0",
        params: licenseParameters,
        licensor: LicensorConfigEnum.Source,
        txOptions: {
          waitForTransaction: true,
          gasPrice: parseGwei("250"),
          numBlockConfirmations: 2,
        },
      };

      const configureResponse = await client.license.configure(configureLicenseRequest);

      expect(configureResponse.txHash).to.be.a("string");
      expect(configureResponse.txHash).not.be.undefined;

      expect(configureResponse.success).to.be.true;

      const createLicenseRequest: CreateLicenseRequest = {
        ipOrgId: createIpoResponse.ipOrgId,
        params: [],
        parentLicenseId: "0",
        ipaId: "0",
        preHookData: [],
        postHookData: [],
        txOptions: {
          waitForTransaction: true,
          gasPrice: parseGwei("250"),
          numBlockConfirmations: 2,
        },
      };

      const response = await expect(client.license.create(createLicenseRequest)).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.be.undefined;

      expect(response.licenseId).to.be.a("string");
      expect(response.licenseId).not.be.undefined;
    });
    it.skip("should be able to create an NFT with 'Attribution'=true", async () => {
      // 1. Create IPO first
      // 2. Configure framework
      // 3. Create license

      const createIpoResponse = await expect(
        client.ipOrg.create({
          name: "Alice In Wonderland",
          symbol: "AIW",
          owner: senderAddress,
          ipAssetTypes: ["Story", "Character"],
          txOptions: {
            waitForTransaction: true,
          },
        }),
      ).to.not.be.rejected;
      expect(createIpoResponse.txHash).to.be.a("string");
      expect(createIpoResponse.txHash).not.empty;
      expect(createIpoResponse.ipOrgId).to.be.a("string");
      expect(createIpoResponse.ipOrgId).not.empty;

      // const attributionParam = {
      //   tag: "Attribution",
      //   value: {
      //     interface: "bool",
      //     data: [true],
      //   },
      // };
      const derivativesParam = {
        tag: stringToHex("Derivatives-Allowed", { size: 32 }),
        value: {
          interface: "bool",
          data: [false],
        },
      };
      // const licenseParameters = [attributionParam, derivativesParam];
      const licenseParameters = [derivativesParam];

      // Configure license
      const configureLicenseRequest: ConfigureLicenseRequest = {
        ipOrg: createIpoResponse.ipOrgId,
        frameworkId: "SPUML-1.0",
        params: licenseParameters,
        licensor: LicensorConfigEnum.Source,
        txOptions: {
          waitForTransaction: true,
          gasPrice: parseGwei("250"),
        },
      };

      const configureResponse = await client.license.configure(configureLicenseRequest);

      expect(configureResponse.txHash).to.be.a("string");
      expect(configureResponse.txHash).not.be.undefined;

      expect(configureResponse.success).to.be.true;

      const createLicenseRequest: CreateLicenseRequest = {
        ipOrgId: createIpoResponse.ipOrgId,
        params: [],
        parentLicenseId: "0",
        ipaId: "0",
        preHookData: [],
        postHookData: [],
        txOptions: {
          waitForTransaction: true,
          gasPrice: parseGwei("250"),
          numBlockConfirmations: 2,
        },
      };

      const response = await expect(client.license.create(createLicenseRequest)).to.not.be.rejected;

      expect(response.txHash).to.be.a("string");
      expect(response.txHash).not.be.undefined;

      expect(response.licenseId).to.be.a("string");
      expect(response.licenseId).not.be.undefined;
    });
  });
});
