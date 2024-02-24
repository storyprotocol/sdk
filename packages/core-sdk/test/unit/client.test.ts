import { expect } from "chai";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { sepolia } from "viem/chains";
import { Account, http, Transport, createWalletClient, createPublicClient } from "viem";
import { StoryClient } from "../../src";
import { SupportedChainIds } from "../../src/types/config";
import { PermissionClient } from "../../src/resources/permission";
import { LicenseClient } from "../../src/resources/license";
import { PolicyClient } from "../../src/resources/policy";
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
    const config = {
      chainId: "sepolia" as SupportedChainIds,
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
      const permission = new PermissionClient(rpcClient, wallet);
      expect(client.permission).to.not.equal(null);
      expect(client.permission).to.not.equal(undefined);
      expect(client.permission.ipAccountABI).to.equal(permission.ipAccountABI);
      expect(client.permission.accessControllerConfig).to.equal(permission.accessControllerConfig);
    });

    it("should return client license", () => {
      const license = new LicenseClient(rpcClient, wallet, storyAPIClient);
      expect(client.license).to.not.equal(null);
      expect(client.license).to.not.equal(undefined);
      expect(client.license.ipAccountABI).to.equal(license.ipAccountABI);
      expect(client.license.licenseRegistryConfig).to.equal(license.licenseRegistryConfig);
      expect(client.license.licensingModuleConfig).to.equal(license.licensingModuleConfig);
    });

    it("should return client policy", () => {
      const policy = new PolicyClient(rpcClient, wallet);
      expect(client.policy).to.not.equal(null);
      expect(client.policy).to.not.equal(undefined);
      expect(client.policy.ipAccountABI).to.equal(policy.ipAccountABI);
      expect(client.policy.licensingModuleConfig).to.equal(policy.licensingModuleConfig);
      expect(client.policy.pilPolicyFrameworkManagerConfig).to.equal(
        policy.pilPolicyFrameworkManagerConfig,
      );
    });

    it("should return client account", () => {
      expect(client.ipAccount).to.not.equal(null);
      expect(client.ipAccount).to.not.equal(undefined);
      expect(client.ipAccount.ipAccountABI).to.equal(IPAccountABI);
    });

    it("should return client dispute", () => {
      const dispute = new DisputeClient(rpcClient, wallet);
      expect(client.dispute).to.not.equal(null);
      expect(client.dispute).to.not.equal(undefined);
      expect(client.dispute.disputeModuleConfig).to.equal(dispute.disputeModuleConfig);
    });
  });
});
