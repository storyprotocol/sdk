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
