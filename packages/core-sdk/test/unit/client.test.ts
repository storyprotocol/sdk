import { expect } from "chai";
import {
  createWalletClient,
  Hash,
  http,
  PublicClient,
  Transport,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import { aeneid, StoryClient, StoryConfig, TxHashResolver } from "../../src/index";

const rpc = "http://127.0.0.1:8545";

type WaitForReceiptArgs = Parameters<PublicClient["waitForTransactionReceipt"]>[0];

type WaitForReceiptResult = ReturnType<PublicClient["waitForTransactionReceipt"]>;

type WaitForReceiptData = Awaited<WaitForReceiptResult>;

type StoryClientPrivate = {
  rpcClient: PublicClient;
  applyTxHashResolver: (resolver: TxHashResolver) => void;
};

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
          transport: null as unknown as Transport,
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
          chain: aeneid,
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
          chain: aeneid,
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

    it("should succeed when passing in txHashResolver with newClient", () => {
      const resolver: TxHashResolver = (hash) => Promise.resolve(hash);
      const client = StoryClient.newClient({
        transport: http(rpc),
        account: privateKeyToAccount(generatePrivateKey()),
        txHashResolver: resolver,
      });
      expect(client).to.be.instanceOf(StoryClient);
    });

    it("should succeed when passing in txHashResolver with newClientUseWallet", () => {
      const resolver: TxHashResolver = (hash) => Promise.resolve(hash);
      const client = StoryClient.newClientUseWallet({
        transport: http(rpc),
        wallet: createWalletClient({
          account: privateKeyToAccount(generatePrivateKey()),
          chain: aeneid,
          transport: http(rpc),
        }),
        txHashResolver: resolver,
      });
      expect(client).to.be.instanceOf(StoryClient);
    });

    it("should succeed when passing in txHashResolver with newClientUseAccount", () => {
      const resolver: TxHashResolver = (hash) => Promise.resolve(hash);
      const client = StoryClient.newClientUseAccount({
        transport: http(rpc),
        account: privateKeyToAccount(generatePrivateKey()),
        txHashResolver: resolver,
      });
      expect(client).to.be.instanceOf(StoryClient);
    });
  });

  describe("Test txHashResolver", () => {
    const userOpHash: Hash = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const resolvedTxHash: Hash = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

    it("should resolve hash before calling original waitForTransactionReceipt", async () => {
      let resolverCallCount = 0;
      let resolverArg: Hash | undefined;
      let receiptHash: Hash | undefined;

      const resolver: TxHashResolver = (hash) => {
        resolverCallCount += 1;
        resolverArg = hash;
        return Promise.resolve(resolvedTxHash);
      };

      const expectedReceipt = {
        transactionHash: resolvedTxHash,
        status: "success",
      } as WaitForReceiptData;
      const client = StoryClient.newClient({
        transport: http(rpc),
        account: privateKeyToAccount(generatePrivateKey()),
      });
      const internalClient = client as unknown as StoryClientPrivate;

      internalClient.rpcClient.waitForTransactionReceipt = (
        args: WaitForReceiptArgs,
      ): WaitForReceiptResult => {
        receiptHash = args.hash;
        return Promise.resolve(expectedReceipt);
      };

      internalClient.applyTxHashResolver(resolver);
      const result = await internalClient.rpcClient.waitForTransactionReceipt({
        hash: userOpHash,
      });

      expect(resolverCallCount).to.equal(1);
      expect(resolverArg).to.equal(userOpHash);
      expect(receiptHash).to.equal(resolvedTxHash);
      expect(result.transactionHash).to.equal(resolvedTxHash);
    });

    it("should apply resolver during construction when txHashResolver is provided", async () => {
      const resolverError = new Error("resolver-called");
      const resolver: TxHashResolver = () => Promise.reject(resolverError);
      const client = StoryClient.newClient({
        transport: http(rpc),
        account: privateKeyToAccount(generatePrivateKey()),
        txHashResolver: resolver,
      });
      const internalClient = client as unknown as StoryClientPrivate;

      let thrown: unknown;
      try {
        await internalClient.rpcClient.waitForTransactionReceipt({ hash: userOpHash });
      } catch (error) {
        thrown = error;
      }
      expect(thrown).to.equal(resolverError);
    });

    it("should keep waitForTransactionReceipt callable when resolver is omitted", () => {
      const client = StoryClient.newClient({
        transport: http(rpc),
        account: privateKeyToAccount(generatePrivateKey()),
      });
      const internalClient = client as unknown as StoryClientPrivate;
      expect(internalClient.rpcClient.waitForTransactionReceipt).to.be.a("function");
    });
  });

  describe("Test getters", () => {
    const account = privateKeyToAccount(generatePrivateKey());
    const transport = http(rpc);
    const config: StoryConfig = {
      chainId: "aeneid",
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
