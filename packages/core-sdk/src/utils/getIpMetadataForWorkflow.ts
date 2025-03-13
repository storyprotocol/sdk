import { Hex, zeroHash } from "viem";

export type IpMetadataForWorkflow = {
  /** The URI of the metadata for the IP. */
  ipMetadataURI: string;
  /** The hash of the metadata for the IP. */
  ipMetadataHash: Hex;
  /** The URI of the metadata for the NFT. */
  nftMetadataURI: string;
  /** The hash of the metadata for the IP NFT. */
  nftMetadataHash: Hex;
};

export const getIpMetadataForWorkflow = (
  ipMetadata?: Partial<IpMetadataForWorkflow>,
): IpMetadataForWorkflow => {
  return {
    ipMetadataURI: ipMetadata?.ipMetadataURI || "",
    ipMetadataHash: ipMetadata?.ipMetadataHash || zeroHash,
    nftMetadataURI: ipMetadata?.nftMetadataURI || "",
    nftMetadataHash: ipMetadata?.nftMetadataHash || zeroHash,
  };
};
