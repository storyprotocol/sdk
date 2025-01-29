import { Hex, zeroHash } from "viem";

export type IpMetadataForWorkflow = {
  ipMetadataURI: string;
  ipMetadataHash: Hex;
  nftMetadataURI: string;
  nftMetadataHash: Hex;
};

export const getIpMetadataForWorkflow = (
  metadata?: Partial<IpMetadataForWorkflow>,
): IpMetadataForWorkflow => {
  return {
    ipMetadataURI: metadata?.ipMetadataURI || "",
    ipMetadataHash: metadata?.ipMetadataHash || zeroHash,
    nftMetadataURI: metadata?.nftMetadataURI || "",
    nftMetadataHash: metadata?.nftMetadataHash || zeroHash,
  };
};
