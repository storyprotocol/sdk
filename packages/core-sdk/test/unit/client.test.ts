import { expect } from "chai";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { Account, createPublicClient, createWalletClient, http, Transport } from "viem";
import {
  DisputeClient,
  LicenseClient,
  PermissionClient,
  StoryClient,
  StoryConfig,
} from "../../src";
import { StoryAPIClient } from "../../src/clients/storyAPI";
import { RoyaltyClient } from "../../src/resources/royalty";

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

    it("should throw error when not specify a wallet or account", function () {
      expect(() => {
        StoryClient.newClient({
          transport: http(process.env.RPC_PROVIDER_URL),
        });
      }).to.throw("must specify a wallet or account");
    });

    it("should succeed when passing in wallet", function () {
      const client = StoryClient.newClient({
        transport: http(process.env.RPC_PROVIDER_URL),
        wallet: createWalletClient({
          account: privateKeyToAccount(generatePrivateKey()),
          chain: sepolia,
          transport: http(process.env.RPC_PROVIDER_URL),
        }),
      });

      expect(client).to.be.instanceOf(StoryClient);
    });

    it("should return client storyClient when new newClientUseWallet given wallet config", () => {
      const client = StoryClient.newClientUseWallet({
        transport: http(process.env.RPC_PROVIDER_URL),
        wallet: createWalletClient({
          account: privateKeyToAccount(generatePrivateKey()),
          chain: sepolia,
          transport: http(process.env.RPC_PROVIDER_URL),
        }),
      });
      expect(client).to.be.instanceOf(StoryClient);
    });

    it("should return client storyClient when new newClientUseAccount given account config", () => {
      const client = StoryClient.newClientUseAccount({
        transport: http(process.env.RPC_PROVIDER_URL),
        account: privateKeyToAccount(generatePrivateKey()),
      });
      expect(client).to.be.instanceOf(StoryClient);
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
      const permission = new PermissionClient(rpcClient, wallet);
      expect(client.permission).to.not.equal(null);
      expect(client.permission).to.not.equal(undefined);
    });

    it("should return client license", () => {
      const license = new LicenseClient(rpcClient, wallet);
      expect(client.license).to.not.equal(null);
      expect(client.license).to.not.equal(undefined);
    });

    it("should return client account", () => {
      expect(client.ipAccount).to.not.equal(null);
      expect(client.ipAccount).to.not.equal(undefined);
    });

    it("should return client dispute", () => {
      const dispute = new DisputeClient(rpcClient, wallet);
      expect(client.dispute).to.not.equal(null);
      expect(client.dispute).to.not.equal(undefined);
    });

    it("should return client royalty", () => {
      const royalty = new RoyaltyClient(rpcClient, wallet);
      expect(client.royalty).to.not.equal(null);
      expect(client.royalty).to.not.equal(undefined);
    });
  });
});
