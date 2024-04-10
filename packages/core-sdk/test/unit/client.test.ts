import { expect } from "chai";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { sepolia } from "viem/chains";
import { Account, http, Transport, createWalletClient, createPublicClient } from "viem";
import { IPAssetClient, StoryClient } from "../../src";
import { StoryConfig } from "../../src/types/config";
import { PermissionClient } from "../../src/resources/permission";
import { LicenseClient } from "../../src/resources/license";
import { IPAccountABI } from "../../src/abi/config";
import { DisputeClient } from "../../src/resources/dispute";
import { StoryAPIClient } from "../../src/clients/storyAPI";
describe("Test StoryClient", function () {
  describe("Test constructor", function () {
    it("should succeed when passing in default params", function () {
      const client = StoryClient.newClient({
        transport: http(process.env.RPC_PROVIDER_URL),
        account: privateKeyToAccount(generatePrivateKey()),
      });
      expect(client).to.be.instanceOf(StoryClient);
    });

    it("should throw transport error when transport field is missing", function () {
      expect(() => {
        StoryClient.newClient({
          transport: null as any as Transport,
          account: privateKeyToAccount(generatePrivateKey()),
        });
      }).to.throw("transport is null, please pass in a valid RPC Provider URL as the transport.");
    });

    it("should throw error when wallet account is null", function () {
      expect(() => {
        StoryClient.newClient({
          transport: http(process.env.RPC_PROVIDER_URL),
          account: null as any as Account,
        });
      }).to.throw("account is null");
    });
  });

  describe("Test getters", function () {
    const account = privateKeyToAccount(generatePrivateKey());
    const transport = http(process.env.RPC_PROVIDER_URL);
    const config: StoryConfig = {
      chainId: "sepolia",
      transport,
      account,
    };
    const clientConfig = {
      chain: sepolia,
      transport: config.transport,
    };
    const rpcClient = createPublicClient(clientConfig);
    const wallet = createWalletClient({
      ...clientConfig,
      account: account,
    });

    const client: StoryClient = StoryClient.newClient(config);
    const storyAPIClient = new StoryAPIClient();
    it("client ipAsset should not be empty", () => {
      expect(client.ipAsset).to.not.equal(null);
      expect(client.ipAsset).to.not.equal(undefined);
    });

    it("should return client permission", () => {
      const permission = new PermissionClient(rpcClient, wallet, "sepolia");
      expect(client.permission).to.not.equal(null);
      expect(client.permission).to.not.equal(undefined);
      expect(client.permission.ipAccountABI).to.eql(permission.ipAccountABI);
      expect(client.permission.accessControllerConfig).to.eql(permission.accessControllerConfig);
    });

    it("should return client license", () => {
      const license = new LicenseClient(
        rpcClient,
        wallet,
        storyAPIClient,
        new IPAssetClient(rpcClient, wallet, "sepolia"),
        "sepolia",
      );
      expect(client.license).to.not.equal(null);
      expect(client.license).to.not.equal(undefined);
      expect(client.license.ipAccountABI).to.eql(license.ipAccountABI);
      expect(client.license.licenseRegistryConfig).to.eql(license.licenseRegistryConfig);
      expect(client.license.licensingModuleConfig).to.eql(license.licensingModuleConfig);
      // expect(client.license.getLicenseTemplateConfig).to.eql(license.getLicenseTemplateConfig);
      expect(client.license.royaltyPolicyLAPConfig).to.eql(license.royaltyPolicyLAPConfig);
    });

    it("should return client account", () => {
      expect(client.ipAccount).to.not.equal(null);
      expect(client.ipAccount).to.not.equal(undefined);
      expect(client.ipAccount.ipAccountABI).to.eql(IPAccountABI);
    });

    it("should return client dispute", () => {
      const dispute = new DisputeClient(rpcClient, wallet, "sepolia");
      expect(client.dispute).to.not.equal(null);
      expect(client.dispute).to.not.equal(undefined);
      expect(client.dispute.disputeModuleConfig).to.eql(dispute.disputeModuleConfig);
    });
  });
});
