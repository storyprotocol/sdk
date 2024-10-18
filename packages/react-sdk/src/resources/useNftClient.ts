import {
  CreateNFTCollectionRequest,
  CreateNFTCollectionResponse,
} from "@story-protocol/core-sdk";
import { useState } from "react";

import { useStoryContext } from "../StoryProtocolContext";
import { withLoadingErrorHandling } from "../withLoadingErrorHandling";

type UseNftClientReturn = {
  loadings: Record<string, boolean> | undefined;
  errors: Record<string, string | null> | undefined;
  createNFTCollection:
    | ((
        request: CreateNFTCollectionRequest,
      ) => Promise<CreateNFTCollectionResponse>)
    | undefined;
};

const useNftClient = (): UseNftClientReturn => {
  const client = useStoryContext();

  if (!client) {
    return {
      loadings: undefined,
      errors: undefined,
      createNFTCollection: undefined,
    };
  }

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
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns A Promise that resolves to a CreateNFTCollectionResponse containing the transaction hash and collection address.
   * @emits CollectionCreated (nftContract);
   */
  const createNFTCollection = withLoadingErrorHandling<
    CreateNFTCollectionRequest,
    CreateNFTCollectionResponse
  >(
    "createNFTCollection",
    client.nftClient.createNFTCollection.bind(client.nftClient),
    setLoadings,
    setErrors,
  );

  return {
    loadings,
    errors,
    createNFTCollection,
  };
};
export default useNftClient;
