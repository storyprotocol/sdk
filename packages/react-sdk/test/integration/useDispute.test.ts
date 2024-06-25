import { renderHook, act, waitFor } from "@testing-library/react";
import { Address } from "viem";
import { RaiseDisputeResponse, useDispute } from "../../src";
import { useIpAsset } from "../../src";
import Wrapper from "./utils/Wrapper";
import { MockERC721, getTokenId } from "./utils/util";

const arbitrationPolicyAddress = "0xc07Bc791CF55E718BA7D70cE650B3152BbE3325e";
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
          nftContract: MockERC721,
          tokenId: tokenId!,
          txOptions: {
            waitForTransaction: true,
          },
        })
      ).ipId!;
    });
  });

  it("raise a dispute", async () => {
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

  it("cancel a dispute", async () => {
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
