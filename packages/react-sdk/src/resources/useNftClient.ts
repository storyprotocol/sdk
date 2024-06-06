import {
  CreateNFTCollectionRequest,
  CreateNFTCollectionResponse,
} from "@story-protocol/core-sdk";
import { useState } from "react";

import { useStoryContext } from "../storyProtocolContext";

const useNftClient = () => {
  const client = useStoryContext();
  const [loadings, setLoadings] = useState<Record<string, boolean>>({
    createNFTCollection: false,
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({
    createNFTCollection: null,
  });

  /**
   * Creates a new SPG NFT Collection.
   * @param request - The request object containing necessary data to create a SPG NFT Collection.
   *   @param request.name - The name of the collection.
   * 	 @param request.symbol - The symbol of the collection.
   * 	 @param request.maxSupply - The maximum supply of the collection.
   * 	 @param request.mintFee - The cost to mint a token.
   * 	 @param request.mintFeeToken - The token to mint.
   * 	 @param request.owner - The owner of the collection.
   *   @param request.txOptions - Optional transaction options.
   * @returns A Promise that resolves to a CreateNFTCollectionResponse containing the transaction hash and collection address.
   * @emits CollectionCreated (nftContract);
   */
  const createNFTCollection = async (
    request: CreateNFTCollectionRequest
  ): Promise<CreateNFTCollectionResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, createNFTCollection: true }));
      setErrors((prev) => ({ ...prev, createNFTCollection: null }));
      const response = await client.nftClient.createNFTCollection(request);
      setLoadings((prev) => ({ ...prev, createNFTCollection: false }));
      return response;
    } catch (e) {
      if (e instanceof Error) {
        setErrors((prev) => ({ ...prev, createNFTCollection: e.message }));
        setLoadings((prev) => ({ ...prev, createNFTCollection: false }));
      }
      throw new Error(`unhandled error type`);
    }
  };

  return {
    loadings,
    errors,
    createNFTCollection,
  };
};
export default useNftClient;
