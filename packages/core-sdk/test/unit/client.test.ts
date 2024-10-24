import { expect } from "chai";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http, Transport } from "viem";
import { StoryClient, StoryConfig, odyssey } from "../../src/index";
const rpc = "http://127.0.0.1:8545";

describe("Test StoryClient", () => {
  describe("Test constructor", () => {
    it("should succeed when passing in default params", () => {
      const client = StoryClient.newClient({
        transport: http(rpc),
        account: privateKeyToAccount(generatePrivateKey()),
      });
      expect(client).to.be.instanceOf(StoryClient);
    });

    it("should throw transport error when transport field is missing", () => {
      expect(() => {
        StoryClient.newClient({
          transport: null as any as Transport,
          account: privateKeyToAccount(generatePrivateKey()),
        });
      }).to.throw("transport is null, please pass in a valid RPC Provider URL as the transport.");
    });

    it("should throw error when not specify a wallet or account", () => {
      expect(() => {
        StoryClient.newClient({
          transport: http(rpc),
        });
      }).to.throw("must specify a wallet or account");
    });

    it("should succeed when passing in wallet", () => {
      const client = StoryClient.newClient({
        transport: http(rpc),
        wallet: createWalletClient({
          account: privateKeyToAccount(generatePrivateKey()),
          chain: odyssey,
          transport: http(rpc),
        }),
      });

      expect(client).to.be.instanceOf(StoryClient);
    });

    it("should return client storyClient when new newClientUseWallet given wallet config", () => {
      const client = StoryClient.newClientUseWallet({
        transport: http(rpc),
        wallet: createWalletClient({
          account: privateKeyToAccount(generatePrivateKey()),
          chain: odyssey,
          transport: http(rpc),
        }),
      });
      expect(client).to.be.instanceOf(StoryClient);
    });

    it("should return client storyClient when new newClientUseAccount given account config", () => {
      const client = StoryClient.newClientUseAccount({
        transport: http(rpc),
        account: privateKeyToAccount(generatePrivateKey()),
      });
      expect(client).to.be.instanceOf(StoryClient);
    });
  });

  describe("Test getters", () => {
    const account = privateKeyToAccount(generatePrivateKey());
    const transport = http(rpc);
    const config: StoryConfig = {
      chainId: "odyssey",
      transport,
      account,
    };

    const client: StoryClient = StoryClient.newClient(config);
    it("client modules should not be empty", () => {
      expect(client.ipAsset).to.not.equal(null).and.to.not.equal(undefined);
      expect(client.permission).to.not.equal(null).and.to.not.equal(undefined);
      expect(client.license).to.not.equal(null).and.to.not.equal(undefined);
      expect(client.ipAccount).to.not.equal(null).and.to.not.equal(undefined);
      expect(client.dispute).to.not.equal(null).and.to.not.equal(undefined);
      expect(client.royalty).to.not.equal(null).and.to.not.equal(undefined);
      expect(client.nftClient).to.not.equal(null).and.to.not.equal(undefined);
      expect(client.groupClient).to.not.equal(null).and.to.not.equal(undefined);
    });
  });
});
