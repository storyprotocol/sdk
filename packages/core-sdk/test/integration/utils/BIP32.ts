import { HDKey } from "@scure/bip32";
import { Hex } from "viem";
import * as crypto from "crypto";

/**
 * Extract a standard private key directly from an extended private key without derivation.
 *
 * @param xprv Extended private key
 * @returns Extracted standard private key as a hex string
 */
export function getPrivateKeyFromXprv(xprv: string): Hex {
  // Create HDKey instance from xprv
  const hdKey = HDKey.fromExtendedKey(xprv);
  // Extract the private key buffer
  const privateKeyBuffer = hdKey.privateKey;

  if (!privateKeyBuffer) {
    throw new Error("Failed to extract private key");
  }

  // Convert private key buffer to hex string (prefixed with 0x for compatibility with viem)
  return `0x${Buffer.from(privateKeyBuffer).toString("hex")}` as Hex;
}

/**
 * Create an extended private key (xprv) deterministically from a standard private key.
 *
 * @param privateKey Ethereum private key (with or without 0x prefix)
 * @returns Deterministically derived extended private key (xprv)
 */
export function getXprvFromPrivateKey(privateKey: string | Hex): string {
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
}
