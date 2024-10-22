import { CID } from "multiformats/cid";
import bs58 from "bs58";

const v0Prefix = "1220";
export const convertCIDtoHashIPFS = (cid: string): string => {
  const isV0 = cid.startsWith("Qm");
  const parsedCID = CID.parse(cid);
  const base58CID = isV0 ? parsedCID.toString() : parsedCID.toV0().toString();
  const bytes = bs58.decode(base58CID);
  const base16CID = Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return "0x" + base16CID.slice(v0Prefix.length);
};
