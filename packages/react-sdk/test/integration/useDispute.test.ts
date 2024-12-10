import { renderHook, act, waitFor } from "@testing-library/react";
import { Address } from "viem";

import { RaiseDisputeResponse, useDispute } from "../../src";
import { useIpAsset } from "../../src";
import Wrapper from "./utils/Wrapper";
import { mockERC721Address, getTokenId } from "./utils/util";

const arbitrationPolicyAddress = "0xcaEC2bD1B1fD57bC47357F688f97d57387E68E25";
describe("useDispute Functions", () => {
  const {
    result: { current: disputeHook },
  } = renderHook(() => useDispute(), { wrapper: Wrapper });
  const {
    result: { current: ipAssetHook },
  } = renderHook(() => useIpAsset(), { wrapper: Wrapper });
  let ipId: Address;
  let disputedId: number;

  beforeAll(async () => {
    const tokenId = await getTokenId();
    await act(async () => {
      ipId = (
        await ipAssetHook.register({
          nftContract: mockERC721Address,
          tokenId: tokenId!,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).ipId!;
    });
  });

  it("should success when call raise dispute", async () => {
    let result: RaiseDisputeResponse;
    await act(async () => {
      result = await disputeHook.raiseDispute({
        targetIpId: ipId,
        arbitrationPolicy: arbitrationPolicyAddress,
        linkToDisputeEvidence: "foo",
        targetTag: "PLAGIARISM",
        txOptions: {
          waitForTransaction: true,
        },
      });
      disputedId = Number(result.disputeId);
    });
    await waitFor(() => {
      expect(result).toEqual(
        expect.objectContaining({
          txHash: expect.any(String),
          disputeId: expect.any(BigInt),
        })
      );
    });
  });

  it("should success when cancel dispute", async () => {
    await act(async () => {
      await expect(
        disputeHook.cancelDispute({ disputeId: disputedId })
      ).resolves.toEqual(
        expect.objectContaining({
          txHash: expect.any(String),
        })
      );
    });
  });
});
