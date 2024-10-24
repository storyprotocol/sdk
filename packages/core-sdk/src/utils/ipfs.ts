import { CID } from "multiformats/cid";
import bs58 from "bs58";
import { base58btc } from "multiformats/bases/base58";
import { Hex } from "viem";

const v0Prefix = "1220";
export const convertCIDtoHashIPFS = (cid: string): Hex => {
  const isV0 = cid.startsWith("Qm");
  const parsedCID = CID.parse(cid);
  const base58CID = isV0 ? parsedCID.toString() : parsedCID.toV0().toString();
  const bytes = bs58.decode(base58CID);
  const base16CID = Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return ("0x" + base16CID.slice(v0Prefix.length)) as Hex;
};

export const convertHashIPFStoCID = (hash: Hex, version: "v0" | "v1" = "v0"): string => {
  const base16CID = v0Prefix + hash.slice(2);
  const bytes = new Uint8Array(base16CID.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
  const base58CID = bs58.encode(Buffer.from(bytes));
  if (version === "v0") {
    return base58CID;
  } else {
    return CID.parse(base58CID, base58btc).toV1().toString();
  }
};
