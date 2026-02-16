import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import {
  createKernelAccount,
  createKernelAccountClient,
} from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import {
  Address,
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  Hash,
  Hex,
  http,
  parseEther,
  PublicClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import {
  aeneid,
  StoryClient,
  StoryConfig,
  TxHashResolver,
  UseWalletStoryConfig,
} from "../../src";
import { RPC, TEST_PRIVATE_KEY, TEST_WALLET_ADDRESS } from "./utils/util";

use(chaiAsPromised);

type StoryClientPrivate = { rpcClient: PublicClient };

type ZeroDevWallet = UseWalletStoryConfig["wallet"];

type UserOperationReceipt = { receipt: { transactionHash: Hash } };

type CapturedUserOpRequest = {
  callData: Hex;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
};

type ZeroDevBundlerClient = {
  waitForUserOperationReceipt: (args: {
    hash: Hash;
    timeout?: number;
  }) => Promise<UserOperationReceipt>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KernelClient = ReturnType<typeof createKernelAccountClient> & { [k: string]: any };

type KernelAccount = Awaited<ReturnType<typeof createKernelAccount>>;

type ZeroDevHelper = {
  /** Kernel client used directly as wallet (writeContract returns real txHash). */
  wallet: ZeroDevWallet;
  /**
   * A thin wrapper whose `writeContract` sends the UserOperation but returns
   * the **userOpHash** immediately (without waiting for the receipt).
   * This simulates AA wallets that do NOT internally resolve the hash,
   * allowing `txHashResolver` to be exercised end-to-end.
   */
  rawUserOpWallet: ZeroDevWallet;
  /** Bundler client for resolving userOpHash → txHash via receipt. */
  bundlerClient: ZeroDevBundlerClient;
};

/** Minimum balance the smart account needs to pay for gas (in IP). */
const MIN_SA_BALANCE = parseEther("0.5");
/** Amount to top-up when balance is insufficient (in IP). */
const SA_FUND_AMOUNT = parseEther("1");
/** Timeout for waitForUserOperationReceipt (ms). */
const USER_OP_RECEIPT_TIMEOUT = 180_000;

/**
 * Ensures the smart account has enough native balance to pay for gas.
 * If the balance is below MIN_SA_BALANCE, transfers SA_FUND_AMOUNT from
 * the EOA signer.
 */
const ensureSmartAccountFunded = async (
  smartAccountAddress: `0x${string}`,
): Promise<void> => {
  const storyPublicClient = createPublicClient({
    transport: http(RPC),
    chain: aeneid,
  });

  const balance = await storyPublicClient.getBalance({
    address: smartAccountAddress,
  });

  if (balance >= MIN_SA_BALANCE) {
    return;
  }

  const eoaWallet = createWalletClient({
    account: privateKeyToAccount(TEST_PRIVATE_KEY),
    chain: aeneid,
    transport: http(RPC),
  });

  const fundHash = await eoaWallet.sendTransaction({
    to: smartAccountAddress,
    value: SA_FUND_AMOUNT,
  });

  await storyPublicClient.waitForTransactionReceipt({ hash: fundHash });
};

/**
 * Creates a wallet adapter that wraps the kernel client but returns the
 * **UserOperation hash** from `writeContract` instead of the real tx hash.
 *
 * This mimics the behaviour of AA wallet integrations (e.g. Dynamic, custom
 * bundler setups) where `writeContract` returns the userOpHash and the
 * caller is responsible for resolving it to a real tx hash.
 */
const createRawUserOpWallet = (
  kernelClient: KernelClient,
  account: KernelAccount,
): ZeroDevWallet => {
  const wallet: Pick<ZeroDevWallet, "account" | "writeContract"> = {
    account: kernelClient.account,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    writeContract: async (params: any): Promise<Hash> => {
      const callData = encodeFunctionData({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        abi: params.abi,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        functionName: params.functionName,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        args: params.args,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const callValue = params.value !== undefined ? BigInt(params.value) : 0n;

      const userOpRequest: {
        callData: Awaited<ReturnType<KernelAccount["encodeCalls"]>>;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
      } = {
        callData: await account.encodeCalls([
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            to: params.address,
            value: callValue,
            data: callData,
          },
        ]),
      };

      // Forward fee overrides when available to better match real wallet semantics.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (params.maxFeePerGas !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        userOpRequest.maxFeePerGas = BigInt(params.maxFeePerGas);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (params.maxPriorityFeePerGas !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        userOpRequest.maxPriorityFeePerGas = BigInt(params.maxPriorityFeePerGas);
      }

      // Send UserOperation and return userOpHash immediately (no waiting).
      const userOpHash: Hash = await kernelClient.sendUserOperation(userOpRequest);

      return userOpHash;
    },
  };

  return wallet as unknown as ZeroDevWallet;
};

/**
 * Creates a ZeroDev smart account setup directly from environment variables.
 *
 * Requires:
 *   - BUNDLER_RPC_URL  – ZeroDev bundler RPC endpoint
 *   - WALLET_PRIVATE_KEY – EOA private key used as the ECDSA signer
 *
 * The smart account is self-funded (no paymaster dependency).
 * If its balance is insufficient, the EOA will top it up automatically.
 *
 * Returns `undefined` when BUNDLER_RPC_URL is not set (test will be skipped).
 */
const getZeroDevHelper = async (): Promise<ZeroDevHelper | undefined> => {
  const bundlerRpcUrl = process.env.BUNDLER_RPC_URL;
  if (!bundlerRpcUrl) {
    return undefined;
  }

  const signer = privateKeyToAccount(TEST_PRIVATE_KEY);
  const entryPoint = getEntryPoint("0.7");

  const zeroDevPublicClient = createPublicClient({
    transport: http(bundlerRpcUrl),
    chain: aeneid,
  });

  const ecdsaValidator = await signerToEcdsaValidator(zeroDevPublicClient, {
    signer,
    entryPoint,
    kernelVersion: KERNEL_V3_1,
  });

  const account = await createKernelAccount(zeroDevPublicClient, {
    plugins: { sudo: ecdsaValidator },
    entryPoint,
    kernelVersion: KERNEL_V3_1,
  });

  // Ensure the smart account has enough native balance for gas.
  await ensureSmartAccountFunded(account.address);

  // Self-funded kernel client (no paymaster).
  const kernelClient = createKernelAccountClient({
    account,
    chain: aeneid,
    bundlerTransport: http(bundlerRpcUrl),
    client: zeroDevPublicClient,
  });

  return {
    wallet: kernelClient as unknown as ZeroDevWallet,
    rawUserOpWallet: createRawUserOpWallet(kernelClient as KernelClient, account),
    bundlerClient: kernelClient as unknown as ZeroDevBundlerClient,
  };
};

/**
 * Integration tests for txHashResolver (Account Abstraction support).
 *
 * These tests verify that the SDK correctly supports AA wallets like ZeroDev/Dynamic
 * by allowing a custom txHashResolver that maps UserOperation hashes to real tx hashes.
 *
 * ===========================================================================================
 * NOTE: Tests marked with [REQUIRES_ZERODEV] need BUNDLER_RPC_URL set in .env.
 * Without it, those tests will be automatically skipped.
 * ===========================================================================================
 */
describe("TxHashResolver Integration Tests", () => {
  describe("Pass-through resolver (normal wallet with resolver)", () => {
    it("should create client with a pass-through resolver", () => {
      const resolverCalls: Hash[] = [];
      const passThroughResolver: TxHashResolver = (hash) => {
        resolverCalls.push(hash);
        return Promise.resolve(hash);
      };

      const config: StoryConfig = {
        chainId: "aeneid",
        transport: http(RPC),
        account: privateKeyToAccount(TEST_PRIVATE_KEY),
        txHashResolver: passThroughResolver,
      };

      const client = StoryClient.newClient(config);
      expect(client).to.be.instanceOf(StoryClient);
      expect(resolverCalls).to.have.lengthOf(0);
    });

    it("should create client with resolver via newClientUseWallet", () => {
      const resolver: TxHashResolver = (hash) => Promise.resolve(hash);
      const config = {
        chainId: "aeneid" as const,
        transport: http(RPC),
        wallet: createWalletClient({
          account: privateKeyToAccount(TEST_PRIVATE_KEY),
          chain: aeneid,
          transport: http(RPC),
        }),
        txHashResolver: resolver,
      };

      const client = StoryClient.newClientUseWallet(config);
      expect(client).to.be.instanceOf(StoryClient);
    });

    it("should create client with resolver via newClientUseAccount", () => {
      const resolver: TxHashResolver = (hash) => Promise.resolve(hash);
      const client = StoryClient.newClientUseAccount({
        transport: http(RPC),
        account: privateKeyToAccount(TEST_PRIVATE_KEY),
        txHashResolver: resolver,
      });
      expect(client).to.be.instanceOf(StoryClient);
    });
  });

  describe("Simulated AA resolver", () => {
    it("should forward value and fee fields when rawUserOpWallet sends user operation", async () => {
      const capturedCalls: {
        to: Address;
        value: bigint;
        data: Hex;
      }[] = [];
      const captured = {
        userOpRequest: undefined as CapturedUserOpRequest | undefined,
      };

      const fakeKernelClient = {
        account: { address: TEST_WALLET_ADDRESS },
        sendUserOperation: (request: CapturedUserOpRequest): Promise<Hash> => {
          captured.userOpRequest = request;
          return Promise.resolve(
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          );
        },
      } as unknown as KernelClient;

      const fakeAccount = {
        encodeCalls: (
          calls: {
            to: Address;
            value: bigint;
            data: Hex;
          }[],
        ): Promise<Hex> => {
          capturedCalls.push(...calls);
          return Promise.resolve(
            "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          );
        },
      } as unknown as KernelAccount;

      const wallet = createRawUserOpWallet(fakeKernelClient, fakeAccount);
      const mockWriteContractParams = {
        address: "0x1111111111111111111111111111111111111111",
        abi: [
          {
            type: "function",
            name: "transfer",
            stateMutability: "payable",
            inputs: [{ name: "to", type: "address" }],
            outputs: [],
          },
        ],
        functionName: "transfer",
        args: ["0x2222222222222222222222222222222222222222"],
        value: 123n,
        maxFeePerGas: 456n,
        maxPriorityFeePerGas: 789n,
      };
      await wallet.writeContract(mockWriteContractParams as never);

      expect(capturedCalls).to.have.lengthOf(1);
      expect(capturedCalls[0].value).to.equal(123n);

      if (!captured.userOpRequest) {
        throw new Error("Expected sendUserOperation to capture a request");
      }

      const userOpRequest = captured.userOpRequest;
      expect(userOpRequest.maxFeePerGas).to.equal(456n);
      expect(userOpRequest.maxPriorityFeePerGas).to.equal(789n);
    });

    it("should invoke resolver before querying transaction receipt", async () => {
      const fakeTxHash: Hash =
        "0x1111111111111111111111111111111111111111111111111111111111111111";
      const realTxHash: Hash =
        "0x2222222222222222222222222222222222222222222222222222222222222222";

      const resolverCalls: Hash[] = [];
      const resolver: TxHashResolver = (hash) => {
        resolverCalls.push(hash);
        return Promise.resolve(hash === fakeTxHash ? realTxHash : hash);
      };

      const config: StoryConfig = {
        chainId: "aeneid",
        transport: http(RPC),
        account: privateKeyToAccount(TEST_PRIVATE_KEY),
        txHashResolver: resolver,
      };

      const client = StoryClient.newClient(config);
      const rpcClient = (client as unknown as StoryClientPrivate).rpcClient;

      try {
        await rpcClient.waitForTransactionReceipt({
          hash: fakeTxHash,
          timeout: 1000,
        });
      } catch {
        // The transaction hash does not exist on-chain in this simulation.
      }

      expect(resolverCalls).to.deep.equal([fakeTxHash]);
      expect(realTxHash).to.be.a("string");
    });
  });

  describe("[REQUIRES_ZERODEV] End-to-end AA wallet test", () => {
    /**
     * ZeroDev's `createKernelAccountClient` returns a viem smart account
     * client whose `writeContract` internally sends a UserOperation, waits
     * for the bundler receipt, and returns the **real tx hash**.
     *
     * Because of this, `txHashResolver` is NOT needed — the kernel client
     * already resolves the UserOp hash to a real tx hash before returning.
     */
    it("should create NFT collection using ZeroDev kernel client as wallet", async function () {
      this.timeout(300000);

      const helper = await getZeroDevHelper();
      if (!helper) {
        this.skip();
        return;
      }

      const client = StoryClient.newClientUseWallet({
        chainId: "aeneid",
        transport: http(RPC),
        wallet: helper.wallet,
      });

      const unique = Date.now().toString().slice(-6);
      const txData = await client.nftClient.createNFTCollection({
        name: `zerodev-e2e-${unique}`,
        symbol: `ZD${unique.slice(-4)}`,
        maxSupply: 100,
        isPublicMinting: true,
        mintOpen: true,
        contractURI: "ipfs://zerodev-e2e",
        mintFeeRecipient: TEST_WALLET_ADDRESS,
      });

      expect(txData.txHash).to.match(/^0x[a-fA-F0-9]{64}$/);
      expect(txData.spgNftContract).to.match(/^0x[a-fA-F0-9]{40}$/);
    });

    /**
     * Tests `txHashResolver` end-to-end with a wallet that returns the raw
     * **UserOperation hash** from `writeContract` (simulating AA wallets that
     * do NOT internally wait for the bundler receipt).
     *
     * The resolver receives the userOpHash, waits for the bundler to bundle
     * it, and returns the real on-chain tx hash — which the SDK then uses
     * for `waitForTransactionReceipt`.
     */
    it("should create NFT collection with txHashResolver resolving userOpHash", async function () {
      this.timeout(300000);

      const helper = await getZeroDevHelper();
      if (!helper) {
        this.skip();
        return;
      }

      const resolverCalls: Hash[] = [];

      const client = StoryClient.newClientUseWallet({
        chainId: "aeneid",
        transport: http(RPC),
        wallet: helper.rawUserOpWallet,
        txHashResolver: async (userOpHash) => {
          resolverCalls.push(userOpHash);
          const receipt = await helper.bundlerClient.waitForUserOperationReceipt({
            hash: userOpHash,
            timeout: USER_OP_RECEIPT_TIMEOUT,
          });
          return receipt.receipt.transactionHash;
        },
      });

      const unique = Date.now().toString().slice(-6);
      const txData = await client.nftClient.createNFTCollection({
        name: `zerodev-resolver-${unique}`,
        symbol: `ZR${unique.slice(-4)}`,
        maxSupply: 100,
        isPublicMinting: true,
        mintOpen: true,
        contractURI: "ipfs://zerodev-resolver-e2e",
        mintFeeRecipient: TEST_WALLET_ADDRESS,
      });

      // Verify the resolver was invoked and returned a valid hash.
      expect(resolverCalls.length).to.be.greaterThan(0);
      expect(txData.txHash).to.match(/^0x[a-fA-F0-9]{64}$/);
      expect(txData.spgNftContract).to.match(/^0x[a-fA-F0-9]{40}$/);
    });
  });
});
