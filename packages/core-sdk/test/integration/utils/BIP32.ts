import * as crypto from "crypto";

import { HDKey } from "@scure/bip32";
import { createWalletClient, Hex, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { getStoryClient, publicClient, RPC } from "./util";
import { StoryClient } from "../../../src";
import { chainStringToViemChain } from "../../../src/utils/utils";

/**
 * Extract a standard private key directly from an extended private key without derivation.
 *
 * @param xprv Extended private key
 * @returns Extracted standard private key as a hex string
 */
export const getPrivateKeyFromXprv = (xprv: string): Hex => {
  // Create HDKey instance from xprv
  const hdKey = HDKey.fromExtendedKey(xprv);
  // Extract the private key buffer
  const privateKeyBuffer = hdKey.privateKey;

  if (!privateKeyBuffer) {
    throw new Error("Failed to extract private key");
  }

  // Convert private key buffer to hex string (prefixed with 0x for compatibility with viem)
  return `0x${Buffer.from(privateKeyBuffer).toString("hex")}`;
};

/**
 * Create an extended private key (xprv) deterministically from a standard private key.
 *
 * @param privateKey Ethereum private key (with or without 0x prefix)
 * @returns Deterministically derived extended private key (xprv)
 */
export const getXprvFromPrivateKey = (privateKey: string): string => {
  // Remove 0x prefix if present
  const pkHex = privateKey.toString().replace(/^0x/, "");

  // Validate private key length (must be exactly 32 bytes / 64 hex characters)
  if (pkHex.length !== 64) {
    throw new Error("Private key must be 32 bytes (64 hex characters)");
  }

  // Create a salt by hashing the private key with SHA256
  const salt = crypto.createHash("sha256").update(Buffer.from(pkHex, "hex")).digest();

  // Derive additional entropy using HMAC-SHA512
  const hmac = crypto.createHmac("sha512", salt);
  hmac.update(Buffer.from(pkHex, "hex"));
  const seedBuffer = hmac.digest();

  // Generate HDKey instance from seed
  const hdKey = HDKey.fromMasterSeed(seedBuffer);

  // Return the extended private key (xprv)
  return hdKey.privateExtendedKey;
};

/**
 * Get a StoryClient instance for a new wallet that is deterministically derived from an extended private key (xprv).
 * The wallet is ensured to have a minimum balance of 5 tokens before being returned.
 * @returns StoryClient instance for the new wallet
 */
export const getDerivedStoryClient = async (): Promise<{
  clientB: StoryClient;
  address: string;
}> => {
  const xprv = getXprvFromPrivateKey(process.env.WALLET_PRIVATE_KEY as string);
  const privateKey = getPrivateKeyFromXprv(xprv);
  const clientB = getStoryClient(privateKey);
  const walletB = privateKeyToAccount(privateKey);

  // ClientA transfer some funds to walletB
  const clientAWalletClient = createWalletClient({
    chain: chainStringToViemChain("aeneid"),
    transport: http(RPC),
    account: privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as Hex),
  });
  const clientBBalance = await publicClient.getBalance({
    address: walletB.address,
  });

  if (clientBBalance < parseEther("5")) {
    // Less than 5 tokens (assuming 1 token = 0.01 ETH)
    const txHash = await clientAWalletClient.sendTransaction({
      to: walletB.address,
      value: parseEther("5"),
    });
    await publicClient.waitForTransactionReceipt({ hash: txHash });
  }

  return { clientB, address: walletB.address };
};
