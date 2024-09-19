import { renderHook } from "@testing-library/react";
import { act } from "react";

import { useNftClient } from "../../src";
import Wrapper from "./utils/Wrapper";

describe("useNftClient Functions", () => {
  const {
    result: { current: nftClientHook },
  } = renderHook(() => useNftClient(), { wrapper: Wrapper });

  it("should success when create nft collection", async () => {
    await act(async () => {
      await expect(
        nftClientHook.createNFTCollection({
          name: "test-collection",
          symbol: "TEST",
          maxSupply: 100,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).resolves.toEqual(
        expect.objectContaining({
          nftContract: expect.any(String),
        })
      );
    });
  });
});
