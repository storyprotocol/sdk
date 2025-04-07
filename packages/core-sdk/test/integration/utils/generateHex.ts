import * as crypto from "crypto";
import { Hex } from "viem";

export const generateHex = (length: number = 32): Hex => {
  const randomBytes = crypto.randomBytes(length);
  return `0x${randomBytes.toString("hex")}`;
};
