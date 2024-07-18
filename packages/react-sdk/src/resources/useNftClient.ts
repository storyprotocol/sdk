import {
  CreateNFTCollectionRequest,
  CreateNFTCollectionResponse,
} from "@story-protocol/core-sdk";

import { useStoryContext } from "../StoryProtocolContext";
import { handleError } from "../util";
import { useLoading } from "../hooks/useLoading";
import { useErrors } from "../hooks/useError";

const useNftClient = () => {
  const client = useStoryContext();
  const [loadings, setLoadings] = useLoading({
    createNFTCollection: false,
  });
  const [errors, setErrors] = useErrors({
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
      setLoadings("createNFTCollection", true);
      setErrors("createNFTCollection", null);
      const response = await client.nftClient.createNFTCollection(request);
      setLoadings("createNFTCollection", false);
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors("createNFTCollection", errorMessage);
      setLoadings("createNFTCollection", false);
      throw new Error(errorMessage);
    }
  };

  return {
    loadings,
    errors,
    createNFTCollection,
  };
};
export default useNftClient;
